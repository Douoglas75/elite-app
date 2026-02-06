
import React, { createContext, useState, useContext, ReactNode, useCallback, useMemo, useEffect } from 'react';
import { MOCK_USERS, MOCK_MESSAGES, MOCK_BOOKINGS, CURRENT_USER } from '../constants';
import type { User, Booking, MessageThread, UserType, MoodboardItem, Review, VerificationStatus } from '../types';

interface UserContextType {
  isLoggedIn: boolean;
  isProfileComplete: boolean;
  users: User[];
  messages: MessageThread[];
  bookings: Booking[];
  currentUser: User;
  moodboards: Record<string, MoodboardItem[]>;
  
  login: (email: string, pass: string) => Promise<boolean>;
  register: (name: string, email: string, types: UserType[]) => Promise<void>;
  logout: () => void;
  completeInitialSetup: (data: { name: string; types: UserType[] }) => { startTour: boolean };
  completeProOnboarding: () => void;
  updateCurrentUser: (updatedData: Partial<User>) => void;
  saveProfile: (updatedUser: User) => void;
  startChat: (userId: number) => number;
  addMessage: (threadId: number, text: string) => void;
  confirmBooking: (details: any) => void;
  updateBookingStatus: (id: number, status: any) => void;
  postReview: (booking: Booking, reviewData: { rating: number, comment: string }) => void;
  refreshLocation: () => Promise<{ lat: number; lng: number }>;
  updateMoodboard: (bookingId: string, items: MoodboardItem[]) => void;
  trackAction: (action: string, data?: any) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const storage = {
    get: (key: string, fallback: any) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : fallback;
        } catch (e) { return fallback; }
    },
    set: (key: string, value: any) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) { console.error(e); }
    }
};

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('elite_session') === 'active');
  const [isProfileComplete, setProfileComplete] = useState(() => localStorage.getItem('elite_onboarded') === 'true');
  
  const [currentUser, setCurrentUser] = useState<User>(() => storage.get('elite_active_user', { ...CURRENT_USER }));
  const [users, setUsers] = useState<User[]>(() => storage.get('elite_db_users', MOCK_USERS));
  const [messages, setMessages] = useState<MessageThread[]>(() => storage.get('elite_db_msgs', MOCK_MESSAGES));
  const [bookings, setBookings] = useState<Booking[]>(() => storage.get('elite_db_bookings', MOCK_BOOKINGS));
  const [moodboards, setMoodboards] = useState<Record<string, MoodboardItem[]>>(() => storage.get('elite_db_moodboards', {}));

  useEffect(() => {
    storage.set('elite_active_user', currentUser);
    setUsers(prev => {
        const index = prev.findIndex(u => u.id === currentUser.id);
        if (index === -1) return [currentUser, ...prev];
        const newUsers = [...prev];
        newUsers[index] = currentUser;
        return newUsers;
    });
  }, [currentUser]);

  useEffect(() => {
    storage.set('elite_db_users', users);
    storage.set('elite_db_msgs', messages);
    storage.set('elite_db_bookings', bookings);
    storage.set('elite_db_moodboards', moodboards);
    localStorage.setItem('elite_session', isLoggedIn ? 'active' : 'none');
    localStorage.setItem('elite_onboarded', isProfileComplete ? 'true' : 'false');
  }, [users, messages, bookings, moodboards, isLoggedIn, isProfileComplete]);

  const updateCurrentUser = useCallback((data: Partial<User>) => {
    setCurrentUser(prev => ({ ...prev, ...data }));
  }, []);

  const completeProOnboarding = useCallback(() => {
    setCurrentUser(prev => ({ 
      ...prev, 
      isPro: true, 
      verificationStatus: 'approved' as VerificationStatus 
    }));
  }, []);

  const saveProfile = useCallback((updatedUser: User) => {
    setCurrentUser(updatedUser);
  }, []);

  const postReview = useCallback((booking: Booking, reviewData: { rating: number, comment: string }) => {
    const targetPro = users.find(u => u.id === booking.professionalId);
    if (!targetPro) return;

    const newReview: Review = {
        id: Date.now(),
        authorId: currentUser.id,
        authorName: currentUser.name,
        rating: reviewData.rating,
        comment: reviewData.comment,
        timestamp: new Date().toLocaleDateString('fr-FR')
    };

    const updatedReviews = [...(targetPro.reviews || []), newReview];
    const newAverageRating = updatedReviews.reduce((acc, r) => acc + r.rating, 0) / updatedReviews.length;

    const updatedPro: User = {
        ...targetPro,
        reviews: updatedReviews,
        rating: newAverageRating,
        completedShootsCount: (targetPro.completedShootsCount || 0) + 1
    };

    setUsers(prev => prev.map(u => u.id === targetPro.id ? updatedPro : u));
    setBookings(prev => prev.map(b => b.id === booking.id ? { ...b, status: 'Completed', reviewSubmitted: true } : b));
    
    if (currentUser.id === targetPro.id) {
        setCurrentUser(updatedPro);
    }
  }, [users, currentUser]);

  const value = useMemo(() => ({
    isLoggedIn, isProfileComplete, users, messages, bookings, currentUser, moodboards,
    login: async (email: string) => {
        const found = users.find(u => u.email === email);
        if (found || email === "test@elite.com") {
          setCurrentUser(found || { ...CURRENT_USER });
          setIsLoggedIn(true);
          setProfileComplete(true);
          return true;
        }
        return false;
    },
    register: async (name: string, email: string, types: UserType[]) => {
        setCurrentUser({ ...CURRENT_USER, id: Date.now(), name, email, types });
        setIsLoggedIn(true);
        setProfileComplete(false);
    },
    logout: () => {
        localStorage.removeItem('elite_session');
        window.location.reload();
    },
    completeInitialSetup: (data: any) => {
        setCurrentUser(prev => ({ ...prev, ...data, isPro: true }));
        setProfileComplete(true);
        return { startTour: true };
    },
    completeProOnboarding, updateCurrentUser, saveProfile,
    startChat: (userId: number) => {
        const existing = messages.find(t => t.participantId === userId);
        if (existing) return existing.id;
        const tid = Date.now();
        setMessages(prev => [{ id: tid, participantId: userId, messages: [], lastMessage: "", timestamp: "Maintenant", unread: false }, ...prev]);
        return tid;
    },
    addMessage: (threadId: number, text: string) => {
        const msg = { id: Date.now(), senderId: currentUser.id, text, timestamp: new Date().toLocaleTimeString() };
        setMessages(prev => prev.map(t => t.id === threadId ? { ...t, messages: [...t.messages, msg], lastMessage: text, timestamp: "Maintenant" } : t));
    },
    confirmBooking: (details: any) => {
        const newB: Booking = { id: Date.now(), clientId: currentUser.id, status: 'Pending', escrowStatus: 'held', ...details };
        setBookings(prev => [newB, ...prev]);
    },
    updateBookingStatus: (id: number, status: any) => {
        setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
    },
    postReview, 
    refreshLocation: async () => ({ lat: 48.8566, lng: 2.3522 }), 
    updateMoodboard: (bid: string, items: any) => setMoodboards(prev => ({ ...prev, [bid]: items })),
    trackAction: (a: string, d: any) => console.log(a, d)
  }), [isLoggedIn, isProfileComplete, users, messages, bookings, currentUser, moodboards, postReview, completeProOnboarding, saveProfile]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const c = useContext(UserContext);
  if (!c) throw new Error("Provider missing");
  return c;
};
