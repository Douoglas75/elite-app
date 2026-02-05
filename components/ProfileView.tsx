
import React, { useRef, memo, useState } from 'react';
import Icon from './Icon';
import { useUser } from '../contexts/UserContext';
import { useAppContext } from '../contexts/AppContext';
import type { PortfolioItem } from '../types';

const ProfileView: React.FC = () => {
  const { currentUser: user, logout, updateCurrentUser } = useUser();
  const { setOnboardingOpen, setEditingProfile, setActiveSubView, setFullScreenMedia } = useAppContext();
  const mediaInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const toggleLive = () => {
    updateCurrentUser({ isAvailableNow: !user.isAvailableNow });
  };

  const handleResetApp = () => {
    if (confirm("Attention : Cela va effacer toutes vos données locales et vous déconnecter pour réinitialiser l'expérience Elite. Continuer ?")) {
        localStorage.clear();
        window.location.reload();
    }
  };

  const handleMediaImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const filesList = e.target.files;
    if (!filesList || filesList.length === 0) return;
    
    setIsUploading(true);
    const newItems: PortfolioItem[] = [];

    for (let i = 0; i < filesList.length; i++) {
        const file = filesList[i];
        const isVideo = file.type.startsWith('video/');
        const mediaUrl = URL.createObjectURL(file);

        if (isVideo) {
            newItems.push({
                type: 'video',
                url: mediaUrl,
                thumbnailUrl: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=400'
            });
        } else {
            newItems.push({
                type: 'image',
                url: mediaUrl
            });
        }
    }

    updateCurrentUser({ portfolio: [...user.portfolio, ...newItems] });
    setIsUploading(false);
    if (mediaInputRef.current) mediaInputRef.current.value = '';
  };

  const removeMedia = (index: number) => {
    const newPortfolio = [...user.portfolio];
    newPortfolio.splice(index, 1);
    updateCurrentUser({ portfolio: newPortfolio });
  };

  return (
    <div className="flex flex-col h-full bg-[#050B14] animate-view-transition pb-24 overflow-y-auto no-scrollbar">
      <header className="p-6 border-b border-white/5 flex justify-between items-center bg-[#050B14]/80 backdrop-blur-md sticky top-0 z-10">
        <h1 className="text-2xl font-black text-white uppercase tracking-tighter">Mon Espace</h1>
        <button onClick={logout} className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-all"><Icon name="close" /></button>
      </header>

      <div className="p-6 space-y-8">
        <div className="flex flex-col items-center text-center">
          <div className="relative group">
            <img src={user.avatarUrl} className="w-28 h-28 rounded-3xl object-cover border-4 border-[#D2B48C]/20 shadow-2xl" />
            {user.isPro && <div className="absolute -bottom-2 -right-2 bg-[#D2B48C] text-[#050B14] text-[10px] font-black px-3 py-1 rounded-lg border-4 border-[#050B14]">PRO</div>}
          </div>
          <h2 className="mt-4 text-2xl font-black text-white uppercase tracking-tight">{user.name}</h2>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-widest opacity-60">{user.headline}</p>
          <div className="flex gap-2 mt-4">
            <button onClick={() => setEditingProfile(true)} className="px-6 py-2 bg-[#1A2536] border border-white/10 rounded-xl text-[10px] font-black text-[#D2B48C] hover:bg-[#253247] transition-all uppercase tracking-widest">Éditer Profil</button>
          </div>
        </div>

        {user.isPro && (
            <div className={`p-5 rounded-2xl border transition-all flex items-center justify-between ${user.isAvailableNow ? 'bg-red-600/10 border-red-500/30' : 'bg-[#1A2536] border-white/5'}`}>
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${user.isAvailableNow ? 'bg-red-600 animate-pulse shadow-lg shadow-red-500/40' : 'bg-[#0D1625]'}`}>
                        <Icon name="bolt" className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h4 className={`font-black text-[10px] uppercase tracking-widest ${user.isAvailableNow ? 'text-red-400' : 'text-slate-500'}`}>Mode Live SOS</h4>
                        <p className="text-[10px] text-slate-600 font-bold uppercase">Visible sur la carte</p>
                    </div>
                </div>
                <button onClick={toggleLive} className={`w-14 h-8 rounded-full p-1 transition-all ${user.isAvailableNow ? 'bg-red-600' : 'bg-slate-700'}`}>
                    <div className={`w-6 h-6 bg-white rounded-full transition-all transform ${user.isAvailableNow ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
            </div>
        )}

        <div className="grid grid-cols-2 gap-4">
            <button onClick={() => setActiveSubView('payment')} className="p-4 bg-[#1A2536] border border-white/5 rounded-2xl text-left space-y-2 hover:border-[#D2B48C]/50 transition-all">
                <Icon name="creditCard" className="w-6 h-6 text-[#D2B48C]" />
                <p className="text-[10px] font-black text-white uppercase tracking-tighter">Finance & Escrow</p>
            </button>
            <button onClick={() => setActiveSubView('moodboard')} className="p-4 bg-[#1A2536] border border-white/5 rounded-2xl text-left space-y-2 hover:border-cyan-500/50 transition-all">
                <Icon name="grid" className="w-6 h-6 text-cyan-400" />
                <p className="text-[10px] font-black text-white uppercase tracking-tighter">Moodboards</p>
            </button>
        </div>

        <section>
          <div className="flex justify-between items-end mb-4">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Portfolio Professionnel</h3>
            <button 
                onClick={() => mediaInputRef.current?.click()} 
                disabled={isUploading}
                className="text-[10px] font-black text-[#D2B48C] uppercase flex items-center gap-1"
            >
                {isUploading ? 'Upload...' : 'Ajouter +'}
            </button>
            <input 
                type="file" 
                ref={mediaInputRef} 
                onChange={handleMediaImport} 
                className="hidden" 
                accept="image/*,video/*" 
                multiple
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {user.portfolio.map((item, i) => (
              <div key={i} className="aspect-square bg-[#0D1625] rounded-2xl overflow-hidden border border-white/5 group relative">
                {item.type === 'image' ? (
                    <img src={item.url} className="w-full h-full object-cover cursor-pointer" onClick={() => setFullScreenMedia(item)} />
                ) : (
                    <div className="w-full h-full relative cursor-pointer" onClick={() => setFullScreenMedia(item)}>
                        <img src={item.thumbnailUrl || item.url} className="w-full h-full object-cover opacity-60" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Icon name="play" className="w-6 h-6 text-white" />
                        </div>
                    </div>
                )}
                <button 
                    onClick={() => removeMedia(i)}
                    className="absolute top-1 right-1 p-1 bg-black/60 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <Icon name="close" className="w-3 h-3 text-white" />
                </button>
              </div>
            ))}
            <button 
                onClick={() => mediaInputRef.current?.click()}
                className="aspect-square bg-white/5 rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-2 hover:border-[#D2B48C]/50 transition-all group"
            >
                <Icon name="plusCircle" className="w-6 h-6 text-slate-700 group-hover:text-[#D2B48C]" />
                <span className="text-[8px] font-black text-slate-700 uppercase group-hover:text-[#D2B48C]">Add Media</span>
            </button>
          </div>
        </section>

        <section className="pt-10 border-t border-white/5">
            <button 
                onClick={handleResetApp}
                className="w-full p-4 bg-red-600/5 border border-red-500/20 rounded-2xl flex items-center justify-center gap-3 group hover:bg-red-600/10 transition-all"
            >
                <Icon name="clock" className="w-5 h-5 text-red-500 opacity-50 group-hover:opacity-100" />
                <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Réinitialiser l'application</span>
            </button>
            <p className="text-[9px] text-slate-700 text-center mt-4 font-bold uppercase tracking-tighter">Elite Edition v1.2.0 • Build 2025</p>
        </section>
      </div>
    </div>
  );
};

export default memo(ProfileView);
