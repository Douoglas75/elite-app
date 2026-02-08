import React, { useState } from 'react';
import Icon from './Icon';
import { useAppContext } from '../contexts/AppContext';
import { useUser } from '../contexts/UserContext';
import { type IconName } from '../constants';

type OnboardingStep = 1 | 2 | 3 | 4 | 5;

const OnboardingModal: React.FC = () => {
  const { setOnboardingOpen } = useAppContext();
  const { completeProOnboarding } = useUser();
  const [step, setStep] = useState<OnboardingStep>(1);
  const [agreed, setAgreed] = useState(false);
  const [signature, setSignature] = useState('');

  const handleNextStep = () => {
    if (step < 5) {
      setStep(s => (s + 1) as OnboardingStep);
    }
  };
  
  const handleFinalize = () => {
    completeProOnboarding();
    handleNextStep();
  }

  const onClose = () => setOnboardingOpen(false);

  const StepIndicator: React.FC<{ stepNumber: number; label: string; icon: IconName }> = ({ stepNumber, label, icon }) => (
    <div className="flex flex-col items-center">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 duration-300 ${step >= stepNumber ? 'bg-cyan-500 border-cyan-500' : 'bg-gray-700 border-gray-600'}`}>
            {step > stepNumber ? <Icon name="check" className="w-6 h-6 text-white"/> : <Icon name={icon} className="w-6 h-6 text-white"/>}
        </div>
        <p className={`mt-2 text-xs text-center duration-300 ${step >= stepNumber ? 'text-white' : 'text-gray-400'}`}>{label}</p>
    </div>
  );

  const renderContent = () => {
    switch (step) {
      case 1: // Identité
        return (
          <div>
            <h3 className="text-xl font-bold mb-2 text-center">Vérification d'Identité</h3>
            <p className="text-gray-400 mb-6 text-center">Veuillez confirmer vos informations personnelles.</p>
            <div className="space-y-4">
              <input type="text" placeholder="Nom complet" defaultValue="Alex Martin" className="w-full bg-gray-700 text-white p-3 rounded-md border border-gray-600 focus:ring-cyan-500 focus:border-cyan-500 outline-none" />
              <input type="email" placeholder="Adresse e-mail" defaultValue="alex.martin@email.com" className="w-full bg-gray-700 text-white p-3 rounded-md border border-gray-600 focus:ring-cyan-500 focus:border-cyan-500 outline-none" />
              <input type="text" placeholder="Adresse postale" className="w-full bg-gray-700 text-white p-3 rounded-md border border-gray-600 focus:ring-cyan-500 focus:border-cyan-500 outline-none" />
            </div>
            <button onClick={handleNextStep} className="w-full mt-6 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-4 rounded-lg">
              Suivant
            </button>
          </div>
        );
      case 2: // Paiement
        return (
          <div>
            <h3 className="text-xl font-bold mb-2 text-center">Méthode de Paiement</h3>
            <p className="text-gray-400 mb-6 text-center">Ajoutez une méthode pour recevoir vos gains et accéder aux avantages Premium.</p>
             <div className="space-y-3">
                 <button className="w-full flex justify-center items-center gap-2 bg-[#0070ba] text-white font-bold py-3 px-4 rounded-lg hover:opacity-90">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M7.576 4.322c.18-.54.633-.943 1.18-.943h6.5c2.906 0 4.32 2.84 3.518 5.405l-1.37 4.312c-.244.764-.95 1.29-1.758 1.29h-4.22c-.524 0-.988-.34-1.15-.845l-2.2-6.22zM8.22 6.322l1.378 3.882c.245.694.92.b75 1.64.b75h2.11c2.15 0 3.39-2.296 2.52-4.205-.23-.505-.72-.82-1.26-.82h-5.02c-.37 0-.68.25-.79.6zM11.64 15.39c.28.79.98 1.34 1.8 1.34h.3c1.69 0 2.47-1.72 1.83-3.04l-.5-1.04H9.64l2 2.74z"/></svg>
                    PayPal
                 </button>
                 <div className="grid grid-cols-2 gap-3">
                     <button className="w-full bg-black text-white font-bold py-3 px-4 rounded-lg hover:opacity-90 flex justify-center items-center">
                        <svg className="w-6 h-auto" fill="currentColor" viewBox="0 0 41 25"><path d="M21.576.113C18.609.324 16.485 2.65 16.299 5.613c-2.348-.042-4.654 1.808-5.864 4.037-1.31 2.41-1.099 5.309.52 7.424 1.18 1.491 2.91 2.451 4.78 2.536 2.306.126 4.61-1.64 5.863-3.826.126-.252.21-.504.294-.756.294.546.63.924 1.134 1.218 1.218 1.05 2.868 1.681 4.536 1.428 2.99-.463 5.166-3.11 5.082-6.136-.042-1.933-1.05-3.698-2.646-4.748-2.016-1.302-4.578-1.135-6.384.42C23.08.743 22.388.365 21.576.113zm-3.066 5.589c.042-2.144 1.806-3.867 3.948-3.908.671-.042 1.343.126 1.932.462.63.336 1.176.84 1.554 1.47 1.26-1.807 3.318-2.9 5.628-2.605 2.646.336 4.536 2.521 4.536 5.127 0 1.26-.42 2.437-1.218 3.32-.966.924-2.268 1.47-3.654 1.47-1.89 0-3.528-1.009-4.452-2.522l-.126-.252-.294-.504c-.336-.63-.84-1.135-1.428-1.513-1.428-.967-3.234-.967-4.62 0z"/></svg>
                     </button>
                      <button className="w-full bg-white text-black font-bold py-3 px-4 rounded-lg hover:opacity-90 flex justify-center items-center">
                        <svg className="w-12 h-auto" fill="none" viewBox="0 0 53 22"><path fill="#5F6368" d="M21.1 10.1c0-1.6-.3-3.1-.9-4.4h-3.3v5.9h2.3c-.2-1-.3-1.7-.4-2.5zm11.3 6.3c-1 1.2-2.4 1.8-4 1.8-2.1 0-3.8-1-4.8-2.9l2.1-1.3c.6 1.1 1.4 1.7 2.6 1.7.9 0 1.6-.3 2.1-.8.5-.5.8-1.2.8-2.1v-.6h-.1c-.5.6-1.2.9-2.1.9-1.5 0-2.8-.8-3.3-2.3-.5-1.4-.5-3.1.2-4.4.7-1.3 1.9-2.2 3.4-2.2 1 0 1.6.3 2.1.9h.1v-.7h2.8v9.9c0 2.2-1.2 3.6-3.1 3.6z"/><path fill="#4285F4" d="M11.6 4.2h3.5v13.2h-3.5z"/><path fill="#5F6368" d="M37.9 10.1c0-1.6-.3-3.1-.9-4.4h-3.3v5.9h2.3c-.2-1-.3-1.7-.4-2.5zm-5-4.4c-1.3-1.2-3.1-1.9-4.9-1.9-3.2 0-5.7 2.4-5.7 6.1s2.5 6.1 5.7 6.1c1.8 0 3.5-.7 4.9-1.9v1.4h3.1V.5h-3.1v3.7z"/><path fill="#EA4335" d="M5.3 13.9c1.6 1.5 3.8 2.4 6.2 2.4 3.2 0 5.6-2.4 5.6-6.1S14.7 4 11.5 4c-2.4 0-4.6.9-6.2 2.4l2.1 2.1c1-1 2.3-1.6 3.9-1.6 1.8 0 3.5 1.4 3.5 4s-1.7 4-3.5 4c-1.6 0-3-.6-3.9-1.6l-2.1 2.1z"/><path fill="#34A853" d="M47.2 6.8c-1-1.7-2.7-2.6-4.7-2.6-3.2 0-5.5 2.5-5.5 6.1s2.3 6.1 5.5 6.1c2.1 0 3.8-.9 4.8-2.7l-2.2-1.4c-.7 1.1-1.5 1.7-2.6 1.7-1.5 0-2.8-1.2-3.2-2.8h8.6c.1-.4.1-.8.1-1.2 0-3-2-5.7-5.2-5.7zM39 10c.3-1.6 1.6-2.8 3.2-2.8s2.8 1.2 3.2 2.8H39z"/><path fill="#FBBC04" d="M51.1 13.9c1.6 1.5 3.8 2.4 6.2 2.4 3.2 0 5.6-2.4 5.6-6.1s-2.4-6.1-5.6-6.1c-2.4 0-4.6.9-6.2 2.4l2.1 2.1c1-1 2.3-1.6 3.9-1.6 1.8 0 3.5 1.4 3.5 4s-1.7 4-3.5 4c-1.6 0-3-.6-3.9-1.6l-2.1 2.1z"/></svg>
                      </button>
                 </div>
            </div>

            <div className="my-4 flex items-center">
              <div className="flex-grow border-t border-gray-600"></div>
              <span className="flex-shrink mx-4 text-gray-400 text-xs font-semibold">OU PAYER PAR CARTE</span>
              <div className="flex-grow border-t border-gray-600"></div>
            </div>

            <div className="space-y-4">
              <input type="text" placeholder="Nom sur la carte" className="w-full bg-gray-700 text-white p-3 rounded-md border border-gray-600 focus:ring-cyan-500 focus:border-cyan-500 outline-none" />
              <input type="text" placeholder="Numéro de la carte" className="w-full bg-gray-700 text-white p-3 rounded-md border border-gray-600 focus:ring-cyan-500 focus:border-cyan-500 outline-none" />
              <div className="flex gap-4">
                  <input type="text" placeholder="MM / AA" className="w-1/2 bg-gray-700 text-white p-3 rounded-md border border-gray-600 focus:ring-cyan-500 focus:border-cyan-500 outline-none" />
                  <input type="text" placeholder="CVC" className="w-1/2 bg-gray-700 text-white p-3 rounded-md border border-gray-600 focus:ring-cyan-500 focus:border-cyan-500 outline-none" />
              </div>
            </div>

            <button onClick={handleNextStep} className="w-full mt-6 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-4 rounded-lg">
              Suivant
            </button>
          </div>
        );
      case 3: // Contrat
        return (
          <div>
            <h3 className="text-xl font-bold mb-4 text-center">Contrat de Service</h3>
            <div className="h-40 overflow-y-auto p-3 bg-gray-800/60 rounded-md border border-gray-700 text-sm text-gray-300 mb-4">
              <p>Ce contrat régit votre utilisation de la plateforme Findaphotographer...</p>
              <p className="mt-2 font-bold">Structure des Commissions :</p>
              <ul className="list-disc list-inside ml-2">
                <li>Utilisateur standard : 20%</li>
                <li>Professionnel Vérifié : 15%</li>
                <li>Membre Premium : 8%</li>
              </ul>
              <p className="mt-2">En acceptant, vous vous engagez à respecter les règles de la communauté...</p>
            </div>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input type="checkbox" checked={agreed} onChange={() => setAgreed(!agreed)} className="w-5 h-5 rounded bg-gray-700 border-gray-600 text-cyan-500 focus:ring-cyan-500" />
              <span className="text-gray-300">J'ai lu et j'accepte les termes et conditions.</span>
            </label>
            <button onClick={handleNextStep} disabled={!agreed} className="w-full mt-6 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-4 rounded-lg disabled:bg-gray-600 disabled:cursor-not-allowed">
              Suivant
            </button>
          </div>
        );
      case 4: // Signature
        return (
          <div>
            <h3 className="text-xl font-bold mb-2 text-center">Signature Électronique</h3>
            <p className="text-gray-400 mb-6 text-center">Veuillez taper votre nom complet pour signer le contrat.</p>
            <input 
              type="text" 
              placeholder="Votre nom complet" 
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              className="w-full bg-gray-700 text-white p-3 rounded-md border border-gray-600 focus:ring-cyan-500 focus:border-cyan-500 outline-none font-serif text-lg text-center"
            />
             <button onClick={handleFinalize} disabled={signature.trim().length < 3} className="w-full mt-6 bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-4 rounded-lg disabled:bg-gray-600 disabled:cursor-not-allowed">
              Finaliser l'Inscription
            </button>
          </div>
        );
       case 5: // Confirmation
        return (
            <div className="text-center">
                 <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon name="check" className="w-10 h-10 text-green-400" />
                 </div>
                 <h3 className="text-2xl font-bold text-white">Félicitations !</h3>
                 <p className="text-gray-300 mt-2">Vous êtes maintenant un professionnel vérifié. Explorez vos nouveaux avantages et commencez à collaborer !</p>
                 <button onClick={onClose} className="w-full mt-8 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-4 rounded-lg">
                    Explorer
                </button>
            </div>
        )
    }
  };

  return (
    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-gray-900/80 backdrop-blur-md rounded-2xl w-full max-w-md border border-gray-700 shadow-2xl shadow-purple-500/10 animate-scale-in">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-lg font-bold">Devenir un Professionnel</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <Icon name="close" />
          </button>
        </div>

        {step < 5 && <div className="p-6">
            <div className="flex justify-center items-start mb-6">
                <StepIndicator stepNumber={1} label="Identité" icon="user" />
                <div className={`flex-1 h-0.5 mt-5 ${step > 1 ? 'bg-cyan-500' : 'bg-gray-600'}`}></div>
                <StepIndicator stepNumber={2} label="Paiement" icon="banknotes" />
                <div className={`flex-1 h-0.5 mt-5 ${step > 2 ? 'bg-cyan-500' : 'bg-gray-600'}`}></div>
                <StepIndicator stepNumber={3} label="Contrat" icon="shieldCheck" />
                <div className={`flex-1 h-0.5 mt-5 ${step > 3 ? 'bg-cyan-500' : 'bg-gray-600'}`}></div>
                <StepIndicator stepNumber={4} label="Signature" icon="signature" />
            </div>
            {renderContent()}
        </div>}
        
        {step === 5 && <div className="p-6">{renderContent()}</div>}

      </div>
    </div>
  );
};

export default OnboardingModal;