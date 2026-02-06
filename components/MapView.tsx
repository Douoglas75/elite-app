
import React, { useEffect, useRef, memo, useState, useMemo } from 'react';
import type { User } from '../types';
import { UserType } from '../types';
import { useUser } from '../contexts/UserContext';
import { useAppContext } from '../contexts/AppContext';
import Icon from './Icon';

declare var L: any;

interface MapViewProps {
  filteredUsers?: User[];
}

const MapView: React.FC<MapViewProps> = ({ filteredUsers }) => {
  const { users: allUsers, currentUser, refreshLocation } = useUser();
  const { viewProfile } = useAppContext();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const userLayerRef = useRef<any>(null);
  
  const [activeLayer, setActiveLayer] = useState<'users' | 'spots'>('users');
  const [isLocating, setIsLocating] = useState(false);

  // LOGIQUE CRITIQUE : Toujours inclure l'utilisateur actuel dans l'affichage de la carte
  const displayUsers = useMemo(() => {
    const list = filteredUsers || allUsers;
    const isMeInList = list.some(u => u.id === currentUser.id);
    if (!isMeInList) {
        return [currentUser, ...list];
    }
    return list;
  }, [filteredUsers, allUsers, currentUser]);

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
            }, 500);
        } catch (e) {
            console.error("Leaflet Init Error:", e);
        }
    };

    const timer = setTimeout(initMap, 200);
    
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
      if (!user.location || typeof user.location.lat !== 'number') return;

      const isMe = user.id === currentUser.id;
      
      // Détermination du label et de la couleur en fonction du type précis
      let typeLabel = 'MD';
      let colorClass = 'border-white';
      let bgClass = 'bg-white';

      if (user.type === UserType.Photographer) {
          typeLabel = 'PH';
          colorClass = 'border-[#D2B48C]';
          bgClass = 'bg-[#D2B48C]';
      } else if (user.type === UserType.Videographer) {
          typeLabel = 'VD';
          colorClass = 'border-purple-500';
          bgClass = 'bg-purple-500';
      } else if (user.type === UserType.Model) {
          typeLabel = 'MD';
          colorClass = 'border-pink-500';
          bgClass = 'bg-pink-500';
      }

      if (isMe) {
          colorClass = 'border-blue-500';
          bgClass = 'bg-blue-500';
      }

      const icon = L.divIcon({
        html: `<div class="relative ${isMe ? 'z-[5000]' : ''} animate-scale-in">
                 ${isMe ? `<div class="absolute -inset-4 bg-blue-500/20 rounded-full animate-ping"></div>` : ''}
                 ${user.isAvailableNow ? `<div class="absolute -inset-2 ${isMe ? 'bg-blue-500/30' : 'bg-red-500/20'} rounded-full animate-pulse"></div>` : ''}
                 <div class="w-10 h-10 rounded-2xl border-2 ${colorClass} bg-[#0D1625] overflow-hidden shadow-2xl transition-all ${isMe ? 'ring-4 ring-blue-500/30' : ''}">
                   <img src="${user.avatarUrl}" class="w-full h-full object-cover" />
                 </div>
                 <div class="absolute -bottom-1 -right-1 w-4 h-4 ${bgClass} rounded-lg flex items-center justify-center border border-[#0D1625] shadow-md">
                    <div class="text-[7px] font-black text-[#0D1625] uppercase">${isMe ? 'ME' : typeLabel}</div>
                 </div>
               </div>`,
        className: '', iconSize: [40, 40], iconAnchor: [20, 20]
      });

      const marker = L.marker([user.location.lat, user.location.lng], { 
        icon, 
        zIndexOffset: isMe ? 10000 : 0 
      }).addTo(userLayer);

      marker.on('mousedown touchstart', (e: any) => {
          L.DomEvent.stopPropagation(e);
          if (!isMe) viewProfile(user);
      });
    });
  }, [displayUsers, currentUser, viewProfile]);

  const handleLiveLocate = async () => {
    if (isLocating) return;
    setIsLocating(true);
    try {
        const newCoords = await refreshLocation();
        if (mapInstanceRef.current) {
            mapInstanceRef.current.flyTo([newCoords.lat, newCoords.lng], 15, { duration: 1.5 });
        }
    } catch (err) {
        alert("Activez la géolocalisation dans vos paramètres système pour cette fonctionnalité.");
    } finally {
        setTimeout(() => setIsLocating(false), 2000);
    }
  };

  return (
    <div className="relative w-full h-full bg-[#050B14] overflow-hidden">
      <div ref={mapContainerRef} className="w-full h-full z-0" />
      
      {/* HUD Overlay */}
      <div className="absolute inset-0 z-[500] pointer-events-none flex flex-col justify-between p-4 md:p-6 pb-24 md:pb-8">
        <div className="flex justify-center">
          <div className="bg-[#050B14]/90 backdrop-blur-xl p-1 rounded-2xl border border-white/10 shadow-2xl flex gap-1 pointer-events-auto">
              <button onClick={() => setActiveLayer('users')} className={`px-6 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all uppercase whitespace-nowrap ${activeLayer === 'users' ? 'bg-[#D2B48C] text-[#050B14]' : 'text-slate-400'}`}>TALENTS</button>
              <button onClick={() => setActiveLayer('spots')} className={`px-6 py-2 rounded-xl text-[10px] font-black tracking-widest transition-all uppercase whitespace-nowrap ${activeLayer === 'spots' ? 'bg-[#D2B48C] text-[#050B14]' : 'text-slate-400'}`}>SPOTS</button>
          </div>
        </div>

        <div className="flex justify-end items-end">
            <button 
              onClick={handleLiveLocate}
              className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl active:scale-90 transition-all pointer-events-auto ${isLocating ? 'bg-blue-500 text-white animate-pulse' : 'bg-white text-[#050B14]'}`}
            >
              <Icon name={isLocating ? "bolt" : "locationMarker"} className="w-7 h-7" />
            </button>
        </div>
      </div>
    </div>
  );
};

export default memo(MapView);
