import React, { useState, useEffect, useRef } from 'react';
import type { Booking, User } from '../types';
import Icon from './Icon';
import { useAppContext } from '../contexts/AppContext';
import { useUser } from '../contexts/UserContext';
import { generateContractClauses } from '../services/geminiService';

interface ContractModalProps {
  booking: Booking;
}

const ContractModal: React.FC<ContractModalProps> = ({ booking }) => {
  const { setSigningBooking } = useAppContext();
  const { users, currentUser } = useUser();
  const professional = users.find(u => u.id === booking.professionalId);
  const client = users.find(u => u.id === booking.clientId) || currentUser;

  const [clauses, setClauses] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [signature, setSignature] = useState('');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [step, setStep] = useState<'review' | 'sign' | 'complete'>('review');

  useEffect(() => {
    const fetchClauses = async () => {
      if (professional) {
        // Fix: Use 'types' array joined by slash instead of non-existent 'type' property
        const result = await generateContractClauses(professional.types.join('/'), client.types.join('/'));
        setClauses(result.clauses);
        setIsLoading(false);
      }
    };
    fetchClauses();
  }, [professional, client]);

  const handleSign = async () => {
    setIsGeneratingPdf(true);
    // Simulate Cloud Function Trigger for PDF Generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsGeneratingPdf(false);
    setStep('complete');
  };

  const onClose = () => setSigningBooking(null);

  if (!professional) return null;

  return (
    <div className="fixed inset-0 z-[2000] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-gray-900 border border-gray-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="bg-gray-800/50 p-4 border-b border-gray-700 flex justify-between items-center">
          <div className="flex items-center gap-3">
             <Icon name="shieldCheck" className="w-6 h-6 text-cyan-400" />
             <h2 className="text-sm font-black text-white uppercase tracking-widest">Contrat Intelligent Elite</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white p-1">
            <Icon name="close" className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar">
          {step === 'review' && (
            <div className="animate-fade-in">
              <div className="flex flex-col md:flex-row justify-between gap-8 mb-10 pb-10 border-b border-gray-800">
                  <div className="space-y-1">
                      <p className="text-[10px] text-gray-500 uppercase font-black">Prestataire (Pro)</p>
                      <p className="text-xl font-bold text-white">{professional.name}</p>
                      <p className="text-xs text-cyan-400">{professional.headline}</p>
                  </div>
                  <div className="md:text-right space-y-1">
                      <p className="text-[10px] text-gray-500 uppercase font-black">Client</p>
                      <p className="text-xl font-bold text-white">{client.name}</p>
                      <p className="text-xs text-gray-400">ID: #{client.id.toString().slice(-4)}</p>
                  </div>
              </div>

              <div className="bg-gray-800/30 rounded-2xl p-6 border border-gray-800 mb-8">
                  <h3 className="font-black text-xs text-gray-400 uppercase tracking-widest mb-4">Détails de la mission</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                          <p className="text-gray-500 text-[10px] font-bold uppercase mb-1">Date</p>
                          <p className="text-white font-semibold">{booking.date}</p>
                      </div>
                      <div>
                          <p className="text-gray-500 text-[10px] font-bold uppercase mb-1">Heure</p>
                          <p className="text-white font-semibold">{booking.time}</p>
                      </div>
                      <div>
                          <p className="text-gray-500 text-[10px] font-bold uppercase mb-1">Lieu</p>
                          <p className="text-white font-semibold">{booking.shootLocation}</p>
                      </div>
                      <div>
                          <p className="text-gray-500 text-[10px] font-bold uppercase mb-1">Total</p>
                          <p className="text-cyan-400 font-black">${professional.rate * booking.duration}</p>
                      </div>
                  </div>
              </div>

              <div className="space-y-6">
                  <h3 className="font-black text-xs text-gray-400 uppercase tracking-widest">Clauses Contractuelles (IA Draft)</h3>
                  {isLoading ? (
                    <div className="animate-pulse space-y-4">
                        {[1,2,3].map(i => <div key={i} className="h-10 bg-gray-800 rounded-lg w-full"></div>)}
                    </div>
                  ) : (
                    <div className="space-y-4">
                        {clauses.map((clause, idx) => (
                            <div key={idx} className="flex gap-4 items-start bg-gray-950 p-4 rounded-xl border border-gray-800/50">
                                <span className="w-6 h-6 flex-shrink-0 bg-cyan-900/30 text-cyan-400 rounded-lg flex items-center justify-center font-bold text-[10px]">{idx + 1}</span>
                                <p className="text-sm text-gray-300 leading-relaxed">{clause}</p>
                            </div>
                        ))}
                    </div>
                  )}
              </div>

              <button 
                onClick={() => setStep('sign')} 
                className="w-full mt-10 bg-cyan-600 hover:bg-cyan-500 text-white font-black py-4 rounded-2xl shadow-xl transition-all"
              >
                ACCÉDER À LA SIGNATURE
              </button>
            </div>
          )}

          {step === 'sign' && (
            <div className="animate-scale-in flex flex-col h-full items-center justify-center text-center py-10">
                <Icon name="signature" className="w-16 h-16 text-cyan-400 mb-6" />
                <h3 className="text-2xl font-black text-white mb-2">Signature Sécurisée</h3>
                <p className="text-gray-400 mb-10 max-w-sm">Veuillez apposer votre signature électronique pour valider ce contrat et déclencher le transfert des droits.</p>
                
                <div className="w-full max-w-md space-y-4">
                    <input 
                      type="text" 
                      placeholder="Tapez votre nom complet pour signer" 
                      value={signature}
                      onChange={(e) => setSignature(e.target.value)}
                      className="w-full bg-gray-950 text-white p-5 rounded-2xl border border-gray-800 focus:border-cyan-500 outline-none font-serif text-2xl text-center placeholder:text-gray-800"
                    />
                    <p className="text-[10px] text-gray-600 uppercase font-black tracking-widest">Valeur juridique certifiée par Elite Trust™</p>
                </div>

                <div className="w-full max-w-md flex gap-4 mt-12">
                    <button 
                        onClick={() => setStep('review')}
                        className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-400 font-bold py-4 rounded-2xl transition-all"
                    >
                        REVOIR
                    </button>
                    <button 
                        onClick={handleSign}
                        disabled={signature.length < 3 || isGeneratingPdf}
                        className="flex-2 bg-purple-600 hover:bg-purple-500 text-white font-black py-4 px-10 rounded-2xl shadow-xl transition-all disabled:opacity-30 flex items-center justify-center gap-3"
                    >
                        {isGeneratingPdf ? (
                            <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> GÉNÉRATION PDF...</>
                        ) : 'SIGNER & GÉNÉRER'}
                    </button>
                </div>
            </div>
          )}

          {step === 'complete' && (
              <div className="animate-scale-in text-center py-20">
                  <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                      <Icon name="check" className="w-12 h-12 text-green-400" />
                  </div>
                  <h3 className="text-3xl font-black text-white mb-4">CONTRAT SCELLÉ</h3>
                  <p className="text-gray-400 max-w-md mx-auto mb-10">Le PDF a été généré via Cloud Functions et envoyé par email aux deux parties. Une copie est disponible dans votre historique.</p>
                  
                  <div className="flex flex-col gap-3 max-w-xs mx-auto">
                      <button className="w-full bg-gray-800 hover:bg-gray-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3">
                          <Icon name="download" className="w-5 h-5" /> TÉLÉCHARGER LE PDF
                      </button>
                      <button onClick={onClose} className="w-full text-cyan-400 font-black py-4 uppercase tracking-widest text-xs">
                          RETOUR AU WORKFLOW
                      </button>
                  </div>
              </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContractModal;