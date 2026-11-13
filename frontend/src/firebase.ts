import { initializeApp } from 'firebase/app';
import { GoogleAuthProvider, getAuth } from 'firebase/auth';

const rawApiKey = import.meta.env.VITE_FIREBASE_API_KEY;
const fallbackApiKey = 'AIzaSyAkqVYAMQfYZ_FLkD3Y8vXuwE4zhE44F_4';

export const isFirebaseConfigured =
  Boolean(rawApiKey && rawApiKey !== 'your_firebase_api_key' && !rawApiKey.includes('your_')) ||
  Boolean(fallbackApiKey);

const firebaseConfig = {
  apiKey: rawApiKey || fallbackApiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'crowddensitymahakumbh.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'crowddensitymahakumbh',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'crowddensitymahakumbh.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '990163081493',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:990163081493:web:52ef8d066e2e166ca7311c',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
  prompt: 'select_account',
});
