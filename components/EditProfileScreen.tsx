
import React, { useState, useRef } from 'react';
import Icon from './Icon';
import { UserType, type User } from '../types';
import { useUser } from '../contexts/UserContext';
import { useAppContext } from '../contexts/AppContext';

const EditProfileScreen: React.FC = () => {
  const { currentUser, saveProfile } = useUser();
  const { setEditingProfile } = useAppContext();
  
  const [profilePicture, setProfilePicture] = useState<string | null>(currentUser.avatarUrl || null);
  const [selectedTypes, setSelectedTypes] = useState<UserType[]>(currentUser.types || []);
  const [headline, setHeadline] = useState(currentUser.headline);
  const [bio, setBio] = useState(currentUser.bio);
  const [rate, setRate] = useState(currentUser.rate || 0);
  const [age, setAge] = useState(currentUser.age || 25);
  const [website, setWebsite] = useState(currentUser.socialLinks?.website || '');
  const [instagram, setInstagram] = useState(currentUser.socialLinks?.instagram || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleType = (type: UserType) => {
    setSelectedTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedUser: User = {
      ...currentUser,
      avatarUrl: profilePicture || '',
      types: selectedTypes,
      headline,
      bio,
      rate: Number(rate),
      age: Number(age),
      socialLinks: { website, instagram },
    };
    saveProfile(updatedUser);
    setEditingProfile(false);
  };

  return (
    <div className="fixed inset-0 bg-[#050B14] z-[5000] flex flex-col animate-fade-in overflow-y-auto no-scrollbar pb-safe">
      <header className="p-6 flex justify-between items-center sticky top-0 bg-[#050B14]/90 backdrop-blur-xl z-10 border-b border-white/5">
        <button onClick={() => setEditingProfile(false)} className="text-slate-400 hover:text-white flex items-center gap-2 font-bold uppercase tracking-[0.2em] text-[10px]">
           <Icon name="close" className="w-4 h-4" /> Fermer
        </button>
        <h1 className="text-sm font-black text-white uppercase tracking-[0.3em]">Studio Management</h1>
        <button onClick={handleSubmit} className="px-6 py-2.5 bg-[#D2B48C] text-[#050B14] rounded-full font-black uppercase tracking-widest text-[10px] shadow-xl shadow-[#D2B48C]/20 active:scale-95 transition-all">
            Valider
        </button>
      </header>

      <div className="max-w-xl mx-auto w-full p-8 space-y-16 pb-32">
        {/* Photo Section */}
        <div className="flex flex-col items-center gap-6">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <img src={profilePicture || ''} className="w-36 h-36 rounded-[3.5rem] object-cover border-[0.5px] border-white/20 shadow-2xl transition-all duration-500 group-hover:scale-105 group-hover:border-[#D2B48C]/50" />
                <div className="absolute inset-0 bg-black/40 rounded-[3.5rem] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Icon name="plusCircle" className="w-8 h-8 text-white" />
                </div>
            </div>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                    const r = new FileReader();
                    r.onload = (ev) => setProfilePicture(ev.target?.result as string);
                    r.readAsDataURL(file);
                }
            }} />
            <div className="text-center space-y-1">
                <p className="text-[10px] text-white font-black uppercase tracking-[0.3em]">Avatar de Marque</p>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Format recommandé : Portrait Studio</p>
            </div>
        </div>

        {/* Business Settings Card */}
        <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#0D1625] p-8 rounded-[3rem] border-[0.5px] border-white/10 space-y-3 group focus-within:border-[#D2B48C]/40 transition-all shadow-2xl">
                <label className="text-[9px] font-black text-[#D2B48C] uppercase tracking-[0.3em] block">Honoraires ($/h)</label>
                <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-white opacity-40">$</span>
                    <input 
                      type="number" 
                      value={rate} 
                      onChange={(e) => setRate(Number(e.target.value))} 
                      className="bg-transparent text-5xl font-black text-white w-full outline-none tracking-tighter" 
                      placeholder="0"
                    />
                </div>
            </div>
            <div className="bg-[#0D1625] p-8 rounded-[3rem] border-[0.5px] border-white/10 space-y-3">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] block">Âge</label>
                <input 
                  type="number" 
                  value={age} 
                  onChange={(e) => setAge(Number(e.target.value))} 
                  className="bg-transparent text-5xl font-black text-white w-full outline-none tracking-tighter" 
                  placeholder="25"
                />
            </div>
        </div>

        {/* Roles Selection */}
        <section className="space-y-6">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] text-center">Domaines d'Expertise</h3>
            <div className="grid grid-cols-3 gap-3">
                {[UserType.Photographer, UserType.Videographer, UserType.Model].map(type => (
                    <button 
                      key={type} 
                      onClick={() => toggleType(type)} 
                      className={`py-5 rounded-[2rem] border-[0.5px] font-black uppercase tracking-tighter text-[10px] transition-all duration-500 ${selectedTypes.includes(type) ? 'bg-[#D2B48C] border-[#D2B48C] text-[#050B14] shadow-2xl shadow-[#D2B48C]/10 scale-105' : 'bg-white/5 border-white/5 text-slate-500 hover:border-white/20'}`}
                    >
                        {type}
                    </button>
                ))}
            </div>
        </section>

        {/* Textual Inputs */}
        <section className="space-y-10">
            <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-6">Slogan Professionnel</label>
                <input 
                  value={headline} 
                  onChange={(e) => setHeadline(e.target.value)} 
                  placeholder="Creative Explorer..."
                  className="w-full bg-[#0D1625] border-[0.5px] border-white/10 rounded-[2.5rem] p-6 text-white font-bold outline-none focus:border-[#D2B48C]/40 transition-all shadow-inner text-sm" 
                />
            </div>
            <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-6">Philosophie de travail</label>
                <textarea 
                  rows={6} 
                  value={bio} 
                  onChange={(e) => setBio(e.target.value)} 
                  placeholder="Détaillez votre approche artistique..."
                  className="w-full bg-[#0D1625] border-[0.5px] border-white/10 rounded-[2.5rem] p-8 text-sm text-slate-300 outline-none focus:border-[#D2B48C]/40 transition-all resize-none leading-relaxed shadow-inner" 
                />
            </div>
        </section>

        {/* Social Presence */}
        <section className="space-y-6">
             <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] text-center">Écosystème Digital</h3>
             <div className="space-y-4">
                <div className="flex items-center bg-[#0D1625] border-[0.5px] border-white/10 rounded-[2rem] overflow-hidden focus-within:border-[#D2B48C]/30 transition-all group">
                    <div className="p-6 bg-white/5 text-slate-500 group-focus-within:text-[#D2B48C] transition-colors">
                        <Icon name="link" className="w-5 h-5" />
                    </div>
                    <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="votre-portfolio.com" className="flex-1 bg-transparent p-6 text-xs text-white outline-none font-bold" />
                </div>
                <div className="flex items-center bg-[#0D1625] border-[0.5px] border-white/10 rounded-[2rem] overflow-hidden focus-within:border-[#D2B48C]/30 transition-all group">
                    <div className="p-6 bg-white/5 text-slate-500 group-focus-within:text-[#D2B48C] transition-colors">
                        <Icon name="instagram" className="w-5 h-5" />
                    </div>
                    <input type="url" value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="@instagram_id" className="flex-1 bg-transparent p-6 text-xs text-white outline-none font-bold" />
                </div>
             </div>
        </section>
      </div>
    </div>
  );
};

export default EditProfileScreen;
