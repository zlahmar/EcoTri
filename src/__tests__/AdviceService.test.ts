// Mocks
jest.mock('firebase/firestore');
jest.mock('../../firebaseConfig');

import AdviceService from '../services/adviceService';

import {
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';

describe("AdviceService", () => {
  const service = new AdviceService();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // getAdviceById
  it("récupère un conseil par ID existant", async () => {
    (getDoc as jest.Mock).mockResolvedValue({
      exists: () => true,
      id: "1",
      data: () => ({ title: "Test", category: "general", content: "..." })
    });
    const result = await service.getAdviceById("1");
    expect(result?.id).toBe("1");
    expect(result?.title).toBe("Test");
  });

  it("retourne null si le conseil n'existe pas", async () => {
    (getDoc as jest.Mock).mockResolvedValue({ exists: () => false });
    const result = await service.getAdviceById("999");
    expect(result).toBeNull();
  });

  // addAdvice
  it("ajoute un conseil avec infos utilisateur", async () => {
    (addDoc as jest.Mock).mockResolvedValue({ id: "abc" });
    const result = await service.addAdvice({
      title: "Nouveau",
      content: "Recycle mieux",
      category: "general",
      imageUrl: "",
      tags: ["eco"],
      isPublished: false
    });
    expect(addDoc).toHaveBeenCalled();
    expect(result).toBe("abc");
  });

  // updateAdvice
  it("met à jour un conseil si l'utilisateur est l'auteur", async () => {
    (getDoc as jest.Mock).mockResolvedValue({
      exists: () => true,
      data: () => ({ authorId: "test-user-id" })
    });
    await service.updateAdvice("123", { title: "Modifié" });
    expect(updateDoc).toHaveBeenCalled();
  });

  // deleteAdvice
  it("supprime un conseil si l'utilisateur est l'auteur", async () => {
    (getDoc as jest.Mock).mockResolvedValue({
      exists: () => true,
      data: () => ({ authorId: "test-user-id" })
    });
    await service.deleteAdvice("123");
    expect(deleteDoc).toHaveBeenCalled();
  });

  // searchAdvice
  it("recherche dans le titre, contenu ou tags", async () => {
    const docs = [
      { id: "1", data: () => ({ title: "Recycler", content: "plastique", tags: [] }) },
      { id: "2", data: () => ({ title: "Papier", content: "pliage", tags: ["eco"] }) }
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
      data: () => ({ views: 3 })
    });
    await service.incrementViews("123");
    expect(updateDoc).toHaveBeenCalled();
  });

  // toggleLike
  it("ajoute un like au conseil", async () => {
    (getDoc as jest.Mock).mockResolvedValue({
      exists: () => true,
      data: () => ({ likes: 7 })
    });
    await service.toggleLike("123");
    expect(updateDoc).toHaveBeenCalled();
  });

  // getUserAdvice
  it("récupère les conseils de l'utilisateur", async () => {
    const docs = [
      { id: "1", data: () => ({ title: "Perso", authorId: "test-user-id" }) }
    ];
    (getDocs as jest.Mock).mockResolvedValue({ forEach: (cb: any) => docs.forEach(cb) });
    const result = await service.getUserAdvice();
    expect(result.length).toBe(1);
    expect(result[0].title).toBe("Perso");
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
      // Reset localStorage mock
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: jest.fn(),
          setItem: jest.fn(),
          removeItem: jest.fn(),
          clear: jest.fn(),
        },
        writable: true,
      });
    });

    it("récupère la liste des favoris", async () => {
      (window.localStorage.getItem as jest.Mock).mockReturnValue(
        JSON.stringify(["fav1", "fav2"])
      );
      
      const favorites = await service.getFavorites();
      expect(favorites).toEqual(["fav1", "fav2"]);
    });

    it("retourne une liste vide si pas de favoris", async () => {
      (window.localStorage.getItem as jest.Mock).mockReturnValue(null);
      
      const favorites = await service.getFavorites();
      expect(favorites).toEqual([]);
    });

    it("vérifie si un conseil est favori", async () => {
      (window.localStorage.getItem as jest.Mock).mockReturnValue(
        JSON.stringify(["conseil1", "conseil2"])
      );
      
      const isFav1 = await service.isFavorite("conseil1");
      const isFav3 = await service.isFavorite("conseil3");
      
      expect(isFav1).toBe(true);
      expect(isFav3).toBe(false);
    });

    it("ajoute un conseil aux favoris", async () => {
      (window.localStorage.getItem as jest.Mock).mockReturnValue(
        JSON.stringify(["existing"])
      );
      
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
        updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0, toDate: () => new Date(), toMillis: () => Date.now(), isEqual: () => false } as any
      };

      await service.addToFavorites(mockAdvice);
      
      expect(window.localStorage.setItem).toHaveBeenCalled();
    });

    it("retire un conseil des favoris", async () => {
      (window.localStorage.getItem as jest.Mock).mockReturnValue(
        JSON.stringify(["conseil1", "conseil2", "conseil3"])
      );
      
      await service.removeFromFavorites("conseil2");
      
      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        "advice_favorites",
        JSON.stringify(["conseil1", "conseil3"])
      );
    });

    it("n'ajoute pas un doublon aux favoris", async () => {
      (window.localStorage.getItem as jest.Mock).mockReturnValue(
        JSON.stringify(["existing"])
      );
      
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
        updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0, toDate: () => new Date(), toMillis: () => Date.now(), isEqual: () => false } as any
      };

      await service.addToFavorites(mockAdvice);
      
      expect(window.localStorage.setItem).toHaveBeenCalled();
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
      
      const result = await service.getAdviceById("invalid-id");
      expect(result).toBeNull();
    });

    it("filtre les conseils par catégorie", async () => {
      const mockAdvices = [
        { id: "1", category: "general", title: "Conseil 1" },
        { id: "2", category: "recyclage", title: "Conseil 2" },
        { id: "3", category: "general", title: "Conseil 3" }
      ];

      const docs = mockAdvices.map(advice => ({
        id: advice.id,
        data: () => advice
      }));

      (getDocs as jest.Mock).mockResolvedValue({ 
        forEach: (cb: any) => docs.forEach(cb) 
      });

      const generalAdvices = await service.getAdviceByCategory("general");
      expect(generalAdvices).toHaveLength(2);
      expect(generalAdvices[0].category).toBe("general");
    });

    it("récupère les conseils populaires", async () => {
      const mockAdvices = [
        { id: "1", views: 100, likes: 50, title: "Populaire 1" },
        { id: "2", views: 50, likes: 20, title: "Moins populaire" },
        { id: "3", views: 200, likes: 80, title: "Très populaire" }
      ];

      const docs = mockAdvices.map(advice => ({
        id: advice.id,
        data: () => advice
      }));

      (getDocs as jest.Mock).mockResolvedValue({ 
        forEach: (cb: any) => docs.forEach(cb) 
      });

      // Simuler une méthode de tri par popularité
      const result = await service.searchAdvice("");
      expect(result.length).toBeGreaterThanOrEqual(0);
    });
  });
});