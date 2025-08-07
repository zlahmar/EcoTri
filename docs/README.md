# Documentation EcoTri

## 🚀 Version 2.0.0 - Fonctionnelle à 95% !

✅ **Toutes les fonctionnalités principales opérationnelles**  
✅ **Interface utilisateur complète et moderne**  
✅ **Système de favoris et conseils quotidiens**  
✅ **EAS Build configuré pour ML Kit natif**

## Vue d'ensemble

Cette documentation complète couvre tous les aspects du projet EcoTri, de l'installation à la maintenance, en passant par les tests et le déploiement.

## Structure de la documentation

### Guides principaux

- **[ADVICE_SETUP.md](ADVICE_SETUP.md)** - Configuration et utilisation du système de conseils
- **[COLLECTION_SCREEN_IMPROVEMENTS.md](COLLECTION_SCREEN_IMPROVEMENTS.md)** - Améliorations de la page de collecte
- **[CORRECTIONS_AND_IMPROVEMENTS.md](CORRECTIONS_AND_IMPROVEMENTS.md)** - Corrections et améliorations apportées au projet
- **[TECHNICAL_GUIDE.md](TECHNICAL_GUIDE.md)** - Guide technique pour les développeurs
- **[MLKIT_EAS_GUIDE.md](MLKIT_EAS_GUIDE.md)** - Guide ML Kit on-device et EAS Build
- **[TESTING_GUIDE.md](TESTING_GUIDE.md)** - Guide complet des tests
- **[MOCKS_DOCUMENTATION.md](MOCKS_DOCUMENTATION.md)** - Documentation des mocks pour les tests
- **[SCRIPTS_AND_COMMANDS.md](SCRIPTS_AND_COMMANDS.md)** - Scripts et commandes disponibles

### Documentation de référence

- **[README.md](../README.md)** - Documentation principale du projet
- **[TEST_SUMMARY.md](../TEST_SUMMARY.md)** - Résumé des tests et de la qualité
- **[CI_CD_README.md](../CI_CD_README.md)** - Documentation du pipeline CI/CD

## Navigation rapide

### Pour commencer

1. **[README.md](../README.md)** - Vue d'ensemble et installation
2. **[TECHNICAL_GUIDE.md](TECHNICAL_GUIDE.md)** - Configuration de développement
3. **[SCRIPTS_AND_COMMANDS.md](SCRIPTS_AND_COMMANDS.md)** - Commandes utiles

### Pour les tests

1. **[TESTING_GUIDE.md](TESTING_GUIDE.md)** - Stratégie et bonnes pratiques
2. **[MOCKS_DOCUMENTATION.md](MOCKS_DOCUMENTATION.md)** - Configuration des mocks
3. **[TEST_SUMMARY.md](../TEST_SUMMARY.md)** - État actuel des tests

### Pour le développement

1. **[TECHNICAL_GUIDE.md](TECHNICAL_GUIDE.md)** - Architecture et services
2. **[MLKIT_EAS_GUIDE.md](MLKIT_EAS_GUIDE.md)** - ML Kit on-device et builds natifs
3. **[COLLECTION_SCREEN_IMPROVEMENTS.md](COLLECTION_SCREEN_IMPROVEMENTS.md)** - Page de collecte
4. **[ADVICE_SETUP.md](ADVICE_SETUP.md)** - Fonctionnalité des conseils
5. **[SCRIPTS_AND_COMMANDS.md](SCRIPTS_AND_COMMANDS.md)** - Outils de développement

### Pour le déploiement

1. **[CI_CD_README.md](../CI_CD_README.md)** - Pipeline CI/CD
2. **[CORRECTIONS_AND_IMPROVEMENTS.md](CORRECTIONS_AND_IMPROVEMENTS.md)** - Problèmes résolus
3. **[TECHNICAL_GUIDE.md](TECHNICAL_GUIDE.md)** - Configuration de production

## Résumé des corrections récentes

### Problèmes résolus

- **Conflits de dépendances React** - Compatibilité React 19
- **Configuration Jest** - Mocks et transformation
- **Warnings ESLint** - 36 warnings corrigés
- **Tests unitaires** - 100% de réussite
- **Pipeline CI/CD** - Passage réussi
- **Interface de collecte** - Scroll, navigation et affichage optimisés
- **Scan ML Kit** - Migration vers ML Kit on-device gratuit
- **Gamification** - Système de points et statistiques utilisateur
- **EAS Build** - Configuration pour builds natifs avec modules natifs

### Améliorations apportées

- **Qualité du code** - Lint sans warnings
- **Tests fiables** - Mocks appropriés
- **Performance** - Configuration optimisée
- **Documentation** - Guides complets incluant ML Kit
- **Page de collecte** - Interface moderne et fonctionnelle
- **Reconnaissance d'images** - ML Kit on-device 100% gratuit
- **Builds natifs** - Support EAS Build pour modules natifs
- **Persistance locale** - AsyncStorage pour gamification hors ligne

## Architecture du projet

```
recycle-app/
├── __mocks__/                 # Mocks pour les tests
├── src/
│   ├── __tests__/            # Tests unitaires
│   ├── components/           # Composants réutilisables
│   ├── screens/              # Écrans de l'application
│   ├── services/             # Services métier
│   ├── hooks/                # Hooks personnalisés
│   └── styles/               # Styles globaux
├── docs/                     # Documentation complète
├── functions/                # Firebase Functions
└── coverage/                 # Rapports de couverture
```

