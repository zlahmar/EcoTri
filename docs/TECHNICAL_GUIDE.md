# Guide Technique - EcoTri

## Introduction

Ce guide technique fournit toutes les informations nécessaires pour développer, tester et maintenir le projet EcoTri après les corrections apportées.

## Architecture du projet

### Structure des dossiers

```
recycle-app/
├── __mocks__/                 # Mocks pour les tests
│   ├── expo-vector-icons.ts
│   ├── react-native.ts
│   └── firebase/
├── src/
│   ├── __tests__/            # Tests unitaires
│   ├── components/           # Composants réutilisables
│   ├── screens/              # Écrans de l'application
│   ├── services/             # Services métier
│   ├── hooks/                # Hooks personnalisés
│   ├── styles/               # Styles globaux
│   └── utils/                # Utilitaires
├── docs/                     # Documentation
├── functions/                # Firebase Functions
└── coverage/                 # Rapports de couverture
```

### Technologies utilisées

- **React Native** : Framework mobile
- **Expo** : Outils de développement
- **TypeScript** : Typage statique
- **Jest** : Framework de tests
- **ESLint** : Linting du code
- **Firebase** : Backend et services

## Configuration de développement

### Prérequis

```bash
# Node.js 18+
node --version

# npm ou yarn
npm --version

# Expo CLI
npm install -g @expo/cli
```

### Installation

```bash
# Cloner le projet
git clone [repository-url]
cd recycle-app

# Installer les dépendances
npm ci

# Vérifier la configuration
npm run type-check
npm run lint
```

### Variables d'environnement

Créer un fichier `.env` à la racine :

```env
# Firebase
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_auth_domain
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_storage_bucket
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id

# Autres services
GOOGLE_MAPS_API_KEY=your_maps_key
```

## Tests

### Structure des tests

Les tests suivent la structure du code source :

```
src/__tests__/
├── AdviceScreen.test.tsx
├── AdviceService.test.ts
├── HomeScreen.test.tsx
├── MapComponent.test.tsx
├── MLKitService.test.ts
├── ScanScreen.test.tsx
├── StorageService.test.ts
├── useLocation.test.ts
└── sum.test.ts
```

### Exécution des tests

```bash
# Tous les tests
npm test

# Tests en mode watch
npm run test:watch

# Tests avec couverture
npm test -- --coverage

# Tests spécifiques
npm test -- --testNamePattern="AdviceService"
```

### Écriture de tests

#### Test de composant

```typescript
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import MyComponent from '../MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    const { getByText } = render(<MyComponent />);
    expect(getByText('Hello')).toBeTruthy();
  });

  it('handles user interaction', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(<MyComponent onPress={onPress} />);

    fireEvent.press(getByTestId('button'));
    expect(onPress).toHaveBeenCalled();
  });
});
```

#### Test de service

```typescript
import MyService from '../services/MyService';
import { mockFunction } from 'jest-mock';

jest.mock('firebase/firestore');

describe('MyService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('performs operation correctly', async () => {
    const service = new MyService();
    const result = await service.myMethod();

    expect(result).toBeDefined();
  });
});
```

### Mocks

#### Mocks existants

- **`__mocks__/expo-vector-icons.ts`** : Mocks pour les icônes
- **`__mocks__/react-native.ts`** : Mocks pour React Native
- **`__mocks__/firebase/`** : Mocks pour Firebase

#### Création de nouveaux mocks

```typescript
// __mocks__/my-library.ts
export const MyFunction = jest.fn();
export default {
  MyFunction,
};
```

## Linting et qualité du code

### Configuration ESLint

Le projet utilise une configuration stricte ESLint :

```json
{
  "extends": ["@eslint/js", "@typescript-eslint/recommended"],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn"
  }
}
```

### Commandes de linting

```bash
# Vérification
npm run lint

# Correction automatique
npm run lint:fix

# Vérification des types
npm run type-check
```

### Bonnes pratiques

1. **Imports** : Supprimer les imports non utilisés
2. **Variables** : Nommer les variables non utilisées avec `_`
3. **Types** : Éviter `any`, utiliser des types spécifiques
4. **Erreurs** : Gérer les erreurs dans les catch blocks

## Services

### AdviceService

Service pour la gestion des conseils de recyclage.

