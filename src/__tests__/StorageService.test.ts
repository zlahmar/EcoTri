// Mocks
jest.mock('firebase/storage');
jest.mock('firebase/firestore');
jest.mock('../../firebaseConfig');

import storageService from '../services/storageService';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';
import {
  doc,
  setDoc,
  updateDoc,
  getDoc,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs
} from 'firebase/firestore';

// Mock Firebase config
const mockStorage = {};
const mockDb = {};
const mockAuth = {
  currentUser: {
    uid: "test-user-id",
    displayName: "Test User"
  }
};

jest.mocked(require('../../firebaseConfig')).storage = mockStorage;
jest.mocked(require('../../firebaseConfig')).db = mockDb;
jest.mocked(require('../../firebaseConfig')).auth = mockAuth;

import { storage, db, auth } from '../../firebaseConfig';

describe("StorageService", () => {
  const service = storageService;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // uploadImage
  describe("uploadImage", () => {
    it("upload une image avec succès", async () => {
      const mockBlob = new Blob(['test'], { type: 'image/jpeg' });
      const mockImageRef = {};
      const mockDownloadURL = "https://example.com/image.jpg";

      global.fetch = jest.fn().mockResolvedValue({
        blob: jest.fn().mockResolvedValue(mockBlob)
      });

      (ref as jest.Mock).mockReturnValue(mockImageRef);
      (uploadBytes as jest.Mock).mockResolvedValue(undefined);
      (getDownloadURL as jest.Mock).mockResolvedValue(mockDownloadURL);

      const result = await service.uploadImage("file://test.jpg", "user123");

      expect(ref).toHaveBeenCalledWith(storage, expect.stringContaining("scanImages/user123/"));
      expect(uploadBytes).toHaveBeenCalledWith(mockImageRef, mockBlob);
      expect(getDownloadURL).toHaveBeenCalledWith(mockImageRef);
      expect(result).toBe(mockDownloadURL);
    });

    it("gère les erreurs lors de l'upload", async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error("Network error"));

      await expect(service.uploadImage("invalid-uri", "user123")).rejects.toThrow("Impossible de sauvegarder l'image");
    });
  });

  // saveScanResult
  describe("saveScanResult", () => {
    it("sauvegarde un résultat de scan avec succès", async () => {
      const mockDocRef = { id: "scan123" };
      const scanResult = {
        userId: "user123",
        imageUrl: "https://example.com/image.jpg",
        wasteCategory: "Plastique",
        confidence: 0.9,
        alternatives: ["Métal", "Papier"],
        labels: ["bottle", "plastic"],
        objects: ["container"]
      };

      (addDoc as jest.Mock).mockResolvedValue(mockDocRef);
      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        data: () => ({
          stats: {
            scansCompleted: 5,
            points: 50,
            challengesCompleted: 2,
            level: 1,
            categoriesScanned: { "Plastique": 3 }
          }
        })
      });

      const result = await service.saveScanResult(scanResult);

      expect(addDoc).toHaveBeenCalledWith(collection(db, 'scanResults'), expect.objectContaining({
        userId: "test-user-id",
        imageUrl: scanResult.imageUrl,
        wasteCategory: scanResult.wasteCategory,
        confidence: scanResult.confidence,
        alternatives: scanResult.alternatives,
        labels: scanResult.labels,
        objects: scanResult.objects
      }));
      expect(result).toBe("scan123");
    });

    it("gère l'erreur d'utilisateur non authentifié", async () => {
      // Mock auth.currentUser to be null
      (auth.currentUser as any) = null;
      
      const scanResult = {
        userId: "user123",
        imageUrl: "https://example.com/image.jpg",
        wasteCategory: "Plastique",
        confidence: 0.9,
        alternatives: [],
        labels: [],
        objects: []
      };

      await expect(service.saveScanResult(scanResult)).rejects.toThrow("Utilisateur non authentifié");
      
      // Reset mock
      (auth.currentUser as any) = {
        uid: "test-user-id",
        displayName: "Test User"
      };
    });
  });

  // getUserScanHistory
  describe("getUserScanHistory", () => {
    it("récupère l'historique des scans d'un utilisateur", async () => {
      const mockDocs = [
        {
          id: "scan1",
          data: () => ({
            userId: "user123",
            imageUrl: "https://example.com/image1.jpg",
            wasteCategory: "Plastique",
            confidence: 0.9,
            timestamp: new Date()
          })
        },
        {
          id: "scan2",
          data: () => ({
            userId: "user123",
            imageUrl: "https://example.com/image2.jpg",
            wasteCategory: "Métal",
            confidence: 0.8,
            timestamp: new Date()
          })
        }
      ];

      (getDocs as jest.Mock).mockResolvedValue({
        forEach: (callback: any) => mockDocs.forEach(callback)
      });

      const result = await service.getUserScanHistory("user123", 10);

      expect(query).toHaveBeenCalledWith(
        collection(db, 'scanResults'),
        where('userId', '==', 'user123'),
        orderBy('timestamp', 'desc')
      );
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("scan1");
      expect(result[1].id).toBe("scan2");
    });

    it("gère les erreurs lors de la récupération de l'historique", async () => {
      (getDocs as jest.Mock).mockRejectedValue(new Error("Database error"));

      await expect(service.getUserScanHistory("user123")).rejects.toThrow("Impossible de récupérer l'historique");
    });
  });

  // getUserStats
  describe("getUserStats", () => {
    it("récupère les statistiques d'un utilisateur existant", async () => {
      const mockUserData = {
        stats: {
          scansCompleted: 10,
          points: 150,
          challengesCompleted: 3,
          level: 2,
          lastScanDate: { toDate: () => new Date() },
          categoriesScanned: { "Plastique": 5, "Métal": 3, "Papier": 2 }
        }
      };

      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        data: () => mockUserData
      });

      const result = await service.getUserStats("user123");

      expect(result.scansCompleted).toBe(10);
      expect(result.points).toBe(150);
      expect(result.level).toBe(2);
      expect(result.categoriesScanned).toEqual({ "Plastique": 5, "Métal": 3, "Papier": 2 });
    });

    it("crée des statistiques par défaut pour un nouvel utilisateur", async () => {
      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => false
      });

      const result = await service.getUserStats("newuser");

      expect(setDoc).toHaveBeenCalledWith(doc(db, 'users', 'newuser'), {
        stats: {
          scansCompleted: 0,
          points: 0,
          challengesCompleted: 0,
          level: 1,
          categoriesScanned: {}
        }
      });
      expect(result.scansCompleted).toBe(0);
      expect(result.points).toBe(0);
      expect(result.level).toBe(1);
    });

    it("gère les erreurs lors de la récupération des stats", async () => {
      (getDoc as jest.Mock).mockRejectedValue(new Error("Database error"));

      await expect(service.getUserStats("user123")).rejects.toThrow("Impossible de récupérer les statistiques");
    });
  });

  // updateUserStats
  describe("updateUserStats", () => {
    it("met à jour les statistiques utilisateur après un scan", async () => {
      const mockUserData = {
        stats: {
          scansCompleted: 5,
          points: 50,
          challengesCompleted: 2,
          level: 1,
          categoriesScanned: { "Plastique": 3 }
        }
      };

      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        data: () => mockUserData
      });

      await service.updateUserStats("Plastique");

      expect(updateDoc).toHaveBeenCalledWith(
        doc(db, 'users', 'test-user-id'),
        expect.objectContaining({
          stats: expect.objectContaining({
            scansCompleted: 6,
            points: 60,
            level: 1,
            categoriesScanned: { "Plastique": 4 }
          })
        })
      );
    });

    it("crée des statistiques pour un nouvel utilisateur", async () => {
      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => false
      });

      await service.updateUserStats("Métal");

      expect(updateDoc).toHaveBeenCalledWith(
        doc(db, 'users', 'test-user-id'),
        expect.objectContaining({
          stats: expect.objectContaining({
            scansCompleted: 1,
            points: 10,
            level: 1,
            categoriesScanned: { "Métal": 1 }
          })
        })
      );
    });

    it("calcule correctement le niveau basé sur les points", async () => {
      const mockUserData = {
        stats: {
          scansCompleted: 95,
          points: 950,
          challengesCompleted: 10,
          level: 9,
          categoriesScanned: { "Plastique": 50 }
        }
      };

      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        data: () => mockUserData
      });

      await service.updateUserStats("Plastique");

      expect(updateDoc).toHaveBeenCalledWith(
        doc(db, 'users', 'test-user-id'),
        expect.objectContaining({
          stats: expect.objectContaining({
            scansCompleted: 96,
            points: 960,
            level: 10 // 960 points / 100 + 1 = 10
          })
        })
      );
    });
  });

  // deleteImage
  describe("deleteImage", () => {
    it("supprime une image avec succès", async () => {
      const mockImageRef = {};
      (ref as jest.Mock).mockReturnValue(mockImageRef);
      (deleteObject as jest.Mock).mockResolvedValue(undefined);

      await service.deleteImage("https://example.com/image.jpg");

      expect(ref).toHaveBeenCalledWith(storage, "https://example.com/image.jpg");
      expect(deleteObject).toHaveBeenCalledWith(mockImageRef);
    });

    it("gère les erreurs lors de la suppression", async () => {
      (deleteObject as jest.Mock).mockRejectedValue(new Error("Storage error"));

      await expect(service.deleteImage("invalid-url")).rejects.toThrow("Impossible de supprimer l'image");
    });
  });

  // deleteScanResult
  describe("deleteScanResult", () => {
    it("supprime un résultat de scan avec son image", async () => {
      const mockScanData = {
        imageUrl: "https://example.com/image.jpg"
      };
      const mockImageRef = {};

      (getDoc as jest.Mock).mockResolvedValue({
        exists: () => true,
        data: () => mockScanData
      });
      (ref as jest.Mock).mockReturnValue(mockImageRef);
      (deleteObject as jest.Mock).mockResolvedValue(undefined);

      await service.deleteScanResult("scan123");

      expect(ref).toHaveBeenCalledWith(storage, "https://example.com/image.jpg");
      expect(deleteObject).toHaveBeenCalledWith(mockImageRef);
      expect(updateDoc).toHaveBeenCalledWith(
        doc(db, 'scanResults', 'scan123'),
        { deleted: true }
      );
    });

    it("gère les erreurs lors de la suppression", async () => {
      (getDoc as jest.Mock).mockRejectedValue(new Error("Database error"));

      await expect(service.deleteScanResult("scan123")).rejects.toThrow("Impossible de supprimer le scan");
    });
  });

  // getGlobalStats
  describe("getGlobalStats", () => {
    it("récupère les statistiques globales", async () => {
      const mockDocs = [
        {
          data: () => ({
            wasteCategory: "Plastique",
            confidence: 0.9,
            deleted: false
          })
        },
        {
          data: () => ({
            wasteCategory: "Métal",
            confidence: 0.8,
            deleted: false
          })
        },
        {
          data: () => ({
            wasteCategory: "Plastique",
            confidence: 0.7,
            deleted: false
          })
        },
        {
          data: () => ({
            wasteCategory: "Papier",
            confidence: 0.6,
            deleted: true // Ignoré
          })
        }
      ];

      (getDocs as jest.Mock).mockResolvedValue({
        forEach: (callback: any) => mockDocs.forEach(callback)
      });

      const result = await service.getGlobalStats();

      expect(result.totalScans).toBe(3);
      expect(result.mostScannedCategory).toBe("Plastique");
      expect(result.averageConfidence).toBeCloseTo(0.8, 1);
    });

    it("gère les erreurs lors de la récupération des stats globales", async () => {
      (getDocs as jest.Mock).mockRejectedValue(new Error("Database error"));

      await expect(service.getGlobalStats()).rejects.toThrow("Impossible de récupérer les statistiques globales");
    });

    it("retourne des valeurs par défaut quand aucun scan n'existe", async () => {
      (getDocs as jest.Mock).mockResolvedValue({
        forEach: () => []
      });

      const result = await service.getGlobalStats();

      expect(result.totalScans).toBe(0);
      expect(result.mostScannedCategory).toBe("Plastique");
      expect(result.averageConfidence).toBe(0);
    });
  });
}); 