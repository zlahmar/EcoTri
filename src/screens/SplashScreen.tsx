// src/screens/SplashScreen.tsx
import React, { useEffect } from "react";
import { View, Text, Image, StyleSheet } from "react-native";

import { NavigationProp } from '@react-navigation/native';
import { globalStyles } from "../styles/global";
const SplashScreen = ({ navigation }: { navigation: NavigationProp<any> }) => {
  useEffect(() => {
    setTimeout(() => {
      navigation.navigate("Home");
    }, 3000); // 3 secondes d'attente
  }, []);

  return (
    <View style={globalStyles.container}>
      <Image source={require("../assets/logo.png")} style={globalStyles.logo} />
      <Text style={globalStyles.appName}>Recycle</Text>
    </View>
  );
};

export default SplashScreen;
