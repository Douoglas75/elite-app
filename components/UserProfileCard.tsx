
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

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isUserFavorite) {
      removeFavorite(user.id);
    } else {
      addFavorite(user.id);
    }
  };

  return (
    <div
      onClick={() => onSelect(user)}
      className="bg-[#0D1625] rounded-[2rem] overflow-hidden border border-white/5 shadow-2xl hover:border-[#D2B48C]/30 transition-all duration-300 group"
    >
      <div className="relative aspect-[4/5] overflow-hidden">
        <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" src={user.avatarUrl} alt={user.name} />
        
        <button
            onClick={handleFavoriteClick}
            className="absolute top-4 right-4 z-10 p-2.5 bg-black/40 backdrop-blur-xl rounded-2xl hover:bg-black/60 transition-all"
        >
            <Icon name="heart" className={`w-5 h-5 transition-colors ${isUserFavorite ? 'text-red-500 fill-current' : 'text-white'}`} />
        </button>

        <div className="absolute top-4 left-4 flex flex-wrap gap-1.5 max-w-[80%]">
            {user.types?.map((type, i) => (
                <div key={i} className="px-3 py-1 bg-[#D2B48C] text-[#050B14] text-[8px] font-black rounded-lg uppercase tracking-widest shadow-lg">
                    {type}
                </div>
            ))}
            {user.completedShootsCount > 0 && (
                <div className="px-3 py-1 bg-white/10 backdrop-blur-md text-white text-[8px] font-black rounded-lg uppercase tracking-widest border border-white/10 shadow-lg">
                    {user.completedShootsCount} Shoots
                </div>
            )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
          <h3 className="text-xl font-black text-white uppercase tracking-tighter">{user.name}</h3>
          <p className="text-[10px] text-white/70 font-bold uppercase tracking-widest mt-0.5 line-clamp-1">{user.headline}</p>
        </div>
      </div>
      
      <div className="p-5 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Icon name="star" className="w-4 h-4 text-[#D2B48C] fill-current" />
          <span className="text-xs font-black text-white">{user.rating > 0 ? user.rating.toFixed(1) : 'NOUVEAU'}</span>
        </div>
        <div className="text-right">
            <p className="text-lg font-black text-[#D2B48C] tracking-tighter">${user.rate}<span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">/h</span></p>
        </div>
      </div>
    </div>
  );
};

export default memo(UserProfileCard);
