
import React, { useEffect, useRef, memo, useState } from 'react';
import type { User, ShootingSpot } from '../types';
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
  const [activeLayer, setActiveLayer] = useState<'users' | 'spots'>('users');
  const [isLocating, setIsLocating] = useState(false);

  const displayUsers = filteredUsers || allUsers;

  // Correction de la taille synchrone
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const invalidate = () => mapInstanceRef.current?.invalidateSize();
    window.addEventListener('resize', invalidate);
    const timer = setInterval(invalidate, 1000); // Periodic check for UI stability
    return () => {
      window.removeEventListener('resize', invalidate);
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Wait for DOM stability
    const initTimer = setTimeout(() => {
        if (!mapContainerRef.current) return;
        
        try {
            const map = L.map(mapContainerRef.current, {
                zoomControl: false,
                attributionControl: false,
                preferCanvas: true // Performance pour les mobiles
            }).setView([currentUser.location.lat, currentUser.location.lng], 12);
            
            mapInstanceRef.current = map;
            L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png').addTo(map);
            
            // Re-calc immediately
            map.invalidateSize();
        } catch (e) {
            console.error("Map Error:", e);
        }
    }, 300);

    return () => {
      clearTimeout(initTimer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [currentUser.location.lat, currentUser.location.lng]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Batch updates for performance
    Object.values(markersRef.current).forEach((m: any) => m.remove());
    markersRef.current = {};

    // Current User Marker
    const userIcon = L.divIcon({
        html: `<div class="w-10 h-10 rounded-full border-4 border-cyan-400 bg-cyan-900 overflow-hidden shadow-2xl">
                 <img src="${currentUser.avatarUrl || 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&w=128&q=80'}" class="w-full h-full object-cover" />
               </div>`,
        className: '', iconSize: [40, 40], iconAnchor: [20, 20]
    });
    markersRef.current['me'] = L.marker([currentUser.location.lat, currentUser.location.lng], { icon: userIcon, zIndexOffset: 1000 }).addTo(map);

    if (activeLayer === 'users') {
      displayUsers.forEach(user => {
        if (user.id === currentUser.id) return;
        const icon = L.divIcon({
          html: `<div class="marker-image-container ${user.type === 'Modèle' ? 'type-modele' : 'type-photographe'} ${user.isAvailableNow ? 'is-live' : ''}">
                   <img src="${user.avatarUrl}" class="marker-image" />
                 </div>`,
          className: '', iconSize: [40, 40], iconAnchor: [20, 20]
        });
        const m = L.marker([user.location.lat, user.location.lng], { icon }).on('click', () => {
          trackAction('MAP_MARKER_CLICK', { userId: user.id });
          viewProfile(user);
        });
        m.addTo(map);
        markersRef.current[`u_${user.id}`] = m;
      });
    }
  }, [activeLayer, displayUsers, currentUser, viewProfile, trackAction]);

  const handleLocateMe = () => {
    if (!mapInstanceRef.current) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        mapInstanceRef.current.flyTo([latitude, longitude], 15, { animate: true, duration: 2 });
        setIsLocating(false);
        trackAction('MAP_LOCATE_ME', { latitude, longitude });
      },
      () => setIsLocating(false)
    );
  };

  return (
    <div className="relative w-full h-full bg-[#0D1117]">
      <div ref={mapContainerRef} className="w-full h-full" />
      
      <div className="absolute top-4 left-4 z-[400] flex gap-2">
        <button onClick={() => setActiveLayer('users')} className={`px-5 py-2.5 rounded-xl text-[10px] font-black tracking-widest transition-all shadow-2xl uppercase border ${activeLayer === 'users' ? 'bg-cyan-500 border-cyan-400 text-white' : 'bg-slate-900 border-slate-800 text-slate-500 backdrop-blur-md'}`}>Talents</button>
        <button onClick={() => setActiveLayer('spots')} className={`px-5 py-2.5 rounded-xl text-[10px] font-black tracking-widest transition-all shadow-2xl uppercase border ${activeLayer === 'spots' ? 'bg-purple-600 border-purple-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-500 backdrop-blur-md'}`}>Spots</button>
      </div>

      <button onClick={handleLocateMe} disabled={isLocating} className="absolute bottom-6 right-6 z-[400] w-14 h-14 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center text-cyan-400 shadow-2xl hover:bg-slate-800 transition-all active:scale-90">
        {isLocating ? <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" /> : <Icon name="bolt" className="w-7 h-7" />}
      </button>
    </div>
  );
};

export default memo(MapView);
