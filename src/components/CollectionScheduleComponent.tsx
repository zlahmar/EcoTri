import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Card } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import CollectionScheduleService, { CollectionSchedule } from '../services/collectionScheduleService';
import { colors } from '../styles/colors';

interface CollectionScheduleComponentProps {
  city: string;
  onCityChange?: (newCity: string) => void;
}

const CollectionScheduleComponent: React.FC<CollectionScheduleComponentProps> = ({
  city,
}) => {
  const [, setSchedules] = useState<CollectionSchedule[]>([]);
  const [weekSchedules, setWeekSchedules] = useState<{ [day: string]: CollectionSchedule[] }>({});
  const [loading, setLoading] = useState(true);

  const scheduleService = CollectionScheduleService.getInstance();

  useEffect(() => {
    loadData();
  }, [city]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [schedulesData, weekData] = await Promise.all([
        scheduleService.getCollectionSchedules(city),
        scheduleService.getWeekSchedules(city),
      ]);
      
      setSchedules(schedulesData);
      setWeekSchedules(weekData);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      Alert.alert('Erreur', 'Impossible de charger les horaires de collecte');
    } finally {
      setLoading(false);
    }
  };

  const getDayName = (dayOfWeek: number): string => {
    const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    return days[dayOfWeek];
  };

  const getTypeName = (type: string): string => {
    const types: { [key: string]: string } = {
      plastic: 'Plastique',
      glass: 'Verre',
      paper: 'Papier',
      metal: 'Métal',
      organic: 'Déchets verts',
      electronics: 'Électronique',
      textile: 'Textile',
    };
    return types[type] || type;
  };

  const renderScheduleCard = (schedule: CollectionSchedule) => (
    <Card key={schedule.id} style={styles.scheduleCard}>
      <Card.Content>
        <View style={styles.scheduleRow}>
          <MaterialCommunityIcons
            name="recycle"
            size={24}
            color={colors.primary}
          />
          <View style={styles.scheduleText}>
            <Text style={styles.scheduleType}>{getTypeName(schedule.type)}</Text>
            <Text style={styles.scheduleTime}>
              {getDayName(schedule.dayOfWeek)} à {schedule.time}
            </Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );



  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Chargement des horaires...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Horaires de collecte */}
      <Card style={styles.schedulesCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Planning de la semaine</Text>
          
          {Object.entries(weekSchedules).map(([day, daySchedules]) => (
            <View key={day} style={styles.dayContainer}>
              <Text style={styles.dayTitle}>{day}</Text>
              {daySchedules.map(renderScheduleCard)}
            </View>
          ))}
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
  schedulesCard: {
    margin: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  scheduleCard: {
    marginBottom: 8,
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scheduleText: {
    marginLeft: 12,
    flex: 1,
  },
  scheduleType: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  scheduleTime: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },

  dayContainer: {
    marginBottom: 16,
  },
  dayTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 8,
  },
});

export default CollectionScheduleComponent; 