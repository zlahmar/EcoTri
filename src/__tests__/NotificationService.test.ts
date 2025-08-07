import NotificationService, { NotificationSettings, CollectionSchedule } from '../services/notificationService';
import CollectionScheduleService from '../services/collectionScheduleService';

// Mock des modules Expo
jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  cancelScheduledNotificationAsync: jest.fn(),
  cancelAllScheduledNotificationsAsync: jest.fn(),
  getAllScheduledNotificationsAsync: jest.fn(),
  addNotificationReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  addNotificationResponseReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
}));

jest.mock('expo-device', () => ({
  isDevice: true,
}));

jest.mock('expo-constants', () => ({
  expoConfig: {
    extra: {
      eas: {
        projectId: 'test-project-id',
      },
    },
  },
}));

describe('NotificationService', () => {
  let notificationService: NotificationService;

  beforeEach(() => {
    notificationService = NotificationService.getInstance();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getInstance', () => {
    it('should return the same instance', () => {
      const instance1 = NotificationService.getInstance();
      const instance2 = NotificationService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('requestPermissions', () => {
    it('should request permissions successfully', async () => {
      const { getPermissionsAsync, requestPermissionsAsync } = require('expo-notifications');
      
      getPermissionsAsync.mockResolvedValue({ status: 'undetermined' });
      requestPermissionsAsync.mockResolvedValue({ status: 'granted' });

      const result = await notificationService.requestPermissions();
      
      expect(result).toBe(true);
      expect(getPermissionsAsync).toHaveBeenCalled();
      expect(requestPermissionsAsync).toHaveBeenCalled();
    });

    it('should return false when permissions are denied', async () => {
      const { getPermissionsAsync, requestPermissionsAsync } = require('expo-notifications');
      
      getPermissionsAsync.mockResolvedValue({ status: 'denied' });
      requestPermissionsAsync.mockResolvedValue({ status: 'denied' });

      const result = await notificationService.requestPermissions();
      
      expect(result).toBe(false);
    });
  });

  describe('checkPermissions', () => {
    it('should return true when permissions are granted', async () => {
      const { getPermissionsAsync } = require('expo-notifications');
      getPermissionsAsync.mockResolvedValue({ status: 'granted' });

      const result = await notificationService.checkPermissions();
      
      expect(result).toBe(true);
    });

    it('should return false when permissions are denied', async () => {
      const { getPermissionsAsync } = require('expo-notifications');
      getPermissionsAsync.mockResolvedValue({ status: 'denied' });

      const result = await notificationService.checkPermissions();
      
      expect(result).toBe(false);
    });
  });

  describe('scheduleCollectionReminder', () => {
    const mockSchedule: CollectionSchedule = {
      id: 'test-schedule',
      type: 'plastic',
      dayOfWeek: 1, // Lundi
      time: '06:00',
      enabled: true,
      location: 'Paris',
    };

    const mockSettings: NotificationSettings = {
      enabled: true,
      reminderTime: 60,
      soundEnabled: true,
      vibrationEnabled: true,
    };

    it('should schedule a notification successfully', async () => {
      const { scheduleNotificationAsync } = require('expo-notifications');
      scheduleNotificationAsync.mockResolvedValue('test-notification-id');

      const result = await notificationService.scheduleCollectionReminder(mockSchedule, mockSettings);
      
      expect(result).toBe('test-notification-id');
      expect(scheduleNotificationAsync).toHaveBeenCalledWith({
        content: {
          title: '🔄 Rappel de collecte',
          body: 'N\'oubliez pas de sortir vos déchets plastique demain à 06:00',
          data: {
            type: 'collection_reminder',
            collectionType: 'plastic',
            location: 'Paris',
          },
          sound: 'default',
        },
        trigger: {
          hour: 5,
          minute: 0,
          weekday: 1,
          repeats: true,
        },
      });
    });

    it('should return null when notifications are disabled', async () => {
      const disabledSettings: NotificationSettings = {
        ...mockSettings,
        enabled: false,
      };

      const result = await notificationService.scheduleCollectionReminder(mockSchedule, disabledSettings);
      
      expect(result).toBeNull();
    });
  });

  describe('cancelNotification', () => {
    it('should cancel a notification successfully', async () => {
      const { cancelScheduledNotificationAsync } = require('expo-notifications');
      cancelScheduledNotificationAsync.mockResolvedValue(undefined);

      await notificationService.cancelNotification('test-notification-id');
      
      expect(cancelScheduledNotificationAsync).toHaveBeenCalledWith('test-notification-id');
    });
  });

  describe('cancelAllNotifications', () => {
    it('should cancel all notifications successfully', async () => {
      const { cancelAllScheduledNotificationsAsync } = require('expo-notifications');
      cancelAllScheduledNotificationsAsync.mockResolvedValue(undefined);

      await notificationService.cancelAllNotifications();
      
      expect(cancelAllScheduledNotificationsAsync).toHaveBeenCalled();
    });
  });

  describe('getScheduledNotifications', () => {
    it('should return scheduled notifications', async () => {
      const { getAllScheduledNotificationsAsync } = require('expo-notifications');
      const mockNotifications = [
        { identifier: 'test-1', content: { title: 'Test 1' } },
        { identifier: 'test-2', content: { title: 'Test 2' } },
      ];
      getAllScheduledNotificationsAsync.mockResolvedValue(mockNotifications);

      const result = await notificationService.getScheduledNotifications();
      
      expect(result).toEqual(mockNotifications);
      expect(getAllScheduledNotificationsAsync).toHaveBeenCalled();
    });
  });

  describe('sendImmediateNotification', () => {
    it('should send an immediate notification', async () => {
      const { scheduleNotificationAsync } = require('expo-notifications');
      scheduleNotificationAsync.mockResolvedValue('test-notification-id');

      const result = await notificationService.sendImmediateNotification(
        'Test Title',
        'Test Body',
        { test: 'data' }
      );
      
      expect(result).toBe('test-notification-id');
      expect(scheduleNotificationAsync).toHaveBeenCalledWith({
        content: {
          title: 'Test Title',
          body: 'Test Body',
          data: { test: 'data' },
        },
        trigger: null,
      });
    });
  });

  describe('setupCityNotifications', () => {
    const mockSchedules: CollectionSchedule[] = [
      {
        id: 'schedule-1',
        type: 'plastic',
        dayOfWeek: 1,
        time: '06:00',
        enabled: true,
        location: 'Paris',
      },
      {
        id: 'schedule-2',
        type: 'glass',
        dayOfWeek: 2,
        time: '06:00',
        enabled: false,
        location: 'Paris',
      },
    ];

    const mockSettings: NotificationSettings = {
      enabled: true,
      reminderTime: 60,
      soundEnabled: true,
      vibrationEnabled: true,
    };

    it('should setup notifications for enabled schedules only', async () => {
      const { scheduleNotificationAsync } = require('expo-notifications');
      scheduleNotificationAsync.mockResolvedValue('test-notification-id');

      const result = await notificationService.setupCityNotifications(
        'Paris',
        mockSchedules,
        mockSettings
      );
      
      expect(result).toEqual(['test-notification-id']);
      expect(scheduleNotificationAsync).toHaveBeenCalledTimes(1); // Only for enabled schedule
    });
  });
});

describe('CollectionScheduleService', () => {
  let scheduleService: CollectionScheduleService;

  beforeEach(() => {
    scheduleService = CollectionScheduleService.getInstance();
  });

  describe('getCollectionSchedules', () => {
    it('should return schedules for a valid city', async () => {
      const schedules = await scheduleService.getCollectionSchedules('Paris');
      
      expect(schedules).toBeDefined();
      expect(schedules.length).toBeGreaterThan(0);
      expect(schedules[0]).toHaveProperty('id');
      expect(schedules[0]).toHaveProperty('type');
      expect(schedules[0]).toHaveProperty('dayOfWeek');
      expect(schedules[0]).toHaveProperty('time');
    });

    it('should return empty array for invalid city', async () => {
      const schedules = await scheduleService.getCollectionSchedules('InvalidCity');
      
      expect(schedules).toEqual([]);
    });
  });

  describe('getTodaySchedules', () => {
    it('should return today schedules', async () => {
      const today = new Date().getDay();
      const schedules = await scheduleService.getTodaySchedules('Paris');
      
      // Vérifier que tous les horaires retournés correspondent au jour actuel
      schedules.forEach(schedule => {
        expect(schedule.dayOfWeek).toBe(today);
        expect(schedule.enabled).toBe(true);
      });
    });
  });

  describe('getTomorrowSchedules', () => {
    it('should return tomorrow schedules', async () => {
      const tomorrow = (new Date().getDay() + 1) % 7;
      const schedules = await scheduleService.getTomorrowSchedules('Paris');
      
      // Vérifier que tous les horaires retournés correspondent au lendemain
      schedules.forEach(schedule => {
        expect(schedule.dayOfWeek).toBe(tomorrow);
        expect(schedule.enabled).toBe(true);
      });
    });
  });

  describe('getCollectionTypeInfo', () => {
    it('should return correct info for plastic type', () => {
      const info = scheduleService.getCollectionTypeInfo('plastic');
      
      expect(info.name).toBe('Plastique');
      expect(info.description).toBe('Bouteilles, flacons, emballages plastique');
      expect(info.icon).toBe('recycle');
      expect(info.color).toBe('#2196F3');
      expect(info.tips).toHaveLength(3);
    });

    it('should return default info for unknown type', () => {
      const info = scheduleService.getCollectionTypeInfo('unknown');
      
      expect(info.name).toBe('unknown');
      expect(info.description).toBe('Type de déchet non spécifié');
      expect(info.icon).toBe('help-circle');
      expect(info.color).toBe('#757575');
      expect(info.tips).toHaveLength(0);
    });
  });

  describe('getAvailableCities', () => {
    it('should return list of available cities', async () => {
      const cities = await scheduleService.getAvailableCities();
      
      expect(cities).toContain('Paris');
      expect(cities).toContain('Lyon');
      expect(cities).toContain('Marseille');
      expect(cities).toContain('Toulouse');
    });
  });

  describe('searchCity', () => {
    it('should return matching cities', async () => {
      const results = await scheduleService.searchCity('par');
      
      expect(results).toContain('Paris');
    });

    it('should return empty array for no matches', async () => {
      const results = await scheduleService.searchCity('xyz');
      
      expect(results).toEqual([]);
    });
  });
}); 