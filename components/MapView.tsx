import React, { useEffect, useRef, memo, useState } from 'react';
import type { User } from '../types';
import { useUser } from '../contexts/UserContext';
import { useAppContext } from '../contexts/AppContext';
import Icon from './Icon';

declare var L: any;

interface MapViewProps {
  filteredUsers?: User[];
}

const MapView: React.FC<MapViewProps> = ({ filteredUsers }) => {
  const { users: allUsers, currentUser, trackAction } = useUser();
  const { viewProfile } = useAppContext();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const userLayerRef = useRef<any>(null);
  const spotLayerRef = useRef<any>(null);
  const meMarkerRef = useRef<any>(null);
  const userCircleRef = useRef<any>(null);
  
  const [activeLayer, setActiveLayer] = useState<'users' | 'spots'>('users');
  const [isLocating, setIsLocating] = useState(false);

  const displayUsers = filteredUsers || allUsers;

  // 1. Initialisation de la carte (Instantanée)
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // On initialise immédiatement sur la position connue de l'utilisateur
    const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false,
        maxZoom: 18,
        minZoom: 3,
        tap: true
    }).setView([currentUser.location.lat, currentUser.location.lng], 12);
    
    mapInstanceRef.current = map;

    // Calque de base
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        subdomains: 'abcd',
        maxZoom: 20
    }).addTo(map);

    // Initialisation des groupes de calques
    userLayerRef.current = L.layerGroup().addTo(map);
    spotLayerRef.current = L.layerGroup(); // Pas ajouté par défaut

    // Marqueur "Moi" instantané
    const meIcon = L.divIcon({
        html: `<div class="relative flex items-center justify-center">
                 <div class="absolute w-8 h-8 bg-blue-500/20 rounded-full animate-ping"></div>
                 <div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg"></div>
               </div>`,
        className: '', iconSize: [32, 32], iconAnchor: [16, 16]
    });
    meMarkerRef.current = L.marker([currentUser.location.lat, currentUser.location.lng], { 
        icon: meIcon, 
        zIndexOffset: 1000 
    }).addTo(map);

    // Lancer la géolocalisation haute précision en tâche de fond
    handleLocateMe(true);

    const invalidateSize = () => map.invalidateSize();
    window.addEventListener('resize', invalidateSize);
    
    return () => {
      window.removeEventListener('resize', invalidateSize);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 2. Mise à jour des talents (Optimisé)
  useEffect(() => {
    const map = mapInstanceRef.current;
    const userLayer = userLayerRef.current;
    if (!map || !userLayer) return;

    userLayer.clearLayers();

    displayUsers.forEach(user => {
      if (user.id === currentUser.id) return;
      
      const isPhotog = user.type === 'Photographe' || user.type === 'Vidéaste';
      const colorClass = isPhotog ? 'border-[#D2B48C]' : 'border-white';
      const bgClass = isPhotog ? 'bg-[#D2B48C]' : 'bg-white';

      const icon = L.divIcon({
        html: `<div class="relative cursor-pointer">
                 ${user.isAvailableNow ? '<div class="absolute -inset-1.5 bg-red-500/20 rounded-full animate-pulse"></div>' : ''}
                 <div class="w-10 h-10 rounded-2xl border-2 ${colorClass} bg-[#0D1625] overflow-hidden shadow-xl transition-transform active:scale-90">
                   <img src="${user.avatarUrl}" class="w-full h-full object-cover" />
                 </div>
                 <div class="absolute -bottom-1 -right-1 w-4 h-4 ${bgClass} rounded-lg flex items-center justify-center border border-[#0D1625] shadow-md">
                    <div class="text-[7px] font-black text-[#0D1625] uppercase">${isPhotog ? 'PH' : 'MD'}</div>
                 </div>
               </div>`,
        className: '', iconSize: [40, 40], iconAnchor: [20, 20]
      });

      const m = L.marker([user.location.lat, user.location.lng], { icon })
        .on('click', () => {
          trackAction('MAP_MARKER_CLICK', { userId: user.id });
          viewProfile(user);
        });
      
      userLayer.addLayer(m);
    });
  }, [displayUsers, currentUser]);

  // 3. Gestion fluide du changement d'onglet (Instantané)
  const toggleLayer = (layer: 'users' | 'spots') => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (layer === 'users') {
        map.addLayer(userLayerRef.current);
        map.removeLayer(spotLayerRef.current);
    } else {
        map.addLayer(spotLayerRef.current);
        map.removeLayer(userLayerRef.current);
    }
    setActiveLayer(layer);
  };

  const handleLocateMe = (isInitial = false) => {
    if (!mapInstanceRef.current) return;
    if (!isInitial) setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        const map = mapInstanceRef.current;

        if (meMarkerRef.current) meMarkerRef.current.setLatLng([latitude, longitude]);

        if (userCircleRef.current) userCircleRef.current.remove();
        userCircleRef.current = L.circle([latitude, longitude], {
            radius: accuracy,
            color: '#3b82f6',
            fillColor: '#3b82f6',
            fillOpacity: 0.1,
            weight: 1
        }).addTo(map);

        // Zoom seulement si manuel ou si c'est le tout premier chargement
        if (!isInitial) {
            map.flyTo([latitude, longitude], 15, { duration: 1 });
            setIsLocating(false);
        } else {
            // Au démarrage, on se contente de recentrer sans forcer le zoom brutalement
            map.panTo([latitude, longitude]);
        }
      },
      (err) => {
        console.warn("Geolocation Error:", err);
        if (!isInitial) setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  return (
    <div className="relative w-full h-full bg-[#f0f1f2] overflow-hidden">
      <div ref={mapContainerRef} className="w-full h-full" />
      
      {/* Sélecteur de calque ultra-réactif */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[400] w-auto">
        <div className="bg-[#050B14]/80 backdrop-blur-xl p-1 rounded-2xl border border-white/10 shadow-2xl flex gap-1">
            <button 
                onClick={() => toggleLayer('users')} 
                className={`px-6 py-2 rounded-xl text-[10px] font-black tracking-[0.2em] transition-all uppercase whitespace-nowrap ${activeLayer === 'users' ? 'bg-[#D2B48C] text-[#050B14]' : 'text-slate-400'}`}
            >
                TALENTS
            </button>
            <button 
                onClick={() => toggleLayer('spots')} 
                className={`px-6 py-2 rounded-xl text-[10px] font-black tracking-[0.2em] transition-all uppercase whitespace-nowrap ${activeLayer === 'spots' ? 'bg-[#D2B48C] text-[#050B14]' : 'text-slate-400'}`}
            >
                SPOTS
            </button>
        </div>
      </div>

      {/* Bouton de localisation */}
      <button 
        onClick={() => handleLocateMe(false)} 
        disabled={isLocating} 
        className="absolute bottom-6 right-6 z-[400] w-14 h-14 bg-white border border-black/5 rounded-2xl flex items-center justify-center text-[#050B14] shadow-2xl active:scale-90 transition-all group"
      >
        {isLocating ? (
            <div className="w-5 h-5 border-2 border-[#D2B48C] border-t-transparent rounded-full animate-spin" />
        ) : (
            <Icon name="locationMarker" className="w-7 h-7 group-hover:text-[#D2B48C]" />
        )}
      </button>
    </div>
  );
};

export default memo(MapView);