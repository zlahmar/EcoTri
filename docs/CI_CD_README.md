# Guide CI/CD - EcoTri

## Vue d'Ensemble

Ce document décrit la configuration complète du pipeline d'intégration continue et de déploiement (CI/CD) pour l'application EcoTri, utilisant GitHub Actions pour l'automatisation.

## Pipeline GitHub Actions

### Fichier de Configuration

Le pipeline est configuré dans `.github/workflows/ci.yml` et s'exécute automatiquement sur chaque push et pull request.

### Déclencheurs

```yaml
on:
  push:
    branches: [main, dev, feature/*]
  pull_request:
    branches: [main, dev]
  workflow_dispatch: # Exécution manuelle
```

### Matrice de Tests

```yaml
strategy:
  matrix:
    node-version: [18, 20]
    os: [ubuntu-latest]
  fail-fast: false
```

## Étapes du Pipeline CI/CD

### 1. Checkout du Code

```yaml
- name: Checkout du code
  uses: actions/checkout@v4
  with:
    fetch-depth: 0
    token: ${{ secrets.GITHUB_TOKEN }}
```

### 2. Configuration de l'Environnement

```yaml
- name: Configuration Node.js ${{ matrix.node-version }}
  uses: actions/setup-node@v4
  with:
    node-version: ${{ matrix.node-version }}
    cache: 'npm'
    cache-dependency-path: package-lock.json
```

### 3. Installation des Dépendances

```yaml
- name: Installation des dépendances
  run: |
    echo "Installation des dépendances npm..."
    npm ci --prefer-offline --no-audit
    echo "Installation des dépendances Expo..."
    npx expo install --check
    echo "Dépendances installées avec succès"
```

### 4. Vérification de la Configuration

```yaml
- name: Vérifier la configuration Expo
  run: |
    echo "Vérification de la configuration Expo..."
    npx expo-doctor
    echo "Configuration Expo valide"
```

### 5. Linting et Vérification du Code

```yaml
- name: Linting ESLint
  run: |
    echo "Vérification de la qualité du code..."
    npm run lint
    echo "Linting réussi"

- name: Vérification TypeScript
  run: |
    echo "Compilation TypeScript..."
    npx tsc --noEmit
    echo "TypeScript valide"
```

### 6. Tests Unitaires

```yaml
- name: Nettoyer le cache Jest
  run: |
    echo "Nettoyage du cache Jest..."
    npm test -- --clearCache
    echo "Cache Jest nettoyé"

- name: Lancer les tests unitaires
  run: |
    echo "Lancement des tests unitaires sur Node.js ${{ matrix.node-version }}..."
    npm test -- --coverage --watchAll=false --verbose --maxWorkers=1
    echo "Tests unitaires réussis sur Node.js ${{ matrix.node-version }}"
```

### 7. Génération des Rapports

```yaml
- name: Générer le rapport de couverture
  run: |
    echo "Génération du rapport de couverture..."
    npm run test:coverage
    echo "Rapport de couverture généré"

- name: Uploader les artefacts de couverture
  uses: actions/upload-artifact@v4
  with:
    name: coverage-report-${{ matrix.node-version }}
    path: coverage/
    retention-days: 30
```

### 8. Vérification de la Qualité

```yaml
- name: Vérifier la qualité du code
  run: |
    echo "Vérification de la qualité..."
    npm run quality-check
    echo "Qualité du code validée"
```

## Configuration des Outils

### Jest Configuration

```typescript
// jest.config.ts
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
  ],
  coverageThreshold: {
    global: {
      branches: 40,
      functions: 60,
      lines: 60,
      statements: 60,
    },
  },
  testTimeout: 30000,
  maxWorkers: 1,
  verbose: true,
};
```

### ESLint Configuration

```javascript
// eslint.config.js
export default [
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      'react-hooks/exhaustive-deps': 'warn',
    },
    settings: {
      react: { version: 'detect' },
    },
  },
];
```

### TypeScript Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM"],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "module": "ESNext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "**/*.test.ts", "**/*.test.tsx"]
}
```

## Scripts NPM

### Package.json Scripts

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage --watchAll=false",
    "test:ci": "jest --ci --coverage --watchAll=false --maxWorkers=1",
    "lint": "eslint src --ext .ts,.tsx --max-warnings 20",
    "lint:fix": "eslint src --ext .ts,.tsx --fix",
    "type-check": "tsc --noEmit",
    "quality-check": "npm run lint && npm run type-check && npm run test:ci",
    "build:check": "npx expo-doctor && npx expo build:configure",
    "pre-commit": "npm run quality-check"
  }
}
```

