
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Valeurs extraites de ta capture d'écran Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBT3kVvHUsisdo-8boqdOPodM5dgepUKmE",
  authDomain: "findphotographer-elite.firebaseapp.com",
  projectId: "findphotographer-elite",
  storageBucket: "findphotographer-elite.firebasestorage.app",
  messagingSenderId: "650066720171",
  appId: "1:650066720171:web:29bd7674fc64f7e8bdceee",
  measurementId: "G-R1SKRR0B8W"
};

// Initialisation
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
