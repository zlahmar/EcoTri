import React, { useEffect, useState } from "react";
import { View, StyleSheet, Text, TouchableOpacity, ActivityIndicator, Platform } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors } from "../styles/colors";
import { globalStyles } from "../styles/global";

// Import conditionnel de react-native-maps seulement sur mobile
let MapView: any = null;
let Marker: any = null;
let PROVIDER_GOOGLE: any = null;

if (Platform.OS !== 'web') {
  const Maps = require("react-native-maps");
  MapView = Maps.default;
  Marker = Maps.Marker;
  PROVIDER_GOOGLE = Maps.PROVIDER_GOOGLE;
}

const MapComponent = ({ mapRef, location, filter }: { 
  mapRef: any; 
  location: { latitude: number; longitude: number } | null; 
  filter: string | null 
}) => {
  const [recyclingPoints, setRecyclingPoints] = useState<any[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<any>(null);
  const [address, setAddress] = useState("");
  const [loadingAddress, setLoadingAddress] = useState(false);

  //Récupère les points de recyclage depuis Overpass API
  const fetchRecyclingPoints = async () => {
    if (!location) return;

    const { latitude, longitude } = location;
    const delta = 0.05;
    const tagFilter = filter ? `["recycling:${filter}"="yes"]` : "";

    const overpassQuery = `
      [out:json];
      node["amenity"="recycling"]${tagFilter}(${latitude - delta},${longitude - delta},${latitude + delta},${longitude + delta});
      out;
    `;

    try {
      const response = await fetch("https://overpass.kumi.systems/api/interpreter", {
        method: "POST",
        headers: { 
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "RecycleFinder/1.0 (zineblahmar1@gmail.com)"
        },
        body: `data=${encodeURIComponent(overpassQuery)}`,
      });

      // Vérifier si la réponse est OK
      if (!response.ok) {
        console.error(`Erreur API: ${response.status}`);
        return;
      }

      const text = await response.text();
      
      if (text.trim().startsWith("<")) {
        console.error("API surchargée - réessayez plus tard");
        return;
      }

      const data = JSON.parse(text);

      if (data.elements) {
        setRecyclingPoints(data.elements.map((el: any) => ({
          id: el.id,
          latitude: el.lat,
          longitude: el.lon,
          tags: el.tags,
        })));
      }
    } catch (error) {
      console.error("Erreur API - réessayez plus tard");
      // En cas d'erreur, on essaie avec un serveur alternatif
      try {
        const response = await fetch("https://overpass-api.de/api/interpreter", {
          method: "POST",
          headers: { 
            "Content-Type": "application/x-www-form-urlencoded",
            "User-Agent": "RecycleFinder/1.0 (zineblahmar1@gmail.com)"
          },
          body: `data=${encodeURIComponent(overpassQuery)}`,
        });

        if (response.ok) {
          const data = await response.json();
          if (data.elements) {
            setRecyclingPoints(data.elements.map((el: any) => ({
              id: el.id,
              latitude: el.lat,
              longitude: el.lon,
              tags: el.tags,
            })));
          }
        }
      } catch (fallbackError) {
        console.error("Erreur API - réessayez plus tard");
      }
    }
  };

  //Formate l'adresse pour n'afficher que le numéro, la rue, le code postal et la ville
  const formatAddress = (data: any) => {
    if (!data || !data.address) return "Adresse non trouvée";
    
    const { house_number, road, postcode, town, city } = data.address;
    return `${house_number ? house_number + " " : ""}${road || ""}, ${postcode || ""} ${town || city || ""}`;
  };

  //Récupère l'adresse via Nominatim
  const fetchAddressFromCoordinates = async (latitude: number, longitude: number) => {
    setLoadingAddress(true);
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`;
      const response = await fetch(url, {
        headers: { "User-Agent": "RecycleFinder/1.0 (zineblahmar1@gmail.com)" },
      });
      const data = await response.json();

      setAddress(formatAddress(data));
    } catch (error) {
      setAddress("Adresse non trouvée");
    }
    setLoadingAddress(false);
  };

  //Sélectionne un point de recyclage et récupère son adresse
  const handleSelectPoint = (point: any) => {
    setSelectedPoint(point);
    fetchAddressFromCoordinates(point.latitude, point.longitude);

    mapRef.current?.animateToRegion({
      latitude: point.latitude,
      longitude: point.longitude,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    });
  };

  //Récupère les points de recyclage à chaque changement de location ou filtre
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchRecyclingPoints();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [location, filter]);

  //Centre la carte sur la position actuelle
  useEffect(() => {
    if (location && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  }, [location]);
  

  //Traduit les types de recyclage en français
  const translateRecyclingType = (tag: string): string => {
    const translations: { [key: string]: string } = {
      "recycling:glass_bottles": "Bouteilles en verre",
      "recycling:glass": "Verre",
      "recycling:plastic": "Plastique",
      "recycling:plastic_bottles": "Bouteilles en plastique",
      "recycling:paper": "Papier",
      "recycling:cardboard": "Carton",
      "recycling:scrap_metal": "Métal",
      "recycling:metal": "Métal",
      "recycling:organic": "Déchets organiques",
      "recycling:electronics": "Électronique",
      "recycling:electrical_appliances": "Appareils électriques",
      "recycling:textile": "Textile",
      "recycling:clothes": "Vêtements",
      "recycling:shoes": "Chaussures",
      "recycling:aluminium": "Aluminium",
      "recycling:steel": "Acier",
      "recycling:tin_cans": "Boîtes de conserve",
      "recycling:oil": "Huile",
      "recycling:batteries": "Piles",
      "recycling:light_bulbs": "Ampoules",
      "recycling:cds": "CD/DVD",
      "recycling:books": "Livres",
      "recycling:magazines": "Magazines",
      "recycling:newspapers": "Journaux",
      "recycling:wood": "Bois",
      "recycling:green_waste": "Déchets verts",
      "recycling:compost": "Compost",
      "recycling:construction_waste": "Déchets de construction",
      "recycling:bulky_waste": "Encombrants",
      "recycling:household_waste": "Déchets ménagers",
      "recycling:general": "Déchets généraux",
      "recycling:food_waste": "Déchets alimentaires",
      "recycling:kitchen_waste": "Déchets de cuisine",
      "recycling:biodegradable": "Déchets biodégradables",
      "recycling:garden_waste": "Déchets de jardin",
      "recycling:printer_cartridges": "Cartouches d'imprimante",
      "recycling:mobile_phones": "Téléphones mobiles",
      "recycling:computers": "Ordinateurs",
      "recycling:white_goods": "Électroménager",
      "recycling:small_appliances": "Petits appareils",
      "recycling:fluorescent_tubes": "Tubes fluorescents",
      "recycling:energy_saving_bulbs": "Ampoules économiques",
      "recycling:car_batteries": "Batteries de voiture",
      "recycling:engine_oil": "Huile moteur",
      "recycling:cooking_oil": "Huile de cuisson",
      "recycling:paint": "Peinture",
      "recycling:chemicals": "Produits chimiques",
      "recycling:medicines": "Médicaments",
      "recycling:ink_cartridges": "Cartouches d'encre",
      "recycling:toner_cartridges": "Cartouches de toner",
      "recycling:plastic_bags": "Sacs plastique",
      "recycling:plastic_packaging": "Emballages plastique",
      "recycling:glass_containers": "Contenants en verre",
      "recycling:aluminum_cans": "Canettes en aluminium",
      "recycling:steel_cans": "Boîtes en acier",
      "recycling:tetra_pak": "Briques Tetra Pak",
      "recycling:wine_corks": "Bouchons de vin",
      "recycling:coffee_capsules": "Capsules de café",
      "recycling:tea_bags": "Sachets de thé",
      "recycling:food_packaging": "Emballages alimentaires"
    };
    
    return translations[tag] || tag.replace("recycling:", "").replace(/_/g, " ");
  };

  // Interface alternative pour le web
  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <View style={styles.webMapContainer}>
          <MaterialCommunityIcons name="map" size={100} color={colors.primary} />
          <Text style={styles.webMapText}>Carte disponible sur mobile</Text>
          <Text style={styles.webMapSubtext}>
            Utilisez l'application sur votre téléphone pour voir la carte interactive
          </Text>
          
          {location && (
            <View style={styles.locationInfo}>
              <Text style={styles.locationText}>
                Votre position : {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
              </Text>
            </View>
          )}
          
          {recyclingPoints.length > 0 && (
            <View style={styles.pointsList}>
              <Text style={styles.pointsTitle}>Points de recyclage trouvés : {recyclingPoints.length}</Text>
              {recyclingPoints.slice(0, 5).map((point, index) => (
                <TouchableOpacity 
                  key={point.id} 
                  style={styles.pointItem}
                  onPress={() => handleSelectPoint(point)}
                >
                  <MaterialCommunityIcons name="recycle" size={24} color={colors.primary} />
                  <Text style={styles.pointText}>Point de recyclage #{index + 1}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {selectedPoint && (
          <View style={styles.infoContainer}>
            <MaterialCommunityIcons name="recycle" size={40} color={colors.primary} />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoText}>
                Type : {Object.keys(selectedPoint.tags)
                  .filter(tag => tag.startsWith("recycling:"))
                  .map(tag => translateRecyclingType(tag))
                  .join(", ")}
              </Text>
              <Text style={styles.infoText}>Adresse : {loadingAddress ? <ActivityIndicator size="small" /> : address}</Text>
            </View>
            <TouchableOpacity onPress={() => setSelectedPoint(null)} style={styles.closeButton}>
              <MaterialCommunityIcons name="close" size={30} color="#FF5733" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView 
        ref={mapRef} 
        style={styles.map} 
        provider={PROVIDER_GOOGLE}
        testID="map-view"
        region={{
          latitude: location?.latitude || 48.8566,
          longitude: location?.longitude || 2.3522,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}>
        {location && (
          <Marker coordinate={location} title="Ma Position" description="Vous êtes ici">
            <View style={globalStyles.blueDot}>
              <View style={globalStyles.innerBlueDot} />
            </View>
          </Marker>
        )}
        {recyclingPoints.map(point => {
          // Vérification de sécurité pour éviter les crashes
          if (!point || !point.latitude || !point.longitude) {
            return null;
          }

          let markerColor = colors.primary; // Couleur par défaut (vert)
          
          if (filter) {
            const filterColors: { [key: string]: string } = {
              "plastic": "#2196F3",    // Bleu
              "glass": "#4CAF50",      // Vert
              "paper": "#FF9800",      // Orange
              "metal": "#9E9E9E",      // Gris
              "organic": "#8BC34A",    // Vert clair
              "electronics": "#FF5722", // Rouge
              "textile": "#E91E63"     // Rose
            };
            markerColor = filterColors[filter] || colors.primary;
          }

          return (
            <Marker
              key={point.id}
              testID="map-marker"
              coordinate={{ latitude: point.latitude, longitude: point.longitude }}
              onPress={() => handleSelectPoint(point)}
              pinColor={markerColor}
            />
          );
        })}
      </MapView>

      {selectedPoint && (
        <View style={styles.infoContainer}>
          <MaterialCommunityIcons name="recycle" size={40} color={colors.primary} />
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoText}>
              Type : {Object.keys(selectedPoint.tags)
                .filter(tag => tag.startsWith("recycling:"))
                .map(tag => translateRecyclingType(tag))
                .join(", ")}
            </Text>
            <Text style={styles.infoText}>Adresse : {loadingAddress ? <ActivityIndicator size="small" /> : address}</Text>
          </View>
          <TouchableOpacity onPress={() => setSelectedPoint(null)} style={styles.closeButton}>
            <MaterialCommunityIcons name="close" size={30} color="#FF5733" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  webMapContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  webMapText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    textAlign: 'center',
  },
  webMapSubtext: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
    color: '#666',
  },
  locationInfo: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
  },
  locationText: {
    fontSize: 14,
    textAlign: 'center',
  },
  pointsList: {
    marginTop: 20,
    width: '100%',
  },
  pointsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  pointItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginVertical: 5,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  pointText: {
    marginLeft: 10,
    fontSize: 16,
  },
  infoContainer: {
    position: "absolute",
    bottom: 70,
    left: 20,
    right: 70,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    flexDirection: "row",
    alignItems: "center",
  },
  infoTextContainer: { flex: 1, marginLeft: 10 },
  infoText: { fontSize: 16, fontWeight: "bold", textAlign: "left", marginTop: 5 },
  closeButton: { position: "absolute", top: 5, right: 5 },
});

export default MapComponent;