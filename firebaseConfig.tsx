// Importer Firebase et les services nécessaires
import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDGy6eq4jYVEipqgaU622L7yvdzYNI_CEE",
  authDomain: "recycle-app-9f5cd.firebaseapp.com",
  projectId: "recycle-app-9f5cd",
  storageBucket: "recycle-app-9f5cd.appspot.com",
  messagingSenderId: "103696690890",
  appId: "1:103696690890:web:164dc4c4f5c73bc7394e33"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);

// Initialiser les services
const auth = getAuth();
const db = getFirestore();
const storage = getStorage();

// Configuration pour React Native
if (__DEV__) {
  // En développement, on peut connecter aux émulateurs si nécessaire
  // connectAuthEmulator(auth, 'http://localhost:9099');
  // connectFirestoreEmulator(db, 'localhost', 8080);
}

export { app, auth, db, storage };
