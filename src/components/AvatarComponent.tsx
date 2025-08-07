import React from 'react';
import { View, StyleSheet } from 'react-native';
import Avatar from 'react-native-avatar-generator';
import { colors } from '../styles/colors';

interface AvatarComponentProps {
  name: string;
  size?: number;
  style?: any;
  colors?: string[];
}

const AvatarComponent: React.FC<AvatarComponentProps> = ({ 
  name, 
  size = 80, 
  style,
  colors: avatarColors = [colors.primary, colors.primaryDark, colors.secondary]
}) => {
  return (
    <View style={[styles.container, style]}>
      <Avatar
        size={size}
        name={name}
        colors={avatarColors}
        style={styles.avatar}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
});

export default AvatarComponent; 