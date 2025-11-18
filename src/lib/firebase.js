import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
// These variables are pulled from your .env.local file
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

// Initialize Firebase
// This check prevents re-initializing the app on every hot-reload in development
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Get a reference to the Realtime Database service
const db = getDatabase(app);

export { db, app };


// // Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries

// // Your web app's Firebase configuration
// // For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//   apiKey: "AIzaSyAQsHC-Md6ASEd4Xr_jMFD5tOdtg5nmhxI",
//   authDomain: "agri-smart-63464.firebaseapp.com",
//   databaseURL: "https://agri-smart-63464-default-rtdb.asia-southeast1.firebasedatabase.app",
//   projectId: "agri-smart-63464",
//   storageBucket: "agri-smart-63464.firebasestorage.app",
//   messagingSenderId: "693206971053",
//   appId: "1:693206971053:web:da3e3c6d90dba767b5cc24",
//   measurementId: "G-VHX4J6EVT6"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);