
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
        <button onClick={() => setEditingProfile(false)} className="text-slate-400 hover:text-white flex items-center gap-2 font-black uppercase tracking-[0.2em] text-[10px]">
           <Icon name="close" className="w-4 h-4" /> Fermer
        </button>
        <h1 className="text-sm font-black text-white uppercase tracking-[0.3em]">Business & Profil</h1>
        <button onClick={handleSubmit} className="px-8 py-3 bg-[#D2B48C] text-[#050B14] rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-[#D2B48C]/20 active:scale-95 transition-all">
            Sauvegarder
        </button>
      </header>

      <div className="max-w-xl mx-auto w-full p-8 space-y-12 pb-32">
        {/* Photo Section */}
        <div className="flex flex-col items-center gap-6">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <img src={profilePicture || ''} className="w-40 h-40 rounded-[3.5rem] object-cover border-4 border-[#D2B48C]/20 shadow-2xl transition-all duration-500 group-hover:scale-105" />
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
            <div className="text-center">
                <p className="text-[10px] text-white font-black uppercase tracking-[0.3em]">Identité Visuelle</p>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">Portrait Pro ou Logo Studio</p>
            </div>
        </div>

        {/* Business Settings Card */}
        <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#0D1625] p-8 rounded-[3rem] border border-white/5 space-y-3 shadow-2xl">
                <label className="text-[9px] font-black text-[#D2B48C] uppercase tracking-[0.3em] block">Tarif Horaire ($/h)</label>
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
            <div className="bg-[#0D1625] p-8 rounded-[3rem] border border-white/5 space-y-3">
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
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] text-center">Spécialisations</h3>
            <div className="grid grid-cols-3 gap-3">
                {[UserType.Photographer, UserType.Videographer, UserType.Model].map(type => (
                    <button 
                      key={type} 
                      onClick={() => toggleType(type)} 
                      className={`py-5 rounded-[2rem] border font-black uppercase tracking-tighter text-[10px] transition-all duration-500 ${selectedTypes.includes(type) ? 'bg-[#D2B48C] border-[#D2B48C] text-[#050B14] shadow-2xl shadow-[#D2B48C]/10' : 'bg-white/5 border-white/5 text-slate-500 hover:border-white/20'}`}
                    >
                        {type}
                    </button>
                ))}
            </div>
        </section>

        {/* Inputs */}
        <section className="space-y-10">
            <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-6">Slogan (Headline)</label>
                <input 
                  value={headline} 
                  onChange={(e) => setHeadline(e.target.value)} 
                  placeholder="Ex: Visionnaire Mode & Editorial..."
                  className="w-full bg-[#0D1625] border border-white/5 rounded-[2.5rem] p-6 text-white font-bold outline-none focus:border-[#D2B48C]/40 transition-all text-sm" 
                />
            </div>
            <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-6">Bio Artistique</label>
                <textarea 
                  rows={6} 
                  value={bio} 
                  onChange={(e) => setBio(e.target.value)} 
                  placeholder="Décrivez votre univers..."
                  className="w-full bg-[#0D1625] border border-white/5 rounded-[2.5rem] p-8 text-sm text-slate-300 outline-none focus:border-[#D2B48C]/40 transition-all resize-none leading-relaxed" 
                />
            </div>
        </section>

        {/* Social Links */}
        <section className="space-y-4">
             <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] text-center">Portfolio & Social</h3>
             <div className="space-y-4">
                <div className="flex items-center bg-[#0D1625] border border-white/5 rounded-[2rem] overflow-hidden group">
                    <div className="p-6 bg-white/5 text-slate-500 group-focus-within:text-[#D2B48C] transition-colors">
                        <Icon name="link" className="w-5 h-5" />
                    </div>
                    <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="votre-site.com" className="flex-1 bg-transparent p-6 text-xs text-white outline-none font-bold" />
                </div>
                <div className="flex items-center bg-[#0D1625] border border-white/5 rounded-[2rem] overflow-hidden group">
                    <div className="p-6 bg-white/5 text-slate-500 group-focus-within:text-[#D2B48C] transition-colors">
                        <Icon name="instagram" className="w-5 h-5" />
                    </div>
                    <input type="url" value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="@votre_instagram" className="flex-1 bg-transparent p-6 text-xs text-white outline-none font-bold" />
                </div>
             </div>
        </section>
      </div>
    </div>
  );
};

export default EditProfileScreen;
