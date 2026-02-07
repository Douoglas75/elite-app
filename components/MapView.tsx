
import React, { useEffect, useRef, memo, useState, useMemo } from 'react';
import type { User, Spot } from '../types';
import { UserType } from '../types';
import { useUser } from '../contexts/UserContext';
import { useAppContext } from '../contexts/AppContext';
import Icon from './Icon';

declare var L: any;

interface MapViewProps {
  filteredUsers?: User[];
}

const MapView: React.FC<MapViewProps> = ({ filteredUsers }) => {
  const { users: allUsers, currentUser, refreshLocation, spots: dynamicSpots, refreshSpots, isRefreshingSpots } = useUser();
  const { viewProfile } = useAppContext();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const userLayerRef = useRef<any>(null);
  const spotLayerRef = useRef<any>(null);
  
  const [activeLayer, setActiveLayer] = useState<'users' | 'spots'>('users');
  const [isLocating, setIsLocating] = useState(false);
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);

  const displayUsers = useMemo(() => {
    const list = filteredUsers || allUsers;
    const otherUsers = list.filter(u => u.id !== currentUser.id);
    return [currentUser, ...otherUsers];
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
            }).setView([currentUser.location.lat, currentUser.location.lng], 13);
            mapInstanceRef.current = map;
            L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', { subdomains: 'abcd' }).addTo(map);
            userLayerRef.current = L.layerGroup().addTo(map);
            spotLayerRef.current = L.layerGroup().addTo(map);
            handleLiveLocate();
        } catch (e) { console.error(e); }
    };
    const timer = setTimeout(initMap, 200);
    return () => {
        clearTimeout(timer);
        if (mapInstanceRef.current) mapInstanceRef.current.remove();
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current) return;
    if (activeLayer === 'users') {
        mapInstanceRef.current.addLayer(userLayerRef.current);
        mapInstanceRef.current.removeLayer(spotLayerRef.current);
    } else {
        mapInstanceRef.current.addLayer(spotLayerRef.current);
        mapInstanceRef.current.removeLayer(userLayerRef.current);
    }
  }, [activeLayer]);

  useEffect(() => {
    const userLayer = userLayerRef.current;
    const spotLayer = spotLayerRef.current;
    if (!userLayer || !spotLayer) return;

    userLayer.clearLayers();
    displayUsers.forEach(user => {
      if (!user.location) return;
      const isMe = user.id === currentUser.id;
      const icon = L.divIcon({
        html: `<div class="relative animate-scale-in">
                 <div class="w-12 h-12 rounded-[1.2rem] border-2 ${isMe ? 'border-blue-500 ring-4 ring-blue-500/30' : 'border-white'} bg-[#0D1625] overflow-hidden shadow-2xl transition-all">
                   <img src="${user.avatarUrl}" class="w-full h-full object-cover" />
                 </div>
               </div>`,
        className: '', iconSize: [48, 48], iconAnchor: [24, 24]
      });
      const marker = L.marker([user.location.lat, user.location.lng], { icon }).addTo(userLayer);
      marker.on('click', () => !isMe && viewProfile(user));
    });

    spotLayer.clearLayers();
    dynamicSpots.forEach(spot => {
      const isSelected = selectedSpot?.id === spot.id;
      const icon = L.divIcon({
        html: `<div class="relative animate-scale-in">
                 <div class="w-10 h-10 rounded-full border-2 ${isSelected ? 'border-[#D2B48C] bg-[#D2B48C] scale-125' : 'border-white bg-[#0D1625]'} flex items-center justify-center shadow-2xl transition-all">
                    <svg class="w-5 h-5 ${isSelected ? 'text-[#050B14]' : 'text-[#D2B48C]'}" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                 </div>
               </div>`,
        className: '', iconSize: [40, 40], iconAnchor: [20, 20]
      });
      const marker = L.marker([spot.location.lat, spot.location.lng], { icon }).addTo(spotLayer);
      marker.on('click', () => setSelectedSpot(spot));
    });
  }, [displayUsers, currentUser, selectedSpot, dynamicSpots]);

  const handleLiveLocate = async () => {
    if (isLocating) return;
    setIsLocating(true);
    try {
        const newCoords = await refreshLocation();
        if (mapInstanceRef.current) {
            mapInstanceRef.current.flyTo([newCoords.lat, newCoords.lng], 15, { duration: 1.5 });
        }
    } catch (err) { console.warn(err); } finally { setTimeout(() => setIsLocating(false), 2000); }
  };

  const centerOnSpot = (spot: Spot) => {
    setSelectedSpot(spot);
    if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo([spot.location.lat, spot.location.lng], 16, { duration: 1.2 });
    }
  };

  return (
    <div className="relative w-full h-full bg-[#050B14] overflow-hidden">
      <div ref={mapContainerRef} className="w-full h-full z-0" />
      
      <div className="absolute inset-0 z-[500] pointer-events-none flex flex-col justify-between">
        {/* Top Toggle */}
        <div className="p-4 md:p-6 flex justify-center">
          <div className="bg-[#050B14]/90 backdrop-blur-xl p-1.5 rounded-2xl border border-white/10 shadow-2xl flex gap-1 pointer-events-auto">
              <button onClick={() => { setActiveLayer('users'); setSelectedSpot(null); }} className={`px-6 py-2.5 rounded-xl text-[10px] font-black tracking-widest transition-all uppercase whitespace-nowrap ${activeLayer === 'users' ? 'bg-[#D2B48C] text-[#050B14]' : 'text-slate-400'}`}>TALENTS</button>
              <button onClick={() => { setActiveLayer('spots'); setSelectedSpot(null); }} className={`px-6 py-2.5 rounded-xl text-[10px] font-black tracking-widest transition-all uppercase whitespace-nowrap ${activeLayer === 'spots' ? 'bg-[#D2B48C] text-[#050B14]' : 'text-slate-400'}`}>SPOTS</button>
          </div>
        </div>

        {/* Dynamic Controls Bottom */}
        <div className="p-4 md:p-6 pb-28 md:pb-12 space-y-4 flex flex-col items-end pointer-events-none">
            {/* AI Refresh Button */}
            {activeLayer === 'spots' && (
                <button 
                    onClick={refreshSpots}
                    disabled={isRefreshingSpots}
                    className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl bg-[#0D1625] text-[#D2B48C] border border-[#D2B48C]/30 pointer-events-auto active:scale-90 transition-all overflow-hidden relative"
                >
                    {isRefreshingSpots ? (
                        <div className="w-6 h-6 border-2 border-[#D2B48C] border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <Icon name="sparkles" className="w-6 h-6" />
                    )}
                    {isRefreshingSpots && <div className="absolute inset-0 bg-white/5 animate-pulse" />}
                </button>
            )}

            {/* Locate Button */}
            <button 
              onClick={handleLiveLocate}
              className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl active:scale-90 transition-all pointer-events-auto border-4 border-[#050B14] ${isLocating ? 'bg-blue-500 text-white animate-pulse' : 'bg-white text-[#050B14]'}`}
            >
              <Icon name={isLocating ? "bolt" : "locationMarker"} className="w-7 h-7" />
            </button>

            {/* Spots Gallery Slider */}
            {activeLayer === 'spots' && (
                <div className="w-full pointer-events-auto animate-fade-in-up">
                    <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                        {dynamicSpots.map(spot => (
                            <button 
                                key={spot.id} 
                                onClick={() => centerOnSpot(spot)}
                                className={`flex-shrink-0 w-64 h-32 rounded-[2rem] overflow-hidden border-2 transition-all duration-500 relative group shadow-2xl ${selectedSpot?.id === spot.id ? 'border-[#D2B48C] scale-95 ring-4 ring-[#D2B48C]/20' : 'border-white/10'}`}
                            >
                                <img src={spot.imageUrl} className="absolute inset-0 w-full h-full object-cover brightness-50 group-hover:brightness-75 transition-all" />
                                <div className="absolute inset-0 p-5 flex flex-col justify-end">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-[8px] font-black text-[#D2B48C] uppercase tracking-widest">{spot.type} • {spot.category}</p>
                                            <h4 className="text-sm font-black text-white uppercase tracking-tighter">{spot.name}</h4>
                                        </div>
                                        <div className="w-8 h-8 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
                                            <Icon name="chevronRight" className="w-4 h-4 text-white" />
                                        </div>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Spot Detail Modal */}
            {selectedSpot && activeLayer === 'spots' && (
                <div className="fixed inset-x-4 bottom-28 md:bottom-12 md:left-auto md:w-96 bg-[#0D1625]/95 backdrop-blur-2xl border border-white/10 p-8 rounded-[3rem] shadow-[0_20px_60px_rgba(0,0,0,0.6)] animate-scale-in pointer-events-auto z-[600]">
                    <button onClick={() => setSelectedSpot(null)} className="absolute top-6 right-6 p-2 text-slate-500 hover:text-white"><Icon name="close" className="w-5 h-5"/></button>
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                             <div className="px-3 py-1 bg-[#D2B48C]/10 text-[#D2B48C] text-[8px] font-black rounded-lg uppercase tracking-widest border border-[#D2B48C]/20">{selectedSpot.type}</div>
                             <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{selectedSpot.category}</div>
                        </div>
                        <h3 className="text-2xl font-black text-white uppercase tracking-tighter">{selectedSpot.name}</h3>
                        <p className="text-slate-400 text-xs leading-relaxed font-medium">{selectedSpot.description}</p>
                        
                        {/* Grounding Source Link */}
                        {selectedSpot.sourceUrl && (
                            <div className="pt-2">
                                <p className="text-[8px] text-slate-600 font-black uppercase tracking-widest mb-2">Vérifié via Google Search</p>
                                <a 
                                    href={selectedSpot.sourceUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-[9px] text-[#D2B48C] hover:underline flex items-center gap-1.5"
                                >
                                    <Icon name="link" className="w-3 h-3" />
                                    Consulter la source web
                                </a>
                            </div>
                        )}

                        <button 
                            onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${selectedSpot.location.lat},${selectedSpot.location.lng}`, '_blank')}
                            className="w-full bg-[#D2B48C] text-[#050B14] py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-[#D2B48C]/10 hover:brightness-110 transition-all"
                        >
                            Y Aller (Google Maps)
                        </button>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default memo(MapView);
