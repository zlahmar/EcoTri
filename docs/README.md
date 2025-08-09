# EcoTri - Application de Recyclage Intelligente

## 🚀 Version 2.0.0 - Fonctionnelle à 95% !

✅ **Toutes les fonctionnalités principales opérationnelles**  
✅ **Interface utilisateur complète et moderne**  
✅ **Système de favoris et conseils quotidiens**  
✅ **EAS Build configuré pour ML Kit natif**

Application mobile React Native/Expo pour le tri et le recyclage des déchets avec reconnaissance d'images et conseils personnalisés.

## Compétences Validées

### C2.1.1 – Environnement de déploiement et tests

**Statut : VALIDÉ**

- **Environnement de développement** : VS Code, Expo CLI, Jest, ESLint
- **Workflow CI/CD** : GitHub Actions avec ESLint + Jest + validation
- **Outils de qualité** : ESLint, Jest, TypeScript, Prettier
- **Monitoring** : Firebase Analytics et Performance Monitoring

**Livrables :**

- [Protocole de déploiement continu](docs/CI_CD_README.md)
- [Liste des outils de qualité](docs/TECHNICAL_GUIDE.md)

### C2.1.2 – Intégration continue

**Statut : VALIDÉ**

- **Workflow CI/CD** : `.github/workflows/ci.yml` avec étapes complètes
- **Automatisation** : Déclenchement automatique sur chaque push
- **Validation** : Lint → Test → Type-check → Expo Doctor

**Livrables :**

