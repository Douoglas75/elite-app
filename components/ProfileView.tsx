
import React, { useRef, memo, useState } from 'react';
import Icon from './Icon';
import { useUser } from '../contexts/UserContext';
import { useAppContext } from '../contexts/AppContext';
import { UserType, type PortfolioItem } from '../types';

const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

const ProfileView: React.FC = () => {
  const { currentUser: user, logout, deleteAccount, updateCurrentUser } = useUser();
  const { setEditingProfile, setFullScreenMedia, setActiveTab } = useAppContext();
  const portfolioInputRef = useRef<HTMLInputElement>(null);
  
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const toggleDay = (day: string) => {
    const currentDays = user.availableDays || [];
    const newDays = currentDays.includes(day)
        ? currentDays.filter(d => d !== day)
        : [...currentDays, day];
    updateCurrentUser({ availableDays: newDays });
  };

  const handleAddMedia = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const newItems: PortfolioItem[] = [];
    
    Array.from(files).forEach((file: File) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            newItems.push({
                type: file.type.startsWith('video') ? 'video' : 'image',
                url: event.target?.result as string
            });

            if (newItems.length === files.length) {
                updateCurrentUser({ portfolio: [...(user.portfolio || []), ...newItems] });
                setIsUploading(false);
            }
        };
        reader.readAsDataURL(file);
    });
  };

  const removeMedia = (index: number) => {
    if (confirm("Supprimer ce média de votre portfolio ?")) {
        const newPortfolio = [...(user.portfolio || [])];
        newPortfolio.splice(index, 1);
        updateCurrentUser({ portfolio: newPortfolio });
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#050B14] pb-6 overflow-y-auto no-scrollbar animate-view-transition">
      <header className="p-4 md:p-6 border-b border-white/5 flex items-center gap-4 bg-[#0D1625]/80 backdrop-blur-md sticky top-0 z-[100]">
        <button onClick={() => setActiveTab('discover')} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-[#D2B48C] transition-all">
           <Icon name="chevronRight" className="w-5 h-5 rotate-180" />
        </button>
        <h1 className="flex-1 text-xl font-black text-white uppercase tracking-tighter">Mon Studio Elite</h1>
      </header>

      <div className="p-6 space-y-8 max-w-2xl mx-auto w-full pb-32">
        {/* Profile Header */}
        <div className="flex flex-col items-center text-center">
          <div className="relative group">
            <img src={user.avatarUrl} className="w-32 h-32 rounded-[3rem] object-cover border-4 border-[#D2B48C]/20 shadow-2xl transition-transform duration-500 group-hover:scale-105" alt="Profile" />
            <div className={`absolute -bottom-1 -right-1 w-8 h-8 rounded-full border-4 border-[#050B14] shadow-xl ${user.isAvailableNow ? 'bg-green-500' : 'bg-slate-700'}`} />
          </div>
          <h2 className="mt-6 text-3xl font-black text-white uppercase tracking-tight">{user.name}</h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-1">{user.headline || 'Talent Elite'}</p>
          
          <button onClick={() => setEditingProfile(true)} className="mt-8 px-10 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-[#D2B48C] hover:bg-[#D2B48C] hover:text-[#050B14] transition-all uppercase tracking-widest shadow-xl active:scale-95">
            Éditer les Infos Business
          </button>
        </div>

        {/* Portfolio Management */}
        <section className="space-y-6">
            <div className="flex justify-between items-end px-2">
                <div>
                    <h3 className="text-[11px] font-black text-white uppercase tracking-[0.3em]">Portfolio Pro</h3>
                    <p className="text-[9px] text-slate-500 font-bold uppercase mt-1">Images & Vidéos Haute Résolution</p>
                </div>
                <button 
                  onClick={() => portfolioInputRef.current?.click()}
                  disabled={isUploading}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#D2B48C]/10 text-[#D2B48C] rounded-xl border border-[#D2B48C]/20 hover:bg-[#D2B48C]/20 transition-all shadow-lg active:scale-95"
                >
                    {isUploading ? <div className="w-3 h-3 border-2 border-[#D2B48C] border-t-transparent rounded-full animate-spin" /> : <Icon name="plusCircle" className="w-4 h-4" />}
                    <span className="text-[9px] font-black uppercase tracking-widest">Importer</span>
                </button>
                <input type="file" ref={portfolioInputRef} className="hidden" accept="image/*,video/*" multiple onChange={handleAddMedia} />
            </div>

            <div className="grid grid-cols-3 gap-3">
                {user.portfolio?.map((item, idx) => (
                    <div key={idx} className="relative aspect-square rounded-[1.5rem] overflow-hidden bg-white/5 group border border-white/5 shadow-lg">
                        {item.type === 'image' ? (
                             <img src={item.url} className="w-full h-full object-cover cursor-pointer transition-transform duration-700 group-hover:scale-110" onClick={() => setFullScreenMedia(item)} />
                        ) : (
                             <video src={item.url} className="w-full h-full object-cover" />
                        )}
                        <button 
                          onClick={() => removeMedia(idx)}
                          className="absolute top-2 right-2 p-2 bg-black/60 backdrop-blur-md text-red-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Icon name="close" className="w-3 h-3" />
                        </button>
                    </div>
                ))}
                {(!user.portfolio || user.portfolio.length === 0) && (
                    <div className="col-span-3 py-16 border-2 border-dashed border-white/5 rounded-[2.5rem] flex flex-col items-center justify-center opacity-20">
                        <Icon name="grid" className="w-10 h-10 mb-4" />
                        <p className="text-[10px] font-black uppercase tracking-[0.3em]">Aucune création</p>
                    </div>
                )}
            </div>
        </section>

        {/* Availability Calendar */}
        <section className="bg-[#0D1625] p-8 rounded-[3rem] border border-white/5 space-y-6 shadow-2xl">
            <div className="flex items-center gap-3">
                <Icon name="calendar" className="w-5 h-5 text-[#D2B48C]" />
                <h3 className="text-[11px] font-black text-white uppercase tracking-[0.3em]">Calendrier de Disponibilité</h3>
            </div>
            <div className="flex justify-between gap-2">
                {DAYS.map(day => {
                    const isActive = (user.availableDays || []).includes(day);
                    return (
                        <button
                            key={day}
                            onClick={() => toggleDay(day)}
                            className={`flex-1 aspect-square rounded-2xl border font-black text-[10px] uppercase transition-all duration-300 ${isActive ? 'bg-[#D2B48C] border-[#D2B48C] text-[#050B14] shadow-lg shadow-[#D2B48C]/10 scale-105' : 'bg-white/5 border-white/5 text-slate-500 hover:border-white/20'}`}
                        >
                            {day}
                        </button>
                    )
                })}
            </div>
        </section>

        {/* Danger Zone */}
        <section className="pt-12 space-y-6">
            <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.5em] text-center">Gestion Administrative</h3>
            
            <div className="space-y-3">
                <button 
                  onClick={logout}
                  className="w-full py-5 bg-white/5 border border-white/10 rounded-2xl text-[11px] font-black text-white uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-3 shadow-lg"
                >
                    <Icon name="close" className="w-4 h-4 text-slate-400" /> Déconnexion
                </button>

                {!deleteConfirm ? (
                    <button 
                      onClick={() => setDeleteConfirm(true)}
                      className="w-full py-4 text-red-500/30 text-[9px] font-black uppercase tracking-widest hover:text-red-500 transition-colors"
                    >
                        Supprimer mon compte définitivement
                    </button>
                ) : (
                    <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-[2.5rem] space-y-6 animate-scale-in text-center shadow-2xl">
                        <p className="text-red-500 text-[10px] font-black uppercase tracking-widest leading-relaxed">Êtes-vous sûr ? <br/>Toutes vos données seront effacées des serveurs.</p>
                        <div className="flex gap-3">
                            <button 
                              onClick={() => setDeleteConfirm(false)}
                              className="flex-1 py-4 bg-white/5 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest"
                            >
                                Annuler
                            </button>
                            <button 
                              onClick={deleteAccount}
                              className="flex-1 py-4 bg-red-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-red-600/30 active:scale-95"
                            >
                                Supprimer
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </section>
      </div>
    </div>
  );
};

export default memo(ProfileView);
