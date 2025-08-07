import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Card, Button, TextInput } from 'react-native-paper';
import MockAPIService from '../services/mockAPIService';

const DataDebugComponent: React.FC = () => {
  const [cities, setCities] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadCities();
  }, []);

  const loadCities = async () => {
    setLoading(true);
    try {
      const apiService = MockAPIService.getInstance();
      const allCities = await apiService.getAllCities();
      setCities(allCities);
      console.log('Villes disponibles:', allCities);
    } catch (error) {
      console.error('Erreur lors du chargement des villes:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchCities = async () => {
    if (!searchTerm.trim()) return;
    
    setLoading(true);
    try {
      const apiService = MockAPIService.getInstance();
      const results = await apiService.searchCities(searchTerm);
      setSearchResults(results);
      console.log(`Résultats pour "${searchTerm}":`, results);
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Title title="Debug - Données de collecte" />
        <Card.Content>
          <Text style={styles.text}>
            Total des villes disponibles: {cities.length}
          </Text>
          
          <TextInput
            label="Rechercher une ville"
            value={searchTerm}
            onChangeText={setSearchTerm}
            style={styles.input}
          />
          
          <Button 
            mode="contained" 
            onPress={searchCities}
            loading={loading}
            style={styles.button}
          >
            Rechercher
          </Button>

          {searchResults.length > 0 && (
            <View style={styles.results}>
              <Text style={styles.subtitle}>Résultats pour "{searchTerm}":</Text>
              {searchResults.map((city, index) => (
                <Text key={index} style={styles.cityItem}>• {city}</Text>
              ))}
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.subtitle}>Premières villes disponibles:</Text>
            {cities.slice(0, 20).map((city, index) => (
              <Text key={index} style={styles.cityItem}>• {city}</Text>
            ))}
            {cities.length > 20 && (
              <Text style={styles.text}>... et {cities.length - 20} autres</Text>
            )}
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  text: {
    fontSize: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    marginVertical: 8,
  },
  button: {
    marginVertical: 8,
  },
  results: {
    marginTop: 16,
  },
  section: {
    marginTop: 16,
  },
  cityItem: {
    fontSize: 14,
    marginVertical: 2,
    paddingLeft: 8,
  },
});

export default DataDebugComponent; 