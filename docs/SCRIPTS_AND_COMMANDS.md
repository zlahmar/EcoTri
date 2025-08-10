# Scripts et Commandes - EcoTri

## Vue d'ensemble

Ce document liste tous les scripts et commandes disponibles dans le projet EcoTri pour le développement, les tests et le déploiement.

> **Note importante** : Ce projet utilise Expo SDK 53 et EAS (Expo Application Services) pour le build et le déploiement. Certaines commandes Expo classiques ont été remplacées par les commandes EAS.

## Scripts package.json

### Scripts de développement

```json
{
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "eject": "expo eject"
  }
}
```

#### Utilisation

```bash
# Démarrer le serveur de développement
npm start

# Démarrer sur Android
npm run android

# Démarrer sur iOS
npm run ios

# Démarrer sur Web
npm run web

# Éjecter d'Expo (irréversible)
npm run eject
```

### Scripts de tests

```json
{
  "scripts": {
    "test": "jest --coverage",
    "test:watch": "jest --watch",
    "test:verbose": "jest --coverage --verbose"
  }
}
```

#### Utilisation

```bash
# Exécuter tous les tests (avec couverture par défaut)
npm test

# Tests en mode watch (redémarre automatiquement)
npm run test:watch

# Tests avec logs détaillés et couverture
npm run test:verbose
```

### Scripts de qualité du code

```json
{
  "scripts": {
    "lint": "eslint src --ext .ts,.tsx --max-warnings 20",
    "lint:fix": "eslint src --ext .ts,.tsx --fix",
    "lint:check": "eslint src --ext .ts,.tsx",
    "type-check": "tsc --noEmit --project tsconfig.build.json"
  }
}
```

#### Utilisation

```bash
# Vérifier le linting
npm run lint

# Corriger automatiquement les erreurs de linting
npm run lint:fix

# Vérifier le linting (sans correction)
npm run lint:check

# Vérifier les types TypeScript
npm run type-check
```

### Scripts de build

```json
{
  "scripts": {
    "build": "expo export:web",
    "build:clear": "expo export:web --clear",
    "doctor": "npx expo-doctor",
    "audit": "npm audit --audit-level=moderate",
    "ci": "npm run lint && npm run type-check && npm test && npm run audit"
  }
}
```

#### Utilisation

```bash
# Build pour le web
npm run build

# Build pour le web avec nettoyage du cache
npm run build:clear

# Vérifier la configuration Expo
npm run doctor

# Audit de sécurité des dépendances
npm run audit

# Vérification complète (lint + type-check + tests + audit)
npm run ci
```

## Commandes Expo

### Commandes de base

```bash
# Démarrer le projet
expo start

# Démarrer avec tunnel
expo start --tunnel

# Démarrer avec localhost
expo start --localhost

# Démarrer avec LAN
expo start --lan

# Démarrer avec clear cache
expo start --clear

# Démarrer en mode développement
expo start --dev-client
```

### Commandes de build

```bash
# Build pour le web
expo export:web

# Build pour le web avec nettoyage du cache
expo export:web --clear

# Build avec EAS (Expo Application Services)
eas build --platform android
eas build --platform ios
eas build --platform all

# Build avec profil spécifique
eas build --profile development
eas build --profile preview
eas build --profile production
```

### Commandes de publication

```bash
# Publier avec EAS (Expo Application Services)
eas update --branch production
eas update --branch preview
eas update --branch development

# Publier avec message
eas update --message "Nouvelle version"

# Publier avec configuration spécifique
eas update --branch production --message "Version stable"
```

### Commandes de diagnostic

```bash
# Vérifier la configuration
expo doctor

# Vérifier les dépendances
expo install --fix

# Nettoyer le cache
expo r -c

# Voir les logs
expo logs
```

## Commandes Jest

### Commandes de base

```bash
# Exécuter tous les tests
npx jest

# Exécuter un fichier spécifique
npx jest MyComponent.test.tsx

# Exécuter des tests avec pattern
npx jest --testNamePattern="AdviceService"

# Exécuter des tests avec pattern de fichier
npx jest --testPathPattern="services"

# Exécuter des tests en mode watch
npx jest --watch

# Exécuter des tests en mode watch avec pattern
npx jest --watch --testNamePattern="Advice"
```

### Commandes de couverture

```bash
# Générer un rapport de couverture
npx jest --coverage

# Couverture avec format spécifique
npx jest --coverage --coverageReporters=text

# Couverture avec seuil
npx jest --coverage --coverageThreshold='{"global":{"lines":80}}'

# Couverture pour un fichier spécifique
npx jest --coverage --collectCoverageFrom="src/services/**/*.ts"
```

### Commandes de debug

```bash
# Mode verbose
npx jest --verbose

# Mode debug
npx jest --detectOpenHandles

# Afficher la configuration
npx jest --showConfig

# Afficher les mocks utilisés
npx jest --verbose --detectOpenHandles
```

## Commandes ESLint

### Commandes de base

```bash
# Linter tous les fichiers
npx eslint src

# Linter avec extensions spécifiques
npx eslint src --ext .ts,.tsx

# Linter un fichier spécifique
npx eslint src/components/MyComponent.tsx

# Linter avec format spécifique
npx eslint src --format=compact
npx eslint src --format=json
npx eslint src --format=html
```

### Commandes de correction

```bash
# Corriger automatiquement
npx eslint src --fix

# Corriger avec extensions
npx eslint src --ext .ts,.tsx --fix

# Corriger un fichier spécifique
npx eslint src/components/MyComponent.tsx --fix
```

### Commandes de debug

