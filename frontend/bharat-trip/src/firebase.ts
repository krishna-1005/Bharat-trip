import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDnq6rwoPL4s8GAPoZ5xqUc_jCCkS461Hs",
  authDomain: "bharat-trip-620eb.firebaseapp.com",
  projectId: "bharat-trip-620eb",
  storageBucket: "bharat-trip-620eb.firebasestorage.app",
  messagingSenderId: "933478377830",
  appId: "1:933478377830:web:ee33ddcac0013a34c5c0a7"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