```typescript
import AdviceService from '../services/adviceService';

const service = new AdviceService();

// Récupérer tous les conseils
const advice = await service.getAllAdvice();

// Rechercher des conseils
const results = await service.searchAdvice('plastique');

// Ajouter un conseil
const id = await service.addAdvice({
  title: 'Nouveau conseil',
  content: 'Contenu du conseil',
  category: 'general',
});
```

### MLKitService

Service pour l'analyse d'images avec ML Kit.

```typescript
import mlKitService from '../services/mlKitService';

// Analyser une image
const result = await mlKitService.analyzeImage(imageBase64);

// Convertir en base64
const base64 = await mlKitService.imageToBase64(imageUri);
```

### StorageService

Service pour la gestion du stockage local et Firebase.

```typescript
import storageService from '../services/storageService';

// Sauvegarder un scan
await storageService.saveScanResult({
  wasteCategory: 'Plastique',
  confidence: 0.9,
  imageUrl: 'https://...',
});

// Récupérer les statistiques
const stats = await storageService.getUserStats();
```

## Hooks personnalisés

### useLocation

Hook pour la gestion de la géolocalisation.

```typescript
import { useLocation } from '../hooks/useLocation';

function MyComponent() {
  const { location, error, getCurrentLocation } = useLocation();

  useEffect(() => {
    getCurrentLocation();
  }, []);

  if (error) {
    return <Text>Erreur: {error}</Text>;
  }

  return (
    <Text>
      Lat: {location?.latitude}, Lng: {location?.longitude}
    </Text>
  );
}
```

## Composants

### MapComponent

Composant pour l'affichage de cartes avec des points de recyclage.

```typescript
import MapComponent from '../components/MapComponent';

<MapComponent
  mapRef={mapRef}
  location={location}
  filter={filter}
  onMarkerPress={handleMarkerPress}
  onMapPress={handleMapPress}
/>
```

### CategoryFilter

Composant pour le filtrage par catégorie.

```typescript
import CategoryFilter from '../components/CategoryFilter';

<CategoryFilter
  selectedCategory={selectedCategory}
  onCategoryChange={setSelectedCategory}
/>
```

## Déploiement

### Build de développement

```bash
# Build web
npm run build

# Build Android
expo build:android

# Build iOS
expo build:ios
```

### Configuration Expo

```json
{
  "expo": {
    "name": "EcoTri",
    "slug": "ecotri",
    "version": "1.0.0",
    "platforms": ["ios", "android", "web"],
    "icon": "./src/assets/icon.png",
    "splash": {
      "image": "./src/assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    }
  }
}
```

## Dépannage

### Problèmes courants

#### 1. Tests qui échouent

```bash
# Vérifier les mocks
npm test -- --verbose

# Nettoyer le cache Jest
npm test -- --clearCache
```

#### 2. Erreurs de linting

```bash
# Voir les erreurs détaillées
npm run lint -- --debug

# Corriger automatiquement
npm run lint:fix
```

#### 3. Problèmes de build

```bash
# Nettoyer le cache Expo
expo start --clear

# Vérifier la configuration
expo doctor
```

#### 4. Erreurs de dépendances

```bash
# Nettoyer node_modules
rm -rf node_modules package-lock.json
npm install

# Vérifier les conflits
npm ls
```

### Logs utiles

- **Tests** : `npm test -- --verbose`
- **Lint** : `npm run lint -- --debug`
- **Build** : `expo build:android --clear-cache`

## Contribution

### Workflow de développement

1. **Fork** du repository
2. **Branch** pour la fonctionnalité
3. **Développement** avec tests
4. **Tests** et linting
5. **Pull Request** avec description

### Standards de code

- **TypeScript** strict
- **ESLint** sans warnings
- **Tests** pour nouvelles fonctionnalités
- **Documentation** des changements

### Checklist avant commit

- [ ] Tests passent
- [ ] Lint sans warnings
- [ ] Types vérifiés
- [ ] Documentation mise à jour
- [ ] Code review effectuée

## Ressources

### Documentation officielle

- [React Native](https://reactnative.dev/)
- [Expo](https://docs.expo.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Jest](https://jestjs.io/)
- [ESLint](https://eslint.org/)

### Outils utiles

- **React Native Debugger** : Debugging avancé
- **Flipper** : Inspection des apps
- **Expo DevTools** : Outils de développement Expo

### Communauté

- [React Native Community](https://github.com/react-native-community)
- [Expo Discord](https://discord.gg/expo)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/react-native)
