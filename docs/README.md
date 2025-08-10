# EcoTri - Application de Recyclage Intelligente

**GitHub** : [https://github.com/zlahmar](https://github.com/zlahmar)

## Objectif du Projet

**Projet Master 2 YNOV - Bloc 2 : CONCEVOIR ET DÉVELOPPER DES APPLICATIONS LOGICIELLES**

Cette application mobile vise à valider les compétences du bloc 2 en démontrant la maîtrise complète du cycle de développement logiciel, de la conception à la production, en passant par les tests et la documentation.

## Version 2.0.0 - Fonctionnelle à 95% !

**Toutes les fonctionnalités principales opérationnelles**  
**Interface utilisateur complète et moderne**  
**Système de favoris et conseils quotidiens**  
**EAS Build configuré pour ML Kit natif**

## À Propos de l'Application

**EcoTri** est une application mobile React Native/Expo innovante qui révolutionne le tri et le recyclage des déchets grâce à l'intelligence artificielle.

### Fonctionnalités Principales

- **Scanner Intelligent** : Reconnaissance d'images en temps réel avec ML Kit pour identifier automatiquement les types de déchets
- **Carte Interactive** : Localisation des points de collecte et centres de recyclage avec géolocalisation
- **Conseils Personnalisés** : Recommandations adaptées selon l'historique et les préférences utilisateur
- **Système de Favoris** : Sauvegarde des conseils préférés
- **Gamification** : Système de points et défis pour encourager le recyclage
- **Page de Collecte** : Horaires et planning des collectes de déchets
- **Profil Utilisateur** : Suivi des statistiques et historique de recyclage
- **Guide Complet** : Base de connaissances sur le tri et le recyclage

### Public Cible

- **Particuliers** : Simplifier le tri quotidien des déchets
- **Étudiants** : Apprendre les bonnes pratiques de recyclage
- **Municipalités** : Améliorer les taux de recyclage locaux
- **Entreprises** : Formation des employés aux bonnes pratiques

### Impact Environnemental

- **Réduction des erreurs de tri** grâce à l'IA
- **Augmentation des taux de recyclage** via la gamification
- **Sensibilisation** aux enjeux environnementaux
- **Optimisation des circuits de collecte** avec la géolocalisation

## Installation et Démarrage

### Prérequis

- Node.js 18+
- Expo CLI
- Compte Firebase

### Installation

```bash
# Cloner le projet
git clone [url-du-repo]
cd EcoTri

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

- **Tests** : 68/71 passants (95.8% - amélioration significative !)
- **Couverture** : 64.56% (+2.83 points)
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

### Index de la Documentation

| Document                                               | Description                | Contenu Principal                                     |
| ------------------------------------------------------ | -------------------------- | ----------------------------------------------------- |
| **[TECHNICAL_GUIDE.md](TECHNICAL_GUIDE.md)**           | Guide technique complet    | Architecture, ML Kit, Firebase, sécurité, déploiement |
| **[TESTING_GUIDE.md](TESTING_GUIDE.md)**               | Guide des tests et mocks   | Tests unitaires, mocks, scénarios d'acceptation       |
| **[CHANGELOG.md](CHANGELOG.md)**                       | Historique et mises à jour | Versions, corrections, procédures de mise à jour      |
| **[USER_GUIDE.md](USER_GUIDE.md)**                     | Manuel utilisateur         | Utilisation de l'app, fonctionnalités, dépannage      |
| **[CI_CD_README.md](CI_CD_README.md)**                 | Intégration continue       | Pipeline GitHub Actions, configuration CI/CD          |
| **[COMPETENCES_VALIDEES.md](COMPETENCES_VALIDEES.md)** | Validation des compétences | Preuves de conformité aux exigences académiques       |
| **[SCRIPTS_AND_COMMANDS.md](SCRIPTS_AND_COMMANDS.md)** | Commandes et scripts       | Scripts npm, commandes utiles, développement          |

### Détails des Documents

#### Guide Technique (TECHNICAL_GUIDE.md)

**Contenu :** Architecture complète du projet

- **Architecture système** : Frontend React Native + Backend Firebase
- **ML Kit on-device** : Reconnaissance d'images avec EAS Build
- **Page de collecte** : Horaires et planning des collectes de déchets
- **Configuration Firebase** : Firestore, Storage, règles de sécurité
- **Sécurité OWASP** : Mesures de protection et authentification
- **Accessibilité WCAG 2.1** : Conformité niveau AA
- **Performance** : Optimisations et métriques
- **Déploiement** : Procédures EAS Build et production

#### Guide des Tests (TESTING_GUIDE.md)

**Contenu :** Stratégie de tests complète

- **Tests unitaires** : 71 tests (68 passants, 3 échoués), couverture 64.56%
- **Documentation des mocks** : Structure complète des mocks Firebase, Expo, React Native
- **Configuration Jest** : Setup TypeScript, moduleNameMapper
- **Scénarios d'acceptation** : 8 scénarios de test fonctionnels manuels
- **Bonnes pratiques** : Organisation, assertions, performance
- **CI/CD** : Configuration pour Node.js 18/20, optimisations

#### Changelog (CHANGELOG.md)

**Contenu :** Historique et procédures

- **Version 2.0.0** : ML Kit on-device, EAS Build, gamification
- **Version 1.0.0** : Fonctionnalités de base, authentification
- **Métriques** : Performance, tests, couverture par version
- **Roadmap** : Version 2.1.0 (Q1 2025)
- **Procédures de mise à jour** : Types, workflow standard, commandes

#### Guide Utilisateur (USER_GUIDE.md)

**Contenu :** Manuel d'utilisation

- **Fonctionnalités** : Scanner, carte, conseils, profil
- **Interface** : Navigation, utilisation des écrans
- **Conseils d'usage** : Optimisation, bonnes pratiques
- **Dépannage** : Solutions aux problèmes courants
- **Support** : Contact et assistance

#### CI/CD (CI_CD_README.md)

**Contenu :** Intégration continue

- **Pipeline GitHub Actions** : Workflow automatisé
- **Optimisations** : Node.js 18/20, cache Jest, workers
- **Corrections** : Résolution des problèmes CI/CD
- **Métriques** : 95.8% tests passants, 0 warnings ESLint

#### Compétences Validées (COMPETENCES_VALIDEES.md)

**Contenu :** Validation académique

- **Preuves de conformité** : 16 critères couverts
- **Documentation détaillée** : Chaque compétence avec preuves
- **Métriques de qualité** : Tests, sécurité, accessibilité
- **Livrables** : Correspondance exigences/réalisations

#### Scripts et Commandes (SCRIPTS_AND_COMMANDS.md)

**Contenu :** Référence des commandes

- **Scripts npm** : Développement, tests, build
- **Commandes Expo** : Start, build, doctor
- **Commandes EAS** : Build natif, soumission stores
- **Outils de développement** : Linting, type-check, debugging

### Navigation Rapide

**Pour débuter :**

1. [Guide Utilisateur](USER_GUIDE.md) - Comprendre l'application
2. [Guide Technique](TECHNICAL_GUIDE.md) - Architecture et développement
3. [Scripts et Commandes](SCRIPTS_AND_COMMANDS.md) - Commandes utiles

**Pour le développement :**

1. [Guide des Tests](TESTING_GUIDE.md) - Tests et mocks
2. [CI/CD](CI_CD_README.md) - Pipeline d'intégration
3. [Changelog](CHANGELOG.md) - Historique et mises à jour

## Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## Contact

- **Étudiant** : LAHMAR Zainab
- **Projet** : Master 2 YNOV - EcoTri : Application de Recyclage Intelligente
- **Email** : zainab.lahmar@ynov.com
- **GitHub** : [https://github.com/zlahmar](https://github.com/zlahmar)
- **Année** : 2024-2025
