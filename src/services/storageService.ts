import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { doc, setDoc, updateDoc, getDoc, collection, addDoc, query, where, orderBy, getDocs } from 'firebase/firestore';
import { storage, db } from '../../firebaseConfig';
import { auth } from '../../firebaseConfig';

// Types pour le stockage
export interface ScanResult {
  id?: string;
  userId: string;
  imageUrl: string;
  wasteCategory: string;
  confidence: number;
  alternatives: string[];
  labels: string[];
  objects: string[];
  timestamp: Date;
  location?: {
    latitude: number;
    longitude: number;
  };
  deleted?: boolean;
}

export interface UserStats {
  scansCompleted: number;
  points: number;
  challengesCompleted: number;
  level: number;
  lastScanDate?: Date;
  categoriesScanned: { [category: string]: number };
}

class StorageService {
  /**
   * Sauvegarde une image dans Firebase Storage
   */
  async uploadImage(imageUri: string, userId: string): Promise<string> {
    try {
      const response = await fetch(imageUri);
      const blob = await response.blob();
      
      const imageRef = ref(storage, `scanImages/${userId}/${Date.now()}.jpg`);
      await uploadBytes(imageRef, blob);
      
      const downloadURL = await getDownloadURL(imageRef);
      return downloadURL;
    } catch (error) {
      console.error('Erreur lors de l\'upload de l\'image:', error);
      throw new Error('Impossible de sauvegarder l\'image');
    }
  }

  /**
   * Sauvegarde un résultat de scan dans Firestore
   */
  async saveScanResult(scanResult: Omit<ScanResult, 'id' | 'timestamp'>): Promise<string> {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        throw new Error('Utilisateur non authentifié');
      }

      const scanData = {
        ...scanResult,
        userId,
        timestamp: new Date(),
      };

      const docRef = await addDoc(collection(db, 'scanResults'), scanData);
      
      // Mettre à jour les statistiques utilisateur
      await this.updateUserStats(scanResult.wasteCategory);
      
      return docRef.id;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du scan:', error);
      throw new Error('Impossible de sauvegarder le résultat');
    }
  }

  /**
   * Récupère l'historique des scans d'un utilisateur
   */
  async getUserScanHistory(userId: string, limit: number = 20): Promise<ScanResult[]> {
    try {
      const q = query(
        collection(db, 'scanResults'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const scans: ScanResult[] = [];
      
      querySnapshot.forEach((doc) => {
        scans.push({
          id: doc.id,
          ...doc.data()
        } as ScanResult);
      });
      
      return scans.slice(0, limit);
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'historique:', error);
      throw new Error('Impossible de récupérer l\'historique');
    }
  }

  /**
   * Récupère les statistiques d'un utilisateur
   */
  async getUserStats(userId: string): Promise<UserStats> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return {
          scansCompleted: userData.stats?.scansCompleted || 0,
          points: userData.stats?.points || 0,
          challengesCompleted: userData.stats?.challengesCompleted || 0,
          level: userData.stats?.level || 1,
          lastScanDate: userData.stats?.lastScanDate?.toDate(),
          categoriesScanned: userData.stats?.categoriesScanned || {},
        };
      } else {
        // Créer des stats par défaut
        const defaultStats: UserStats = {
          scansCompleted: 0,
          points: 0,
          challengesCompleted: 0,
          level: 1,
          categoriesScanned: {},
        };
        
        await setDoc(doc(db, 'users', userId), { stats: defaultStats });
        return defaultStats;
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des stats:', error);
      throw new Error('Impossible de récupérer les statistiques');
    }
  }

  /**
   * Met à jour les statistiques utilisateur après un scan
   */
  async updateUserStats(wasteCategory: string): Promise<void> {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      let currentStats: UserStats;
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        currentStats = {
          scansCompleted: userData.stats?.scansCompleted || 0,
          points: userData.stats?.points || 0,
          challengesCompleted: userData.stats?.challengesCompleted || 0,
          level: userData.stats?.level || 1,
          categoriesScanned: userData.stats?.categoriesScanned || {},
        };
      } else {
        currentStats = {
          scansCompleted: 0,
          points: 0,
          challengesCompleted: 0,
          level: 1,
          categoriesScanned: {},
        };
      }

      // Mettre à jour les stats
      const updatedStats: UserStats = {
        ...currentStats,
        scansCompleted: currentStats.scansCompleted + 1,
        points: currentStats.points + 10, // 10 points par scan
        lastScanDate: new Date(),
        categoriesScanned: {
          ...currentStats.categoriesScanned,
          [wasteCategory]: (currentStats.categoriesScanned[wasteCategory] || 0) + 1,
        },
      };

      // Calculer le niveau basé sur les points
      updatedStats.level = Math.floor(updatedStats.points / 100) + 1;

      await updateDoc(userRef, { stats: updatedStats });
    } catch (error) {
      console.error('Erreur lors de la mise à jour des stats:', error);
    }
  }

  /**
   * Supprime une image du storage
   */
  async deleteImage(imageUrl: string): Promise<void> {
    try {
      const imageRef = ref(storage, imageUrl);
      await deleteObject(imageRef);
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'image:', error);
      throw new Error('Impossible de supprimer l\'image');
    }
  }

  /**
   * Supprime un résultat de scan
   */
  async deleteScanResult(scanId: string): Promise<void> {
    try {
      const scanDoc = await getDoc(doc(db, 'scanResults', scanId));
      
      if (scanDoc.exists()) {
        const scanData = scanDoc.data() as ScanResult;
        
        // Supprimer l'image associée
        if (scanData.imageUrl) {
          await this.deleteImage(scanData.imageUrl);
        }
        
        // Supprimer le document
        await updateDoc(doc(db, 'scanResults', scanId), { deleted: true });
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du scan:', error);
      throw new Error('Impossible de supprimer le scan');
    }
  }

  /**
   * Récupère les statistiques globales de l'application
   */
  async getGlobalStats(): Promise<{
    totalScans: number;
    mostScannedCategory: string;
    averageConfidence: number;
  }> {
    try {
      const scansQuery = query(collection(db, 'scanResults'));
      const querySnapshot = await getDocs(scansQuery);
      
      let totalScans = 0;
      let totalConfidence = 0;
      const categoryCounts: { [category: string]: number } = {};
      
      querySnapshot.forEach((doc) => {
        const data = doc.data() as ScanResult;
        if (!data.deleted) {
          totalScans++;
          totalConfidence += data.confidence;
          categoryCounts[data.wasteCategory] = (categoryCounts[data.wasteCategory] || 0) + 1;
        }
      });
      
      const mostScannedCategory = Object.entries(categoryCounts)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Plastique';
      
      return {
        totalScans,
        mostScannedCategory,
        averageConfidence: totalScans > 0 ? totalConfidence / totalScans : 0,
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des stats globales:', error);
      throw new Error('Impossible de récupérer les statistiques globales');
    }
  }
}

export const storageService = new StorageService();
export default storageService; 