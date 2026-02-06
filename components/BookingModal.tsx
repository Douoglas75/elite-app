
import React, { useState, useMemo } from 'react';
import type { User } from '../types';
import Icon from './Icon';
import { useAppContext } from '../contexts/AppContext';
import { useUser } from '../contexts/UserContext';

interface BookingModalProps {
  user: User;
}

type BookingStep = 'date' | 'time' | 'brief' | 'payment' | 'confirmed';

const startTimes = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"];

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
  
  const prestationTotal = (user.rate || 0) * duration;
  const eliteFee = prestationTotal * 0.12;
  const finalTotal = prestationTotal + eliteFee;

  const renderContent = () => {
    switch (step) {
      case 'date':
        return (
          <div className="p-8">
            <h3 className="text-[10px] font-black text-[#D2B48C] uppercase tracking-[0.4em] text-center mb-8">Disponibilités</h3>
            <div className="grid grid-cols-4 gap-3">
              {[...Array(20)].map((_, i) => {
                const d = new Date(); d.setDate(d.getDate() + i);
                return (
                  <button key={i} onClick={() => handleDateSelect(d)} className={`p-5 rounded-3xl border transition-all flex flex-col items-center justify-center ${selectedDate?.toDateString() === d.toDateString() ? 'bg-[#D2B48C] border-[#D2B48C] text-[#050B14]' : 'bg-[#1A2536] border-white/5 text-slate-400 hover:border-white/20'}`}>
                    <span className="text-[8px] font-black uppercase opacity-60 mb-1">{d.toLocaleDateString('fr-FR', { weekday: 'short' })}</span>
                    <span className="text-xl font-black">{d.getDate()}</span>
                  </button>
                )
              })}
            </div>
          </div>
        );
      case 'time':
        return (
          <div className="p-8 space-y-10">
            <button onClick={() => setStep('date')} className="text-[10px] font-black text-[#D2B48C] uppercase tracking-[0.3em] flex items-center gap-2"><Icon name="chevronRight" className="w-4 h-4 rotate-180" /> Calendrier</button>
            <div className="space-y-8">
                <div>
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Heure de début</h4>
                    <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                        {startTimes.map(t => (
                            <button key={t} onClick={() => setSelectedStartTime(t)} className={`px-8 py-4 rounded-2xl border font-black whitespace-nowrap transition-all ${selectedStartTime === t ? 'bg-[#D2B48C] border-[#D2B48C] text-[#050B14]' : 'bg-[#1A2536] border-white/10 text-white'}`}>{t}</button>
                        ))}
                    </div>
                </div>
                <div>
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 flex justify-between">
                        <span>Durée de la mission</span>
                        <span className="text-[#D2B48C] text-lg font-black">{duration}H</span>
                    </h4>
                    <input 
                      type="range" 
                      min="1" 
                      max="8" 
                      step="1"
                      value={duration} 
                      onChange={(e) => setDuration(Number(e.target.value))} 
                      className="w-full h-2 bg-[#1A2536] rounded-full appearance-none cursor-pointer accent-[#D2B48C]" 
                    />
                </div>
            </div>
            
            <div className="bg-[#1A2536] p-6 rounded-[2.5rem] flex justify-between items-center border border-white/5 shadow-inner">
                <div className="space-y-0.5">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Base Prestation</p>
                    <p className="text-[10px] text-[#D2B48C] font-bold uppercase">${user.rate}/h</p>
                </div>
                <p className="text-3xl font-black text-white">${prestationTotal}</p>
            </div>
            
            <button onClick={() => setStep('brief')} className="w-full bg-[#D2B48C] text-[#050B14] font-black py-5 rounded-2xl uppercase tracking-[0.3em] text-[10px] shadow-2xl active:scale-95 transition-all">Valider l'horaire</button>
          </div>
        );
      case 'brief':
        return (
          <div className="p-8 space-y-8">
            <button onClick={() => setStep('time')} className="text-[10px] font-black text-[#D2B48C] uppercase tracking-[0.3em] flex items-center gap-2"><Icon name="chevronRight" className="w-4 h-4 rotate-180" /> Horaire</button>
            <div className="space-y-6">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Brief du Projet</h4>
                <textarea 
                  rows={5} 
                  value={notes} 
                  onChange={(e) => setNotes(e.target.value)} 
                  placeholder="Expliquez vos attentes, le lieu, le style..." 
                  className="w-full bg-[#1A2536] border border-white/5 rounded-[2rem] p-6 text-sm text-white outline-none focus:border-[#D2B48C]/40 resize-none leading-relaxed" 
                />
            </div>
            <button onClick={() => setStep('payment')} className="w-full bg-[#D2B48C] text-[#050B14] font-black py-5 rounded-2xl uppercase tracking-[0.3em] text-[10px] shadow-2xl active:scale-95 transition-all">Vers le Paiement</button>
          </div>
        );
      case 'payment':
        return (
          <div className="p-8 space-y-10">
            <h3 className="text-[10px] font-black text-white uppercase tracking-[0.4em] text-center">Elite Trust Securisation</h3>
            <div className="bg-[#1A2536] p-8 rounded-[3rem] border border-white/5 space-y-5 shadow-inner">
                <div className="flex justify-between text-[11px]"><span className="text-slate-500 font-bold uppercase tracking-widest">Prestation ({duration}h)</span><span className="text-white font-black">${prestationTotal.toFixed(2)}</span></div>
                <div className="flex justify-between text-[11px]"><span className="text-slate-500 font-bold uppercase tracking-widest">Frais Service (12%)</span><span className="text-[#D2B48C] font-black">${eliteFee.toFixed(2)}</span></div>
                <div className="pt-6 border-t border-white/10 flex justify-between items-center"><span className="text-white font-black uppercase text-xs tracking-widest">TOTAL ESCROW</span><span className="text-4xl font-black text-[#D2B48C] tracking-tighter">${finalTotal.toFixed(2)}</span></div>
            </div>
            <button onClick={() => {
                confirmBooking({ professionalId: user.id, date: selectedDate?.toLocaleDateString(), time: selectedStartTime, duration, notes });
                setStep('confirmed');
            }} className="w-full bg-[#D2B48C] text-[#050B14] font-black py-6 rounded-[2rem] uppercase tracking-[0.4em] text-[10px] shadow-2xl active:scale-95 transition-all">Déposer & Réserver</button>
          </div>
        );
      case 'confirmed':
        return (
          <div className="p-12 text-center animate-scale-in space-y-8">
             <div className="w-24 h-24 bg-[#D2B48C]/10 rounded-full flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(210,180,140,0.15)] border border-[#D2B48C]/30"><Icon name="check" className="w-12 h-12 text-[#D2B48C]" /></div>
             <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Mission Réservée</h3>
             <p className="text-slate-500 text-sm font-bold uppercase tracking-widest leading-relaxed">Fonds séquestrés. Le talent va confirmer votre demande.</p>
             <button onClick={() => setBookingUser(null)} className="w-full mt-4 bg-[#1A2536] text-white font-black py-5 rounded-2xl uppercase tracking-widest text-[10px]">Terminer</button>
          </div>
        )
    }
  };

  return (
    <div className="fixed inset-0 bg-[#050B14]/90 backdrop-blur-2xl flex items-end md:items-center justify-center z-[6000] animate-fade-in p-0 md:p-6">
      <div className="bg-[#0D1625] border-t md:border border-white/10 rounded-t-[3.5rem] md:rounded-[3.5rem] w-full max-w-lg overflow-hidden shadow-2xl relative">
        <button onClick={() => setBookingUser(null)} className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors p-2"><Icon name="close" className="w-5 h-5" /></button>
        {renderContent()}
      </div>
    </div>
  );
};

export default BookingModal;
