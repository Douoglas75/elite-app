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
  const { users: allUsers, currentUser, trackAction, refreshLocation } = useUser();
  const { viewProfile } = useAppContext();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const userLayerRef = useRef<any>(null);
  const spotLayerRef = useRef<any>(null);
  const meMarkerRef = useRef<any>(null);

  const [activeLayer, setActiveLayer] = useState<'users' | 'spots'>('users');
  const [isLocating, setIsLocating] = useState(false);

  // Utilise les utilisateurs filtrés ou tous les utilisateurs
  const displayUsers = filteredUsers || allUsers;

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

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        subdomains: 'abcd',
        maxZoom: 20
    }).addTo(map);

    userLayerRef.current = L.layerGroup().addTo(map);
    spotLayerRef.current = L.layerGroup();

    handleBroadcastLocation(true);

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

  useEffect(() => {
    const map = mapInstanceRef.current;
    const userLayer = userLayerRef.current;
    if (!map || !userLayer) return;

    userLayer.clearLayers();

    displayUsers.forEach(user => {
      const isMe = user.id === currentUser.id;
      const isPhotog = user.type === 'Photographe' || user.type === 'Vidéaste';
      
      const colorClass = isMe ? 'border-blue-500' : (isPhotog ? 'border-[#D2B48C]' : 'border-white');
      const bgClass = isMe ? 'bg-blue-500' : (isPhotog ? 'bg-[#D2B48C]' : 'bg-white');

      const icon = L.divIcon({
        html: `<div class="relative ${isMe ? 'z-[2000]' : ''}">
                 ${user.isAvailableNow ? `<div class="absolute -inset-2 ${isMe ? 'bg-blue-500/30' : 'bg-red-500/20'} rounded-full animate-pulse"></div>` : ''}
                 <div class="w-10 h-10 rounded-2xl border-2 ${colorClass} bg-[#0D1625] overflow-hidden shadow-2xl transition-all active:scale-90">
                   <img src="${user.avatarUrl}" class="w-full h-full object-cover ${isMe ? 'brightness-110' : ''}" />
                 </div>
                 <div class="absolute -bottom-1 -right-1 w-4 h-4 ${bgClass} rounded-lg flex items-center justify-center border border-[#0D1625] shadow-md">
                    <div class="text-[7px] font-black text-[#0D1625] uppercase">${isMe ? 'ME' : (isPhotog ? 'PH' : 'MD')}</div>
                 </div>
                 ${isMe ? '<div class="absolute -top-6 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-[7px] px-1.5 py-0.5 rounded font-black uppercase tracking-widest whitespace-nowrap">Vous</div>' : ''}
               </div>`,
        className: '', iconSize: [40, 40], iconAnchor: [20, 20]
      });

      const m = L.marker([user.location.lat, user.location.lng], { icon, zIndexOffset: isMe ? 1000 : 0 })
        .on('click', () => {
          if (!isMe) {
            trackAction('MAP_MARKER_CLICK', { userId: user.id });
            viewProfile(user);
          }
        });
      
      userLayer.addLayer(m);
      if (isMe) meMarkerRef.current = m;
    });
  }, [displayUsers, currentUser]);

  const handleBroadcastLocation = async (isInitial = false) => {
    if (!isInitial) setIsLocating(true);
    try {
        await refreshLocation();
        const map = mapInstanceRef.current;
        if (map) {
            map.flyTo([currentUser.location.lat, currentUser.location.lng], isInitial ? 13 : 15, { duration: 1.5 });
        }
    } catch (err) {
        console.error("Signal GPS perdu", err);
    } finally {
        if (!isInitial) setIsLocating(false);
    }
  };

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

  return (
    <div className="relative w-full h-full bg-[#f0f1f2] overflow-hidden">
      <div ref={mapContainerRef} className="w-full h-full" />
      
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[400] w-auto">
        <div className="bg-[#050B14]/90 backdrop-blur-xl p-1 rounded-2xl border border-white/10 shadow-2xl flex gap-1">
            <button onClick={() => toggleLayer('users')} className={`px-6 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all uppercase whitespace-nowrap ${activeLayer === 'users' ? 'bg-[#D2B48C] text-[#050B14]' : 'text-slate-400'}`}>TALENTS</button>
            <button onClick={() => toggleLayer('spots')} className={`px-6 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all uppercase whitespace-nowrap ${activeLayer === 'spots' ? 'bg-[#D2B48C] text-[#050B14]' : 'text-slate-400'}`}>SPOTS</button>
        </div>
      </div>

      <div className="absolute bottom-6 left-6 z-[400] flex flex-col gap-3">
          <button 
            onClick={() => handleBroadcastLocation()}
            disabled={isLocating}
            className={`h-14 px-6 rounded-2xl border flex items-center gap-3 shadow-2xl transition-all active:scale-95 ${isLocating ? 'bg-blue-500/20 border-blue-500 text-blue-400' : 'bg-[#050B14] border-blue-500/30 text-white hover:bg-[#0D1625]'}`}
          >
            {isLocating ? (
                <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
            ) : (
                <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
            )}
            <span className="text-[10px] font-black uppercase tracking-widest">
                {isLocating ? 'Synchronisation...' : 'Diffuser ma position'}
            </span>
          </button>
      </div>

      <button 
        onClick={() => mapInstanceRef.current?.flyTo([currentUser.location.lat, currentUser.location.lng], 15)} 
        className="absolute bottom-6 right-6 z-[400] w-14 h-14 bg-white border border-black/5 rounded-2xl flex items-center justify-center text-[#050B14] shadow-2xl active:scale-90 transition-all group"
      >
        <Icon name="locationMarker" className="w-7 h-7 group-hover:text-blue-500" />
      </button>
    </div>
  );
};

export default memo(MapView);