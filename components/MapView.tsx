
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
  const { users: allUsers, currentUser } = useUser();
  const { viewProfile } = useAppContext();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const userLayerRef = useRef<any>(null);
  
  const [activeLayer, setActiveLayer] = useState<'users' | 'spots'>('users');

  const displayUsers = filteredUsers || allUsers;

  useEffect(() => {
    const initMap = () => {
        if (!mapContainerRef.current || mapInstanceRef.current) return;

        try {
            const map = L.map(mapContainerRef.current, {
                zoomControl: false,
                attributionControl: false,
                maxZoom: 18,
                minZoom: 3,
                tap: true
            }).setView([currentUser.location.lat, currentUser.location.lng], 12);
            
            mapInstanceRef.current = map;

            L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
                subdomains: 'abcd',
                maxZoom: 20
            }).addTo(map);

            userLayerRef.current = L.layerGroup().addTo(map);
            
            setTimeout(() => {
              if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize();
            }, 250);
        } catch (e) {
            console.error("Leaflet Init Error:", e);
        }
    };

    const timer = setTimeout(initMap, 150);
    
    return () => {
        clearTimeout(timer);
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
        html: `<div class="relative ${isMe ? 'z-[2000]' : ''} animate-scale-in">
                 ${user.isAvailableNow ? `<div class="absolute -inset-2 ${isMe ? 'bg-blue-500/30' : 'bg-red-500/20'} rounded-full animate-pulse"></div>` : ''}
                 <div class="w-10 h-10 rounded-2xl border-2 ${colorClass} bg-[#0D1625] overflow-hidden shadow-2xl transition-all">
                   <img src="${user.avatarUrl}" class="w-full h-full object-cover" />
                 </div>
                 <div class="absolute -bottom-1 -right-1 w-4 h-4 ${bgClass} rounded-lg flex items-center justify-center border border-[#0D1625] shadow-md">
                    <div class="text-[7px] font-black text-[#0D1625] uppercase">${isMe ? 'ME' : (isPhotog ? 'PH' : 'MD')}</div>
                 </div>
               </div>`,
        className: '', iconSize: [40, 40], iconAnchor: [20, 20]
      });

      const marker = L.marker([user.location.lat, user.location.lng], { icon, zIndexOffset: isMe ? 1000 : 0 })
        .addTo(userLayer);

      marker.on('mousedown touchstart', (e: any) => {
          L.DomEvent.stopPropagation(e);
          if (!isMe) viewProfile(user);
      });
    });
  }, [displayUsers, currentUser, viewProfile]);

  return (
    <div className="relative w-full h-full bg-[#050B14] overflow-hidden">
      <div ref={mapContainerRef} className="w-full h-full z-0" />
      
      <div className="absolute inset-0 z-[500] pointer-events-none flex flex-col justify-between p-4 md:p-6 pb-24 md:pb-8">
        <div className="flex justify-center">
          <div className="bg-[#050B14]/90 backdrop-blur-xl p-1 rounded-2xl border border-white/10 shadow-2xl flex gap-1 pointer-events-auto">
              <button onClick={() => setActiveLayer('users')} className={`px-6 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all uppercase whitespace-nowrap ${activeLayer === 'users' ? 'bg-[#D2B48C] text-[#050B14]' : 'text-slate-400'}`}>TALENTS</button>
              <button onClick={() => setActiveLayer('spots')} className={`px-6 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all uppercase whitespace-nowrap ${activeLayer === 'spots' ? 'bg-[#D2B48C] text-[#050B14]' : 'text-slate-400'}`}>SPOTS</button>
          </div>
        </div>

        <div className="flex justify-end items-end">
            <button 
              onClick={() => mapInstanceRef.current?.flyTo([currentUser.location.lat, currentUser.location.lng], 15)} 
              className="w-14 h-14 bg-white border border-black/5 rounded-2xl flex items-center justify-center text-[#050B14] shadow-2xl active:scale-90 transition-all pointer-events-auto"
            >
              <Icon name="locationMarker" className="w-7 h-7" />
            </button>
        </div>
      </div>
    </div>
  );
};

export default memo(MapView);
