import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  Alert, ActivityIndicator, Image 
} from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db, storage } from '../../firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Button } from 'react-native-paper';

import { colors } from '../styles/colors';

const SignupScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // Demander la permission d'accès à la galerie
const requestPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission refusée', 'Vous devez autoriser l\'accès à la galerie pour choisir une image.');
      return false;
    }
    return true;
  };

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
  const uploadImage = async (uid) => {
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
    } catch (error) {
      console.log("Erreur lors du téléchargement de l'image:", error.code, error.message);
      return null;
    }
  };
  const handleSignup = async () => {
    if (!email || !password || !name) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs.");
      return;
    }

    setLoading(true);
    console.log('🌀 Tentative de création de compte avec:', email);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('Utilisateur créé avec succès:', user.uid);
    if (!auth.currentUser) {
        throw new Error("Utilisateur non authentifié.");
      }
      console.log("Utilisateur connecté :", auth.currentUser?.uid);
      const imageUrl = await uploadImage(user.uid);

      await setDoc(doc(db, "users", user.uid), {
        name: name,
        email: email,
        profileImage: imageUrl || null,
      });
      console.log('Utilisateur ajouté à Firestore');
  
      navigation.replace("Login");
    } catch (error) {
      console.log('Erreur lors de la création du compte:', error.message);
      Alert.alert("Erreur", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Créer un compte</Text>
      <Button mode="outlined" onPress={() => navigation.navigate("Home")} style={styles.backButton}>
          Retour à l'accueil
        </Button>
      <TouchableOpacity onPress={pickImage}>
        <Image 
          source={profileImage ? { uri: profileImage } : require('../assets/logo.png')} 
          style={styles.profileImage} 
        />
        <Text style={styles.addPhotoText}>Ajouter une photo</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={takePhoto}>
        <Text style={styles.addPhotoText}>Ajouter une photo</Text>
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="Nom"
        placeholderTextColor="#999"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#999"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Mot de passe"
        placeholderTextColor="#999"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} />
      ) : (
        <TouchableOpacity style={styles.button} onPress={handleSignup}>
          <Text style={styles.buttonText}>S'inscrire</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.loginText} onPress={() => navigation.navigate("Login")}>
        Déjà un compte ? <Text style={styles.loginLink}>Connectez-vous</Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: colors.primaryDark,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  addPhotoText: {
    color: colors.primaryDark,
    textDecorationLine: "underline",
    marginBottom: 15,
  },
  input: {
    width: "100%",
    padding: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  loginText: {
    marginTop: 15,
    color: "#666",
  },
  loginLink: {
    color: colors.primaryDark,
    textDecorationLine: "underline",
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
});

export default SignupScreen;