```bash
# Afficher la configuration
npx eslint --print-config src/components/MyComponent.tsx

# Mode debug
npx eslint --debug src

# Afficher les règles actives
npx eslint --print-config src | grep -A 10 "rules"
```

## Commandes TypeScript

### Commandes de compilation

```bash
# Compiler le projet
npx tsc

# Compiler sans émettre de fichiers
npx tsc --noEmit

# Compiler avec configuration spécifique
npx tsc --project tsconfig.json

# Compiler en mode watch
npx tsc --watch
```

### Commandes de vérification

```bash
# Vérifier les types
npx tsc --noEmit

# Vérifier avec configuration stricte
npx tsc --noEmit --strict

# Vérifier un fichier spécifique
npx tsc --noEmit src/components/MyComponent.tsx
```

## Commandes EAS (Expo Application Services)

### Commandes de base

```bash
# Initialiser EAS
eas init

# Configurer EAS
eas build:configure

# Voir la configuration
eas build:list
```

### Commandes de build

```bash
# Build pour Android
eas build --platform android

# Build pour iOS
eas build --platform ios

# Build pour toutes les plateformes
eas build --platform all

# Build avec profil spécifique
eas build --profile development
eas build --profile preview
eas build --profile production

# Build avec configuration locale
eas build --local
```

### Commandes de soumission

```bash
# Soumettre à Google Play Store
eas submit --platform android

# Soumettre à Apple App Store
eas submit --platform ios

# Soumettre avec profil spécifique
eas submit --profile production
```

### Commandes de mise à jour

```bash
# Mettre à jour l'application
eas update --branch production
eas update --branch preview
eas update --branch development

# Voir l'historique des mises à jour
eas update:list
```

## Commandes Firebase

### Commandes de base

```bash
# Initialiser Firebase
firebase init

# Démarrer l'émulateur
firebase emulators:start

# Démarrer l'émulateur avec services spécifiques
firebase emulators:start --only firestore,auth

# Démarrer l'émulateur avec port spécifique
firebase emulators:start --port 8080
```

### Commandes de déploiement

```bash
# Déployer les fonctions
firebase deploy --only functions

# Déployer Firestore
firebase deploy --only firestore

# Déployer l'authentification
firebase deploy --only auth

# Déployer le stockage
firebase deploy --only storage

# Déployer tout
firebase deploy
```

### Commandes de configuration

```bash
# Voir la configuration
firebase projects:list

# Changer de projet
firebase use [project-id]

# Voir les règles Firestore
firebase firestore:rules

# Voir les index Firestore
firebase firestore:indexes
```

## Commandes de développement

### Commandes de nettoyage

```bash
# Nettoyer node_modules
rm -rf node_modules package-lock.json
npm install

# Nettoyer le cache npm
npm cache clean --force

# Nettoyer le cache Expo
expo r -c

# Nettoyer le cache Jest
npx jest --clearCache
```

### Commandes de mise à jour

```bash
# Mettre à jour les dépendances
npm update

# Mettre à jour Expo CLI
npm install -g @expo/cli@latest

# Mettre à jour les dépendances de développement
npm update --save-dev

# Vérifier les vulnérabilités
npm audit
npm audit fix
```

### Commandes de debug

```bash
# Voir les dépendances
npm ls

# Voir les dépendances avec profondeur
npm ls --depth=0

# Voir les scripts disponibles
npm run

# Voir la configuration npm
npm config list
```

## Scripts personnalisés

### Scripts de vérification complète

```bash
# Vérification complète du projet (lint + type-check + tests + audit)
npm run ci

# Vérifier la configuration Expo
npm run doctor

# Audit de sécurité des dépendances
npm run audit
```

### Scripts de déploiement

```bash
# Build pour le web
npm run build

# Build avec nettoyage du cache
npm run build:clear

# Vérification complète avant déploiement
npm run ci
```

## Variables d'environnement

### Configuration des variables

```bash
# Définir une variable
export NODE_ENV=production

# Définir une variable pour une commande
NODE_ENV=production npm start

# Charger depuis un fichier .env
source .env
```

### Variables courantes

```bash
# Environnement
NODE_ENV=development|production|test

# Configuration Expo
EXPO_DEBUG=true
EXPO_DEVTOOLS_LISTEN_ADDRESS=localhost

# Configuration Firebase
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_API_KEY=your-api-key

# Configuration des tests
JEST_WATCHMAN=false
CI=true
```

## Commandes utiles

### Commandes de monitoring

```bash
# Surveiller les fichiers
watchman watch-del-all

# Surveiller les processus
ps aux | grep node

# Surveiller les ports
lsof -i :8080
lsof -i :19000
lsof -i :19001
```

### Commandes de log

```bash
# Voir les logs Expo
expo logs

# Voir les logs avec filtres
expo logs --level=error

# Voir les logs en temps réel
expo logs --follow

# Voir les logs Firebase
firebase functions:log
```

### Commandes de performance

```bash
# Profiler avec Node.js
node --prof app.js

# Analyser le bundle
npx expo export:web --analyze

# Vérifier la taille du bundle
npx expo export:web --dump-assetmap
```

## Conclusion

Ces scripts et commandes facilitent :

- **Développement rapide** : Commandes optimisées pour le workflow Expo/EAS
- **Qualité du code** : Vérifications automatiques avec ESLint et TypeScript
- **Tests fiables** : Exécution et monitoring des tests avec couverture intégrée
- **Build et déploiement** : Processus automatisé via EAS avec profils configurables
- **Sécurité** : Audit automatique des dépendances

Utilisez ces commandes pour optimiser votre workflow de développement avec Expo SDK 53 et EAS.
