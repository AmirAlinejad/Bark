import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCXC2ScEiVcDM6YeqUAsR2omnGS3ECDOHI",
    authDomain: "kaddie-1c342.firebaseapp.com",
    projectId: "kaddie-1c342",
    storageBucket: "kaddie-1c342.appspot.com",
    messagingSenderId: "645709232664",
    appId: "1:645709232664:web:2dbe09a5a1f34891af616d",
    measurementId: "G-M6D7HVCJZ3"
};

// Initialize Firebase
export const FIREBASE_APP = initializeApp(firebaseConfig);
export const FIREBASE_AUTH = getAuth(FIREBASE_APP);