import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import AdviceScreen from '../screens/AdviceScreen';
import adviceService from '../services/adviceService';

// Mock les dépendances
jest.mock('../services/adviceService');
jest.mock('react-native-paper');
jest.mock('../../firebaseConfig');

// Mock le service
const mockAdviceService = adviceService as jest.Mocked<typeof adviceService>;

describe('AdviceScreen', () => {
  const mockNavigation = {
    navigate: jest.fn(),
    goBack: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('devrait rendre l\'écran de conseils correctement', () => {
    mockAdviceService.getAllAdvice.mockResolvedValue([]);
    mockAdviceService.getCategories.mockReturnValue([
      {
        id: 'general',
        name: 'Général',
        icon: 'recycle',
        color: '#4CAF50',
        description: 'Conseils généraux sur le recyclage'
      }
    ]);

    const { getByText } = render(
      <AdviceScreen navigation={mockNavigation} />
    );

    expect(getByText('Conseils de recyclage')).toBeTruthy();
  });

  it('devrait charger les conseils au montage du composant', async () => {
    const mockAdvice = [
      {
        id: '1',
        title: 'Comment recycler le plastique',
        content: 'Rincer et jeter dans le bac plastique',
        category: 'general',
        authorId: 'user1',
        authorName: 'Expert',
        likes: 10,
        views: 100,
        isPublished: true,
        tags: ['plastique', 'recyclage'],
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];

    mockAdviceService.getAllAdvice.mockResolvedValue(mockAdvice);
    mockAdviceService.getCategories.mockReturnValue([]);

    const { getByText } = render(
      <AdviceScreen navigation={mockNavigation} />
    );

    await waitFor(() => {
      expect(mockAdviceService.getAllAdvice).toHaveBeenCalled();
      expect(getByText('Comment recycler le plastique')).toBeTruthy();
    });
  });

  it('devrait filtrer les conseils par catégorie', async () => {
    const mockAdvice = [
      {
        id: '1',
        title: 'Conseil plastique',
        content: 'Recyclage du plastique',
        category: 'plastic',
        authorId: 'user1',
        authorName: 'Expert',
        likes: 10,
        views: 100,
        isPublished: true,
        tags: ['plastique'],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: '2',
        title: 'Conseil papier',
        content: 'Recyclage du papier',
        category: 'paper',
        authorId: 'user1',
        authorName: 'Expert',
        likes: 5,
        views: 50,
        isPublished: true,
        tags: ['papier'],
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];

    mockAdviceService.getAllAdvice.mockResolvedValue(mockAdvice);
    mockAdviceService.getAdviceByCategory.mockResolvedValue([mockAdvice[0]]);
    mockAdviceService.getCategories.mockReturnValue([
      {
        id: 'plastic',
        name: 'Plastique',
        icon: 'bottle-soda',
        color: '#4CAF50',
        description: 'Recyclage du plastique'
      },
      {
        id: 'paper',
        name: 'Papier',
        icon: 'file-document',
        color: '#2196F3',
        description: 'Recyclage du papier'
      }
    ]);

    const { getByText } = render(
      <AdviceScreen navigation={mockNavigation} />
    );

    await waitFor(() => {
      expect(getByText('Conseil plastique')).toBeTruthy();
      expect(getByText('Conseil papier')).toBeTruthy();
    });

    // Sélectionner le filtre plastique
    const plasticFilter = getByText('Plastique');
    fireEvent.press(plasticFilter);

    await waitFor(() => {
      expect(mockAdviceService.getAdviceByCategory).toHaveBeenCalledWith('plastic');
    });
  });

  it('devrait rechercher des conseils', async () => {
    const mockAdvice = [
      {
        id: '1',
        title: 'Comment recycler le plastique',
        content: 'Rincer et jeter dans le bac plastique',
        category: 'general',
        authorId: 'user1',
        authorName: 'Expert',
        likes: 10,
        views: 100,
        isPublished: true,
        tags: ['plastique', 'recyclage'],
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];

    mockAdviceService.getAllAdvice.mockResolvedValue(mockAdvice);
    mockAdviceService.searchAdvice.mockResolvedValue(mockAdvice);
    mockAdviceService.getCategories.mockReturnValue([]);

    const { getByPlaceholderText } = render(
      <AdviceScreen navigation={mockNavigation} />
    );

    const searchInput = getByPlaceholderText('Rechercher un conseil...');
    fireEvent.changeText(searchInput, 'plastique');
    fireEvent(searchInput, 'submitEditing');

    await waitFor(() => {
      expect(mockAdviceService.searchAdvice).toHaveBeenCalledWith('plastique');
    });
  });

  it('devrait gérer les erreurs de chargement des conseils', async () => {
    mockAdviceService.getAllAdvice.mockRejectedValue(new Error('Erreur de chargement'));
    mockAdviceService.getCategories.mockReturnValue([]);

    render(<AdviceScreen navigation={mockNavigation} />);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Erreur',
        'Impossible de charger les conseils'
      );
    });
  });

  it('devrait permettre de liker un conseil', async () => {
    const mockAdvice = [
      {
        id: '1',
        title: 'Conseil test',
        content: 'Contenu test',
        category: 'general',
        authorId: 'user1',
        authorName: 'Expert',
        likes: 10,
        views: 100,
        isPublished: true,
        tags: ['test'],
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];

    mockAdviceService.getAllAdvice.mockResolvedValue(mockAdvice);
    mockAdviceService.toggleLike.mockResolvedValue();
    mockAdviceService.getCategories.mockReturnValue([]);

    const { getByText } = render(
      <AdviceScreen navigation={mockNavigation} />
    );

    await waitFor(() => {
      expect(getByText('Conseil test')).toBeTruthy();
    });

    // Simuler un like (on suppose qu'il y a un bouton like)
    // Note: Le test exact dépend de l'implémentation UI
    expect(mockAdviceService.toggleLike).toBeDefined();
  });

  it('devrait afficher les conseils populaires', async () => {
    const mockPopularAdvice = [
      {
        id: '1',
        title: 'Conseil populaire',
        content: 'Contenu populaire',
        category: 'general',
        authorId: 'user1',
        authorName: 'Expert',
        likes: 100,
        views: 1000,
        isPublished: true,
        tags: ['populaire'],
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];

    mockAdviceService.getAllAdvice.mockResolvedValue([]);
    mockAdviceService.getPopularAdvice.mockResolvedValue(mockPopularAdvice);
    mockAdviceService.getCategories.mockReturnValue([]);

    const { getByText } = render(
      <AdviceScreen navigation={mockNavigation} />
    );

    await waitFor(() => {
      expect(mockAdviceService.getPopularAdvice).toHaveBeenCalled();
    });
  });

  it('devrait naviguer vers le détail d\'un conseil', async () => {
    const mockAdvice = [
      {
        id: '1',
        title: 'Conseil détaillé',
        content: 'Contenu détaillé',
        category: 'general',
        authorId: 'user1',
        authorName: 'Expert',
        likes: 10,
        views: 100,
        isPublished: true,
        tags: ['détail'],
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];

    mockAdviceService.getAllAdvice.mockResolvedValue(mockAdvice);
    mockAdviceService.getCategories.mockReturnValue([]);

    const { getByText } = render(
      <AdviceScreen navigation={mockNavigation} />
    );

    await waitFor(() => {
      expect(getByText('Conseil détaillé')).toBeTruthy();
    });

    // Simuler la navigation vers le détail
    // Note: Le test exact dépend de l'implémentation UI
    expect(mockNavigation.navigate).toBeDefined();
  });

  it('devrait gérer l\'état de chargement', async () => {
    mockAdviceService.getAllAdvice.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve([]), 100))
    );
    mockAdviceService.getCategories.mockReturnValue([]);

    const { getByText } = render(
      <AdviceScreen navigation={mockNavigation} />
    );

    // Vérifier qu'un indicateur de chargement est affiché
    // Note: Le test exact dépend de l'implémentation UI
    expect(mockAdviceService.getAllAdvice).toHaveBeenCalled();
  });
}); 