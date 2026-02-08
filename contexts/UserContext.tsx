
import React, { createContext, useState, useContext, ReactNode, useCallback, useMemo, useEffect } from 'react';
import { db } from '../firebase';
import {
  collection,
  doc,
  setDoc,
  onSnapshot,
  query,
  updateDoc,
  arrayUnion
} from "firebase/firestore";
import { CURRENT_USER, MOCK_SPOTS } from '../constants';
import { fetchRealTimeSpots } from '../services/geminiService';
import type { User, Booking, MessageThread, UserType, MoodboardItem, Review, Spot } from '../types';

interface UserContextType {
  isLoggedIn: boolean;
  isProfileComplete: boolean;
  users: User[];
  messages: MessageThread[];
  bookings: Booking[];
  currentUser: User;
  moodboards: Record<string, MoodboardItem[]>;
  spots: Spot[];
  isRefreshingSpots: boolean;
  isLoadingData: boolean;

  login: (email: string, pass: string) => Promise<boolean>;
  register: (name: string, email: string, types: UserType[], password?: string) => Promise<void>;
  logout: () => void;
  deleteAccount: () => void;
  completeInitialSetup: (data: { name: string; types: UserType[] }) => { startTour: boolean };
  updateCurrentUser: (updatedData: Partial<User>) => void;
  saveProfile: (updatedUser: User) => void;
  startChat: (userId: number) => number;
  addMessage: (threadId: number, text: string) => void;
  confirmBooking: (details: any) => void;
  updateBookingStatus: (id: number, status: any) => void;
  refreshLocation: () => Promise<{ lat: number; lng: number }>;
  refreshSpots: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('elite_session') === 'active');
  const [isProfileComplete, setProfileComplete] = useState(() => localStorage.getItem('elite_onboarded') === 'true');
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem('elite_active_user');
    return saved ? JSON.parse(saved) : { ...CURRENT_USER };
  });

  const [users, setUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<MessageThread[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [moodboards, setMoodboards] = useState<Record<string, MoodboardItem[]>>({});
  const [spots, setSpots] = useState<Spot[]>(MOCK_SPOTS);
  const [isRefreshingSpots, setIsRefreshingSpots] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // 1. ÉCOUTER TOUS LES UTILISATEURS EN TEMPS RÉEL (CLOUD)
  useEffect(() => {
    const q = query(collection(db, "users"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersList: User[] = [];
      snapshot.forEach((doc) => {
        usersList.push(doc.data() as User);
      });
      setUsers(usersList);
      setIsLoadingData(false);

      const me = usersList.find(u => u.id === currentUser.id);
      if (me) {
        setCurrentUser(me);
        localStorage.setItem('elite_active_user', JSON.stringify(me));
      }
    });
    return () => unsubscribe();
  }, [currentUser.id]);

  // 2. ÉCOUTER LES MESSAGES EN TEMPS RÉEL
  useEffect(() => {
    if (!isLoggedIn) return;
    const q = query(collection(db, "messages"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const threads: MessageThread[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (doc.id.includes(currentUser.id.toString())) {
          threads.push(data as MessageThread);
        }
      });
      setMessages(threads);
    });
    return () => unsubscribe();
  }, [isLoggedIn, currentUser.id]);

  const refreshSpots = useCallback(async () => {
    setIsRefreshingSpots(true);
    try {
      const newSpots = await fetchRealTimeSpots();
      if (newSpots.length > 0) setSpots(newSpots);
    } catch (e) { console.error(e); } finally { setIsRefreshingSpots(false); }
  }, []);

  const refreshLocation = useCallback(async (): Promise<{ lat: number; lng: number }> => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const newLoc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          const userRef = doc(db, "users", currentUser.id.toString());
          await updateDoc(userRef, { location: newLoc });
          resolve(newLoc);
        },
        (err) => reject(err),
        { enableHighAccuracy: true }
      );
    });
  }, [currentUser.id]);

  const saveProfile = useCallback(async (updatedUser: User) => {
    await setDoc(doc(db, "users", updatedUser.id.toString()), updatedUser);
  }, []);

  const login = useCallback(async (email: string, pass: string) => {
    const userMatch = users.find(u => u.email === email);
    if (userMatch) {
      // [SECURITY-NOTE] Basic check for demo. In production use Firebase Auth.
      if (userMatch.password && userMatch.password !== pass) {
        return false;
      }
      setCurrentUser(userMatch);
      setIsLoggedIn(true);
      setProfileComplete(true);
      localStorage.setItem('elite_session', 'active');
      localStorage.setItem('elite_onboarded', 'true');
      return true;
    }
    return false;
  }, [users]);

  const register = useCallback(async (name: string, email: string, types: UserType[], password?: string) => {
    const id = Date.now();
    const newUser: User = {
      ...CURRENT_USER,
      id, name, email, types, password,
      completedShootsCount: 0,
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=D2B48C&color=050B14`
    };
    await setDoc(doc(db, "users", id.toString()), newUser);
    setCurrentUser(newUser);
    setIsLoggedIn(true);
    setProfileComplete(false);
    localStorage.setItem('elite_session', 'active');
  }, []);

  const updateCurrentUser = useCallback(async (data: Partial<User>) => {
    const userRef = doc(db, "users", currentUser.id.toString());
    await updateDoc(userRef, data);
  }, [currentUser.id]);

  const logout = useCallback(() => {
    localStorage.clear();
    window.location.reload();
  }, []);

  const completeInitialSetup = useCallback((data: { name: string; types: UserType[] }) => {
    const updated = { ...currentUser, ...data, isPro: true };
    saveProfile(updated);
    setProfileComplete(true);
    localStorage.setItem('elite_onboarded', 'true');
    return { startTour: true };
  }, [currentUser, saveProfile]);

  const startChat = useCallback((otherId: number) => {
    const threadId = [currentUser.id, otherId].sort().join("_");
    const existing = messages.find(m => m.id === parseInt(threadId));
    if (existing) return existing.id;

    const newThread = {
      id: Date.now(),
      participantId: otherId,
      messages: [],
      lastMessage: "",
      timestamp: "Maintenant",
      unread: false
    };
    setDoc(doc(db, "messages", threadId), newThread);
    return newThread.id;
  }, [currentUser.id, messages]);

  const addMessage = useCallback(async (threadId: number, text: string) => {
    const threadRef = doc(db, "messages", threadId.toString());
    const msg = { id: Date.now(), senderId: currentUser.id, text, timestamp: new Date().toLocaleTimeString() };
    await updateDoc(threadRef, {
      messages: arrayUnion(msg),
      lastMessage: text,
      timestamp: "Maintenant"
    });
  }, [currentUser.id]);

  const value = useMemo(() => ({
    isLoggedIn, isProfileComplete, users, messages, bookings, currentUser, moodboards: {}, spots, isRefreshingSpots, isLoadingData,
    login, register, logout, deleteAccount: logout, completeInitialSetup, completeProOnboarding: () => { },
    updateCurrentUser, saveProfile, startChat, addMessage, confirmBooking: () => { }, updateBookingStatus: () => { },
    postReview: () => { }, refreshLocation, updateMoodboard: () => { }, trackAction: () => { }, refreshSpots
  }), [isLoggedIn, isProfileComplete, users, messages, spots, isRefreshingSpots, isLoadingData, currentUser, login, register, logout, completeInitialSetup, updateCurrentUser, saveProfile, startChat, addMessage, refreshLocation, refreshSpots]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const c = useContext(UserContext);
  if (!c) throw new Error("Provider missing");
  return c;
};
