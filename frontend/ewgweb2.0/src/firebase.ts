import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "ewgweb2-a614a.firebaseapp.com",
  projectId: "ewgweb2-a614a",
  storageBucket: "ewgweb2-a614a.firebasestorage.app",
  messagingSenderId: "235566979068",
  appId: "1:235566979068:web:1b3c91d18b596481858479",
  measurementId: "G-0P3HYJT2RK",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
