import React, { createContext, useState, useContext, ReactNode, useCallback, useMemo, useEffect } from 'react';
import { MOCK_USERS, MOCK_MESSAGES, MOCK_BOOKINGS, CURRENT_USER } from '../constants';
import type { User, Booking, MessageThread, Review, UserType } from '../types';

interface UserContextType {
  isLoggedIn: boolean;
  isProfileComplete: boolean;
  users: User[];
  messages: MessageThread[];
  bookings: Booking[];
  currentUser: User;
  analyticsLog: any[];

  login: (email: string, pass: string) => Promise<boolean>;
  register: (name: string, email: string, type: UserType) => Promise<void>;
  logout: () => void;
  completeInitialSetup: (data: { name: string; type: UserType }) => { startTour: boolean };
  
  updateCurrentUser: (updatedData: Partial<User>) => void;
  saveProfile: (updatedUser: User) => void;
  startChat: (userId: number) => number;
  addMessage: (threadId: number, text: string) => void;
  confirmBooking: (details: any) => void;
  updateBookingStatus: (id: number, status: any) => void;
  postReview: (booking: Booking, review: any) => void;
  trackAction: (action: string, metadata: any) => void;
  refreshLocation: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const safeParse = (key: string, fallback: any) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.warn(`Storage error for ${key}:`, e);
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
  const [analyticsLog, setAnalyticsLog] = useState<any[]>(() => safeParse('elite_analytics', []));

  // Sauvegarde sécurisée avec gestion de quota
  useEffect(() => {
    try {
      localStorage.setItem('elite_db_users', JSON.stringify(users));
      localStorage.setItem('elite_db_msgs', JSON.stringify(messages));
      localStorage.setItem('elite_db_bookings', JSON.stringify(bookings));
      localStorage.setItem('elite_active_user', JSON.stringify(currentUser));
      localStorage.setItem('elite_analytics', JSON.stringify(analyticsLog));
      localStorage.setItem('elite_session', isLoggedIn ? 'active' : 'none');
      localStorage.setItem('elite_onboarded', isProfileComplete ? 'true' : 'false');
    } catch (e) {
      if (e instanceof Error && e.name === 'QuotaExceededError') {
        console.error("Stockage saturé. Impossible de sauvegarder les changements.");
      }
    }
  }, [users, messages, bookings, currentUser, analyticsLog, isLoggedIn, isProfileComplete]);

  // Synchronisation en temps réel de l'utilisateur actuel dans la liste globale
  const syncUserToGlobalList = useCallback((user: User) => {
    setUsers(prev => {
        const index = prev.findIndex(u => u.id === user.id);
        if (index === -1) return [...prev, user];
        const newUsers = [...prev];
        newUsers[index] = user;
        return newUsers;
    });
  }, []);

  const trackAction = useCallback((action: string, metadata: any) => {
    const entry = { ts: new Date().toISOString(), action, metadata, uid: currentUser.id };
    setAnalyticsLog(prev => [...prev.slice(-49), entry]);
  }, [currentUser.id]);

  const updateCurrentUser = useCallback((data: Partial<User>) => {
    setCurrentUser(prev => {
        const updated = { ...prev, ...data };
        syncUserToGlobalList(updated);
        return updated;
    });
    trackAction('USER_UPDATE', data);
  }, [trackAction, syncUserToGlobalList]);

  const refreshLocation = useCallback(async () => {
    return new Promise<void>((resolve, reject) => {
        if (!navigator.geolocation) return reject("Non supporté");
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const newLoc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                updateCurrentUser({ location: newLoc });
                resolve();
            },
            (err) => reject(err),
            { enableHighAccuracy: true, timeout: 10000 }
        );
    });
  }, [updateCurrentUser]);

  const login = useCallback(async (email: string, pass: string): Promise<boolean> => {
    await new Promise(r => setTimeout(r, 600));
    if (email === "test@elite.com" || email === "admin@elite.com") {
      setIsLoggedIn(true);
      setProfileComplete(true);
      return true;
    }
    const user = users.find(u => u.email === email);
    if (user) {
      setCurrentUser(user);
      setIsLoggedIn(true);
      setProfileComplete(true);
      return true;
    }
    return false;
  }, [users]);

  const register = useCallback(async (name: string, email: string, type: UserType) => {
    const newUser = { ...CURRENT_USER, id: Date.now(), name, email, type, avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=D2B48C&color=050B14` };
    setCurrentUser(newUser);
    syncUserToGlobalList(newUser);
    setIsLoggedIn(true);
    setProfileComplete(false);
  }, [syncUserToGlobalList]);

  const completeInitialSetup = useCallback((data: { name: string; type: UserType }) => {
    const updated = { ...currentUser, ...data, isPro: true };
    setCurrentUser(updated);
    syncUserToGlobalList(updated);
    setProfileComplete(true);
    return { startTour: true };
  }, [currentUser, syncUserToGlobalList]);

  const logout = useCallback(() => {
    localStorage.removeItem('elite_session');
    localStorage.removeItem('elite_active_user');
    window.location.reload();
  }, []);

  const saveProfile = useCallback((user: User) => {
    setCurrentUser(user);
    syncUserToGlobalList(user);
    setProfileComplete(true);
  }, [syncUserToGlobalList]);

  const startChat = useCallback((userId: number) => {
    const existing = messages.find(t => t.participantId === userId);
    if (existing) return existing.id;
    const tid = Date.now();
    const newThread = { id: tid, participantId: userId, messages: [], lastMessage: "", timestamp: "Maintenant", unread: false };
    setMessages(prev => [newThread, ...prev]);
    return tid;
  }, [messages]);

  const addMessage = useCallback((threadId: number, text: string) => {
    const msg = { id: Date.now(), senderId: currentUser.id, text, timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) };
    setMessages(prev => prev.map(t => t.id === threadId ? { ...t, messages: [...t.messages, msg], lastMessage: text } : t));
  }, [currentUser.id]);

  const confirmBooking = useCallback((details: any) => {
    const bid = Date.now();
    const b = { id: bid, clientId: currentUser.id, status: 'Pending', escrowStatus: 'held', ...details };
    setBookings(prev => [b, ...prev]);
  }, [currentUser.id]);

  const updateBookingStatus = useCallback((id: number, status: any) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
  }, []);

  const postReview = useCallback((booking: Booking, review: any) => {
    setUsers(prev => prev.map(u => u.id === booking.professionalId ? { ...u, reviews: [...(u.reviews || []), { ...review, id: Date.now(), authorId: currentUser.id }] } : u));
    updateBookingStatus(booking.id, 'Completed');
  }, [currentUser.id, updateBookingStatus]);

  const contextValue = useMemo(() => ({
    isLoggedIn, isProfileComplete, users, messages, bookings, currentUser, analyticsLog,
    login, register, logout, completeInitialSetup, updateCurrentUser, saveProfile, startChat, addMessage,
    confirmBooking, updateBookingStatus, postReview, trackAction, refreshLocation
  }), [isLoggedIn, isProfileComplete, users, messages, bookings, currentUser, analyticsLog, login, register, logout, completeInitialSetup, updateCurrentUser, saveProfile, startChat, addMessage, confirmBooking, updateBookingStatus, postReview, trackAction, refreshLocation]);

  return <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const c = useContext(UserContext);
  if (!c) throw new Error("UserProvider missing");
  return c;
};