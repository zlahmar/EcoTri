declare module 'react-native-avatar-generator' {
  import { Component } from 'react';
  import { ViewStyle } from 'react-native';

  interface AvatarProps {
    name?: string;
    size?: number;
    style?: ViewStyle;
    backgroundColor?: string;
    textColor?: string;
    colors?: string[];
  }

  export default class Avatar extends Component<AvatarProps> {}
}
