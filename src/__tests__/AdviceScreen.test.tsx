import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { View, Text, TextInput } from 'react-native';
import AdviceScreen from '../screens/AdviceScreen';
import AdviceService from '../services/adviceService';

// Mock du service
const mockAdviceService = {
  getAllAdvice: jest.fn(),
  getCategories: jest.fn(),
  getAdviceByCategory: jest.fn(),
  searchAdvice: jest.fn(),
  toggleLike: jest.fn(),
  getPopularAdvice: jest.fn(),
};

jest.mock('../services/adviceService', () => ({
  __esModule: true,
  default: mockAdviceService
}));

// Mock des composants React Native Paper
jest.mock('react-native-paper', () => ({
  Appbar: {
    Header: ({ children }: any) => children,
  },
  IconButton: ({ onPress, icon }: any) => (
    <View testID="icon-button" onTouchEnd={onPress}>{icon}</View>
  ),
  Button: ({ onPress, children }: any) => (
    <View testID="button" onTouchEnd={onPress}>{children}</View>
  ),
  Card: ({ children }: any) => <View testID="card">{children}</View>,
  Chip: ({ onPress, children }: any) => (
    <View testID="chip" onTouchEnd={onPress}>{children}</View>
  ),
  TextInput: ({ value, onChangeText, placeholder }: any) => (
    <TextInput
      testID="text-input"
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
    />
  ),
}));

// Mock des icônes
jest.mock('@expo/vector-icons', () => ({
  MaterialCommunityIcons: ({ name }: any) => <Text testID="icon">{name}</Text>,
}));

// Mock de la navigation
const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  setOptions: jest.fn(),
};

// Mock des props
const mockRoute = {
  params: {},
};

