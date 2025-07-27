import React from 'react';

export const View = ({ children, ...props }: any) => React.createElement('div', props, children);
export const Text = ({ children, ...props }: any) => React.createElement('span', props, children);
export const TouchableOpacity = ({ children, onPress, ...props }: any) => 
  React.createElement('button', { ...props, onClick: onPress }, children);
export const TextInput = ({ onChangeText, value, placeholder, ...props }: any) => 
  React.createElement('input', { ...props, onChange: (e: any) => onChangeText(e.target.value), value, placeholder });
export const ScrollView = ({ children, ...props }: any) => React.createElement('div', props, children);
export const FlatList = ({ data, renderItem, keyExtractor, ...props }: any) => 
  React.createElement('div', props, data?.map((item: any, index: number) => 
    React.createElement('div', { key: keyExtractor ? keyExtractor(item, index) : index }, renderItem({ item, index }))
  ));
export const Image = ({ source, ...props }: any) => React.createElement('img', { ...props, src: source?.uri || source });

export const Modal = ({ children, visible, ...props }: any) => 
  visible ? React.createElement('div', { ...props, 'data-testid': 'modal' }, children) : null;

export const ActivityIndicator = ({ size, color, ...props }: any) => 
  React.createElement('div', { ...props, 'data-testid': 'activity-indicator' }, 'Loading...');

export const Platform = {
  OS: 'web',
  select: jest.fn((obj: any) => obj.web || obj.default),
};
export const Dimensions = {
  get: jest.fn(() => ({ width: 375, height: 667 })),
};
export const StatusBar = {
  setBarStyle: jest.fn(),
};
export const Linking = {
  openURL: jest.fn(),
};
export const BackHandler = {
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
};
export const Keyboard = {
  dismiss: jest.fn(),
};
export const Animated = {
  Value: jest.fn(() => ({ setValue: jest.fn(), addListener: jest.fn() })),
  timing: jest.fn(() => ({ start: jest.fn() })),
};
export const StyleSheet = {
  create: (styles: any) => styles,
  absoluteFill: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  flatten: (style: any) => style,
}; 