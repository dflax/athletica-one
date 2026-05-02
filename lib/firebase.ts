import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Only initialize if we have the config (prevents build errors on Vercel if env vars aren't set during build)
const isConfigValid = !!firebaseConfig.apiKey;

const app: FirebaseApp = (getApps().length === 0 && isConfigValid) 
  ? initializeApp(firebaseConfig) 
  : (getApps()[0] || {} as FirebaseApp);

export const auth: Auth = isConfigValid ? getAuth(app) : {} as Auth;
export const db: Firestore = isConfigValid ? getFirestore(app) : {} as Firestore;