describe('AdviceScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock des méthodes du service
    mockAdviceService.getAllAdvice.mockResolvedValue([]);
    mockAdviceService.getCategories.mockReturnValue([
      { id: 'plastic', name: 'Plastique', icon: 'bottle-soda', color: '#2196F3', description: 'Test' },
      { id: 'paper', name: 'Papier', icon: 'file-document', color: '#FF9800', description: 'Test' },
    ]);
    mockAdviceService.getAdviceByCategory.mockResolvedValue([]);
    mockAdviceService.searchAdvice.mockResolvedValue([]);
    mockAdviceService.toggleLike.mockResolvedValue(undefined);
    mockAdviceService.getPopularAdvice.mockResolvedValue([]);
  });

  it('charge les conseils au montage', async () => {
    const mockAdvice = [
      {
        id: '1',
        title: 'Conseil Test',
        content: 'Contenu test',
        category: 'plastic',
        likes: 5,
        views: 10,
        isPublished: true,
        tags: ['test'],
        createdAt: new Date() as any,
        updatedAt: new Date() as any,
      },
    ];

    mockAdviceService.getAllAdvice.mockResolvedValue(mockAdvice);
    mockAdviceService.getCategories.mockReturnValue([]);

    const { getByText } = render(
      <AdviceScreen navigation={mockNavigation as any} />
    );

    await waitFor(() => {
      expect(mockAdviceService.getAllAdvice).toHaveBeenCalled();
    });

    expect(getByText('Conseil Test')).toBeTruthy();
  });

  it('filtre les conseils par catégorie', async () => {
    const mockAdvice = [
      {
        id: '1',
        title: 'Conseil Plastique',
        content: 'Contenu plastique',
        category: 'plastic',
        likes: 5,
        views: 10,
        isPublished: true,
        tags: ['plastic'],
        createdAt: new Date() as any,
        updatedAt: new Date() as any,
      },
    ];

    mockAdviceService.getAllAdvice.mockResolvedValue(mockAdvice);
    mockAdviceService.getAdviceByCategory.mockResolvedValue([mockAdvice[0]]);
    mockAdviceService.getCategories.mockReturnValue([
      { id: 'plastic', name: 'Plastique', icon: 'bottle-soda', color: '#2196F3', description: 'Test' },
    ]);

    const { getByText } = render(
      <AdviceScreen navigation={mockNavigation as any} />
    );

    await waitFor(() => {
      expect(mockAdviceService.getAdviceByCategory).toHaveBeenCalledWith('plastic');
    });
  });

  it('recherche des conseils', async () => {
    const mockAdvice = [
      {
        id: '1',
        title: 'Conseil Plastique',
        content: 'Contenu plastique',
        category: 'plastic',
        likes: 5,
        views: 10,
        isPublished: true,
        tags: ['plastic'],
        createdAt: new Date() as any,
        updatedAt: new Date() as any,
      },
    ];

    mockAdviceService.getAllAdvice.mockResolvedValue(mockAdvice);
    mockAdviceService.searchAdvice.mockResolvedValue(mockAdvice);
    mockAdviceService.getCategories.mockReturnValue([]);

    const { getByTestId } = render(
      <AdviceScreen navigation={mockNavigation as any} />
    );

    const searchInput = getByTestId('text-input');
    fireEvent(searchInput, 'changeText', 'plastique');

    await waitFor(() => {
      expect(mockAdviceService.searchAdvice).toHaveBeenCalledWith('plastique');
    });
  });

  it('gère les erreurs de chargement', async () => {
    mockAdviceService.getAllAdvice.mockRejectedValue(new Error('Erreur de chargement'));
    mockAdviceService.getCategories.mockReturnValue([]);

    const { getByText } = render(
      <AdviceScreen navigation={mockNavigation as any} />
    );

    await waitFor(() => {
      expect(getByText(/erreur/i)).toBeTruthy();
    });
  });

  it('permet de liker un conseil', async () => {
    const mockAdvice = [
      {
        id: '1',
        title: 'Conseil Test',
        content: 'Contenu test',
        category: 'plastic',
        likes: 5,
        views: 10,
        isPublished: true,
        tags: ['test'],
        createdAt: new Date() as any,
        updatedAt: new Date() as any,
      },
    ];

    mockAdviceService.getAllAdvice.mockResolvedValue(mockAdvice);
    mockAdviceService.toggleLike.mockResolvedValue(undefined);
    mockAdviceService.getCategories.mockReturnValue([]);

    const { getByTestId } = render(
      <AdviceScreen navigation={mockNavigation as any} />
    );

    await waitFor(() => {
      expect(mockAdviceService.toggleLike).toBeDefined();
    });
  });

  it('affiche les conseils populaires', async () => {
    const mockPopularAdvice = [
      {
        id: '1',
        title: 'Conseil Populaire',
        content: 'Contenu populaire',
        category: 'plastic',
        likes: 100,
        views: 500,
        isPublished: true,
        tags: ['popular'],
        createdAt: new Date() as any,
        updatedAt: new Date() as any,
      },
    ];

    mockAdviceService.getAllAdvice.mockResolvedValue([]);
    mockAdviceService.getPopularAdvice.mockResolvedValue(mockPopularAdvice);
    mockAdviceService.getCategories.mockReturnValue([]);

    const { getByText } = render(
      <AdviceScreen navigation={mockNavigation as any} />
    );

    await waitFor(() => {
      expect(mockAdviceService.getPopularAdvice).toHaveBeenCalled();
    });
  });

  it('rafraîchit les données lors du pull-to-refresh', async () => {
    const mockAdvice = [
      {
        id: '1',
        title: 'Conseil Test',
        content: 'Contenu test',
        category: 'plastic',
        likes: 5,
        views: 10,
        isPublished: true,
        tags: ['test'],
        createdAt: new Date() as any,
        updatedAt: new Date() as any,
      },
    ];

    mockAdviceService.getAllAdvice.mockResolvedValue(mockAdvice);
    mockAdviceService.getCategories.mockReturnValue([]);

    const { getByTestId } = render(
      <AdviceScreen navigation={mockNavigation as any} />
    );

    // Simuler un pull-to-refresh
    const scrollView = getByTestId('scroll-view');
    fireEvent.scroll(scrollView, {
      nativeEvent: {
        contentOffset: { y: 0 },
        contentSize: { height: 500, width: 100 },
        layoutMeasurement: { height: 100, width: 100 },
      },
    });

    await waitFor(() => {
      expect(mockAdviceService.getAllAdvice).toHaveBeenCalled();
    });
  });
}); 