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
  const markersRef = useRef<{ [key: string]: any }>({});
  const userCircleRef = useRef<any>(null);
  const [activeLayer, setActiveLayer] = useState<'users' | 'spots'>('users');
  const [isLocating, setIsLocating] = useState(false);

  const displayUsers = filteredUsers || allUsers;

  // Initialisation de la carte
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false,
        maxZoom: 18,
        minZoom: 3,
        tap: true
    }).setView([currentUser.location.lat, currentUser.location.lng], 13);
    
    mapInstanceRef.current = map;

    // Style de tuiles "Voyager" - Proche de Google Maps mais plus élégant
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        subdomains: 'abcd',
        maxZoom: 20
    }).addTo(map);

    // Tentative de localisation automatique au démarrage
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

  // Mise à jour des marqueurs quand la liste des utilisateurs change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Nettoyage propre
    Object.values(markersRef.current).forEach((m: any) => m.remove());
    markersRef.current = {};

    // Marqueur Utilisateur Actuel (Point bleu style iOS/Google)
    const meIcon = L.divIcon({
        html: `<div class="relative flex items-center justify-center">
                 <div class="absolute w-10 h-10 bg-blue-500/20 rounded-full animate-ping"></div>
                 <div class="w-5 h-5 bg-blue-500 rounded-full border-2 border-white shadow-lg"></div>
               </div>`,
        className: '', iconSize: [40, 40], iconAnchor: [20, 20]
    });
    markersRef.current['me'] = L.marker([currentUser.location.lat, currentUser.location.lng], { 
        icon: meIcon, 
        zIndexOffset: 1000 
    }).addTo(map);

    // Ajout des talents
    if (activeLayer === 'users') {
      displayUsers.forEach(user => {
        if (user.id === currentUser.id) return;
        
        const isPhotog = user.type === 'Photographe' || user.type === 'Vidéaste';
        const colorClass = isPhotog ? 'border-[#D2B48C]' : 'border-white';
        const bgClass = isPhotog ? 'bg-[#D2B48C]' : 'bg-white';

        const icon = L.divIcon({
          html: `<div class="relative group cursor-pointer">
                   ${user.isAvailableNow ? '<div class="absolute -inset-2 bg-red-500/30 rounded-full animate-pulse"></div>' : ''}
                   <div class="w-11 h-11 rounded-2xl border-2 ${colorClass} bg-[#0D1625] overflow-hidden shadow-2xl transition-transform active:scale-90 overflow-hidden">
                     <img src="${user.avatarUrl}" class="w-full h-full object-cover" />
                   </div>
                   <div class="absolute -bottom-1 -right-1 w-5 h-5 ${bgClass} rounded-lg flex items-center justify-center border-2 border-[#0D1625] shadow-md">
                      <div class="text-[8px] font-black text-[#0D1625] uppercase">${user.type === 'Photographe' ? 'PH' : 'MD'}</div>
                   </div>
                 </div>`,
          className: '', iconSize: [44, 44], iconAnchor: [22, 22]
        });

        const m = L.marker([user.location.lat, user.location.lng], { icon })
          .on('click', () => {
            trackAction('MAP_MARKER_CLICK', { userId: user.id });
            viewProfile(user);
          });
        
        m.addTo(map);
        markersRef.current[`u_${user.id}`] = m;
      });
    }
  }, [activeLayer, displayUsers, currentUser]);

  const handleLocateMe = (isInitial = false) => {
    if (!mapInstanceRef.current) return;
    
    if (!isInitial) setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        const map = mapInstanceRef.current;

        // Mise à jour cercle précision
        if (userCircleRef.current) userCircleRef.current.remove();
        userCircleRef.current = L.circle([latitude, longitude], {
            radius: accuracy,
            color: '#3b82f6',
            fillColor: '#3b82f6',
            fillOpacity: 0.1,
            weight: 1
        }).addTo(map);

        map.flyTo([latitude, longitude], isInitial ? 13 : 15, {
            animate: true,
            duration: 1.5
        });

        if (!isInitial) setIsLocating(false);
      },
      (err) => {
        console.error("Geolocation Error:", err);
        if (!isInitial) setIsLocating(false);
      },
      { enableHighAccuracy: true }
    );
  };

  return (
    <div className="relative w-full h-full bg-[#f8f9fa] overflow-hidden">
      <div ref={mapContainerRef} className="w-full h-full" />
      
      {/* Contrôles de couche style Google Maps */}
      <div className="absolute top-4 left-4 z-[400] flex flex-col gap-2">
        <div className="bg-white/90 backdrop-blur-md p-1 rounded-2xl border border-black/5 shadow-xl flex gap-1">
            <button 
                onClick={() => setActiveLayer('users')} 
                className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all uppercase ${activeLayer === 'users' ? 'bg-[#050B14] text-white' : 'text-slate-500 hover:bg-slate-100'}`}
            >
                Talents
            </button>
            <button 
                onClick={() => setActiveLayer('spots')} 
                className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all uppercase ${activeLayer === 'spots' ? 'bg-[#050B14] text-white' : 'text-slate-500 hover:bg-slate-100'}`}
            >
                Spots
            </button>
        </div>
      </div>

      {/* Bouton de localisation flottant */}
      <button 
        onClick={() => handleLocateMe(false)} 
        disabled={isLocating} 
        className="absolute bottom-6 right-6 z-[400] w-14 h-14 bg-white border border-black/5 rounded-2xl flex items-center justify-center text-[#050B14] shadow-2xl hover:bg-slate-50 transition-all active:scale-90 group"
      >
        {isLocating ? (
            <div className="w-6 h-6 border-2 border-[#D2B48C] border-t-transparent rounded-full animate-spin" />
        ) : (
            <Icon name="locationMarker" className="w-7 h-7 group-hover:text-[#D2B48C] transition-colors" />
        )}
      </button>

      {/* Overlay de chargement initial */}
      {!mapInstanceRef.current && (
          <div className="absolute inset-0 bg-[#050B14] flex items-center justify-center z-[500]">
              <div className="text-center">
                  <div className="w-12 h-12 border-4 border-[#D2B48C] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-[#D2B48C] font-black text-[10px] uppercase tracking-[0.3em]">Initialisation du Satellite...</p>
              </div>
          </div>
      )}
    </div>
  );
};

export default memo(MapView);