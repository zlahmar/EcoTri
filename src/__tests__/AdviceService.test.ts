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
});