// Mocks
jest.mock('firebase/firestore');
jest.mock('../../firebaseConfig');
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

import AdviceService from '../services/adviceService';

import {
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';

import AsyncStorage from '@react-native-async-storage/async-storage';

describe("AdviceService", () => {
  const service = new AdviceService();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // getAdviceById
  it("récupère un conseil par ID", async () => {
    (getDoc as jest.Mock).mockResolvedValue({
      exists: () => true,
      data: () => ({ 
        title: "Test",
        content: "Contenu",
        category: "general",
        imageUrl: "",
        tags: [],
        isPublished: true,
        likes: 0,
        views: 0,
        createdAt: { seconds: Date.now() / 1000, nanoseconds: 0, toDate: () => new Date(), toMillis: () => Date.now(), isEqual: () => false } as any,
        updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0, toDate: () => new Date(), toMillis: () => Date.now(), isEqual: () => false } as any
      })
    });
    const result = await service.getAdviceById("123");
    expect(result).toBeTruthy();
    expect(result?.title).toBe("Test");
  });

  it("retourne null si le conseil n'existe pas", async () => {
    (getDoc as jest.Mock).mockResolvedValue({ exists: () => false });
    const result = await service.getAdviceById("999");
    expect(result).toBeNull();
  });

  // addAdvice
  it("ajoute un nouveau conseil", async () => {
    const mockAdviceData = {
      title: "Nouveau conseil",
      content: "Contenu du nouveau conseil",
      category: "recyclage",
      imageUrl: "",
      tags: ["eco", "recyclage"],
      isPublished: true
    };

    (addDoc as jest.Mock).mockResolvedValue({ id: "new-id" });
    
    const result = await service.addAdvice(mockAdviceData);
    expect(result).toBe("new-id");
    expect(addDoc).toHaveBeenCalled();
  });

  // updateAdvice
  it("met à jour un conseil existant", async () => {
    (getDoc as jest.Mock).mockResolvedValue({
      exists: () => true,
      data: () => ({ 
        authorId: "test-user-id",
        title: "Ancien titre",
        content: "Ancien contenu",
        category: "general",
        imageUrl: "",
        tags: [],
        isPublished: true,
        likes: 0,
        views: 0,
        createdAt: { seconds: Date.now() / 1000, nanoseconds: 0, toDate: () => new Date(), toMillis: () => Date.now(), isEqual: () => false } as any,
        updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0, toDate: () => new Date(), toMillis: () => Date.now(), isEqual: () => false } as any
      })
    });
    
    await service.updateAdvice("123", { title: "Nouveau titre" });
    expect(updateDoc).toHaveBeenCalled();
  });

  // deleteAdvice
  it("supprime un conseil", async () => {
    (getDoc as jest.Mock).mockResolvedValue({
      exists: () => true,
      data: () => ({ 
        authorId: "test-user-id",
        title: "Test",
        content: "Contenu",
        category: "general",
        imageUrl: "",
        tags: [],
        isPublished: true,
        likes: 0,
        views: 0,
        createdAt: { seconds: Date.now() / 1000, nanoseconds: 0, toDate: () => new Date(), toMillis: () => Date.now(), isEqual: () => false } as any,
        updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0, toDate: () => new Date(), toMillis: () => Date.now(), isEqual: () => false } as any
      })
    });
    await service.deleteAdvice("123");
    expect(deleteDoc).toHaveBeenCalled();
  });

  // searchAdvice
  it("recherche dans le titre, contenu ou tags", async () => {
    const docs = [
      { 
        id: "1", 
        data: () => ({ 
          title: "Recycler", 
          content: "plastique", 
          category: "recyclage",
          imageUrl: "",
          tags: [],
          isPublished: true,
          likes: 0,
          views: 0,
          createdAt: { seconds: Date.now() / 1000, nanoseconds: 0, toDate: () => new Date(), toMillis: () => Date.now(), isEqual: () => false } as any,
          updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0, toDate: () => new Date(), toMillis: () => Date.now(), isEqual: () => false } as any
        }) 
      },
      { 
        id: "2", 
        data: () => ({ 
          title: "Papier", 
          content: "pliage", 
          category: "general",
          imageUrl: "",
          tags: ["eco"],
          isPublished: true,
          likes: 0,
          views: 0,
          createdAt: { seconds: Date.now() / 1000, nanoseconds: 0, toDate: () => new Date(), toMillis: () => Date.now(), isEqual: () => false } as any,
          updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0, toDate: () => new Date(), toMillis: () => Date.now(), isEqual: () => false } as any
        }) 
      }
    ];
    (getDocs as jest.Mock).mockResolvedValue({ forEach: (cb: any) => docs.forEach(cb) });
    const result = await service.searchAdvice("recycler");
    expect(result.length).toBe(1);
    expect(result[0].title).toBe("Recycler");
  });

  // incrementViews
  it("incrémente les vues du conseil", async () => {
    (getDoc as jest.Mock).mockResolvedValue({
      exists: () => true,
      data: () => ({ 
        views: 3,
        title: "Test",
        content: "Contenu",
        category: "general",
        imageUrl: "",
        tags: [],
        isPublished: true,
        likes: 0,
        createdAt: { seconds: Date.now() / 1000, nanoseconds: 0, toDate: () => new Date(), toMillis: () => Date.now(), isEqual: () => false } as any,
        updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0, toDate: () => new Date(), toMillis: () => Date.now(), isEqual: () => false } as any
      })
    });
    await service.incrementViews("123");
    expect(updateDoc).toHaveBeenCalled();
  });

  // toggleLike
  it("ajoute un like au conseil", async () => {
    (getDoc as jest.Mock).mockResolvedValue({
      exists: () => true,
      data: () => ({ 
        likes: 7,
        title: "Test",
        content: "Contenu",
        category: "general",
        imageUrl: "",
        tags: [],
        isPublished: true,
        views: 0,
        createdAt: { seconds: Date.now() / 1000, nanoseconds: 0, toDate: () => new Date(), toMillis: () => Date.now(), isEqual: () => false } as any,
        updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0, toDate: () => new Date(), toMillis: () => Date.now(), isEqual: () => false } as any
      })
    });
    await service.toggleLike("123");
    expect(updateDoc).toHaveBeenCalled();
  });

  // getUserAdvice
  it("récupère les conseils de l'utilisateur", async () => {
    const docs = [
      { 
        id: "1", 
        data: () => ({ 
          title: "Perso", 
          authorId: "test-user-id",
          content: "Contenu personnel",
          category: "general",
          imageUrl: "",
          tags: [],
          isPublished: true,
          likes: 0,
          views: 0,
          createdAt: { seconds: Date.now() / 1000, nanoseconds: 0, toDate: () => new Date(), toMillis: () => Date.now(), isEqual: () => false } as any,
          updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0, toDate: () => new Date(), toMillis: () => Date.now(), isEqual: () => false } as any
        }) 
      }
    ];
    (getDocs as jest.Mock).mockResolvedValue({ forEach: (cb: any) => docs.forEach(cb) });
    const result = await service.getUserAdvice();
    expect(result.length).toBe(1);
    expect(result[0].title).toBe("Perso");
  });

  // getAllAdvice
  it("récupère tous les conseils", async () => {
    const docs = [
      { 
        id: "1", 
        data: () => ({ 
          title: "Conseil 1", 
          content: "Contenu 1",
          category: "general",
          imageUrl: "",
          tags: [],
          isPublished: true,
          likes: 0,
          views: 0,
          createdAt: { seconds: Date.now() / 1000, nanoseconds: 0, toDate: () => new Date(), toMillis: () => Date.now(), isEqual: () => false } as any,
          updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0, toDate: () => new Date(), toMillis: () => Date.now(), isEqual: () => false } as any
        }) 
      },
      { 
        id: "2", 
        data: () => ({ 
          title: "Conseil 2", 
          content: "Contenu 2",
          category: "recyclage",
          imageUrl: "",
          tags: [],
          isPublished: true,
          likes: 0,
          views: 0,
          createdAt: { seconds: Date.now() / 1000, nanoseconds: 0, toDate: () => new Date(), toMillis: () => Date.now(), isEqual: () => false } as any,
          updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0, toDate: () => new Date(), toMillis: () => Date.now(), isEqual: () => false } as any
        }) 
      }
    ];
    (getDocs as jest.Mock).mockResolvedValue({ forEach: (cb: any) => docs.forEach(cb) });
    const result = await service.getAllAdvice();
    expect(result.length).toBe(2);
    expect(result[0].title).toBe("Conseil 1");
    expect(result[1].title).toBe("Conseil 2");
  });

  // getCategories
  it("renvoie toutes les catégories disponibles", () => {
    const result = service.getCategories();
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty("id");
  });

  // Tests des favoris
  describe("Gestion des favoris", () => {
    beforeEach(() => {
      // Mock AsyncStorage au lieu de localStorage
      (AsyncStorage.getItem as jest.Mock).mockClear();
      (AsyncStorage.setItem as jest.Mock).mockClear();
    });

    it("récupère la liste des favoris", async () => {
      const mockFavorites = [
        { adviceId: "fav1", advice: { id: "fav1", title: "Favori 1" } as any, savedAt: new Date() },
        { adviceId: "fav2", advice: { id: "fav2", title: "Favori 2" } as any, savedAt: new Date() }
      ];
      
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockFavorites));
      
      const favorites = await service.getFavorites();
      expect(favorites).toHaveLength(2);
      expect(favorites[0].adviceId).toBe("fav1");
      expect(favorites[1].adviceId).toBe("fav2");
    });

    it("retourne une liste vide si pas de favoris", async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      
      const favorites = await service.getFavorites();
      expect(favorites).toEqual([]);
    });

    it("vérifie si un conseil est favori", async () => {
      const mockFavorites = [
        { adviceId: "conseil1", advice: { id: "conseil1" } as any, savedAt: new Date() },
        { adviceId: "conseil2", advice: { id: "conseil2" } as any, savedAt: new Date() }
      ];
      
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockFavorites));
      
      const isFav1 = await service.isFavorite("conseil1");
      const isFav3 = await service.isFavorite("conseil3");
      
      expect(isFav1).toBe(true);
      expect(isFav3).toBe(false);
    });

    it("ajoute un conseil aux favoris", async () => {
      const existingFavorites = [
        { adviceId: "existing", advice: { id: "existing" } as any, savedAt: new Date() }
      ];
      
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(existingFavorites));
      
      const mockAdvice = {
        id: "nouveau",
        title: "Test",
        content: "Content",
        category: "general",
        imageUrl: "",
        tags: [],
        isPublished: true,
        likes: 0,
        views: 0,
        createdAt: { seconds: Date.now() / 1000, nanoseconds: 0, toDate: () => new Date(), toMillis: () => Date.now(), isEqual: () => false } as any,
        updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0, toDate: () => Date.now(), toMillis: () => Date.now(), isEqual: () => false } as any
      };

      await service.addToFavorites(mockAdvice);
      
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });

    it("retire un conseil des favoris", async () => {
      const existingFavorites = [
        { adviceId: "conseil1", advice: { id: "conseil1" } as any, savedAt: new Date() },
        { adviceId: "conseil2", advice: { id: "conseil2" } as any, savedAt: new Date() },
        { adviceId: "conseil3", advice: { id: "conseil3" } as any, savedAt: new Date() }
      ];
      
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(existingFavorites));
      
      await service.removeFromFavorites("conseil2");
      
      expect(AsyncStorage.setItem).toHaveBeenCalled();
      // Vérifie que le bon nombre d'éléments est sauvegardé
      const setItemCall = (AsyncStorage.setItem as jest.Mock).mock.calls[0];
      const savedData = JSON.parse(setItemCall[1]);
      expect(savedData).toHaveLength(2);
      expect(savedData.find((f: any) => f.adviceId === "conseil1")).toBeTruthy();
      expect(savedData.find((f: any) => f.adviceId === "conseil3")).toBeTruthy();
    });

    it("n'ajoute pas un doublon aux favoris", async () => {
      const existingFavorites = [
        { adviceId: "existing", advice: { id: "existing" } as any, savedAt: new Date() }
      ];
      
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(existingFavorites));
      
      const mockAdvice = {
        id: "existing",
        title: "Test",
        content: "Content", 
        category: "general",
        imageUrl: "",
        tags: [],
        isPublished: true,
        likes: 0,
        views: 0,
        createdAt: { seconds: Date.now() / 1000, nanoseconds: 0, toDate: () => new Date(), toMillis: () => Date.now(), isEqual: () => false } as any,
        updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0, toDate: () => Date.now(), toMillis: () => Date.now(), isEqual: () => false } as any
      };

      await expect(service.addToFavorites(mockAdvice)).rejects.toThrow('Ce conseil est déjà dans vos favoris');
    });
  });

  // Tests des méthodes d'aide
  describe("Méthodes utilitaires", () => {
    it("teste les méthodes de base", () => {
      // Test que les méthodes principales existent
      expect(typeof service.getAdviceById).toBe("function");
      expect(typeof service.addAdvice).toBe("function");
      expect(typeof service.searchAdvice).toBe("function");
      expect(typeof service.getFavorites).toBe("function");
    });

    it("gère les erreurs gracieusement", async () => {
      // Test de gestion d'erreur
      (getDoc as jest.Mock).mockRejectedValue(new Error('Database error'));
      
      await expect(service.getAdviceById("invalid-id")).rejects.toThrow('Impossible de récupérer le conseil');
    });

    it("filtre les conseils par catégorie", async () => {
      const mockQuerySnapshot = {
        forEach: jest.fn((callback) => {
          const mockDocs = [
            {
              id: "doc1",
              data: () => ({
                title: "Conseil Recyclage",
                content: "Contenu du conseil",
                category: "recyclage",
                imageUrl: "",
                tags: [],
                isPublished: true,
                likes: 5,
                views: 100,
                createdAt: { seconds: Date.now() / 1000, nanoseconds: 0, toDate: () => new Date(), toMillis: () => Date.now(), isEqual: () => false } as any,
                updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0, toDate: () => new Date(), toMillis: () => Date.now(), isEqual: () => false } as any
              })
            },
            {
              id: "doc2", 
              data: () => ({
                title: "Autre conseil recyclage",
                content: "Autre contenu",
                category: "recyclage",
                imageUrl: "",
                tags: [],
                isPublished: true,
                likes: 3,
                views: 50,
                createdAt: { seconds: Date.now() / 1000, nanoseconds: 0, toDate: () => new Date(), toMillis: () => Date.now(), isEqual: () => false } as any,
                updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0, toDate: () => new Date(), toMillis: () => Date.now(), isEqual: () => false } as any
              })
            }
          ];
          mockDocs.forEach(callback);
        })
      };

      (getDocs as jest.Mock).mockResolvedValue(mockQuerySnapshot);

      const result = await service.getAdviceByCategory("recyclage");
      
      expect(result).toHaveLength(2);
      expect(result[0].category).toBe("recyclage");
      expect(result[1].category).toBe("recyclage");
      expect(result[0].title).toBe("Conseil Recyclage");
      expect(result[1].title).toBe("Autre conseil recyclage");
    });

    it("récupère les conseils populaires", async () => {
      const docs = [
        { 
          id: "1", 
          data: () => ({ 
            title: "Populaire 1", 
            content: "Contenu populaire 1",
            category: "general",
            imageUrl: "",
            tags: [],
            isPublished: true,
            likes: 10,
            views: 100,
            createdAt: { seconds: Date.now() / 1000, nanoseconds: 0, toDate: () => new Date(), toMillis: () => Date.now(), isEqual: () => false } as any,
            updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0, toDate: () => new Date(), toMillis: () => Date.now(), isEqual: () => false } as any
          }) 
        },
        { 
          id: "2", 
          data: () => ({ 
            title: "Populaire 2", 
            content: "Contenu populaire 2",
            category: "recyclage",
            imageUrl: "",
            tags: [],
            isPublished: true,
            likes: 5,
            views: 50,
            createdAt: { seconds: Date.now() / 1000, nanoseconds: 0, toDate: () => new Date(), toMillis: () => Date.now(), isEqual: () => false } as any,
            updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0, toDate: () => new Date(), toMillis: () => Date.now(), isEqual: () => false } as any
          }) 
        }
      ];
      (getDocs as jest.Mock).mockResolvedValue({ forEach: (cb: any) => docs.forEach(cb) });
      const result = await service.getPopularAdvice(2);
      expect(result.length).toBe(2);
      expect(result[0].likes).toBe(10); // Le plus populaire en premier
      expect(result[1].likes).toBe(5);
    });
  });
});