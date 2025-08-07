# 🛠️ Guide Technique - EcoTri

## 🏗️ Architecture du Projet

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

### Structure des Dossiers

```
src/
├── components/          # Composants réutilisables
│   ├── MapComponent.tsx # Carte interactive
│   └── CategoryFilter.tsx # Filtres de catégories
├── screens/             # Écrans de l'application
│   ├── HomeScreen.tsx   # Écran d'accueil
│   ├── ScanScreen.tsx   # Scanner de déchets
│   ├── AdviceScreen.tsx # Conseils et astuces
│   └── ProfilScreen.tsx # Profil utilisateur
├── services/            # Services métier
│   ├── mlKitService.ts  # Reconnaissance d'images
│   ├── storageService.ts # Gestion des données
│   └── adviceService.ts # Service des conseils
├── hooks/               # Hooks personnalisés
│   └── useLocation.ts   # Géolocalisation
├── styles/              # Styles globaux
│   ├── colors.ts        # Palette de couleurs
│   └── global.ts        # Styles communs
├── __tests__/           # Tests unitaires
└── utils/               # Utilitaires
```

## 🎯 Choix Techniques

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

- **Firestore** : Base de données NoSQL pour les scans et conseils
- **Storage** : Stockage des images de déchets
- **Auth** : Authentification utilisateur
- **Analytics** : Métriques d'utilisation

### IA - ML Kit (On-Device)

**Pourquoi ce choix ?**

- **Reconnaissance d'images** : Classification automatique des déchets
- **Intégration native** : Optimisé pour mobile avec `@react-native-ml-kit/image-labeling`
- **Hors ligne** : Fonctionne sans connexion internet
- **Gratuit** : 100% gratuit, contrairement à Google Cloud Vision API
- **Confidentialité** : Traitement local, aucune donnée envoyée au cloud
- **Performance** : Analyse rapide directement sur l'appareil

**Architecture ML Kit :**

```typescript
// Service ML Kit hybride avec fallback
export class MLKitService {
  async analyzeImage(imageUri: string): Promise<AnalysisResult> {
    try {
      // Tentative d'utilisation du vrai ML Kit on-device
      const labels = await ImageLabeling.label(imageUri);
      return this.processRealLabels(labels);
    } catch (error) {
      // Fallback vers simulation si ML Kit non disponible
      console.log('ML Kit non disponible, utilisation de la simulation');
      return this.fallbackSimulation();
    }
  }
}
```

**Fonctionnalités ML Kit :**

- **Image Labeling** : Identification des objets dans les images
- **Classification automatique** : Plastique, Métal, Papier, Verre, Carton
- **On-device processing** : Traitement local pour la confidentialité
- **Fallback intelligent** : Simulation si ML Kit indisponible
- **Gamification** : Tracking des scans pour points et niveaux

**Workflow de reconnaissance :**

1. **Capture** → Photo avec `expo-image-picker`
2. **Analyse** → ML Kit analyse l'image localement
3. **Classification** → Mapping vers catégories de déchets
4. **Gamification** → +10 points, mise à jour statistiques
5. **Sauvegarde** → AsyncStorage + Firestore (optionnel)

## 🔐 Sécurité

### Mesures de Sécurité Implémentées

#### 1. Authentification et Autorisation

