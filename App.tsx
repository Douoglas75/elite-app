
import React, { useEffect, useState, useMemo } from 'react';
import UserProfileCard from './components/UserProfileCard';
import QuizModal from './components/QuizModal';
import Icon from './components/Icon';
import ProfileDetail from './components/ProfileDetail';
import MapView from './components/MapView';
import MessagesView from './components/MessagesView';
import BookingsView from './components/BookingsView';
import ProfileView from './components/ProfileView';
import FavoritesView from './components/FavoritesView';
import ChatView from './components/ChatView';
import QuizNotificationPopup from './components/QuizNotificationPopup';
import BookingModal from './components/BookingModal';
import OnboardingModal from './components/OnboardingModal';
import ReviewModal from './components/ReviewModal';
import ContractModal from './components/ContractModal';
import ARProjector from './components/ARProjector';
import LoginScreen from './components/LoginScreen';
import InitialSetupScreen from './components/InitialSetupScreen';
import EditProfileScreen from './components/EditProfileScreen';
import SubViewScreen from './components/SubViewScreen';
import GuidedTour from './components/GuidedTour';
import PaymentScreen from './components/PaymentScreen';
import MoodboardView from './components/MoodboardView';
import GalleryView from './components/GalleryView';
import Layout from './components/Layout';
import Lightbox from './components/Lightbox';
import { useUser } from './contexts/UserContext';
import { useAppContext } from './contexts/AppContext';
import { UserType } from './types';
import { checkApiKeyStatus } from './services/geminiService';

const App: React.FC = () => {
  const { isLoggedIn, isProfileComplete, users, messages, currentUser } = useUser();
  const {
    activeTab, discoverView, viewingUser, activeChatThreadId, activeSubView, projectingMedia,
    filterType, setFilterType, filterAvailable, setFilterAvailable, searchQuery, setSearchQuery,
    isQuizOpen, bookingUser, signingBooking, isOnboardingOpen, reviewingBooking, isEditingProfile, isTourActive,
    setDiscoverView, setQuizOpen, setBookingUser, setOnboardingOpen, setReviewingBooking,
    handleBack, viewProfile, closeTour
  } = useAppContext();

  const [showQuizNotify, setShowQuizNotify] = useState(false);
  const [aiStatus, setAiStatus] = useState<'checking' | 'active' | 'inactive'>('checking');

  useEffect(() => {
    const status = checkApiKeyStatus();
    setAiStatus(status ? 'active' : 'inactive');

    if (isLoggedIn && isProfileComplete) {
      const timer = setTimeout(() => setShowQuizNotify(true), 15000);
      return () => clearTimeout(timer);
    }
  }, [isLoggedIn, isProfileComplete]);

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      // Logic for multi-type: check if the user has the filtered type in their types array
      const matchesType = filterType === 'All' || (user.types && user.types.includes(filterType as UserType));
      const matchesAvailability = !filterAvailable || user.isAvailableNow;
      const matchesSearch = searchQuery.trim() === '' || 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.headline.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesType && matchesAvailability && matchesSearch;
    });
  }, [users, filterType, filterAvailable, searchQuery]);

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
            <header className="p-5 md:p-8 flex flex-col gap-4 border-b border-white/5 bg-[#0D1625]/60 backdrop-blur-3xl z-[100] sticky top-0">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-black text-white uppercase tracking-tighter" data-tour="app-logo">Elite <span className="text-[#D2B48C]">Discover</span></h1>
                    </div>
                    <button 
                      onClick={() => setDiscoverView(v => v === 'grid' ? 'map' : 'grid')} 
                      className="w-12 h-12 rounded-xl bg-[#1A2536] text-[#D2B48C] hover:bg-[#D2B48C] hover:text-[#050B14] transition-all flex items-center justify-center border border-white/10 shadow-lg"
                    >
                        <Icon name={discoverView === 'grid' ? 'map' : 'grid'} className="w-6 h-6" />
                    </button>
                </div>

                <div className="relative group">
                    <Icon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input 
                        type="text" 
                        placeholder="Rechercher un talent..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#050B14]/60 border border-white/10 rounded-2xl py-3 pl-11 pr-4 text-sm text-white focus:border-[#D2B48C]/50 outline-none"
                    />
                </div>
                
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    {[
                        { id: 'All', label: 'Tout' },
                        { id: UserType.Photographer, label: 'Photos' },
                        { id: UserType.Videographer, label: 'Vidéos' },
                        { id: UserType.Model, label: 'Modèles' }
                    ].map(item => (
                        <button
                            key={item.id}
                            onClick={() => setFilterType(item.id as any)}
                            className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${
                                filterType === item.id 
                                ? 'bg-[#D2B48C] border-[#D2B48C] text-[#050B14]' 
                                : 'bg-[#1A2536]/40 border-white/5 text-slate-400'
                            }`}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>
            </header>
            
            <div className="flex-1 overflow-hidden relative">
                {discoverView === 'grid' ? (
                  <div className="h-full overflow-y-auto custom-scrollbar p-5 md:p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-[100px]">
                      {filteredUsers.length > 0 ? (
                          filteredUsers.map((user) => (
                              <UserProfileCard key={user.id} user={user} onSelect={viewProfile} />
                          ))
                      ) : (
                          <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-700">
                              <p className="font-black uppercase tracking-widest text-xs">Aucun résultat</p>
                          </div>
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
