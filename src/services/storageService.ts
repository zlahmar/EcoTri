import { doc, setDoc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { auth } from '../../firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types pour le stockage
export interface ScanStats {
  userId: string;
  wasteCategory: string;
  confidence: number;
  timestamp?: Date;
}

export interface UserStats {
  scansCompleted: number;
  points: number;
  challengesCompleted: number;
  level: number;
  lastScanDate?: Date | null;
  categoriesScanned: { [category: string]: number };
  currentStreak: number;
  bestStreak: number;
  weeklyScans: number;
  monthlyScans: number;
  categoryStats: { [category: string]: number };
}

class StorageService {
  // Sauvegarde seulement les statistiques de scan (pour la gamification)
  async saveScanStats(scanStats: ScanStats): Promise<void> {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        throw new Error('Utilisateur non authentifié');
      }

      // Simulation de la sauvegarde des stats
      console.log(' Sauvegarde des statistiques de scan:', {
        userId,
        wasteCategory: scanStats.wasteCategory,
        confidence: scanStats.confidence,
      });

      // Simulation d'un délai de sauvegarde
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Mise à jour des statistiques utilisateur
      await this.updateUserStats(scanStats.wasteCategory);
      
      console.log(' Statistiques mises à jour avec succès !');

      // Version complète pour la production :
      // Pas besoin de sauvegarder les détails du scan, juste mettre à jour les stats
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des statistiques:', error);
      throw new Error('Impossible de sauvegarder les statistiques');
    }
  }



  // Récupération des statistiques d'un utilisateur
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
          currentStreak: userData.stats?.currentStreak || 0,
          bestStreak: userData.stats?.bestStreak || 0,
          weeklyScans: userData.stats?.weeklyScans || 0,
          monthlyScans: userData.stats?.monthlyScans || 0,
          categoryStats: userData.stats?.categoryStats || {
            Plastique: 0,
            Métal: 0,
            Papier: 0,
            Verre: 0,
            Carton: 0,
            Autre: 0,
          },
        };
      } else {
        // Création des stats par défaut
        const defaultStats: UserStats = {
          scansCompleted: 0,
          points: 0,
          challengesCompleted: 0,
          level: 1,
          categoriesScanned: {},
          currentStreak: 0,
          bestStreak: 0,
          weeklyScans: 0,
          monthlyScans: 0,
          categoryStats: {
            Plastique: 0,
            Métal: 0,
            Papier: 0,
            Verre: 0,
            Carton: 0,
            Autre: 0,
          },
        };
        
        await setDoc(doc(db, 'users', userId), { stats: defaultStats });
        return defaultStats;
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des stats:', error);
      throw new Error('Impossible de récupérer les statistiques');
    }
  }

  // Mise à jour des statistiques utilisateur après un scan (avec persistance locale)
  async updateUserStats(wasteCategory: string): Promise<void> {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      // Récupération des stats actuelles depuis AsyncStorage
      const statsKey = `user_stats_${userId}`;
      const currentStatsJson = await AsyncStorage.getItem(statsKey);
      
      let currentStats: UserStats;
      if (currentStatsJson) {
        currentStats = JSON.parse(currentStatsJson);
      } else {
        currentStats = {
          scansCompleted: 0,
          points: 0,
          challengesCompleted: 0,
          level: 1,
          categoriesScanned: {},
          weeklyScans: 0,
          monthlyScans: 0,
          currentStreak: 0,
          bestStreak: 0,
          lastScanDate: null,
          categoryStats: {
            Plastique: 0,
            Métal: 0,
            Papier: 0,
            Verre: 0,
            Carton: 0,
            Autre: 0
          }
        };
      }

      // Calcul de la série (streak)
      const today = new Date();
      const lastScan = currentStats.lastScanDate ? new Date(currentStats.lastScanDate) : null;
      let newStreak = currentStats.currentStreak;
      
      if (lastScan) {
        const daysDiff = Math.floor((today.getTime() - lastScan.getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff === 1) {
          // Scan le jour suivant, continuer la série
          newStreak = currentStats.currentStreak + 1;
        } else if (daysDiff > 1) {
          newStreak = 1;
        }
      } else {
        newStreak = 1;
      }

      // Pour simplifier, on incrémente juste les compteurs (dans un vrai cas, on analyserait l'historique)
      const weeklyScans = Math.min((currentStats.weeklyScans || 0) + 1, 50);
      const monthlyScans = Math.min((currentStats.monthlyScans || 0) + 1, 200);

      // Mise à jour des statistiques
      const updatedStats: UserStats = {
        ...currentStats,
        scansCompleted: currentStats.scansCompleted + 1,
        points: currentStats.points + 10,
        lastScanDate: today,
        currentStreak: newStreak,
        bestStreak: Math.max(currentStats.bestStreak || 0, newStreak),
        weeklyScans,
        monthlyScans,
        categoriesScanned: {
          ...currentStats.categoriesScanned,
          [wasteCategory]: (currentStats.categoriesScanned[wasteCategory] || 0) + 1,
        },
        categoryStats: {
          ...currentStats.categoryStats,
          [wasteCategory]: (currentStats.categoryStats?.[wasteCategory] || 0) + 1,
        }
      };

      // Calcul du niveau basé sur les points
      updatedStats.level = Math.floor(updatedStats.points / 100) + 1;

      // Sauvegarde dans AsyncStorage
      await AsyncStorage.setItem(statsKey, JSON.stringify(updatedStats));

      console.log('Stats mises à jour et sauvegardées:');
      console.log(`  - Catégorie: ${wasteCategory}`);
      console.log(`  - Total scans: ${updatedStats.scansCompleted}`);
      console.log(`  - Total points: ${updatedStats.points}`);
      console.log(`  - Niveau: ${updatedStats.level}`);

      // Sauvegarde dans Firestore pour synchronisation (optionnel)
      try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, { stats: updatedStats });
        console.log(' Stats aussi sauvegardées dans Firestore');
      } catch {
        console.log('Firestore non disponible, stats sauvées localement seulement');
      }

    } catch (error) {
      console.error('Erreur lors de la mise à jour des stats:', error);
    }
  }


}

export const storageService = new StorageService();
export default storageService; 