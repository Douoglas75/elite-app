
import React, { createContext, useState, useContext, ReactNode, useCallback, useMemo, useEffect } from 'react';
import { MOCK_USERS, MOCK_MESSAGES, MOCK_BOOKINGS, CURRENT_USER } from '../constants';
import type { User, Booking, MessageThread, Review, UserType, ChatMessage } from '../types';

interface UserContextType {
  isLoggedIn: boolean;
  isProfileComplete: boolean;
  users: User[];
  messages: MessageThread[];
  bookings: Booking[];
  currentUser: User;
  analyticsLog: any[];

  // Auth & Database logic
  login: (email: string, pass: string) => Promise<boolean>;
  register: (name: string, email: string, type: UserType) => Promise<void>;
  logout: () => void;
  completeInitialSetup: (data: { name: string; type: UserType }) => { startTour: boolean };
  
  // Action Handlers
  updateCurrentUser: (updatedData: Partial<User>) => void;
  saveProfile: (updatedUser: User) => void;
  startChat: (userId: number) => number;
  addMessage: (threadId: number, text: string) => void;
  confirmBooking: (details: any) => void;
  updateBookingStatus: (id: number, status: any) => void;
  postReview: (booking: Booking, review: any) => void;
  trackAction: (action: string, metadata: any) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // DB & Session Recovery
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('elite_session') === 'active');
  const [isProfileComplete, setProfileComplete] = useState(() => localStorage.getItem('elite_onboarded') === 'true');
  
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('elite_db_users');
    return saved ? JSON.parse(saved) : MOCK_USERS;
  });

  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem('elite_active_user');
    return saved ? JSON.parse(saved) : CURRENT_USER;
  });

  const [messages, setMessages] = useState<MessageThread[]>(() => 
    JSON.parse(localStorage.getItem('elite_db_msgs') || JSON.stringify(MOCK_MESSAGES))
  );
  
  const [bookings, setBookings] = useState<Booking[]>(() => 
    JSON.parse(localStorage.getItem('elite_db_bookings') || JSON.stringify(MOCK_BOOKINGS))
  );

  const [analyticsLog, setAnalyticsLog] = useState<any[]>(() => 
    JSON.parse(localStorage.getItem('elite_analytics') || '[]')
  );

  // Database Syncing Logic
  useEffect(() => {
    localStorage.setItem('elite_db_users', JSON.stringify(users));
    localStorage.setItem('elite_db_msgs', JSON.stringify(messages));
    localStorage.setItem('elite_db_bookings', JSON.stringify(bookings));
    localStorage.setItem('elite_active_user', JSON.stringify(currentUser));
    localStorage.setItem('elite_analytics', JSON.stringify(analyticsLog));
    localStorage.setItem('elite_session', isLoggedIn ? 'active' : 'none');
    localStorage.setItem('elite_onboarded', isProfileComplete ? 'true' : 'false');
  }, [users, messages, bookings, currentUser, analyticsLog, isLoggedIn, isProfileComplete]);

  const trackAction = useCallback((action: string, metadata: any) => {
    const entry = { ts: new Date().toISOString(), action, metadata, uid: currentUser.id };
    setAnalyticsLog(prev => [...prev.slice(-49), entry]); // On garde 50 logs max
    console.debug(`[Elite Harvesting] ${action}`, metadata);
  }, [currentUser.id]);

  const login = useCallback(async (email: string, pass: string): Promise<boolean> => {
    await new Promise(r => setTimeout(r, 600)); // Simule latence réseau
    
    // Test Account Bypass
    if (email === "test@elite.com" || email === "admin@elite.com") {
      setIsLoggedIn(true);
      setProfileComplete(true);
      trackAction('LOGIN_SUCCESS', { email });
      return true;
    }

    const user = users.find(u => u.email === email);
    if (user) {
      setCurrentUser(user);
      setIsLoggedIn(true);
      setProfileComplete(true);
      trackAction('LOGIN_SUCCESS', { email });
      return true;
    }

    trackAction('LOGIN_FAILED', { email });
    return false;
  }, [users, trackAction]);

  const register = useCallback(async (name: string, email: string, type: UserType) => {
    await new Promise(r => setTimeout(r, 800));
    const newUser = { ...CURRENT_USER, id: Date.now(), name, email, type, bio: "Nouveau membre Elite." };
    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    setIsLoggedIn(true);
    setProfileComplete(false);
    trackAction('USER_REGISTERED', { email, type });
  }, [trackAction]);

  const completeInitialSetup = useCallback((data: { name: string; type: UserType }) => {
    const updated = { 
        ...currentUser, 
        name: data.name, 
        type: data.type, 
        headline: `${data.type} Junior`,
        isPro: false 
    };
    setCurrentUser(updated);
    setProfileComplete(true);
    trackAction('ONBOARDING_COMPLETED', data);
    return { startTour: true };
  }, [currentUser, trackAction]);

  const logout = useCallback(() => {
    trackAction('LOGOUT', { uid: currentUser.id });
    localStorage.clear();
    window.location.reload();
  }, [currentUser.id, trackAction]);

  const updateCurrentUser = useCallback((data: Partial<User>) => {
    setCurrentUser(prev => ({ ...prev, ...data }));
    trackAction('USER_UPDATE', data);
  }, [trackAction]);

  const saveProfile = useCallback((user: User) => {
    setCurrentUser(user);
    setProfileComplete(true);
    trackAction('PROFILE_SAVED', { uid: user.id });
  }, [trackAction]);

  const startChat = useCallback((userId: number) => {
    const existing = messages.find(t => t.participantId === userId);
    if (existing) return existing.id;
    const tid = Date.now();
    const newThread = { id: tid, participantId: userId, messages: [], lastMessage: "", timestamp: "Maintenant", unread: false };
    setMessages(prev => [newThread, ...prev]);
    trackAction('CHAT_INITIATED', { target: userId });
    return tid;
  }, [messages, trackAction]);

  const addMessage = useCallback((threadId: number, text: string) => {
    const msg = { id: Date.now(), senderId: currentUser.id, text, timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) };
    setMessages(prev => prev.map(t => t.id === threadId ? { ...t, messages: [...t.messages, msg], lastMessage: text } : t));
    trackAction('MESSAGE_SENT', { threadId });
  }, [currentUser.id, trackAction]);

  const confirmBooking = useCallback((details: any) => {
    const bid = Date.now();
    const b = { id: bid, clientId: currentUser.id, status: 'Pending', escrowStatus: 'held', ...details };
    setBookings(prev => [b, ...prev]);
    trackAction('BOOKING_CREATED', { bid });
  }, [currentUser.id, trackAction]);

  const updateBookingStatus = useCallback((id: number, status: any) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
    trackAction('BOOKING_STATUS_UPDATE', { id, status });
  }, [trackAction]);

  const postReview = useCallback((booking: Booking, review: any) => {
    setUsers(prev => prev.map(u => u.id === booking.professionalId ? { ...u, reviews: [...(u.reviews || []), { ...review, id: Date.now(), authorId: currentUser.id }] } : u));
    updateBookingStatus(booking.id, 'Completed');
    trackAction('REVIEW_POSTED', { target: booking.professionalId });
  }, [currentUser.id, updateBookingStatus, trackAction]);

  const contextValue = useMemo(() => ({
    isLoggedIn, isProfileComplete, users, messages, bookings, currentUser, analyticsLog,
    login, register, logout, completeInitialSetup, updateCurrentUser, saveProfile, startChat, addMessage,
    confirmBooking, updateBookingStatus, postReview, trackAction
  }), [isLoggedIn, isProfileComplete, users, messages, bookings, currentUser, analyticsLog, login, register, logout, completeInitialSetup, updateCurrentUser, saveProfile, startChat, addMessage, confirmBooking, updateBookingStatus, postReview, trackAction]);

  return <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const c = useContext(UserContext);
  if (!c) throw new Error("UserProvider missing");
  return c;
};