- [Fichier CI/CD](.github/workflows/ci.yml)
- [Captures des workflows GitHub](docs/CI_CD_README.md#résultats)

### C2.2.1 – Prototype logiciel

**Statut : VALIDÉ**

- **Architecture modulaire** : Services, composants, hooks séparés
- **Stack technique** : Expo + React Native + Firebase
- **Prototype fonctionnel** : Navigation, scan, carte, conseils

**Livrables :**

- [Présentation du prototype](docs/TECHNICAL_GUIDE.md)
- [Justification des choix techniques](docs/TECHNICAL_GUIDE.md#architecture)

### C2.2.2 – Harnais de test unitaire

**Statut : VALIDÉ**

- **Tests Jest complets** : Services, composants, hooks
- **Couverture élevée** : 76.2% (objectif >80% partiellement atteint)
- **Tests automatisés** : 54 tests passants

**Livrables :**

- [Dossier **tests** complet](src/__tests__/)
- [Rapport de couverture Jest](coverage/lcov-report/index.html)

### C2.2.3 – Sécurisation et accessibilité

**Statut : VALIDÉ**

- **Sécurité OWASP** : Validation des entrées, authentification Firebase
- **Accessibilité** : Contraste, alternatives textuelles, navigation
- **Bonnes pratiques** : Gestion des erreurs, validation des données

**Livrables :**

- [Mesures de sécurité](docs/TECHNICAL_GUIDE.md#sécurité)
- [Référentiel d'accessibilité](docs/TECHNICAL_GUIDE.md#accessibilité)

### C2.2.4 – Déploiement progressif

**Statut : VALIDÉ**

- **Versioning Git** : Historique complet des évolutions
- **Déploiement** : Configuration EAS Build pour mobile
- **Suivi** : Changelog et documentation des versions

**Livrables :**

- [Historique des versions](docs/CHANGELOG.md)
- [Configuration de déploiement](docs/CI_CD_README.md)

### C2.3.1 – Cahier de recettes

**Statut : VALIDÉ**

- **Scénarios de test** : Tests manuels et automatisés
- **Couverture fonctionnelle** : Toutes les fonctionnalités testées
- **Documentation** : Procédures de test structurées

**Livrables :**

- [Cahier de recettes](docs/TESTING_GUIDE.md#scénarios-de-test-fonctionnels)
- [Scénarios de test](docs/TESTING_GUIDE.md#scénarios-de-test-fonctionnels)

### C2.3.2 – Plan de correction de bogues

**Statut : VALIDÉ**

- **Documentation des bugs** : Problèmes rencontrés et solutions
- **Suivi des corrections** : Tableau de suivi des anomalies
- **Amélioration continue** : Processus de correction

**Livrables :**

- [Historique des corrections](docs/CHANGELOG.md#corrigé)
- [Plan de correction](docs/CHANGELOG.md#procédures-de-mise-à-jour)

### C2.4.1 – Documentation technique

**Statut : VALIDÉ**

- **Manuel d'installation** : Guide de déploiement complet
- **Manuel d'utilisation** : Guide utilisateur détaillé
- **Manuel de mise à jour** : Procédures de maintenance

**Livrables :**

- [Guide de déploiement](docs/TECHNICAL_GUIDE.md#déploiement)
- [Guide utilisateur](docs/USER_GUIDE.md)
- [Guide de maintenance](docs/CHANGELOG.md#procédures-de-mise-à-jour)

## Installation et Démarrage

### Prérequis

- Node.js 18+
- Expo CLI
- Compte Firebase

### Installation

```bash
# Cloner le projet
git clone [url-du-repo]
cd recycle-app

# Installer les dépendances
npm install

# Démarrer l'application
npx expo start
```

## Tests

```bash
# Lancer tous les tests
npm test

# Tests avec couverture
npm test -- --coverage

# Vérification de la qualité du code
npm run lint
npm run type-check
```

## Métriques de Qualité

- **Tests** : 54/54 passants (100%)
- **Couverture** : 76.2%
- **Linting** : 0 erreurs, 0 warnings
- **TypeScript** : Compilation sans erreur
- **CI/CD** : Pipeline stable

## Architecture

```
src/
├── components/     # Composants réutilisables
├── screens/        # Écrans de l'application
├── services/       # Services métier (Firebase, ML Kit)
├── hooks/          # Hooks personnalisés
├── styles/         # Styles globaux
├── __tests__/      # Tests unitaires
└── utils/          # Utilitaires
```

## Technologies Utilisées

- **Frontend** : React Native, Expo
- **Backend** : Firebase (Firestore, Storage, Auth)
- **IA** : ML Kit pour reconnaissance d'images
- **Tests** : Jest, React Native Testing Library
- **Qualité** : ESLint, TypeScript, Prettier
- **CI/CD** : GitHub Actions

## Documentation Complète

### 📚 Index de la Documentation

| Document | Description | Contenu Principal |
|----------|-------------|-------------------|
| **[TECHNICAL_GUIDE.md](docs/TECHNICAL_GUIDE.md)** | Guide technique complet | Architecture, ML Kit, Firebase, sécurité, déploiement |
| **[TESTING_GUIDE.md](docs/TESTING_GUIDE.md)** | Guide des tests et mocks | Tests unitaires, mocks, scénarios d'acceptation |
| **[CHANGELOG.md](docs/CHANGELOG.md)** | Historique et mises à jour | Versions, corrections, procédures de mise à jour |
| **[USER_GUIDE.md](docs/USER_GUIDE.md)** | Manuel utilisateur | Utilisation de l'app, fonctionnalités, dépannage |
| **[CI_CD_README.md](docs/CI_CD_README.md)** | Intégration continue | Pipeline GitHub Actions, configuration CI/CD |
| **[COMPETENCES_VALIDEES.md](docs/COMPETENCES_VALIDEES.md)** | Validation des compétences | Preuves de conformité aux exigences académiques |
| **[SCRIPTS_AND_COMMANDS.md](docs/SCRIPTS_AND_COMMANDS.md)** | Commandes et scripts | Scripts npm, commandes utiles, développement |

### 📖 Détails des Documents

#### 🔧 Guide Technique (TECHNICAL_GUIDE.md)
**Contenu :** Architecture complète du projet
- **Architecture système** : Frontend React Native + Backend Firebase
- **ML Kit on-device** : Reconnaissance d'images avec EAS Build
- **Système de notifications** : Configuration Expo Notifications
- **Configuration Firebase** : Firestore, Storage, règles de sécurité
- **Sécurité OWASP** : Mesures de protection et authentification
- **Accessibilité WCAG 2.1** : Conformité niveau AA
- **Performance** : Optimisations et métriques
- **Déploiement** : Procédures EAS Build et production

#### 🧪 Guide des Tests (TESTING_GUIDE.md)
**Contenu :** Stratégie de tests complète
- **Tests unitaires** : 54 tests (100% passants), couverture 76.2%
- **Documentation des mocks** : Structure complète des mocks Firebase, Expo, React Native
- **Configuration Jest** : Setup TypeScript, moduleNameMapper
- **Scénarios d'acceptation** : 8 scénarios de test fonctionnels manuels
- **Bonnes pratiques** : Organisation, assertions, performance
- **CI/CD** : Configuration pour Node.js 18/20, optimisations

#### 📝 Changelog (CHANGELOG.md)
**Contenu :** Historique et procédures
- **Version 2.0.0** : ML Kit on-device, EAS Build, gamification
- **Version 1.0.0** : Fonctionnalités de base, authentification
- **Métriques** : Performance, tests, couverture par version
- **Roadmap** : Version 2.1.0 (Q1 2025)
- **Procédures de mise à jour** : Types, workflow standard, commandes

#### 👤 Guide Utilisateur (USER_GUIDE.md)
**Contenu :** Manuel d'utilisation
- **Fonctionnalités** : Scanner, carte, conseils, profil
- **Interface** : Navigation, utilisation des écrans
- **Conseils d'usage** : Optimisation, bonnes pratiques
- **Dépannage** : Solutions aux problèmes courants
- **Support** : Contact et assistance

#### 🔄 CI/CD (CI_CD_README.md)
**Contenu :** Intégration continue
- **Pipeline GitHub Actions** : Workflow automatisé
- **Optimisations** : Node.js 18/20, cache Jest, workers
- **Corrections** : Résolution des problèmes CI/CD
- **Métriques** : 100% tests passants, 0 warnings ESLint

#### 🎯 Compétences Validées (COMPETENCES_VALIDEES.md)
**Contenu :** Validation académique
- **Preuves de conformité** : 16 critères couverts
- **Documentation détaillée** : Chaque compétence avec preuves
- **Métriques de qualité** : Tests, sécurité, accessibilité
- **Livrables** : Correspondance exigences/réalisations

#### ⚙️ Scripts et Commandes (SCRIPTS_AND_COMMANDS.md)
**Contenu :** Référence des commandes
- **Scripts npm** : Développement, tests, build
- **Commandes Expo** : Start, build, doctor
- **Commandes EAS** : Build natif, soumission stores
- **Outils de développement** : Linting, type-check, debugging

### 🎯 Navigation Rapide

**Pour débuter :**
1. 📖 [Guide Utilisateur](docs/USER_GUIDE.md) - Comprendre l'application
2. 🔧 [Guide Technique](docs/TECHNICAL_GUIDE.md) - Architecture et développement
3. ⚙️ [Scripts et Commandes](docs/SCRIPTS_AND_COMMANDS.md) - Commandes utiles

**Pour le développement :**
1. 🧪 [Guide des Tests](docs/TESTING_GUIDE.md) - Tests et mocks
2. 🔄 [CI/CD](docs/CI_CD_README.md) - Pipeline d'intégration
3. 📝 [Changelog](docs/CHANGELOG.md) - Historique et mises à jour

**Pour la validation :**
1. 🎯 [Compétences Validées](docs/COMPETENCES_VALIDEES.md) - Conformité académique

## Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## Contact

- **Étudiant** : LAHMAR Zainab
- **Projet** : Master 2 YNOV - EcoTri : Application de Recyclage Intelligente
- **Année** : 2024-2025
