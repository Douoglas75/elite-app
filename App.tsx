
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
import SOSButton from './components/SOSButton';
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
    // Vérification de la configuration de l'IA Elite
    const status = checkApiKeyStatus();
    setAiStatus(status ? 'active' : 'inactive');

    if (isLoggedIn && isProfileComplete) {
      const timer = setTimeout(() => setShowQuizNotify(true), 15000);
      return () => clearTimeout(timer);
    }
  }, [isLoggedIn, isProfileComplete]);

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      if (user.id === currentUser.id) return false;
      const matchesType = filterType === 'All' || user.type === filterType;
      const matchesAvailability = !filterAvailable || user.isAvailableNow;
      const matchesSearch = searchQuery.trim() === '' || 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.headline.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesAvailability && matchesSearch;
    });
  }, [users, currentUser.id, filterType, filterAvailable, searchQuery]);

  // Badge de statut Elite Engine
  const AiStatusBadge = () => (
    <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[5000] px-4 py-2 rounded-full backdrop-blur-md border shadow-2xl flex items-center gap-3 transition-all duration-700 ${
      aiStatus === 'active' 
      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 opacity-0 hover:opacity-100' 
      : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
    }`}>
      <div className={`w-2 h-2 rounded-full ${aiStatus === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500 animate-bounce'}`} />
      <span className="text-[10px] font-black uppercase tracking-widest">
        {aiStatus === 'active' ? 'Elite AI Engine Online' : 'Elite AI : Variable VITE_API_KEY manquante'}
      </span>
      {aiStatus === 'inactive' && (
        <a 
          href="https://vercel.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="bg-amber-500 text-[#050B14] text-[8px] px-2 py-0.5 rounded-full font-black ml-1 hover:scale-110 transition-transform"
        >
          Fixer sur Vercel
        </a>
      )}
    </div>
  );

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
          <div className="flex flex-col h-full bg-[#050B14] overflow-hidden">
            <header className="p-5 md:p-8 flex flex-col gap-6 border-b border-white/5 bg-[#0D1625]/40 backdrop-blur-2xl z-[100]">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-black text-white uppercase tracking-tighter" data-tour="app-logo">Elite <span className="text-[#D2B48C]">Discover</span></h1>
                        <p className="text-[10px] font-bold text-[#D2B48C] uppercase tracking-[0.3em] opacity-80">{filteredUsers.length} talents d'exception à proximité</p>
                    </div>
                    <button 
                      onClick={() => setDiscoverView(v => v === 'grid' ? 'map' : 'grid')} 
                      className="w-14 h-14 rounded-2xl bg-[#1A2536] text-[#D2B48C] hover:bg-[#D2B48C] hover:text-[#050B14] hover:scale-105 transition-all flex items-center justify-center border border-white/10 shadow-2xl group"
                    >
                        <Icon name={discoverView === 'grid' ? 'map' : 'grid'} className="w-7 h-7 transition-transform group-active:scale-90" />
                    </button>
                </div>

                <div className="flex flex-col gap-5">
                    <div className="relative group">
                        <Icon name="search" className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within:text-[#D2B48C] transition-colors" />
                        <input 
                            type="text" 
                            placeholder="Style, vision, artiste..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[#050B14]/80 border border-white/10 rounded-[2rem] py-4 pl-14 pr-6 text-sm text-white focus:ring-2 focus:ring-[#D2B48C]/30 focus:border-[#D2B48C]/50 outline-none transition-all placeholder:text-slate-700 shadow-inner"
                        />
                    </div>
                    
                    <div className="flex justify-between items-center gap-4">
                        <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
                            {[
                                { id: 'All', label: 'Tout' },
                                { id: UserType.Photographer, label: 'Photos' },
                                { id: UserType.Videographer, label: 'Vidéos' },
                                { id: UserType.Model, label: 'Modèles' }
                            ].map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => setFilterType(item.id as any)}
                                    className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap transition-all border ${
                                        filterType === item.id 
                                        ? 'bg-[#D2B48C] border-[#D2B48C] text-[#050B14] shadow-[0_8px_25px_rgba(210,180,140,0.4)] scale-105' 
                                        : 'bg-[#1A2536] border-white/5 text-slate-500 hover:border-white/20'
                                    }`}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>
                        
                        <button
                            onClick={() => setFilterAvailable(!filterAvailable)}
                            className={`flex items-center gap-3 px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] transition-all border ${
                                filterAvailable 
                                ? 'bg-red-600 border-red-500 text-white shadow-[0_8px_25px_rgba(220,38,38,0.4)]' 
                                : 'bg-[#1A2536] border-white/5 text-slate-600'
                            }`}
                        >
                            <span className={`w-2 h-2 rounded-full ${filterAvailable ? 'bg-white animate-pulse' : 'bg-red-600 opacity-50'}`} />
                            Live
                        </button>
                    </div>
                </div>
            </header>
            
            <div className="flex-1 overflow-hidden relative">
                <div className={`absolute inset-0 transition-all duration-700 ${discoverView === 'grid' ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-95 pointer-events-none'}`}>
                  <div className="h-full overflow-y-auto custom-scrollbar p-6 md:p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8 pb-32">
                      {filteredUsers.length > 0 ? (
                          filteredUsers.map((user) => (
                              <UserProfileCard key={user.id} user={user} onSelect={viewProfile} />
                          ))
                      ) : (
                          <div className="col-span-full flex flex-col items-center justify-center py-40 text-slate-700">
                              <div className="w-24 h-24 bg-[#1A2536] rounded-[2.5rem] flex items-center justify-center mb-8 border border-white/5 shadow-2xl">
                                <Icon name="search" className="w-10 h-10 opacity-30" />
                              </div>
                              <p className="font-black uppercase tracking-[0.3em] text-xs">Aucun talent correspondant</p>
                          </div>
                      )}
                  </div>
                </div>
                <div className={`absolute inset-0 transition-all duration-700 ${discoverView === 'map' ? 'opacity-100 scale-100' : 'opacity-0 scale-110 pointer-events-none'}`}>
                  <MapView filteredUsers={filteredUsers} />
                </div>
            </div>
          </div>
        );
       case 'favorites': return <FavoritesView />;
       case 'messages': return <MessagesView />;
       case 'bookings': return <BookingsView />;
       case 'profile': return <ProfileView />;
       default: return null;
    }
  };

  return (
    <>
      <AiStatusBadge />
      <Layout>{renderContent()}</Layout>
      <SOSButton />
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
