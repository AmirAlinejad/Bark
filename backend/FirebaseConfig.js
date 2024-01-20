import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';


// Your web app's Firebase configuration
const firebaseConfig = {
   apiKey: "AIzaSyAN-dmcCRHJhMmPH9yhvEHDivQ7DnAY2LM",
  authDomain: "kaddie-app-6803e.firebaseapp.com",
  projectId: "kaddie-app-6803e",
  storageBucket: "kaddie-app-6803e.appspot.com",
  messagingSenderId: "121699617458",
  appId: "1:121699617458:web:e75ba4a2512033439ed7ab"
};


// Initialize Firebase app
const app = initializeApp(firebaseConfig);


// Get Firebase services
const auth = getAuth(app); // Authentication
const firestore = getFirestore(app); // Firestore
const db = getDatabase(app); // Realtime Database
export const FIREBASE_APP = initializeApp(firebaseConfig);
export const FIREBASE_AUTH = getAuth(FIREBASE_APP);
export { auth, firestore, db};
export default app;