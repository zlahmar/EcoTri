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
import AsyncStorage from '@react-native-async-storage/async-storage';

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

export interface DailyAdvice {
  date: string; // Format YYYY-MM-DD
  advice: Advice;
  isRead: boolean;
}

export interface FavoriteAdvice {
  adviceId: string;
  advice: Advice;
  savedAt: Date;
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

// Conseils prédéfinis par catégorie
export const PREDEFINED_ADVICE: Record<string, Omit<Advice, 'id' | 'createdAt' | 'updatedAt' | 'likes' | 'views' | 'authorId' | 'authorName' | 'isPublished'>[]> = {
  general: [
    {
      title: "Les 3 R du recyclage",
      content: "Réduire, Réutiliser, Recycler. Commencez par réduire vos déchets, puis réutilisez ce qui peut l'être, et enfin recyclez le reste. C'est la base d'un mode de vie éco-responsable.",
      category: 'general',
      tags: ['débutant', 'bases', 'éco-responsable'],
      imageUrl: undefined
    },
    {
      title: "Organiser son tri à la maison",
      content: "Créez des bacs de tri clairement identifiés dans votre cuisine. Utilisez des couleurs différentes : vert pour le verre, bleu pour le papier, jaune pour le plastique et métal.",
      category: 'general',
      tags: ['organisation', 'maison', 'tri'],
      imageUrl: undefined
    },
    {
      title: "Vérifier les consignes locales",
      content: "Les consignes de tri varient selon votre commune. Renseignez-vous auprès de votre mairie ou sur le site de votre collectivité pour connaître les règles spécifiques.",
      category: 'general',
      tags: ['local', 'règles', 'commune'],
      imageUrl: undefined
    }
  ],
  plastic: [
    {
      title: "Identifier les plastiques recyclables",
      content: "Regardez le symbole de recyclage (triangle avec flèches) et le numéro à l'intérieur. Les bouteilles et flacons (PET et PEHD) sont généralement recyclables.",
      category: 'plastic',
      tags: ['identification', 'bouteilles', 'symboles'],
      imageUrl: undefined
    },
    {
      title: "Nettoyer avant de recycler",
      content: "Rincez vos emballages plastiques avant de les jeter. Un emballage sale peut contaminer tout le lot et empêcher le recyclage.",
      category: 'plastic',
      tags: ['nettoyage', 'rinçage', 'contamination'],
      imageUrl: undefined
    },
    {
      title: "Éviter les plastiques non recyclables",
      content: "Les films plastiques, sacs fins, et certains emballages complexes ne sont pas recyclables. Privilégiez les emballages simples et identifiables.",
      category: 'plastic',
      tags: ['films', 'sacs', 'non-recyclable'],
      imageUrl: undefined
    }
  ],
  paper: [
    {
      title: "Trier le papier et carton",
      content: "Jetez dans le bac papier : journaux, magazines, cartons plats, enveloppes. Évitez le papier gras, les papiers spéciaux (papier photo, papier peint).",
      category: 'paper',
      tags: ['journaux', 'magazines', 'cartons'],
      imageUrl: undefined
    },
    {
      title: "Aplatir les cartons",
      content: "Pliez et aplatissez vos cartons pour optimiser l'espace dans le bac de recyclage. Cela facilite aussi le transport et le traitement.",
      category: 'paper',
      tags: ['cartons', 'espace', 'transport'],
      imageUrl: undefined
    },
    {
      title: "Éviter le papier souillé",
      content: "Le papier taché de graisse, peint ou avec du scotch ne peut pas être recyclé. Mettez-le dans les ordures ménagères.",
      category: 'paper',
      tags: ['souillé', 'graisse', 'scotch'],
      imageUrl: undefined
    }
  ],
  glass: [
    {
      title: "Recycler le verre d'emballage",
      content: "Seul le verre d'emballage (bouteilles, pots, bocaux) est recyclable. La vaisselle, les miroirs et les vitres vont aux déchetteries.",
      category: 'glass',
      tags: ['emballage', 'bouteilles', 'pots'],
      imageUrl: undefined
    },
    {
      title: "Pas besoin de laver le verre",
      content: "Contrairement au plastique, le verre n'a pas besoin d'être rincé avant recyclage. Le processus de recyclage nettoie automatiquement le verre.",
      category: 'glass',
      tags: ['nettoyage', 'processus', 'automatique'],
      imageUrl: undefined
    },
    {
      title: "Retirer les bouchons",
      content: "Retirez les bouchons et couvercles avant de jeter le verre. Ils sont souvent en métal ou plastique et ont leur propre filière de recyclage.",
      category: 'glass',
      tags: ['bouchons', 'couvercles', 'métal'],
      imageUrl: undefined
    }
  ],
  metal: [
    {
      title: "Recycler les emballages métalliques",
      content: "Boîtes de conserve, canettes, aérosols vides, barquettes en aluminium : tous ces emballages métalliques sont recyclables à l'infini.",
      category: 'metal',
      tags: ['boîtes', 'canettes', 'aluminium'],
      imageUrl: undefined
    },
    {
      title: "Vider et rincer les conserves",
      content: "Videz complètement vos boîtes de conserve et rincez-les légèrement. Cela évite les mauvaises odeurs et facilite le recyclage.",
      category: 'metal',
      tags: ['conserves', 'rinçage', 'odeurs'],
      imageUrl: undefined
    },
    {
      title: "Les aérosols vides",
      content: "Les aérosols vides (déodorants, produits ménagers) sont recyclables. Assurez-vous qu'ils sont complètement vides avant de les jeter.",
      category: 'metal',
      tags: ['aérosols', 'déodorants', 'vide'],
      imageUrl: undefined
    }
  ],
  organic: [
    {
      title: "Composter les déchets verts",
      content: "Épluchures de fruits et légumes, marc de café, coquilles d'œufs, feuilles mortes : tous ces déchets organiques peuvent être compostés.",
      category: 'organic',
      tags: ['compost', 'épluchures', 'marque de café'],
      imageUrl: undefined
    },
    {
      title: "Éviter les déchets cuits",
      content: "Les restes de repas cuits, viandes et poissons ne doivent pas aller au compost domestique. Ils peuvent attirer les nuisibles.",
      category: 'organic',
      tags: ['restes', 'viande', 'nuisibles'],
      imageUrl: undefined
    },
    {
      title: "Utiliser le compost",
      content: "Le compost mûr (après 6-12 mois) peut être utilisé comme engrais naturel pour vos plantes et votre jardin.",
      category: 'organic',
      tags: ['engrais', 'jardin', 'plantes'],
      imageUrl: undefined
    }
  ],
  electronics: [
    {
      title: "Recycler les petits appareils",
      content: "Téléphones, ordinateurs, petits électroménagers : déposez-les en magasin ou en déchetterie. Ils contiennent des métaux précieux récupérables.",
      category: 'electronics',
      tags: ['téléphones', 'ordinateurs', 'métaux précieux'],
      imageUrl: undefined
    },
    {
      title: "Les piles et batteries",
      content: "Les piles et batteries ne doivent jamais aller à la poubelle. Déposez-les dans les points de collecte en magasin ou en déchetterie.",
      category: 'electronics',
      tags: ['piles', 'batteries', 'points de collecte'],
      imageUrl: undefined
    },
    {
      title: "Effacer les données",
      content: "Avant de recycler un appareil électronique, supprimez toutes vos données personnelles pour protéger votre vie privée.",
      category: 'electronics',
      tags: ['données', 'sécurité', 'vie privée'],
      imageUrl: undefined
    }
  ],
  textile: [
    {
      title: "Donner les vêtements en bon état",
      content: "Les vêtements en bon état peuvent être donnés à des associations ou déposés dans les bornes de collecte. Ils auront une seconde vie.",
      category: 'textile',
      tags: ['don', 'associations', 'seconde vie'],
      imageUrl: undefined
    },
    {
      title: "Recycler les textiles usés",
      content: "Même les vêtements usés ou déchirés peuvent être recyclés. Ils sont transformés en chiffons industriels ou en isolant.",
      category: 'textile',
      tags: ['usés', 'chiffons', 'isolant'],
      imageUrl: undefined
    },
    {
      title: "Préparer les textiles",
      content: "Lavez et séchez vos textiles avant de les donner. Mettez-les dans un sac fermé pour éviter qu'ils se salissent pendant le transport.",
      category: 'textile',
      tags: ['lavage', 'séchage', 'transport'],
      imageUrl: undefined
    }
  ]
};

export class AdviceService {
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

