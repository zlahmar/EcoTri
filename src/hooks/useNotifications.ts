import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import NotificationService, { NotificationSettings } from '../services/notificationService';
import CollectionScheduleService, { CollectionSchedule } from '../services/collectionScheduleService';

export const useNotifications = (city: string) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    enabled: true,
    reminderTime: 60,
    soundEnabled: true,
    vibrationEnabled: true,
  });
  const [schedules, setSchedules] = useState<CollectionSchedule[]>([]);
  const [loading, setLoading] = useState(false);

  const notificationService = NotificationService.getInstance();
  const scheduleService = CollectionScheduleService.getInstance();

  // Vérifier les permissions au chargement
  useEffect(() => {
    checkPermissions();
    loadSchedules();
  }, [city]);

  const checkPermissions = useCallback(async () => {
    const hasPermissions = await notificationService.checkPermissions();
    setNotificationsEnabled(hasPermissions);
  }, []);

  const loadSchedules = useCallback(async () => {
    try {
      const schedulesData = await scheduleService.getCollectionSchedules(city);
      setSchedules(schedulesData);
    } catch (error) {
      console.error('Erreur lors du chargement des horaires:', error);
    }
  }, [city]);

  const requestPermissions = useCallback(async () => {
    const granted = await notificationService.requestPermissions();
    setNotificationsEnabled(granted);
    
    if (granted) {
      Alert.alert(
        'Permissions accordées',
        'Vous recevrez maintenant des rappels pour les jours de collecte'
      );
    } else {
      Alert.alert(
        'Permissions refusées',
        'Vous pouvez activer les notifications dans les paramètres de votre appareil'
      );
    }
    
    return granted;
  }, []);

  const setupNotifications = useCallback(async () => {
    if (!notificationsEnabled) {
      const granted = await requestPermissions();
      if (!granted) return;
    }

    setLoading(true);
    try {
      // Annuler les notifications existantes
      await notificationService.cancelAllNotifications();
      
      // Configurer les nouvelles notifications
      const notificationIds = await notificationService.setupCityNotifications(
        city,
        schedules,
        notificationSettings
      );
      
      Alert.alert(
        'Notifications configurées',
        `${notificationIds.length} rappels de collecte ont été programmés`
      );
    } catch (error) {
      console.error('Erreur lors de la configuration des notifications:', error);
      Alert.alert('Erreur', 'Impossible de configurer les notifications');
    } finally {
      setLoading(false);
    }
  }, [city, schedules, notificationSettings, notificationsEnabled]);

  const cancelAllNotifications = useCallback(async () => {
    try {
      await notificationService.cancelAllNotifications();
      Alert.alert('Notifications annulées', 'Tous les rappels de collecte ont été supprimés');
    } catch (error) {
      console.error('Erreur lors de l\'annulation des notifications:', error);
      Alert.alert('Erreur', 'Impossible d\'annuler les notifications');
    }
  }, []);

  const testNotification = useCallback(async () => {
    try {
      await notificationService.sendImmediateNotification(
        '🔄 Test de notification',
        'Ceci est un test de notification pour la collecte de déchets',
        { type: 'test' }
      );
      Alert.alert('Test envoyé', 'Une notification de test a été envoyée');
    } catch (error) {
      console.error('Erreur lors de l\'envoi du test:', error);
      Alert.alert('Erreur', 'Impossible d\'envoyer la notification de test');
    }
  }, []);

  const updateNotificationSettings = useCallback((newSettings: Partial<NotificationSettings>) => {
    setNotificationSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const getScheduledNotifications = useCallback(async () => {
    try {
      return await notificationService.getScheduledNotifications();
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications:', error);
      return [];
    }
  }, []);

  const hasCollectionToday = useCallback(async () => {
    try {
      return await scheduleService.hasCollectionToday(city);
    } catch (error) {
      console.error('Erreur lors de la vérification des collectes:', error);
      return false;
    }
  }, [city]);

  const getTodaySchedules = useCallback(async () => {
    try {
      return await scheduleService.getTodaySchedules(city);
    } catch (error) {
      console.error('Erreur lors de la récupération des collectes du jour:', error);
      return [];
    }
  }, [city]);

  const getTomorrowSchedules = useCallback(async () => {
    try {
      return await scheduleService.getTomorrowSchedules(city);
    } catch (error) {
      console.error('Erreur lors de la récupération des collectes de demain:', error);
      return [];
    }
  }, [city]);

  return {
    notificationsEnabled,
    notificationSettings,
    schedules,
    loading,
    checkPermissions,
    requestPermissions,
    setupNotifications,
    cancelAllNotifications,
    testNotification,
    updateNotificationSettings,
    getScheduledNotifications,
    hasCollectionToday,
    getTodaySchedules,
    getTomorrowSchedules,
  };
}; 