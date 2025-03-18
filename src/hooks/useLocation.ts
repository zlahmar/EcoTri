import { useEffect, useState } from "react";
import * as Location from "expo-location";

export const useLocation = () => {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getCurrentLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      setError("Permission de localisation refusée");
      return;
    }
    let loc = await Location.getCurrentPositionAsync({});
    setLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  return { location, error, getCurrentLocation };
};
