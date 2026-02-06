
import React, { useState, useRef } from 'react';
import Icon from './Icon';
import { UserType, type User } from '../types';
import { generateProfileSuggestions } from '../services/geminiService';
import { useUser } from '../contexts/UserContext';
import { useAppContext } from '../contexts/AppContext';

const DAYS_OF_WEEK = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

const EditProfileScreen: React.FC = () => {
  const { currentUser, saveProfile } = useUser();
  const { setEditingProfile } = useAppContext();
  
  const [profilePicture, setProfilePicture] = useState<string | null>(currentUser.avatarUrl || null);
  const [selectedTypes, setSelectedTypes] = useState<UserType[]>(currentUser.types || []);
  const [headline, setHeadline] = useState(currentUser.headline);
  const [bio, setBio] = useState(currentUser.bio);
  const [rate, setRate] = useState(currentUser.rate || 0);
  const [availableDays, setAvailableDays] = useState<string[]>(currentUser.availableDays || DAYS_OF_WEEK);
  const [location, setLocation] = useState<{ lat: number; lng: number }>(currentUser.location);
  const [email, setEmail] = useState(currentUser.email || '');
  const [age, setAge] = useState(currentUser.age || undefined);
  const [website, setWebsite] = useState(currentUser.socialLinks?.website || '');
  const [instagram, setInstagram] = useState(currentUser.socialLinks?.instagram || '');

  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<{ headlines: string[], bio: string } | null>(null);

  const toggleType = (type: UserType) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type) 
        : [...prev, type]
    );
  };

  const toggleDay = (day: string) => {
    setAvailableDays(prev => 
        prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handlePictureUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePicture(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGetLocation = () => {
    setIsLocating(true);
    setError('');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setIsLocating(false);
      },
      (geoError) => {
        setError("Impossible d'accéder à votre position. Vérifiez les autorisations.");
        setIsLocating(false);
        console.error("Geolocation Error:", geoError);
      }
    );
  };

  const handleGenerateAIProfile = async () => {
    if (selectedTypes.length === 0) {
      setError("Veuillez sélectionner au moins une spécialité.");
      return;
    }
    setIsGenerating(true);
    setSuggestions(null);
    setError('');
    try {
      const result = await generateProfileSuggestions(selectedTypes.join(', '));
      setSuggestions(result);
    } catch (e) {
      setError("Erreur lors de la génération IA. Veuillez réessayer.");
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTypes.length === 0) {
      setError("Veuillez sélectionner au moins une spécialité.");
      return;
    }
    if (!headline.trim() || !bio.trim()) {
      setError('Le titre et la biographie ne peuvent pas être vides.');
      return;
    }
    setError('');
    const updatedUser: User = {
      ...currentUser,
      avatarUrl: profilePicture || '',
      types: selectedTypes,
      headline,
      bio,
      rate,
      availableDays,
      location,
      email,
      age: age ? Number(age) : undefined,
      socialLinks: {
        website,
        instagram,
      },
    };
    saveProfile(updatedUser);
    setEditingProfile(false);
  };

  return (
    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
    <div className="flex flex-col h-full w-full max-w-md bg-gray-900/80 backdrop-blur-md rounded-2xl border border-gray-700 shadow-2xl shadow-cyan-500/10 animate-scale-in">
      <header className="p-4 flex justify-between items-center border-b border-gray-800/50 flex-shrink-0">
        <h1 className="text-xl font-bold text-white">Réglages Business</h1>
        <button onClick={() => setEditingProfile(false)} className="text-gray-400 hover:text-white">
            <Icon name="close" />
        </button>
      </header>
      <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Identité Visuelle</label>
              <div className="flex items-center gap-4">
                <input type="file" ref={fileInputRef} onChange={handlePictureUpload} accept="image/*" className="hidden" aria-hidden="true" />
                 <div className="relative w-20 h-20 rounded-full bg-gray-800 border-2 border-gray-600 flex items-center justify-center">
                  {profilePicture ? (
                    <img src={profilePicture} alt="Aperçu" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <Icon name="user" className="w-10 h-10 text-gray-500" />
                  )}
                </div>
                <button type="button" onClick={() => fileInputRef.current?.click()} className="bg-gray-700 hover:bg-gray-600 text-white text-xs font-black py-2.5 px-5 rounded-xl uppercase tracking-widest">Modifier</button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="rate" className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Tarif Horaire ($)</label>
                  <input id="rate" type="number" value={rate} onChange={(e) => setRate(Number(e.target.value))} className="w-full bg-gray-800 text-white p-3 rounded-md border border-gray-700 focus:ring-cyan-500 focus:border-cyan-500 outline-none font-bold" />
                </div>
                <div>
                  <label htmlFor="age" className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Âge</label>
                  <input id="age" type="number" value={age || ''} onChange={(e) => setAge(Number(e.target.value))} placeholder="25" className="w-full bg-gray-800 text-white p-3 rounded-md border border-gray-700 focus:ring-cyan-500 focus:border-cyan-500 outline-none" />
                </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Planning de Disponibilité</label>
              <div className="flex flex-wrap gap-2">
                {DAYS_OF_WEEK.map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`px-3 py-2 rounded-lg border text-[10px] font-bold uppercase transition-all ${availableDays.includes(day) ? 'bg-green-600/20 border-green-500 text-green-400' : 'bg-gray-800 border-gray-700 text-gray-500'}`}
                  >
                    {day.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3 text-center">Spécialités Pro</label>
              <div className="grid grid-cols-3 gap-2">
                {[UserType.Model, UserType.Photographer, UserType.Videographer].map((type) => {
                  const isSelected = selectedTypes.includes(type);
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => toggleType(type)}
                      className={`py-3 px-1 rounded-xl border-2 text-[10px] font-black uppercase tracking-tighter transition-all ${isSelected ? 'bg-cyan-600/20 border-cyan-500 text-cyan-400' : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'}`}
                    >
                      {type}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-4 bg-purple-900/30 rounded-2xl border border-purple-500/30 space-y-3">
                <div className="flex items-center gap-3">
                    <Icon name="sparkles" className="w-5 h-5 text-purple-400" />
                    <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Optimisation Bio IA</h4>
                </div>
                <button type="button" onClick={handleGenerateAIProfile} disabled={isGenerating} className="w-full flex items-center justify-center gap-2 p-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold disabled:opacity-50">
                    {isGenerating ? <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div> : <span className="text-[10px] uppercase">Générer suggestions</span>}
                </button>

                {suggestions && (
                    <div className="animate-fade-in space-y-4 pt-3">
                        <div className="space-y-2">
                            {suggestions.headlines.map((h, i) => (
                                <button key={i} type="button" onClick={() => setHeadline(h)} className="w-full text-left p-3 bg-gray-700/50 hover:bg-gray-600/50 rounded-xl text-[11px] text-slate-200">"{h}"</button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div>
              <label htmlFor="headline" className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Titre du profil</label>
              <input id="headline" type="text" value={headline} onChange={(e) => setHeadline(e.target.value)} className="w-full bg-gray-800 text-white p-3 rounded-md border border-gray-700 focus:ring-cyan-500 focus:border-cyan-500 outline-none" required />
            </div>
            
            <div>
              <label htmlFor="bio" className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Biographie</label>
              <textarea id="bio" rows={4} value={bio} onChange={(e) => setBio(e.target.value)} className="w-full bg-gray-800 text-white p-3 rounded-md border border-gray-700 focus:ring-cyan-500 focus:border-cyan-500 outline-none text-sm" required />
            </div>

            <div>
               <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Votre position</label>
               <button type="button" onClick={handleGetLocation} disabled={isLocating} className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-gray-800 border border-gray-700 hover:bg-gray-700 disabled:opacity-50">
                  {isLocating ? <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div> : <Icon name="locationMarker" className="w-5 h-5 text-cyan-400"/>}
                  <span className="text-[10px] uppercase font-black">Actualiser Géoloc</span>
               </button>
            </div>
            
             <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Réseaux Sociaux</label>
               <div className="space-y-3">
                  <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://votre-site.com" className="w-full bg-gray-800 text-white p-3 rounded-md border border-gray-700 focus:ring-cyan-500 focus:border-cyan-500 outline-none" />
                  <input type="url" value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="https://instagram.com/votreprofil" className="w-full bg-gray-800 text-white p-3 rounded-md border border-gray-700 focus:ring-cyan-500 focus:border-cyan-500 outline-none" />
               </div>
            </div>

            {error && <p className="text-red-400 text-[10px] font-bold text-center uppercase">{error}</p>}

            <div className="pt-4 pb-8">
              <button type="submit" className="w-full bg-[#D2B48C] text-[#050B14] font-black py-4 px-6 rounded-2xl shadow-lg hover:brightness-110 uppercase tracking-widest text-xs">
                Valider les modifications
              </button>
            </div>
          </form>
      </div>
    </div>
    </div>
  );
};

export default EditProfileScreen;
