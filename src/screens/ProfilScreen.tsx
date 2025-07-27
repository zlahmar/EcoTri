import React, { useState, useEffect } from 'react';
import {
  View, Text, Image, TouchableOpacity, StyleSheet, ActivityIndicator,
  ScrollView, TextInput, Modal, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db, storage } from '../../firebaseConfig';
import { getDoc, doc, updateDoc, setDoc, deleteDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes, deleteObject } from "firebase/storage";
import * as ImagePicker from 'expo-image-picker';
import { Button, List, IconButton, Menu, Divider } from 'react-native-paper';
import { colors } from '../styles/colors';

const ProfilScreen = ({ navigation }: { navigation: any }) => {
  const [userData, setUserData] = useState<any>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [stats, setStats] = useState({
    scansCompleted: 0,
    points: 0,
    challengesCompleted: 0,
    level: 1
  });
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) {
      navigation.replace("Login");
      return;
    }

    const fetchUserData = async () => {
      try {
        const docSnap = await getDoc(doc(db, "users", user.uid));
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserData(data);
          setName(data.name || '');
          // Charger les stats si elles existent
          if (data.stats) {
            setStats(data.stats);
          }
        }

        const imageUrl = await getDownloadURL(ref(storage, `profileImages/${user.uid}.jpg`));
        setProfileImage(imageUrl);
      } catch (error) {
        console.log("Aucune image trouvée.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const updateProfile = async () => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);

    try {
      const docSnap = await getDoc(userRef);
      if (!docSnap.exists()) {
        await setDoc(userRef, { name });
      } else {
        await updateDoc(userRef, { name });
      }
      alert("Profil mis à jour !");
      setEditMode(false);
    } catch (err) {
      console.log("Erreur mise à jour:", err);
    }
  };

  const uploadProfileImage = async (uri: string) => {
    if (!user) return;

    try {
      setLoading(true);
      const blob = await (await fetch(uri)).blob();
      const imageRef = ref(storage, `profileImages/${user.uid}.jpg`);
      await uploadBytes(imageRef, blob);
      const url = await getDownloadURL(imageRef);
      setProfileImage(url);
      setMenuVisible(false);
    } catch (err) {
      console.log("Erreur image:", err);
      Alert.alert("Erreur", "Impossible de télécharger l'image");
    } finally {
      setLoading(false);
    }
  };

  const handleImagePick = async (fromCamera = false) => {
    try {
      const result = fromCamera
        ? await ImagePicker.launchCameraAsync({ 
            allowsEditing: true, 
            aspect: [1, 1], 
            quality: 0.8 
          })
        : await ImagePicker.launchImageLibraryAsync({ 
            allowsEditing: true, 
            aspect: [1, 1], 
            quality: 0.8 
          });

      if (!result.canceled) {
        uploadProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("Erreur", "Impossible d'accéder à la caméra/galerie");
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    
    Alert.alert(
      "Supprimer le compte",
      "Cette action est irréversible. Êtes-vous sûr ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            try {
              await user.delete();
              await deleteDoc(doc(db, "users", user.uid));
              await deleteObject(ref(storage, `profileImages/${user.uid}.jpg`));
              alert("Compte supprimé");
              navigation.replace("Home");
            } catch (err) {
              alert("Erreur lors de la suppression");
            }
          }
        }
      ]
    );
  };

  const handleLogout = async () => {
    Alert.alert(
      "Déconnexion",
      "Voulez-vous vraiment vous déconnecter ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Déconnexion",
          onPress: async () => {
            await auth.signOut();
            navigation.replace("Login");
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Button icon="arrow-left" onPress={() => navigation.navigate("Home")}>
            Accueil
          </Button>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.imageContainer}>
              {loading ? (
                <ActivityIndicator size="large" color={colors.primary} />
              ) : (
                <Image 
                  source={{ uri: profileImage || 'https://via.placeholder.com/100' }} 
                  style={styles.profileImage} 
                />
              )}
              <Menu
                visible={menuVisible}
                onDismiss={() => setMenuVisible(false)}
                anchor={
                  <IconButton
                    icon="dots-vertical"
                    size={20}
                    onPress={() => setMenuVisible(true)}
                    style={styles.menuButton}
                  />
                }
              >
                <Menu.Item 
                  onPress={() => {
                    setMenuVisible(false);
                    handleImagePick(false);
                  }} 
                  title="Choisir une image" 
                  leadingIcon="image"
                />
                <Menu.Item 
                  onPress={() => {
                    setMenuVisible(false);
                    handleImagePick(true);
                  }} 
                  title="Prendre une photo" 
                  leadingIcon="camera"
                />
              </Menu>
            </View>
            
            <View style={styles.profileInfo}>
              <Text style={styles.nameText}>{name || "Utilisateur"}</Text>
              <Text style={styles.emailText}>{user?.email}</Text>
              <IconButton 
                icon="pencil" 
                size={20} 
                onPress={() => setEditMode(true)}
                style={styles.editButton}
              />
            </View>
          </View>

          {/* Stats Section */}
          <View style={styles.statsContainer}>
            <Text style={styles.statsTitle}>Vos statistiques</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.scansCompleted}</Text>
                <Text style={styles.statLabel}>Scans</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.points}</Text>
                <Text style={styles.statLabel}>Points</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.challengesCompleted}</Text>
                <Text style={styles.statLabel}>Défis</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.level}</Text>
                <Text style={styles.statLabel}>Niveau</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Actions Section */}
        <List.Section style={styles.actionsSection}>
          <List.Subheader style={styles.sectionTitle}>Fonctionnalités</List.Subheader>
          
          <List.Item 
            title="Notifications" 
            left={() => <List.Icon icon="bell" color={colors.primaryDark} />} 
            onPress={() => Alert.alert("Notifications", "Fonctionnalité à venir")}
            style={styles.listItem}
          />
          <List.Item 
            title="Gamification" 
            left={() => <List.Icon icon="trophy" color={colors.primaryDark} />} 
            onPress={() => Alert.alert("Gamification", "Fonctionnalité à venir")}
            style={styles.listItem}
          />
          <List.Item 
            title="Suivi des défis" 
            left={() => <List.Icon icon="target" color={colors.primaryDark} />} 
            onPress={() => Alert.alert("Défis", "Fonctionnalité à venir")}
            style={styles.listItem}
          />
          <List.Item 
            title="Paramètres" 
            left={() => <List.Icon icon="cog" color={colors.primaryDark} />} 
            onPress={() => Alert.alert("Paramètres", "Fonctionnalité à venir")}
            style={styles.listItem}
          />
        </List.Section>

        {/* Danger Section */}
        <List.Section style={styles.dangerSection}>
          <List.Subheader style={styles.dangerTitle}>Actions dangereuses</List.Subheader>
          
          <List.Item 
            title="Déconnexion" 
            left={() => <List.Icon icon="logout" color="orange" />} 
            onPress={handleLogout}
            style={styles.dangerItem}
            titleStyle={{ color: 'orange' }}
          />
          <List.Item
            title="Supprimer le compte"
            left={() => <List.Icon icon="delete" color="red" />}
            onPress={handleDeleteAccount}
            style={styles.dangerItem}
            titleStyle={{ color: 'red' }}
          />
        </List.Section>

        {/* Edit Name Modal */}
        <Modal visible={editMode} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Modifier votre nom</Text>
              <TextInput 
                style={styles.modalInput} 
                value={name} 
                onChangeText={setName}
                placeholder="Votre nom"
                autoFocus
              />
              <View style={styles.modalButtons}>
                <Button mode="outlined" onPress={() => setEditMode(false)} style={styles.modalButton}>
                  Annuler
                </Button>
                <Button mode="contained" onPress={updateProfile} style={styles.modalButton}>
                  Enregistrer
                </Button>
              </View>
            </View>
          </View>
        </Modal>
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
    padding: 16,
  },
  header: {
    marginBottom: 20,
  },
  profileCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  imageContainer: {
    position: 'relative',
    marginRight: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: colors.primary,
  },
  menuButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: colors.white,
    borderRadius: 12,
  },
  profileInfo: {
    flex: 1,
    position: 'relative',
  },
  nameText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primaryDark,
    marginBottom: 4,
  },
  emailText: {
    fontSize: 14,
    color: colors.text,
    opacity: 0.7,
  },
  editButton: {
    position: 'absolute',
    top: -5,
    right: -5,
  },
  statsContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.secondary,
    paddingTop: 16,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primaryDark,
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.text,
    opacity: 0.7,
    marginTop: 2,
  },
  actionsSection: {
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primaryDark,
  },
  listItem: {
    borderBottomWidth: 0.5,
    borderBottomColor: colors.secondary,
  },
  dangerSection: {
    backgroundColor: colors.white,
    borderRadius: 12,
  },
  dangerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'red',
  },
  dangerItem: {
    borderBottomWidth: 0.5,
    borderBottomColor: colors.secondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 24,
    width: '80%',
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primaryDark,
    marginBottom: 16,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: colors.primaryDark,
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 4,
  },
});

export default ProfilScreen;