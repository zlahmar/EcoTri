# Changelog - EcoTri

Toutes les modifications notables de ce projet seront documentées dans ce fichier.

## [2.0.0] - 2024-12-XX

### Fonctionnalités Majeures

**ML Kit On-Device Avancé**

- ML Kit natif gratuit avec reconnaissance d'images hors ligne
- **Mode développement enrichi** : simulation détaillée avec logs complets
- **Mode production optimisé** : utilisation du vrai ML Kit sur téléphone
- Classification automatique : Plastique, Métal, Papier, Verre, Carton
- **Détection automatique d'environnement** : Expo vs Build natif
- **Informations enrichies** : labels MID, bounding boxes, OCR simulé, couleurs dominantes
- Performance optimisée : traitement local ~500ms vs 2-3s Cloud Functions

**EAS Build Support**

- Configuration EAS Build pour modules natifs
- 30 builds cloud gratuits par mois
- APK de développement avec expo-dev-client
- Workflow simplifié : `npx eas build --platform android --profile development`

**Système de Gamification**

- Points et niveaux : +10 points par scan réel, +5 pour simulation
- Statistiques complètes : scans, points, niveau, catégories
- Persistance locale avec AsyncStorage
- Synchronisation cloud optionnelle avec Firestore

### Ajouté

- **Service ML Kit hybride avancé** avec détection d'environnement automatique
- **Mode développement enrichi** avec simulation détaillée et logs complets
- **Labels ML Kit étendus** avec MID (Machine ID) et métadonnées
- **Objets détectés** avec bounding boxes et coordonnées précises
- **OCR simulé** pour texte sur emballages (ex: "RECYCLABLE", "PET 1", "500mL")
- **Couleurs dominantes** avec scores et fractions de pixels
- **Classification intelligente** avec analyse multi-labels et boost de confiance
- Intégration AsyncStorage pour persistance locale
- Bouton refresh profil pour rechargement manuel des statistiques
- Configuration EAS avec profils development/preview/production
- Gestion d'erreurs améliorée avec logs détaillés

### Modifié

- **Architecture Scanner avancée** : migration vers ML Kit on-device avec détection d'environnement
- **Service ML Kit** : refactorisation complète avec modes développement/production séparés
- **Logs de debugging** : ajout de logs détaillés avec emojis pour meilleure lisibilité
- **Classification des déchets** : algorithme amélioré avec analyse multi-critères
- **Simulation enrichie** : données plus réalistes avec 6 labels détaillés par catégorie
- Service de stockage : focus sur gamification, suppression sauvegarde d'images
- Écran Profil : lecture AsyncStorage en priorité, fallback Firestore
- Configuration Firebase : ajout Firebase Storage pour compatibilité
- Interface Collection : header personnalisé cohérent avec les autres écrans
- Modal de sélection de ville : ajout du scroll pour la liste des villes
- Couleur de l'heure des collectes : amélioration de la lisibilité

### Corrigé

- Loading spinner infini dans ScanScreen
- Erreur FileReader incompatible avec React Native
- Erreur Firebase Storage : configuration et initialisation manquantes
- Permissions Firestore : gestion des erreurs d'autorisation avec fallback
- Stats profil à zéro : lecture AsyncStorage si Firestore vide
- Classification monotone : simulation variée au lieu de toujours "Verre"
- Tests Jest : mocks Firebase complets et configuration TypeScript
- Erreurs ESLint CI/CD : configuration spécifique pour les tests
- Erreur de build Expo Web : suppression étape web du pipeline CI/CD
- Affichage prématuré "Aucune collecte" : ajout état de chargement

### Sécurité

- Confidentialité ML Kit : traitement local, aucune donnée envoyée au cloud
- Amélioration gestion permissions caméra
- Protection données gamification locales avec chiffrement AsyncStorage
- Validation robuste des tokens Firebase

## [1.0.0] - 2024-12-XX

### Ajouté

- Fonctionnalité Scanner avec reconnaissance d'images via Firebase Cloud Functions
- Carte interactive avec points de recyclage
- Base de conseils personnalisés sur le recyclage
- Système d'authentification avec Firebase Auth
- Profil utilisateur avec gestion des statistiques
- Suite complète de tests avec Jest (54 tests)
- Pipeline CI/CD avec GitHub Actions
- Documentation utilisateur et technique

### Modifié

- Architecture modulaire
- Optimisation des temps de chargement
- Implémentation des mesures de sécurité OWASP
- Conformité WCAG 2.1 niveau AA pour l'accessibilité

### Corrigé

- Problèmes de navigation et routing
- Messages d'erreur améliorés
- Compatibilité iOS 12+ et Android 8+
- Tests défaillants

### Sécurité

- Validation et sanitisation des données utilisateur
- Authentification Firebase Auth sécurisée
- Chiffrement des données sensibles
- Gestion stricte des permissions

## Métriques de Version

### Version 2.0.0

- Tests : 54/54 passants (100%)
- Couverture : 76.2%
- Linting : 0 erreurs, 0 warnings
- Performance ML Kit : ~500ms analyse
- Fonctionnement hors ligne : 100%
- Builds EAS : 30/mois gratuits

### Version 1.0.0

- Tests : 54/54 passants (100%)
- Couverture : 76.2%
- Linting : 0 erreurs, 0 warnings
- Performance : < 3s de chargement
- Sécurité : Conformité OWASP Top 10
- Accessibilité : WCAG 2.1 AA

## Roadmap

### Version 2.1.0 (Q1 2025)

- Modèles ML personnalisés pour déchets spécifiques
- Analyse multiple images simultanée
- Gamification avancée : défis, achievements, leaderboards
- Fonctionnalités sociales : partage scans et compétitions

## Procédures de Mise à Jour

### Types de Mises à Jour

**Correctifs de Sécurité (Patch)**

- Format version : X.Y.Z → X.Y.Z+1
- Fréquence : Immédiate (selon besoin)
- Impact : Minimal, rétrocompatible

**Mises à Jour Mineures (Minor)**

- Format version : X.Y.Z → X.Y+1.0
- Fréquence : Mensuelle
- Impact : Rétrocompatible

**Mises à Jour Majeures (Major)**

- Format version : X.Y.Z → X+1.0.0
- Fréquence : Trimestrielle
- Impact : Peut nécessiter migration

### Procédure Standard

1. **Préparation** : Vérification état projet, dépendances, tests
2. **Mise à jour code** : Dépendances Expo/npm, code applicatif
3. **Configuration** : app.json, package.json, variables environnement
4. **Tests** : Validation automatisée et manuelle
5. **Build** : EAS build de test puis production
6. **Documentation** : Changelog et guides utilisateur

### Commandes Principales

```bash
# Mise à jour dépendances
npx expo install --check
npm update

# Build et déploiement
npx eas build --platform android --profile production
npx eas submit --platform android
```

---

**Maintenu par** : Équipe EcoTri  
**Dernière mise à jour** : Décembre 2024
**Version actuelle** : 2.0.0
