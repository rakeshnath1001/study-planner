import { initializeApp, type FirebaseOptions } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';

const requiredEnv = (key: keyof ImportMetaEnv) => {
  const value = import.meta.env[key];

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
};

const firestoreDatabaseId = requiredEnv('VITE_FIRESTORE_DATABASEID');

const firebaseConfig: FirebaseOptions = {
  apiKey: requiredEnv('VITE_FIREBASE_APIKEY'),
  authDomain: requiredEnv('VITE_FIREBASE_AUTHDOMAIN'),
  projectId: requiredEnv('VITE_FIREBASE_PROJECTID'),
  storageBucket: requiredEnv('VITE_FIREBASE_STORAGEBUCKET'),
  messagingSenderId: requiredEnv('VITE_FIREBASE_MESSAGINGSENDERID'),
  appId: requiredEnv('VITE_FIREBASE_APPID'),
  measurementId: requiredEnv('VITE_FIREBASE_MEASUREMENTID'),
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);

// Connection test as required by instructions
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();
