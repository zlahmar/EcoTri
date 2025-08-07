import React, { useEffect, useRef } from "react";
import { View, Text, Image, Animated, Dimensions } from "react-native";
import { NavigationProp } from '@react-navigation/native';
import { globalStyles } from "../styles/global";
import { colors } from "../styles/colors";

const { width, height } = Dimensions.get('window');

const SplashScreen = ({ navigation }: { navigation: NavigationProp<any> }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animation d'entrée
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();

    // Animation de rotation continue pour le logo
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();

    // Navigation après 3 secondes
    setTimeout(() => {
      navigation.navigate("Home");
    }, 3000);
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={[globalStyles.container, styles.container]}>
      {/* Fond avec gradient simulé */}
      <View style={styles.background}>
        <View style={styles.gradientTop} />
        <View style={styles.gradientBottom} />
      </View>

      {/* Contenu principal */}
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim }
            ]
          }
        ]}
      >
        {/* Logo avec animation de rotation */}
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          <Image 
            source={require("../assets/logo.png")} 
            style={styles.logo} 
          />
        </Animated.View>

        {/* Nom de l'app */}
        <Text style={styles.appName}>EcoTri</Text>
        
        {/* Tagline */}
        <Text style={styles.tagline}>Transformez vos déchets en trésors</Text>

        {/* Indicateur de chargement */}
        <View style={styles.loadingContainer}>
          <View style={styles.loadingDot} />
          <View style={styles.loadingDot} />
          <View style={styles.loadingDot} />
        </View>
      </Animated.View>

      {/* Éléments décoratifs */}
      <View style={styles.decorativeElements}>
        <View style={[styles.circle, styles.circle1]} />
        <View style={[styles.circle, styles.circle2]} />
        <View style={[styles.circle, styles.circle3]} />
      </View>
    </View>
  );
};

const styles = {
  container: {
    justifyContent: "center" as const,
    alignItems: "center" as const,
    backgroundColor: colors.primary,
  },
  background: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gradientTop: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.6,
    backgroundColor: colors.primary,
  },
  gradientBottom: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.4,
    backgroundColor: colors.primaryDark,
  },
  content: {
    alignItems: 'center' as const,
    zIndex: 10,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  appName: {
    fontSize: 42,
    fontWeight: 'bold' as const,
    color: colors.white,
    marginBottom: 10,
    textShadowColor: colors.primaryDark,
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  tagline: {
    fontSize: 18,
    color: colors.white,
    textAlign: 'center' as const,
    marginBottom: 40,
    paddingHorizontal: 40,
    lineHeight: 24,
    opacity: 0.9,
    textShadowColor: colors.primaryDark,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  loadingContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.white,
    marginHorizontal: 4,
    opacity: 0.7,
  },
  decorativeElements: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  circle: {
    position: 'absolute' as const,
    borderRadius: 50,
    backgroundColor: colors.secondary,
    opacity: 0.3,
  },
  circle1: {
    width: 100,
    height: 100,
    top: height * 0.1,
    right: width * 0.1,
  },
  circle2: {
    width: 60,
    height: 60,
    bottom: height * 0.2,
    left: width * 0.1,
  },
  circle3: {
    width: 80,
    height: 80,
    top: height * 0.6,
    left: width * 0.2,
  },
};

export default SplashScreen;
