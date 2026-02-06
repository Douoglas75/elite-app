
import React, { useState, useMemo } from 'react';
import type { User } from '../types';
import Icon from './Icon';
import { useAppContext } from '../contexts/AppContext';
import { useUser } from '../contexts/UserContext';

interface BookingModalProps {
  user: User;
}

type BookingStep = 'date' | 'time' | 'brief' | 'payment' | 'confirmed';

const startTimes = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];

const BookingModal: React.FC<BookingModalProps> = ({ user }) => {
  const [step, setStep] = useState<BookingStep>('date');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedStartTime, setSelectedStartTime] = useState(startTimes[2]);
  const [duration, setDuration] = useState(2);
  const [notes, setNotes] = useState('');
  
  const { setBookingUser } = useAppContext();
  const { confirmBooking } = useUser();

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setStep('time');
  };
  
  const prestationTotal = user.rate * duration;
  const eliteFee = prestationTotal * 0.12;
  const finalTotal = prestationTotal + eliteFee;

  const renderContent = () => {
    switch (step) {
      case 'date':
        return (
          <div className="p-6">
            <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] text-center mb-8">Date du Shooting</h3>
            <div className="grid grid-cols-4 gap-2.5">
              {[...Array(20)].map((_, i) => {
                const d = new Date(); d.setDate(d.getDate() + i);
                return (
                  <button key={i} onClick={() => handleDateSelect(d)} className={`p-4 rounded-2xl border transition-all flex flex-col items-center justify-center ${selectedDate?.toDateString() === d.toDateString() ? 'bg-[#D2B48C] border-[#D2B48C] text-[#050B14]' : 'bg-[#1A2536] border-white/5 text-slate-400'}`}>
                    <span className="text-[8px] font-black uppercase opacity-60">{d.toLocaleDateString('fr-FR', { weekday: 'short' })}</span>
                    <span className="text-lg font-black">{d.getDate()}</span>
                  </button>
                )
              })}
            </div>
          </div>
        );
      case 'time':
        return (
          <div className="p-6 space-y-8">
            <button onClick={() => setStep('date')} className="text-[10px] font-black text-[#D2B48C] uppercase tracking-widest flex items-center gap-2"><Icon name="chevronRight" className="w-3 h-3 rotate-180" /> Revenir</button>
            <div className="space-y-6">
                <div>
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Heure de début</h4>
                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                        {startTimes.map(t => (
                            <button key={t} onClick={() => setSelectedStartTime(t)} className={`px-6 py-3 rounded-xl border font-black whitespace-nowrap transition-all ${selectedStartTime === t ? 'bg-[#D2B48C] border-[#D2B48C] text-[#050B14]' : 'bg-[#1A2536] border-white/10 text-white'}`}>{t}</button>
                        ))}
                    </div>
                </div>
                <div>
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex justify-between">
                        <span>Durée de la mission</span>
                        <span className="text-[#D2B48C]">{duration} Heures</span>
                    </h4>
                    <input type="range" min="1" max="8" value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="w-full h-1.5 bg-[#1A2536] rounded-lg appearance-none cursor-pointer accent-[#D2B48C]" />
                </div>
            </div>
            <div className="bg-[#1A2536] p-5 rounded-2xl flex justify-between items-center border border-white/5">
                <p className="text-[10px] font-black text-slate-500 uppercase">Tarif Total Estimé</p>
                <p className="text-2xl font-black text-white">${prestationTotal}<span className="text-xs text-slate-500 ml-1">USD</span></p>
            </div>
            <button onClick={() => setStep('brief')} className="w-full bg-[#D2B48C] text-[#050B14] font-black py-4 rounded-xl uppercase tracking-[0.2em] text-[10px]">Confirmer l'horaire</button>
          </div>
        );
      case 'brief':
        return (
          <div className="p-6 space-y-6">
            <button onClick={() => setStep('time')} className="text-[10px] font-black text-[#D2B48C] uppercase tracking-widest flex items-center gap-2"><Icon name="chevronRight" className="w-3 h-3 rotate-180" /> Revenir</button>
            <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Détails du Brief</h4>
                <textarea rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ex: Shooting extérieur, 3 changements de tenue, direction artistique minimaliste..." className="w-full bg-[#1A2536] border border-white/5 rounded-2xl p-4 text-sm text-white outline-none focus:border-[#D2B48C]/40 resize-none leading-relaxed" />
            </div>
            <button onClick={() => setStep('payment')} className="w-full bg-[#D2B48C] text-[#050B14] font-black py-4 rounded-xl uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-[#D2B48C]/10">Étape Paiement Sécurisé</button>
          </div>
        );
      case 'payment':
        return (
          <div className="p-6 space-y-8">
            <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] text-center">Escrow Elite Trust</h3>
            <div className="space-y-3">
                <div className="flex justify-between text-xs"><span className="text-slate-500 font-bold uppercase">Prestation ({duration}h)</span><span className="text-white font-black">${prestationTotal.toFixed(2)}</span></div>
                <div className="flex justify-between text-xs"><span className="text-slate-500 font-bold uppercase">Frais Elite (12%)</span><span className="text-[#D2B48C] font-black">${eliteFee.toFixed(2)}</span></div>
                <div className="pt-4 border-t border-white/5 flex justify-between items-center"><span className="text-white font-black uppercase text-sm">TOTAL À SÉQUESTRER</span><span className="text-3xl font-black text-[#D2B48C]">${finalTotal.toFixed(2)}</span></div>
            </div>
            <button onClick={() => {
                confirmBooking({ professionalId: user.id, date: selectedDate?.toLocaleDateString(), time: selectedStartTime, duration, notes });
                setStep('confirmed');
            }} className="w-full bg-[#D2B48C] text-[#050B14] font-black py-5 rounded-2xl uppercase tracking-[0.25em] text-[10px] shadow-2xl">Déposer les fonds & Réserver</button>
          </div>
        );
      case 'confirmed':
        return (
          <div className="p-10 text-center animate-scale-in space-y-6">
             <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(34,197,94,0.2)] border border-green-500/30"><Icon name="check" className="w-10 h-10 text-green-400" /></div>
             <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Mission Réservée !</h3>
             <p className="text-slate-500 text-sm font-bold uppercase tracking-widest leading-relaxed">Les fonds sont sécurisés en Escrow.<br/>Le talent va être notifié.</p>
             <button onClick={() => setBookingUser(null)} className="w-full bg-[#1A2536] text-white font-black py-4 rounded-xl uppercase tracking-widest text-[10px]">Fermer</button>
          </div>
        )
    }
  };

  return (
    <div className="fixed inset-0 bg-[#050B14]/90 backdrop-blur-xl flex items-end md:items-center justify-center z-[6000] animate-fade-in p-0 md:p-4">
      <div className="bg-[#0D1625] border-t md:border border-white/10 rounded-t-[3rem] md:rounded-[3rem] w-full max-w-md overflow-hidden shadow-2xl relative">
        <button onClick={() => setBookingUser(null)} className="absolute top-6 right-6 text-slate-500 p-2"><Icon name="close" className="w-5 h-5" /></button>
        {renderContent()}
      </div>
    </div>
  );
};

export default BookingModal;
