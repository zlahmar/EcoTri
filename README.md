# EcoTri: Transformez vos déchets en trésors

## 1. Installation

### Prérequis

- Node.js (version 18 ou supérieure)
- npm ou yarn
- Expo CLI
- Un émulateur Android/iOS ou un appareil physique
- Compte Firebase (pour la configuration)

### Étapes d'installation

1. **Cloner le dépôt**

   ```sh
   git clone https://github.com/zlahmar/ecotri.git
   cd ecotri
   ```

2. **Installer les dépendances**

   ```sh
   npm install
   ```

3. **Configuration Firebase**
   - Créer un projet Firebase
   - Activer Authentication, Firestore, Storage et Functions
   - Télécharger le fichier de configuration et le placer à la racine du projet
   - Renommer le fichier en `firebaseConfig.tsx`

4. **Configuration des variables d'environnement**

   ```sh
   # Créer un fichier .env à la racine du projet
   FIREBASE_API_KEY=your_api_key
   FIREBASE_AUTH_DOMAIN=your_auth_domain
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_STORAGE_BUCKET=your_storage_bucket
   FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   FIREBASE_APP_ID=your_app_id
   ```

5. **Lancer l'application**

   ```sh
   npm start
   ```

6. **Lancer les tests**
   ```sh
   npm test
   ```

---

## 2. Présentation du Projet

### 2.1 Contexte

EcoTri vise à améliorer la gestion des déchets en facilitant l'accès aux points de recyclage via la géolocalisation et la reconnaissance d'images. L'application encourage des pratiques éco-responsables à travers des conseils et un système de gamification.

### 2.2 Objectifs

- **Faciliter le recyclage** : Aider les utilisateurs à identifier les points de recyclage les plus proches.
- **Éduquer** : Fournir des informations sur le tri des déchets et les bonnes pratiques.
- **Motiver** : Utiliser la gamification pour encourager les comportements éco-responsables.
- **Connecter** : Créer une communauté d'utilisateurs engagés dans le recyclage.

---

## 3. Fonctionnalités Principales

### 3.1 Localisation et Carte Interactive

- Affichage des points de recyclage proches via une carte interactive.
- Filtrage par type de déchet (plastique, verre, papier, etc.).
- Navigation vers les points de recyclage via Google Maps/Apple Maps.
- Géolocalisation automatique avec gestion des permissions.

### 3.2 Scan des Déchets

- Utilisation de la caméra pour identifier le type de déchet.
- Reconnaissance d'images avec ML Kit.
- Proposition du point de recyclage adapté.
- Historique des scans avec statistiques.

### 3.3 Système de Conseils

- Base de données de conseils de recyclage.
- Filtrage par catégorie de déchet.
- Système de likes et de popularité.
- Recherche dans les conseils.
- Ajout de nouveaux conseils par les utilisateurs.

### 3.4 API et Gestion des Données

- Connexion à l'API Overpass pour récupérer les points de recyclage.
- Possibilité pour les utilisateurs d'ajouter de nouveaux points.
- Mise à jour automatique des données.
- Synchronisation avec Firebase.

### 3.5 Notifications et Sensibilisation

- Rappels sur les jours de collecte locaux.
- Conseils et astuces pour mieux recycler.
- Suivi des habitudes de recyclage.

### 3.6 Gamification

- Attribution de points pour chaque action de recyclage.
- Système de niveaux basé sur les points accumulés.
- Défis et badges pour motiver les utilisateurs.
- Classements et partage sur les réseaux sociaux.
- Statistiques détaillées des performances.

### 3.7 Authentification et Profil

- Connexion avec Google, Email/Mot de passe.
- Profil utilisateur avec statistiques personnelles.
- Historique des actions de recyclage.
- Paramètres personnalisables.

---

## 4. Technologies et Architecture

### 4.1 Technologies

- **Framework mobile** : React Native avec Expo
- **Carte interactive** : React Native Maps avec OpenStreetMap
- **Base de données** : Firebase Firestore
- **Stockage d'images** : Firebase Storage
- **Authentification** : Firebase Auth
- **Reconnaissance d'images** : ML Kit (TensorFlow Lite)
- **Géolocalisation** : Expo Location
- **Tests** : Jest avec React Native Testing Library

### 4.2 Architecture du Projet

```
EcoTri/
│── src/
│   ├── components/      # Composants réutilisables
│   │   ├── MapComponent.tsx
│   │   └── CategoryFilter.tsx
│   ├── screens/         # Pages principales
│   │   ├── HomeScreen.tsx
│   │   ├── ScanScreen.tsx
│   │   ├── AdviceScreen.tsx
│   │   ├── ProfilScreen.tsx
│   │   ├── LoginScreen.tsx
│   │   └── SignupScreen.tsx
│   ├── navigation/      # Gestion de la navigation
│   │   └── AppNavigator.tsx
│   ├── services/        # Services métier
│   │   ├── adviceService.ts
│   │   ├── mlKitService.ts
│   │   └── storageService.ts
│   ├── hooks/           # Hooks personnalisés
│   │   └── useLocation.ts
│   ├── assets/          # Images et icônes
│   ├── styles/          # Styles globaux
│   │   ├── colors.ts
│   │   └── global.ts
│   └── __tests__/       # Tests unitaires
│       ├── AdviceService.test.ts
│       ├── MLKitService.test.ts
│       ├── StorageService.test.ts
│       ├── useLocation.test.ts
│       └── [autres tests]
│── functions/           # Cloud Functions Firebase
│── __mocks__/           # Mocks pour les tests
│── firebaseConfig.tsx   # Configuration Firebase
│── App.tsx              # Point d'entrée
│── package.json         # Dépendances du projet
│── jest.config.ts       # Configuration Jest
│── TEST_SUMMARY.md      # Résumé des tests
│── README.md            # Documentation
```

