// Importation de Firebase React Native
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDGy6eq4jYVEipqgaU622L7yvdzYNI_CEE",
  authDomain: "recycle-app-9f5cd.firebaseapp.com",
  projectId: "recycle-app-9f5cd",
  storageBucket: "recycle-app-9f5cd.appspot.com",
  messagingSenderId: "103696690890",
  appId: "1:103696690890:web:164dc4c4f5c73bc7394e33"
};

// Services Firebase (s'initialisent automatiquement)
const db = firestore();
const storageService = storage();

// Objet de compatibilité pour l'export
const app = { config: firebaseConfig };

export { app, auth, db, storageService as storage };

