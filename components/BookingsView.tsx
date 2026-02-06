
import React, { useState, memo } from 'react';
import type { Booking, User } from '../types';
import Icon from './Icon';
import { useUser } from '../contexts/UserContext';
import { useAppContext } from '../contexts/AppContext';

const BookingsView: React.FC = () => {
  const [view, setView] = useState<'upcoming' | 'requests' | 'past'>('upcoming');
  const { bookings, users, currentUser, updateBookingStatus } = useUser();
  const { setReviewingBooking, setSigningBooking, setActiveTab } = useAppContext();

  const findUser = (id: number) => users.find(u => u.id === id) || { name: 'Utilisateur', avatarUrl: '' };

  const myRequests = bookings.filter(b => b.professionalId === currentUser.id && b.status === 'Pending');
  const myUpcoming = bookings.filter(b => (b.clientId === currentUser.id || b.professionalId === currentUser.id) && b.status === 'Confirmed');
  const myPast = bookings.filter(b => (b.clientId === currentUser.id || b.professionalId === currentUser.id) && b.status === 'Completed');

  const bookingsToShow = view === 'upcoming' ? myUpcoming : (view === 'requests' ? myRequests : myPast);

  const BookingCard: React.FC<{ booking: Booking }> = ({ booking }) => {
    const isOwner = booking.professionalId === currentUser.id;
    const otherUser = findUser(isOwner ? booking.clientId : booking.professionalId);

    return (
      <div className="bg-[#0D1625] p-4 rounded-2xl border border-white/5 flex flex-col gap-4 animate-scale-in shadow-xl">
        <div className="flex gap-4">
            <img src={otherUser.avatarUrl} className="w-16 h-16 rounded-full object-cover border-2 border-[#D2B48C]/30" />
            <div className="flex-1">
              <div className="flex justify-between items-start">
                 <h3 className="font-bold text-white text-lg">{otherUser.name}</h3>
                 <span className="text-[10px] bg-white/5 px-2 py-1 rounded-md text-gray-400 font-mono">#{booking.id.toString().slice(-4)}</span>
              </div>
              <p className="text-[#D2B48C] font-bold text-sm mt-0.5">{booking.date} &bull; {booking.time}</p>
              <p className="text-[10px] text-gray-500 mt-2 line-clamp-1 italic uppercase tracking-wider font-bold">Durée: {booking.duration}h</p>
            </div>
        </div>

        {booking.status === 'Pending' && isOwner && (
            <div className="flex gap-2">
                <button onClick={() => updateBookingStatus(booking.id, 'Confirmed')} className="flex-1 bg-green-600 hover:bg-green-500 text-white font-black py-3 rounded-xl text-xs transition-all uppercase tracking-widest">Accepter</button>
                <button onClick={() => updateBookingStatus(booking.id, 'Declined')} className="flex-1 bg-red-900/20 text-red-500 font-black py-3 rounded-xl text-xs transition-all uppercase tracking-widest">Décliner</button>
            </div>
        )}

        {booking.status === 'Confirmed' && (
            <div className="flex gap-2">
                <button 
                  onClick={() => setSigningBooking(booking)}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-[#D2B48C] font-black py-3 rounded-xl text-[10px] flex items-center justify-center gap-2 uppercase tracking-widest border border-white/5"
                >
                  <Icon name="documentText" className="w-4 h-4" />
                  Signer Contrat
                </button>
                {isOwner && <button onClick={() => updateBookingStatus(booking.id, 'Completed')} className="flex-1 bg-cyan-600 text-[#050B14] font-black py-3 rounded-xl text-[10px] uppercase tracking-widest">Terminer Mission</button>}
            </div>
        )}

        {booking.status === 'Completed' && !booking.reviewSubmitted && booking.clientId === currentUser.id && (
            <button onClick={() => setReviewingBooking(booking)} className="w-full bg-[#D2B48C] text-[#050B14] font-black py-3 rounded-xl text-xs uppercase tracking-widest">Laisser un avis</button>
        )}
      </div>
    );
  };
  
  return (
    <div className="flex flex-col h-full bg-[#050B14] animate-fade-in">
      <header className="p-4 md:p-6 border-b border-white/5 flex items-center gap-4 bg-[#0D1625]/80 backdrop-blur-md sticky top-0 z-50">
        <button onClick={() => setActiveTab('discover')} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-[#D2B48C] transition-all">
           <Icon name="chevronRight" className="w-5 h-5 rotate-180" />
        </button>
        <h1 className="text-xl font-black text-white uppercase tracking-tighter">Workflows Pro</h1>
      </header>
      
      <div className="p-4">
        <div className="flex bg-[#0D1625] p-1 rounded-xl border border-white/5">
          <button onClick={() => setView('upcoming')} className={`flex-1 py-2.5 text-[9px] font-black rounded-lg transition-all uppercase tracking-widest ${view === 'upcoming' ? 'bg-[#D2B48C] text-[#050B14]' : 'text-gray-500'}`}>À VENIR</button>
          {currentUser.isPro && <button onClick={() => setView('requests')} className={`flex-1 py-2.5 text-[9px] font-black rounded-lg transition-all relative uppercase tracking-widest ${view === 'requests' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' : 'text-gray-500'}`}>
            DEMANDES {myRequests.length > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center border-2 border-[#050B14]">{myRequests.length}</span>}
          </button>}
          <button onClick={() => setView('past')} className={`flex-1 py-2.5 text-[9px] font-black rounded-lg transition-all uppercase tracking-widest ${view === 'past' ? 'bg-[#1A2536] text-white' : 'text-gray-500'}`}>HISTORIQUE</button>
        </div>
      </div>

      <div className="flex-1 px-4 overflow-y-auto pb-24 space-y-4">
          {bookingsToShow.length > 0 ? (
             bookingsToShow.map(booking => <BookingCard key={booking.id} booking={booking} />)
          ) : (
            <div className="text-center py-20 text-gray-600">
                <Icon name="calendar" className="w-12 h-12 mx-auto mb-4 opacity-10" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em]">Aucun workflow actif</p>
            </div>
          )}
      </div>
    </div>
  );
};

export default memo(BookingsView);
