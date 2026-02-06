
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

  const totalReviews = user.reviews?.length || 0;
  const averageRating = totalReviews > 0
    ? (user.reviews!.reduce((acc, review) => acc + review.rating, 0) / totalReviews)
    : user.rating;
    
  const hasSocialLinks = user.socialLinks && (user.socialLinks.website || user.socialLinks.instagram);

  return (
    <div className="flex flex-col h-full bg-[#050B14] relative overflow-hidden">
      {/* Contenu Scrollable */}
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
                  className="rounded-[2.5rem] w-full aspect-square object-cover shadow-2xl border border-white/5 cursor-pointer" 
                  onClick={() => setFullScreenMedia({ type: 'image', url: user.avatarUrl })}
                />
                <div className="absolute top-4 left-4 flex flex-wrap gap-2 max-w-[90%]">
                    {user.types?.map((type, i) => (
                        <div key={i} className="px-3 py-1 bg-[#D2B48C] text-[#050B14] text-[8px] font-black rounded-lg uppercase tracking-widest shadow-xl">
                            {type}
                        </div>
                    ))}
                    {user.isPro && <div className="px-3 py-1 bg-white/10 backdrop-blur-md text-white text-[8px] font-black rounded-lg uppercase tracking-widest border border-white/10 shadow-xl">PRO</div>}
                    {user.isPremium && <div className="px-3 py-1 bg-purple-600/20 backdrop-blur-md text-white text-[8px] font-black rounded-lg uppercase tracking-widest border border-purple-500/10 shadow-xl">PREMIUM</div>}
                </div>
              </div>

              {/* Infos Desktop Only (Cachées sur mobile car déportées dans la barre fixe) */}
              <div className="hidden md:block mt-6 space-y-4">
                <div className="bg-[#0D1625] p-6 rounded-[2rem] border border-white/5">
                  <h3 className="text-2xl font-black text-white uppercase tracking-tighter">{user.name}</h3>
                  <p className="text-[#D2B48C] text-xs font-bold uppercase tracking-widest mt-1">{user.headline}</p>
                  <div className="flex items-center gap-2 mt-4">
                    <Icon name="star" className="w-5 h-5 text-[#D2B48C] fill-current" />
                    <span className="font-black text-white">{averageRating.toFixed(1)}</span>
                    <span className="text-slate-500 text-xs font-bold uppercase ml-1">({totalReviews} avis)</span>
                  </div>
                  <div className="mt-6 pt-6 border-t border-white/5">
                    <p className="text-3xl font-black text-white tracking-tighter">${user.rate}<span className="text-sm font-bold text-slate-500 uppercase tracking-widest ml-1">/h</span></p>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  {!isOwnProfile && (
                    <button onClick={() => handleStartChat(user.id)} className="w-full bg-white text-[#050B14] font-black py-4 rounded-2xl uppercase tracking-widest text-xs hover:bg-[#D2B48C] transition-all">
                      Envoyer un message
                    </button>
                  )}
                  {!isOwnProfile && (
                    <button onClick={() => setBookingUser(user)} className="w-full bg-[#D2B48C] text-[#050B14] font-black py-4 rounded-2xl uppercase tracking-widest text-xs shadow-lg shadow-[#D2B48C]/20 hover:scale-[1.02] transition-all">
                      Réserver maintenant
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-10">
              <section>
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">Biographie</h4>
                <p className="text-slate-300 leading-relaxed text-sm">{user.bio}</p>
              </section>

              {hasSocialLinks && (
                <section>
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">Réseaux</h4>
                  <div className="flex gap-4">
                    {user.socialLinks?.website && (
                      <a href={user.socialLinks.website} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-[#1A2536] border border-white/5 rounded-xl flex items-center justify-center text-[#D2B48C] hover:bg-[#D2B48C] hover:text-[#050B14] transition-all">
                        <Icon name="link" className="w-5 h-5" />
                      </a>
                    )}
                    {user.socialLinks?.instagram && (
                      <a href={user.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-[#1A2536] border border-white/5 rounded-xl flex items-center justify-center text-[#D2B48C] hover:bg-[#D2B48C] hover:text-[#050B14] transition-all">
                        <Icon name="instagram" className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                </section>
              )}

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

              <AIMatchmaker viewedUser={user} />
            </div>
          </div>
        </div>
      </div>

      {/* Barre d'action fixe MOBILE */}
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
