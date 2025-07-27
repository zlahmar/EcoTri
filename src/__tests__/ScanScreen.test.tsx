import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import ScanScreen from '../screens/ScanScreen';
import mlKitService from '../services/mlKitService';
import storageService from '../services/storageService';

// Mock les dépendances
jest.mock('../services/mlKitService');
jest.mock('../services/storageService');
jest.mock('expo-image-picker');
jest.mock('react-native-paper');
jest.mock('../../firebaseConfig');

// Mock les services
const mockMLKitService = mlKitService as jest.Mocked<typeof mlKitService>;
const mockStorageService = storageService as jest.Mocked<typeof storageService>;

// Mock expo-image-picker
const mockImagePicker = require('expo-image-picker');
mockImagePicker.requestCameraPermissionsAsync = jest.fn();
mockImagePicker.launchCameraAsync = jest.fn();

describe('ScanScreen', () => {
  const mockNavigation = {
    navigate: jest.fn(),
    goBack: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('devrait rendre l\'écran de scan correctement', () => {
    const { getByText } = render(
      <ScanScreen navigation={mockNavigation} />
    );

    expect(getByText('Scanner un déchet')).toBeTruthy();
  });

  it('devrait prendre une photo avec succès', async () => {
    mockImagePicker.requestCameraPermissionsAsync.mockResolvedValue({ status: 'granted' });
    mockImagePicker.launchCameraAsync.mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file://test-image.jpg' }],
    });

    mockMLKitService.imageToBase64.mockResolvedValue('base64-image-data');
    mockMLKitService.analyzeImage.mockResolvedValue({
      labels: [{ description: 'bottle', confidence: 0.9 }],
      objects: [],
      text: [],
      dominantColors: [],
      wasteCategory: {
        category: 'Plastique',
        icon: 'bottle-soda',
        color: '#4CAF50',
        instructions: 'Rincer et jeter dans le bac plastique',
        confidence: 0.9,
      },
      confidence: 0.9,
      alternatives: [],
    });

    const { getByText } = render(
      <ScanScreen navigation={mockNavigation} />
    );

    const scanButton = getByText('Prendre une photo');
    fireEvent.press(scanButton);

    await waitFor(() => {
      expect(mockImagePicker.requestCameraPermissionsAsync).toHaveBeenCalled();
      expect(mockImagePicker.launchCameraAsync).toHaveBeenCalled();
    });
  });

  it('devrait gérer le refus de permission caméra', async () => {
    mockImagePicker.requestCameraPermissionsAsync.mockResolvedValue({ status: 'denied' });

    const { getByText } = render(
      <ScanScreen navigation={mockNavigation} />
    );

    const scanButton = getByText('Prendre une photo');
    fireEvent.press(scanButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Permission refusée',
        'Vous devez autoriser l\'accès à la caméra pour scanner.'
      );
    });
  });

  it('devrait gérer l\'annulation de la prise de photo', async () => {
    mockImagePicker.requestCameraPermissionsAsync.mockResolvedValue({ status: 'granted' });
    mockImagePicker.launchCameraAsync.mockResolvedValue({
      canceled: true,
      assets: [],
    });

    const { getByText } = render(
      <ScanScreen navigation={mockNavigation} />
    );

    const scanButton = getByText('Prendre une photo');
    fireEvent.press(scanButton);

    await waitFor(() => {
      expect(mockImagePicker.launchCameraAsync).toHaveBeenCalled();
    });
  });

  it('devrait analyser une image avec succès', async () => {
    mockImagePicker.requestCameraPermissionsAsync.mockResolvedValue({ status: 'granted' });
    mockImagePicker.launchCameraAsync.mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file://test-image.jpg' }],
    });

    const mockAnalysisResult = {
      labels: [{ description: 'bottle', confidence: 0.9 }],
      objects: [],
      text: [],
      dominantColors: [],
      wasteCategory: {
        category: 'Plastique',
        icon: 'bottle-soda',
        color: '#4CAF50',
        instructions: 'Rincer et jeter dans le bac plastique',
        confidence: 0.9,
      },
      confidence: 0.9,
      alternatives: [
        {
          category: 'Métal',
          icon: 'silverware-fork-knife',
          color: '#FF9800',
          instructions: 'Rincer et jeter dans le bac métal',
          confidence: 0.3,
        },
      ],
    };

    mockMLKitService.imageToBase64.mockResolvedValue('base64-image-data');
    mockMLKitService.analyzeImage.mockResolvedValue(mockAnalysisResult);

    const { getByText } = render(
      <ScanScreen navigation={mockNavigation} />
    );

    const scanButton = getByText('Prendre une photo');
    fireEvent.press(scanButton);

    await waitFor(() => {
      expect(mockMLKitService.imageToBase64).toHaveBeenCalledWith('file://test-image.jpg');
      expect(mockMLKitService.analyzeImage).toHaveBeenCalledWith('base64-image-data');
    });
  });

  it('devrait gérer les erreurs d\'analyse d\'image', async () => {
    mockImagePicker.requestCameraPermissionsAsync.mockResolvedValue({ status: 'granted' });
    mockImagePicker.launchCameraAsync.mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file://test-image.jpg' }],
    });

    mockMLKitService.imageToBase64.mockRejectedValue(new Error('Erreur de conversion'));

    const { getByText } = render(
      <ScanScreen navigation={mockNavigation} />
    );

    const scanButton = getByText('Prendre une photo');
    fireEvent.press(scanButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Erreur',
        'Impossible d\'analyser l\'image. Veuillez réessayer.'
      );
    });
  });

  it('devrait permettre de reprendre une photo', async () => {
    // D'abord, prendre une photo
    mockImagePicker.requestCameraPermissionsAsync.mockResolvedValue({ status: 'granted' });
    mockImagePicker.launchCameraAsync.mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file://test-image.jpg' }],
    });

    mockMLKitService.imageToBase64.mockResolvedValue('base64-image-data');
    mockMLKitService.analyzeImage.mockResolvedValue({
      labels: [],
      objects: [],
      text: [],
      dominantColors: [],
      wasteCategory: {
        category: 'Plastique',
        icon: 'bottle-soda',
        color: '#4CAF50',
        instructions: 'Rincer et jeter dans le bac plastique',
        confidence: 0.9,
      },
      confidence: 0.9,
      alternatives: [],
    });

    const { getByText } = render(
      <ScanScreen navigation={mockNavigation} />
    );

    const scanButton = getByText('Prendre une photo');
    fireEvent.press(scanButton);

    await waitFor(() => {
      expect(getByText('Reprendre')).toBeTruthy();
    });

    const retakeButton = getByText('Reprendre');
    fireEvent.press(retakeButton);

    // Vérifier que l'état est réinitialisé
    expect(getByText('Prendre une photo')).toBeTruthy();
  });

  it('devrait sauvegarder un résultat de scan avec succès', async () => {
    // Configurer les mocks pour un scan réussi
    mockImagePicker.requestCameraPermissionsAsync.mockResolvedValue({ status: 'granted' });
    mockImagePicker.launchCameraAsync.mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file://test-image.jpg' }],
    });

    mockMLKitService.imageToBase64.mockResolvedValue('base64-image-data');
    mockMLKitService.analyzeImage.mockResolvedValue({
      labels: [{ description: 'bottle', confidence: 0.9 }],
      objects: [],
      text: [],
      dominantColors: [],
      wasteCategory: {
        category: 'Plastique',
        icon: 'bottle-soda',
        color: '#4CAF50',
        instructions: 'Rincer et jeter dans le bac plastique',
        confidence: 0.9,
      },
      confidence: 0.9,
      alternatives: [],
    });

    mockStorageService.uploadImage.mockResolvedValue('https://example.com/image.jpg');
    mockStorageService.saveScanResult.mockResolvedValue('scan123');

    const { getByText } = render(
      <ScanScreen navigation={mockNavigation} />
    );

    const scanButton = getByText('Prendre une photo');
    fireEvent.press(scanButton);

    await waitFor(() => {
      expect(getByText('Confirmer')).toBeTruthy();
    });

    const confirmButton = getByText('Confirmer');
    fireEvent.press(confirmButton);

    await waitFor(() => {
      expect(mockStorageService.uploadImage).toHaveBeenCalledWith('file://test-image.jpg', 'test-user-id');
      expect(mockStorageService.saveScanResult).toHaveBeenCalled();
    });
  });

  it('devrait gérer les erreurs de sauvegarde', async () => {
    // Configurer les mocks pour un scan réussi mais une sauvegarde échouée
    mockImagePicker.requestCameraPermissionsAsync.mockResolvedValue({ status: 'granted' });
    mockImagePicker.launchCameraAsync.mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file://test-image.jpg' }],
    });

    mockMLKitService.imageToBase64.mockResolvedValue('base64-image-data');
    mockMLKitService.analyzeImage.mockResolvedValue({
      labels: [],
      objects: [],
      text: [],
      dominantColors: [],
      wasteCategory: {
        category: 'Plastique',
        icon: 'bottle-soda',
        color: '#4CAF50',
        instructions: 'Rincer et jeter dans le bac plastique',
        confidence: 0.9,
      },
      confidence: 0.9,
      alternatives: [],
    });

    mockStorageService.uploadImage.mockRejectedValue(new Error('Erreur de sauvegarde'));

    const { getByText } = render(
      <ScanScreen navigation={mockNavigation} />
    );

    const scanButton = getByText('Prendre une photo');
    fireEvent.press(scanButton);

    await waitFor(() => {
      expect(getByText('Confirmer')).toBeTruthy();
    });

    const confirmButton = getByText('Confirmer');
    fireEvent.press(confirmButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Erreur',
        'Impossible de sauvegarder le résultat. Veuillez réessayer.'
      );
    });
  });
}); 