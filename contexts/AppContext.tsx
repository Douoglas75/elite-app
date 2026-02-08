
import React, { createContext, useState, useContext, ReactNode, useCallback, useMemo } from 'react';
import { UserType, User, Booking, PortfolioItem, DiscoverMode } from '../types';

export type ActiveTab = 'discover' | 'favorites' | 'messages' | 'bookings' | 'profile';
type DiscoverView = 'grid' | 'map';
export type FilterType = UserType | 'All';

interface AppContextType {
  // View State
  activeTab: ActiveTab;
  discoverView: DiscoverView;
  discoverMode: DiscoverMode;
  viewingUser: User | null;
  activeChatThreadId: number | null;
  activeSubView: string | null;
  fullScreenMedia: PortfolioItem | null;
  projectingMedia: PortfolioItem | null;
  
  // Filter State
  filterType: FilterType;
  filterSpotCategory: string;
  filterAvailable: boolean;
  searchQuery: string;

  // Modal State
  isQuizOpen: boolean;
  bookingUser: User | null;
  signingBooking: Booking | null;
  isOnboardingOpen: boolean;
  reviewingBooking: Booking | null;
  isEditingProfile: boolean;
  isTourActive: boolean;

  // View Setters
  setActiveTab: (tab: ActiveTab) => void;
  setDiscoverView: React.Dispatch<React.SetStateAction<DiscoverView>>;
  setDiscoverMode: React.Dispatch<React.SetStateAction<DiscoverMode>>;
  setViewingUser: React.Dispatch<React.SetStateAction<User | null>>;
  setActiveChatThreadId: React.Dispatch<React.SetStateAction<number | null>>;
  setActiveSubView: React.Dispatch<React.SetStateAction<string | null>>;
  setFullScreenMedia: (media: PortfolioItem | null) => void;
  setProjectingMedia: (media: PortfolioItem | null) => void;
  
  // Filter Setters
  setFilterType: (type: FilterType) => void;
  setFilterSpotCategory: (cat: string) => void;
  setFilterAvailable: (available: boolean) => void;
  setSearchQuery: (query: string) => void;

  // Modal Setters
  setQuizOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setBookingUser: React.Dispatch<React.SetStateAction<User | null>>;
  setSigningBooking: React.Dispatch<React.SetStateAction<Booking | null>>;
  setOnboardingOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setReviewingBooking: React.Dispatch<React.SetStateAction<Booking | null>>;
  setEditingProfile: React.Dispatch<React.SetStateAction<boolean>>;
  setTourActive: React.Dispatch<React.SetStateAction<boolean>>;

  // Combined Actions
  handleBack: () => void;
  selectTab: (tab: ActiveTab) => void;
  selectThread: (threadId: number) => void;
  viewProfile: (user: User) => void;
  closeTour: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('discover');
  const [discoverView, setDiscoverView] = useState<DiscoverView>('map');
  const [discoverMode, setDiscoverMode] = useState<DiscoverMode>('talents');
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [activeChatThreadId, setActiveChatThreadId] = useState<number | null>(null);
  const [activeSubView, setActiveSubView] = useState<string | null>(null);
  const [fullScreenMedia, setFullScreenMedia] = useState<PortfolioItem | null>(null);
  const [projectingMedia, setProjectingMedia] = useState<PortfolioItem | null>(null);
  
  const [filterType, setFilterType] = useState<FilterType>('All');
  const [filterSpotCategory, setFilterSpotCategory] = useState('All');
  const [filterAvailable, setFilterAvailable] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isQuizOpen, setQuizOpen] = useState(false);
  const [bookingUser, setBookingUser] = useState<User | null>(null);
  const [signingBooking, setSigningBooking] = useState<Booking | null>(null);
  const [isOnboardingOpen, setOnboardingOpen] = useState(false);
  const [reviewingBooking, setReviewingBooking] = useState<Booking | null>(null);
  const [isEditingProfile, setEditingProfile] = useState(false);
  const [isTourActive, setTourActive] = useState(false);

  const handleBack = useCallback(() => {
    setViewingUser(null);
    setActiveChatThreadId(null);
    setActiveSubView(null);
    setProjectingMedia(null);
  }, []);

  const selectTab = useCallback((tab: ActiveTab) => {
    handleBack();
    setActiveTab(tab);
  }, [handleBack]);

  const selectThread = useCallback((threadId: number) => {
    setActiveChatThreadId(threadId);
    setViewingUser(null);
    setActiveTab('messages');
  }, []);

  const viewProfile = useCallback((user: User) => {
    setViewingUser(user);
    setActiveChatThreadId(null);
  }, []);
  
  const closeTour = useCallback(() => {
    setTourActive(false);
    localStorage.setItem('hasViewedTour', 'true');
  }, []);

  const contextValue = useMemo(() => ({
      activeTab, setActiveTab,
      discoverView, setDiscoverView,
      discoverMode, setDiscoverMode,
      viewingUser, setViewingUser,
      activeChatThreadId, setActiveChatThreadId,
      activeSubView, setActiveSubView,
      fullScreenMedia, setFullScreenMedia,
      projectingMedia, setProjectingMedia,
      filterType, setFilterType,
      filterSpotCategory, setFilterSpotCategory,
      filterAvailable, setFilterAvailable,
      searchQuery, setSearchQuery,
      isQuizOpen, setQuizOpen,
      bookingUser, setBookingUser,
      signingBooking, setSigningBooking,
      isOnboardingOpen, setOnboardingOpen,
      reviewingBooking, setReviewingBooking,
      isEditingProfile, setEditingProfile,
      isTourActive, setTourActive,
      handleBack,
      selectTab,
      selectThread,
      viewProfile,
      closeTour,
  }), [
      activeTab, discoverView, discoverMode, viewingUser, activeChatThreadId, activeSubView, fullScreenMedia, projectingMedia,
      filterType, filterSpotCategory, filterAvailable, searchQuery,
      isQuizOpen, bookingUser, signingBooking, isOnboardingOpen, reviewingBooking, isEditingProfile,
      isTourActive, handleBack, selectTab, selectThread, viewProfile, closeTour
  ]);

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
