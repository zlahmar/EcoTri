<<<<<<< HEAD
=======
// Importer Firebase et les services nécessaires
>>>>>>> c95afc6d013d9e43c6593487d1478fb576db87ba
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
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
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

<<<<<<< HEAD
export { auth, db, storage };
=======
export { auth, db, storage };
>>>>>>> c95afc6d013d9e43c6593487d1478fb576db87ba
