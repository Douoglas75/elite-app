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
  const { viewProfile } = useAppContext();
  
  const favoriteUsers = useMemo(() => 
    users.filter(user => favoriteIds.includes(user.id)),
    [users, favoriteIds]
  );

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <header className="p-4 border-b border-gray-800/50 flex-shrink-0">
        <h1 className="text-xl font-bold text-white">Mes Favoris</h1>
      </header>
      <div className="flex-1 pb-24 md:pb-4">
        {favoriteUsers.length > 0 ? (
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {favoriteUsers.map(user => (
              <UserProfileCard key={user.id} user={user} onSelect={viewProfile} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 p-8">
            <Icon name="heart" className="w-16 h-16 text-gray-600 mb-4" />
            <h2 className="text-xl font-semibold text-white">Aucun favori pour le moment</h2>
            <p className="mt-2 max-w-xs">Cliquez sur le cœur sur un profil pour l'ajouter à votre sélection personnelle.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(FavoritesView);