  /**
   * Récupère les conseils prédéfinis par catégorie
   */
  getPredefinedAdvice(): Record<string, Advice[]> {
    const predefinedAdvice: Record<string, Advice[]> = {};
    
    Object.keys(PREDEFINED_ADVICE).forEach(category => {
      predefinedAdvice[category] = PREDEFINED_ADVICE[category].map((advice, index) => ({
        ...advice,
        id: `predefined-${category}-${index}`,
        authorName: 'EcoTri',
        likes: Math.floor(Math.random() * 50) + 10,
        views: Math.floor(Math.random() * 200) + 50,
        isPublished: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      }));
    });
    
    return predefinedAdvice;
  }

  /**
   * Récupère les conseils prédéfinis d'une catégorie spécifique
   */
  getPredefinedAdviceByCategory(category: string): Advice[] {
    const predefinedAdvice = this.getPredefinedAdvice();
    return predefinedAdvice[category] || [];
  }

  // ========== CONSEIL QUOTIDIEN ==========

  /**
   * Obtient la date actuelle au format YYYY-MM-DD
   */
  private getTodayDateString(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  /**
   * Génère un conseil quotidien basé sur la date
   */
  getDailyAdvice(): DailyAdvice {
    const today = this.getTodayDateString();
    const allAdvice = this.getAllAdviceForDaily();
    
    // Utilise la date comme seed pour avoir toujours le même conseil pour la même journée
    const daysSinceEpoch = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
    const adviceIndex = daysSinceEpoch % allAdvice.length;
    const selectedAdvice = allAdvice[adviceIndex];

    return {
      date: today,
      advice: selectedAdvice,
      isRead: false
    };
  }

  /**
   * Récupère tous les conseils disponibles pour le système quotidien
   */
  private getAllAdviceForDaily(): Advice[] {
    const predefinedAdvice = this.getPredefinedAdvice();
    const allAdvice: Advice[] = [];
    
    Object.values(predefinedAdvice).forEach(categoryAdvice => {
      allAdvice.push(...categoryAdvice);
    });
    
    return allAdvice;
  }

  /**
   * Vérifie si c'est l'heure du conseil quotidien (midi)
   */
  isDailyAdviceTime(): boolean {
    const now = new Date();
    const currentHour = now.getHours();
    return currentHour >= 12; // Disponible à partir de midi
  }

  /**
   * Obtient le temps restant avant le prochain conseil (en minutes)
   */
  getTimeUntilNextAdvice(): number {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    if (currentHour < 12) {
      // Avant midi aujourd'hui
      return (12 - currentHour) * 60 - currentMinute;
    } else {
      // Après midi, prochain conseil demain à midi
      const minutesUntilMidnight = (24 - currentHour) * 60 - currentMinute;
      return minutesUntilMidnight + (12 * 60); // + 12h pour midi le lendemain
    }
  }

  // ========== FAVORIS ==========

  /**
   * Ajoute un conseil aux favoris
   */
  async addToFavorites(advice: Advice): Promise<void> {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        throw new Error('Utilisateur non connecté');
      }

      const favorites = await this.getFavorites();
      const isAlreadyFavorite = favorites.some(fav => fav.adviceId === advice.id);
      
      if (isAlreadyFavorite) {
        throw new Error('Ce conseil est déjà dans vos favoris');
      }

      const newFavorite: FavoriteAdvice = {
        adviceId: advice.id || '',
        advice,
        savedAt: new Date()
      };

      favorites.push(newFavorite);
      await AsyncStorage.setItem(`favorites_${userId}`, JSON.stringify(favorites));
      
      console.log('💖 Conseil ajouté aux favoris:', advice.title);
    } catch (error) {
      console.error('Erreur lors de l\'ajout aux favoris:', error);
      throw error;
    }
  }

