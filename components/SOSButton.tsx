
import React, { useState } from 'react';
import Icon from './Icon';
import { useUser } from '../contexts/UserContext';
import { useAppContext } from '../contexts/AppContext';

const SOSButton: React.FC = () => {
  const { users } = useUser();
  const { viewProfile } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);

  const availableNow = users.filter(u => u.isAvailableNow && u.isPro);

  return (
    <div className="fixed bottom-24 right-4 z-[1001]" data-tour="sos-button">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-red-600 rounded-full shadow-2xl shadow-red-500/50 flex items-center justify-center animate-pulse border-2 border-white/20"
      >
        <Icon name="bolt" className="w-7 h-7 text-white" />
      </button>

      {isOpen && (
        <div className="absolute bottom-16 right-0 w-72 bg-gray-900 border border-red-500/30 rounded-2xl shadow-2xl p-4 animate-popup-transition">
          <h3 className="text-red-400 font-bold flex items-center gap-2 mb-3">
            <Icon name="clock" className="w-4 h-4" />
            DISPO IMMÉDIATE (10km)
          </h3>
          <div className="space-y-2 max-h-60 overflow-y-auto no-scrollbar">
            {availableNow.length > 0 ? availableNow.map(u => (
              <div 
                key={u.id} 
                onClick={() => { viewProfile(u); setIsOpen(false); }}
                className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-xl cursor-pointer transition-colors"
              >
                <img src={u.avatarUrl} className="w-10 h-10 rounded-full object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-sm truncate">{u.name}</p>
                  <p className="text-gray-400 text-xs">{u.headline}</p>
                </div>
                <Icon name="chevronRight" className="w-4 h-4 text-gray-600" />
              </div>
            )) : (
              <p className="text-gray-500 text-center py-4 text-sm">Aucun photographe dispo pour le moment.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SOSButton;
