
import React from 'react';
import type { User, Review } from '../types';
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
  const { currentUser, startChat } = useUser();
  const { setBookingUser, setFullScreenMedia, selectThread } = useAppContext();

  const isUserFavorite = isFavorite(user.id);
  const isOwnProfile = user.id === currentUser.id;

  const handleFavoriteClick = (e?: React.MouseEvent) => {
    e?.stopPropagation();
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

  const reviews = user.reviews || [];
  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length)
    : user.rating;

  return (
    <div className="flex flex-col h-full bg-[#050B14] relative overflow-hidden">
      <div className="flex-1 overflow-y-auto no-scrollbar pb-32">
        <div className="p-5 md:p-8 animate-fade-in">
          <button onClick={onBack} className="mb-6 text-[#D2B48C] hover:opacity-80 flex items-center gap-2 font-black uppercase tracking-widest text-[10px]">
            <Icon name="chevronRight" className="w-4 h-4 rotate-180" /> Retour
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <div className="relative group">
                <img 
                  src={user.avatarUrl} 
                  alt={user.name} 
                  className="rounded-[2.5rem] w-full aspect-square object-cover shadow-2xl border border-white/5" 
                />
                <div className="absolute top-4 left-4 flex flex-wrap gap-2 max-w-[90%]">
                    <div className="px-3 py-1 bg-white/10 backdrop-blur-md text-white text-[8px] font-black rounded-lg uppercase tracking-widest border border-white/10 shadow-xl">
                        {user.completedShootsCount} Shoots certifiés
                    </div>
                </div>
              </div>

              <div className="mt-6 bg-[#0D1625] p-6 rounded-[2rem] border border-white/5 space-y-4">
                  <h3 className="text-2xl font-black text-white uppercase tracking-tighter">{user.name}</h3>
                  <div className="flex items-center gap-2">
                    <Icon name="star" className="w-5 h-5 text-[#D2B48C] fill-current" />
                    <span className="font-black text-white">{averageRating.toFixed(1)}</span>
                    <span className="text-slate-500 text-xs font-bold uppercase ml-1">({reviews.length} avis)</span>
                  </div>
                  <div className="pt-4 border-t border-white/5">
                    <p className="text-3xl font-black text-white tracking-tighter">${user.rate}<span className="text-sm font-bold text-slate-500 uppercase tracking-widest ml-1">/h</span></p>
                  </div>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-10">
              <section>
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">Biographie</h4>
                <p className="text-slate-300 leading-relaxed text-sm">{user.bio}</p>
              </section>

              <section>
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">Avis Clients</h4>
                <div className="space-y-4">
                    {reviews.length > 0 ? reviews.map(review => (
                        <div key={review.id} className="bg-[#0D1625] p-5 rounded-2xl border border-white/5">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <p className="text-white font-bold text-sm">{review.authorName}</p>
                                    <p className="text-[10px] text-gray-500 uppercase font-black">{review.timestamp}</p>
                                </div>
                                <div className="flex gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Icon key={i} name="star" className={`w-3 h-3 ${i < review.rating ? 'text-[#D2B48C] fill-current' : 'text-gray-700'}`} />
                                    ))}
                                </div>
                            </div>
                            <p className="text-gray-300 text-xs leading-relaxed italic">"{review.comment}"</p>
                        </div>
                    )) : (
                        <p className="text-xs text-gray-500 italic">Aucun avis pour le moment. Soyez le premier à réserver !</p>
                    )}
                </div>
              </section>

              <section>
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">Portfolio</h4>
                <div className="grid grid-cols-2 gap-4">
                  {user.portfolio.map((item, index) => (
                    <div 
                      key={index} 
                      onClick={() => setFullScreenMedia(item)}
                      className="aspect-square rounded-2xl overflow-hidden border border-white/5 bg-[#1A2536] cursor-zoom-in group"
                    >
                      <img 
                        src={item.type === 'image' ? item.url : (item.thumbnailUrl || item.url)} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>

      {!isOwnProfile && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0D1625]/90 backdrop-blur-2xl border-t border-white/5 p-4 pb-[env(safe-area-inset-bottom)] z-[200] flex items-center gap-4 animate-slide-up">
            <button
              onClick={handleFavoriteClick}
              className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all ${isUserFavorite ? 'bg-red-500/10 border-red-500 text-red-500' : 'bg-white/5 border-white/10 text-slate-400'}`}
            >
              <Icon name="heart" className={`w-6 h-6 ${isUserFavorite ? 'fill-current' : ''}`} />
            </button>
            <button 
              onClick={() => setBookingUser(user)}
              className="flex-1 bg-[#D2B48C] text-[#050B14] h-14 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-[#D2B48C]/10 active:scale-95 transition-all"
            >
              Réserver • ${user.rate}/h
            </button>
            <button 
              onClick={() => handleStartChat(user.id)}
              className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-white"
            >
              <Icon name="message" className="w-6 h-6" />
            </button>
        </div>
      )}
    </div>
  );
};

export default ProfileDetail;
