
import React, { useState, useRef } from 'react';
import { UserType } from '../types';
import Logo from './Logo';
import Icon from './Icon';
import { useUser } from '../contexts/UserContext';
import { useAppContext } from '../contexts/AppContext';

const InitialSetupScreen: React.FC = () => {
  const { completeInitialSetup, updateCurrentUser } = useUser();
  const { setTourActive } = useAppContext();
  const [name, setName] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<UserType[]>([]);
  const [objective, setObjective] = useState<string | null>(null);
  const [avatar, setAvatar] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleType = (type: UserType) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type) 
        : [...prev, type]
    );
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setAvatar(event.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && selectedTypes.length > 0 && objective) {
      const { startTour } = completeInitialSetup({ name: name.trim(), types: selectedTypes });
      if (avatar) {
        updateCurrentUser({ avatarUrl: avatar });
      }
      if (startTour) {
        setTourActive(true);
      }
    }
  };

  const isFormValid = !!name.trim() && selectedTypes.length > 0 && !!objective;

  const TypeButton: React.FC<{ type: UserType }> = ({ type }) => {
    const isSelected = selectedTypes.includes(type);
    return (
      <button
        type="button"
        onClick={() => toggleType(type)}
        className={`w-full py-4 px-2 rounded-lg border-2 transition-all duration-200 flex items-center justify-center ${isSelected ? 'bg-cyan-500/20 border-cyan-500' : 'bg-gray-800 border-gray-700 hover:border-cyan-600'}`}
      >
        <p className={`font-semibold ${isSelected ? 'text-cyan-400' : 'text-white'}`}>{type}</p>
      </button>
    );
  };

  const ObjectiveButton: React.FC<{ value: string }> = ({ value }) => (
    <button
      type="button"
      onClick={() => setObjective(value)}
      className={`w-full p-3 text-left rounded-lg border transition-all duration-200 flex items-center gap-3 ${objective === value ? 'bg-cyan-500/20 border-cyan-500' : 'bg-gray-800 border-gray-700 hover:border-cyan-600'}`}
    >
      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${objective === value ? 'border-cyan-500 bg-cyan-500' : 'border-gray-600'}`}>
        {objective === value && <Icon name="check" className="w-3 h-3 text-white"/>}
      </div>
      <span className={objective === value ? 'text-white' : 'text-gray-300'}>{value}</span>
    </button>
  );


  return (
    <div className="flex flex-col h-full bg-gray-950 text-white animate-fade-in">
      <header className="p-4 flex justify-center items-center border-b border-gray-800/50 flex-shrink-0">
        <Logo className="w-auto h-7" iconOnly={true} />
      </header>
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-center mb-2">Bienvenue !</h1>
          <p className="text-gray-400 text-center mb-8">Commençons par configurer votre identité visuelle.</p>

          <form onSubmit={handleSubmit} className="space-y-8 pb-10">
            <div className="flex flex-col items-center">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-24 h-24 rounded-3xl bg-gray-800 border-2 border-dashed border-gray-600 flex flex-col items-center justify-center cursor-pointer overflow-hidden group hover:border-cyan-500 transition-all"
              >
                {avatar ? (
                  <img src={avatar} className="w-full h-full object-cover" />
                ) : (
                  <>
                    <Icon name="user" className="w-8 h-8 text-gray-500 group-hover:text-cyan-400" />
                    <span className="text-[10px] text-gray-500 mt-1 uppercase font-black">Photo</span>
                  </>
                )}
              </div>
              <input type="file" ref={fileInputRef} onChange={handleAvatarChange} className="hidden" accept="image/*" />
              <p className="text-[10px] text-gray-500 mt-2 uppercase tracking-widest font-bold">Photo de profil recommandée</p>
            </div>

            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-2">Nom complet</label>
              <input
                id="fullName"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Alex Martin"
                className="w-full bg-gray-800 text-white p-3 rounded-md border border-gray-700 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition-colors"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3 text-center">Vous êtes... (plusieurs choix possibles)</label>
              <div className="grid grid-cols-3 gap-3 text-center">
                <TypeButton type={UserType.Model} />
                <TypeButton type={UserType.Photographer} />
                <TypeButton type={UserType.Videographer} />
              </div>
            </div>

             <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">Quel est votre objectif principal ?</label>
              <div className="space-y-3">
                 <ObjectiveButton value="Collaborer sur des projets créatifs" />
                 <ObjectiveButton value="Partager mon travail et construire mon portfolio" />
                 <ObjectiveButton value="Trouver l'inspiration et découvrir des talents" />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={!isFormValid}
                className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
              >
                Commencer l'Expérience Elite
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default InitialSetupScreen;
