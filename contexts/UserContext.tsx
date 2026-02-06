
import React, { createContext, useState, useContext, ReactNode, useCallback, useMemo, useEffect } from 'react';
import { MOCK_USERS, MOCK_MESSAGES, MOCK_BOOKINGS, CURRENT_USER } from '../constants';
import type { User, Booking, MessageThread, UserType, MoodboardItem } from '../types';

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

// Helper for storage management
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
        } catch (e) {
            console.warn("Storage quota exceeded, cleaning old entries...");
            // Simple cleanup logic if needed
        }
    }
};

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('elite_session') === 'active');
  const [isProfileComplete, setProfileComplete] = useState(() => localStorage.getItem('elite_onboarded') === 'true');
  
  const [users, setUsers] = useState<User[]>(() => storage.get('elite_db_users', MOCK_USERS));
  const [currentUser, setCurrentUser] = useState<User>(() => storage.get('elite_active_user', CURRENT_USER));
  const [messages, setMessages] = useState<MessageThread[]>(() => storage.get('elite_db_msgs', MOCK_MESSAGES));
  const [bookings, setBookings] = useState<Booking[]>(() => storage.get('elite_db_bookings', MOCK_BOOKINGS));
  const [moodboards, setMoodboards] = useState<Record<string, MoodboardItem[]>>(() => storage.get('elite_db_moodboards', {}));

  // Automatic Sync across users list
  useEffect(() => {
    setUsers(prev => {
      const exists = prev.find(u => u.id === currentUser.id);
      if (!exists) return [...prev, currentUser];
      return prev.map(u => u.id === currentUser.id ? currentUser : u);
    });
  }, [currentUser]);

  // Persistent Save Loop
  useEffect(() => {
    storage.set('elite_db_users', users);
    storage.set('elite_db_msgs', messages);
    storage.set('elite_db_bookings', bookings);
    storage.set('elite_db_moodboards', moodboards);
    storage.set('elite_active_user', currentUser);
    localStorage.setItem('elite_session', isLoggedIn ? 'active' : 'none');
    localStorage.setItem('elite_onboarded', isProfileComplete ? 'true' : 'false');
  }, [users, messages, bookings, moodboards, currentUser, isLoggedIn, isProfileComplete]);

  const updateCurrentUser = useCallback((data: Partial<User>) => {
    setCurrentUser(prev => ({ ...prev, ...data }));
  }, []);

  const updateMoodboard = useCallback((bookingId: string, items: MoodboardItem[]) => {
    setMoodboards(prev => ({ ...prev, [bookingId]: items }));
  }, []);

  const refreshLocation = useCallback(async () => {
    return new Promise<void>((resolve, reject) => {
        if (!navigator.geolocation) {
            reject("Geolocation not supported");
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const newLoc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                updateCurrentUser({ location: newLoc });
                resolve();
            },
            (err) => reject(err),
            { enableHighAccuracy: true, timeout: 5000 }
        );
    });
  }, [updateCurrentUser]);

  const login = useCallback(async (email: string, pass: string): Promise<boolean> => {
    const found = users.find(u => u.email === email);
    if (found || email === "test@elite.com") {
      const user = found || CURRENT_USER;
      setCurrentUser(user);
      setIsLoggedIn(true);
      setProfileComplete(true);
      return true;
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
    const newThread: MessageThread = { 
        id: tid, 
        participantId: userId, 
        messages: [], 
        lastMessage: "", 
        timestamp: "À l'instant", 
        unread: false 
    };
    setMessages(prev => [newThread, ...prev]);
    return tid;
  }, [messages]);

  const addMessage = useCallback((threadId: number, text: string) => {
    const msg = { 
        id: Date.now(), 
        senderId: currentUser.id, 
        text, 
        timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) 
    };
    setMessages(prev => prev.map(t => t.id === threadId ? { 
        ...t, 
        messages: [...t.messages, msg], 
        lastMessage: text,
        timestamp: "À l'instant"
    } : t));
  }, [currentUser.id]);

  const confirmBooking = useCallback((details: any) => {
    const newBooking: Booking = { 
        id: Date.now(), 
        clientId: currentUser.id, 
        status: 'Pending', 
        escrowStatus: 'held', 
        ...details 
    };
    setBookings(prev => [newBooking, ...prev]);
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
