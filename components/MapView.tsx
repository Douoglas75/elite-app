
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
      
      const roleData: { label: string, color: string }[] = [];
      if (user.types?.includes(UserType.Photographer)) roleData.push({ label: 'PH', color: 'bg-[#D2B48C]' });
      if (user.types?.includes(UserType.Videographer)) roleData.push({ label: 'VD', color: 'bg-purple-500' });
      if (user.types?.includes(UserType.Model)) roleData.push({ label: 'MD', color: 'bg-pink-500' });

      let borderColor = 'border-white';
      if (isMe) borderColor = 'border-blue-500';
      else if (roleData.length > 0) borderColor = roleData[0].color.replace('bg-', 'border-');

      const badgesHtml = roleData.map((role, i) => `
        <div class="absolute -bottom-1 -right-${i * 3} w-4 h-4 ${role.color} rounded-lg flex items-center justify-center border border-[#0D1625] shadow-md z-${10 - i} transition-all">
            <div class="text-[6px] font-black text-white uppercase">${isMe && i === 0 ? 'ME' : role.label}</div>