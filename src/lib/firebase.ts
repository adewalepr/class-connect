// Core Firebase and Mock state connection manager
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const isLiveFirebase = !!import.meta.env.VITE_FIREBASE_API_KEY;

let app: any;
let auth: any;
let db: any;

if (isLiveFirebase) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    console.log("🔥 Live Firebase Auth and Firestore initialized successfully!");
  } catch (err) {
    console.error("⚠️ Failed to initialize live Firebase. Falling back to local offline mock.", err);
  }
} else {
  console.log("ℹ️ No Firebase credentials found. Running in Offline Mock Database Mode!");
}

export { app, auth, db, isLiveFirebase };
