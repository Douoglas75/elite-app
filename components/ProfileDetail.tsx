
import React from 'react';
import type { User, Review } from '../types';
import Icon from './Icon';
import { useFavorites } from '../contexts/FavoritesContext';
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

  const reviews = user.reviews || [];

  return (
    <div className="flex flex-col h-full bg-[#050B14] animate-fade-in relative">
      <div className="flex-1 overflow-y-auto no-scrollbar pb-32">
        {/* Banner with Back Button */}
        <div className="relative h-[40vh] md:h-[50vh]">
            <img src={user.portfolio[0]?.url || user.avatarUrl} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050B14] via-transparent to-black/20" />
            <button onClick={onBack} className="absolute top-8 left-6 p-4 bg-black/40 backdrop-blur-xl rounded-2xl text-white active:scale-90 transition-all border border-white/10">
                <Icon name="chevronRight" className="w-6 h-6 rotate-180" />
            </button>
            <div className="absolute bottom-8 left-8 right-8">
                <div className="flex flex-wrap gap-2 mb-4">
                    {user.types.map(t => <span key={t} className="px-4 py-1.5 bg-[#D2B48C] text-[#050B14] rounded-lg text-[10px] font-black uppercase tracking-widest">{t}</span>)}
                    <span className="px-4 py-1.5 bg-white/10 backdrop-blur-md text-white border border-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                        <Icon name="check" className="w-3 h-3 text-cyan-400" /> {user.completedShootsCount} Shoots certifiés
                    </span>
                </div>
                <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter">{user.name}</h1>
                <p className="text-slate-400 font-bold uppercase tracking-[0.2em] mt-2 text-sm md:text-base">{user.headline}</p>
            </div>
        </div>

        <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-12 max-w-7xl mx-auto w-full">
            <div className="lg:col-span-2 space-y-12">
                <section>
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6">Manifeste Artistique</h3>
                    <p className="text-slate-300 text-lg leading-relaxed">{user.bio}</p>
                </section>

                <section>
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6">Portfolio Elite</h3>
                    <div className="grid grid-cols-2 gap-4">
                        {user.portfolio.map((item, idx) => (
                            <div key={idx} onClick={() => setFullScreenMedia(item)} className="aspect-square rounded-3xl overflow-hidden bg-white/5 border border-white/5 cursor-zoom-in group">
                                <img src={item.url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                            </div>
                        ))}
                    </div>
                </section>

                <section>
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6">Avis Clients Certifiés</h3>
                    <div className="space-y-4">
                        {reviews.length > 0 ? reviews.map(r => (
                            <div key={r.id} className="bg-[#0D1625] p-6 rounded-3xl border border-white/5 shadow-xl">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-[#D2B48C]/20 rounded-full flex items-center justify-center font-black text-[#D2B48C]">{r.authorName.charAt(0)}</div>
                                        <div><p className="text-white font-black text-sm">{r.authorName}</p><p className="text-[10px] text-slate-500 font-bold uppercase">{r.timestamp}</p></div>
                                    </div>
                                    <div className="flex gap-1">
                                        {[...Array(5)].map((_, i) => <Icon key={i} name="star" className={`w-3 h-3 ${i < r.rating ? 'text-[#D2B48C] fill-[#D2B48C]' : 'text-slate-700'}`} />)}
                                    </div>
                                </div>
                                <p className="text-slate-300 italic text-sm leading-relaxed">"{r.comment}"</p>
                            </div>
                        )) : <p className="text-slate-500 italic text-sm">Pas encore d'avis. Devenez le premier à collaborer.</p>}
                    </div>
                </section>
            </div>

            <div className="lg:col-span-1 space-y-6">
                <div className="bg-[#0D1625] p-8 rounded-[3rem] border border-white/10 sticky top-24 shadow-2xl">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Note Globale</p>
                            <div className="flex items-center gap-2 mt-1">
                                <Icon name="star" className="w-6 h-6 text-[#D2B48C] fill-[#D2B48C]" />
                                <span className="text-2xl font-black text-white">{user.rating.toFixed(1)}</span>
                            </div>
                        </div>
                        <div className="text-right">
                             <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tarif</p>
                             <p className="text-3xl font-black text-white mt-1">${user.rate}<span className="text-sm text-[#D2B48C] ml-1">/h</span></p>
                        </div>
                    </div>
                    
                    <button onClick={() => setBookingUser(user)} className="w-full bg-[#D2B48C] text-[#050B14] h-16 rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-[#D2B48C]/10 active:scale-95 transition-all mb-4">Réserver Maintenant</button>
                    <button onClick={() => { const tid = startChat(user.id); selectThread(tid); }} className="w-full bg-white/5 border border-white/10 text-white h-16 rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-white/10 transition-all flex items-center justify-center gap-3">
                        <Icon name="message" className="w-5 h-5" /> Envoyer un message
                    </button>
                    
                    <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-center gap-8">
                        <button onClick={() => isFavorite(user.id) ? removeFavorite(user.id) : addFavorite(user.id)} className={`flex flex-col items-center gap-2 group`}>
                            <Icon name="heart" className={`w-6 h-6 transition-all ${isFavorite(user.id) ? 'text-red-500 fill-red-500' : 'text-slate-500 group-hover:text-white'}`} />
                            <span className="text-[8px] font-black uppercase text-slate-500">Favori</span>
                        </button>
                        <button className="flex flex-col items-center gap-2 group">
                             <Icon name="link" className="w-6 h-6 text-slate-500 group-hover:text-white transition-colors" />
                             <span className="text-[8px] font-black uppercase text-slate-500">Partager</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileDetail;