  /**
   * Supprime un conseil des favoris
   */
  async removeFromFavorites(adviceId: string): Promise<void> {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        throw new Error('Utilisateur non connecté');
      }

      const favorites = await this.getFavorites();
      const updatedFavorites = favorites.filter(fav => fav.adviceId !== adviceId);
      
      await AsyncStorage.setItem(`favorites_${userId}`, JSON.stringify(updatedFavorites));
      
      console.log('💔 Conseil supprimé des favoris:', adviceId);
    } catch (error) {
      console.error('Erreur lors de la suppression des favoris:', error);
      throw error;
    }
  }

  /**
   * Récupère la liste des favoris
   */
  async getFavorites(): Promise<FavoriteAdvice[]> {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        return [];
      }

      const favoritesJson = await AsyncStorage.getItem(`favorites_${userId}`);
      if (!favoritesJson) {
        return [];
      }

      const favorites = JSON.parse(favoritesJson);
      // Convertir les dates string en objets Date
      return favorites.map((fav: any) => ({
        ...fav,
        savedAt: new Date(fav.savedAt)
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des favoris:', error);
      return [];
    }
  }

  /**
   * Vérifie si un conseil est dans les favoris
   */
  async isFavorite(adviceId: string): Promise<boolean> {
    try {
      const favorites = await this.getFavorites();
      return favorites.some(fav => fav.adviceId === adviceId);
    } catch (error) {
      console.error('Erreur lors de la vérification des favoris:', error);
      return false;
    }
  }
}

export const adviceService = new AdviceService();
export default AdviceService; 