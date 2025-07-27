// Mocks
jest.mock('firebase/functions');
jest.mock('../../firebaseConfig');

import mlKitService, { VisionAnalysisResult, VisionLabel, VisionObject, WasteCategory } from '../services/mlKitService';
import { getFunctions, httpsCallable } from 'firebase/functions';

describe("MLKitService", () => {
  const service = mlKitService;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // analyzeImage
  describe("analyzeImage", () => {
    it("analyse une image avec succès", async () => {
      const mockResult = {
        data: {
          labels: [
            { description: "plastic bottle", confidence: 0.9 }
          ],
          objects: [
            { name: "plastic container", confidence: 0.8 }
          ],
          text: ["eau", "minérale"],
          dominantColors: [
            {
              color: { red: 255, green: 255, blue: 255 },
              score: 0.5,
              pixelFraction: 0.3
            }
          ]
        }
      };

      (httpsCallable as jest.Mock).mockReturnValue(jest.fn().mockResolvedValue(mockResult));

      const result = await service.analyzeImage("base64-image-data");

      expect(result.labels).toHaveLength(1);
      expect(result.objects).toHaveLength(1);
      expect(result.text).toHaveLength(2);
      expect(result.dominantColors).toHaveLength(1);
      expect(result.wasteCategory.category).toBe("Plastique");
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.alternatives).toHaveLength(2);
    });

    it("gère les erreurs lors de l'analyse", async () => {
      (httpsCallable as jest.Mock).mockReturnValue(
        jest.fn().mockRejectedValue(new Error("API Error"))
      );

      await expect(service.analyzeImage("invalid-data")).rejects.toThrow("Impossible d'analyser l'image");
    });

    it("retourne une catégorie par défaut si aucune correspondance trouvée", async () => {
      const mockResult = {
        data: {
          labels: [
            { description: "unknown object", confidence: 0.5 }
          ],
          objects: [],
          text: [],
          dominantColors: []
        }
      };

      (httpsCallable as jest.Mock).mockReturnValue(jest.fn().mockResolvedValue(mockResult));

      const result = await service.analyzeImage("base64-image-data");

      expect(result.wasteCategory.category).toBe("Plastique");
      expect(result.wasteCategory.confidence).toBe(0.5);
    });
  });

  // Classification des déchets
  describe("Classification des déchets", () => {
    it("classifie correctement une bouteille en plastique", async () => {
      const mockResult = {
        data: {
          labels: [
            { description: "water bottle", confidence: 0.95 }
          ],
          objects: [],
          text: [],
          dominantColors: []
        }
      };

      (httpsCallable as jest.Mock).mockReturnValue(jest.fn().mockResolvedValue(mockResult));

      const result = await service.analyzeImage("base64-image-data");

      expect(result.wasteCategory.category).toBe("Plastique");
      expect(result.wasteCategory.icon).toBe("bottle-soda");
      expect(result.wasteCategory.instructions).toContain("Rincer et jeter dans le bac plastique");
    });

    it("classifie correctement une canette en métal", async () => {
      const mockResult = {
        data: {
          labels: [
            { description: "aluminum can", confidence: 0.9 }
          ],
          objects: [],
          text: [],
          dominantColors: []
        }
      };

      (httpsCallable as jest.Mock).mockReturnValue(jest.fn().mockResolvedValue(mockResult));

      const result = await service.analyzeImage("base64-image-data");

      expect(result.wasteCategory.category).toBe("Métal");
      expect(result.wasteCategory.icon).toBe("silverware-fork-knife");
    });

    it("classifie correctement du papier", async () => {
      const mockResult = {
        data: {
          labels: [
            { description: "newspaper", confidence: 0.85 }
          ],
          objects: [],
          text: [],
          dominantColors: []
        }
      };

      (httpsCallable as jest.Mock).mockReturnValue(jest.fn().mockResolvedValue(mockResult));

      const result = await service.analyzeImage("base64-image-data");

      expect(result.wasteCategory.category).toBe("Papier");
      expect(result.wasteCategory.icon).toBe("newspaper");
    });

    it("classifie correctement des déchets organiques", async () => {
      const mockResult = {
        data: {
          labels: [
            { description: "apple", confidence: 0.8 }
          ],
          objects: [],
          text: [],
          dominantColors: []
        }
      };

      (httpsCallable as jest.Mock).mockReturnValue(jest.fn().mockResolvedValue(mockResult));

      const result = await service.analyzeImage("base64-image-data");

      expect(result.wasteCategory.category).toBe("Déchets verts");
      expect(result.wasteCategory.icon).toBe("food-apple");
    });

    it("classifie correctement des appareils électroniques", async () => {
      const mockResult = {
        data: {
          labels: [
            { description: "battery", confidence: 0.9 }
          ],
          objects: [],
          text: [],
          dominantColors: []
        }
      };

      (httpsCallable as jest.Mock).mockReturnValue(jest.fn().mockResolvedValue(mockResult));

      const result = await service.analyzeImage("base64-image-data");

      expect(result.wasteCategory.category).toBe("Électronique");
      expect(result.wasteCategory.icon).toBe("battery");
    });
  });

  // imageToBase64
  describe("imageToBase64", () => {
    it("convertit une image en base64 avec succès", async () => {
      // Mock fetch
      global.fetch = jest.fn().mockResolvedValue({
        blob: jest.fn().mockResolvedValue(new Blob(['test'], { type: 'image/jpeg' }))
      });

      // Mock FileReader
      const mockFileReader = {
        readAsDataURL: jest.fn(),
        result: 'data:image/jpeg;base64,dGVzdA==',
        onload: null as any,
        onerror: null as any
      };
      
      global.FileReader = jest.fn(() => mockFileReader) as any;

      const promise = service.imageToBase64("https://example.com/image.jpg");
      
      // Simuler le succès de FileReader
      setTimeout(() => {
        mockFileReader.onload();
      }, 0);

      const result = await promise;
      expect(result).toBe("dGVzdA==");
    });

    it("gère les erreurs lors de la conversion", async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error("Network error"));

      await expect(service.imageToBase64("invalid-url")).rejects.toThrow("Impossible de convertir l'image");
    });
  });

  // Alternatives de classification
  describe("Alternatives de classification", () => {
    it("retourne des alternatives différentes de la catégorie principale", async () => {
      const mockResult = {
        data: {
          labels: [
            { description: "bottle", confidence: 0.9 }
          ],
          objects: [],
          text: [],
          dominantColors: []
        }
      };

      (httpsCallable as jest.Mock).mockReturnValue(jest.fn().mockResolvedValue(mockResult));

      const result = await service.analyzeImage("base64-image-data");

      expect(result.alternatives).toHaveLength(2);
      result.alternatives.forEach((alternative: WasteCategory) => {
        expect(alternative.category).not.toBe("Plastique");
        expect(alternative.confidence).toBeGreaterThanOrEqual(0.2);
        expect(alternative.confidence).toBeLessThanOrEqual(0.5);
      });
    });
  });

  // Gestion des données vides
  describe("Gestion des données vides", () => {
    it("gère les résultats vides de l'API", async () => {
      const mockResult = {
        data: {
          labels: [],
          objects: [],
          text: [],
          dominantColors: []
        }
      };

      (httpsCallable as jest.Mock).mockReturnValue(jest.fn().mockResolvedValue(mockResult));

      const result = await service.analyzeImage("base64-image-data");

      expect(result.labels).toHaveLength(0);
      expect(result.objects).toHaveLength(0);
      expect(result.text).toHaveLength(0);
      expect(result.dominantColors).toHaveLength(0);
      expect(result.wasteCategory.category).toBe("Plastique"); // Catégorie par défaut
    });
  });
}); 