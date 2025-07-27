# 🚀 CI/CD - EcoTri Workflow

## 📋 Vue d'ensemble

Ce workflow GitHub Actions assure la qualité et la fiabilité de l'application **EcoTri** à travers plusieurs étapes automatisées.

## 🔄 Workflow Jobs

### 1. 🔍 **Qualité du Code**

- ✅ **Lint TypeScript** : Vérification du style et des erreurs
- ✅ **Types TypeScript** : Validation des types
- ✅ **Couverture de code** : Vérification des tests

### 2. 🧪 **Tests Unitaires**

- ✅ **Tests multi-versions** : Node.js 16, 18, 20
- ✅ **Couverture détaillée** : Rapports Codecov
- ✅ **Tests des services** : AdviceService, MLKitService, StorageService

### 3. 📱 **Build Expo**

- ✅ **Configuration Expo** : Vérification avec `expo doctor`
- ✅ **Build Web** : Génération des assets web
- ✅ **Archivage** : Sauvegarde des builds

### 4. 🔒 **Sécurité**

- ✅ **Audit npm** : Vérification des vulnérabilités
- ✅ **Snyk** : Analyse de sécurité avancée
- ✅ **Dépendances** : Monitoring des packages

### 5. 📢 **Notifications**

- ✅ **Succès** : Confirmation de tous les tests
- ✅ **Échec** : Alertes en cas de problème

### 6. 🚀 **Déploiement** (Optionnel)

- ✅ **Auto-déploiement** : Sur la branche master
- ✅ **Badges** : Statut visuel du CI

## 🛠️ Configuration

### Variables d'environnement

```yaml
NODE_VERSION: '18'
EXPO_VERSION: 'latest'
```

### Secrets requis

- `SNYK_TOKEN` : Token Snyk pour l'analyse de sécurité
- `GIST_SECRET` : Token GitHub pour les badges (optionnel)

## 📊 Métriques

### Seuils de qualité

- **Couverture de code** : Minimum 70%
- **Tests** : 100% de réussite
- **Lint** : 0 warning
- **Sécurité** : 0 vulnérabilité critique

### Temps d'exécution

- **Total** : ~8-12 minutes
- **Tests** : ~5-7 minutes
- **Build** : ~2-3 minutes
- **Sécurité** : ~1-2 minutes

## 🚀 Déclencheurs

### Branches surveillées

- `master` : Déploiement automatique
- `main` : Tests complets
- `develop` : Tests de développement

### Événements

- **Push** : Tests automatiques
- **Pull Request** : Validation avant merge

## 📈 Rapports

### Codecov

- **URL** : https://codecov.io/gh/[username]/ecotri
- **Badge** : ![Codecov](https://codecov.io/gh/[username]/ecotri/branch/master/graph/badge.svg)

### Badges de statut

- **CI** : ![CI](https://github.com/[username]/ecotri/workflows/CI/badge.svg)
- **Tests** : ![Tests](https://img.shields.io/badge/tests-passing-brightgreen)
- **Sécurité** : ![Security](https://img.shields.io/badge/security-checked-brightgreen)

## 🔧 Commandes locales

### Vérification pré-commit

```bash
# Lint
npm run lint

# Types
npm run type-check

# Tests
npm test

# Build
npm run build
```

### Scripts package.json

```json
{
  "scripts": {
    "lint": "eslint src --ext .ts,.tsx",
    "lint:fix": "eslint src --ext .ts,.tsx --fix",
    "type-check": "tsc --noEmit",
    "test": "jest --coverage",
    "test:watch": "jest --watch",
    "build": "expo export:web"
  }
}
```

## 🐛 Dépannage

### Erreurs communes

#### 1. **Tests qui échouent**

```bash
# Vérifier les mocks
npm test -- --verbose

# Vérifier la couverture
npm test -- --coverage
```

#### 2. **Lint qui échoue**

```bash
# Corriger automatiquement
npm run lint:fix

# Vérifier les règles
npx eslint src --print-config
```

#### 3. **Build qui échoue**

```bash
# Vérifier la config Expo
npx expo doctor

# Nettoyer le cache
npx expo start --clear
```

### Logs utiles

- **Actions** : https://github.com/[username]/ecotri/actions
- **Codecov** : https://codecov.io/gh/[username]/ecotri
- **Snyk** : https://app.snyk.io/org/[username]

## 📝 Améliorations futures

### Phase 1 : Optimisation

- [ ] Cache des dépendances
- [ ] Tests parallèles
- [ ] Builds conditionnels

### Phase 2 : Intégration

- [ ] Tests E2E
- [ ] Performance monitoring
- [ ] Déploiement automatique

### Phase 3 : Monitoring

- [ ] Alertes Slack/Discord
- [ ] Métriques de performance
- [ ] Rapports automatisés

---

## 🎯 Objectifs

Ce workflow CI/CD garantit :

- ✅ **Qualité du code** constante
- ✅ **Sécurité** renforcée
- ✅ **Fiabilité** des déploiements
- ✅ **Transparence** du processus
- ✅ **Rapidité** de développement

**🚀 EcoTri - CI/CD Professionnel et Robuste !**
