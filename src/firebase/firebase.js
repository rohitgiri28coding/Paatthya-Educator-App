import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBohXiRj8JLC-9HvH6s4yuaggQiVdX80Bg",
  authDomain: "srit-feea9.firebaseapp.com",
  projectId: "srit-feea9",
  storageBucket: "srit-feea9.firebasestorage.app",
  messagingSenderId: "539055371664",
  appId: "1:539055371664:web:f39dbc394f939ad6d5ef15",
  measurementId: "G-8Z922G91JJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)

export { auth, db } 