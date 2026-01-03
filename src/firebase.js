// Import required Firebase SDK functions
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCXub-e0gzeru2F_F0lkea7TtqMZDWk_co",
  authDomain: "the-guide-284fc.firebaseapp.com",
  projectId: "the-guide-284fc",
  storageBucket: "the-guide-284fc.appspot.com", // FIXED: must end with .appspot.com
  messagingSenderId: "62666972108",
  appId: "1:62666972108:web:07d1cec975360ffda25b69",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firestore + Storage
export const db = getFirestore(app);
export const storage = getStorage(app);
