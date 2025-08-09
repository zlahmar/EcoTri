import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, Alert, ScrollView, TouchableOpacity, Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TextInput, Button, IconButton, Card } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db, storage } from '../../firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../styles/colors';

const SignupScreen = ({ navigation }: { navigation: any }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');

  // const requestPermission = async () => {
  //   const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  //   if (status !== 'granted') {
  //     Alert.alert('Permission refusée', 'Vous devez autoriser l\'accès à la galerie pour choisir une image.');
  //     return false;
  //   }
  //   return true;
  // };

  const takePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });
  
      if (!result.canceled) {
        console.log('Photo prise:', result.assets[0].uri);
        setProfileImage(result.assets[0].uri);
      } else {
        console.log('Aucune photo prise');
      }
    } catch (error) {
      console.log('Erreur lors de la prise de la photo:', error);
    }
  };
  // Choisir une image depuis la galerie
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });
  
      if (!result.canceled) {
        console.log('Image sélectionnée:', result.assets[0].uri);
        setProfileImage(result.assets[0].uri);
      } else {
        console.log('Aucune image sélectionnée');
      }
    } catch (error) {
      console.log('Erreur lors de la sélection de l\'image:', error);
    }
  };

  // Fonction pour uploader l'image et obtenir l'URL
  const uploadImage = async (uid: string) => {
    if (!profileImage) return null;
  
    try {
      console.log("Début du téléchargement de l'image...");
      
      const response = await fetch(profileImage);
      const blob = await response.blob();
      console.log("Conversion de l'image en blob...");
  
      const imageRef = ref(storage, `profileImages/${uid}.jpg`);
      console.log("Référence du fichier image:", imageRef.fullPath);
  
      await uploadBytes(imageRef, blob);
      console.log("Image uploadée avec succès");
  
      const downloadURL = await getDownloadURL(imageRef);
      console.log("URL de l'image:", downloadURL);
  
      return downloadURL;
    } catch (error: any) {
      console.log("Erreur lors du téléchargement de l'image:", error.code, error.message);
      return null;
    }
  };

  const handleSignup = async () => {
    if (!email || !password || !name || !confirmPassword) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Erreur", "Les mots de passe ne correspondent pas.");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Erreur", "Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    setLoading(true);

    console.log('Tentative de création de compte avec:', email);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      console.log('Utilisateur créé avec succès:', user.uid);
      
      // Vérifier si l'utilisateur est bien authentifié
      if (!auth.currentUser) {
        throw new Error("Utilisateur non authentifié.");
      }
      console.log(" Utilisateur connecté :", auth.currentUser?.uid);

      // Uploader l'image et récupérer l'URL
      const imageUrl = await uploadImage(user.uid);

      // Ajouter l'utilisateur dans Firestore
      await setDoc(doc(db, "users", user.uid), {
        name: name,
        email: email,
        profileImage: imageUrl || null, // Stocker l'URL ou null si pas d'image
      });
      console.log(' Utilisateur ajouté à Firestore');
      
      Alert.alert("Succès", "Compte créé avec succès !");
      navigation.replace("Profile");
    } catch (error: any) {
      console.log(' Erreur lors de la création du compte:', error.message);
      Alert.alert("Erreur", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <IconButton
            icon="arrow-left"
            size={30}
            onPress={() => navigation.navigate("Home")}
          />
          <Text style={styles.headerTitle}>Créer un compte</Text>
        </View>

        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <View style={styles.logoContainer}>
            <Image 
              source={require('../assets/logo.png')} 
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.welcomeTitle}>Rejoignez EcoTri !</Text>
          <Text style={styles.welcomeSubtitle}>Créez votre compte et commencez votre parcours écologique</Text>
        </View>

        {/* Form Card */}
        <Card style={styles.formCard}>
          <Card.Content style={styles.cardContent}>
            {/* Profile Image Section */}
            <View style={styles.imageSection}>
              <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
                {profileImage ? (
                  <Image source={{ uri: profileImage }} style={styles.profileImage} />
                ) : (
                  <View style={styles.placeholderImage}>
                    <MaterialCommunityIcons name="camera-plus" size={40} color={colors.primary} />
                  </View>
                )}
              </TouchableOpacity>
              <Text style={styles.imageText}>Photo de profil (optionnelle)</Text>
              <View style={styles.imageButtons}>
                <Button 
                  mode="outlined" 
                  onPress={pickImage}
                  style={styles.imageButton}
                  textColor={colors.primary}
                >
                  Galerie
                </Button>
                <Button 
                  mode="outlined" 
                  onPress={takePhoto}
                  style={styles.imageButton}
                  textColor={colors.primary}
                >
                  Caméra
                </Button>
              </View>
            </View>

            {/* Form Fields */}
            <View style={styles.inputContainer}>
              <TextInput
                label="Nom complet"
                value={name}
                onChangeText={setName}
                mode="outlined"
                style={styles.modernInput}
                left={<TextInput.Icon icon="account" />}
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

            <View style={styles.inputContainer}>
              <TextInput
                label="Confirmer le mot de passe"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPassword}
                mode="outlined"
                style={styles.modernInput}
                left={<TextInput.Icon icon="lock-check" />}
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

            {/* Signup Button */}
            <Button
              mode="contained"
              onPress={handleSignup}
              disabled={loading}
              loading={loading}
              style={styles.modernButton}
              buttonColor={colors.primary}
              textColor={colors.white}
              labelStyle={styles.buttonLabel}
              contentStyle={styles.buttonContent}
            >
              {loading ? 'Création en cours...' : 'Créer mon compte'}
            </Button>

            {/* Login Link */}
            <TouchableOpacity 
              onPress={() => navigation.navigate("Login")}
              style={styles.loginLink}
            >
              <Text style={styles.loginText}>
                Déjà un compte ? <Text style={styles.loginTextBold}>Se connecter</Text>
              </Text>
            </TouchableOpacity>
          </Card.Content>
        </Card>
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
  imageSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  imageContainer: {
    marginBottom: 12,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  placeholderImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
  },
  imageText: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 12,
  },
  imageButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  imageButton: {
    borderColor: colors.primary,
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
  loginLink: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  loginText: {
    fontSize: 14,
    color: colors.text,
  },
  loginTextBold: {
    fontWeight: 'bold',
    color: colors.primary,
  },
});

export default SignupScreen;
