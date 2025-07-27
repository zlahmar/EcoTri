import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { View, Text, TouchableOpacity } from 'react-native';
import HomeScreen from '../screens/HomeScreen';

// Mock des composants React Native Paper
jest.mock('react-native-paper', () => ({
  Appbar: {
    Header: ({ children }: any) => <View>{children}</View>,
  },
  IconButton: ({ onPress, icon }: any) => (
    <TouchableOpacity onPress={onPress} testID="icon-button">
      <Text>{icon}</Text>
    </TouchableOpacity>
  ),
  Button: ({ onPress, children }: any) => (
    <TouchableOpacity onPress={onPress} testID="button">
      <Text>{children}</Text>
    </TouchableOpacity>
  ),
  Card: ({ children }: any) => <View testID="card">{children}</View>,
  FAB: ({ onPress, icon }: any) => (
    <TouchableOpacity onPress={onPress} testID="fab">
      <Text>{icon}</Text>
    </TouchableOpacity>
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

describe('HomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('affiche l\'écran d\'accueil', () => {
    const { getByText } = render(
      <HomeScreen navigation={mockNavigation as any} />
    );

    expect(getByText(/accueil/i)).toBeTruthy();
  });

  it('navigue vers l\'écran de scan quand on appuie sur le FAB', () => {
    const { getByTestId } = render(
      <HomeScreen navigation={mockNavigation as any} />
    );

    const fab = getByTestId('fab');
    fireEvent.press(fab);

    expect(mockNavigation.navigate).toHaveBeenCalledWith('Scan');
  });

  it('affiche les statistiques de l\'utilisateur', async () => {
    const { getByText } = render(
      <HomeScreen navigation={mockNavigation as any} />
    );

    await waitFor(() => {
      expect(getByText(/statistiques/i)).toBeTruthy();
    });
  });

  it('affiche les conseils populaires', async () => {
    const { getByText } = render(
      <HomeScreen navigation={mockNavigation as any} />
    );

    await waitFor(() => {
      expect(getByText(/conseils/i)).toBeTruthy();
    });
  });
}); 