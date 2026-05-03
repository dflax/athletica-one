import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
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

let app: FirebaseApp;
try {
  if (getApps().length > 0) {
    app = getApp();
  } else if (isConfigValid) {
    app = initializeApp(firebaseConfig);
  } else {
    app = {} as FirebaseApp;
  }
} catch (error) {
  console.error("Firebase initialization error:", error);
  app = getApps()[0] || {} as FirebaseApp;
}

export const auth: Auth = (isConfigValid && app && 'name' in app) ? getAuth(app) : {} as Auth;
export const db: Firestore = (isConfigValid && app && 'name' in app) ? getFirestore(app) : {} as Firestore;
