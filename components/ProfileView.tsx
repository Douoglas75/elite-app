
import React, { useRef, memo, useState } from 'react';
import Icon from './Icon';
import { useUser } from '../contexts/UserContext';
import { useAppContext } from '../contexts/AppContext';
import { UserType, type PortfolioItem } from '../types';

const ProfileView: React.FC = () => {
  const { currentUser: user, logout, updateCurrentUser } = useUser();
  const { setEditingProfile, setActiveSubView, setFullScreenMedia } = useAppContext();
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
    
    // On force au moins un rôle
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
        alert("Certains fichiers sont trop lourds pour le stockage local.");
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
      <header className="p-6 border-b border-white/5 flex justify-between items-center bg-[#050B14]/80 backdrop-blur-md sticky top-0 z-[100]">
        <h1 className="text-2xl font-black text-white uppercase tracking-tighter">Mon Espace</h1>
        <button onClick={logout} className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-all">
          <Icon name="close" />
        </button>
      </header>

      <div className="p-6 space-y-8 max-w-2xl mx-auto w-full">
        <div className="flex flex-col items-center text-center">
          <div className="relative group">
            <img src={user.avatarUrl} className="w-28 h-28 rounded-3xl object-cover border-4 border-[#D2B48C]/20 shadow-2xl" alt="Profile" />
            {user.isPro && <div className="absolute -bottom-2 -right-2 bg-[#D2B48C] text-[#050B14] text-[10px] font-black px-3 py-1 rounded-lg border-4 border-[#050B14]">PRO</div>}
          </div>
          <h2 className="mt-4 text-2xl font-black text-white uppercase tracking-tight">{user.name}</h2>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-widest opacity-60">{user.headline}</p>
          
          <div className="flex gap-2 mt-4">
            <button onClick={() => setEditingProfile(true)} className="px-6 py-2 bg-[#1A2536] border border-white/10 rounded-xl text-[10px] font-black text-[#D2B48C] hover:bg-[#253247] transition-all uppercase tracking-widest">Détails Bio</button>
          </div>
        </div>

        {/* Section Spécialités Multi-choix */}
        <section className="bg-[#0D1625] p-5 rounded-[2.5rem] border border-white/5 space-y-4">
            <div className="flex items-center gap-2 mb-2">
                <Icon name="sparkles" className="w-4 h-4 text-[#D2B48C]" />
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Mes Spécialités (Carte)</h3>
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
                                : 'bg-[#1A2536] border-white/10 text-slate-500 hover:border-white/30'
                            }`}
                        >
                            {role === UserType.Photographer ? 'Photo' : role === UserType.Videographer ? 'Vidéo' : 'Modèle'}
                        </button>
                    )
                })}
            </div>
            <p className="text-[8px] text-slate-600 font-bold uppercase text-center mt-2 tracking-widest">
                Sélectionnez vos rôles pour apparaître sur la carte
            </p>
        </section>

        {user.isPro && (
            <div className={`p-5 rounded-2xl border transition-all flex items-center justify-between ${user.isAvailableNow ? 'bg-red-600/10 border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.1)]' : 'bg-[#1A2536] border-white/5'}`}>
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${user.isAvailableNow ? 'bg-red-600 animate-pulse shadow-lg shadow-red-500/40' : 'bg-[#0D1625]'}`}>
                        <Icon name="bolt" className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h4 className={`font-black text-[10px] uppercase tracking-widest ${user.isAvailableNow ? 'text-red-400' : 'text-slate-500'}`}>Mode Live Broadcast</h4>
                        <p className="text-[10px] text-slate-600 font-bold uppercase">Visible en temps réel</p>
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
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Portfolio Personnel</h3>
            <button onClick={() => mediaInputRef.current?.click()} disabled={isUploading} className="text-[10px] font-black text-[#D2B48C] uppercase flex items-center gap-1 active:scale-90 transition-all">
                {isUploading ? 'Chargement...' : 'Ajouter +'}
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
                <button onClick={() => removeMedia(i)} className="absolute top-1 right-1 p-1 bg-black/60 rounded-lg text-white">
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
