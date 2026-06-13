// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries


// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD4RF_X1028QYSUa4egmFGBWo2seHOyE-g",
  authDomain: "intern-area-d478f.firebaseapp.com",
  projectId: "intern-area-d478f",
  storageBucket: "intern-area-d478f.firebasestorage.app",
  messagingSenderId: "744456749293",
  appId: "1:744456749293:web:37454a39cda5be3f138ce4",
  measurementId: "G-DHGTJEKJNH"
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
