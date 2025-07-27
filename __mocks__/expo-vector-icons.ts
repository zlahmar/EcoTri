import React from 'react';
import { Text } from 'react-native';

export const MaterialCommunityIcons = ({ name, size, color, ...props }: any) => (
  <Text testID="icon" {...props}>{name}</Text>
);

export const MaterialIcons = ({ name, size, color, ...props }: any) => (
  <Text testID="icon" {...props}>{name}</Text>
);

export const Ionicons = ({ name, size, color, ...props }: any) => (
  <Text testID="icon" {...props}>{name}</Text>
);

export const FontAwesome = ({ name, size, color, ...props }: any) => (
  <Text testID="icon" {...props}>{name}</Text>
);

export const FontAwesome5 = ({ name, size, color, ...props }: any) => (
  <Text testID="icon" {...props}>{name}</Text>
);

export default {
  MaterialCommunityIcons,
  MaterialIcons,
  Ionicons,
  FontAwesome,
  FontAwesome5,
}; 