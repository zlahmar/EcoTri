import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ActivityIndicator,
  ScrollView, TextInput, Modal, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db } from '../../firebaseConfig';
import { getDoc, doc, updateDoc, setDoc, deleteDoc } from "firebase/firestore";
import { Button, List, IconButton } from 'react-native-paper';
import { colors } from '../styles/colors';
import Avatar from 'react-native-avatar-generator';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';

const ProfilScreen = ({ navigation }: { navigation: any }) => {
  const [, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [stats, setStats] = useState({
    scansCompleted: 0,
    points: 0,
    challengesCompleted: 0,
    level: 1,
    categoriesScanned: [],
    weeklyScans: 0,
    monthlyScans: 0,
    currentStreak: 0,
    bestStreak: 0,
    lastScanDate: null,
    categoryStats: {
      Plastique: 0,
      Métal: 0,
      Papier: 0,
      Verre: 0,
      Carton: 0,
      Autre: 0
    }
  });
  const user = auth.currentUser;

  // Calcul des habitudes et tendances
  const calculateHabits = () => {
    const totalScans = stats.scansCompleted;
    const categories = Object.keys(stats.categoryStats || {});
    
    // Sécurisation de la fonction reduce
    let mostScannedCategory = 'Aucune';
    if (categories.length > 0) {
      mostScannedCategory = categories.reduce((a, b) => 
        ((stats.categoryStats as any)[a] || 0) > ((stats.categoryStats as any)[b] || 0) ? a : b
      );
      if (((stats.categoryStats as any)[mostScannedCategory] || 0) === 0) {
        mostScannedCategory = 'Aucune';
      }
    }
    
    const recyclingFrequency = stats.weeklyScans > 7 ? 'Quotidien' : 
                              stats.weeklyScans > 3 ? 'Régulier' : 
                              stats.weeklyScans > 0 ? 'Occasionnel' : 'Inactif';
    
    const progress = Math.min((stats.points / (stats.level * 100)) * 100, 100);
    
    return {
      mostScannedCategory,
      recyclingFrequency,
      progress,
      totalScans
    };
  };

  const habits = calculateHabits();

  const handleRefresh = () => {
    setLoading(true);
    fetchUserData();
    getCurrentCity();
  };

  const getCurrentCity = async () => {
    try {
      // Demande des permissions de localisation
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission de localisation refusée');
        setCity('Localisation non autorisée');
        return;
      }

      // Récupération de la position actuelle
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      // Géocodage inverse pour récupérer l'adresse
      const address = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (address.length > 0) {
        const { city, region } = address[0];
        const cityName = city || region || 'Ville inconnue';
        setCity(cityName);
        console.log(' Ville détectée:', cityName);
      } else {
        setCity('Ville non trouvée');
      }
    } catch (error) {
      console.log('Erreur lors de la récupération de la ville:', error);
      setCity('Erreur de localisation');
    }
  };

  const fetchUserData = async () => {
    try {
      // Essai de chargement depuis Firestore d'abord
      try {
        const docSnap = await getDoc(doc(db, "users", user!.uid));
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserData(data);
          setName(data.name || '');
          if (data.stats) {
            setStats(data.stats);
            return;
          }
        }
      } catch {
        console.log("Firestore non disponible, utilisation des stats locales");
      }

      // Si Firestore ne fonctionne pas, chargement depuis AsyncStorage
      const statsKey = `user_stats_${user!.uid}`;
      const localStatsJson = await AsyncStorage.getItem(statsKey);
      if (localStatsJson) {
        const localStats = JSON.parse(localStatsJson);
        setStats(localStats);
        console.log(" Statistiques chargées depuis le stockage local:", localStats);
      } else {
        console.log(" Aucunes statistiques trouvées, utilisation des valeurs par défaut");
      }

    } catch (error) {
      console.log("Erreur lors du chargement des données utilisateur:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigation.replace("Login");
      return;
    }

    fetchUserData();
    getCurrentCity();
  }, []);

  const updateProfile = async () => {
    if (!user) return;
    
    setIsSaving(true);
    setSaveSuccess(false);
    
    const userRef = doc(db, "users", user.uid);

    try {
      const docSnap = await getDoc(userRef);
      if (!docSnap.exists()) {
        await setDoc(userRef, { name });
      } else {
        await updateDoc(userRef, { name });
      }
      
      setSaveSuccess(true);
      setEditMode(false);
      
      setTimeout(() => {
        setSaveSuccess(false);
      }, 2000);
      
    } catch (error) {
      console.log("Erreur mise à jour:", error);
      Alert.alert("Erreur", "Impossible de mettre à jour le profil");
    } finally {
      setIsSaving(false);
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
              alert("Compte supprimé");
              navigation.replace("Home");
            } catch (error) {
              console.log("Erreur lors de la suppression:", error);
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

  // Génération d'un nom pour l'avatar (utilise le nom ou l'email)
  const avatarName = name || user?.email?.split('@')[0] || 'Utilisateur';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <IconButton
            icon="arrow-left"
            size={30}
            onPress={() => navigation.navigate("Home")}
          />
          <Text style={styles.title}>Profil</Text>
        </View>

        {/* Carte de profil */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.imageContainer}>
              {loading ? (
                <ActivityIndicator size="large" color={colors.primary} />
              ) : (
                <Avatar
                  size={80}
                  name={avatarName}
                  colors={[colors.primary, colors.primaryDark, colors.secondary]}
                  style={styles.profileImage}
                />
              )}
            </View>
            
            <View style={styles.profileInfo}>
              <View style={styles.nameContainer}>
                <Text style={styles.nameText}>{name || "Utilisateur"}</Text>
                {saveSuccess && (
                  <View style={styles.successIndicator}>
                    <Text style={styles.successText}>✓</Text>
                  </View>
                )}
              </View>
              <Text style={styles.emailText}>{user?.email}</Text>
              {city && (
                <View style={styles.cityContainer}>
                  <Text style={styles.cityText}>📍 {city}</Text>
                </View>
              )}
              <IconButton 
                icon="pencil" 
                size={20} 
                onPress={() => setEditMode(true)}
                style={styles.editButton}
              />
            </View>
          </View>

          {/* Section des statistiques */}
          <View style={styles.statsContainer}>
            <View style={styles.statsHeader}>
              <Text style={styles.statsTitle}>Suivi des habitudes</Text>
            </View>
            
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.scansCompleted}</Text>
                <Text style={styles.statLabel}>Total Scans</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.currentStreak}</Text>
                <Text style={styles.statLabel}>Série actuelle</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.weeklyScans}</Text>
                <Text style={styles.statLabel}>Cette semaine</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>Niv. {stats.level}</Text>
                <Text style={styles.statLabel}>{stats.points} pts</Text>
              </View>
            </View>

            <View style={styles.progressContainer}>
              <Text style={styles.progressLabel}>Progression vers niveau {stats.level + 1}</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${habits.progress}%` }]} />
              </View>
              <Text style={styles.progressText}>{Math.round(habits.progress)}%</Text>
            </View>

            <View style={styles.habitsContainer}>
              <Text style={styles.habitsTitle}>🌱 Vos habitudes</Text>
              <View style={styles.habitItem}>
                <Text style={styles.habitLabel}>Fréquence:</Text>
                <Text style={[styles.habitValue, { 
                  color: habits.recyclingFrequency === 'Quotidien' ? colors.success :
                         habits.recyclingFrequency === 'Régulier' ? colors.primary :
                         habits.recyclingFrequency === 'Occasionnel' ? colors.warning : colors.error
                }]}>{habits.recyclingFrequency}</Text>
              </View>
              <View style={styles.habitItem}>
                <Text style={styles.habitLabel}>Catégorie préférée:</Text>
                <Text style={styles.habitValue}>{habits.mostScannedCategory}</Text>
              </View>
              <View style={styles.habitItem}>
                <Text style={styles.habitLabel}>Meilleure série:</Text>
                <Text style={styles.habitValue}>{stats.bestStreak} jours</Text>
              </View>
            </View>

            <View style={styles.categoriesContainer}>
              <Text style={styles.categoriesTitle}>📊 Répartition par catégories</Text>
              <View style={styles.categoriesGrid}>
                {Object.entries(stats.categoryStats || {}).map(([category, count]) => (
                  <View key={category} style={styles.categoryItem}>
                    <Text style={styles.categoryEmoji}>
                      {category === 'Plastique' ? '🥤' :
                       category === 'Métal' ? '🥫' :
                       category === 'Papier' ? '📄' :
                       category === 'Verre' ? '🍾' :
                       category === 'Carton' ? '📦' : '♻️'}
                    </Text>
                    <Text style={styles.categoryName}>{category}</Text>
                    <Text style={styles.categoryCount}>{count || 0}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Section des actions */}
        <List.Section style={styles.actionsSection}>
          <List.Subheader style={styles.sectionTitle}>Actions</List.Subheader>
          
          <List.Item 
            title="Guide d'utilisation" 
            description="Apprenez à utiliser l'application"
            left={() => <List.Icon icon="help-circle" color={colors.primary} />} 
            right={() => <List.Icon icon="chevron-right" color={colors.text} />}
            onPress={() => navigation.navigate("Guide")}
            style={styles.listItem}
          />
          
          <List.Item 
            title="Actualiser les données" 
            description="Recharger vos statistiques"
            left={() => <List.Icon icon="refresh" color={colors.success} />} 
            onPress={handleRefresh}
            style={styles.listItem}
          />
        </List.Section>

        {/* Section du compte */}
        <List.Section style={styles.dangerSection}>
          <List.Subheader style={styles.dangerTitle}>Compte</List.Subheader>
          
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

        {/* Modale de modification du nom */}
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
                onSubmitEditing={updateProfile}
                returnKeyType="done"
                blurOnSubmit={true}
              />
              <View style={styles.modalButtons}>
                <Button 
                  mode="outlined" 
                  onPress={() => setEditMode(false)} 
                  style={styles.modalButton}
                  disabled={isSaving}
                >
                  Annuler
                </Button>
                <Button 
                  mode="contained" 
                  onPress={updateProfile} 
                  style={styles.modalButton}
                  loading={isSaving}
                  disabled={isSaving}
                  buttonColor={saveSuccess ? colors.success : colors.primary}
                  textColor={colors.white}
                >
                  {saveSuccess ? '✓ Sauvegardé' : isSaving ? 'Sauvegarde...' : 'Enregistrer'}
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
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primaryDark,
    marginLeft: 10,
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
    marginRight: 16,
  },
  profileImage: {
    borderWidth: 3,
    borderColor: colors.primary,
  },
  profileInfo: {
    flex: 1,
    position: 'relative',
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  nameText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primaryDark,
  },
  successIndicator: {
    marginLeft: 8,
    backgroundColor: colors.success,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  emailText: {
    fontSize: 14,
    color: colors.text,
    opacity: 0.7,
  },
  cityContainer: {
    marginTop: 4,
  },
  cityText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
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
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressContainer: {
    marginTop: 16,
    marginBottom: 16,
  },
  progressLabel: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.mediumGray,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: colors.text,
    textAlign: 'center',
    marginTop: 4,
  },
  habitsContainer: {
    backgroundColor: colors.lightGray,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  habitsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primaryDark,
    marginBottom: 12,
  },
  habitItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  habitLabel: {
    fontSize: 14,
    color: colors.text,
  },
  habitValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  categoriesContainer: {
    marginTop: 16,
  },
  categoriesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primaryDark,
    marginBottom: 12,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryItem: {
    width: '48%',
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.mediumGray,
  },
  categoryEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  categoryName: {
    fontSize: 12,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  categoryCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primaryDark,
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