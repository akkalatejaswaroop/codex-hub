import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBeDuSz97J5k4UPQ0i4izS74dEmJI0knxQ",
    authDomain: "violet-horizon.firebaseapp.com",
    projectId: "violet-horizon",
    storageBucket: "violet-horizon.firebasestorage.app",
    messagingSenderId: "565187947189",
    appId: "1:565187947189:web:e4b3f95914968d52de6cfc"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
