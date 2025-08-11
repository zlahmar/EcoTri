import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TextInput, Button, IconButton, Card } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { auth } from '../firebaseConfig';

import { colors } from '../styles/colors';

const LoginScreen = ({ navigation }: { navigation: any }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Veuillez remplir tous les champs.");
      return;
    }
  
    setLoading(true);
    setError("");
  
    try {
      await auth().signInWithEmailAndPassword(email, password);
      navigation.replace("Profile");
    } catch (err: any) {
      if (err.code === "auth/user-not-found") {
        Alert.alert(
          "Compte introuvable",
          "Aucun compte trouvé avec cet email. Voulez-vous créer un compte ?",
          [
            { text: "Annuler", style: "cancel" },
            { text: "S'inscrire", onPress: () => navigation.navigate("Signup") }
          ]
        );
      } else {
        setError("Email ou mot de passe incorrect.");
      }
    } finally {
      setLoading(false);
    }
  };  

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <IconButton
            icon="arrow-left"
            size={30}
            onPress={() => navigation.navigate("Home")}
          />
          <Text style={styles.headerTitle}>Connexion</Text>
        </View>

        {/* Bienvenue Section */}
        <View style={styles.welcomeSection}>
          <View style={styles.logoContainer}>
            <Image 
              source={require('../assets/logo.png')} 
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.welcomeTitle}>Bon retour !</Text>
          <Text style={styles.welcomeSubtitle}>Connectez-vous pour continuer votre parcours écologique</Text>
        </View>

        {/* Formulaire Section */}
        <Card style={styles.formCard}>
          <Card.Content style={styles.cardContent}>
            {error ? (
              <View style={styles.errorContainer}>
                <MaterialCommunityIcons name="alert-circle" size={20} color={colors.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Adresse email Input */}
            <View style={styles.inputContainer}>
              <TextInput
                label="Adresse email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                mode="outlined"
                style={styles.modernInput}
                left={<TextInput.Icon icon="email" />}
                outlineStyle={styles.inputOutline}
                contentStyle={styles.inputContent}
                theme={{
                  colors: {
                    primary: colors.primary,
                    outline: colors.primary + '40',
                    onSurfaceVariant: colors.text + '80',
                  }
                }}
              />
            </View>

            {/* Mot de passe Input */}
            <View style={styles.inputContainer}>
              <TextInput
                label="Mot de passe"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                mode="outlined"
                style={styles.modernInput}
                left={<TextInput.Icon icon="lock" />}
                right={
                  <TextInput.Icon
                    icon={showPassword ? "eye-off" : "eye"}
                    onPress={() => setShowPassword(!showPassword)}
                  />
                }
                outlineStyle={styles.inputOutline}
                contentStyle={styles.inputContent}
                theme={{
                  colors: {
                    primary: colors.primary,
                    outline: colors.primary + '40',
                    onSurfaceVariant: colors.text + '80',
                  }
                }}
              />
            </View>

            {/* Connexion Button */}
            <Button
              mode="contained"
              onPress={handleLogin}
              disabled={loading}
              loading={loading}
              style={styles.modernButton}
              buttonColor={colors.primary}
              textColor={colors.white}
              labelStyle={styles.buttonLabel}
              contentStyle={styles.buttonContent}
            >
              {loading ? 'Connexion en cours...' : 'Se connecter'}
            </Button>

            {/* Création de compte Link */}
            <TouchableOpacity 
              onPress={() => navigation.navigate("Signup")}
              style={styles.signupLink}
            >
              <Text style={styles.signupText}>
                Pas encore de compte ? <Text style={styles.signupTextBold}>Créer un compte</Text>
              </Text>
            </TouchableOpacity>
          </Card.Content>
        </Card>

        {/* Fonctionnalités Preview */}
        <View style={styles.featuresSection}>
          <Text style={styles.featuresTitle}>Avec EcoTri, vous pouvez :</Text>
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <MaterialCommunityIcons name="camera" size={24} color={colors.primary} />
              <Text style={styles.featureText}>Scanner vos déchets intelligemment</Text>
            </View>
            <View style={styles.featureItem}>
              <MaterialCommunityIcons name="chart-line" size={24} color={colors.success} />
              <Text style={styles.featureText}>Suivre vos progrès écologiques</Text>
            </View>
            <View style={styles.featureItem}>
              <MaterialCommunityIcons name="lightbulb" size={24} color={colors.warning} />
              <Text style={styles.featureText}>Recevoir des conseils personnalisés</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primaryDark,
    marginLeft: 10,
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoContainer: {
    marginBottom: 20,
  },
  logoImage: {
    width: 120,
    height: 120,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primaryDark,
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    opacity: 0.8,
    paddingHorizontal: 20,
  },
  formCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 30,
  },
  cardContent: {
    padding: 20,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.error + '20',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: colors.error,
    marginLeft: 8,
    fontSize: 14,
  },
  inputContainer: {
    marginBottom: 20,
  },
  modernInput: {
    backgroundColor: colors.white,
    fontSize: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  inputOutline: {
    borderRadius: 16,
    borderWidth: 2,
  },
  inputContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  modernButton: {
    marginTop: 24,
    marginBottom: 16,
    borderRadius: 16,
    elevation: 4,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonContent: {
    paddingVertical: 8,
    paddingHorizontal: 24,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  signupLink: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  signupText: {
    fontSize: 14,
    color: colors.text,
  },
  signupTextBold: {
    fontWeight: 'bold',
    color: colors.primary,
  },
  featuresSection: {
    marginTop: 20,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primaryDark,
    marginBottom: 16,
    textAlign: 'center',
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  featureText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 12,
    flex: 1,
  },
});

export default LoginScreen;
