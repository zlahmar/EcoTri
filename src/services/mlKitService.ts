// ML Kit pour la reconnaissance d'images locale
import ImageLabeling from '@react-native-ml-kit/image-labeling';

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
   * Analyse une image avec ML Kit (reconnaissance locale)
   */
  async analyzeImage(imageUri: string): Promise<VisionAnalysisResult> {
    try {
      console.log('🔍 Analyse ML Kit de l\'image:', imageUri);
      
      // Utiliser ML Kit pour analyser l'image
      const labels = await ImageLabeling.label(imageUri);
      
      console.log('🏷️ Labels détectés par ML Kit:', labels);
      
      // Convertir les résultats ML Kit vers notre format
      const visionLabels: VisionLabel[] = labels.map(label => ({
        description: label.text,
        confidence: label.confidence,
      }));
      
      // Créer des objets basés sur les labels (ML Kit ne fait que du labeling)
      const visionObjects: VisionObject[] = labels.slice(0, 3).map(label => ({
        name: label.text.toLowerCase(),
        confidence: label.confidence,
      }));
      
      // Classifier le déchet basé sur les vrais résultats ML Kit
      const wasteCategory = this.classifyWaste(visionLabels, visionObjects);
      
      return {
        labels: visionLabels,
        objects: visionObjects,
        text: [], // ML Kit image labeling ne fait pas d'OCR
        dominantColors: this.generateSimulatedColors(), // On garde les couleurs simulées
        wasteCategory,
        confidence: wasteCategory.confidence,
        alternatives: this.getAlternativeClassifications(wasteCategory.category),
      };
    } catch (error) {
      console.error('Erreur lors de l\'analyse ML Kit:', error);
      
      // Fallback vers la simulation si ML Kit échoue
      console.log('⚠️ Fallback vers la simulation');
      return this.fallbackSimulation();
    }
  }

  /**
   * Méthode de fallback en cas d'échec de ML Kit
   */
  private async fallbackSimulation(): Promise<VisionAnalysisResult> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const simulatedLabels = this.generateSimulatedLabels();
    const simulatedObjects = this.generateSimulatedObjects(simulatedLabels);
    const wasteCategory = this.classifyWaste(simulatedLabels, simulatedObjects);
    
    console.log('🎲 Simulation générée:', {
      labels: simulatedLabels.map(l => l.description),
      category: wasteCategory.category,
      confidence: wasteCategory.confidence
    });
    
    return {
      labels: simulatedLabels,
      objects: simulatedObjects,
      text: [],
      dominantColors: this.generateSimulatedColors(),
      wasteCategory,
      confidence: wasteCategory.confidence,
      alternatives: this.getAlternativeClassifications(wasteCategory.category),
    };
  }

  /**
   * Classifie le déchet basé sur les labels et objets détectés
   */
  private classifyWaste(labels: VisionLabel[], objects: VisionObject[]): WasteCategory {
    console.log('🔍 Classification avec labels:', labels.map(l => l.description));
    
    // Classification directe basée sur les premiers labels
    const primaryLabel = labels[0]?.description.toLowerCase() || '';
    
    // Mappage direct et simple
    let wasteType = 'plastic'; // Défaut
    
    if (primaryLabel.includes('bottle') || primaryLabel.includes('plastic')) {
      wasteType = 'bottle';
    } else if (primaryLabel.includes('can') || primaryLabel.includes('metal') || primaryLabel.includes('aluminum')) {
      wasteType = 'can';
    } else if (primaryLabel.includes('paper') || primaryLabel.includes('document') || primaryLabel.includes('sheet')) {
      wasteType = 'paper';
    } else if (primaryLabel.includes('glass') || primaryLabel.includes('jar')) {
      wasteType = 'glass';
    } else if (primaryLabel.includes('box') || primaryLabel.includes('cardboard') || primaryLabel.includes('package')) {
      wasteType = 'cardboard';
    }
    
    const wasteInfo = WASTE_CLASSIFICATION[wasteType as keyof typeof WASTE_CLASSIFICATION];
    const confidence = labels[0]?.confidence || 0.8;
    
    console.log('✅ Classifié comme:', wasteInfo.category, 'avec confiance:', confidence);
    
    return {
      category: wasteInfo.category,
      icon: wasteInfo.icon,
      color: wasteInfo.color,
      instructions: wasteInfo.instructions,
      confidence: confidence,
    };
  }

  /**
   * Génère des labels simulés pour la démonstration (plus variés)
   */
  private generateSimulatedLabels(): VisionLabel[] {
    const labelSets = [
      // Set bouteille plastique
      [
        { description: 'Bottle', confidence: 0.95 },
        { description: 'Plastic', confidence: 0.89 },
        { description: 'Container', confidence: 0.82 },
        { description: 'Beverage', confidence: 0.76 },
      ],
      // Set canette
      [
        { description: 'Can', confidence: 0.92 },
        { description: 'Metal', confidence: 0.87 },
        { description: 'Aluminum', confidence: 0.81 },
        { description: 'Drink', confidence: 0.74 },
      ],
      // Set papier
      [
        { description: 'Paper', confidence: 0.90 },
        { description: 'Document', confidence: 0.85 },
        { description: 'Sheet', confidence: 0.78 },
        { description: 'Text', confidence: 0.72 },
      ],
      // Set verre
      [
        { description: 'Glass', confidence: 0.93 },
        { description: 'Jar', confidence: 0.86 },
        { description: 'Transparent', confidence: 0.79 },
        { description: 'Container', confidence: 0.75 },
      ],
      // Set carton
      [
        { description: 'Box', confidence: 0.91 },
        { description: 'Cardboard', confidence: 0.88 },
        { description: 'Package', confidence: 0.83 },
        { description: 'Brown', confidence: 0.77 },
      ]
    ];
    
    // Choisir un set aléatoire
    const randomSet = labelSets[Math.floor(Math.random() * labelSets.length)];
    return randomSet;
  }

  /**
   * Génère des objets simulés pour la démonstration (adaptés aux labels)
   */
  private generateSimulatedObjects(labels: VisionLabel[]): VisionObject[] {
    // Créer des objets basés sur les labels générés
    return labels.slice(0, 2).map(label => ({
      name: label.description.toLowerCase(),
      confidence: label.confidence - 0.1, // Légèrement moins confiant que les labels
    }));
  }

  /**
   * Génère des couleurs simulées pour la démonstration
   */
  private generateSimulatedColors(): ColorInfo[] {
    return [
      {
        color: { red: 100, green: 150, blue: 200 },
        score: 0.8,
        pixelFraction: 0.6
      },
      {
        color: { red: 255, green: 255, blue: 255 },
        score: 0.3,
        pixelFraction: 0.4
      }
    ];
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


}

export const mlKitService = new MLKitService();
export default mlKitService; 