import React from 'react';
import { View } from 'react-native';

export const SafeAreaView = ({ children, style }: any) => (
  <View style={style}>{children}</View>
);

export const useSafeAreaInsets = () => ({
  top: 44,
  right: 0,
  bottom: 34,
  left: 0,
}); 