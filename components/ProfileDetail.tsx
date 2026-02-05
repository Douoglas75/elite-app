
import React from 'react';
import type { User } from '../types';
import Icon from './Icon';
import { useFavorites } from '../contexts/FavoritesContext';
import AIMatchmaker from './AIMatchmaker';
import { useUser } from '../contexts/UserContext';
import { useAppContext } from '../contexts/AppContext';

interface ProfileDetailProps {
  user: User;
  onBack: () => void;
}

const ProfileDetail: React.FC<ProfileDetailProps> = ({ user, onBack }) => {
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  const { currentUser, users: allUsers, startChat } = useUser();
  const { setBookingUser, setOnboardingOpen, setFullScreenMedia, selectThread } = useAppContext();

  const isUserFavorite = isFavorite(user.id);
  const isOwnProfile = user.id === currentUser.id;

  const handleFavoriteClick = () => {
    if (isUserFavorite) {
      removeFavorite(user.id);
    } else {
      addFavorite(user.id);
    }
  };
  
  const handleStartChat = (userId: number) => {
    const threadId = startChat(userId);
    selectThread(threadId);
  }

  const totalReviews = user.reviews?.length || 0;
  const averageRating = totalReviews > 0
    ? (user.reviews!.reduce((acc, review) => acc + review.rating, 0) / totalReviews)
    : user.rating;
    
  const hasSocialLinks = user.socialLinks && (user.socialLinks.website || user.socialLinks.instagram);

  return (
    <div className="p-4 sm:p-6 animate-fade-in pb-24 md:pb-6">
       <button onClick={onBack} className="mb-4 text-cyan-400 hover:text-cyan-300 flex items-center gap-2">
         &larr; Retour
       </button>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <img 
            src={user.avatarUrl} 
            alt={user.name} 
            className="rounded-2xl w-full aspect-square object-cover shadow-lg cursor-pointer hover:opacity-90 transition-opacity" 
            onClick={() => setFullScreenMedia({ type: 'image', url: user.avatarUrl })}
          />
          <div className="mt-4 bg-gray-800 p-4 rounded-xl border border-gray-700">
            <div className="flex justify-between items-start">
              <div>
                 <h3 className="text-2xl font-bold">{user.name}</h3>
                 <p className="text-cyan-400">{user.headline}</p>
              </div>
              {user.isPro && (
                <div className="px-2.5 py-1 text-sm font-bold rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-md flex-shrink-0">
                    PRO
                </div>
              )}
            </div>
            {user.isPremium && (
                <div className="mt-2 inline-block bg-yellow-500/20 text-yellow-300 text-xs font-bold px-2 py-1 rounded-full">
                    MEMBRE PREMIUM
                </div>
            )}
            <div className="flex items-center gap-2 mt-2 text-sm">
              <Icon name="star" className="w-5 h-5 text-yellow-400" />
              <span className="font-bold">{averageRating.toFixed(1)}</span>
              <span className="text-gray-400">(basé sur {totalReviews} avis)</span>
            </div>
            <div className="mt-4 border-t border-gray-700 pt-4">
                <p className="text-3xl font-bold text-white">${user.rate}<span className="text-lg font-normal text-gray-400">/h</span></p>
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-3">
             {!isOwnProfile && <button
               onClick={() => handleStartChat(user.id)}
               className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-4 rounded-lg transition-colors"
             >
               Envoyer un message
             </button>}
             {isOwnProfile && !currentUser.isPro && <button
               onClick={() => setOnboardingOpen(true)}
               className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-4 rounded-lg transition-colors"
             >
               Devenir PRO
             </button>}
             <div className="flex gap-3">
                {!isOwnProfile && <button onClick={() => setBookingUser(user)} className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-4 rounded-lg transition-colors">Réserver</button>}
                <button
                  onClick={handleFavoriteClick}
                  className={`p-3 rounded-lg transition-colors ${isOwnProfile ? 'w-full' : ''} ${isUserFavorite ? 'bg-red-800/50 text-red-400' : 'bg-gray-700 hover:bg-gray-600 text-gray-200'}`}
                  aria-label={isUserFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                >
                  <Icon name="heart" className={`w-6 h-6 ${isUserFavorite ? 'fill-current' : ''}`} />
                </button>
             </div>
          </div>
        </div>
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
             <h4 className="text-xl font-semibold text-white">À propos</h4>
             <p className="mt-2 text-gray-300 leading-relaxed">{user.bio}</p>
          </div>
           {hasSocialLinks && (
             <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                <h4 className="text-xl font-semibold text-white">Réseaux Sociaux</h4>
                <div className="flex gap-4 mt-3">
                  {user.socialLinks?.website && (
                    <a href={user.socialLinks.website} target="_blank" rel="noopener noreferrer" className="p-3 bg-gray-700/60 hover:bg-cyan-500/20 text-cyan-400 rounded-lg transition-colors" aria-label="Site Web">
                      <Icon name="link" className="w-6 h-6" />
                    </a>
                  )}
                  {user.socialLinks?.instagram && (
                    <a href={user.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="p-3 bg-gray-700/60 hover:bg-purple-500/20 text-purple-400 rounded-lg transition-colors" aria-label="Instagram">
                      <Icon name="instagram" className="w-6 h-6" />
                    </a>
                  )}
                </div>
             </div>
           )}
           <div>
             <h4 className="text-xl font-semibold text-white mb-4">Portfolio</h4>
             {user.portfolio.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {user.portfolio.map((item, index) =>
                    item.type === 'image' ? (
                      <img 
                        key={index} 
                        src={item.url} 
                        alt={`Portfolio image ${index + 1}`} 
                        className="rounded-lg object-cover w-full h-40 hover:scale-105 transition-transform duration-300 cursor-zoom-in" 
                        onClick={() => setFullScreenMedia(item)}
                      />
                    ) : (
                      <div key={index} onClick={() => setFullScreenMedia(item)} className="relative block group rounded-lg overflow-hidden cursor-pointer">
                        <img src={item.thumbnailUrl || item.url} alt={`Portfolio video thumbnail ${index + 1}`} className="rounded-lg object-cover w-full h-40 group-hover:scale-105 transition-transform duration-300" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <div className="w-14 h-14 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Icon name="play" className="w-8 h-8 text-white ml-1" />
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
             ) : (
                <p className="text-gray-500 text-center py-4 bg-gray-800 rounded-lg border border-gray-700">Le portfolio de cet utilisateur est vide.</p>
             )}
           </div>
            <div>
             <h4 className="text-xl font-semibold text-white mb-4">Avis ({totalReviews})</h4>
             <div className="space-y-4">
                {user.reviews && user.reviews.length > 0 ? (
                    user.reviews.map(review => {
                        const author = allUsers.find(u => u.id === review.authorId) ?? { name: 'Utilisateur', avatarUrl: ''};
                        return (
                            <div key={review.id} className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                                <div className="flex items-start gap-3">
                                    <img src={author.avatarUrl} alt={author.name} className="w-10 h-10 rounded-full object-cover" />
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center">
                                            <h5 className="font-semibold text-white">{author.name}</h5>
                                            <div className="flex items-center gap-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <Icon key={i} name="star" className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-600'}`} />
                                                ))}
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-300 mt-1">{review.comment}</p>
                                    </div>
                                </div>
                            </div>
                        )
                    })
                ) : (
                    <p className="text-gray-500 text-center py-4">Aucun avis pour le moment.</p>
                )}
             </div>
           </div>
           <AIMatchmaker viewedUser={user} />
        </div>
      </div>
    </div>
  );
};

export default ProfileDetail;