```typescript
// Exemple de sécurisation des routes
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

1. **Injection** ✅
   - Paramètres typés avec TypeScript
   - Validation stricte des entrées
   - Utilisation de requêtes préparées Firebase

2. **Authentification défaillante** ✅
   - Firebase Auth avec 2FA
   - Gestion sécurisée des sessions
   - Politique de mots de passe forts

3. **Exposition de données sensibles** ✅
   - Chiffrement des données
   - Gestion sécurisée des tokens
   - Logs sans données sensibles

4. **Contrôle d'accès défaillant** ✅
   - Validation des permissions
   - Règles de sécurité Firestore
   - Vérification des autorisations

5. **Configuration de sécurité défaillante** ✅
   - Configuration sécurisée par défaut
   - Variables d'environnement
   - Pas de secrets en dur

## ♿ Accessibilité

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

**Mesures :**

- **Lecteurs d'écran** : Support complet VoiceOver/TalkBack
- **Technologies d'assistance** : Compatibilité maximale
- **Standards** : Respect des spécifications WCAG
- **Tests** : Validation avec outils d'accessibilité

### Référentiel OPQUAST

#### Critères Appliqués

**Qualité Générale**

- ✅ **Interface cohérente** : Design uniforme
- ✅ **Navigation claire** : Structure logique
- ✅ **Performance** : Temps de chargement optimisés
- ✅ **Compatibilité** : Support multi-plateformes

**Contenu**

- ✅ **Lisibilité** : Texte clair et compréhensible
- ✅ **Hiérarchie** : Structure des informations
- ✅ **Mise à jour** : Contenu à jour
- ✅ **Précision** : Informations exactes

**Formulaires**

- ✅ **Validation** : Messages d'erreur clairs
- ✅ **Assistance** : Aide contextuelle
- ✅ **Accessibilité** : Labels et descriptions
- ✅ **Sécurité** : Protection des données

## 📊 Performance

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

**3. Compression**

```typescript
// Compression des images avant upload
const compressImage = async (image: Image) => {
  return await ImageManipulator.manipulateAsync(image, [], {
    compress: 0.7,
    format: ImageManipulator.SaveFormat.JPEG,
  });
};
```

**4. Optimisation des Bundles**

```typescript
// Import sélectif des modules
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
```

## 🧪 Tests et Qualité

### Stratégie de Test

#### Tests Unitaires

- **Couverture** : 76.2% (objectif >80%)
- **Tests** : 54 tests passants
- **Services** : 100% des services testés
- **Composants** : Tests des composants critiques

#### Tests d'Intégration

- **API Firebase** : Tests des interactions
- **ML Kit** : Tests de reconnaissance d'images
- **Navigation** : Tests des flux utilisateur
- **Données** : Tests de persistance

#### Tests de Performance

- **Temps de réponse** : Tests de latence
- **Mémoire** : Tests de consommation
- **Batterie** : Tests d'optimisation
- **Réseau** : Tests en conditions réelles

### Outils de Qualité

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

#### Prettier

```json
// Configuration Prettier
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2
}
```

## 🚀 Déploiement

### Pipeline CI/CD

#### Étapes du Pipeline

1. **Installation** : `npm ci`
2. **Linting** : `npm run lint`
3. **Tests** : `npm test`
4. **Type-check** : `npm run type-check`
5. **Validation Expo** : `npx expo-doctor`
6. **Build** : `eas build` (optionnel)

#### Environnements

- **Développement** : Tests et développement local
- **Staging** : Tests d'intégration
- **Production** : Déploiement final

### Configuration EAS Build

**Pourquoi EAS Build ? (vs GitHub Actions existant)**

#### **Distinction Cruciale : CI/CD vs Build Natif**

| Aspect      | GitHub Actions CI/CD    | EAS Build              |
| ----------- | ----------------------- | ---------------------- |
| **But**     | Tests et qualité code   | Compilation native     |
| **Vitesse** | 2-3 minutes             | 10-15 minutes          |
| **Coût**    | Gratuit illimité        | 30 builds/mois         |
| **Output**  | Validation ✅/❌        | APK/IPA fichiers       |
| **ML Kit**  | ❌ Simulation seulement | ✅ Réel on-device      |
| **Usage**   | Chaque commit           | Builds de test/release |

#### **Workflow Complémentaire**

```yaml
# Votre .github/workflows/ci.yml ACTUEL (à conserver)
- Linting ✅
- Tests unitaires ✅
- Type checking ✅
- Validation Expo ✅

# EAS Build ADDITIONNEL (pour ML Kit)
- Compilation Android native ✅
- Modules natifs (ML Kit) ✅
- APK avec expo-dev-client ✅
```

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
      "android": {
        "buildType": "apk"
      }
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {
      "distribution": "store"
    }
  }
}
```

**Commandes EAS Build :**

```bash
# Build de développement avec ML Kit
npx eas build --platform android --profile development

# Build de preview pour tests
npx eas build --platform android --profile preview

# Build de production
npx eas build --platform android --profile production
```

**Workflow de déploiement avec EAS :**

1. **Configuration** : `npx eas build:configure`
2. **Build cloud** : `npx eas build --platform android --profile development`
3. **Téléchargement APK** : Lien fourni après build
4. **Installation** : Installation manuelle de l'APK
5. **Test ML Kit** : Vérification du vrai ML Kit on-device

## 📈 Monitoring et Analytics

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

## 🔄 Maintenance

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

**Version** : 1.0.0  
**Dernière mise à jour** : Décembre 2024  
**Maintenu par** : Équipe EcoTri
