
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDSUs5RG9FzBBhalMqWlTpUUXiARAHfzi4",
  authDomain: "konnekt-65783.firebaseapp.com",
  projectId: "konnekt-65783",
  storageBucket: "konnekt-65783.firebasestorage.app",
  messagingSenderId: "9607367182",
  appId: "1:9607367182:web:4532a83b2f5a09635bca5f",
  measurementId: "G-G7E4YN7GWZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

// Configure Google provider
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export { auth, db, storage, googleProvider };
