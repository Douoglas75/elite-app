
import React, { useState } from 'react';
import Logo from './Logo';
import { useUser } from '../contexts/UserContext';
import Icon from './Icon';

const LoginScreen: React.FC = () => {
  const { login, register } = useUser();
  const [mode, setMode] = useState<'landing' | 'login' | 'register'>('landing');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    const success = await login(email, password);
    if (!success) {
      setError('Erreur. Utilisez l\'email : test@elite.com');
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await register(name, email, 'Modèle' as any);
  };

  if (mode === 'landing') {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-[#050B14] relative overflow-hidden px-8">
        {/* Background Gradients */}
        <div className="absolute top-[-15%] right-[-15%] w-[500px] h-[500px] bg-[#D2B48C]/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-15%] left-[-15%] w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="mb-12 animate-fade-in flex justify-center">
            <Logo className="h-40" iconOnly={true} />
        </div>
        
        <div className="text-center max-w-sm space-y-4 animate-view-transition">
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter leading-tight">Find Photographer <br/> <span className="text-[#D2B48C]">Elite</span></h1>
          <p className="text-slate-400 text-sm font-medium uppercase tracking-[0.25em] opacity-60">The professional ecosystem</p>
        </div>

        <div className="w-full max-w-xs mt-16 space-y-4 animate-fade-in">
          <button onClick={() => setMode('register')} className="w-full bg-[#D2B48C] text-[#050B14] font-black py-4 rounded-2xl shadow-2xl hover:scale-[1.02] transition-all uppercase tracking-widest text-xs">Entrer dans le réseau</button>
          <button onClick={() => setMode('login')} className="w-full bg-[#1A2536] border border-white/10 text-slate-300 font-black py-4 rounded-2xl hover:bg-[#253247] transition-all uppercase tracking-widest text-[10px]">Accès Membre</button>
        </div>
        
        <div className="mt-12 p-4 bg-white/5 rounded-2xl border border-white/5 text-center animate-fade-in">
            <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-1">Portail de démonstration</p>
            <p className="text-xs text-[#D2B48C] font-bold">test@elite.com / demo</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full bg-[#050B14] px-8 animate-fade-in relative overflow-hidden">
        <button onClick={() => setMode('landing')} className="absolute top-10 left-8 text-slate-500 hover:text-white flex items-center gap-2 text-xs font-bold uppercase tracking-widest z-50">
            <Icon name="chevronRight" className="w-4 h-4 rotate-180" /> Retour
        </button>

        <div className="w-full max-w-sm space-y-8 relative z-10">
            <div className="text-center">
                <Logo className="h-16 mx-auto mb-6" iconOnly={true} />
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Authentification <span className="text-[#D2B48C]">Elite</span></h2>
                <p className="text-slate-500 text-sm mt-1">{mode === 'login' ? 'Identifiants sécurisés requis.' : 'Éligibilité et profil créatif.'}</p>
            </div>

            <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="space-y-4">
                {mode === 'register' && (
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase ml-2">Nom de l'artiste / Studio</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full bg-[#1A2536] border border-white/10 rounded-xl p-4 text-white focus:border-[#D2B48C] outline-none" placeholder="Ex: Studio 24" />
                    </div>
                )}
                <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase ml-2">Email Professionnel</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full bg-[#1A2536] border border-white/10 rounded-xl p-4 text-white focus:border-[#D2B48C] outline-none" placeholder="votre@agence.com" />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase ml-2">Mot de passe</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full bg-[#1A2536] border border-white/10 rounded-xl p-4 text-white focus:border-[#D2B48C] outline-none" placeholder="••••••••" />
                </div>

                {error && <p className="text-red-400 text-[10px] font-bold text-center uppercase tracking-widest">{error}</p>}

                <button type="submit" disabled={isLoading} className="w-full bg-[#D2B48C] text-[#050B14] font-black py-4 rounded-xl shadow-lg hover:brightness-110 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs">
                    {isLoading ? <div className="w-4 h-4 border-2 border-[#050B14] border-t-transparent rounded-full animate-spin" /> : (mode === 'login' ? 'Validation de session' : 'Générer mon accès')}
                </button>
            </form>
        </div>
    </div>
  );
};

export default LoginScreen;
