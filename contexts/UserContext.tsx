
import React, { createContext, useState, useContext, ReactNode, useCallback, useMemo, useEffect } from 'react';
import { MOCK_USERS, MOCK_MESSAGES, MOCK_BOOKINGS, CURRENT_USER } from '../constants';
import type { User, Booking, MessageThread, UserType } from '../types';

interface MoodboardItem {
  id: string;
  url: string;
  addedBy: string;
  comment: string;
}

interface UserContextType {
  isLoggedIn: boolean;
  isProfileComplete: boolean;
  users: User[];
  messages: MessageThread[];
  bookings: Booking[];
  currentUser: User;
  moodboards: Record<string, MoodboardItem[]>;
  
  login: (email: string, pass: string) => Promise<boolean>;
  register: (name: string, email: string, type: UserType) => Promise<void>;
  logout: () => void;
  completeInitialSetup: (data: { name: string; type: UserType }) => { startTour: boolean };
  // Fixed: Added completeProOnboarding to interface to match usage in OnboardingModal.tsx
  completeProOnboarding: () => void;
  updateCurrentUser: (updatedData: Partial<User>) => void;
  saveProfile: (updatedUser: User) => void;
  startChat: (userId: number) => number;
  addMessage: (threadId: number, text: string) => void;
  confirmBooking: (details: any) => void;
  updateBookingStatus: (id: number, status: any) => void;
  postReview: (booking: Booking, review: any) => void;
  refreshLocation: () => Promise<void>;
  updateMoodboard: (bookingId: string, items: MoodboardItem[]) => void;
  trackAction: (action: string, data?: any) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const safeParse = (key: string, fallback: any) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    return fallback;
  }
};

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('elite_session') === 'active');
  const [isProfileComplete, setProfileComplete] = useState(() => localStorage.getItem('elite_onboarded') === 'true');
  const [users, setUsers] = useState<User[]>(() => safeParse('elite_db_users', MOCK_USERS));
  const [currentUser, setCurrentUser] = useState<User>(() => safeParse('elite_active_user', CURRENT_USER));
  const [messages, setMessages] = useState<MessageThread[]>(() => safeParse('elite_db_msgs', MOCK_MESSAGES));
  const [bookings, setBookings] = useState<Booking[]>(() => safeParse('elite_db_bookings', MOCK_BOOKINGS));
  const [moodboards, setMoodboards] = useState<Record<string, MoodboardItem[]>>(() => safeParse('elite_db_moodboards', {}));

  // Sync users list with current user changes
  useEffect(() => {
    setUsers(prev => {
      const exists = prev.find(u => u.id === currentUser.id);
      if (!exists) return [...prev, currentUser];
      return prev.map(u => u.id === currentUser.id ? currentUser : u);
    });
  }, [currentUser]);

  // Safe persistence
  useEffect(() => {
    try {
      localStorage.setItem('elite_db_users', JSON.stringify(users));
      localStorage.setItem('elite_db_msgs', JSON.stringify(messages));
      localStorage.setItem('elite_db_bookings', JSON.stringify(bookings));
      localStorage.setItem('elite_db_moodboards', JSON.stringify(moodboards));
      localStorage.setItem('elite_active_user', JSON.stringify(currentUser));
      localStorage.setItem('elite_session', isLoggedIn ? 'active' : 'none');
      localStorage.setItem('elite_onboarded', isProfileComplete ? 'true' : 'false');
    } catch (e) {
      console.warn("Elite Storage: Quota optimization triggered");
    }
  }, [users, messages, bookings, moodboards, currentUser, isLoggedIn, isProfileComplete]);

  const updateCurrentUser = useCallback((data: Partial<User>) => {
    setCurrentUser(prev => ({ ...prev, ...data }));
  }, []);

  const updateMoodboard = useCallback((bookingId: string, items: MoodboardItem[]) => {
    setMoodboards(prev => ({ ...prev, [bookingId]: items }));
  }, []);

  const refreshLocation = useCallback(async () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        updateCurrentUser({ location: { lat: pos.coords.latitude, lng: pos.coords.longitude } });
      },
      undefined,
      { enableHighAccuracy: true }
    );
  }, [updateCurrentUser]);

  const login = useCallback(async (email: string, pass: string): Promise<boolean> => {
    if (email === "test@elite.com") {
      setIsLoggedIn(true); setProfileComplete(true); return true;
    }
    const found = users.find(u => u.email === email);
    if (found) {
      setCurrentUser(found); setIsLoggedIn(true); setProfileComplete(true); return true;
    }
    return false;
  }, [users]);

  const register = useCallback(async (name: string, email: string, type: UserType) => {
    const newUser = { ...CURRENT_USER, id: Date.now(), name, email, type };
    setCurrentUser(newUser);
    setIsLoggedIn(true);
    setProfileComplete(false);
  }, []);

  const completeInitialSetup = useCallback((data: { name: string; type: UserType }) => {
    const updated = { ...currentUser, ...data, isPro: true };
    setCurrentUser(updated);
    setProfileComplete(true);
    return { startTour: true };
  }, [currentUser]);

  // Fixed: Implemented completeProOnboarding to handle professional verification status as used in OnboardingModal
  const completeProOnboarding = useCallback(() => {
    updateCurrentUser({ isPro: true, verificationStatus: 'approved' });
  }, [updateCurrentUser]);

  const logout = useCallback(() => {
    localStorage.clear();
    window.location.reload();
  }, []);

  const saveProfile = useCallback((user: User) => {
    setCurrentUser(user);
  }, []);

  const startChat = useCallback((userId: number) => {
    const existing = messages.find(t => t.participantId === userId);
    if (existing) return existing.id;
    const tid = Date.now();
    const newThread = { id: tid, participantId: userId, messages: [], lastMessage: "", timestamp: "Maintenant", unread: false };
    setMessages(prev => [newThread, ...prev]);
    return tid;
  }, [messages]);

  const addMessage = useCallback((threadId: number, text: string) => {
    const msg = { id: Date.now(), senderId: currentUser.id, text, timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) };
    setMessages(prev => prev.map(t => t.id === threadId ? { ...t, messages: [...t.messages, msg], lastMessage: text } : t));
  }, [currentUser.id]);

  const confirmBooking = useCallback((details: any) => {
    setBookings(prev => [{ id: Date.now(), clientId: currentUser.id, status: 'Pending', escrowStatus: 'held', ...details }, ...prev]);
  }, [currentUser.id]);

  const updateBookingStatus = useCallback((id: number, status: any) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
  }, []);

  const postReview = useCallback((booking: Booking, review: any) => {
    updateBookingStatus(booking.id, 'Completed');
  }, [updateBookingStatus]);

  const trackAction = useCallback((action: string, data?: any) => {
    console.debug(`[Elite Analytics] ${action}`, data);
  }, []);

  const value = useMemo(() => ({
    isLoggedIn, isProfileComplete, users, messages, bookings, currentUser, moodboards,
    login, register, logout, completeInitialSetup, completeProOnboarding, updateCurrentUser, saveProfile, startChat, addMessage,
    confirmBooking, updateBookingStatus, postReview, refreshLocation, updateMoodboard, trackAction
  }), [isLoggedIn, isProfileComplete, users, messages, bookings, currentUser, moodboards, login, register, logout, completeInitialSetup, completeProOnboarding, updateCurrentUser, saveProfile, startChat, addMessage, confirmBooking, updateBookingStatus, postReview, refreshLocation, updateMoodboard, trackAction]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const c = useContext(UserContext);
  if (!c) throw new Error("Provider missing");
  return c;
};
