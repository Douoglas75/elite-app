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

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
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

  // Synchronisation stricte : On s'assure que le currentUser est TOUJOURS dans la liste des users
  useEffect(() => {
    setUsers(prev => {
        const index = prev.findIndex(u => u.id === currentUser.id);
        if (index === -1) return [...prev, currentUser];
        const newUsers = [...prev];
        newUsers[index] = currentUser;
        return newUsers;
    });
  }, [currentUser.id]); // Uniquement sur l'ID au départ

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
    setAnalyticsLog(prev => [...prev.slice(-49), entry]);
  }, [currentUser.id]);

  const updateCurrentUser = useCallback((data: Partial<User>) => {
    setCurrentUser(prev => {
        const updated = { ...prev, ...data };
        // On met aussi à jour la liste globale immédiatement pour la carte
        setUsers(uPrev => uPrev.map(u => u.id === prev.id ? updated : u));
        return updated;
    });
    trackAction('USER_UPDATE', data);
  }, [trackAction]);

  const refreshLocation = useCallback(async () => {
    return new Promise<void>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                updateCurrentUser({ 
                    location: { lat: pos.coords.latitude, lng: pos.coords.longitude } 
                });
                resolve();
            },
            (err) => reject(err),
            { enableHighAccuracy: true }
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
    setUsers(prev => [...prev, newUser]);
    setIsLoggedIn(true);
    setProfileComplete(false);
  }, []);

  const completeInitialSetup = useCallback((data: { name: string; type: UserType }) => {
    const updated = { ...currentUser, ...data, isPro: true };
    setCurrentUser(updated);
    setUsers(prev => prev.map(u => u.id === currentUser.id ? updated : u));
    setProfileComplete(true);
    return { startTour: true };
  }, [currentUser]);

  const logout = useCallback(() => {
    localStorage.removeItem('elite_session');
    localStorage.removeItem('elite_active_user');
    window.location.reload();
  }, []);

  const saveProfile = useCallback((user: User) => {
    setCurrentUser(user);
    setUsers(prev => prev.map(u => u.id === user.id ? user : u));
    setProfileComplete(true);
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