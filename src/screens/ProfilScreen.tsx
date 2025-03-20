import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db, storage } from '../../firebaseConfig';
import { getDoc, doc, updateDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import * as ImagePicker from 'expo-image-picker';
import { Button, List } from 'react-native-paper';
import { colors } from '../styles/colors';

const ProfilScreen = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) {
      navigation.replace("Login");
      return;
    }

    const fetchUserData = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
          setName(userDoc.data().name || '');
        }

        const url = await getDownloadURL(ref(storage, `profileImages/${user.uid}`));
        setProfileImage(url);
      } catch (error) {
        console.log("Aucune image trouvée.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const updateProfile = async () => {
    if (!user || !user.uid) {
      console.log("Erreur: utilisateur non authentifié !");
      return;
    }
  
    const userDocRef = doc(db, "users", user.uid);
    
    try {
      const userDoc = await getDoc(userDocRef);
  
      if (!userDoc.exists()) {
        console.log("⚠️ Le document utilisateur n'existe pas, création en cours...");
        await setDoc(userDocRef, { name: name });
      } else {
        console.log(" Mise à jour du profil...");
        await updateDoc(userDocRef, { name: name });
      }
  
      console.log("Profil mis à jour avec succès !");
      alert("Profil mis à jour !");
    } catch (error) {
      console.log("Erreur lors de la mise à jour du profil :", error);
    }
  };
  
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      uploadProfileImage(uri);
    }
  };

  const takePhoto = async () => {
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      uploadProfileImage(uri);
    }
  };

  const uploadProfileImage = async (uri) => {
    if (!user || !user.uid) {
      console.log("Erreur: utilisateur non authentifié !");
      return;
    }
  
    setLoading(true);
    try {
      console.log("Début de l'upload...");
      const response = await fetch(uri);
      console.log(" Conversion de l'image en blob...");
      const blob = await response.blob();
      console.log("Image convertie en blob...");
  
      // Ajout d'un timestamp pour éviter les conflits
      const imageRef = ref(storage, `profileImages/${user.uid}.jpg`);
      console.log("Référence du fichier:", imageRef.fullPath);
  
      await uploadBytes(imageRef, blob);
      console.log("Image uploadée avec succès !");
  
      const url = await getDownloadURL(imageRef);
      setProfileImage(url);
      console.log("URL de l'image récupérée:", url);
    } catch (error) {
      console.log("Erreur lors du téléversement de l'image :", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await auth.signOut();
    navigation.replace("Login");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Button mode="outlined" onPress={() => navigation.navigate("Home")} style={styles.backButton}>
          Retour à l'accueil
        </Button>

        <TouchableOpacity style={styles.imageContainer}>
          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} />
          ) : (
            <Image
              source={{ uri: profileImage || 'https://via.placeholder.com/100' }}
              style={styles.profileImage}
            />
          )}
        </TouchableOpacity>

        <Button mode="contained" style={styles.editButton} onPress={pickImage}>
          Choisir une image
        </Button>
        <Button mode="contained" style={styles.editButton} onPress={takePhoto}>
          Prendre une photo
        </Button>

        <TextInput
          style={styles.input}
          placeholder="Nom"
          value={name}
          onChangeText={setName}
        />

        <Button mode="contained" style={styles.editButton} onPress={updateProfile}>
          Enregistrer les modifications
        </Button>

        <Text style={styles.email}>{user?.email}</Text>

        <View style={styles.menu}>
          <List.Item title="Paramètres" left={() => <List.Icon icon="cog" color={colors.primaryDark} />} />
          <List.Item title="Détails de facturation" left={() => <List.Icon icon="credit-card" color={colors.primaryDark} />} />
          <List.Item title="Gestion des utilisateurs" left={() => <List.Icon icon="account-group" color={colors.primaryDark} />} />
          <List.Item title="Informations" left={() => <List.Icon icon="information" color={colors.primaryDark} />} />
          <List.Item title="Déconnexion" left={() => <List.Icon icon="logout" color="red" />} onPress={handleLogout} />
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
    alignItems: 'center',
    padding: 20,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  imageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 10,
  },
  profileImage: {
    width: "100%",
    height: "100%",
    borderRadius: 60,
  },
  input: {
    width: "80%",
    padding: 10,
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 8,
    marginBottom: 10,
  },
  editButton: {
    marginTop: 10,
    width: "70%",
    backgroundColor: colors.primary,
  },
  menu: {
    width: "100%",
    marginTop: 20,
    backgroundColor: colors.secondary,
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 10,
  },
});

export default ProfilScreen;
