import { initializeApp, getApp, getApps } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
const firebaseConfig = {
  apiKey: "AIzaSyD-kSmc--J1GrT-O47f8i3mlFrrMHkK-6k",
  authDomain: "prepwise-5d7a8.firebaseapp.com",
  projectId: "prepwise-5d7a8",
  storageBucket: "prepwise-5d7a8.firebasestorage.app",
  messagingSenderId: "419009945089",
  appId: "1:419009945089:web:c0752c279825875f2bea00",
  measurementId: "G-W8JNYTPV08",
};

// Initialize Firebase
const app = !getApps.length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