**Détails des dossiers**

- **screens/** : Écrans principaux avec navigation et gestion d'état.
- **components/** : Composants réutilisables pour la carte et les filtres.
- **navigation/** : Gestion de la navigation avec React Navigation.
- **services/** : Services métier pour Firebase, ML Kit et stockage.
- **hooks/** : Hooks personnalisés pour la géolocalisation.
- ****tests**/** : Tests unitaires complets avec 97.9% de réussite.
- **functions/** : Cloud Functions Firebase pour la logique serveur.

---

## 5. Tests et Qualité

### 5.1 Couverture de Tests

- **Couverture globale** : 81.48%
- **Tests passés** : 46/47 (97.9% de réussite)
- **Services testés** : AdviceService, MLKitService, StorageService
- **Hooks testés** : useLocation
- **Composants testés** : HomeScreen, MapComponent, AdviceScreen

### 5.2 Commandes de Test

```bash
# Lancer tous les tests
npm test

# Lancer les tests avec couverture
npm test -- --coverage

# Tester un service spécifique
npm test -- --testPathPatterns="AdviceService.test.ts"

# Tester le hook useLocation
npm test -- --testNamePattern="useLocation"

# Mode watch pour développement
npm test -- --watch
```

### 5.3 Qualité du Code

- **ESLint** : Configuration stricte pour maintenir la qualité
- **TypeScript** : Typage strict pour éviter les erreurs
- **Tests unitaires** : Couverture complète des services
- **Mocks** : Configuration complète pour Firebase et Expo

---

## 6. Déroulement du Projet

### Phases de Développement

1. **Analyse et Conception** : Définition des besoins et création des maquettes UI/UX.
2. **Développement** : Implémentation des fonctionnalités principales.
3. **Tests** : Vérification de la stabilité et correction des bugs.
4. **Lancement** : Déploiement sur les stores (Google Play & App Store).
5. **Maintenance et Améliorations** : Ajout de nouvelles fonctionnalités et mises à jour.

### Fonctionnalités Implémentées

- ✅ Authentification complète (Google, Email)
- ✅ Géolocalisation avec gestion des permissions
- ✅ Carte interactive avec points de recyclage
- ✅ Scan d'images avec ML Kit
- ✅ Système de conseils avec recherche
- ✅ Gamification avec points et niveaux
- ✅ Profil utilisateur avec statistiques
- ✅ Tests unitaires complets
- ✅ Configuration Firebase complète

---

## 7. Configuration et Déploiement

### 7.1 Configuration Firebase

1. **Créer un projet Firebase**
2. **Activer les services** :
   - Authentication (Google, Email)
   - Firestore Database
   - Storage
   - Functions
3. **Configurer les règles de sécurité**
4. **Déployer les Cloud Functions**

### 7.2 Variables d'Environnement

```env
# Firebase Configuration
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_auth_domain
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_storage_bucket
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id

# API Keys
GOOGLE_MAPS_API_KEY=your_google_maps_key
ML_KIT_API_KEY=your_ml_kit_key
```

### 7.3 Déploiement

```bash
# Build pour Android
expo build:android

# Build pour iOS
expo build:ios

# Déployer les Cloud Functions
cd functions
npm install
firebase deploy --only functions
```

---

## 8. Conclusion

EcoTri facilite l'accès aux points de recyclage et encourage une gestion plus efficace des déchets. Grâce à la géolocalisation, la reconnaissance d'images et l'intégration d'API, elle propose une solution engageante et éducative pour un recyclage plus efficace.

### Points Forts

- **Interface intuitive** avec carte interactive
- **Reconnaissance d'images** pour identifier les déchets
- **Système de gamification** pour motiver les utilisateurs
- **Base de données de conseils** éducative
- **Tests complets** avec 97.9% de réussite
- **Architecture modulaire** et maintenable

---

## 9. Outils Utilisés

- **Jira** → Gestion des tâches et suivi du projet
- **Firebase** → Auth, Firestore, Storage, Functions
- **OpenStreetMap API** → Géolocalisation et points de recyclage
- **ML Kit** → Reconnaissance d'images (Scan des déchets)
- **React Native** → Développement mobile cross-platform
- **Expo** → Outils de développement et déploiement
- **Jest** → Framework de tests
- **GitHub** → Gestion du code et collaboration
- **TypeScript** → Typage statique
- **ESLint** → Qualité du code
