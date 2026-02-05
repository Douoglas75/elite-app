
import React, { useState, memo } from 'react';
import type { Booking, User } from '../types';
import Icon from './Icon';
import { useUser } from '../contexts/UserContext';
import { useAppContext } from '../contexts/AppContext';

const BookingsView: React.FC = () => {
  const [view, setView] = useState<'upcoming' | 'requests' | 'past'>('upcoming');
  const { bookings, users, currentUser, updateBookingStatus } = useUser();
  const { setReviewingBooking, setSigningBooking } = useAppContext();

  const findUser = (id: number) => users.find(u => u.id === id) || { name: 'Utilisateur', avatarUrl: '' };

  const myRequests = bookings.filter(b => b.professionalId === currentUser.id && b.status === 'Pending');
  const myUpcoming = bookings.filter(b => (b.clientId === currentUser.id || b.professionalId === currentUser.id) && b.status === 'Confirmed');
  const myPast = bookings.filter(b => (b.clientId === currentUser.id || b.professionalId === currentUser.id) && b.status === 'Completed');

  const bookingsToShow = view === 'upcoming' ? myUpcoming : (view === 'requests' ? myRequests : myPast);

  const BookingCard: React.FC<{ booking: Booking }> = ({ booking }) => {
    const isOwner = booking.professionalId === currentUser.id;
    const otherUser = findUser(isOwner ? booking.clientId : booking.professionalId);

    return (
      <div className="bg-gray-800 p-4 rounded-2xl border border-gray-700 flex flex-col gap-4 animate-scale-in shadow-xl">
        <div className="flex gap-4">
            <img src={otherUser.avatarUrl} className="w-16 h-16 rounded-full object-cover border-2 border-cyan-500/30" />
            <div className="flex-1">
              <div className="flex justify-between items-start">
                 <h3 className="font-bold text-white text-lg">{otherUser.name}</h3>
                 <span className="text-[10px] bg-gray-700 px-2 py-1 rounded-md text-gray-400 font-mono">#{booking.id.toString().slice(-4)}</span>
              </div>
              <p className="text-cyan-400 font-bold text-sm mt-0.5">{booking.date} &bull; {booking.time}</p>
              <p className="text-xs text-gray-400 mt-2 line-clamp-1 italic">"{booking.notes || 'Pas de brief spécifique'}"</p>
            </div>
        </div>

        {booking.status === 'Pending' && isOwner && (
            <div className="flex gap-2">
                <button onClick={() => updateBookingStatus(booking.id, 'Confirmed')} className="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold py-2 rounded-xl text-sm transition-all">Accepter</button>
                <button onClick={() => updateBookingStatus(booking.id, 'Declined')} className="flex-1 bg-gray-700 hover:bg-red-900 text-white font-bold py-2 rounded-xl text-sm transition-all">Décliner</button>
            </div>
        )}

        {booking.status === 'Confirmed' && (
            <div className="flex gap-2">
                <button 
                  onClick={() => setSigningBooking(booking)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 rounded-xl text-sm flex items-center justify-center gap-2"
                >
                  <Icon name="documentText" className="w-4 h-4" />
                  Signer Contrat
                </button>
                {isOwner && <button onClick={() => updateBookingStatus(booking.id, 'Completed')} className="flex-1 bg-purple-600 text-white font-bold py-2 rounded-xl text-sm">Terminer</button>}
            </div>
        )}

        {booking.status === 'Completed' && !booking.reviewSubmitted && booking.clientId === currentUser.id && (
            <button onClick={() => setReviewingBooking(booking)} className="w-full bg-cyan-600 text-white font-bold py-2 rounded-xl text-sm">Laisser un avis</button>
        )}
      </div>
    );
  };
  
  return (
    <div className="flex flex-col h-full bg-gray-950 animate-fade-in">
      <header className="p-4 border-b border-gray-800/50">
        <h1 className="text-2xl font-black text-white uppercase tracking-tighter">Workflow Pro</h1>
      </header>
      
      <div className="p-4">
        <div className="flex bg-gray-900 p-1 rounded-xl border border-gray-800">
          <button onClick={() => setView('upcoming')} className={`flex-1 py-2 text-xs font-black rounded-lg transition-all ${view === 'upcoming' ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/20' : 'text-gray-500'}`}>À VENIR</button>
          {currentUser.isPro && <button onClick={() => setView('requests')} className={`flex-1 py-2 text-xs font-black rounded-lg transition-all relative ${view === 'requests' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' : 'text-gray-500'}`}>
            DEMANDES {myRequests.length > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center border-2 border-gray-950">{myRequests.length}</span>}
          </button>}
          <button onClick={() => setView('past')} className={`flex-1 py-2 text-xs font-black rounded-lg transition-all ${view === 'past' ? 'bg-gray-800 text-white' : 'text-gray-500'}`}>HISTORIQUE</button>
        </div>
      </div>

      <div className="flex-1 px-4 overflow-y-auto pb-24 space-y-4">
          {bookingsToShow.length > 0 ? (
             bookingsToShow.map(booking => <BookingCard key={booking.id} booking={booking} />)
          ) : (
            <div className="text-center py-20 text-gray-600">
                <Icon name="calendar" className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p className="text-sm font-bold uppercase tracking-widest">Aucune session trouvée</p>
            </div>
          )}
      </div>
    </div>
  );
};

export default memo(BookingsView);
