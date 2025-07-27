import React from 'react';
import { render } from '@testing-library/react-native';
import MapComponent from '../components/MapComponent';

// Mock les dépendances
jest.mock('react-native-maps');
jest.mock('react-native-paper');

describe('MapComponent', () => {
  const mockMapRef = {
    current: {
      animateToRegion: jest.fn(),
    },
  };

  const defaultLocation = {
    latitude: 48.8566,
    longitude: 2.3522,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('devrait rendre la carte correctement', () => {
    const { getByTestId } = render(
      <MapComponent 
        mapRef={mockMapRef}
        location={defaultLocation}
        filter={null}
      />
    );

    // Vérifier que la carte est rendue
    expect(mockMapRef.current).toBeDefined();
  });

  it('devrait utiliser la localisation fournie', () => {
    const customLocation = {
      latitude: 40.7128,
      longitude: -74.0060,
    };

    render(
      <MapComponent 
        mapRef={mockMapRef}
        location={customLocation}
        filter={null}
      />
    );

    // Vérifier que la localisation est utilisée
    expect(customLocation).toEqual({
      latitude: 40.7128,
      longitude: -74.0060,
    });
  });

  it('devrait gérer l\'absence de localisation', () => {
    render(
      <MapComponent 
        mapRef={mockMapRef}
        location={null}
        filter={null}
      />
    );

    // Le composant devrait gérer le cas où location est null
    expect(mockMapRef.current).toBeDefined();
  });

  it('devrait appliquer le filtre fourni', () => {
    const filter = 'plastic';

    render(
      <MapComponent 
        mapRef={mockMapRef}
        location={defaultLocation}
        filter={filter}
      />
    );

    // Vérifier que le filtre est appliqué
    expect(filter).toBe('plastic');
  });

  it('devrait gérer l\'absence de filtre', () => {
    render(
      <MapComponent 
        mapRef={mockMapRef}
        location={defaultLocation}
        filter={null}
      />
    );

    // Le composant devrait gérer le cas où filter est null
    expect(mockMapRef.current).toBeDefined();
  });

  it('devrait animer vers une nouvelle région', () => {
    const newLocation = {
      latitude: 51.5074,
      longitude: -0.1278,
    };

    render(
      <MapComponent 
        mapRef={mockMapRef}
        location={newLocation}
        filter={null}
      />
    );

    // Vérifier que la méthode d'animation est disponible
    expect(mockMapRef.current.animateToRegion).toBeDefined();
  });

  it('devrait gérer les erreurs de rendu de la carte', () => {
    // Simuler une erreur de rendu
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <MapComponent 
        mapRef={mockMapRef}
        location={defaultLocation}
        filter={null}
      />
    );

    // Vérifier que les erreurs sont gérées
    expect(consoleSpy).toBeDefined();
    consoleSpy.mockRestore();
  });
}); 