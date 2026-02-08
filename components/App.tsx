
import React, { useEffect, useState, useMemo } from 'react';
import UserProfileCard from './UserProfileCard';
import QuizModal from './QuizModal';
import Icon from './Icon';
import ProfileDetail from './ProfileDetail';
import MapView from './MapView';
import MessagesView from './MessagesView';
import BookingsView from './BookingsView';
import ProfileView from './ProfileView';
import FavoritesView from './FavoritesView';
import ChatView from './ChatView';
import QuizNotificationPopup from './QuizNotificationPopup';
import BookingModal from './BookingModal';
import OnboardingModal from './OnboardingModal';
import ReviewModal from './ReviewModal';
import ContractModal from './ContractModal';
import ARProjector from './ARProjector';
import LoginScreen from './LoginScreen';
import InitialSetupScreen from './InitialSetupScreen';
import EditProfileScreen from './EditProfileScreen';
import SubViewScreen from './SubViewScreen';
import GuidedTour from './GuidedTour';
import PaymentScreen from './PaymentScreen';
import MoodboardView from './MoodboardView';
import GalleryView from './GalleryView';
import Layout from './Layout';
import Lightbox from './Lightbox';
import { useUser } from '../contexts/UserContext';
import { useAppContext } from '../contexts/AppContext';
import { UserType, DiscoverMode } from '../types';
import { checkApiKeyStatus } from '../services/geminiService';

