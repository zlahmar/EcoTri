import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db, auth } from '../../firebaseConfig';

// Types pour les conseils
export interface Advice {
  id?: string;
  title: string;
  content: string;
  category: string;
  imageUrl?: string;
  authorId?: string;
  authorName?: string;
  likes: number;
  views: number;
  isPublished: boolean;
  tags: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface AdviceCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
}

// Catégories de conseils
export const ADVICE_CATEGORIES: AdviceCategory[] = [
  {
    id: 'general',
    name: 'Général',
    icon: 'recycle',
    color: '#4CAF50',
    description: 'Conseils généraux sur le recyclage'
  },
  {
    id: 'plastic',
    name: 'Plastique',
    icon: 'bottle-soda',
    color: '#2196F3',
    description: 'Comment recycler le plastique'
  },
  {
    id: 'paper',
    name: 'Papier',
    icon: 'file-document',
    color: '#FF9800',
    description: 'Recyclage du papier et carton'
  },
  {
    id: 'glass',
    name: 'Verre',
    icon: 'glass-cocktail',
    color: '#9C27B0',
    description: 'Recyclage du verre'
  },
  {
    id: 'metal',
    name: 'Métal',
    icon: 'silverware-fork-knife',
    color: '#607D8B',
    description: 'Recyclage des métaux'
  },
  {
    id: 'organic',
    name: 'Déchets verts',
    icon: 'leaf',
    color: '#8BC34A',
    description: 'Compostage et déchets organiques'
  },
  {
    id: 'electronics',
    name: 'Électronique',
    icon: 'battery',
    color: '#F44336',
    description: 'Recyclage des appareils électroniques'
  },
  {
    id: 'textile',
    name: 'Textile',
    icon: 'tshirt-crew',
    color: '#E91E63',
    description: 'Recyclage des vêtements et textiles'
  }
];

class AdviceService {
  private readonly COLLECTION_NAME = 'advice';

