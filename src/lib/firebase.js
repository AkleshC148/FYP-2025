import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "agri-smart-63464.firebaseapp.com",
  databaseURL: "https://agri-smart-63464-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "agri-smart-63464",
  storageBucket: "agri-smart-63464.firebasestorage.app",
  messagingSenderId: "693206971053",
  appId: "1:693206971053:web:da3e3c6d90dba767b5cc24",
  measurementId: "G-VHX4J6EVT6"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const db = getDatabase(app);

export { db, app };