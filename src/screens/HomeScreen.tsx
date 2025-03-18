import React, { useState } from "react";
import { View, TextInput, ScrollView, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MapComponent from "../components/MapComponent";
import { globalStyles } from "../styles/global";
import { Appbar, IconButton, FAB } from "react-native-paper";
import { useLocation } from "../hooks/useLocation";

const HomeScreen = ({ navigation }) => {
  const { location } = useLocation();
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);

  const filters = [
    { type: "Plastique", icon: "recycle", tag: "plastic" },
    { type: "Verre", icon: "glass-fragile", tag: "glass" },
    { type: "Papier", icon: "file-document-outline", tag: "paper" },
    { type: "Métal", icon: "silverware-fork-knife", tag: "metal" },
    { type: "Déchets verts", icon: "leaf", tag: "organic" },
    { type: "Électronique", icon: "battery", tag: "electronics" },
    { type: "Textile", icon: "tshirt-crew", tag: "textile" },
  ];

  return (
    <SafeAreaView style={globalStyles.container}>
      <MapComponent location={location} selectedFilter={selectedFilter} />
      <View style={globalStyles.searchContainerTop}>
        <Image source={require("../assets/logo.png")} style={globalStyles.searchLogo} />
        <TextInput
          style={globalStyles.searchInput}
          placeholder="Rechercher un point de recyclage..."
        />
      </View>

      {/* ✅ Filtres en boutons flottants en haut */}
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

      <FAB
        icon="crosshairs-gps"
        style={globalStyles.fabLocation}
        onPress={() => {
          if (location) {
            console.log("Ma position :", location);
          } else {
            console.log("Localisation non disponible");
          }
        }}
      />

      <Appbar style={globalStyles.bottomNav}>
        <Appbar.Action icon="home" onPress={() => navigation.navigate("Home")} />
        <Appbar.Action icon="account" onPress={() => navigation.navigate("Profile")} />
        <Appbar.Action icon="lightbulb-on-outline" onPress={() => navigation.navigate("Conseils")} />
      </Appbar>
    </SafeAreaView>
  );
};

export default HomeScreen;
