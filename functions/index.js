const functions = require('firebase-functions');
const admin = require('firebase-admin');
const vision = require('@google-cloud/vision');

// Initialiser Firebase Admin
admin.initializeApp();

// Créer un client Vision
const client = new vision.ImageAnnotatorClient();

/**
 * Cloud Function pour analyser une image avec Google Cloud Vision API
 */
exports.analyzeImage = functions.https.onCall(async (data, context) => {
  // Vérifier l'authentification
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Utilisateur non authentifié');
  }

  try {
    const { image } = data;
    
    if (!image) {
      throw new functions.https.HttpsError('invalid-argument', 'Image manquante');
    }

    // Préparer l'image pour l'analyse
    const request = {
      image: {
        content: image
      },
      features: [
        {
          type: 'LABEL_DETECTION',
          maxResults: 10
        },
        {
          type: 'OBJECT_LOCALIZATION',
          maxResults: 10
        },
        {
          type: 'TEXT_DETECTION',
          maxResults: 5
        },
        {
          type: 'IMAGE_PROPERTIES',
          maxResults: 5
        }
      ]
    };

    // Analyser l'image
    const [result] = await client.annotateImage(request);
    
    // Extraire les résultats
    const labels = result.labelAnnotations || [];
    const objects = result.localizedObjectAnnotations || [];
    const text = result.textAnnotations ? result.textAnnotations.slice(1).map(t => t.description) : [];
    const dominantColors = result.imagePropertiesAnnotation?.dominantColors?.colors || [];

    // Formater les résultats
    const formattedLabels = labels.map(label => ({
      description: label.description,
      confidence: label.score || 0,
      mid: label.mid
    }));

    const formattedObjects = objects.map(obj => ({
      name: obj.name,
      confidence: obj.score || 0,
      boundingPoly: obj.boundingPoly
    }));

    const formattedColors = dominantColors.map(color => ({
      color: {
        red: color.color.red || 0,
        green: color.color.green || 0,
        blue: color.color.blue || 0
      },
      score: color.score || 0,
      pixelFraction: color.pixelFraction || 0
    }));

    return {
      labels: formattedLabels,
      objects: formattedObjects,
      text: text,
      dominantColors: formattedColors
    };

  } catch (error) {
    console.error('Erreur lors de l\'analyse d\'image:', error);
    throw new functions.https.HttpsError('internal', 'Erreur lors de l\'analyse d\'image');
  }
});

/**
 * Cloud Function pour obtenir les statistiques d'un utilisateur
 */
exports.getUserStats = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Utilisateur non authentifié');
  }

  try {
    const userId = context.auth.uid;
    const userDoc = await admin.firestore().collection('users').doc(userId).get();
    
    if (userDoc.exists) {
      return userDoc.data().stats || {
        scansCompleted: 0,
        points: 0,
        challengesCompleted: 0,
        level: 1,
        categoriesScanned: {}
      };
    } else {
      return {
        scansCompleted: 0,
        points: 0,
        challengesCompleted: 0,
        level: 1,
        categoriesScanned: {}
      };
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des stats:', error);
    throw new functions.https.HttpsError('internal', 'Erreur lors de la récupération des statistiques');
  }
});

/**
 * Cloud Function pour obtenir l'historique des scans
 */
exports.getScanHistory = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Utilisateur non authentifié');
  }

  try {
    const userId = context.auth.uid;
    const { limit = 20 } = data;
    
    const querySnapshot = await admin.firestore()
      .collection('scanResults')
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc')
      .limit(limit)
      .get();

    const scans = [];
    querySnapshot.forEach(doc => {
      scans.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return scans;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'historique:', error);
    throw new functions.https.HttpsError('internal', 'Erreur lors de la récupération de l\'historique');
  }
});

/**
 * Cloud Function pour obtenir les statistiques globales
 */
exports.getGlobalStats = functions.https.onCall(async (data, context) => {
  try {
    const querySnapshot = await admin.firestore()
      .collection('scanResults')
      .get();

    let totalScans = 0;
    let totalConfidence = 0;
    const categoryCounts = {};

    querySnapshot.forEach(doc => {
      const data = doc.data();
      if (!data.deleted) {
        totalScans++;
        totalConfidence += data.confidence || 0;
        categoryCounts[data.wasteCategory] = (categoryCounts[data.wasteCategory] || 0) + 1;
      }
    });

    const mostScannedCategory = Object.entries(categoryCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Plastique';

    return {
      totalScans,
      mostScannedCategory,
      averageConfidence: totalScans > 0 ? totalConfidence / totalScans : 0
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des stats globales:', error);
    throw new functions.https.HttpsError('internal', 'Erreur lors de la récupération des statistiques globales');
  }
}); 