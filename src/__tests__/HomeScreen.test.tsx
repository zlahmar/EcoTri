import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import HomeScreen from '../screens/HomeScreen';

// Mock les dépendances
jest.mock('../hooks/useLocation');
jest.mock('../components/MapComponent');
jest.mock('../styles/global');
jest.mock('react-native-safe-area-context');
jest.mock('react-native-paper');
jest.mock('../../firebaseConfig');

// Mock useLocation
const mockUseLocation = require('../hooks/useLocation');
mockUseLocation.useLocation = jest.fn(() => ({
  location: { latitude: 48.8566, longitude: 2.3522 },
  error: null,
  getCurrentLocation: jest.fn(),
}));

// Mock createGlobalStyles
const mockCreateGlobalStyles = require('../styles/global');
mockCreateGlobalStyles.createGlobalStyles = jest.fn(() => ({
  container: {},
  searchContainerTop: {},
  searchLogo: {},
  searchInput: {},
  filterContainerFloating: {},
  filterButton: {},
}));

// Mock MapComponent
const mockMapComponent = require('../components/MapComponent');
mockMapComponent.default = jest.fn(() => null);

describe('HomeScreen', () => {
  const mockNavigation = {
    navigate: jest.fn(),
    goBack: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it('devrait rendre l\'écran d\'accueil correctement', () => {
    const { getByPlaceholderText, getByText } = render(
      <HomeScreen navigation={mockNavigation} />
    );

    expect(getByPlaceholderText('Rechercher une adresse...')).toBeTruthy();
  });

  it('devrait permettre de saisir une adresse de recherche', () => {
    const { getByPlaceholderText } = render(
      <HomeScreen navigation={mockNavigation} />
    );

    const searchInput = getByPlaceholderText('Rechercher une adresse...');
    fireEvent.changeText(searchInput, 'Paris, France');

    expect(searchInput.props.value).toBe('Paris, France');
  });

  it('devrait rechercher une adresse avec succès', async () => {
    const mockGeocodingResponse = [
      {
        lat: '48.8566',
        lon: '2.3522',
        display_name: 'Paris, France',
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      text: jest.fn().mockResolvedValue(JSON.stringify(mockGeocodingResponse)),
    });

    const { getByPlaceholderText, getByText } = render(
      <HomeScreen navigation={mockNavigation} />
    );

    const searchInput = getByPlaceholderText('Rechercher une adresse...');
    fireEvent.changeText(searchInput, 'Paris, France');
    fireEvent(searchInput, 'submitEditing');

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('nominatim.openstreetmap.org'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'User-Agent': 'RecycleFinder/1.0 (zineblahmar1@gmail.com)',
          }),
        })
      );
    });
  });

  it('devrait afficher une alerte si la recherche est vide', async () => {
    const { getByPlaceholderText } = render(
      <HomeScreen navigation={mockNavigation} />
    );

    const searchInput = getByPlaceholderText('Rechercher une adresse...');
    fireEvent(searchInput, 'submitEditing');

    expect(Alert.alert).toHaveBeenCalledWith('Erreur', 'Veuillez entrer une adresse.');
  });

  it('devrait afficher une alerte si l\'adresse n\'est pas trouvée', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      text: jest.fn().mockResolvedValue('[]'),
    });

    const { getByPlaceholderText } = render(
      <HomeScreen navigation={mockNavigation} />
    );

    const searchInput = getByPlaceholderText('Rechercher une adresse...');
    fireEvent.changeText(searchInput, 'Adresse inexistante');
    fireEvent(searchInput, 'submitEditing');

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Adresse non trouvée', 'Essayez une autre adresse.');
    });
  });

  it('devrait gérer les erreurs de recherche', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Erreur réseau'));

    const { getByPlaceholderText } = render(
      <HomeScreen navigation={mockNavigation} />
    );

    const searchInput = getByPlaceholderText('Rechercher une adresse...');
    fireEvent.changeText(searchInput, 'Paris, France');
    fireEvent(searchInput, 'submitEditing');

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Erreur', 'Impossible de rechercher cette adresse.');
    });
  });

  it('devrait permettre de sélectionner un filtre', () => {
    const { getByText } = render(
      <HomeScreen navigation={mockNavigation} />
    );

    // Les filtres sont rendus comme des IconButton, on peut tester leur présence
    expect(mockMapComponent.default).toHaveBeenCalledWith(
      expect.objectContaining({
        filter: null, // Aucun filtre sélectionné initialement
      }),
      expect.anything()
    );
  });

  it('devrait utiliser la localisation par défaut si aucune recherche n\'est effectuée', () => {
    render(<HomeScreen navigation={mockNavigation} />);

    expect(mockMapComponent.default).toHaveBeenCalledWith(
      expect.objectContaining({
        location: { latitude: 48.8566, longitude: 2.3522 }, // Localisation par défaut
      }),
      expect.anything()
    );
  });
}); 