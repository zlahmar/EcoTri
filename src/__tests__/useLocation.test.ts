import { renderHook, act } from '@testing-library/react-hooks';
import { useLocation } from '../hooks/useLocation';
import * as Location from 'expo-location';

// Mock expo-location
jest.mock('expo-location');

describe('useLocation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('devrait récupérer la localisation avec succès', async () => {
    const mockLocation = {
      coords: {
        latitude: 48.8566,
        longitude: 2.3522,
        accuracy: 10,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
      },
      timestamp: Date.now(),
    };

    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue(mockLocation);

    const { result, waitForNextUpdate } = renderHook(() => useLocation());

    await waitForNextUpdate();

    expect(result.current.location).toEqual({
      latitude: 48.8566,
      longitude: 2.3522,
    });
    expect(result.current.error).toBeNull();
  });

  it('devrait gérer le refus de permission', async () => {
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });

    const { result, waitForNextUpdate } = renderHook(() => useLocation());

    await waitForNextUpdate();

    expect(result.current.location).toBeNull();
    expect(result.current.error).toBe('Permission de localisation refusée');
  });

  it('devrait permettre de récupérer la localisation manuellement', async () => {
    const mockLocation = {
      coords: {
        latitude: 40.7128,
        longitude: -74.0060,
        accuracy: 15,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
      },
      timestamp: Date.now(),
    };

    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue(mockLocation);

    const { result } = renderHook(() => useLocation());

    await act(async () => {
      await result.current.getCurrentLocation();
    });

    expect(result.current.location).toEqual({
      latitude: 40.7128,
      longitude: -74.0060,
    });
    expect(result.current.error).toBeNull();
  });

  it('devrait gérer les erreurs de récupération de localisation', async () => {
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
    (Location.getCurrentPositionAsync as jest.Mock).mockRejectedValue(new Error('GPS non disponible'));

    const { result } = renderHook(() => useLocation());

    await act(async () => {
      await result.current.getCurrentLocation();
    });

    expect(result.current.location).toBeNull();
  });
}); 