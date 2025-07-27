import { renderHook, act } from '@testing-library/react-hooks';
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

  it('retourne la localisation par défaut', () => {
    const { result } = renderHook(() => useLocation());

    expect(result.current.location).toEqual({
      latitude: 48.8566,
      longitude: 2.3522,
    });
    expect(result.current.error).toBeNull();
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
}); 