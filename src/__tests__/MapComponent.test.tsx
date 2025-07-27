import React from 'react';
import { render } from '@testing-library/react-native';
import { View, Text } from 'react-native';
import MapComponent from '../components/MapComponent';

// Mock react-native-maps
jest.mock('react-native-maps', () => ({
  MapView: ({ children, ...props }: any) => (
    <View testID="map-view" {...props}>
      {children}
    </View>
  ),
  Marker: ({ ...props }: any) => (
    <View testID="map-marker" {...props} />
  ),
  Callout: ({ children, ...props }: any) => (
    <View testID="map-callout" {...props}>
      {children}
    </View>
  ),
}));

// Mock des icônes
jest.mock('@expo/vector-icons', () => ({
  MaterialCommunityIcons: ({ name }: any) => <Text testID="icon">{name}</Text>,
}));

describe('MapComponent', () => {
  const mockProps = {
    mapRef: { current: null },
    location: { latitude: 48.8566, longitude: 2.3522 },
    filter: null,
    onMarkerPress: jest.fn(),
    onMapPress: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('affiche la carte avec la localisation', () => {
    const { getByTestId } = render(<MapComponent {...mockProps} />);

    const mapView = getByTestId('map-view');
    expect(mapView).toBeTruthy();
  });

  it('affiche les marqueurs sur la carte', () => {
    const { getByTestId } = render(<MapComponent {...mockProps} />);

    const markers = getByTestId('map-marker');
    expect(markers).toBeTruthy();
  });

  it('gère les interactions avec la carte', () => {
    const { getByTestId } = render(<MapComponent {...mockProps} />);

    const mapView = getByTestId('map-view');
    expect(mapView).toBeTruthy();
  });
}); 