// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDXMkfNKl9T_QXhPwljuTLWMHxEMHnZP_I",
  authDomain: "sih-2025-c45ea.firebaseapp.com",
  projectId: "sih-2025-c45ea",
  storageBucket: "sih-2025-c45ea.firebasestorage.app",
  messagingSenderId: "873556812716",
  appId: "1:873556812716:web:c0bc7c9821a4b10ae55009",
  measurementId: "G-GY2E91JY7C",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export default app;
