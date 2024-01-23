import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';


// Your web app's Firebase configuration
const firebaseConfig = {
   apiKey: "AIzaSyBOmcypoNUUBQvcUkZXY1iApyFt-g5SShQ",
   authDomain: "bark-50973.firebaseapp.com",
   databaseURL: "https://bark-50973-default-rtdb.firebaseio.com",
   projectId: "bark-50973",
   storageBucket: "bark-50973.appspot.com",
   messagingSenderId: "1042000694921",
   appId: "1:1042000694921:web:a9ed4e0a94aff6a8cc8058",
   measurementId: "G-TCL1F4R21B"
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
