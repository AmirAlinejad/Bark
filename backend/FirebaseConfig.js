import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';


// Your web app's Firebase configuration
const firebaseConfig = {
   apiKey: "AIzaSyBQ-PmZzg0lKOtRTJ4iwNHyevsjq8wmAQI",
   authDomain: "kaddie-61311.firebaseapp.com",
   projectId: "kaddie-61311",
   storageBucket: "kaddie-61311.appspot.com",
   messagingSenderId: "931727636427",
   appId: "1:931727636427:web:8950c12d7042dc01b2684e",
   measurementId: "G-RZ0RKMEZBZ"
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
