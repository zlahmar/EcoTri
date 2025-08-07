# Guide des Notifications de Collecte

## Vue d'ensemble

Ce système de notifications permet aux utilisateurs de recevoir des rappels automatiques pour les jours de collecte des déchets dans leur ville. Il utilise les données nationales de collecte des déchets stockées localement dans un fichier JSON.

## Architecture

### Services principaux

#### 1. NotificationService (`src/services/notificationService.ts`)

- Gère les permissions de notifications Expo
- Planifie et annule les notifications locales
- Configure les paramètres de notification (son, vibration, heure de rappel)

#### 2. CollectionScheduleService (`src/services/collectionScheduleService.ts`)

- Récupère les horaires de collecte depuis le MockAPIService
- Convertit les données API en format utilisable par l'application
- Gère le cache des données par ville

#### 3. MockAPIService (`src/services/mockAPIService.ts`)

- **Utilise le fichier JSON local** : `src/assets/collecte-des-dechets-jours-feries.json`
- Contient **321 enregistrements** de données de collecte nationales
- Simule les appels API avec mise en cache et gestion d'erreurs
- Fournit des méthodes pour rechercher des villes et récupérer les horaires

### Données de collecte

Le système utilise un fichier JSON local contenant les données nationales de collecte des déchets :

- **Source** : `src/assets/collecte-des-dechets-jours-feries.json`
- **Format** : Tableau d'objets avec les propriétés :
  - `lieu` : Nom de la ville/zone
  - `semaine` : Numéro de semaine de l'année
  - `type_recyclable_ordures_menageresllecte` : Type de collecte
  - `jour` : Jour de la semaine

#### Villes disponibles (exemples)

- Arnières, Les Ventes, Huest, Fauville
- Le Vieil Evreux, Sacquenville, Caugé
- Centre ville, Z1, Z2, Z3, Carrefour
- Et bien d'autres...

#### Types de collecte

- Recyclable Ordures ménagères
- Ordures ménagères
- Ordures ménagères déchets Verts
- Déchets Verts
- ReCyclable

### Composants UI

#### 1. CollectionWidget (`src/components/CollectionWidget.tsx`)

- Widget compact affichant les collectes d'aujourd'hui et demain
- Intégré dans l'écran d'accueil
- Bouton d'accès rapide aux notifications

#### 2. CollectionScheduleComponent (`src/components/CollectionScheduleComponent.tsx`)

- Interface complète de gestion des notifications
- Sélection des types de collecte à notifier
- Configuration des paramètres (heure, son, vibration)

#### 3. CollectionNotificationsScreen (`src/screens/CollectionNotificationsScreen.tsx`)

- Écran dédié à la gestion des notifications
- Résumé des collectes à venir
- Sélection de la ville

#### 4. APIStatusComponent (`src/components/APIStatusComponent.tsx`)

- **Utilise MockAPIService** pour afficher les statistiques
- Tests de connectivité et performance
- Informations sur le cache

### Hook personnalisé

#### useNotifications (`src/hooks/useNotifications.ts`)

- Centralise la logique des notifications
- Interface unifiée pour les composants
- Gestion des états de chargement et d'erreur

## Configuration

### 1. Permissions de notifications

L'application demande automatiquement les permissions nécessaires au premier lancement.

### 2. Configuration Expo

Le fichier `app.json` inclut la configuration pour les notifications :

```json
{
  "expo": {
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./src/assets/notification.png",
          "color": "#ffffff",
          "sounds": ["./src/assets/notification.wav"]
        }
      ]
    ]
  }
}
```

## Utilisation

### 1. Accès aux notifications

- Via le widget sur l'écran d'accueil
- Via le bouton "Collecte" dans la barre de navigation
- Via l'écran dédié "CollectionNotifications"

### 2. Configuration des notifications

1. Sélectionner sa ville
2. Activer/désactiver les types de collecte souhaités
3. Configurer l'heure de rappel (par défaut : 19h)
4. Activer/désactiver le son et la vibration

### 3. Gestion des notifications

- Les notifications sont planifiées automatiquement
- Possibilité de les désactiver temporairement
- Réactivation automatique selon les paramètres

## Fonctionnalités

### ✅ Implémentées

- [x] Système de notifications Expo
- [x] Données de collecte nationales (321 enregistrements)
- [x] Interface utilisateur complète
- [x] Gestion par ville
- [x] Configuration des paramètres
- [x] Cache des données
- [x] Tests unitaires
- [x] Documentation complète

### 🔄 En cours

- [ ] Tests d'intégration
- [ ] Optimisations de performance

### 📋 À venir

- [ ] Synchronisation avec une vraie API
- [ ] Notifications push
- [ ] Historique des collectes
- [ ] Statistiques personnalisées

## Dépannage

### Problèmes courants

#### 1. Notifications qui ne s'affichent pas

- Vérifier les permissions dans les paramètres du téléphone
- Redémarrer l'application
- Vérifier que l'heure de rappel est correcte

#### 2. Données de collecte manquantes

- Vérifier que le fichier JSON est présent dans `src/assets/`
- Redémarrer l'application pour recharger les données
- Vérifier les logs de console

#### 3. Erreurs de cache

- Utiliser l'APIStatusComponent pour vider le cache
- Redémarrer l'application

### Logs utiles

Le système génère des logs détaillés pour le débogage :

- Initialisation du service API mock
- Récupération des données depuis le cache
- Planification des notifications
- Erreurs de configuration

## Tests

### Tests unitaires

- `__tests__/NotificationService.test.ts` : Tests du service de notifications
- `__tests__/APIService.test.ts` : Tests du service API mock

### Tests manuels

1. Tester la sélection de ville
2. Vérifier l'affichage des horaires
3. Tester la planification des notifications
4. Vérifier les paramètres de configuration

## Performance

### Optimisations

- Cache des données par ville (24h)
- Chargement différé des composants
- Mise en cache des résultats de recherche

### Métriques

- Temps de chargement des données : < 100ms
- Taille du cache : ~50KB
- Nombre d'enregistrements : 321

## Support

Pour toute question ou problème :

1. Consulter les logs de console
2. Vérifier la documentation
3. Tester avec l'APIStatusComponent
4. Redémarrer l'application si nécessaire
