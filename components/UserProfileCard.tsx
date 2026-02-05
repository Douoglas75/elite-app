import React, { memo } from 'react';
import type { User } from '../types';
import { UserType } from '../types';
import Icon from './Icon';
import { useFavorites } from '../contexts/FavoritesContext';

interface UserProfileCardProps {
  user: User;
  onSelect: (user: User) => void;
}

const UserProfileCard: React.FC<UserProfileCardProps> = ({ user, onSelect }) => {
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const isUserFavorite = isFavorite(user.id);

  const typeColor =
    user.type === UserType.Model
      ? 'bg-blue-500/20 text-blue-300'
      : 'bg-purple-500/20 text-purple-300';

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Empêche le clic de se propager à la carte
    if (isUserFavorite) {
      removeFavorite(user.id);
    } else {
      addFavorite(user.id);
    }
  };

  return (
    <div
      onClick={() => onSelect(user)}
      className="relative bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-cyan-500/20 transition-all cursor-pointer border border-gray-700 hover:border-cyan-500/50"
    >
       <button
        onClick={handleFavoriteClick}
        className="absolute top-3 right-3 z-10 p-2 bg-black/40 rounded-full hover:bg-black/60 transition-colors"
        aria-label={isUserFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
      >
        <Icon name="heart" className={`w-6 h-6 transition-colors ${isUserFavorite ? 'text-red-500 fill-current' : 'text-white'}`} />
      </button>

      <div className="relative">
        <img className="w-full h-56 object-cover" src={user.avatarUrl} alt={user.name} />
        <div className="absolute top-2 left-2 flex items-center gap-2">
            <div className={`px-2 py-1 text-xs font-semibold rounded-full ${typeColor}`}>
              {user.type}
            </div>
            {user.isPro && (
                <div className="px-2 py-1 text-xs font-bold rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-md">
                    PRO
                </div>
            )}
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
          <h3 className="text-xl font-bold text-white">{user.name}</h3>
          <p className="text-sm text-gray-300">{user.headline}</p>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between text-gray-400">
          <div className="flex items-center gap-1">
            <Icon name="star" className="w-5 h-5 text-yellow-400" />
            <span className="font-bold text-white">{user.rating.toFixed(1)}</span>
          </div>
          <span className="text-lg font-semibold text-cyan-400">${user.rate}<span className="text-sm font-normal text-gray-400">/h</span></span>
        </div>
      </div>
    </div>
  );
};

export default memo(UserProfileCard);