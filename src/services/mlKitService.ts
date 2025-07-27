import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '../../firebaseConfig';

const functions = getFunctions(app);

// Types pour l'analyse d'image
export interface VisionAnalysisResult {
  labels: VisionLabel[];
  objects: VisionObject[];
  text: string[];
  dominantColors: ColorInfo[];
  wasteCategory: WasteCategory;
  confidence: number;
  alternatives: WasteCategory[];
}

export interface VisionLabel {
  description: string;
  confidence: number;
  mid?: string;
}

export interface VisionObject {
  name: string;
  confidence: number;
  boundingPoly?: any;
}

export interface ColorInfo {
  color: {
    red: number;
    green: number;
    blue: number;
  };
  score: number;
  pixelFraction: number;
}

export interface WasteCategory {
  category: string;
  icon: string;
  color: string;
  instructions: string;
  confidence: number;
}

// Base de données de classification des déchets
const WASTE_CLASSIFICATION = {
  'bottle': { category: 'Plastique', icon: 'bottle-soda', color: '#4CAF50', instructions: 'Rincer et jeter dans le bac plastique' },
  'can': { category: 'Métal', icon: 'silverware-fork-knife', color: '#FF9800', instructions: 'Rincer et jeter dans le bac métal' },
  'paper': { category: 'Papier', icon: 'file-document', color: '#2196F3', instructions: 'Plier et jeter dans le bac papier' },
  'glass': { category: 'Verre', icon: 'glass-cocktail', color: '#9C27B0', instructions: 'Rincer et jeter dans le bac verre' },
  'cardboard': { category: 'Papier', icon: 'package-variant', color: '#2196F3', instructions: 'Aplatir et jeter dans le bac papier' },
  'plastic': { category: 'Plastique', icon: 'recycle', color: '#4CAF50', instructions: 'Rincer et jeter dans le bac plastique' },
  'metal': { category: 'Métal', icon: 'silverware-fork-knife', color: '#FF9800', instructions: 'Rincer et jeter dans le bac métal' },
  'organic': { category: 'Déchets verts', icon: 'leaf', color: '#8BC34A', instructions: 'Composter ou jeter dans le bac organique' },
  'electronics': { category: 'Électronique', icon: 'battery', color: '#F44336', instructions: 'Apporter en déchetterie ou point de collecte' },
  'textile': { category: 'Textile', icon: 'tshirt-crew', color: '#E91E63', instructions: 'Donner ou jeter dans le bac textile' },
  'food': { category: 'Déchets verts', icon: 'food-apple', color: '#8BC34A', instructions: 'Composter ou jeter dans le bac organique' },
  'drink': { category: 'Plastique', icon: 'cup-water', color: '#4CAF50', instructions: 'Rincer et jeter dans le bac plastique' },
  'container': { category: 'Plastique', icon: 'package-variant-closed', color: '#4CAF50', instructions: 'Rincer et jeter dans le bac plastique' },
  'newspaper': { category: 'Papier', icon: 'newspaper', color: '#2196F3', instructions: 'Plier et jeter dans le bac papier' },
  'magazine': { category: 'Papier', icon: 'book-open-page-variant', color: '#2196F3', instructions: 'Plier et jeter dans le bac papier' },
  'box': { category: 'Papier', icon: 'package-variant', color: '#2196F3', instructions: 'Aplatir et jeter dans le bac papier' },
  'bag': { category: 'Plastique', icon: 'shopping', color: '#4CAF50', instructions: 'Rincer et jeter dans le bac plastique' },
  'wrapper': { category: 'Plastique', icon: 'package-variant-closed', color: '#4CAF50', instructions: 'Rincer et jeter dans le bac plastique' },
  'battery': { category: 'Électronique', icon: 'battery', color: '#F44336', instructions: 'Apporter en déchetterie ou point de collecte' },
  'phone': { category: 'Électronique', icon: 'cellphone', color: '#F44336', instructions: 'Apporter en déchetterie ou point de collecte' },
  'clothing': { category: 'Textile', icon: 'tshirt-crew', color: '#E91E63', instructions: 'Donner ou jeter dans le bac textile' },
  'fabric': { category: 'Textile', icon: 'tshirt-crew', color: '#E91E63', instructions: 'Donner ou jeter dans le bac textile' },
  'fruit': { category: 'Déchets verts', icon: 'food-apple', color: '#8BC34A', instructions: 'Composter ou jeter dans le bac organique' },
  'vegetable': { category: 'Déchets verts', icon: 'food-apple', color: '#8BC34A', instructions: 'Composter ou jeter dans le bac organique' },
  'bread': { category: 'Déchets verts', icon: 'food-apple', color: '#8BC34A', instructions: 'Composter ou jeter dans le bac organique' },
  'coffee': { category: 'Déchets verts', icon: 'coffee', color: '#8BC34A', instructions: 'Composter ou jeter dans le bac organique' },
  'tea': { category: 'Déchets verts', icon: 'tea', color: '#8BC34A', instructions: 'Composter ou jeter dans le bac organique' },
};