const App: React.FC = () => {
  const { isLoggedIn, isProfileComplete, users, messages, spots, currentUser } = useUser();
  const {
    activeTab, discoverView, discoverMode, viewingUser, activeChatThreadId, activeSubView, projectingMedia,
    filterType, setFilterType, filterSpotCategory, setFilterSpotCategory, filterAvailable, setFilterAvailable, searchQuery, setSearchQuery,
    isQuizOpen, bookingUser, signingBooking, isOnboardingOpen, reviewingBooking, isEditingProfile, isTourActive,
    setDiscoverView, setDiscoverMode, setQuizOpen, setBookingUser, setOnboardingOpen, setReviewingBooking,
    handleBack, viewProfile, closeTour
  } = useAppContext();

  const [showQuizNotify, setShowQuizNotify] = useState(false);

  useEffect(() => {
    if (isLoggedIn && isProfileComplete) {
      const timer = setTimeout(() => setShowQuizNotify(true), 15000);
      return () => clearTimeout(timer);
    }
  }, [isLoggedIn, isProfileComplete]);

  const filteredUsers = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return users.filter(user => {
      // Pour les tests, on autorise l'utilisateur à se voir lui-même dans les résultats
      // s'il cherche spécifiquement son nom.
      const matchesType = filterType === 'All' || (user.types && user.types.includes(filterType as UserType));
      const matchesAvailability = !filterAvailable || user.isAvailableNow;
      
      const nameMatch = user.name.toLowerCase().includes(query);
      const headlineMatch = user.headline && user.headline.toLowerCase().includes(query);
      const bioMatch = user.bio && user.bio.toLowerCase().includes(query);
      
      const matchesSearch = query === '' || nameMatch || headlineMatch || bioMatch;
      
      return matchesType && matchesAvailability && matchesSearch;
    });
  }, [users, filterType, filterAvailable, searchQuery]);

  const filteredSpots = useMemo(() => {
      const query = searchQuery.toLowerCase().trim();
      return spots.filter(spot => {
          const matchesCat = filterSpotCategory === 'All' || spot.category === filterSpotCategory || spot.type === filterSpotCategory;
          const matchesSearch = query === '' || spot.name.toLowerCase().includes(query);
          return matchesCat && matchesSearch;
      });
  }, [spots, filterSpotCategory, searchQuery]);

  const spotCategories = useMemo(() => {
    const cats = Array.from(new Set(spots.map(s => s.category)));
    return ['All', ...cats];
  }, [spots]);

  if (!isLoggedIn) return <LoginScreen />;
  if (!isProfileComplete) return <InitialSetupScreen />;

  const renderContent = () => {
    if (activeSubView) {
      if (activeSubView === 'moodboard') return <SubViewScreen title="Moodboard Collab" onBack={handleBack}><MoodboardView bookingId={1} /></SubViewScreen>;
      if (activeSubView === 'gallery') return <SubViewScreen title="Livrables Pro" onBack={handleBack}><GalleryView isPaid={false} /></SubViewScreen>;
      if (activeSubView === 'payment') return <SubViewScreen title="Portefeuille Elite" onBack={handleBack}><PaymentScreen /></SubViewScreen>;
      return <SubViewScreen title={activeSubView} onBack={handleBack}><div className="p-12 text-slate-500 italic text-center">Module en cours de déploiement...</div></SubViewScreen>;
    }

    if (activeChatThreadId) {
      const thread = messages.find(t => t.id === activeChatThreadId);
      const otherUser = users.find(u => u.id === thread?.participantId);
      if (thread && otherUser) return <ChatView thread={thread} otherUser={otherUser} onBack={handleBack} />;
    }

    if (viewingUser) return <ProfileDetail user={viewingUser} onBack={handleBack} />;

    switch (activeTab) {
      case 'discover':
        return (
          <div className="flex flex-col h-full bg-[#050B14]">
            <header className="p-6 md:p-8 flex flex-col gap-6 border-b border-white/5 bg-[#0D1625]/80 backdrop-blur-3xl z-[100] sticky top-0">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-black text-white uppercase tracking-tighter" data-tour="app-logo">Elite <span className="text-[#D2B48C]">Discover</span></h1>
                    
                    <div className="bg-[#050B14]/60 p-1.5 rounded-2xl border border-white/5 flex gap-1">
                        <button 
                            onClick={() => setDiscoverMode('talents')}
                            className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${discoverMode === 'talents' ? 'bg-[#D2B48C] text-[#050B14]' : 'text-slate-500 hover:text-white'}`}
                        >
                            TALENTS
                        </button>
                        <button 
                            onClick={() => setDiscoverMode('spots')}
                            className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${discoverMode === 'spots' ? 'bg-[#D2B48C] text-[#050B14]' : 'text-slate-500 hover:text-white'}`}
                        >
                            SPOTS
                        </button>
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="flex-1 relative group">
                        <Icon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input 
                            type="text" 
                            placeholder={discoverMode === 'talents' ? "Nom d'artiste, style..." : "Lieu, monument..."}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[#050B14]/60 border border-white/10 rounded-2xl py-4 pl-11 pr-4 text-sm text-white focus:border-[#D2B48C]/50 outline-none transition-all shadow-inner"
                        />
                    </div>
                    <button 
                      onClick={() => setDiscoverView(v => v === 'grid' ? 'map' : 'grid')} 
                      className="w-14 h-14 rounded-2xl bg-[#D2B48C]/10 text-[#D2B48C] hover:bg-[#D2B48C] hover:text-[#050B14] transition-all flex items-center justify-center border border-[#D2B48C]/20 shadow-lg active:scale-95"
                    >
                        <Icon name={discoverView === 'grid' ? 'map' : 'grid'} className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
                    {discoverMode === 'talents' ? (
                        [
                            { id: 'All', label: 'Tout' },
                            { id: UserType.Photographer, label: 'Photos' },
                            { id: UserType.Videographer, label: 'Vidéos' },
                            { id: UserType.Model, label: 'Modèles' }
                        ].map(item => (
                            <button
                                key={item.id}
                                onClick={() => setFilterType(item.id as any)}
                                className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${
                                    filterType === item.id 
                                    ? 'bg-[#D2B48C] border-[#D2B48C] text-[#050B14] shadow-lg shadow-[#D2B48C]/20' 
                                    : 'bg-[#1A2536]/40 border-white/5 text-slate-500 hover:text-white'
                                }`}
                            >
                                {item.label}
                            </button>
                        ))
                    ) : (
                        spotCategories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setFilterSpotCategory(cat)}
                                className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${
                                    filterSpotCategory === cat 
                                    ? 'bg-[#D2B48C] border-[#D2B48C] text-[#050B14] shadow-lg shadow-[#D2B48C]/20' 
                                    : 'bg-[#1A2536]/40 border-white/5 text-slate-500 hover:text-white'
                                }`}
                            >
                                {cat === 'All' ? 'TOUS LES LIEUX' : cat}
                            </button>
                        ))
                    )}
                </div>
            </header>
            
            <div className="flex-1 overflow-hidden relative">
                {discoverView === 'grid' ? (
                  <div className="h-full overflow-y-auto custom-scrollbar p-6 md:p-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pb-[120px]">
                      {discoverMode === 'talents' ? (
                          filteredUsers.length > 0 ? (
                            filteredUsers.map((user) => (
                                <UserProfileCard key={user.id} user={user} onSelect={viewProfile} />
                            ))
                          ) : (
                            <div className="col-span-full flex flex-col items-center justify-center py-32 text-slate-700 opacity-20">
                                <Icon name="search" className="w-16 h-16 mb-6" />
                                <p className="font-black uppercase tracking-[0.4em] text-xs text-center">Aucun talent correspondant<br/>à "{searchQuery}"</p>
                            </div>
                          )
                      ) : (
                        filteredSpots.length > 0 ? (
                            filteredSpots.map((spot) => (
                                <div 
                                  key={spot.id} 
                                  onClick={() => { setDiscoverView('map'); }} 
                                  className="bg-[#0D1625] rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl relative h-64 group cursor-pointer"
                                >
                                    <img 
                                      src={spot.imageUrl} 
                                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                                      alt={spot.name}
                                      onError={(e) => { 
                                          (e.target as HTMLImageElement).src = `https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80`; 
                                      }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                                    <div className="absolute inset-0 p-8 flex flex-col justify-end">
                                        <p className="text-[9px] font-black text-[#D2B48C] uppercase tracking-[0.3em] mb-2">{spot.type} • {spot.category}</p>
                                        <h3 className="text-xl font-black text-white uppercase tracking-tighter">{spot.name}</h3>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full flex flex-col items-center justify-center py-32 text-slate-700 opacity-20">
                                <Icon name="map" className="w-16 h-16 mb-6" />
                                <p className="font-black uppercase tracking-[0.4em] text-xs">Aucun spot trouvé</p>
                            </div>
                        )
                      )}
                  </div>
                ) : (
                  <MapView filteredUsers={filteredUsers} />
                )}
            </div>
          </div>
        );
       case 'favorites': return <div className="h-full overflow-y-auto pb-[100px]"><FavoritesView /></div>;
       case 'messages': return <div className="h-full overflow-y-auto pb-[100px]"><MessagesView /></div>;
       case 'bookings': return <div className="h-full overflow-y-auto pb-[100px]"><BookingsView /></div>;
       case 'profile': return <ProfileView />;
       default: return null;
    }
  };

  return (
    <>
      <Layout>{renderContent()}</Layout>
      {showQuizNotify && !isQuizOpen && (
        <QuizNotificationPopup 
          onStartQuiz={() => { setQuizOpen(true); setShowQuizNotify(false); }} 
          onClose={() => setShowQuizNotify(false)} 
        />
      )}
      {isEditingProfile && <EditProfileScreen />}
      {isQuizOpen && <QuizModal onClose={() => setQuizOpen(false)} />}
      {bookingUser && <BookingModal user={bookingUser} />}
      {signingBooking && <ContractModal booking={signingBooking} />}
      {isOnboardingOpen && <OnboardingModal />}
      {reviewingBooking && <ReviewModal booking={reviewingBooking} />}
      {isTourActive && <GuidedTour onClose={closeTour} />}
      {projectingMedia && <ARProjector />}
      <Lightbox />
    </>
  );
};

export default App;
