import React, { useState, useRef} from "react";
import { View, TextInput, ScrollView, Image, Text, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MapComponent from "../components/MapComponent";
import { globalStyles } from "../styles/global";
import { Appbar, IconButton, FAB } from "react-native-paper";
import { useLocation } from "../hooks/useLocation";

const HomeScreen = ({ navigation }) => {
  const mapRef = useRef(null);
  const { location } = useLocation();
  const [selectedFilter, setSelectedFilter] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchedLocation, setSearchedLocation] = useState(null);

  const filters = [
    { type: "Plastique", icon: "recycle", tag: "plastic" },
    { type: "Verre", icon: "glass-fragile", tag: "glass" },
    { type: "Papier", icon: "file-document-outline", tag: "paper" },
    { type: "Métal", icon: "silverware-fork-knife", tag: "metal" },
    { type: "Déchets verts", icon: "leaf", tag: "organic" },
    { type: "Électronique", icon: "battery", tag: "electronics" },
    { type: "Textile", icon: "tshirt-crew", tag: "textile" },
  ];

  const searchLocation = async () => {
    if (!searchQuery.trim()) {
      Alert.alert("Erreur", "Veuillez entrer une adresse.");
      return;
    }
  
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`;
      console.log("URL Nominatim :", url);
  
      const response = await fetch(url, {
        headers: { "User-Agent": "RecycleFinder/1.0 (zineblahmar1@gmail.com)" },
      });
  
      const text = await response.text();
      console.log("Réponse brute Nominatim :", text);
  
      const data = JSON.parse(text);
  
      if (data.length > 0) {
        const { lat, lon } = data[0];
        setSearchedLocation({ latitude: parseFloat(lat), longitude: parseFloat(lon) });
      } else {
        Alert.alert("Adresse non trouvée", "Essayez une autre adresse.");
      }
    } catch (error) {
      console.error("Erreur lors de la recherche :", error);
      Alert.alert("Erreur", "Impossible de rechercher cette adresse.");
    }
  };
  

  return (
    <SafeAreaView style={globalStyles.container}>
      <MapComponent mapRef={mapRef} location={searchedLocation || location} filter={selectedFilter} />

      <View style={globalStyles.searchContainerTop}>
        <Image source={require("../assets/logo.png")} style={globalStyles.searchLogo} />
        <TextInput
          style={globalStyles.searchInput}
          placeholder="Rechercher une adresse..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={searchLocation}
          returnKeyType="search"
        />
      </View>

      {/*Filtres */}
      <View style={globalStyles.filterContainerFloating}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {filters.map((filter, index) => (
            <IconButton
              key={index}
              icon={filter.icon}
              size={30}
              style={[
                globalStyles.filterButton,
                selectedFilter === filter.tag ? { backgroundColor: "#4CAF50" } : {},
              ]}
              onPress={() => setSelectedFilter(filter.tag === selectedFilter ? null : filter.tag)}
            />
          ))}
        </ScrollView>
      </View>

      {/*Revenir à la position actuelle */}
      <FAB
  icon="crosshairs-gps"
  style={globalStyles.fabLocation}
  onPress={() => {
    console.log("Valeur de location :", location);
    console.log("Valeur de mapRef :", mapRef.current);

    if (location && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    } else {
      Alert.alert("Erreur", "Localisation non disponible.");
    }
  }}
/>
      {/*Barre de navigation */}
      <Appbar style={globalStyles.bottomNav}>
        <Appbar.Action icon="home" onPress={() => navigation.navigate("Home")} />
        <Appbar.Action icon="account" onPress={() => navigation.navigate("Profile")} />
        <Appbar.Action icon="lightbulb-on-outline" onPress={() => navigation.navigate("Conseils")} />
      </Appbar>
    </SafeAreaView>
  );
};

export default HomeScreen;