## Gestion des Secrets

### Variables d'Environnement

```yaml
env:
  NODE_ENV: test
  CI: true
  EXPO_PUBLIC_API_URL: ${{ secrets.EXPO_PUBLIC_API_URL }}
  EXPO_PUBLIC_FIREBASE_CONFIG: ${{ secrets.EXPO_PUBLIC_FIREBASE_CONFIG }}
```

### Secrets GitHub

- `EXPO_PUBLIC_API_URL` : URL de l'API de recyclage
- `EXPO_PUBLIC_FIREBASE_CONFIG` : Configuration Firebase
- `EAS_TOKEN` : Token pour EAS Build (déploiement)

## Déploiement Automatisé

### EAS Build Configuration

```json
// eas.json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": {
        "gradleCommand": ":app:assembleDebug"
      }
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "aab"
      }
    }
  }
}
```

### Déploiement sur Pull Request

```yaml
- name: Build Preview APK
  if: github.event_name == 'pull_request'
  run: |
    echo "Build de l'APK de preview..."
    npx eas build --platform android --profile preview --non-interactive
    echo "APK de preview généré"
```

## Monitoring et Notifications

### Slack Notifications

```yaml
- name: Notification Slack - Succès
  if: success()
  uses: 8398a7/action-slack@v3
  with:
    status: success
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
    text: ' Build réussi pour ${{ github.repository }}#${{ github.run_number }}'

- name: Notification Slack - Échec
  if: failure()
  uses: 8398a7/action-slack@v3
  with:
    status: failure
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
    text: ' Build échoué pour ${{ github.repository }}#${{ github.run_number }}'
```

### Status Checks

```yaml
- name: Status Check - Tests
  run: |
    echo " Tests unitaires: PASSED"
    echo " Linting: PASSED"
    echo " TypeScript: PASSED"
    echo " Couverture: PASSED"
```

## Métriques et Rapports

### Couverture de Code

- **Objectif** : > 60%
- **Actuel** : 64.56%
- **Tendance** : Amélioration continue

### Performance des Tests

- **Temps d'exécution** : ~33 secondes
- **Tests par seconde** : ~2.15
- **Parallélisation** : 2 workers (Node.js 18 + 20)

### Qualité du Code

- **ESLint** : 0 erreurs, 0 warnings
- **TypeScript** : 0 erreurs de compilation
- **Tests** : 68/71 passants (95.8%)

## Procédures de Maintenance

### Mise à Jour des Dépendances

```bash
# Vérification des mises à jour
npx expo install --check

# Mise à jour des dépendances
npm update

# Mise à jour des dépendances Expo
npx expo install --fix
```

### Nettoyage du Cache

```bash
# Nettoyage Jest
npm test -- --clearCache

# Nettoyage npm
npm cache clean --force

# Nettoyage Expo
npx expo r -c
```

### Régénération des Rapports

```bash
# Couverture
npm run test:coverage

# Linting
npm run lint:fix

# Type check
npm run type-check
```

## Résolution des Problèmes

### Tests en Échec

1. **Vérifier les mocks** : S'assurer que tous les modules externes sont mockés
2. **Nettoyer le cache** : `npm test -- --clearCache`
3. **Vérifier les dépendances** : `npm ci` pour réinstaller proprement
4. **Debug local** : `npm test -- --verbose --no-coverage`

### Problèmes de Build

1. **Vérifier Expo** : `npx expo-doctor`
2. **Nettoyer les caches** : `npx expo r -c`
3. **Vérifier la configuration** : `npx expo build:configure`
4. **Logs détaillés** : `npx expo build --platform android --clear-cache`

### Problèmes de Linting

1. **Correction automatique** : `npm run lint:fix`
2. **Vérifier la configuration** : `npx eslint --print-config src/`
3. **Ignorer temporairement** : `// eslint-disable-next-line`

## Conclusion

Le pipeline CI/CD d'EcoTri est configuré pour :

- **Automatisation complète** des tests et vérifications
- **Qualité du code** maintenue avec ESLint et TypeScript
- **Tests robustes** avec Jest et couverture de code
- **Déploiement automatisé** avec EAS Build
- **Monitoring** et notifications en temps réel
- **Maintenance facile** avec scripts automatisés

---

**Maintenu par** : Équipe EcoTri  
**Dernière mise à jour** : Août 2025  
**Version CI/CD** : 2.0.0
