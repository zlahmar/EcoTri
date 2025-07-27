import React from 'react';
import { View } from 'react-native';

export const SafeAreaView = ({ children, style, ...props }: any) => {
  return React.createElement('div', { style, ...props }, children);
};

export const useSafeAreaInsets = () => ({
  top: 44,
  right: 0,
  bottom: 34,
  left: 0,
}); 