# Guide de Configuration - Conseils de Recyclage avec Firebase

Ce guide explique comment configurer et utiliser la fonctionnalité des conseils de recyclage avec Firebase Firestore.

## 🚀 Configuration Firebase

### 1. Configuration Firestore

1. **Activer Firestore** dans la console Firebase
2. **Créer la collection `advice`** avec les règles de sécurité suivantes :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Collection des conseils
    match /advice/{adviceId} {
      // Lecture : tout le monde peut lire les conseils publiés
      allow read: if resource.data.isPublished == true;

      // Écriture : utilisateurs authentifiés peuvent créer/modifier leurs conseils
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null &&
        resource.data.authorId == request.auth.uid;
    }

    // Collection des utilisateurs
    match /users/{userId} {
      allow read, write: if request.auth != null &&
        request.auth.uid == userId;
    }

    // Collection des résultats de scan
    match /scanResults/{scanId} {
      allow read, write: if request.auth != null &&
        resource.data.userId == request.auth.uid;
    }
  }
}
```

### 2. Configuration Storage

Pour les images des conseils, configurez Firebase Storage :

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Images des conseils
    match /adviceImages/{userId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null &&
        request.auth.uid == userId;
    }

    // Images des scans
    match /scanImages/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null &&
        request.auth.uid == userId;
    }
  }
}
```

## 📊 Structure des Données

### Collection `advice`

```javascript
{
  id: "auto-generated",
  title: "Titre du conseil",
  content: "Contenu détaillé du conseil...",
  category: "plastic", // Référence à ADVICE_CATEGORIES
  imageUrl: "https://...", // Optionnel
  authorId: "user-id",
  authorName: "Nom de l'auteur",
  likes: 42,
  views: 156,
  isPublished: true,
  tags: ["recyclage", "plastique", "tri"],
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### Catégories disponibles

- `general` - Conseils généraux
- `plastic` - Recyclage du plastique
- `paper` - Recyclage du papier/carton
- `glass` - Recyclage du verre
- `metal` - Recyclage des métaux
- `organic` - Déchets verts/compostage
- `electronics` - Appareils électroniques
- `textile` - Vêtements et textiles

## 🔧 Initialisation des Données

### 1. Exécuter le script d'initialisation

```bash
# Installer les dépendances
npm install firebase-admin

# Configurer le chemin vers votre clé de service
# Modifier le chemin dans scripts/initAdviceData.js

# Exécuter le script
node scripts/initAdviceData.js
```

### 2. Données de base incluses

Le script ajoute automatiquement 10 conseils de base couvrant :

- Tri des déchets plastiques
- Compostage domestique
- Recyclage papier/carton
- Appareils électroniques
- Recyclage du verre
- Recyclage des métaux
- Textiles et vêtements
- Les 3 R (Réduire, Réutiliser, Recycler)
- Éviter le suremballage
- Piles et batteries

## 🎯 Fonctionnalités

### Pour les Utilisateurs

1. **Consulter les conseils**

   - Liste complète des conseils publiés
   - Filtrage par catégorie
   - Recherche par mot-clé
   - Conseils populaires en vedette

2. **Interagir avec les conseils**

   - Liker les conseils utiles
   - Voir le nombre de vues
   - Consulter les détails complets

3. **Ajouter des conseils**
   - Formulaire d'ajout avec catégorisation
   - Système de tags
   - Modération automatique (non publié par défaut)

### Pour les Administrateurs

1. **Gestion des conseils**

   - Modération via Firebase Console
   - Publication/dépublication
   - Modification des conseils existants

2. **Statistiques**
   - Nombre de vues par conseil
   - Nombre de likes
   - Conseils les plus populaires

## 📱 Interface Utilisateur

### Écran Principal

- **Header** avec titre et navigation
- **Barre de recherche** pour trouver des conseils
- **Conseils populaires** en carrousel horizontal
- **Filtres par catégorie** avec icônes
- **Liste des conseils** avec cartes détaillées
- **FAB** pour ajouter un nouveau conseil

### Modal d'Ajout

- **Formulaire complet** avec validation
- **Sélecteur de catégorie** avec icônes
- **Système de tags** dynamique
- **Prévisualisation** avant envoi

### Modal de Détail

- **Contenu complet** du conseil
- **Métadonnées** (auteur, date, stats)
- **Tags** associés
- **Actions** (like, partage)

## 🔒 Sécurité et Modération

### Système de Modération

1. **Nouveaux conseils** : Non publiés par défaut
2. **Modération manuelle** : Via Firebase Console
3. **Contrôle d'accès** : Seuls les auteurs peuvent modifier
4. **Authentification** : Requise pour l'ajout

### Règles de Validation

- **Titre** : 3-100 caractères
- **Contenu** : 10-2000 caractères
- **Catégorie** : Doit exister dans ADVICE_CATEGORIES
- **Tags** : Maximum 5 tags par conseil

## 📈 Analytics et Monitoring

### Métriques Disponibles

- **Vues** : Nombre de consultations
- **Likes** : Engagement utilisateur
- **Catégories populaires** : Tendances
- **Conseils les plus consultés** : Top 10

### Monitoring Firebase

- **Firestore** : Lectures/écritures
- **Storage** : Utilisation des images
- **Functions** : Appels aux Cloud Functions

## 🚀 Déploiement

### 1. Configuration Production

```bash
# Déployer les règles Firestore
firebase deploy --only firestore:rules

# Déployer les règles Storage
firebase deploy --only storage

# Déployer les Cloud Functions (si utilisées)
firebase deploy --only functions
```

### 2. Variables d'Environnement

```env
# Firebase Config
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
```

## 🐛 Dépannage

### Problèmes Courants

1. **Conseils ne se chargent pas**

   - Vérifier les règles Firestore
   - Contrôler la connexion internet
   - Vérifier les permissions utilisateur

2. **Impossible d'ajouter un conseil**

   - Vérifier l'authentification
   - Contrôler les règles de sécurité
   - Valider le format des données

3. **Images ne s'affichent pas**
   - Vérifier les règles Storage
   - Contrôler les URLs des images
   - Vérifier les permissions de lecture

### Logs et Debug

```javascript
// Activer les logs Firebase
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

if (__DEV__) {
  const db = getFirestore();
  connectFirestoreEmulator(db, "localhost", 8080);
}
```

## 📚 Ressources Additionnelles

- [Documentation Firebase Firestore](https://firebase.google.com/docs/firestore)
- [Guide de sécurité Firestore](https://firebase.google.com/docs/firestore/security)
- [Règles de sécurité Storage](https://firebase.google.com/docs/storage/security)
- [Firebase Console](https://console.firebase.google.com/)

## 🤝 Contribution

Pour ajouter de nouveaux conseils ou améliorer la fonctionnalité :

1. **Ajouter des conseils** via l'interface utilisateur
2. **Modifier le script** `initAdviceData.js` pour de nouvelles données
3. **Proposer des améliorations** via les issues GitHub
4. **Tester** sur l'environnement de développement

---

**Note** : Cette fonctionnalité nécessite une connexion internet pour fonctionner correctement. Les conseils sont mis en cache localement pour une meilleure expérience utilisateur.
