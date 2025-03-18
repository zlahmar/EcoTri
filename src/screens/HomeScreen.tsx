import React, { useState } from "react";
import { View, TextInput, ScrollView, Image, Text, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MapComponent from "../components/MapComponent";
import { globalStyles } from "../styles/global";
import { Appbar, IconButton, FAB } from "react-native-paper";
import { useLocation } from "../hooks/useLocation";

const HomeScreen = ({ navigation }) => {
  const { location } = useLocation();
  const [selectedFilter, setSelectedFilter] = useState(null);
  const [searchQuery, setSearchQuery] = useState(""); // 🔍 Stocke la recherche
  const [searchedLocation, setSearchedLocation] = useState(null); // 📌 Coordonnées de l'adresse recherchée

  const filters = [
    { type: "Plastique", icon: "recycle", tag: "plastic" },
    { type: "Verre", icon: "glass-fragile", tag: "glass" },
    { type: "Papier", icon: "file-document-outline", tag: "paper" },
    { type: "Métal", icon: "silverware-fork-knife", tag: "metal" },
    { type: "Déchets verts", icon: "leaf", tag: "organic" },
    { type: "Électronique", icon: "battery", tag: "electronics" },
    { type: "Textile", icon: "tshirt-crew", tag: "textile" },
  ];

  /** 🔍 Fonction pour chercher une adresse avec Nominatim */
  const searchLocation = async () => {
    if (!searchQuery.trim()) {
      Alert.alert("Erreur", "Veuillez entrer une adresse.");
      return;
    }
  
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`;
      console.log("URL Nominatim :", url); // 🔍 Vérification
  
      const response = await fetch(url, {
        headers: { "User-Agent": "RecycleFinder/1.0 (zineblahmar1@gmail.com)" }, // ✅ Ajout du User-Agent
      });
  
      const text = await response.text(); // Lire la réponse brute
      console.log("Réponse brute Nominatim :", text); // 🔍 Vérifier la réponse avant de parser
  
      const data = JSON.parse(text); // ✅ Convertir en JSON si possible
  
      if (data.length > 0) {
        const { lat, lon } = data[0]; // 📍 Prendre la première correspondance
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
      {/* 🔍 Carte avec la localisation recherchée */}
      <MapComponent location={searchedLocation || location} filter={selectedFilter} />

      {/* 🔍 Barre de recherche */}
      <View style={globalStyles.searchContainerTop}>
        <Image source={require("../assets/logo.png")} style={globalStyles.searchLogo} />
        <TextInput
          style={globalStyles.searchInput}
          placeholder="Rechercher une adresse..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={searchLocation} // 📌 Lancer la recherche à la validation
          returnKeyType="search"
        />
      </View>

      {/* 🏷️ Filtres */}
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

      {/* 📍 Bouton pour revenir à la position actuelle */}
      <FAB
        icon="crosshairs-gps"
        style={globalStyles.fabLocation}
        onPress={() => setSearchedLocation(location)}
      />

      {/* 🚀 Barre de navigation */}
      <Appbar style={globalStyles.bottomNav}>
        <Appbar.Action icon="home" onPress={() => navigation.navigate("Home")} />
        <Appbar.Action icon="account" onPress={() => navigation.navigate("Profile")} />
        <Appbar.Action icon="lightbulb-on-outline" onPress={() => navigation.navigate("Conseils")} />
      </Appbar>
    </SafeAreaView>
  );
};

export default HomeScreen;
