# EcoTri - Application de Recyclage Intelligente

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

- [Cahier de recettes](docs/TESTING_GUIDE.md)
- [Scénarios de test](docs/TESTING_GUIDE.md#scénarios-de-test)

### C2.3.2 – Plan de correction de bogues

**Statut : VALIDÉ**

- **Documentation des bugs** : Problèmes rencontrés et solutions
- **Suivi des corrections** : Tableau de suivi des anomalies
- **Amélioration continue** : Processus de correction

**Livrables :**

- [Suivi des anomalies](docs/CORRECTIONS_AND_IMPROVEMENTS.md)
- [Plan de correction](docs/CORRECTIONS_AND_IMPROVEMENTS.md)

### C2.4.1 – Documentation technique

**Statut : VALIDÉ**

- **Manuel d'installation** : Guide de déploiement complet
- **Manuel d'utilisation** : Guide utilisateur détaillé
- **Manuel de mise à jour** : Procédures de maintenance

**Livrables :**

- [Guide de déploiement](docs/CI_CD_README.md)
- [Guide utilisateur](docs/USER_GUIDE.md)
- [Guide de maintenance](docs/TECHNICAL_GUIDE.md)

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

## Documentation

- [Guide Technique](docs/TECHNICAL_GUIDE.md)
- [Guide de Test](docs/TESTING_GUIDE.md)
- [Guide CI/CD](docs/CI_CD_README.md)
- [Guide Utilisateur](docs/USER_GUIDE.md)
- [Résumé des Tests](TEST_SUMMARY.md)

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
