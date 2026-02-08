
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
  const { viewProfile, discoverMode, filterSpotCategory } = useAppContext();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const userLayerRef = useRef<any>(null);
  const spotLayerRef = useRef<any>(null);
  
  const [isLocating, setIsLocating] = useState(false);
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);

  // Combine currentUser with all other registered users for the map display
  const displayUsers = useMemo(() => {
    const list = filteredUsers || allUsers;
    // Ensure currentUser is always present and others are distinct
    const others = list.filter(u => u.id !== currentUser.id);
    return [currentUser, ...others];
  }, [filteredUsers, allUsers, currentUser]);

  const filteredSpots = useMemo(() => {
    if (filterSpotCategory === 'All') return dynamicSpots;
    return dynamicSpots.filter(s => s.category === filterSpotCategory || s.type === filterSpotCategory);
  }, [dynamicSpots, filterSpotCategory]);

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
            
            // Try to locate user immediately
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
    if (discoverMode === 'talents') {
        mapInstanceRef.current.addLayer(userLayerRef.current);
        mapInstanceRef.current.removeLayer(spotLayerRef.current);
    } else {
        mapInstanceRef.current.addLayer(spotLayerRef.current);
        mapInstanceRef.current.removeLayer(userLayerRef.current);
    }
  }, [discoverMode]);

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
                 <div class="w-12 h-12 rounded-[1.2rem] border-2 ${isMe ? 'border-[#D2B48C] ring-4 ring-[#D2B48C]/30' : 'border-white'} bg-[#0D1625] overflow-hidden shadow-2xl transition-all">
                   <img src="${user.avatarUrl}" class="w-full h-full object-cover" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=1A2536&color=D2B48C'" />
                 </div>
                 ${isMe ? '<div class="absolute -top-1 -right-1 w-4 h-4 bg-[#D2B48C] rounded-full border-2 border-[#0D1625] flex items-center justify-center text-[8px] font-black text-[#050B14]">MOI</div>' : ''}
               </div>`,
        className: '', iconSize: [48, 48], iconAnchor: [24, 24]
      });
      const marker = L.marker([user.location.lat, user.location.lng], { icon }).addTo(userLayer);
      marker.on('click', () => !isMe && viewProfile(user));
    });

    spotLayer.clearLayers();
    filteredSpots.forEach(spot => {
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
      marker.on('click', () => {
          setSelectedSpot(spot);
          if (mapInstanceRef.current) mapInstanceRef.current.flyTo([spot.location.lat, spot.location.lng], 16, { duration: 1 });
      });
    });
  }, [displayUsers, currentUser, selectedSpot, filteredSpots, viewProfile]);

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
      
      <div className="absolute inset-0 z-[500] pointer-events-none flex flex-col justify-end">
        
        {/* Unified Control Bar on the right */}
        <div className="absolute top-1/2 right-4 -translate-y-1/2 flex flex-col gap-3 pointer-events-auto">
            {discoverMode === 'spots' && (
                <button 
                    onClick={() => refreshSpots()}
                    disabled={isRefreshingSpots}
                    className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl bg-[#0D1625]/90 backdrop-blur-xl text-[#D2B48C] border border-white/10 active:scale-95 transition-all"
                >
                    {isRefreshingSpots ? (
                        <div className="w-6 h-6 border-2 border-[#D2B48C] border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <Icon name="sparkles" className="w-6 h-6" />
                    )}
                </button>
            )}
            <button 
              onClick={handleLiveLocate}
              className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl active:scale-95 transition-all border border-white/10 ${isLocating ? 'bg-[#D2B48C] text-[#050B14] animate-pulse' : 'bg-[#0D1625]/90 backdrop-blur-xl text-white'}`}
            >
              <Icon name={isLocating ? "bolt" : "locationMarker"} className="w-6 h-6" />
            </button>
        </div>

        <div className="p-4 md:p-6 pb-28 md:pb-12 flex flex-col items-stretch">
            {/* Dynamic Spots Slider */}
            {discoverMode === 'spots' && (
                <div className="w-full pointer-events-auto animate-fade-in-up">
                    <div className="flex gap-4 overflow-x-auto no-scrollbar pb-6 px-2 snap-x snap-mandatory">
                        {filteredSpots.map(spot => (
                            <button 
                                key={spot.id} 
                                onClick={() => centerOnSpot(spot)}
                                className={`flex-shrink-0 w-[280px] h-44 rounded-[2.5rem] overflow-hidden border-2 transition-all duration-500 relative group shadow-2xl snap-center ${selectedSpot?.id === spot.id ? 'border-[#D2B48C] scale-95' : 'border-white/5 opacity-80'}`}
                            >
                                <img 
                                  src={spot.imageUrl} 
                                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                                  alt={spot.name}
                                  onError={(e) => { 
                                      (e.target as HTMLImageElement).src = `https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80`; 
                                  }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent" />
                                <div className="absolute inset-0 p-6 flex flex-col justify-end">
                                    <div className="text-left">
                                        <p className="text-[9px] font-black text-[#D2B48C] uppercase tracking-[0.3em] mb-1.5">{spot.type} • {spot.category}</p>
                                        <h4 className="text-lg font-black text-white uppercase tracking-tighter leading-none">{spot.name}</h4>
                                    </div>
                                </div>
                            </button>
                        ))}
                        <div className="flex-shrink-0 w-8" />
                    </div>
                </div>
            )}

            {/* Spot Detail Modal */}
            {selectedSpot && discoverMode === 'spots' && (
                <div className="fixed inset-x-4 bottom-28 md:bottom-12 md:left-auto md:w-[420px] bg-[#0D1625]/98 backdrop-blur-3xl border border-white/10 p-10 rounded-[4rem] shadow-[0_30px_90px_rgba(0,0,0,0.9)] animate-scale-in pointer-events-auto z-[600]">
                    <button onClick={() => setSelectedSpot(null)} className="absolute top-10 right-10 p-2 text-slate-600 hover:text-white transition-colors">
                        <Icon name="close" className="w-6 h-6"/>
                    </button>
                    <div className="space-y-8">
                        <div className="flex items-center gap-4">
                             <div className="px-4 py-2 bg-[#D2B48C]/15 text-[#D2B48C] text-[10px] font-black rounded-xl uppercase tracking-widest border border-[#D2B48C]/30">{selectedSpot.type}</div>
                             <div className="text-xs text-slate-500 font-bold uppercase tracking-[0.2em]">{selectedSpot.category}</div>
                        </div>
                        <div className="space-y-3">
                            <h3 className="text-4xl font-black text-white uppercase tracking-tighter leading-tight">{selectedSpot.name}</h3>
                            <p className="text-slate-400 text-sm leading-relaxed font-medium">{selectedSpot.description}</p>
                        </div>
                        
                        {selectedSpot.sourceUrl && (
                            <div className="pt-4 border-t border-white/5">
                                <a 
                                    href={selectedSpot.sourceUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-[11px] text-[#D2B48C] font-black uppercase tracking-widest flex items-center gap-2.5 hover:opacity-70 transition-opacity"
                                >
                                    <Icon name="link" className="w-4 h-4" />
                                    Vérifié via Google Search
                                </a>
                            </div>
                        )}

                        <button 
                            onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${selectedSpot.location.lat},${selectedSpot.location.lng}`, '_blank')}
                            className="w-full bg-[#D2B48C] text-[#050B14] py-6 rounded-3xl font-black uppercase tracking-[0.3em] text-[11px] shadow-2xl shadow-[#D2B48C]/20 hover:scale-[1.02] active:scale-95 transition-all"
                        >
                            Ouvrir dans Google Maps
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
