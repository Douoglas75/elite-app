
import React, { useState, useMemo } from 'react';
import type { User } from '../types';
import Icon from './Icon';
import { useAppContext } from '../contexts/AppContext';
import { useUser } from '../contexts/UserContext';

interface BookingModalProps {
  user: User;
}

type BookingStep = 'date' | 'time' | 'brief' | 'payment' | 'confirmed';

const startTimes = [
    "08:00", "09:00", "10:00", "11:00", "12:00", 
    "13:00", "14:00", "15:00", "16:00", "17:00", 
    "18:00", "19:00", "20:00"
];

const BookingModal: React.FC<BookingModalProps> = ({ user }) => {
  const [step, setStep] = useState<BookingStep>('date');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedStartTime, setSelectedStartTime] = useState(startTimes[2]);
  const [duration, setDuration] = useState(2);
  const [notes, setNotes] = useState('');
  const [location, setLocation] = useState('');
  
  const { setBookingUser } = useAppContext();
  const { confirmBooking } = useUser();

  const next30Days = useMemo(() => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  }, []);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setStep('time');
  };
  
  const handlePaymentConfirm = () => {
    if (selectedDate) {
      confirmBooking({
        professionalId: user.id,
        date: selectedDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
        time: selectedStartTime,
        duration: duration,
        notes,
        shootLocation: location || "À définir"
      });
      setStep('confirmed');
    }
  };
  
  const onClose = () => setBookingUser(null);

  const renderContent = () => {
    switch (step) {
      case 'date':
        return (
          <div className="p-5 overflow-y-auto max-h-[60dvh] no-scrollbar">
            <h3 className="text-sm font-black text-white uppercase tracking-widest text-center mb-6">Sélectionnez une date</h3>
            <div className="grid grid-cols-4 gap-2">
              {next30Days.map((date, idx) => (
                <button
                  key={idx}
                  onClick={() => handleDateSelect(date)}
                  className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all ${
                    selectedDate?.toDateString() === date.toDateString() 
                    ? 'bg-[#D2B48C] border-[#D2B48C] text-[#050B14]' 
                    : 'bg-[#1A2536] border-white/5 text-slate-400 hover:border-[#D2B48C]/50'
                  }`}
                >
                  <span className="text-[8px] uppercase font-black opacity-60">
                    {date.toLocaleDateString('fr-FR', { weekday: 'short' })}
                  </span>
                  <span className="text-lg font-black">{date.getDate()}</span>
                </button>
              ))}
            </div>
          </div>
        );
      case 'time':
        return (
          <div className="p-6 space-y-8">
            <button onClick={() => setStep('date')} className="text-[10px] font-black text-[#D2B48C] uppercase tracking-widest mb-2 flex items-center gap-2">
              <Icon name="chevronRight" className="w-3 h-3 rotate-180" /> Modifier date
            </button>
            
            <div>
                <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4">Heure de début</h3>
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                    {startTimes.map(time => (
                        <button 
                            key={time} 
                            onClick={() => setSelectedStartTime(time)} 
                            className={`px-6 py-3 rounded-xl border font-black transition-all ${selectedStartTime === time ? 'bg-[#D2B48C] border-[#D2B48C] text-[#050B14]' : 'bg-[#1A2536] border-white/5 text-white'}`}
                        >
                            {time}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4 flex justify-between">
                    <span>Céneau horaire (Durée)</span>
                    <span className="text-[#D2B48C]">{duration}h</span>
                </h3>
                <div className="flex items-center gap-4">
                    <button onClick={() => setDuration(Math.max(1, duration - 1))} className="w-14 h-14 rounded-2xl bg-[#1A2536] border border-white/10 flex items-center justify-center text-white font-black text-2xl active:scale-90 transition-all">-</button>
                    <div className="flex-1 h-3 bg-[#1A2536] rounded-full relative overflow-hidden">
                        <div className="absolute h-full bg-[#D2B48C] transition-all duration-300" style={{ width: `${(duration / 8) * 100}%` }}></div>
                    </div>
                    <button onClick={() => setDuration(Math.min(8, duration + 1))} className="w-14 h-14 rounded-2xl bg-[#1A2536] border border-white/10 flex items-center justify-center text-white font-black text-2xl active:scale-90 transition-all">+</button>
                </div>
                <div className="flex justify-between mt-6 pt-6 border-t border-white/5">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Tarif Total Estimé</p>
                    <p className="text-2xl font-black text-white">${(user.rate * duration).toFixed(0)}</p>
                </div>
            </div>

            <button onClick={() => setStep('brief')} className="w-full bg-[#D2B48C] text-[#050B14] font-black py-4 rounded-xl uppercase tracking-widest text-xs">
              Continuer vers le brief
            </button>
          </div>
        );
      case 'brief':
        return (
          <div className="p-6 space-y-6">
            <button onClick={() => setStep('time')} className="text-[10px] font-black text-[#D2B48C] uppercase tracking-widest mb-2 flex items-center gap-2">
                <Icon name="chevronRight" className="w-3 h-3 rotate-180" /> Modifier horaire
            </button>
            <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Lieu (Studio/Extérieur)</label>
                  <input 
                    type="text" 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Paris 08, Studio Lumière..."
                    className="w-full bg-[#1A2536] text-white p-4 rounded-xl border border-white/5 focus:border-[#D2B48C]/50 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Brief & Instructions</label>
                  <textarea 
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Style, tenues, attentes..."
                    className="w-full bg-[#1A2536] text-white p-4 rounded-xl border border-white/5 focus:border-[#D2B48C]/50 outline-none text-sm resize-none"
                  />
                </div>
            </div>
            <button onClick={() => setStep('payment')} className="w-full bg-[#D2B48C] text-[#050B14] font-black py-4 rounded-xl uppercase tracking-widest text-xs shadow-xl shadow-[#D2B48C]/10">
              Étape Paiement
            </button>
          </div>
        );
      case 'payment':
        const prestationTotal = user.rate * duration;
        const serviceFee = prestationTotal * 0.12;
        const finalTotal = prestationTotal + serviceFee;

        return (
          <div className="p-6">
            <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6">Récapitulatif Escrow</h3>
            <div className="bg-[#1A2536] p-6 rounded-2xl mb-8 border border-white/5 space-y-4">
                <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Prestation ({duration}h)</span>
                    <span className="font-black text-white text-sm">${prestationTotal.toFixed(2)}</span>
                </div>
                 <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Frais Sécurisation Elite</span>
                    <span className="font-black text-[#D2B48C] text-sm">${serviceFee.toFixed(2)}</span>
                </div>
                 <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                    <span className="font-black text-white text-xs uppercase">TOTAL</span>
                    <span className="font-black text-2xl text-[#D2B48C]">${finalTotal.toFixed(2)}</span>
                </div>
            </div>
            
            <button onClick={handlePaymentConfirm} className="w-full bg-[#D2B48C] text-[#050B14] font-black py-5 rounded-2xl uppercase tracking-[0.2em] text-[10px] shadow-2xl">
              CONFIRMER RÉSERVATION
            </button>
          </div>
        );
      case 'confirmed':
        return (
            <div className="p-10 text-center animate-scale-in">
                 <div className="w-20 h-20 bg-[#D2B48C]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Icon name="check" className="w-10 h-10 text-[#D2B48C]" />
                 </div>
                 <h3 className="text-2xl font-black text-white uppercase tracking-tight">Demande Envoyée</h3>
                 <p className="text-slate-500 mt-3 text-sm font-medium">Le talent a été notifié de votre proposition de {duration}h.</p>
                 <button onClick={onClose} className="w-full mt-10 bg-[#1A2536] text-white font-black py-4 rounded-xl uppercase tracking-widest text-xs">
                    Fermer
                </button>
            </div>
        )
    }
  };

  return (
    <div className="fixed inset-0 bg-[#050B14]/80 backdrop-blur-xl flex items-end md:items-center justify-center z-[2000] p-0 md:p-4 animate-fade-in">
      <div className="bg-[#0D1625] border-t md:border border-white/10 rounded-t-[2.5rem] md:rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-white/5 flex justify-between items-center px-6">
          <span className="text-[9px] font-black text-[#D2B48C] uppercase tracking-[0.3em]">Elite Booking System</span>
          <button onClick={onClose} className="text-slate-500 hover:text-white p-2">
            <Icon name="close" className="w-5 h-5" />
          </button>
        </div>
        {renderContent()}
      </div>
    </div>
  );
};

export default BookingModal;
