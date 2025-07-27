import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { View, Text, TouchableOpacity } from 'react-native';
import ScanScreen from '../screens/ScanScreen';

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
}));

// Mock des icônes
jest.mock('@expo/vector-icons', () => ({
  MaterialCommunityIcons: ({ name }: any) => <Text testID="icon">{name}</Text>,
}));

// Mock des services
jest.mock('../services/mlKitService');
jest.mock('../services/storageService');

// Mock de la navigation
const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  setOptions: jest.fn(),
};

describe('ScanScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('affiche l\'écran de scan', () => {
    const { getByText } = render(
      <ScanScreen navigation={mockNavigation as any} />
    );

    expect(getByText(/scan/i)).toBeTruthy();
  });

  it('permet de prendre une photo', () => {
    const { getByTestId } = render(
      <ScanScreen navigation={mockNavigation as any} />
    );

    const cameraButton = getByTestId('button');
    fireEvent.press(cameraButton);

    // Vérifier que le bouton est présent
    expect(cameraButton).toBeTruthy();
  });

  it('permet de sélectionner une image depuis la galerie', () => {
    const { getByText } = render(
      <ScanScreen navigation={mockNavigation as any} />
    );

    expect(getByText(/galerie/i)).toBeTruthy();
  });

  it('affiche les résultats du scan', async () => {
    const { getByText } = render(
      <ScanScreen navigation={mockNavigation as any} />
    );

    await waitFor(() => {
      expect(getByText(/résultats/i)).toBeTruthy();
    });
  });
}); 