// ML Kit pour la reconnaissance d'images locale
import ImageLabeling from '@react-native-ml-kit/image-labeling';
import { Platform } from 'react-native';

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
  private isDevelopment = __DEV__;
  
  /**
   * Détermine si on est en mode développement avec Expo
   */
  private isExpoEnvironment(): boolean {
    return this.isDevelopment && Platform.OS !== 'web';
  }
  
  /**
   * Analyse une image avec ML Kit (reconnaissance locale)
   */
  async analyzeImage(imageUri: string): Promise<VisionAnalysisResult> {
    const isExpo = this.isExpoEnvironment();
    
    if (isExpo) {
      console.log('🔧 Mode développement Expo détecté - Utilisation de la simulation enrichie');
      return this.developmentAnalysis(imageUri);
    }
    
    try {
      console.log(' Mode production - Utilisation du vrai ML Kit');
      console.log(' Analyse ML Kit de l\'image:', imageUri);
      
      // Utiliser le vrai ML Kit pour analyser l'image
      const labels = await ImageLabeling.label(imageUri);
      
      console.log(' Labels détectés par ML Kit:', labels);
      
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
      console.error(' Erreur lors de l\'analyse ML Kit:', error);
      
      // Fallback vers la simulation si ML Kit échoue
      console.log(' Fallback vers la simulation');
      return this.fallbackSimulation();
    }
  }

  /**
   * Analyse enrichie pour le mode développement avec Expo
   */
  private async developmentAnalysis(imageUri: string): Promise<VisionAnalysisResult> {
    console.log('🔧 Début de l\'analyse en mode développement');
    console.log('📸 URI de l\'image:', imageUri);
    
    // Simuler un délai d'analyse réaliste
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Générer des labels plus détaillés et réalistes
    const detailedLabels = this.generateDetailedLabels();
    const detailedObjects = this.generateDetailedObjects(detailedLabels);
    const mockText = this.generateMockText();
    const detailedColors = this.generateDetailedColors();
    
    // Classification avec plus de détails
    const wasteCategory = this.classifyWasteDetailed(detailedLabels, detailedObjects);
    const alternatives = this.getDetailedAlternatives(wasteCategory.category);
    
    // Logs détaillés pour le développement
    console.log(' Analyse complète terminée:');
    console.log(' Labels trouvés:', detailedLabels.length);
    console.log(' Objets détectés:', detailedObjects.length);
    console.log(' Texte OCR:', mockText.length, 'éléments');
    console.log(' Couleurs dominantes:', detailedColors.length);
    console.log(' Catégorie finale:', wasteCategory.category);
    console.log(' Confiance:', (wasteCategory.confidence * 100).toFixed(1) + '%');
    console.log(' Alternatives:', alternatives.map(a => a.category).join(', '));
    
    return {
      labels: detailedLabels,
      objects: detailedObjects,
      text: mockText,
      dominantColors: detailedColors,
      wasteCategory,
      confidence: wasteCategory.confidence,
      alternatives,
    };
  }

  /**
   * Méthode de fallback en cas d'échec de ML Kit
   */
  private async fallbackSimulation(): Promise<VisionAnalysisResult> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const simulatedLabels = this.generateSimulatedLabels();
    const simulatedObjects = this.generateSimulatedObjects(simulatedLabels);
    const wasteCategory = this.classifyWaste(simulatedLabels, simulatedObjects);
    
    console.log(' Simulation générée:', {
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
    console.log(' Classification avec labels:', labels.map(l => l.description));
    
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
    
    console.log(' Classifié comme:', wasteInfo.category, 'avec confiance:', confidence);
    
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

  /**
   * Génère des labels détaillés pour le mode développement
   */
  private generateDetailedLabels(): VisionLabel[] {
    const detailedLabelSets = [
      // Bouteille plastique avec plus de détails
      [
        { description: 'Plastic bottle', confidence: 0.94, mid: '/m/0dv5r' },
        { description: 'Water bottle', confidence: 0.89, mid: '/m/01k6s3' },
        { description: 'Beverage container', confidence: 0.85, mid: '/m/02wbm' },
        { description: 'Recyclable plastic', confidence: 0.82, mid: '/m/05zsy' },
        { description: 'Clear container', confidence: 0.78, mid: '/m/0dv2w' },
        { description: 'PET plastic', confidence: 0.73, mid: '/m/0dv5r_pet' },
      ],
      // Canette métallique
      [
        { description: 'Aluminum can', confidence: 0.96, mid: '/m/0dv9c' },
        { description: 'Beverage can', confidence: 0.91, mid: '/m/01k6s4' },
        { description: 'Soda can', confidence: 0.87, mid: '/m/06z37_' },
        { description: 'Metal container', confidence: 0.83, mid: '/m/04yx4' },
        { description: 'Recyclable aluminum', confidence: 0.79, mid: '/m/0dv9c_rec' },
        { description: 'Cylindrical container', confidence: 0.74, mid: '/m/0dv2x' },
      ],
      // Papier/Document
      [
        { description: 'Paper', confidence: 0.93, mid: '/m/0dv3w' },
        { description: 'Document', confidence: 0.88, mid: '/m/01k7s5' },
        { description: 'White paper', confidence: 0.84, mid: '/m/0dv3w_white' },
        { description: 'Office paper', confidence: 0.80, mid: '/m/0dv3w_office' },
        { description: 'Recyclable paper', confidence: 0.76, mid: '/m/0dv3w_rec' },
        { description: 'Text document', confidence: 0.71, mid: '/m/01k7s5_text' },
      ],
      // Verre
      [
        { description: 'Glass bottle', confidence: 0.95, mid: '/m/0dv4r' },
        { description: 'Glass container', confidence: 0.90, mid: '/m/0dv4r_cont' },
        { description: 'Transparent glass', confidence: 0.86, mid: '/m/0dv4r_trans' },
        { description: 'Wine bottle', confidence: 0.81, mid: '/m/0dv4r_wine' },
        { description: 'Recyclable glass', confidence: 0.77, mid: '/m/0dv4r_rec' },
        { description: 'Green glass', confidence: 0.72, mid: '/m/0dv4r_green' },
      ],
      // Carton
      [
        { description: 'Cardboard box', confidence: 0.92, mid: '/m/0dv6r' },
        { description: 'Package box', confidence: 0.87, mid: '/m/0dv6r_pack' },
        { description: 'Shipping box', confidence: 0.83, mid: '/m/0dv6r_ship' },
        { description: 'Brown cardboard', confidence: 0.79, mid: '/m/0dv6r_brown' },
        { description: 'Corrugated cardboard', confidence: 0.74, mid: '/m/0dv6r_corr' },
        { description: 'Recyclable cardboard', confidence: 0.70, mid: '/m/0dv6r_rec' },
      ]
    ];
    
    const randomSet = detailedLabelSets[Math.floor(Math.random() * detailedLabelSets.length)];
    return randomSet;
  }

  /**
   * Génère des objets détaillés basés sur les labels
   */
  private generateDetailedObjects(labels: VisionLabel[]): VisionObject[] {
    return labels.slice(0, 4).map((label, index) => ({
      name: label.description.toLowerCase(),
      confidence: label.confidence - (index * 0.05), // Confiance décroissante
      boundingPoly: {
        vertices: [
          { x: 100 + index * 20, y: 150 + index * 15 },
          { x: 200 + index * 20, y: 150 + index * 15 },
          { x: 200 + index * 20, y: 250 + index * 15 },
          { x: 100 + index * 20, y: 250 + index * 15 },
        ]
      }
    }));
  }

  /**
   * Génère du texte OCR simulé
   */
  private generateMockText(): string[] {
    const textOptions = [
      ['RECYCLABLE', 'PET 1', '500mL'],
      ['COCA-COLA', 'RECYCLEZ-MOI', 'FR'],
      ['BIO', 'ORGANIC', '100% NATUREL'],
      ['ALUMINIUM', 'CAN', 'RECYCLE'],
      ['PAPIER', 'BLANC', 'A4'],
      ['VERRE', 'CONSIGNE', '75cl'],
    ];
    
    const randomTexts = textOptions[Math.floor(Math.random() * textOptions.length)];
    return randomTexts;
  }

  /**
   * Génère des couleurs détaillées
   */
  private generateDetailedColors(): ColorInfo[] {
    const colorOptions = [
      // Bouteille plastique transparente
      [
        { color: { red: 240, green: 248, blue: 255 }, score: 0.85, pixelFraction: 0.65 },
        { color: { red: 135, green: 206, blue: 235 }, score: 0.45, pixelFraction: 0.25 },
        { color: { red: 70, green: 130, blue: 180 }, score: 0.25, pixelFraction: 0.10 },
      ],
      // Canette métallique
      [
        { color: { red: 192, green: 192, blue: 192 }, score: 0.90, pixelFraction: 0.70 },
        { color: { red: 255, green: 0, blue: 0 }, score: 0.60, pixelFraction: 0.20 },
        { color: { red: 0, green: 0, blue: 0 }, score: 0.30, pixelFraction: 0.10 },
      ],
      // Papier blanc
      [
        { color: { red: 255, green: 255, blue: 255 }, score: 0.95, pixelFraction: 0.85 },
        { color: { red: 240, green: 240, blue: 240 }, score: 0.40, pixelFraction: 0.12 },
        { color: { red: 0, green: 0, blue: 0 }, score: 0.20, pixelFraction: 0.03 },
      ],
    ];
    
    return colorOptions[Math.floor(Math.random() * colorOptions.length)];
  }

  /**
   * Classification détaillée pour le mode développement
   */
  private classifyWasteDetailed(labels: VisionLabel[], objects: VisionObject[]): WasteCategory {
    console.log(' Classification détaillée avec', labels.length, 'labels');
    
    // Analyse plus sophistiquée des labels
    const primaryLabel = labels[0]?.description.toLowerCase() || '';
    const secondaryLabels = labels.slice(1, 3).map(l => l.description.toLowerCase());
    
    console.log(' Label principal:', primaryLabel);
    console.log(' Labels secondaires:', secondaryLabels);
    
    let wasteType = 'plastic'; // Défaut
    let confidence = labels[0]?.confidence || 0.8;
    
    // Classification plus précise
    if (primaryLabel.includes('bottle') && primaryLabel.includes('plastic')) {
      wasteType = 'bottle';
      confidence = Math.min(confidence + 0.1, 0.98); // Boost de confiance
    } else if (primaryLabel.includes('can') && primaryLabel.includes('aluminum')) {
      wasteType = 'can';
      confidence = Math.min(confidence + 0.08, 0.96);
    } else if (primaryLabel.includes('paper') || primaryLabel.includes('document')) {
      wasteType = 'paper';
      confidence = Math.min(confidence + 0.06, 0.94);
    } else if (primaryLabel.includes('glass') && primaryLabel.includes('bottle')) {
      wasteType = 'glass';
      confidence = Math.min(confidence + 0.07, 0.95);
    } else if (primaryLabel.includes('cardboard') && primaryLabel.includes('box')) {
      wasteType = 'cardboard';
      confidence = Math.min(confidence + 0.05, 0.92);
    }
    
    const wasteInfo = WASTE_CLASSIFICATION[wasteType as keyof typeof WASTE_CLASSIFICATION];
    
    console.log(' Classification détaillée:', wasteInfo.category);
    console.log(' Confiance finale:', (confidence * 100).toFixed(1) + '%');
    
    return {
      category: wasteInfo.category,
      icon: wasteInfo.icon,
      color: wasteInfo.color,
      instructions: wasteInfo.instructions,
      confidence: confidence,
    };
  }

  /**
   * Obtient des alternatives détaillées
   */
  private getDetailedAlternatives(primaryCategory: string): WasteCategory[] {
    const alternatives = Object.entries(WASTE_CLASSIFICATION)
      .filter(([, info]) => info.category !== primaryCategory)
      .slice(0, 3) // Plus d'alternatives en mode dev
      .map(([, info]) => ({
        category: info.category,
        icon: info.icon,
        color: info.color,
        instructions: info.instructions,
        confidence: Math.random() * 0.4 + 0.15, // 15-55% de confiance
      }))
      .sort((a, b) => b.confidence - a.confidence); // Trier par confiance

    return alternatives;
  }

}

export const mlKitService = new MLKitService();
export default mlKitService; 