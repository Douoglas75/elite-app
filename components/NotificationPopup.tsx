import React, { useEffect } from 'react';
import type { User } from '../types';

interface NotificationPopupProps {
  user: User;
  onClose: () => void;
  onView: (user: User) => void;
}

const NotificationPopup: React.FC<NotificationPopupProps> = ({ user, onClose, onView }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 8000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="absolute bottom-20 inset-x-4 bg-gray-800/80 backdrop-blur-md border border-purple-500/30 rounded-xl shadow-2xl shadow-purple-500/10 p-4 animate-fade-in-up z-40">
      <div className="flex items-start gap-4">
        <img src={user.avatarUrl} alt={user.name} className="w-16 h-16 rounded-full object-cover border-2 border-purple-500" />
        <div className="flex-1">
          <p className="text-sm text-purple-400 font-semibold">Alerte d'utilisateur à proximité</p>
          <p className="font-bold text-white mt-1">
            {/* Fix: User object uses 'types' array instead of 'type' */}
            {user.name} <span className="font-normal text-gray-400">({user.types.join(', ')}) est à proximité !</span>
          </p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => onView(user)}
              className="w-full bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold py-2 px-4 rounded-lg transition-colors"
            >
              Voir le profil
            </button>
            <button
              onClick={onClose}
              className="w-full bg-gray-700 hover:bg-gray-600 text-gray-200 text-sm font-bold py-2 px-4 rounded-lg transition-colors"
            >
              Ignorer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationPopup;