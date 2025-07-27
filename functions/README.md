# Cloud Functions - Analyse d'Images avec Google Cloud Vision API

Ce dossier contient les Cloud Functions Firebase pour l'analyse d'images et la classification des déchets.

## 🚀 Configuration

### 1. Installer les dépendances

```bash
cd functions
npm install
```

### 2. Configuration Google Cloud Vision API

1. **Activer Google Cloud Vision API** :
   - Aller sur [Google Cloud Console](https://console.cloud.google.com/)
   - Sélectionner votre projet Firebase
   - Activer l'API "Cloud Vision API"

2. **Configurer les permissions** :
   - Dans Firebase Console, aller dans "Project Settings" > "Service accounts"
   - Télécharger la clé privée JSON
   - Placer le fichier dans le dossier `functions/` (optionnel pour le déploiement)

### 3. Variables d'environnement

Créer un fichier `.env` dans le dossier `functions/` :

```env
GOOGLE_APPLICATION_CREDENTIALS=./service-account-key.json
```

## 📦 Déploiement

### 1. Déployer les Cloud Functions

```bash
# Depuis le dossier racine du projet
firebase deploy --only functions
```

### 2. Vérifier le déploiement

```bash
firebase functions:list
```

## 🔧 Fonctions disponibles

### `analyzeImage`
Analyse une image avec Google Cloud Vision API pour classifier les déchets.

**Paramètres :**
- `image` (string) : Image encodée en base64

**Retour :**
```json
{
  "labels": [
    {
      "description": "bottle",
      "confidence": 0.95,
      "mid": "/m/0dl9m"
    }
  ],
  "objects": [
    {
      "name": "Bottle",
      "confidence": 0.92,
      "boundingPoly": {...}
    }
  ],
  "text": ["Coca-Cola"],
  "dominantColors": [
    {
      "color": {"red": 255, "green": 0, "blue": 0},
      "score": 0.8,
      "pixelFraction": 0.3
    }
  ]
}
```

### `getUserStats`
Récupère les statistiques d'un utilisateur.

**Retour :**
```json
{
  "scansCompleted": 25,
  "points": 250,
  "challengesCompleted": 3,
  "level": 3,
  "categoriesScanned": {
    "Plastique": 10,
    "Papier": 8,
    "Métal": 7
  }
}
```

### `getScanHistory`
Récupère l'historique des scans d'un utilisateur.

**Paramètres :**
- `limit` (number, optionnel) : Nombre maximum de résultats (défaut: 20)

### `getGlobalStats`
Récupère les statistiques globales de l'application.

## 🧪 Test local

### 1. Démarrer l'émulateur

```bash
firebase emulators:start --only functions
```

### 2. Tester avec l'émulateur

Les fonctions seront disponibles sur `http://localhost:5001/[project-id]/us-central1/[function-name]`

## 📊 Monitoring

### 1. Voir les logs

```bash
firebase functions:log
```

### 2. Monitoring dans Firebase Console

- Aller dans "Functions" > "Logs"
- Voir les métriques et performances

## 🔒 Sécurité

- Toutes les fonctions vérifient l'authentification utilisateur
- Les images sont analysées de manière sécurisée via Google Cloud Vision API
- Les résultats sont stockés de manière sécurisée dans Firestore

## 💰 Coûts

- **Google Cloud Vision API** : ~$1.50 pour 1000 images
- **Firebase Functions** : Gratuit jusqu'à 125K invocations/mois
- **Firestore** : Gratuit jusqu'à 50K lectures/mois

## 🐛 Dépannage

### Erreur "Permission denied"
- Vérifier que Google Cloud Vision API est activé
- Vérifier les permissions du compte de service

### Erreur "Function not found"
- Vérifier que les fonctions sont déployées
- Vérifier le nom de la fonction dans l'appel

### Erreur "Image too large"
- Redimensionner l'image avant l'envoi
- Réduire la qualité de l'image

## 📝 Notes

- Les images sont automatiquement supprimées après analyse
- Les résultats sont mis en cache pour optimiser les performances
- Le système de classification s'améliore avec l'usage 