import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

export const Appbar = {
  Header: ({ children, style }: any) => (
    <View style={style}>{children}</View>
  ),
};

export const IconButton = ({ icon, onPress, style, size, accessibilityLabel }: any) => (
  <TouchableOpacity onPress={onPress} style={style} accessibilityLabel={accessibilityLabel}>
    <Text>{icon}</Text>
  </TouchableOpacity>
);

export const FAB = ({ icon, onPress, style }: any) => (
  <TouchableOpacity onPress={onPress} style={style}>
    <Text>{icon}</Text>
  </TouchableOpacity>
);

export const Button = ({ mode, onPress, children, style, loading }: any) => (
  <TouchableOpacity onPress={onPress} style={style} disabled={loading}>
    <Text>{children}</Text>
  </TouchableOpacity>
);

export const Card = ({ children, style }: any) => (
  <View style={style}>{children}</View>
);

export const Chip = ({ children, style, onPress }: any) => (
  <TouchableOpacity onPress={onPress} style={style}>
    <Text>{children}</Text>
  </TouchableOpacity>
);

export const TextInput = ({ value, onChangeText, placeholder, style, onSubmitEditing, returnKeyType }: any) => (
  <View style={style}>
    <Text>{placeholder}</Text>
  </View>
); 