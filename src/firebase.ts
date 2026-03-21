import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAjNWE4T056HlXnThaDy8Uey0I1IwMUjes",
  authDomain: "sooch-b31bf.firebaseapp.com",
  projectId: "sooch-b31bf",
  storageBucket: "sooch-b31bf.firebasestorage.app",
  messagingSenderId: "479128702026",
  appId: "1:479128702026:web:b068021f978567c47e2ab3",
  measurementId: "G-QYJ28XC7HY",
};

const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export default app;
