// Configuration Firebase temporaire pour mode développement
// En mode dev, on simule Firebase pour éviter les erreurs de modules natifs

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDGy6eq4jYVEipqgaU622L7yvdzYNI_CEE",
  authDomain: "recycle-app-9f5cd.firebaseapp.com",
  projectId: "recycle-app-9f5cd",
  storageBucket: "recycle-app-9f5cd.appspot.com",
  messagingSenderId: "103696690890",
  appId: "1:103696690890:web:164dc4c4f5c73bc7394e33"
};

// Simulation des services Firebase en mode développement
const mockAuth = {
  currentUser: null,
  signIn: () => Promise.resolve({ user: { uid: 'mock-user-id' } }),
  signOut: () => Promise.resolve(),
  onAuthStateChanged: (callback: any) => callback(null)
};

const mockDb = {
  collection: () => ({
    doc: () => ({
      get: () => Promise.resolve({ data: () => ({}) }),
      set: () => Promise.resolve(),
      update: () => Promise.resolve()
    })
  })
};

const mockStorage = {
  ref: () => ({
    put: () => Promise.resolve({ ref: { getDownloadURL: () => Promise.resolve('mock-url') } })
  })
};

// Services selon l'environnement
const auth = __DEV__ ? mockAuth : require('@react-native-firebase/auth').default();
const db = __DEV__ ? mockDb : require('@react-native-firebase/firestore').default();
const storage = __DEV__ ? mockStorage : require('@react-native-firebase/storage').default();

// Objet de compatibilité pour l'export
const app = { config: firebaseConfig };

export { app, auth, db, storage };

