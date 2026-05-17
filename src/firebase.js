import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBIlMX8uh6TUTVudsbvISd_LQ5DfcHypIQ",
  authDomain: "h-yusuf-architect.firebaseapp.com",
  projectId: "h-yusuf-architect",
  storageBucket: "h-yusuf-architect.firebasestorage.app",
  messagingSenderId: "93248512119",
  appId: "1:93248512119:web:b456aa0931c6eb6f882672",
  measurementId: "G-ZV5ZHG384N"
};

const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
