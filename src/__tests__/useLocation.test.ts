import { renderHook, act } from '@testing-library/react';
import { useLocation } from '../hooks/useLocation';

// Mock expo-location
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
}));

const mockExpoLocation = require('expo-location');

describe('useLocation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('retourne la localisation par défaut', async () => {
    const { result } = renderHook(() => useLocation());

    // Attendre que le useEffect se termine
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.location).toEqual({
      latitude: 48.8566,
      longitude: 2.3522,
    });
    expect(result.current.error).toBeDefined();
  });

  it('demande les permissions de localisation', async () => {
    mockExpoLocation.requestForegroundPermissionsAsync.mockResolvedValue({
      status: 'granted',
    });

    const { result } = renderHook(() => useLocation());

    await act(async () => {
      await result.current.getCurrentLocation();
    });

    expect(mockExpoLocation.requestForegroundPermissionsAsync).toHaveBeenCalled();
  });

  it('récupère la position actuelle avec succès', async () => {
    const mockPosition = {
      coords: {
        latitude: 40.7128,
        longitude: -74.0060,
        accuracy: 10,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
      },
      timestamp: Date.now(),
    };

    mockExpoLocation.requestForegroundPermissionsAsync.mockResolvedValue({
      status: 'granted',
    });
    mockExpoLocation.getCurrentPositionAsync.mockResolvedValue(mockPosition);

    const { result } = renderHook(() => useLocation());

    await act(async () => {
      await result.current.getCurrentLocation();
    });

    expect(mockExpoLocation.getCurrentPositionAsync).toHaveBeenCalled();
    expect(result.current.location).toEqual({
      latitude: 40.7128,
      longitude: -74.0060,
    });
  });

  it('gère le refus de permission', async () => {
    mockExpoLocation.requestForegroundPermissionsAsync.mockResolvedValue({
      status: 'denied',
    });

    const { result } = renderHook(() => useLocation());

    await act(async () => {
      await result.current.getCurrentLocation();
    });

    expect(result.current.error).toBeTruthy();
  });

  it('gère les erreurs de géolocalisation', async () => {
    mockExpoLocation.requestForegroundPermissionsAsync.mockResolvedValue({
      status: 'granted',
    });
    mockExpoLocation.getCurrentPositionAsync.mockRejectedValue(
      new Error('Erreur de géolocalisation')
    );

    const { result } = renderHook(() => useLocation());

    await act(async () => {
      await result.current.getCurrentLocation();
    });

    expect(result.current.error).toBeTruthy();
  });

  // Tests supplémentaires pour augmenter la couverture
  describe('Tests de couverture supplémentaires', () => {
    it('gère les erreurs de permission avec détails', async () => {
      mockExpoLocation.requestForegroundPermissionsAsync.mockResolvedValueOnce({
        status: 'denied',
      });

      const { result } = renderHook(() => useLocation());

      await act(async () => {
        await result.current.getCurrentLocation();
      });

      expect(result.current.error).toBeTruthy();
      expect(result.current.error).toContain('Permission de localisation refusée');
    });

    it('gère les erreurs de géolocalisation avec types spécifiques', async () => {
      mockExpoLocation.requestForegroundPermissionsAsync.mockResolvedValueOnce({
        status: 'granted',
      });
      mockExpoLocation.getCurrentPositionAsync.mockRejectedValueOnce(new Error('Location service unavailable'));

      const { result } = renderHook(() => useLocation());

      await act(async () => {
        await result.current.getCurrentLocation();
      });

      expect(result.current.error).toBeTruthy();
      expect(result.current.error).toContain('Erreur de géolocalisation');
    });

    it('gère les permissions temporaires', async () => {
      mockExpoLocation.requestForegroundPermissionsAsync.mockResolvedValueOnce({
        status: 'granted',
      });
      mockExpoLocation.getCurrentPositionAsync.mockResolvedValueOnce({
        coords: { latitude: 0, longitude: 0, accuracy: 10, altitude: null, altitudeAccuracy: null, heading: null, speed: null },
        timestamp: Date.now(),
      });

      const { result } = renderHook(() => useLocation());

      await act(async () => {
        await result.current.getCurrentLocation();
      });

      expect(result.current.error).toBeNull();
    });

    it('gère les positions avec précision variable', async () => {
      const mockPositionHighAccuracy = {
        coords: {
          latitude: 40.7128,
          longitude: -74.0060,
          accuracy: 5,
          altitude: 100,
          altitudeAccuracy: 10,
          heading: 90,
          speed: 5,
        },
        timestamp: Date.now(),
      };

      mockExpoLocation.requestForegroundPermissionsAsync.mockResolvedValue({
        status: 'granted',
      });
      mockExpoLocation.getCurrentPositionAsync.mockResolvedValue(mockPositionHighAccuracy);

      const { result } = renderHook(() => useLocation());

      await act(async () => {
        await result.current.getCurrentLocation();
      });

      expect(result.current.location).toEqual({
        latitude: 40.7128,
        longitude: -74.0060,
      });
    });

    it('gère les positions avec coordonnées négatives', async () => {
      const mockPositionNegative = {
        coords: {
          latitude: -33.8688,
          longitude: 151.2093,
          accuracy: 15,
          altitude: null,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
        timestamp: Date.now(),
      };

      mockExpoLocation.requestForegroundPermissionsAsync.mockResolvedValue({
        status: 'granted',
      });
      mockExpoLocation.getCurrentPositionAsync.mockResolvedValue(mockPositionNegative);

      const { result } = renderHook(() => useLocation());

      await act(async () => {
        await result.current.getCurrentLocation();
      });

      expect(result.current.location).toEqual({
        latitude: -33.8688,
        longitude: 151.2093,
      });
    });
  });

  // Tests de stabilité et performance
  describe('Tests de stabilité', () => {
    it('gère les appels multiples de getCurrentLocation', async () => {
      mockExpoLocation.requestForegroundPermissionsAsync.mockResolvedValue({
        status: 'granted',
      });
      mockExpoLocation.getCurrentPositionAsync.mockResolvedValue({
        coords: { latitude: 0, longitude: 0, accuracy: 10, altitude: null, altitudeAccuracy: null, heading: null, speed: null },
        timestamp: Date.now(),
      });

      const { result } = renderHook(() => useLocation());

      // Premier appel
      await act(async () => {
        await result.current.getCurrentLocation();
      });

      // Deuxième appel
      await act(async () => {
        await result.current.getCurrentLocation();
      });

      expect(mockExpoLocation.getCurrentPositionAsync).toHaveBeenCalledTimes(2);
    });

    // it('gère les changements de permission en cours d\'exécution', async () => {
    //   // Première permission refusée
    //   mockExpoLocation.requestForegroundPermissionsAsync.mockResolvedValueOnce({
    //     status: 'denied',
    //   });

    //   const { result, rerender } = renderHook(() => useLocation());

    //   await act(async () => {
    //     await result.current.getCurrentLocation();
    //   });

    //   expect(result.current.error).toBeTruthy();

    //   // Deuxième permission accordée
    //   mockExpoLocation.requestForegroundPermissionsAsync.mockResolvedValueOnce({
    //     status: 'granted',
    //   });
    //   mockExpoLocation.getCurrentPositionAsync.mockResolvedValueOnce({
    //     coords: { latitude: 0, longitude: 0, accuracy: 10, altitude: null, altitudeAccuracy: null, heading: null, speed: null },
    //     timestamp: Date.now(),
    //   });

    //   rerender();

    //   await act(async () => {
    //     await result.current.getCurrentLocation();
    //   });

    //   expect(result.current.error).toBeNull();
    // });
  });
}); 