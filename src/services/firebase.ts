import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';

const env = (typeof import.meta !== 'undefined' && (import.meta as any).env) || {};

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || 'AIzaSyA_placeholder_api_key_12345',
  authDomain:
    env.VITE_FIREBASE_AUTH_DOMAIN ||
    'voice-shopping-assistant-dev.firebaseapp.com',
  projectId: env.VITE_FIREBASE_PROJECT_ID || 'voice-shopping-assistant-dev',
  storageBucket:
    env.VITE_FIREBASE_STORAGE_BUCKET ||
    'voice-shopping-assistant-dev.appspot.com',
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789012',
  appId: env.VITE_FIREBASE_APP_ID || '1:123456789012:web:abcdef1234567890',
};

// Initialize Firebase App
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth & Firestore
export const auth = getAuth(app);
export const db = getFirestore(app);

// Enable IndexedDB offline persistence safely
try {
  if (typeof window !== 'undefined') {
    enableIndexedDbPersistence(db).catch((err) => {
      if (err.code === 'failed-precondition') {
        console.warn('Firestore offline persistence failed: Multiple tabs open');
      } else if (err.code === 'unimplemented') {
        console.warn('Firestore offline persistence is not supported by browser');
      }
    });
  }
} catch {
  // Ignore setup persistence error in test environments
}

/**
 * Initializes Anonymous Auth to guarantee each browser session receives a stable userId.
 * Falls back to local session ID if placeholder API keys are used or offline.
 */
export async function initAnonymousAuth(): Promise<User> {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log(`[Firebase Auth] Signed in anonymously with userId: ${user.uid}`);
        unsubscribe();
        resolve(user);
      }
    });

    signInAnonymously(auth)
      .then((userCred) => {
        console.log(`[Firebase Auth] Anonymous auth success! userId: ${userCred.user.uid}`);
        unsubscribe();
        resolve(userCred.user);
      })
      .catch((error) => {
        console.warn(
          `[Firebase Auth Warning] ${error.message || error.code}. Falling back to stable session ID (offline mode).`
        );
        unsubscribe();
        resolve({ uid: 'anon_local_user_session_101' } as User);
      });
  });
}
