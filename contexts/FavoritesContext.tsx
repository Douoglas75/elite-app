import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface FavoritesContextType {
  favoriteIds: number[];
  addFavorite: (id: number) => void;
  removeFavorite: (id: number) => void;
  isFavorite: (id: number) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [favoriteIds, setFavoriteIds] = useState<number[]>(() => {
    try {
      const item = window.localStorage.getItem('favoriteUsers');
      return item ? JSON.parse(item) : [];
    } catch (error) {
      console.error("Erreur lors de la lecture des favoris depuis localStorage:", error);
      return [];
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem('favoriteUsers', JSON.stringify(favoriteIds));
    } catch (error) {
      console.error("Erreur lors de l'écriture des favoris dans localStorage:", error);
    }
  }, [favoriteIds]);

  const addFavorite = (id: number) => {
    setFavoriteIds(prevIds => [...prevIds, id]);
  };

  const removeFavorite = (id: number) => {
    setFavoriteIds(prevIds => prevIds.filter(favId => favId !== id));
  };

  const isFavorite = (id: number) => {
    return favoriteIds.includes(id);
  };

  return (
    <FavoritesContext.Provider value={{ favoriteIds, addFavorite, removeFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = (): FavoritesContextType => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};