// Mots-clés pour la classification
const WASTE_KEYWORDS = {
  'bottle': ['bottle', 'water bottle', 'plastic bottle', 'drink bottle', 'soda bottle'],
  'can': ['can', 'aluminum can', 'tin can', 'soda can', 'beer can'],
  'paper': ['paper', 'document', 'sheet', 'page'],
  'glass': ['glass', 'bottle', 'jar', 'container'],
  'cardboard': ['cardboard', 'box', 'carton', 'package'],
  'plastic': ['plastic', 'container', 'package', 'wrapper'],
  'metal': ['metal', 'aluminum', 'steel', 'tin'],
  'organic': ['food', 'fruit', 'vegetable', 'bread', 'organic'],
  'electronics': ['battery', 'phone', 'electronic', 'device'],
  'textile': ['clothing', 'fabric', 'textile', 'shirt', 'cloth'],
  'food': ['food', 'fruit', 'vegetable', 'bread', 'meal'],
  'drink': ['drink', 'beverage', 'soda', 'water', 'juice'],
  'container': ['container', 'package', 'box'],
  'newspaper': ['newspaper', 'magazine', 'journal'],
  'magazine': ['magazine', 'journal', 'publication'],
  'box': ['box', 'carton', 'package'],
  'bag': ['bag', 'plastic bag', 'shopping bag'],
  'wrapper': ['wrapper', 'packaging', 'film'],
  'battery': ['battery', 'cell'],
  'phone': ['phone', 'mobile', 'cellphone'],
  'clothing': ['clothing', 'shirt', 'pants', 'dress'],
  'fabric': ['fabric', 'cloth', 'textile'],
  'fruit': ['fruit', 'apple', 'banana', 'orange'],
  'vegetable': ['vegetable', 'carrot', 'tomato', 'lettuce'],
  'bread': ['bread', 'toast', 'sandwich'],
  'coffee': ['coffee', 'tea', 'beverage'],
  'tea': ['tea', 'herbal', 'beverage'],
};

class MLKitService {
  /**
   * Analyse une image avec Google Cloud Vision API
   */
  async analyzeImage(imageBase64: string): Promise<VisionAnalysisResult> {
    try {
      // Appeler la Cloud Function
      const analyzeImageFunction = httpsCallable(functions, 'analyzeImage');
      const result = await analyzeImageFunction({ image: imageBase64 });
      
      const data = result.data as any;
      
      // Classifier le déchet basé sur les résultats de Vision API
      const wasteCategory = this.classifyWaste(data.labels, data.objects);
      
      return {
        labels: data.labels || [],
        objects: data.objects || [],
        text: data.text || [],
        dominantColors: data.dominantColors || [],
        wasteCategory,
        confidence: wasteCategory.confidence,
        alternatives: this.getAlternativeClassifications(wasteCategory.category),
      };
    } catch (error) {
      console.error('Erreur lors de l\'analyse ML Kit:', error);
      throw new Error('Impossible d\'analyser l\'image');
    }
  }

  /**
   * Classifie le déchet basé sur les labels et objets détectés
   */
  private classifyWaste(labels: VisionLabel[], objects: VisionObject[]): WasteCategory {
    const allDetections = [
      ...labels.map(label => ({ text: label.description.toLowerCase(), confidence: label.confidence })),
      ...objects.map(obj => ({ text: obj.name.toLowerCase(), confidence: obj.confidence }))
    ];

    let bestMatch = { category: 'unknown', confidence: 0, score: 0 };
    const scores: { [key: string]: number } = {};

    // Analyser chaque détection
    allDetections.forEach(detection => {
      Object.entries(WASTE_KEYWORDS).forEach(([wasteType, keywords]) => {
        keywords.forEach(keyword => {
          if (detection.text.includes(keyword)) {
            const score = detection.confidence * (keyword.length / detection.text.length);
            scores[wasteType] = (scores[wasteType] || 0) + score;
          }
        });
      });
    });

    // Trouver la meilleure correspondance
    Object.entries(scores).forEach(([wasteType, score]) => {
      if (score > bestMatch.score) {
        bestMatch = { category: wasteType, confidence: Math.min(score, 1), score };
      }
    });

    // Si aucune correspondance trouvée, utiliser une catégorie par défaut
    if (bestMatch.category === 'unknown') {
      bestMatch = { category: 'plastic', confidence: 0.5, score: 0.5 };
    }

    const wasteInfo = WASTE_CLASSIFICATION[bestMatch.category as keyof typeof WASTE_CLASSIFICATION];
    
    return {
      category: wasteInfo.category,
      icon: wasteInfo.icon,
      color: wasteInfo.color,
      instructions: wasteInfo.instructions,
      confidence: bestMatch.confidence,
    };
  }

  /**
   * Obtient des classifications alternatives
   */
  private getAlternativeClassifications(primaryCategory: string): WasteCategory[] {
    const alternatives = Object.entries(WASTE_CLASSIFICATION)
      .filter(([, info]) => info.category !== primaryCategory)
      .slice(0, 2)
              .map(([, info]) => ({
        category: info.category,
        icon: info.icon,
        color: info.color,
        instructions: info.instructions,
        confidence: Math.random() * 0.3 + 0.2, // 20-50% de confiance pour les alternatives
      }));

    return alternatives;
  }

  /**
   * Convertit une image en base64
   */
  async imageToBase64(imageUri: string): Promise<string> {
    try {
      const response = await fetch(imageUri);
      const blob = await response.blob();
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result as string;
          // Enlever le préfixe "data:image/jpeg;base64,"
          const base64Data = base64.split(',')[1];
          resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Erreur lors de la conversion en base64:', error);
      throw new Error('Impossible de convertir l\'image');
    }
  }
}

export const mlKitService = new MLKitService();
export default mlKitService; 