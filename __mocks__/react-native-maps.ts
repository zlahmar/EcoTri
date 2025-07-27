import React from 'react';
import { View } from 'react-native';

export const MapView = ({ children, ...props }: any) => (
  <View testID="map-view" {...props}>
    {children}
  </View>
);

export const Marker = ({ ...props }: any) => (
  <View testID="map-marker" {...props} />
);

export const Callout = ({ children, ...props }: any) => (
  <View testID="map-callout" {...props}>
    {children}
  </View>
); 