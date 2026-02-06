
import React, { useRef, memo, useState } from 'react';
import Icon from './Icon';
import { useUser } from '../contexts/UserContext';
import { useAppContext } from '../contexts/AppContext';
import { UserType, type PortfolioItem } from '../types';

const ProfileView: React.FC = () => {
  const { currentUser: user, logout, updateCurrentUser } = useUser();
  const { setEditingProfile, setActiveSubView, setFullScreenMedia, setActiveTab } = useAppContext();
  const mediaInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const toggleLive = () => {
    updateCurrentUser({ isAvailableNow: !user.isAvailableNow });
  };

  const toggleRole = (role: UserType) => {
    const currentRoles = user.types || [];
    const newRoles = currentRoles.includes(role)
        ? currentRoles.filter(r => r !== role)
        : [...currentRoles, role];
    
    if (newRoles.length === 0) return;
    updateCurrentUser({ types: newRoles });
  };

  const handleResetApp = () => {
    if (confirm("Réinitialiser l'application ? (Efface tout)")) {
        localStorage.clear();
        window.location.reload();
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (e) => reject(e);
    });
  };

  const handleMediaImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const filesList = e.target.files;
    if (!filesList || filesList.length === 0) return;
    
    setIsUploading(true);
    const newItems: PortfolioItem[] = [];

    try {
        for (let i = 0; i < filesList.length; i++) {
            const file = filesList[i];
            const isVideo = file.type.startsWith('video/');
            const base64Data = await fileToBase64(file);

            newItems.push({
                type: isVideo ? 'video' : 'image',
                url: base64Data,
                thumbnailUrl: isVideo ? 'https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=400' : undefined
            });
        }

        const updatedPortfolio = [...(user.portfolio || []), ...newItems];
        updateCurrentUser({ portfolio: updatedPortfolio });
    } catch (err) {
        console.error("Upload Error:", err);
        alert("Certains fichiers sont trop lourds.");
    } finally {
        setIsUploading(false);
        if (mediaInputRef.current) mediaInputRef.current.value = '';
    }
  };

  const removeMedia = (index: number) => {
    const newPortfolio = [...(user.portfolio || [])];
    newPortfolio.splice(index, 1);
    updateCurrentUser({ portfolio: newPortfolio });
  };

  return (
    <div className="flex flex-col h-full bg-[#050B14] pb-6 overflow-y-auto no-scrollbar animate-view-transition">
      <header className="p-4 md:p-6 border-b border-white/5 flex items-center gap-4 bg-[#0D1625]/80 backdrop-blur-md sticky top-0 z-[100]">
        <button onClick={() => setActiveTab('discover')} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-[#D2B48C] transition-all">
           <Icon name="chevronRight" className="w-5 h-5 rotate-180" />
        </button>
        <h1 className="flex-1 text-xl font-black text-white uppercase tracking-tighter">Mon Studio</h1>
        <button onClick={logout} className="p-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-all">
          <Icon name="close" />
        </button>
      </header>

      <div className="p-6 space-y-8 max-w-2xl mx-auto w-full">
        <div className="flex flex-col items-center text-center">
          <div className="relative group">
            <img src={user.avatarUrl} className="w-28 h-28 rounded-[2.5rem] object-cover border-4 border-[#D2B48C]/20 shadow-2xl" alt="Profile" />
            {user.isPro && <div className="absolute -bottom-2 -right-2 bg-[#D2B48C] text-[#050B14] text-[10px] font-black px-3 py-1 rounded-lg border-4 border-[#050B14]">PRO</div>}
          </div>
          <h2 className="mt-4 text-2xl font-black text-white uppercase tracking-tight">{user.name}</h2>
          <div className="flex items-center gap-3 mt-2 bg-white/5 px-4 py-1.5 rounded-full border border-white/5">
              <span className="text-[#D2B48C] font-black text-sm">${user.rate || 0}/h</span>
              <span className="w-1 h-1 bg-gray-700 rounded-full"></span>
              <span className="text-gray-500 text-[9px] font-black uppercase tracking-widest">{user.availableDays?.length || 0} Jours actifs</span>
          </div>
          
          <div className="flex gap-2 mt-6">
            <button onClick={() => setEditingProfile(true)} className="px-8 py-3 bg-[#D2B48C] rounded-2xl text-[10px] font-black text-[#050B14] hover:brightness-110 transition-all uppercase tracking-widest shadow-lg shadow-[#D2B48C]/10">Réglages Business</button>
          </div>
        </div>

        {/* Section Planning résumé */}
        {user.availableDays && user.availableDays.length > 0 && (
            <div className="bg-[#0D1625] p-5 rounded-[2rem] border border-white/5">
                <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                    <Icon name="calendar" className="w-4 h-4 text-cyan-400" />
                    Planning Hebdomadaire
                </h3>
                <div className="flex flex-wrap gap-2">
                    {user.availableDays.map(day => (
                        <span key={day} className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-lg text-[10px] text-cyan-400 font-bold uppercase">{day}</span>
                    ))}
                </div>
            </div>
        )}

        {/* Section Spécialités Multi-choix */}
        <section className="bg-[#0D1625] p-5 rounded-[2rem] border border-white/5 space-y-4">
            <div className="flex items-center gap-2 mb-2">
                <Icon name="sparkles" className="w-4 h-4 text-[#D2B48C]" />
                <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Spécialités Visibles</h3>
            </div>
            <div className="grid grid-cols-3 gap-2">
                {[UserType.Photographer, UserType.Videographer, UserType.Model].map(role => {
                    const isActive = user.types?.includes(role);
                    return (
                        <button
                            key={role}
                            onClick={() => toggleRole(role)}
                            className={`py-3 rounded-2xl border transition-all text-[9px] font-black uppercase tracking-tighter ${
                                isActive 
                                ? 'bg-[#D2B48C] border-[#D2B48C] text-[#050B14] shadow-lg shadow-[#D2B48C]/20' 
                                : 'bg-[#1A2536] border-white/5 text-slate-500 hover:border-white/30'
                            }`}
                        >
                            {role === UserType.Photographer ? 'Photo' : role === UserType.Videographer ? 'Vidéo' : 'Modèle'}
                        </button>
                    )
                })}
            </div>
        </section>

        {user.isPro && (
            <div className={`p-5 rounded-[2rem] border transition-all flex items-center justify-between ${user.isAvailableNow ? 'bg-red-600/10 border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.1)]' : 'bg-[#1A2536] border-white/5'}`}>
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-[1.2rem] flex items-center justify-center ${user.isAvailableNow ? 'bg-red-600 animate-pulse shadow-lg shadow-red-500/40' : 'bg-[#0D1625]'}`}>
                        <Icon name="bolt" className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h4 className={`font-black text-[10px] uppercase tracking-widest ${user.isAvailableNow ? 'text-red-400' : 'text-slate-500'}`}>Mode Live Broadcast</h4>
                        <p className="text-[10px] text-slate-600 font-bold uppercase">Signal GPS prioritaire</p>
                    </div>
                </div>
                <button onClick={toggleLive} className={`w-14 h-8 rounded-full p-1 transition-all ${user.isAvailableNow ? 'bg-red-600' : 'bg-slate-700'}`}>
                    <div className={`w-6 h-6 bg-white rounded-full transition-all transform ${user.isAvailableNow ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
            </div>
        )}

        <div className="grid grid-cols-2 gap-4">
            <button onClick={() => setActiveSubView('payment')} className="p-4 bg-[#1A2536] border border-white/5 rounded-2xl text-left space-y-2 hover:border-[#D2B48C]/50 transition-all active:scale-95">
                <Icon name="creditCard" className="w-6 h-6 text-[#D2B48C]" />
                <p className="text-[10px] font-black text-white uppercase tracking-tighter">Finance & Escrow</p>
            </button>
            <button onClick={() => setActiveSubView('moodboard')} className="p-4 bg-[#1A2536] border border-white/5 rounded-2xl text-left space-y-2 hover:border-cyan-500/50 transition-all active:scale-95">
                <Icon name="grid" className="w-6 h-6 text-cyan-400" />
                <p className="text-[10px] font-black text-white uppercase tracking-tighter">Moodboards</p>
            </button>
        </div>

        <section>
          <div className="flex justify-between items-end mb-4">
            <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Galerie de Référence</h3>
            <button onClick={() => mediaInputRef.current?.click()} disabled={isUploading} className="text-[10px] font-black text-[#D2B48C] uppercase flex items-center gap-1 active:scale-90 transition-all">
                {isUploading ? 'Flux...' : 'Upload +'}
            </button>
            <input type="file" ref={mediaInputRef} onChange={handleMediaImport} className="hidden" accept="image/*,video/*" multiple />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {user.portfolio?.map((item, i) => (
              <div key={i} className="aspect-square bg-[#0D1625] rounded-2xl overflow-hidden border border-white/5 group relative">
                <img 
                    src={item.type === 'video' ? (item.thumbnailUrl || item.url) : item.url} 
                    className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform" 
                    onClick={() => setFullScreenMedia(item)} 
                    alt="Portfolio item"
                />
                <button onClick={() => removeMedia(i)} className="absolute top-1.5 right-1.5 p-1.5 bg-black/60 rounded-lg text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity">
                    <Icon name="close" className="w-3 h-3" />
                </button>
              </div>
            ))}
            {!isUploading && (
                <button onClick={() => mediaInputRef.current?.click()} className="aspect-square bg-white/5 rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-2 hover:border-[#D2B48C]/50 transition-all">
                    <Icon name="plusCircle" className="w-6 h-6 text-slate-700" />
                    <span className="text-[8px] font-black text-slate-700 uppercase">Importer</span>
                </button>
            )}
          </div>
        </section>

        <section className="pt-10 border-t border-white/5">
            <button onClick={handleResetApp} className="w-full p-4 bg-red-600/5 border border-red-500/10 rounded-2xl flex items-center justify-center gap-3 group transition-all active:bg-red-600/20">
                <Icon name="clock" className="w-5 h-5 text-red-500" />
                <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Reset Application</span>
            </button>
        </section>
      </div>
    </div>
  );
};

export default memo(ProfileView);
