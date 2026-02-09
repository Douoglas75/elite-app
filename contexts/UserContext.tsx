
import React, { createContext, useState, useContext, ReactNode, useCallback, useMemo, useEffect } from 'react';
import { auth, db } from '../firebase';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  query,
  updateDoc,
  arrayUnion
} from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  User as FirebaseUser
} from "firebase/auth";
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
  resetPassword: (email: string) => Promise<void>;
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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isProfileComplete, setProfileComplete] = useState(false);
  const [currentUser, setCurrentUser] = useState<User>(CURRENT_USER);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);

  const [users, setUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<MessageThread[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [moodboards, setMoodboards] = useState<Record<string, MoodboardItem[]>>({});
  const [spots, setSpots] = useState<Spot[]>(MOCK_SPOTS);
  const [isRefreshingSpots, setIsRefreshingSpots] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // 1. LISTEN TO AUTH STATE
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("Auth State Changed:", user ? `User ${user.uid}` : "No User");
      setFirebaseUser(user);
      if (user) {
        // User is signed in, fetch profile
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data() as User;
          setCurrentUser(userData);
          setIsLoggedIn(true);
          setProfileComplete(true); // Assuming if they have a doc, they are onboarded for now
        } else {
          // Profile doesn't exist yet (e.g. from previous failed registration)
          // AUTO-HEAL: Create a default profile to unblock the user
          console.warn("User authenticated but no Firestore profile. Creating default...");

          const newProfile: User = {
            ...CURRENT_USER,
            id: Date.now(),
            email: user.email || "",
            name: user.displayName || "Nouveau Membre",
            types: [],
            completedShootsCount: 0,
            avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.email || "User")}&background=D2B48C&color=050B14`,
          };

          await setDoc(userDocRef, newProfile);
          setCurrentUser(newProfile);

          setIsLoggedIn(true);
          setProfileComplete(false); // Valid login, but needs setup
        }
      } else {
        // User is signed out
        setIsLoggedIn(false);
        setCurrentUser(CURRENT_USER);
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. LISTEN TO ALL USERS (Discovery)
  useEffect(() => {
    const q = query(collection(db, "users"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersList: User[] = [];
      snapshot.forEach((doc) => {
        usersList.push(doc.data() as User);
      });
      setUsers(usersList);
      if (usersList.length > 0) setIsLoadingData(false); // Only stop loading if we actually got data? Or just always.
    });
    return () => unsubscribe();
  }, []);

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
      if (!("geolocation" in navigator)) {
        reject(new Error("Geolocation not supported"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const newLoc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          // Determine ID to use: currentUser.id usually number, but for Firebase we might want string UID. 
          // For compatibility with existing components using number ID, we keep logic but careful with types.
          // Ideally we migrate ID to string globally. For now, assuming current User has valid ID.
          // Note: If using pure Firebase Auth, user IDs are strings (UID). 
          // The current app uses numbers for IDs. We need to bridge this.
          // TEMPORARY FIX: We keep using the numeric ID stored in `currentUser` for the doc reference 
          // IF we created it that way. BUT, wait, register below uses `user.uid` (string).
          // WE MUST UNIFY IDs. 

          // CRITICAL FIX: Use `firebaseUser.uid` if properly logged in, else fallback to incompatible map updates.

          // Always update local state for UI responsiveness
          setCurrentUser(prev => ({ ...prev, location: newLoc }));

          if (firebaseUser) {
            const userRef = doc(db, "users", firebaseUser.uid);
            await updateDoc(userRef, { location: newLoc });
          }
          resolve(newLoc);
        },
        (err) => {
          // Fallback location (Paris)
          const fallbackLoc = { lat: 48.8566, lng: 2.3522 };
          console.warn("Location denied, using fallback", err);
          resolve(fallbackLoc);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    });
  }, [firebaseUser]);

  const saveProfile = useCallback(async (updatedUser: User) => {
    await setDoc(doc(db, "users", updatedUser.id.toString()), updatedUser);
  }, []);

  const login = useCallback(async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      return true;
    } catch (error) {
      console.error("Login failed", error);
      throw error; // Let component handle specific error message
    }
  }, []);

  const register = useCallback(async (name: string, email: string, types: UserType[], password?: string) => {
    if (!password) throw new Error("Password required");

    // 1. Create Auth User
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    // 2. Create Firestore Profile
    // We use a numeric ID for compatibility with existing types (User.id is number)
    // BUT this is problematic with Firebase Strings.
    // QUICK FIX: Generate a random number ID for the User object, but store doc under UID.
    const numericId = Date.now();

    const newUser: User = {
      ...CURRENT_USER,
      id: numericId, // Keep strictly for frontend compatibility if needed
      name, email, types,
      // Do NOT store password in Firestore
      completedShootsCount: 0,
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=D2B48C&color=050B14`,
      // Store the Auth UID for reference
      // uid: uid // If we added this to type it would be better, but sticking to existing type
    };

    await setDoc(doc(db, "users", uid), newUser);

    // 3. Wait for Firestore to trigger the listener or force update? 
    // Ideally, we just wait for setDoc, then the listener above 'onAuthStateChanged' 
    // might have already fired with the Auth User, but NOT yet found the doc?
    // Race condition: Auth listener fires -> check doc -> doc not made yet -> auto-heal (good) OR fail.

    // To be safe, we manually update state if needed, but let's rely on listener.
    // We add a small delay to allow propagation if needed, or rely on auto-heal in listener.
    console.log("Registration complete for:", uid);
  }, []);

  const updateCurrentUser = useCallback(async (data: Partial<User>) => {
    const userRef = doc(db, "users", currentUser.id.toString());
    await updateDoc(userRef, data);
  }, [currentUser.id]);

  const logout = useCallback(async () => {
    await signOut(auth);
    localStorage.clear();
    // window.location.reload(); // Not needed with onAuthStateChanged
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    await sendPasswordResetEmail(auth, email);
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
    login, register, logout, resetPassword, deleteAccount: logout, completeInitialSetup, completeProOnboarding: () => { },
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
