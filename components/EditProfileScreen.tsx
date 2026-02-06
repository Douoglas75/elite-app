
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
  const [error, setError] = useState('');
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
    <div className="fixed inset-0 bg-[#050B14]/95 backdrop-blur-2xl z-[5000] flex flex-col animate-fade-in overflow-y-auto no-scrollbar">
      <header className="p-6 flex justify-between items-center sticky top-0 bg-[#050B14]/80 backdrop-blur-md z-10">
        <button onClick={() => setEditingProfile(false)} className="text-slate-400 hover:text-white flex items-center gap-2 font-black uppercase tracking-widest text-[10px]">
           <Icon name="close" className="w-5 h-5" /> Annuler
        </button>
        <h1 className="text-xl font-black text-white uppercase tracking-tighter">Business & Profile</h1>
        <button onClick={handleSubmit} className="px-6 py-2.5 bg-[#D2B48C] text-[#050B14] rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-[#D2B48C]/20">
            Valider
        </button>
      </header>

      <div className="max-w-xl mx-auto w-full p-6 space-y-12 pb-32">
        {/* Photo Section */}
        <div className="flex flex-col items-center gap-4">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <img src={profilePicture || ''} className="w-28 h-28 rounded-[2.5rem] object-cover border-4 border-[#D2B48C]/20 shadow-2xl group-hover:scale-105 transition-transform" />
                <div className="absolute inset-0 bg-black/40 rounded-[2.5rem] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Icon name="documentText" className="w-6 h-6 text-white" />
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
            <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em]">Cliquer pour modifier l'image</p>
        </div>

        {/* Roles Section */}
        <section className="space-y-4">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] text-center">Votre Spécialité Elite</h3>
            <div className="grid grid-cols-3 gap-3">
                {[UserType.Model, UserType.Photographer, UserType.Videographer].map(type => (
                    <button key={type} onClick={() => toggleType(type)} className={`py-4 rounded-2xl border font-black uppercase tracking-tighter text-[10px] transition-all ${selectedTypes.includes(type) ? 'bg-[#D2B48C] border-[#D2B48C] text-[#050B14]' : 'bg-white/5 border-white/5 text-slate-500 hover:border-white/20'}`}>
                        {type}
                    </button>
                ))}
            </div>
        </section>

        {/* Finance & Age Section */}
        <section className="grid grid-cols-2 gap-4">
            <div className="bg-[#0D1625] p-5 rounded-[2rem] border border-white/5 space-y-2">
                <label className="text-[9px] font-black text-[#D2B48C] uppercase tracking-widest block">Tarif Horaire ($/h)</label>
                <input type="number" value={rate} onChange={(e) => setRate(Number(e.target.value))} className="bg-transparent text-2xl font-black text-white w-full outline-none" />
                <p className="text-[8px] text-slate-500 font-bold uppercase">Utilisé pour les réservations</p>
            </div>
            <div className="bg-[#0D1625] p-5 rounded-[2rem] border border-white/5 space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Âge</label>
                <input type="number" value={age} onChange={(e) => setAge(Number(e.target.value))} className="bg-transparent text-2xl font-black text-white w-full outline-none" />
                <p className="text-[8px] text-slate-500 font-bold uppercase">Visibilité sur le réseau</p>
            </div>
        </section>

        {/* AI Assistant Section */}
        <div className="p-5 bg-purple-900/20 rounded-[2.5rem] border border-purple-500/30 flex items-center justify-between gap-6">
            <div className="flex-1">
                <h4 className="text-white font-black uppercase tracking-tighter text-sm flex items-center gap-2">
                    <Icon name="sparkles" className="w-4 h-4 text-purple-400" /> Assistant IA Elite
                </h4>
                <p className="text-[9px] text-slate-400 font-bold mt-1 uppercase leading-relaxed">Générer un titre et une bio optimisés pour attirer les marques de luxe.</p>
            </div>
            <button onClick={handleGenerateAIProfile} disabled={isGenerating} className="p-4 bg-purple-600 rounded-2xl text-white active:scale-95 transition-all shadow-xl shadow-purple-600/20">
                {isGenerating ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Icon name="bolt" className="w-5 h-5" />}
            </button>
        </div>

        {/* Textual Inputs */}
        <section className="space-y-6">
            <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Titre Professionnel</label>
                <input value={headline} onChange={(e) => setHeadline(e.target.value)} className="w-full bg-[#0D1625] border border-white/5 rounded-2xl p-4 text-white font-bold outline-none focus:border-[#D2B48C]/40 transition-all" />
            </div>
            <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Biographie & Ambitions</label>
                <textarea rows={5} value={bio} onChange={(e) => setBio(e.target.value)} className="w-full bg-[#0D1625] border border-white/5 rounded-2xl p-4 text-sm text-slate-300 outline-none focus:border-[#D2B48C]/40 transition-all resize-none leading-relaxed" />
            </div>
        </section>

        {/* Social Links */}
        <section className="space-y-4">
             <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] text-center">Portfolio & Réseaux</h3>
             <div className="space-y-3">
                <div className="flex items-center bg-[#0D1625] border border-white/5 rounded-2xl overflow-hidden group">
                    <div className="p-4 bg-white/5 text-slate-500 group-focus-within:text-[#D2B48C] transition-colors">
                        <Icon name="link" className="w-5 h-5" />
                    </div>
                    <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://votre-site.com" className="flex-1 bg-transparent p-4 text-xs text-white outline-none" />
                </div>
                <div className="flex items-center bg-[#0D1625] border border-white/5 rounded-2xl overflow-hidden group">
                    <div className="p-4 bg-white/5 text-slate-500 group-focus-within:text-[#D2B48C] transition-colors">
                        <Icon name="instagram" className="w-5 h-5" />
                    </div>
                    <input type="url" value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="https://instagram.com/profil" className="flex-1 bg-transparent p-4 text-xs text-white outline-none" />
                </div>
             </div>
        </section>
      </div>
    </div>
  );
};

export default EditProfileScreen;