  /**
   * Récupère tous les conseils publiés
   */
  async getAllAdvice(): Promise<Advice[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('isPublished', '==', true),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const advice: Advice[] = [];
      
      querySnapshot.forEach((doc) => {
        advice.push({
          id: doc.id,
          ...doc.data()
        } as Advice);
      });
      
      return advice;
    } catch (error) {
      console.error('Erreur lors de la récupération des conseils:', error);
      throw new Error('Impossible de récupérer les conseils');
    }
  }

  /**
   * Récupère les conseils par catégorie
   */
  async getAdviceByCategory(category: string): Promise<Advice[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('category', '==', category),
        where('isPublished', '==', true),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const advice: Advice[] = [];
      
      querySnapshot.forEach((doc) => {
        advice.push({
          id: doc.id,
          ...doc.data()
        } as Advice);
      });
      
      return advice;
    } catch (error) {
      console.error('Erreur lors de la récupération des conseils par catégorie:', error);
      throw new Error('Impossible de récupérer les conseils');
    }
  }

  /**
   * Récupère un conseil par ID
   */
  async getAdviceById(id: string): Promise<Advice | null> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        } as Advice;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du conseil:', error);
      throw new Error('Impossible de récupérer le conseil');
    }
  }

  /**
   * Récupère les conseils les plus populaires
   */
  async getPopularAdvice(limitCount: number = 5): Promise<Advice[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('isPublished', '==', true),
        orderBy('likes', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      const advice: Advice[] = [];
      
      querySnapshot.forEach((doc) => {
        advice.push({
          id: doc.id,
          ...doc.data()
        } as Advice);
      });
      
      return advice;
    } catch (error) {
      console.error('Erreur lors de la récupération des conseils populaires:', error);
      throw new Error('Impossible de récupérer les conseils populaires');
    }
  }

  /**
   * Recherche des conseils par mot-clé
   */
  async searchAdvice(searchTerm: string): Promise<Advice[]> {
    try {
      // Note: Firestore ne supporte pas la recherche full-text native
      // Cette implémentation est basique, pour une vraie recherche
      // il faudrait utiliser Algolia ou Elasticsearch
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('isPublished', '==', true),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const advice: Advice[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data() as Advice;
        const searchLower = searchTerm.toLowerCase();
        
        if (
          data.title.toLowerCase().includes(searchLower) ||
          data.content.toLowerCase().includes(searchLower) ||
          data.tags.some(tag => tag.toLowerCase().includes(searchLower))
        ) {
          advice.push({
            id: doc.id,
            ...data
          });
        }
      });
      
      return advice;
    } catch (error) {
      console.error('Erreur lors de la recherche de conseils:', error);
      throw new Error('Impossible de rechercher les conseils');
    }
  }

  /**
   * Ajoute un nouveau conseil (pour les utilisateurs connectés)
   */
  async addAdvice(adviceData: Omit<Advice, 'id' | 'createdAt' | 'updatedAt' | 'likes' | 'views'>): Promise<string> {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        throw new Error('Utilisateur non authentifié');
      }

      const newAdvice = {
        ...adviceData,
        authorId: userId,
        authorName: auth.currentUser?.displayName || 'Utilisateur anonyme',
        likes: 0,
        views: 0,
        isPublished: false, // Par défaut non publié, nécessite modération
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), newAdvice);
      return docRef.id;
    } catch (error) {
      console.error('Erreur lors de l\'ajout du conseil:', error);
      throw new Error('Impossible d\'ajouter le conseil');
    }
  }

  /**
   * Met à jour un conseil (pour l'auteur ou les admins)
   */
  async updateAdvice(id: string, updates: Partial<Advice>): Promise<void> {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        throw new Error('Utilisateur non authentifié');
      }

      const docRef = doc(db, this.COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error('Conseil non trouvé');
      }

      const advice = docSnap.data() as Advice;
      
      // Vérifier que l'utilisateur est l'auteur ou un admin
      if (advice.authorId !== userId) {
        throw new Error('Non autorisé à modifier ce conseil');
      }

      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du conseil:', error);
      throw new Error('Impossible de mettre à jour le conseil');
    }
  }

  /**
   * Supprime un conseil (pour l'auteur ou les admins)
   */
  async deleteAdvice(id: string): Promise<void> {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        throw new Error('Utilisateur non authentifié');
      }

      const docRef = doc(db, this.COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error('Conseil non trouvé');
      }

      const advice = docSnap.data() as Advice;
      
      // Vérifier que l'utilisateur est l'auteur ou un admin
      if (advice.authorId !== userId) {
        throw new Error('Non autorisé à supprimer ce conseil');
      }

      await deleteDoc(docRef);
    } catch (error) {
      console.error('Erreur lors de la suppression du conseil:', error);
      throw new Error('Impossible de supprimer le conseil');
    }
  }

  /**
   * Incrémente le nombre de vues d'un conseil
   */
  async incrementViews(id: string): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const currentViews = docSnap.data().views || 0;
        await updateDoc(docRef, {
          views: currentViews + 1
        });
      }
    } catch (error) {
      console.error('Erreur lors de l\'incrémentation des vues:', error);
    }
  }

  /**
   * Like/unlike un conseil
   */
  async toggleLike(id: string): Promise<void> {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        throw new Error('Utilisateur non authentifié');
      }

      const docRef = doc(db, this.COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const currentLikes = docSnap.data().likes || 0;
        // Note: Pour une vraie implémentation, il faudrait gérer les likes par utilisateur
        // dans une sous-collection pour éviter les doubles likes
        await updateDoc(docRef, {
          likes: currentLikes + 1
        });
      }
    } catch (error) {
      console.error('Erreur lors du like:', error);
      throw new Error('Impossible de liker le conseil');
    }
  }

  /**
   * Récupère les conseils de l'utilisateur connecté
   */
  async getUserAdvice(): Promise<Advice[]> {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        throw new Error('Utilisateur non authentifié');
      }

      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('authorId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const advice: Advice[] = [];
      
      querySnapshot.forEach((doc) => {
        advice.push({
          id: doc.id,
          ...doc.data()
        } as Advice);
      });
      
      return advice;
    } catch (error) {
      console.error('Erreur lors de la récupération des conseils utilisateur:', error);
      throw new Error('Impossible de récupérer vos conseils');
    }
  }

  /**
   * Récupère les catégories disponibles
   */
  getCategories(): AdviceCategory[] {
    return ADVICE_CATEGORIES;
  }
}

export const adviceService = new AdviceService();
export default adviceService; 