import React, { useState, useEffect } from 'react';
import { View, Text, Alert, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Appbar, Portal, Modal, TextInput, Button, Card, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import CollectionScheduleComponent from '../components/CollectionScheduleComponent';
import DataDebugComponent from '../components/DataDebugComponent';
import CollectionScheduleService from '../services/collectionScheduleService';
import { createGlobalStyles } from '../styles/global';
import { colors } from '../styles/colors';

const CollectionNotificationsScreen = ({ navigation }: { navigation: any }) => {
  const insets = useSafeAreaInsets();
  const globalStyles = createGlobalStyles(insets);
  const [selectedCity, setSelectedCity] = useState('centre ville');
  const [showCityModal, setShowCityModal] = useState(false);
  const [citySearch, setCitySearch] = useState('');
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [todayCollections, setTodayCollections] = useState<any[]>([]);
  const [tomorrowCollections, setTomorrowCollections] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentCity, setCurrentCity] = useState('');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  const scheduleService = CollectionScheduleService.getInstance();

  useEffect(() => {
    loadData();
    getCurrentCity();
  }, [selectedCity]);

  const getCurrentCity = async () => {
    try {
      setIsLoadingLocation(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission de localisation refusée');
        setCurrentCity('Localisation non autorisée');
        return;
      }
      
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      const address = await Location.reverseGeocodeAsync({ latitude, longitude });
      
      if (address.length > 0) {
        const { city, region } = address[0];
        const cityName = city || region || 'Ville inconnue';
        setCurrentCity(cityName);
        console.log(' Ville détectée pour la collecte:', cityName);
      } else {
        setCurrentCity('Ville non trouvée');
      }
    } catch (error) {
      console.log('Erreur lors de la récupération de la ville:', error);
      setCurrentCity('Erreur de localisation');
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [cities, today, tomorrow] = await Promise.all([
        scheduleService.getAvailableCities(),
        scheduleService.getTodaySchedules(selectedCity),
        scheduleService.getTomorrowSchedules(selectedCity),
      ]);
      
      setAvailableCities(cities);
      setTodayCollections(today);
      setTomorrowCollections(tomorrow);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    setShowCityModal(false);
    setCitySearch('');
  };

  const useCurrentLocation = () => {
    if (currentCity && currentCity !== 'Localisation non autorisée' && currentCity !== 'Ville non trouvée' && currentCity !== 'Erreur de localisation') {
      // Recherche d'une ville correspondante dans les villes disponibles
      const matchingCity = availableCities.find(city => 
        city.toLowerCase().includes(currentCity.toLowerCase()) || 
        currentCity.toLowerCase().includes(city.toLowerCase())
      );
      
      if (matchingCity) {
        handleCityChange(matchingCity);
      } else {
        // Si aucune correspondance exacte, utilisation de la ville détectée directement
        setSelectedCity(currentCity);
      }
    }
  };

  const filteredCities = availableCities.filter(city =>
    city.toLowerCase().includes(citySearch.toLowerCase())
  );

  const getTypeIcon = (type: string): string => {
    const icons: { [key: string]: string } = {
      plastic: 'recycle',
      glass: 'glass-fragile',
      paper: 'file-document-outline',
      metal: 'silverware-fork-knife',
      organic: 'leaf',
      electronics: 'battery',
      textile: 'tshirt-crew',
    };
    return icons[type] || 'help-circle';
  };

  const getTypeColor = (type: string): string => {
    const typeInfo = scheduleService.getCollectionTypeInfo(type);
    return typeInfo.color;
  };

  const getTypeName = (type: string): string => {
    const typeInfo = scheduleService.getCollectionTypeInfo(type);
    return typeInfo.name;
  };

  const renderTodayCollections = () => {
    if (isLoading) {
      return (
        <View style={styles.noCollectionContainer}>
          <MaterialCommunityIcons name="loading" size={48} color={colors.primary} />
          <Text style={styles.noCollectionText}>Chargement des collectes...</Text>
        </View>
      );
    }
    
    if (todayCollections.length === 0) {
      return (
        <View style={styles.noCollectionContainer}>
          <MaterialCommunityIcons name="calendar-blank" size={48} color={colors.secondary} />
          <Text style={styles.noCollectionText}>Aucune collecte aujourd'hui</Text>
        </View>
      );
    }

    return (
      <View style={styles.collectionsContainer}>
        <Text style={styles.collectionsTitle}>Collectes aujourd'hui</Text>
        {todayCollections.map((collection) => (
          <View key={collection.id} style={styles.collectionItem}>
            <MaterialCommunityIcons
              name={getTypeIcon(collection.type) as any}
              size={24}
              color={getTypeColor(collection.type)}
            />
            <View style={styles.collectionInfo}>
              <Text style={styles.collectionType}>{getTypeName(collection.type)}</Text>
              <Text style={styles.collectionTime}>à {collection.time}</Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderTomorrowCollections = () => {
    if (isLoading || tomorrowCollections.length === 0) {
      return null;
    }

    return (
      <View style={styles.collectionsContainer}>
        <Text style={styles.collectionsTitle}>Collectes demain</Text>
        {tomorrowCollections.map((collection) => (
          <View key={collection.id} style={styles.collectionItem}>
            <MaterialCommunityIcons
              name={getTypeIcon(collection.type) as any}
              size={24}
              color={getTypeColor(collection.type)}
            />
            <View style={styles.collectionInfo}>
              <Text style={styles.collectionType}>{getTypeName(collection.type)}</Text>
              <Text style={styles.collectionTime}>à {collection.time}</Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

     return (
     <SafeAreaView style={styles.safeAreaContainer}>
       <View style={styles.container}>
         <View style={styles.header}>
           <IconButton
             icon="arrow-left"
             size={30}
             onPress={() => navigation.navigate('Home')}
           />
           <Text style={styles.headerTitle}>Horaires de collecte</Text>
         </View>

               {/* Affichage de la ville*/}
                 <View style={styles.citySection}>
          <TouchableOpacity 
            style={styles.cityDisplayContainer}
            onPress={() => setShowCityModal(true)}
            activeOpacity={0.7}
          >
            <View style={styles.cityDisplay}>
              <MaterialCommunityIcons name="city" size={32} color={colors.primary} />
              <Text style={styles.cityName}>{selectedCity}</Text>
              <MaterialCommunityIcons name="chevron-down" size={24} color={colors.secondary} />
            </View>
            <Text style={styles.citySubtitle}>Appuyez pour changer de ville</Text>
          </TouchableOpacity>

          {/* Information de géolocalisation */}
          {currentCity && (
            <View style={styles.locationInfo}>
              <View style={styles.locationRow}>
                <MaterialCommunityIcons name="map-marker" size={16} color={colors.success} />
                <Text style={styles.locationText}>
                  {isLoadingLocation ? 'Localisation en cours...' : `Vous êtes à ${currentCity}`}
                </Text>
              </View>
              {currentCity !== selectedCity && !isLoadingLocation && currentCity !== 'Localisation non autorisée' && currentCity !== 'Ville non trouvée' && currentCity !== 'Erreur de localisation' && (
                <TouchableOpacity onPress={useCurrentLocation} style={styles.useLocationButton}>
                  <MaterialCommunityIcons name="crosshairs-gps" size={16} color={colors.primary} />
                  <Text style={styles.useLocationText}>Utiliser ma position</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

         {/* Résumé des collectes */}
         <Card style={styles.summaryCard}>
           <Card.Content>
             {renderTodayCollections()}
             {renderTomorrowCollections()}
           </Card.Content>
         </Card>

         {/* Composant des horaires de collecte */}
         <CollectionScheduleComponent 
           city={selectedCity}
           onCityChange={handleCityChange}
         />
       </View>

       {/* Modal de sélection de ville */}
       <Portal>
        <Modal
          visible={showCityModal}
          onDismiss={() => setShowCityModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Choisir une ville</Text>
            <TextInput
              placeholder="Rechercher une ville..."
              value={citySearch}
              onChangeText={setCitySearch}
              style={styles.searchInput}
              mode="outlined"
            />
          </View>
          
          <ScrollView style={styles.cityList} showsVerticalScrollIndicator={true}>
            {filteredCities.map((city) => (
              <TouchableOpacity
                key={city}
                style={styles.cityItem}
                onPress={() => handleCityChange(city)}
              >
                <MaterialCommunityIcons name="city" size={20} color={colors.primary} />
                <Text style={styles.cityItemText}>{city}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          <Button
            mode="outlined"
            onPress={() => setShowCityModal(false)}
            style={styles.cancelButton}
          >
            Annuler
          </Button>
        </Modal>
      </Portal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  cityDisplayContainer: {
    padding: 20,
    alignItems: 'center',
  },
  cityDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  cityName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginHorizontal: 12,
  },
  citySubtitle: {
    fontSize: 14,
    color: colors.secondary,
    fontStyle: 'italic',
  },
  citySection: {
    backgroundColor: colors.white,
    marginBottom: 8,
    elevation: 2,
  },
  locationInfo: {
    padding: 16,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: colors.background,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 12,
    color: colors.text,
    marginLeft: 6,
    opacity: 0.8,
  },
  useLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '20',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  useLocationText: {
    fontSize: 12,
    color: colors.primary,
    marginLeft: 4,
    fontWeight: '600',
  },
  summaryCard: {
    margin: 16,
    marginBottom: 8,
    elevation: 2,
  },
  noCollectionContainer: {
    alignItems: 'center',
    padding: 20,
  },
  noCollectionText: {
    fontSize: 16,
    color: colors.secondary,
    marginTop: 8,
    textAlign: 'center',
  },
  collectionsContainer: {
    marginBottom: 16,
  },
  collectionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  collectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.background,
    borderRadius: 8,
    marginBottom: 4,
  },
  collectionInfo: {
    marginLeft: 12,
    flex: 1,
  },
  collectionType: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  collectionTime: {
    fontSize: 12,
    color: colors.text,
    marginTop: 2,
    fontWeight: '500',
  },
  modalContainer: {
    backgroundColor: colors.white,
    margin: 20,
    padding: 20,
    borderRadius: 8,
    maxHeight: '80%',
  },
  modalHeader: {
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  searchInput: {
    marginBottom: 16,
  },
  cityList: {
    maxHeight: 300,
    flexGrow: 0,
  },
  cityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.secondary,
  },
  cityItemText: {
    fontSize: 16,
    color: colors.text,
    marginLeft: 12,
  },
  cancelButton: {
    marginTop: 20,
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
  safeAreaContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    padding: 20,
  },

});

export default CollectionNotificationsScreen; 