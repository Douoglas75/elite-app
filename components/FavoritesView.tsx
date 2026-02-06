
import React, { useMemo, memo } from 'react';
import { useFavorites } from '../contexts/FavoritesContext';
import UserProfileCard from './UserProfileCard';
import type { User } from '../types';
import Icon from './Icon';
import { useUser } from '../contexts/UserContext';
import { useAppContext } from '../contexts/AppContext';

const FavoritesView: React.FC = () => {
  const { favoriteIds } = useFavorites();
  const { users } = useUser();
  const { viewProfile, setActiveTab } = useAppContext();
  
  const favoriteUsers = useMemo(() => 
    users.filter(user => favoriteIds.includes(user.id)),
    [users, favoriteIds]
  );

  return (
    <div className="flex flex-col h-full animate-fade-in bg-[#050B14]">
      <header className="p-4 md:p-6 border-b border-white/5 flex items-center gap-4 bg-[#0D1625]/80 backdrop-blur-md sticky top-0 z-50">
        <button onClick={() => setActiveTab('discover')} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-[#D2B48C] transition-all">
           <Icon name="chevronRight" className="w-5 h-5 rotate-180" />
        </button>
        <h1 className="text-xl font-black text-white uppercase tracking-tighter">Mes Favoris</h1>
      </header>
      <div className="flex-1 pb-24 md:pb-4 overflow-y-auto">
        {favoriteUsers.length > 0 ? (
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {favoriteUsers.map(user => (
              <UserProfileCard key={user.id} user={user} onSelect={viewProfile} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 p-8">
            <Icon name="heart" className="w-16 h-16 text-gray-700 mb-4" />
            <h2 className="text-xl font-semibold text-white">Aucun favori</h2>
            <p className="mt-2 max-w-xs text-sm">Cliquez sur le cœur sur un profil pour l'ajouter ici.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(FavoritesView);
