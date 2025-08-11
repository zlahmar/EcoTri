# Guide Technique - EcoTri

## Table des Matières

### 1. [Architecture du Projet](#architecture-du-projet)

- [Vue d'Ensemble](#vue-densemble)
- [Structure des Dossiers](#structure-des-dossiers)

### 2. [Choix Techniques](#choix-techniques)

- [Frontend - React Native + Expo](#frontend---react-native--expo)
- [Backend - Firebase](#backend---firebase)

### 3. [Services et Intégrations](#services-et-intégrations)

- [ML Kit - Reconnaissance d'Images](#ml-kit---reconnaissance-dimages)
- [Firebase Configuration](#firebase-configuration)
- [APIs Externes](#apis-externes)

### 4. [Sécurité et Conformité](#sécurité-et-conformité)

- [Authentification](#authentification)
- [Règles de Sécurité](#règles-de-sécurité)
- [Conformité Standards](#conformité-standards)

### 5. [Performance et Optimisation](#performance-et-optimisation)

- [Métriques de Performance](#métriques-de-performance)
- [Stratégies d'Optimisation](#stratégies-doptimisation)
- [Monitoring](#monitoring)

### 6. [Développement et Tests](#développement-et-tests)

- [Configuration de Développement](#configuration-de-développement)
- [Tests et Qualité](#tests-et-qualité)
- [Déploiement](#déploiement)

---

## Architecture du Projet

### Vue d'Ensemble

EcoTri suit une architecture modulaire basée sur React Native avec Expo, utilisant Firebase comme backend et ML Kit pour la reconnaissance d'images.

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Services      │
│   (React Native)│◄──►│   (Firebase)    │◄──►│   (ML Kit)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Composants    │    │   Firestore     │    │   Reconnaissance│
│   UI/UX         │    │   Storage       │    │   d'Images      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

> **Architecture détaillée :** Voir la section [Services et Intégrations](#services-et-intégrations)

### Structure des Dossiers

```
src/
├── components/                    # Composants réutilisables
│   ├── MapComponent.tsx          # Carte interactive
│   ├── CollectionScheduleComponent.tsx # Calendrier de collecte
│   ├── APIStatusComponent.tsx    # Statut des APIs
│   ├── DataDebugComponent.tsx    # Débogage des données
│   └── AvatarComponent.tsx       # Avatar utilisateur
├── screens/                      # Écrans de l'application
│   ├── SplashScreen.tsx         # Écran de démarrage
│   ├── LoginScreen.tsx          # Authentification
│   ├── SignupScreen.tsx         # Inscription
│   ├── HomeScreen.tsx           # Écran d'accueil
│   ├── ScanScreen.tsx           # Scanne IA de déchets
│   ├── AdviceScreen.tsx         # Conseils et astuces
│   ├── GuideScreen.tsx          # Guide d'utilisation
│   ├── CollectionNotificationsScreen.tsx # Page de collecte
│   └── ProfilScreen.tsx         # Profil utilisateur
├── services/                     # Services métier
│   ├── mlKitService.ts          # Reconnaissance d'images ML Kit
│   ├── storageService.ts        # Gestion Firebase Storage
│   ├── adviceService.ts         # Service des conseils
│   ├── apiService.ts            # API générique
│   ├── collectionScheduleService.ts # Calendrier de collecte
│   ├── mockAPIService.ts        # Mock pour tests
│   └── nationalAPIService.ts    # API nationale des déchets
├── hooks/                        # Hooks personnalisés
│   ├── useLocation.ts           # Géolocalisation
│   └── useNotifications.ts      # Gestion des notifications
├── navigation/                   # Navigation
│   └── AppNavigator.tsx         # Configuration navigation
├── styles/                       # Styles globaux
│   ├── colors.ts                # Palette de couleurs WCAG
│   └── global.ts                # Styles communs
├── assets/                       # Ressources statiques
│   ├── images/                  # Images et icônes
│   └── data/                    # Données locales (JSON)
└── __tests__/                    # Tests unitaires (71 tests)
    ├── AdviceScreen.test.tsx    # Tests écrans
    ├── AdviceService.test.ts    # Tests services
    ├── MapComponent.test.tsx    # Tests composants
    └── useLocation.test.ts      # Tests hooks
    ...
```

> **Voir la structure complète :** [`src/`](../src/) et [`__mocks__/`](../__mocks__/)

## Choix Techniques

### Frontend - React Native + Expo

**Pourquoi ce choix ?**

- **Développement cross-platform** : Une seule base de code pour iOS et Android
- **Performance native** : Accès aux APIs natives du téléphone
- **Écosystème riche** : Large communauté et nombreuses bibliothèques
- **Expo** : Simplifie le développement et le déploiement

**Alternatives considérées :**

- Flutter : Moins mature pour l'écosystème mobile
- Ionic : Performance inférieure pour les applications complexes
- Native pur : Développement plus long et maintenance complexe

### Backend - Firebase

**Pourquoi ce choix ?**

- **Scalabilité** : Gestion automatique de la charge
- **Authentification** : Système robuste et sécurisé
- **Base de données temps réel** : Firestore pour les données dynamiques
- **Stockage** : Firebase Storage pour les images
- **Analytics** : Suivi des performances et comportements

**Services Firebase utilisés :**

- **Firestore** : Base de données NoSQL pour les scans/conseils/statistiques
- **Storage** : Des informations de gamification/statistiques/conseils favoris/etc.
- **Auth** : Authentification utilisateur
- **Analytics** : Métriques d'utilisation

### IA - ML Kit (On-Device Avancé)

**Pourquoi ce choix ?**

- **Reconnaissance d'images** : Classification automatique des déchets
- **Intégration native** : Optimisé pour mobile avec `@react-native-ml-kit/image-labeling`
- **Hors ligne** : Fonctionne sans connexion internet
- **Gratuit** : 100% gratuit, contrairement à Google Cloud Vision API
- **Confidentialité** : Traitement local, aucune donnée envoyée au cloud
- **Performance** : Analyse rapide directement sur l'appareil
- **Détection d'environnement** : Mode développement vs production automatique

**Architecture ML Kit :**

```typescript
export class MLKitService {
  async analyzeImage(imageUri: string): Promise<AnalysisResult> {
    if (__DEV__) {
      return this.developmentAnalysis(); // Simulation en dev
    }
    try {
      const labels = await ImageLabeling.label(imageUri); // ML Kit réel
      return this.processRealLabels(labels);
    } catch (error) {
      return this.fallbackSimulation(); // Fallback si erreur
    }
  }
}
```

> **Voir le code complet :** [`src/services/mlKitService.ts`](../src/services/mlKitService.ts)

**Fonctionnalités ML Kit :**

- **Détection d'environnement** : Mode développement vs production automatique
- **Classification automatique** : Plastique, Métal, Papier, Verre, Carton
- **On-device processing** : Traitement local pour la confidentialité
- **Fallback intelligent** : Simulation si ML Kit indisponible
- **Gamification** : Tracking des scans pour points et niveaux

**Workflow de reconnaissance :**

1. **Capture** → Photo avec `expo-image-picker`
2. **Analyse** → ML Kit réel (production) ou simulation (développement)
3. **Classification** → Identification automatique du type de déchet
4. **Gamification** → +10 points, mise à jour statistiques

**Build EAS pour ML Kit :**

ML Kit nécessite des modules natifs, d'où l'utilisation d'EAS Build :

```bash
# Build de développement avec ML Kit
npx eas build --platform android --profile development
```

> **Voir la configuration complète :** [`eas.json`](../eas.json)

### Configuration Firebase

**Règles de sécurité Firestore :**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Règles pour les conseils, utilisateurs et résultats de scan
    match /advice/{adviceId} {
      allow read: if resource.data.isPublished == true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null
        && resource.data.authorId == request.auth.uid;
    }

    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    match /scanResults/{scanId} {
      allow read, write: if request.auth != null
        && resource.data.userId == request.auth.uid;
    }
  }
}
```

> **Voir la configuration complète :** [`firebase.json`](../firebase.json) et [`firebaseConfig.tsx`](../firebaseConfig.tsx)

## Sécurité

### Mesures de Sécurité Implémentées

#### 1. Authentification et Autorisation

```typescript
// Sécurisation des routes
const requireAuth = (navigation: any) => {
  const user = auth.currentUser;
  if (!user) {
    navigation.navigate('Login');
    return false;
  }
  return true;
};
```

**Mesures :**

- **Authentification Firebase** : Système robuste et sécurisé
- **Validation des tokens** : Vérification automatique des sessions
- **Gestion des rôles** : Différenciation utilisateur/admin
- **Déconnexion automatique** : Expiration des sessions

#### 2. Validation des Entrées

```typescript
// Validation des données utilisateur
const validateScanData = (data: ScanData) => {
  if (!data.imageUrl || !data.category) {
    throw new Error('Données de scan invalides');
  }
  if (data.category && !VALID_CATEGORIES.includes(data.category)) {
    throw new Error('Catégorie non autorisée');
  }
};
```

> **Voir la validation complète :** [`src/services/mlKitService.ts`](../src/services/mlKitService.ts)

**Mesures :**

- **Sanitisation** : Nettoyage des données utilisateur
- **Validation côté client** : Vérification avant envoi
- **Validation côté serveur** : Double vérification Firebase
- **Types TypeScript** : Contrôle statique des types

#### 3. Protection des Données

```typescript
// Chiffrement des données sensibles
const encryptUserData = (data: UserData) => {
  // Chiffrement AES pour les données sensibles
  return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY);
};
```

**Mesures :**

- **Chiffrement en transit** : HTTPS obligatoire
- **Chiffrement au repos** : Données chiffrées dans Firebase
- **Anonymisation** : Données personnelles protégées
- **RGPD** : Conformité avec la réglementation européenne

#### 4. Sécurité des APIs

```typescript
// Rate limiting et protection contre les abus
const rateLimit = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limite par IP
};
```

**Mesures :**

- **Rate limiting** : Protection contre les attaques DDoS
- **Validation des requêtes** : Vérification des paramètres
- **Logs de sécurité** : Surveillance des activités suspectes
- **Firewall** : Protection au niveau réseau

### Conformité OWASP

#### OWASP Top 10 - Mesures Appliquées

1. **Injection**
   - Paramètres typés avec TypeScript
   - Validation stricte des entrées
   - Utilisation de requêtes préparées Firebase

2. **Authentification défaillante**
   - Firebase Auth avec 2FA
   - Gestion sécurisée des sessions
   - Politique de mots de passe forts

3. **Exposition de données sensibles**
   - Chiffrement des données
   - Gestion sécurisée des tokens
   - Logs sans données sensibles

4. **Contrôle d'accès défaillant**
   - Validation des permissions
   - Règles de sécurité Firestore
   - Vérification des autorisations

5. **Configuration de sécurité défaillante**
   - Configuration sécurisée par défaut
   - Variables d'environnement
   - Pas de secrets en dur

6. **Composants avec vulnérabilités connues**
   - Audit automatisé des dépendances (`npm audit`)
   - Mise à jour régulière des packages
   - Surveillance des alertes de sécurité GitHub
   - Exclusion des dépendances obsolètes

7. **Identification et authentification défaillantes**
   - Gestion robuste des sessions utilisateur
   - Tokens JWT avec expiration
   - Révocation automatique des tokens compromis
   - Authentification multi-facteurs disponible

8. **Injection de code malveillant (XSS)**
   - Sanitisation automatique des entrées utilisateur
   - Validation stricte côté client et serveur
   - Échappement des données dynamiques
   - Content Security Policy (CSP) configuré

9. **Journalisation et surveillance insuffisantes**
   - Logs de sécurité complets (connexions, erreurs)
   - Monitoring des activités suspectes
   - Alertes automatiques pour les tentatives d'intrusion
   - Rétention sécurisée des logs (30 jours)

10. **Falsification de requêtes côté serveur (SSRF)**
    - Validation des URLs externes
    - Liste blanche des domaines autorisés
    - Protection contre les redirections malveillantes
    - Isolation des requêtes réseau

## Accessibilité

### Choix du Référentiel d'Accessibilité

#### Justification WCAG 2.1 Niveau AA

**Pourquoi WCAG 2.1 AA ?**

- **Standard international** : Référence mondiale W3C, acceptée universellement
- **Compatibilité mobile** : Spécifiquement adapté aux applications React Native
- **Niveau AA optimal** : Équilibre entre accessibilité et faisabilité technique
- **Évolutivité** : Préparation aux futures exigences légales (directive européenne)
- **Support technique** : Outils et bibliothèques React Native compatibles

**Alternatives considérées et écartées :**

- **RGAA 4.1** : Spécifique web français, non adapté au mobile
- **Section 508** : Standard américain, moins complet que WCAG
- **EN 301 549** : Européen mais basé sur WCAG 2.1

#### Référentiel Complémentaire OPQUAST

**Justification du choix :**

- **Approche pragmatique** : Critères concrets et mesurables
- **Qualité française** : Standards reconnus en France
- **Complémentarité** : Couvre aspects non traités par WCAG
- **Facilité d'implémentation** : Guidelines claires pour développeurs

### Conformité WCAG 2.1

#### Niveau AA - Mesures Implémentées

**1. Perceptible**

```typescript
// Contraste des couleurs
const colors = {
  primary: '#2E7D32', // Contraste 4.5:1
  secondary: '#4CAF50', // Contraste 3:1
  text: '#212121', // Contraste 15:1
  background: '#FFFFFF', // Fond blanc
};
```

> **Voir la palette complète :** [`src/styles/colors.ts`](../src/styles/colors.ts)

**Mesures :**

- **Contraste** : Ratio minimum 4.5:1 pour le texte normal
- **Couleurs** : Pas d'information véhiculée uniquement par la couleur
- **Redimensionnement** : Texte redimensionnable jusqu'à 200%
- **Images** : Alternatives textuelles pour toutes les images

**2. Utilisable**

```typescript
// Navigation au clavier
const handleKeyPress = (event: KeyboardEvent) => {
  if (event.key === 'Enter' || event.key === ' ') {
    handleAction();
  }
};
```

> **Voir l'implémentation complète :** [`src/components/`](../src/components/)

**Mesures :**

- **Clavier** : Toutes les fonctionnalités accessibles au clavier
- **Focus** : Indicateur de focus visible
- **Navigation** : Ordre de tabulation logique
- **Gestes** : Alternatives aux gestes complexes

**3. Compréhensible**

```typescript
// Messages d'erreur clairs
const getErrorMessage = (error: Error) => {
  return {
    title: 'Erreur de scan',
    description: 'Veuillez prendre une photo plus claire du déchet',
    action: 'Réessayer',
  };
};
```

> **Voir la gestion d'erreurs :** [`src/services/`](../src/services/)

**Mesures :**

- **Lisibilité** : Niveau de lecture adapté
- **Prévisibilité** : Interface cohérente
- **Assistance** : Messages d'erreur clairs
- **Identification** : Labels explicites

**4. Robuste**

```typescript
// Support des technologies d'assistance
const accessibleButton = (
  <TouchableOpacity
    accessible={true}
    accessibilityLabel="Scanner un déchet"
    accessibilityHint="Ouvre la caméra pour photographier un déchet"
    accessibilityRole="button"
  >
    <Text>Scanner</Text>
  </TouchableOpacity>
);
```

> **Voir l'accessibilité complète :** [`src/screens/`](../src/screens/)

**Mesures :**

- **Technologies d'assistance** : Compatibilité maximale
- **Standards** : Respect des spécifications WCAG
- **Tests** : Validation avec outils d'accessibilité

### Référentiel OPQUAST

#### Critères Appliqués

**Qualité Générale**

- **Interface cohérente** : Design uniforme
- **Navigation claire** : Structure logique
- **Performance** : Temps de chargement optimisés
- **Compatibilité** : Support multi-plateformes

**Contenu**

- **Lisibilité** : Texte clair et compréhensible
- **Hiérarchie** : Structure des informations
- **Mise à jour** : Contenu à jour
- **Précision** : Informations exactes

**Formulaires**

- **Validation** : Messages d'erreur clairs
- **Assistance** : Aide contextuelle
- **Accessibilité** : Labels et descriptions
- **Sécurité** : Protection des données

## Performance

### Métriques de Performance

#### Temps de Chargement

- **Écran d'accueil** : < 2 secondes
- **Scanner** : < 1 seconde
- **Carte** : < 3 secondes
- **Conseils** : < 1 seconde

#### Optimisations Appliquées

**1. Lazy Loading**

```typescript
// Chargement différé des composants
const LazyMapComponent = React.lazy(() => import('./MapComponent'));
const LazyAdviceScreen = React.lazy(() => import('./AdviceScreen'));
```

**2. Mise en Cache**

```typescript
// Cache des images et données
const imageCache = new Map();
const dataCache = new Map();
```

**3. Compression et Optimisation**

```typescript
// Compression des images et import sélectif
const compressImage = async (image: Image) => {
  return await ImageManipulator.manipulateAsync(image, [], {
    compress: 0.7,
    format: ImageManipulator.SaveFormat.JPEG,
  });
};
```

> **Voir les optimisations complètes :** [`src/services/`](../src/services/) et [`src/components/`](../src/components/)

## Tests et Qualité

### Stratégie de Test

#### Tests Unitaires

- **Tests** : 80/89 passants (90% de succès)
- **Couverture** : 58.83%
- **Services** : 66.66% de couverture
- **Composants** : Tests des composants critiques

> **Voir le guide de tests complet :** [`docs/TESTING_GUIDE.md`](TESTING_GUIDE.md)

#### Tests d'Intégration

- **API Firebase** : Tests des interactions avec @react-native-firebase
- **ML Kit** : Tests de reconnaissance d'images et fallback
- **Navigation** : Tests des flux utilisateur
- **Données** : Tests de persistance et cache

#### Tests de Performance

- **Temps de réponse** : Tests de latence
- **Mémoire** : Tests de consommation
- **Batterie** : Tests d'optimisation
- **Réseau** : Tests en conditions réelles

### Scénarios de Test Critiques

#### Vue d'Ensemble

L'application EcoTri couvre **14 scénarios de test** représentant l'ensemble des fonctionnalités utilisateur et techniques :

#### **Scénarios Principaux (11/11 - 100% couverture)**

| Scénario | Fonctionnalité           | Type                    | Statut | Priorité |
| -------- | ------------------------ | ----------------------- | ------ | -------- |
| **1**    | Authentification         | Fonctionnel             | Testé  | Critique |
| **2**    | Scanner ML Kit           | Fonctionnel + Technique | Testé  | Haute    |
| **3**    | Gestion des Favoris      | Fonctionnel             | Testé  | Moyenne  |
| **4**    | Géolocalisation et Carte | Fonctionnel             | Testé  | Haute    |
| **5**    | Système de Conseils      | Fonctionnel             | Testé  | Moyenne  |
| **6**    | Gamification et Points   | Fonctionnel             | Testé  | Moyenne  |
| **7**    | Profil Utilisateur       | Fonctionnel             | Testé  | Moyenne  |
| **8**    | Navigation et Flux       | UX/UI                   | Testé  | Haute    |
| **9**    | Gestion d'Erreurs        | Robustesse              | Testé  | Critique |
| **10**   | Guide d'Utilisation      | Fonctionnel + UX        | Testé  | Basse    |
| **11**   | Page de Collecte         | Fonctionnel + API       | Testé  | Haute    |

#### **Nouveaux Scénarios (Version 2.1.0)**

- **Scénario 12** : Tests de Couverture Avancés - Objectif > 70%
- **Scénario 13** : Tests de Robustesse - Gestion d'erreur et cas limites
- **Scénario 14** : Tests de Stabilité - Tests reproductibles et fiables

#### **Couverture par Module**

- **MLKitService** : 44.44% (fonctionnalités principales testées)
- **APIService** : 88.28% (excellent niveau de test)
- **StorageService** : 73.33% (bon niveau de test)
- **useLocation** : 100% (couverture complète)

### Outils de Qualité

#### Configuration Jest

```typescript
// jest.config.ts
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@expo|expo|react-native-maps|react-native-vector-icons|react-native-gesture-handler|react-native-reanimated|react-native-screens|react-native-safe-area-context|react-native-paper|@testing-library|@react-native-ml-kit)/)',
    'node_modules/@react-native-firebase/',
  ],
  moduleNameMapper: {
    '^react-native-maps$': '<rootDir>/__mocks__/react-native-maps.ts',
    '^@react-native-ml-kit/image-labeling$':
      '<rootDir>/__mocks__/mlkit-image-labeling.ts',
  },
  testTimeout: 30000,
  maxWorkers: 1,
};
```

#### Mocks et Dépendances

- **Firebase** : Mocks complets pour @react-native-firebase
- **ML Kit** : Simulation de reconnaissance d'images
- **Expo Location** : Services de géolocalisation mockés
- **React Native Maps** : Composant de carte simulé

#### ESLint

```javascript
// Configuration ESLint
module.exports = {
  extends: ['@react-native-community', '@typescript-eslint/recommended'],
  rules: {
    'no-console': 'warn',
    'prefer-const': 'error',
    '@typescript-eslint/no-unused-vars': 'error',
  },
};
```

> **Voir la configuration complète :** [`eslint.config.js`](../eslint.config.js)

#### TypeScript

```typescript
// Configuration TypeScript stricte
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noUnusedLocals": true
  }
}
```

> **Voir la configuration complète :** [`tsconfig.json`](../tsconfig.json)

## Déploiement

### Pipeline CI/CD

#### Étapes du Pipeline

1. **Installation** : `npm ci`
2. **Linting** : `npm run lint` (20 warnings max)
3. **Tests** : `npm test` (80/89 tests passants)
4. **Type-check** : `npm run type-check`
5. **Validation Expo** : `npx expo-doctor`
6. **Build** : `eas build` (optionnel)

> **Voir le guide CI/CD complet :** [`docs/CI_CD_README.md`](CI_CD_README.md)

#### Environnements

- **Développement** : Tests et développement local
- **Staging** : Tests d'intégration
- **Production** : Déploiement final

### Configuration EAS Build

**Pourquoi EAS Build ? (vs GitHub Actions existant)**

#### **Distinction Cruciale : CI/CD vs Build Natif**

| Aspect      | GitHub Actions CI/CD           | EAS Build              |
| ----------- | ------------------------------ | ---------------------- |
| **But**     | Tests et qualité code          | Compilation native     |
| **Vitesse** | 2-3 minutes                    | 10-15 minutes          |
| **Coût**    | Gratuit illimité               | 30 builds/mois         |
| **Output**  | Validation                     | APK/IPA fichiers       |
| **ML Kit**  | Simulation enrichie (corrigée) | Réel on-device         |
| **Usage**   | Chaque commit                  | Builds de test/release |

#### **Workflow Complémentaire**

```yaml
# .github/workflows/ci.yml
- Linting (ESLint avec 20 warnings max)
- Tests unitaires (80/89 passants - 90% de succès)
- Type checking (TypeScript strict)
- Validation Expo

# EAS Build ADDITIONNEL
- Compilation Android native
- Modules natifs (ML Kit)
- APK avec expo-dev-client
```

> **Voir la configuration CI/CD :** [`.github/workflows/ci.yml`](../.github/workflows/ci.yml)

**Avantages EAS Build :**

- **Modules natifs** : Support complet de `@react-native-ml-kit/image-labeling`
- **Environnement propre** : Build sur serveurs cloud optimisés
- **Pas de configuration locale** : Évite les problèmes SDK Android/Xcode
- **Gratuit** : 30 builds/mois inclus dans le plan gratuit

**Configuration eas.json :**

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": { "buildType": "apk" }
    },
    "preview": { "distribution": "internal" },
    "production": { "distribution": "store" }
  }
}
```

> **Voir la configuration complète :** [`eas.json`](../eas.json)

**Commandes EAS Build :**

```bash
# Build de développement
npx eas build --platform android --profile development

# Build de preview et production
npx eas build --platform android --profile preview
npx eas build --platform android --profile production
```

> **Voir le guide complet :** [`docs/SCRIPTS_AND_COMMANDS.md`](SCRIPTS_AND_COMMANDS.md)

**Workflow de déploiement avec EAS :**

1. **Configuration** : `npx eas build:configure`
2. **Build cloud** : `npx eas build --platform android --profile development`
3. **Téléchargement et installation** : APK fourni après build

> **Voir le guide de déploiement :** [`docs/CI_CD_README.md`](CI_CD_README.md)

## Monitoring et Analytics

### Firebase Analytics

- **Événements utilisateur** : Scans, conseils consultés
- **Performance** : Temps de chargement, erreurs
- **Audience** : Utilisateurs actifs, rétention
- **Comportement** : Parcours utilisateur

### Crashlytics

- **Rapports de crash** : Erreurs en production
- **Stack traces** : Détails des erreurs
- **Priorisation** : Impact des bugs
- **Résolution** : Suivi des corrections

## Maintenance

### Mises à Jour

- **Dépendances** : Mise à jour mensuelle
- **Sécurité** : Correctifs immédiats
- **Fonctionnalités** : Releases trimestrielles
- **Compatibilité** : Support des nouvelles versions

### Support

- **Documentation** : Guides utilisateur et technique
- **Communauté** : Forum d'entraide
- **Support technique** : Email et chat
- **Formation** : Tutoriels et webinaires

---

## Documentation Complémentaire

### Guides Disponibles

- **Guide de Tests** : [`docs/TESTING_GUIDE.md`](TESTING_GUIDE.md) - Stratégie, métriques et exécution des tests
- **Guide CI/CD** : [`docs/CI_CD_README.md`](CI_CD_README.md) - Déploiement et intégration continue
- **Guide Utilisateur** : [`docs/USER_GUIDE.md`](USER_GUIDE.md) - Manuel d'utilisation de l'application
- **Scripts et Commandes** : [`docs/SCRIPTS_AND_COMMANDS.md`](SCRIPTS_AND_COMMANDS.md) - Commandes utiles
- **Compétences Validées** : [`docs/COMPETENCES_VALIDEES.md`](COMPETENCES_VALIDEES.md) - Validation des compétences

### Structure du Projet

- **Code Source** : [`src/`](../src/) - Architecture et composants
- **Tests** : [`src/__tests__/`](../src/__tests__/) - Tests unitaires et d'intégration
- **Mocks** : [`__mocks__/`](../__mocks__/) - Simulation des dépendances
- **Configuration** : [`package.json`](../package.json), [`tsconfig.json`](../tsconfig.json)

---

**Dernière mise à jour** : Aout 2025  
**Maintenu par** : Équipe EcoTri
