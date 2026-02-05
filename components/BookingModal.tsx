
import React, { useState, useMemo } from 'react';
import type { User } from '../types';
import Icon from './Icon';
import { useAppContext } from '../contexts/AppContext';
import { useUser } from '../contexts/UserContext';

interface BookingModalProps {
  user: User;
}

type BookingStep = 'date' | 'time' | 'brief' | 'payment' | 'confirmed';

const timeSlots = [
    { id: 'morning', label: 'Matin', time: '09:00 - 12:00', duration: 3 },
    { id: 'afternoon', label: 'Après-midi', time: '14:00 - 17:00', duration: 3 },
    { id: 'evening', label: 'Soirée', time: '18:00 - 20:00', duration: 2 },
];

const BookingModal: React.FC<BookingModalProps> = ({ user }) => {
  const [step, setStep] = useState<BookingStep>('date');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<(typeof timeSlots)[0]>(timeSlots[0]);
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
  
  const handleTimeSelect = (slot: (typeof timeSlots)[0]) => {
    setSelectedTimeSlot(slot);
    setStep('brief');
  };

  const handlePaymentConfirm = () => {
    if (selectedDate && selectedTimeSlot) {
      confirmBooking({
        professionalId: user.id,
        date: selectedDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
        time: selectedTimeSlot.time,
        duration: selectedTimeSlot.duration,
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
          <div className="p-4">
            <h3 className="text-lg font-bold mb-4 text-center">Choisissez une date</h3>
            <div className="grid grid-cols-5 gap-2 max-h-80 overflow-y-auto no-scrollbar p-1">
              {next30Days.map((date, idx) => (
                <button
                  key={idx}
                  onClick={() => handleDateSelect(date)}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                    selectedDate?.toDateString() === date.toDateString() 
                    ? 'bg-cyan-600 border-cyan-400 text-white' 
                    : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-cyan-500/50'
                  }`}
                >
                  <span className="text-[10px] uppercase font-bold opacity-70">
                    {date.toLocaleDateString('fr-FR', { weekday: 'short' })}
                  </span>
                  <span className="text-lg font-black">{date.getDate()}</span>
                  <span className="text-[10px] uppercase">{date.toLocaleDateString('fr-FR', { month: 'short' })}</span>
                </button>
              ))}
            </div>
          </div>
        );
      case 'time':
        return (
          <div className="p-6">
            <button onClick={() => setStep('date')} className="text-xs text-cyan-400 mb-4 flex items-center gap-1">&larr; Modifier la date</button>
            <h3 className="text-xl font-bold mb-4 text-center">Créneau de shooting</h3>
            <div className="space-y-3">
                {timeSlots.map(slot => (
                    <button 
                      key={slot.id} 
                      onClick={() => handleTimeSelect(slot)} 
                      className={`w-full text-left p-4 rounded-xl border transition-all flex justify-between items-center ${
                        selectedTimeSlot.id === slot.id ? 'bg-cyan-600/20 border-cyan-500' : 'bg-gray-800 border-gray-700 hover:border-cyan-500/50'
                      }`}
                    >
                       <div>
                         <p className="font-bold text-white">{slot.label}</p>
                         <p className="text-xs text-gray-400 italic">{slot.time} ({slot.duration}h)</p>
                       </div>
                       <p className="font-black text-xl text-cyan-400">${user.rate * slot.duration}</p>
                    </button>
                ))}
            </div>
          </div>
        );
      case 'brief':
        return (
          <div className="p-6 space-y-4">
            <button onClick={() => setStep('time')} className="text-xs text-cyan-400 mb-2 flex items-center gap-1">&larr; Modifier le créneau</button>
            <h3 className="text-xl font-bold mb-2">Détails du projet</h3>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Lieu du shooting</label>
              <input 
                type="text" 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ex: Studio 5, ou adresse précise..."
                className="w-full bg-gray-800 text-white p-3 rounded-xl border border-gray-700 focus:border-cyan-500 outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Brief Créatif / Notes</label>
              <textarea 
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Décrivez vos attentes, style, tenues..."
                className="w-full bg-gray-800 text-white p-3 rounded-xl border border-gray-700 focus:border-cyan-500 outline-none text-sm resize-none"
              />
            </div>
            <button onClick={() => setStep('payment')} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-black py-3 rounded-xl shadow-lg transition-all">
              ÉTAPE PAIEMENT
            </button>
          </div>
        );
      case 'payment':
        const prestationTotal = user.rate * selectedTimeSlot.duration;
        const serviceFee = prestationTotal * 0.12; // 12% standard service fee
        const finalTotal = prestationTotal + serviceFee;

        return (
          <div className="p-6">
            <button onClick={() => setStep('brief')} className="text-xs text-cyan-400 mb-4 flex items-center gap-1">&larr; Modifier le brief</button>
            <h3 className="text-xl font-bold mb-4">Finalisation Escrow</h3>
            <div className="bg-gray-800/80 p-5 rounded-2xl mb-6 border border-gray-700 space-y-3">
                <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">Prestation ({selectedTimeSlot.duration}h)</span>
                    <span className="font-bold">${prestationTotal.toFixed(2)}</span>
                </div>
                 <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">Frais de service (Escrow)</span>
                    <span className="font-bold text-cyan-400">${serviceFee.toFixed(2)}</span>
                </div>
                 <div className="flex justify-between items-center text-white pt-3 border-t border-gray-700">
                    <span className="font-black text-lg">TOTAL</span>
                    <span className="font-black text-2xl text-cyan-400">${finalTotal.toFixed(2)}</span>
                </div>
            </div>
            
            <p className="text-[10px] text-gray-500 mb-4 text-center leading-relaxed">
              Vos fonds seront retenus en séquestre et libérés uniquement après votre validation du shooting.
            </p>

            <button onClick={handlePaymentConfirm} className="w-full bg-purple-600 hover:bg-purple-500 text-white font-black py-4 rounded-xl shadow-xl transition-all uppercase tracking-widest">
              CONFIRMER LA RÉSERVATION
            </button>
          </div>
        );
      case 'confirmed':
        return (
            <div className="p-10 text-center animate-scale-in">
                 <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                    <Icon name="check" className="w-10 h-10 text-green-400" />
                 </div>
                 <h3 className="text-2xl font-black text-white uppercase tracking-tight">Demande envoyée !</h3>
                 <p className="text-gray-400 mt-3 text-sm leading-relaxed">
                   {user.name} a reçu votre proposition pour le {selectedDate?.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}.
                 </p>
                 <button onClick={onClose} className="w-full mt-10 bg-gray-800 hover:bg-gray-700 text-white font-bold py-4 rounded-xl transition-all">
                    RETOUR À LA DÉCOUVERTE
                </button>
            </div>
        )
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-[2000] p-4 animate-fade-in">
      <div className="bg-gray-900 border border-gray-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="bg-gray-800/50 p-4 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-sm font-black text-cyan-400 uppercase tracking-widest">Réservation Elite</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white p-1">
            <Icon name="close" className="w-5 h-5" />
          </button>
        </div>
        {renderContent()}
      </div>
    </div>
  );
};

export default BookingModal;
