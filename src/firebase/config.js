import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getDatabase } from 'firebase/database'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
  // Dependiendo de tu región, podrías necesitar añadir:
  // databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Auth
const auth = getAuth(app)

// Initialize Google Provider
const googleProvider = new GoogleAuthProvider()

// Initialize Realtime Database
const db = getDatabase(app)

export { app, auth, googleProvider, db }
