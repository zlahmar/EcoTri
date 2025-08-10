import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Card, Button, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import MockAPIService from '../services/mockAPIService';
import { colors } from '../styles/colors';

const APIStatusComponent: React.FC = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [cacheStats, setCacheStats] = useState<any>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const apiService = MockAPIService.getInstance();

  useEffect(() => {
    checkConnectivity();
    updateCacheStats();
  }, []);

  const checkConnectivity = async () => {
    try {
      const connected = await apiService.checkConnectivity();
      setIsConnected(connected);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Erreur lors de la vérification de connectivité:', error);
      setIsConnected(false);
    }
  };

  const updateCacheStats = () => {
    const stats = apiService.getCacheStats();
    setCacheStats(stats);
  };

  const testAPI = async () => {
    setIsTesting(true);
    setTestResult(null);
    
    try {
      const result = await apiService.testAPI();
      setTestResult(result);
      updateCacheStats();
    } catch (error) {
      setTestResult({
        success: false,
        error: (error as Error).message,
      });
    } finally {
      setIsTesting(false);
    }
  };

  const clearCache = () => {
    apiService.clearCache();
    updateCacheStats();
  };

  const getStatusColor = () => {
    if (isConnected === null) return colors.textSecondary;
    return isConnected ? colors.success : colors.error;
  };

  const getStatusIcon = () => {
    if (isConnected === null) return 'help-circle';
    return isConnected ? 'check-circle' : 'close-circle';
  };

  const getStatusText = () => {
    if (isConnected === null) return 'Vérification...';
    return isConnected ? 'Connecté' : 'Déconnecté';
  };

  const formatDate = (date: Date) => {
    return date.toLocaleString('fr-FR');
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  return (
    <ScrollView style={styles.container}>
      {/* Statut de connectivité */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <MaterialCommunityIcons
              name={getStatusIcon() as any}
              size={24}
              color={getStatusColor()}
            />
            <Text style={styles.title}>Statut de l'API</Text>
          </View>
          
          <View style={styles.statusContainer}>
            <Chip
              icon={getStatusIcon() as any}
              mode="outlined"
              textStyle={{ color: getStatusColor() }}
            >
              {getStatusText()}
            </Chip>
            
            {lastUpdate && (
              <Text style={styles.lastUpdate}>
                Dernière vérification: {formatDate(lastUpdate)}
              </Text>
            )}
          </View>

          <View style={styles.buttonContainer}>
            <Button
              mode="outlined"
              onPress={checkConnectivity}
              icon="refresh"
              style={styles.button}
            >
              Vérifier
            </Button>
            
            <Button
              mode="contained"
              onPress={testAPI}
              icon="test-tube"
              loading={isTesting}
              disabled={isTesting}
              style={styles.button}
            >
              Tester l'API
            </Button>
          </View>
        </Card.Content>
      </Card>

      {/* Résultats du test */}
      {testResult && (
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Résultats du test</Text>
            
            <View style={styles.testResult}>
              <Chip
                icon={testResult.success ? 'check' : 'close'}
                mode="outlined"
                textStyle={{ 
                  color: testResult.success ? colors.success : colors.error 
                }}
              >
                {testResult.success ? 'Succès' : 'Échec'}
              </Chip>
              
              {testResult.dataCount && (
                <Text style={styles.testDetail}>
                  Données récupérées: {testResult.dataCount}
                </Text>
              )}
              
              {testResult.responseTime && (
                <Text style={styles.testDetail}>
                  Temps de réponse: {formatDuration(testResult.responseTime)}
                </Text>
              )}
              
              {testResult.error && (
                <Text style={[styles.testDetail, styles.error]}>
                  Erreur: {testResult.error}
                </Text>
              )}
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Statistiques du cache */}
      {cacheStats && (
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.header}>
              <MaterialCommunityIcons name="database" size={24} color={colors.primary} />
              <Text style={styles.title}>Cache local</Text>
            </View>
            
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Entrées en cache</Text>
                <Text style={styles.statValue}>{cacheStats.size}</Text>
              </View>
              
              {cacheStats.oldestEntry && (
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Plus ancienne</Text>
                  <Text style={styles.statValue}>
                    {formatDate(new Date(cacheStats.oldestEntry))}
                  </Text>
                </View>
              )}
              
              {cacheStats.newestEntry && (
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Plus récente</Text>
                  <Text style={styles.statValue}>
                    {formatDate(new Date(cacheStats.newestEntry))}
                  </Text>
                </View>
              )}
            </View>

            <Button
              mode="outlined"
              onPress={clearCache}
              icon="delete"
              style={styles.button}
            >
              Vider le cache
            </Button>
          </Card.Content>
        </Card>
      )}

      {/* Informations sur l'API */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <MaterialCommunityIcons name="information" size={24} color={colors.primary} />
            <Text style={styles.title}>Informations API</Text>
          </View>
          
          <Text style={styles.infoText}>
            L'application utilise l'API nationale de collecte des déchets pour récupérer 
            les horaires de collecte en temps réel.
          </Text>
          
          <Text style={styles.infoText}>
            Les données sont mises en cache localement pour améliorer les performances 
            et réduire la consommation de données.
          </Text>
          
          <Text style={styles.infoText}>
            Le cache expire automatiquement après 24 heures pour garantir 
            la fraîcheur des données.
          </Text>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 16,
    marginTop: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginLeft: 8,
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  lastUpdate: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  testResult: {
    alignItems: 'center',
    gap: 8,
  },
  testDetail: {
    fontSize: 14,
    color: colors.text,
    textAlign: 'center',
  },
  error: {
    color: colors.error,
  },
  statsContainer: {
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  infoText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    marginBottom: 8,
  },
});

export default APIStatusComponent; 