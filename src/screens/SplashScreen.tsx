import React, { useEffect } from "react";
import { View, Text, Image, StyleSheet } from "react-native";

import { NavigationProp } from '@react-navigation/native';
import { globalStyles } from "../styles/global";
const SplashScreen = ({ navigation }: { navigation: NavigationProp<any> }) => {
  useEffect(() => {
    setTimeout(() => {
      navigation.navigate("Home");
    }, 3000);
  }, []);

  return (
    <View style={[globalStyles.container, { justifyContent: "center", alignItems: "center" }]}>
      <Image source={require("../assets/logo1.png")} style={globalStyles.logo} />
      <Text style={globalStyles.appName}>EcoTri</Text>
    </View>
  );
};

export default SplashScreen;