## Technologies utilisées

- **React Native** - Framework mobile
- **Expo** - Outils de développement et EAS Build
- **TypeScript** - Typage statique
- **Jest** - Framework de tests
- **ESLint** - Linting du code
- **Firebase** - Backend et services (Firestore, Auth, Storage)
- **ML Kit** - Reconnaissance d'images on-device
- **AsyncStorage** - Persistance locale pour gamification

## Métriques de qualité

### Tests

- **Couverture** : 70%+ minimum
- **Tests unitaires** : 100% de réussite
- **Tests d'intégration** : Couverts
- **Tests de composants** : Couverts

### Code

- **Lint** : 0 warning
- **Types** : 100% vérifiés
- **Documentation** : Complète
- **Performance** : Optimisée

### CI/CD

- **Pipeline** : Passage réussi
- **Build** : Stable
- **Déploiement** : Automatisé
- **Sécurité** : Vérifiée

## Commandes essentielles

### Développement

```bash
# Démarrer le projet (Expo Go - simulation ML Kit)
npm start

# Build natif avec ML Kit réel
npx eas build --platform android --profile development

# Tests
npm test

# Lint (strict - pour CI/CD)
npm run lint

# Lint (avec warnings - pour développement)
npm run lint:check

# Build
npm run build
```

### EAS Build (ML Kit natif)

```bash
# Configuration initiale
npx eas build:configure

# Build de développement avec ML Kit
npx eas build --platform android --profile development

# Build de production
npx eas build --platform android --profile production
```

### Tests

```bash
# Tests avec couverture
npm run test:coverage

# Tests en mode watch
npm run test:watch

# Tests spécifiques
npm test -- --testNamePattern="AdviceService"
```

### Qualité

```bash
# Vérification complète
npm run lint && npm test && npm run type-check

# Correction automatique
npm run lint:fix

# Vérification des types
npm run type-check
```

## FAQ - Questions Fréquentes

### ❓ "Pourquoi EAS Build si j'ai déjà GitHub Actions ?"

**Réponse courte :** GitHub Actions = Tests, EAS Build = APK avec ML Kit réel

| GitHub Actions CI/CD      | EAS Build                  |
| ------------------------- | -------------------------- |
| ✅ Tests + Lint (2-3 min) | ✅ APK natif (10-15 min)   |
| ✅ Gratuit illimité       | ✅ 30 builds/mois gratuits |
| ❌ Pas de ML Kit réel     | ✅ ML Kit on-device        |
| ❌ Expo Go seulement      | ✅ expo-dev-client         |

**Workflow recommandé :**

1. **Développement quotidien** → GitHub Actions (rapide)
2. **Tests ML Kit** → EAS Build (natif)
3. **Release** → GitHub Actions ✅ → EAS Build → Store

Voir [MLKIT_EAS_GUIDE.md](docs/MLKIT_EAS_GUIDE.md) pour plus de détails.

### ❓ "ML Kit fonctionne-t-il dans Expo Go ?"

**Non.** Expo Go ne supporte que la simulation. Pour le vrai ML Kit :

- ✅ **EAS Build** (APK natif) - Recommandé
- ✅ **Build local** (`npx expo run:android`) - Plus complexe

### ❓ "Les stats de gamification ne s'affichent pas ?"

1. **Vérifier AsyncStorage** - Bouton refresh sur profil
2. **Vérifier Firestore** - Permissions et connexion
3. **Logs console** - Messages d'erreur détaillés

## Support et maintenance

### Problèmes courants

1. **Tests qui échouent** - Voir [TESTING_GUIDE.md](TESTING_GUIDE.md)
2. **Erreurs de linting** - Voir [SCRIPTS_AND_COMMANDS.md](SCRIPTS_AND_COMMANDS.md)
3. **Problèmes de build** - Voir [TECHNICAL_GUIDE.md](TECHNICAL_GUIDE.md)
4. **Erreurs de mocks** - Voir [MOCKS_DOCUMENTATION.md](MOCKS_DOCUMENTATION.md)
5. **ML Kit et EAS Build** - Voir [MLKIT_EAS_GUIDE.md](MLKIT_EAS_GUIDE.md)

### Ressources utiles

- **Documentation officielle** - Liens dans [TECHNICAL_GUIDE.md](TECHNICAL_GUIDE.md)
- **Communauté** - Forums et Discord
- **Outils** - Debuggers et profilers

## Contribution

### Workflow de développement

1. **Fork** du repository
2. **Branch** pour la fonctionnalité
3. **Développement** avec tests
4. **Tests** et linting
5. **Pull Request** avec description

### Standards de code

- **TypeScript** strict
- **ESLint** sans warnings (CI/CD) ou avec warnings (développement)
- **Tests** pour nouvelles fonctionnalités
- **Documentation** des changements

### Checklist avant commit

- [ ] Tests passent
- [ ] Lint strict sans warnings
- [ ] Types vérifiés
- [ ] Documentation mise à jour
- [ ] Code review effectuée

## Conclusion

Cette documentation complète assure :

- **Onboarding rapide** - Guides étape par étape
- **Développement efficace** - Outils et bonnes pratiques
- **Maintenance simplifiée** - Documentation détaillée
- **Qualité garantie** - Standards et vérifications

Le projet EcoTri est maintenant prêt pour un développement continu avec une base solide et des outils fiables.
