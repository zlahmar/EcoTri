import React from 'react';
import { Text } from 'react-native';

export const MaterialCommunityIcons = ({ name, size, color, style }: any) => (
  <Text style={[style, { fontSize: size, color }]}>{name}</Text>
); 