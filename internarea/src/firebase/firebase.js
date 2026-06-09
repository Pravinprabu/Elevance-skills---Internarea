// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

import { getAuth, GoogleAuthProvider } from "firebase/auth";
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBMourQQ1wnBmEU-CjxP_VCzdORmFQNp5s",
  authDomain: "internarea-cf9d6.firebaseapp.com",
  projectId: "internarea-cf9d6",
  storageBucket: "internarea-cf9d6.firebasestorage.app",
  messagingSenderId: "870936711573",
  appId: "1:870936711573:web:4eed6c187efdeabd3be69c",
  measurementId: "G-MCCBBPH0GX"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { auth, provider };
