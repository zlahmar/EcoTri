import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { useLocation } from "../hooks/useLocation";
import { Icon } from "react-native-paper";

const iconMap = {
  plastic: "recycle",
  glass: "glass-fragile",
  paper: "file-document-outline",
  metal: "silverware-fork-knife",
  organic: "leaf",
  electronics: "battery",
  textile: "tshirt-crew",
};

const MapComponent = ({
  location,
  selectedFilter,
}: {
  location: { latitude: number; longitude: number } | null;
  selectedFilter: string | null;
}) => {
  const mapRef = useRef<MapView | null>(null);
  const [recyclingPoints, setRecyclingPoints] = useState([]);

  const fetchRecyclingPoints = async () => {
    if (!location) return;

    const { latitude, longitude } = location;
    const delta = 0.05; // Zone de recherche

    const tagFilter = selectedFilter ? `["recycling:${selectedFilter}"="yes"]` : "";

    const overpassQuery = `
      [out:json];
      node
        ["amenity"="recycling"]
        ${tagFilter}
        (${latitude - delta},${longitude - delta},${latitude + delta},${longitude + delta});
      out;
    `;

    const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(
      overpassQuery
    )}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.elements) {
        const points = data.elements.map((element) => ({
          id: element.id,
          latitude: element.lat,
          longitude: element.lon,
        }));
        setRecyclingPoints(points);
      }
    } catch (error) {
      console.error("Erreur récupération points de recyclage:", error);
    }
  };

  useEffect(() => {
    fetchRecyclingPoints();
  }, [location, selectedFilter]);

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

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        region={{
          latitude: location?.latitude || 48.8566,
          longitude: location?.longitude || 2.3522,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
      >
        {location && (
          <Marker coordinate={location} title="Ma Position" description="Vous êtes ici" />
        )}

        {recyclingPoints.map((point) => (
          <Marker
            key={point.id}
            coordinate={{ latitude: point.latitude, longitude: point.longitude }}
            title="Point de recyclage"
          >
            <Icon source={iconMap[selectedFilter || "plastic"]} size={30} />
          </Marker>
        ))}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
});

export default MapComponent;
