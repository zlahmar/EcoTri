import React from "react";
import { View, TextInput } from "react-native";
import MapComponent from "../components/MapComponent";
import { globalStyles } from "../styles/global";
import { Appbar, IconButton } from "react-native-paper";
import { useLocation } from "../hooks/useLocation";

const HomeScreen = ({ navigation }) => {
  const { location } = useLocation();

  const filters = [
    { type: "Plastique", icon: "recycle" },
    { type: "Verre", icon: "glass-fragile" },
    { type: "Papier", icon: "file-document-outline" },
    { type: "Métal", icon: "silverware-fork-knife" },
    { type: "Déchets verts", icon: "leaf" },
  ];

  return (
    <View style={globalStyles.container}>
      {/* ✅ Barre supérieure */}
      <Appbar.Header style={globalStyles.appBar}>
        <Appbar.Action icon="home" onPress={() => navigation.navigate("Home")} />
        <Appbar.Action icon="account" onPress={() => navigation.navigate("Profile")} />
        <Appbar.Action icon="lightbulb-on-outline" onPress={() => navigation.navigate("Conseils")} />
        <Appbar.Action
          icon="crosshairs-gps"
          onPress={() => {
            if (location) {
              console.log("Ma position :", location);
            } else {
              console.log("Localisation non disponible");
            }
          }}
        />
      </Appbar.Header>

      {/* ✅ Filtres bien positionnés sous la barre supérieure */}
      <View style={globalStyles.filterContainer}>
        {filters.map((filter, index) => (
          <IconButton
            key={index}
            icon={filter.icon}
            size={30}
            onPress={() => console.log(`Filtrer par ${filter.type}`)}
          />
        ))}
      </View>

      {/* ✅ Carte bien positionnée en dessous des filtres */}
      <MapComponent />

      {/* ✅ Barre de recherche bien positionnée en bas */}
      <View style={globalStyles.searchContainer}>
        <TextInput
          style={globalStyles.searchInput}
          placeholder="Rechercher un point de recyclage..."
        />
      </View>
    </View>
  );
};

export default HomeScreen;
