
import React, { useState, useRef } from 'react';
import Icon from './Icon';
import { UserType, type User } from '../types';
import { generateProfileSuggestions } from '../services/geminiService';
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
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleType = (type: UserType) => {
    setSelectedTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const handleGenerateAIProfile = async () => {
    if (selectedTypes.length === 0) return;
    setIsGenerating(true);
    try {
      const result = await generateProfileSuggestions(selectedTypes.join(', '));
      setHeadline(result.headlines[0]);
      setBio(result.bio);
    } catch (e) { console.error(e); }
    finally { setIsGenerating(false); }
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
    <div className="fixed inset-0 bg-[#050B14]/98 backdrop-blur-3xl z-[5000] flex flex-col animate-fade-in overflow-y-auto no-scrollbar pb- safe">
      <header className="p-6 flex justify-between items-center sticky top-0 bg-[#050B14]/80 backdrop-blur-md z-10 border-b border-white/5">
        <button onClick={() => setEditingProfile(false)} className="text-slate-400 hover:text-white flex items-center gap-2 font-black uppercase tracking-widest text-[10px]">
           <Icon name="close" className="w-4 h-4" /> Annuler
        </button>
        <h1 className="text-lg font-black text-white uppercase tracking-tighter">Business & Profil</h1>
        <button onClick={handleSubmit} className="px-6 py-2 bg-[#D2B48C] text-[#050B14] rounded-xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-[#D2B48C]/20 active:scale-95 transition-all">
            Sauvegarder
        </button>
      </header>

      <div className="max-w-xl mx-auto w-full p-8 space-y-12 pb-32">
        {/* Photo Section */}
        <div className="flex flex-col items-center gap-5">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <img src={profilePicture || ''} className="w-32 h-32 rounded-[3.5rem] object-cover border-4 border-[#D2B48C]/20 shadow-2xl transition-transform group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/50 rounded-[3.5rem] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
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
                <p className="text-[10px] text-white font-black uppercase tracking-widest">Identité Visuelle</p>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">Logo ou Portrait Pro</p>
            </div>
        </div>

        {/* Business Settings */}
        <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#0D1625] p-6 rounded-[2.5rem] border border-white/5 space-y-2 group focus-within:border-[#D2B48C]/40 transition-all shadow-xl">
                <label className="text-[9px] font-black text-[#D2B48C] uppercase tracking-[0.2em] block">Tarif Horaire ($/h)</label>
                <div className="flex items-end gap-2">
                    <span className="text-2xl font-black text-white mb-0.5">$</span>
                    <input 
                      type="number" 
                      value={rate} 
                      onChange={(e) => setRate(Number(e.target.value))} 
                      className="bg-transparent text-4xl font-black text-white w-full outline-none" 
                      placeholder="0"
                    />
                </div>
                <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mt-2">Utilisé pour les contrats</p>
            </div>
            <div className="bg-[#0D1625] p-6 rounded-[2.5rem] border border-white/5 space-y-2 shadow-xl">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] block">Âge</label>
                <input 
                  type="number" 
                  value={age} 
                  onChange={(e) => setAge(Number(e.target.value))} 
                  className="bg-transparent text-4xl font-black text-white w-full outline-none" 
                  placeholder="25"
                />
            </div>
        </div>

        {/* Roles Selection */}
        <section className="space-y-4">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] text-center">Catégorie Professionnelle</h3>
            <div className="grid grid-cols-3 gap-3">
                {[UserType.Photographer, UserType.Videographer, UserType.Model].map(type => (
                    <button 
                      key={type} 
                      onClick={() => toggleType(type)} 
                      className={`py-5 rounded-3xl border font-black uppercase tracking-tighter text-[10px] transition-all ${selectedTypes.includes(type) ? 'bg-[#D2B48C] border-[#D2B48C] text-[#050B14] shadow-lg shadow-[#D2B48C]/10' : 'bg-white/5 border-white/5 text-slate-500 hover:border-white/20'}`}
                    >
                        {type}
                    </button>
                ))}
            </div>
        </section>

        {/* AI Generator Card */}
        <div className="p-6 bg-gradient-to-br from-purple-900/40 to-[#050B14] rounded-[3rem] border border-purple-500/30 flex items-center justify-between gap-6 shadow-2xl">
            <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                    <Icon name="sparkles" className="w-5 h-5 text-purple-400" />
                    <h4 className="text-white font-black uppercase tracking-tighter text-xs">Assistant Gemini Elite</h4>
                </div>
                <p className="text-[10px] text-slate-400 font-bold uppercase leading-relaxed">Optimiser mon titre et ma bio pour le réseau.</p>
            </div>
            <button onClick={handleGenerateAIProfile} disabled={isGenerating} className="p-5 bg-purple-600 rounded-3xl text-white active:scale-90 transition-all shadow-2xl shadow-purple-600/30">
                {isGenerating ? <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" /> : <Icon name="bolt" className="w-6 h-6" />}
            </button>
        </div>

        {/* Inputs */}
        <section className="space-y-8">
            <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Accroche Professionnelle</label>
                <input 
                  value={headline} 
                  onChange={(e) => setHeadline(e.target.value)} 
                  placeholder="Portraitiste Mode - Paris..."
                  className="w-full bg-[#0D1625] border border-white/5 rounded-[2rem] p-5 text-white font-bold outline-none focus:border-[#D2B48C]/40 transition-all" 
                />
            </div>
            <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Manifeste Artistique / Bio</label>
                <textarea 
                  rows={6} 
                  value={bio} 
                  onChange={(e) => setBio(e.target.value)} 
                  placeholder="Partagez votre vision..."
                  className="w-full bg-[#0D1625] border border-white/5 rounded-[2rem] p-6 text-sm text-slate-300 outline-none focus:border-[#D2B48C]/40 transition-all resize-none leading-relaxed" 
                />
            </div>
        </section>

        {/* Social Links */}
        <section className="space-y-4">
             <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] text-center">Connectivité</h3>
             <div className="space-y-3">
                <div className="flex items-center bg-[#0D1625] border border-white/5 rounded-2xl overflow-hidden group">
                    <div className="p-5 bg-white/5 text-slate-500 group-focus-within:text-[#D2B48C] transition-colors">
                        <Icon name="link" className="w-5 h-5" />
                    </div>
                    <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="votre-portfolio.com" className="flex-1 bg-transparent p-5 text-xs text-white outline-none" />
                </div>
                <div className="flex items-center bg-[#0D1625] border border-white/5 rounded-2xl overflow-hidden group">
                    <div className="p-5 bg-white/5 text-slate-500 group-focus-within:text-[#D2B48C] transition-colors">
                        <Icon name="instagram" className="w-5 h-5" />
                    </div>
                    <input type="url" value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="@votre_instagram" className="flex-1 bg-transparent p-5 text-xs text-white outline-none" />
                </div>
             </div>
        </section>
      </div>
    </div>
  );
};

export default EditProfileScreen;
