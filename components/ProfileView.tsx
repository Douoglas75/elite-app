
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
          
          <div className="flex items-center gap-3 mt-4">
             <div className="px-4 py-1.5 bg-[#D2B48C]/10 border border-[#D2B48C]/20 rounded-full flex items-center gap-2">
                <Icon name="check" className="w-3 h-3 text-[#D2B48C]" />
                <span className="text-[10px] font-black text-[#D2B48C] uppercase tracking-widest">{user.completedShootsCount || 0} Shoots certifiés</span>
             </div>
          </div>

          <div className="flex items-center gap-3 mt-4 bg-white/5 px-4 py-1.5 rounded-full border border-white/5">
              <span className="text-[#D2B48C] font-black text-sm">${user.rate || 0}/h</span>
              <span className="w-1 h-1 bg-gray-700 rounded-full"></span>
              <span className="text-gray-500 text-[9px] font-black uppercase tracking-widest">{user.availableDays?.length || 0} Jours actifs</span>
          </div>
          
          <div className="flex gap-2 mt-6">
            <button onClick={() => setEditingProfile(true)} className="px-8 py-3 bg-[#D2B48C] rounded-2xl text-[10px] font-black text-[#050B14] hover:brightness-110 transition-all uppercase tracking-widest shadow-lg shadow-[#D2B48C]/10">Réglages Business</button>
          </div>
        </div>

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
      </div>
    </div>
  );
};

export default memo(ProfileView);
