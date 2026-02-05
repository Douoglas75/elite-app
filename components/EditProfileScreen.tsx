import React, { useState, useRef } from 'react';
import Icon from './Icon';
import type { User } from '../types';
import { generateProfileSuggestions } from '../services/geminiService';
import { useUser } from '../contexts/UserContext';
import { useAppContext } from '../contexts/AppContext';

const EditProfileScreen: React.FC = () => {
  const { currentUser, saveProfile } = useUser();
  const { setEditingProfile } = useAppContext();
  
  const [profilePicture, setProfilePicture] = useState<string | null>(currentUser.avatarUrl || null);
  const [headline, setHeadline] = useState(currentUser.headline);
  const [bio, setBio] = useState(currentUser.bio);
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
    setIsGenerating(true);
    setSuggestions(null);
    setError('');
    try {
      const result = await generateProfileSuggestions(currentUser.type);
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
    if (!headline.trim() || !bio.trim()) {
      setError('Le titre et la biographie ne peuvent pas être vides.');
      return;
    }
    setError('');
    const updatedUser: User = {
      ...currentUser,
      avatarUrl: profilePicture || '',
      headline,
      bio,
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
        <h1 className="text-xl font-bold">Modifier le Profil</h1>
        <button onClick={() => setEditingProfile(false)} className="text-gray-400 hover:text-white">
            <Icon name="close" />
        </button>
      </header>
      <div className="flex-1 p-6 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Photo de profil</label>
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePictureUpload}
                  accept="image/*"
                  className="hidden"
                  aria-hidden="true"
                />
                 <div className="relative w-20 h-20 rounded-full bg-gray-800 border-2 border-gray-600 flex items-center justify-center">
                  {profilePicture ? (
                    <img src={profilePicture} alt="Aperçu du profil" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <Icon name="user" className="w-10 h-10 text-gray-500" />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-gray-700 hover:bg-gray-600 text-white text-sm font-bold py-2 px-4 rounded-full"
                  aria-label="Changer la photo de profil"
                >
                  Changer
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                  <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="votre.email@ FAI.com" className="w-full bg-gray-800 text-white p-3 rounded-md border border-gray-700 focus:ring-cyan-500 focus:border-cyan-500 outline-none" />
                </div>
                <div>
                  <label htmlFor="age" className="block text-sm font-medium text-gray-300 mb-2">Âge</label>
                  <input id="age" type="number" value={age || ''} onChange={(e) => setAge(Number(e.target.value))} placeholder="25" className="w-full bg-gray-800 text-white p-3 rounded-md border border-gray-700 focus:ring-cyan-500 focus:border-cyan-500 outline-none" />
                </div>
            </div>

            <div className="p-4 bg-purple-900/30 rounded-lg border border-purple-500/30 space-y-3">
                <div className="flex items-center gap-3">
                    <Icon name="sparkles" className="w-6 h-6 text-purple-400" />
                    <h4 className="font-semibold text-white">Assistant de Profil IA</h4>
                </div>
                <p className="text-sm text-purple-300/80">Bloqué ? Laissez notre IA vous suggérer un titre et une biographie percutants pour vous démarquer.</p>
                <button
                    type="button"
                    onClick={handleGenerateAIProfile}
                    disabled={isGenerating}
                    className="w-full flex items-center justify-center gap-2 p-2 rounded-md bg-purple-600 hover:bg-purple-500 text-white font-bold disabled:opacity-50"
                >
                    {isGenerating ? (
                        <>
                            <div className="w-5 h-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                            <span>Génération en cours...</span>
                        </>
                    ) : (
                        "Générer avec l'IA"
                    )}
                </button>

                {suggestions && (
                    <div className="animate-fade-in space-y-4 pt-3">
                        <div>
                            <h5 className="text-sm font-semibold text-gray-300 mb-2">Suggestions de Titre :</h5>
                            <div className="space-y-2">
                                {suggestions.headlines.map((h, i) => (
                                    <button key={i} type="button" onClick={() => setHeadline(h)} className="w-full text-left p-2 bg-gray-700/50 hover:bg-gray-600/50 rounded-md text-sm">
                                        "{h}"
                                    </button>
                                ))}
                            </div>
                        </div>
                         <div>
                            <h5 className="text-sm font-semibold text-gray-300 mb-2">Suggestion de Biographie :</h5>
                             <div className="p-2 bg-gray-700/50 rounded-md text-sm text-gray-300 italic">
                                {suggestions.bio}
                             </div>
                             <button type="button" onClick={() => setBio(suggestions.bio)} className="w-full text-center p-1 mt-2 bg-gray-600/70 hover:bg-gray-600 text-xs rounded-md">
                                Utiliser cette biographie
                             </button>
                        </div>
                    </div>
                )}
            </div>

            <div>
              <label htmlFor="headline" className="block text-sm font-medium text-gray-300 mb-2">Titre du profil</label>
              <input id="headline" type="text" value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="Ex: Photographe de portrait à Paris" className="w-full bg-gray-800 text-white p-3 rounded-md border border-gray-700 focus:ring-cyan-500 focus:border-cyan-500 outline-none" required />
            </div>
            
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-300 mb-2">Biographie</label>
              <textarea id="bio" rows={4} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Parlez-nous de votre style..." className="w-full bg-gray-800 text-white p-3 rounded-md border border-gray-700 focus:ring-cyan-500 focus:border-cyan-500 outline-none" required />
            </div>

            <div>
               <label className="block text-sm font-medium text-gray-300 mb-2">Votre position</label>
               <button type="button" onClick={handleGetLocation} disabled={isLocating} className="w-full flex items-center justify-center gap-2 p-3 rounded-md bg-gray-800 border border-gray-700 hover:bg-gray-700 disabled:opacity-50">
                  {isLocating ? <div className="w-5 h-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div> : <Icon name="locationMarker" className="w-5 h-5 text-cyan-400"/>}
                  <span>Mettre à jour ma position</span>
               </button>
            </div>
            
             <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Liens Sociaux</label>
               <div className="space-y-3">
                  <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://votre-site.com" className="w-full bg-gray-800 text-white p-3 rounded-md border border-gray-700 focus:ring-cyan-500 focus:border-cyan-500 outline-none" />
                  <input type="url" value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="https://instagram.com/votreprofil" className="w-full bg-gray-800 text-white p-3 rounded-md border border-gray-700 focus:ring-cyan-500 focus:border-cyan-500 outline-none" />
               </div>
            </div>

            {error && <p className="text-red-400 text-sm text-center">{error}</p>}

            <div className="pt-4">
              <button type="submit" className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:scale-105">
                Enregistrer les modifications
              </button>
            </div>
          </form>
      </div>
    </div>
    </div>
  );
};

export default EditProfileScreen;