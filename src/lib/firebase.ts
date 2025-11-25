import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAdAmgVqLetRsDrC8a6aP4vL_0G0HqiBMY",
  authDomain: "intern-timestamp.firebaseapp.com",
  projectId: "intern-timestamp",
  storageBucket: "intern-timestamp.firebasestorage.app",
  messagingSenderId: "662411030216",
  appId: "1:662411030216:web:3520a57474b729e66ebffd",
  measurementId: "G-KMF96JL71E"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

let analytics;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export { auth, db, analytics };
