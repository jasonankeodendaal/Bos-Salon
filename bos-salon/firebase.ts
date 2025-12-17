import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// --- PASTE YOUR FIREBASE CONFIGURATION HERE ---
// Follow the guide to get this from your Firebase project settings.
const firebaseConfig = {
  apiKey: "AIzaSyCJPiGbBs-T9Mj_wcvby-WtThkoZbDqUzU",
  authDomain: "inked-605f2.firebaseapp.com",
  projectId: "inked-605f2",
  storageBucket: "inked-605f2.appspot.com",
  messagingSenderId: "738054676293",
  appId: "1:738054676293:web:6f64deb80ef981d67a282c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get a Firestore database instance
export const db = getFirestore(app);
// Get a Firebase Auth instance
export const auth = getAuth(app);
// Get a Firebase Storage instance
export const storage = getStorage(app);
