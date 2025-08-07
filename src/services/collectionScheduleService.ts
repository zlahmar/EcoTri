import MockAPIService, { APICollectionData } from './mockAPIService';

// Interface pour les paramètres de notification (maintenant définie localement)
interface NotificationSettings {
  enabled: boolean;
  reminderTime: number;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  city?: string;
}

// Interface pour les horaires de collecte
export interface CollectionSchedule {
  id: string;
  type: 'plastic' | 'glass' | 'paper' | 'metal' | 'organic' | 'electronics' | 'textile';
  dayOfWeek: number; // 0 = Dimanche, 1 = Lundi, etc.
  time: string; // Format "HH:MM"
  enabled: boolean;
  location: string;
}

// Mapping des jours français vers les numéros de jour
const DAY_MAPPING: { [key: string]: number } = {
  'lundi': 1,
  'mardi': 2,
  'mercredi': 3,
  'jeudi': 4,
  'vendredi': 5,
  'samedi': 6,
  'dimanche': 0,
};

// Mapping des types de collecte de l'API vers nos types
const TYPE_MAPPING: { [key: string]: string } = {
  'recyclable': 'plastic',
  'recyclable ordures ménagères': 'plastic',
  'ordures ménagères': 'organic',
  'déchets verts': 'organic',
  'ordures ménagères déchets verts': 'organic',
  'recyclable ordures ménagèresllecte': 'plastic',
};

// Paramètres de notification par défaut
const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  enabled: true,
  reminderTime: 60, // 1 heure avant
  soundEnabled: true,
  vibrationEnabled: true,
};

class CollectionScheduleService {
  private static instance: CollectionScheduleService;
  private apiService: MockAPIService;
  private cachedData: { [city: string]: CollectionSchedule[] } = {};
  private lastFetch: { [city: string]: number } = {};
  private cacheExpiry = 24 * 60 * 60 * 1000; // 24 heures

  private constructor() {
    this.apiService = MockAPIService.getInstance();
  }

  static getInstance(): CollectionScheduleService {
    if (!CollectionScheduleService.instance) {
      CollectionScheduleService.instance = new CollectionScheduleService();
    }
    return CollectionScheduleService.instance;
  }

  // Récupérer les données depuis l'API nationale
  private async fetchFromAPI(city?: string): Promise<APICollectionData[]> {
    try {
      if (city) {
        return await this.apiService.getCityData(city);
      } else {
        return await this.apiService.getCollectionData();
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des données API:', error);
      // Retourner des données d'exemple en cas d'erreur
      return this.getFallbackData();
    }
  }

  // Données de fallback en cas d'erreur API
  private getFallbackData(): APICollectionData[] {
    return [
      {
        lieu: 'Paris',
        semaine: 1,
        type_recyclable_ordures_menageresllecte: 'recyclable',
        jour: 'lundi'
      },
      {
        lieu: 'Paris',
        semaine: 1,
        type_recyclable_ordures_menageresllecte: 'ordures ménagères',
        jour: 'mardi'
      },
      {
        lieu: 'Lyon',
        semaine: 1,
        type_recyclable_ordures_menageresllecte: 'recyclable',
        jour: 'mardi'
      },
      {
        lieu: 'Lyon',
        semaine: 1,
        type_recyclable_ordures_menageresllecte: 'déchets verts',
        jour: 'jeudi'
      }
    ];
  }

  // Convertir les données API vers notre format
  private convertAPIDataToSchedules(apiData: APICollectionData[]): CollectionSchedule[] {
    const schedules: CollectionSchedule[] = [];
    const processed = new Set<string>();

    apiData.forEach((item, index) => {
      const key = `${item.lieu}-${item.jour}-${item.type_recyclable_ordures_menageresllecte}`;
      
      if (processed.has(key)) return; // Éviter les doublons
      processed.add(key);

      const dayOfWeek = DAY_MAPPING[item.jour.toLowerCase()];
      if (dayOfWeek === undefined) {
        console.warn(`Jour non reconnu: ${item.jour}`);
        return;
      }

      const type = this.mapAPITypeToOurType(item.type_recyclable_ordures_menageresllecte);
      if (!type) {
        console.warn(`Type non reconnu: ${item.type_recyclable_ordures_menageresllecte}`);
        return;
      }

      schedules.push({
        id: `api-${item.lieu}-${type}-${dayOfWeek}`,
        type: type as any,
        dayOfWeek: dayOfWeek,
        time: '06:00', // Heure par défaut
        enabled: true,
        location: item.lieu
      });
    });

    return schedules;
  }

  // Mapper les types de l'API vers nos types
  private mapAPITypeToOurType(apiType: string): string | null {
    const normalizedType = apiType.toLowerCase().trim();
    
    for (const [key, value] of Object.entries(TYPE_MAPPING)) {
      if (normalizedType.includes(key.toLowerCase())) {
        return value;
      }
    }
    
    return null;
  }

  // Obtenir les horaires de collecte pour une ville
  async getCollectionSchedules(city: string): Promise<CollectionSchedule[]> {
    // Vérifier le cache
    const now = Date.now();
    if (this.cachedData[city] && this.lastFetch[city] && 
        (now - this.lastFetch[city]) < this.cacheExpiry) {
      console.log(`Utilisation des données en cache pour ${city}`);
      return this.cachedData[city];
    }

    try {
      console.log(`Récupération des données pour ${city}`);
      const apiData = await this.fetchFromAPI(city);
      const schedules = this.convertAPIDataToSchedules(apiData);
      
      // Filtrer par ville si nécessaire
      const citySchedules = schedules.filter(schedule => 
        schedule.location.toLowerCase().includes(city.toLowerCase()) ||
        city.toLowerCase().includes(schedule.location.toLowerCase())
      );

      // Mettre en cache
      this.cachedData[city] = citySchedules;
      this.lastFetch[city] = now;

      console.log(`Récupéré ${citySchedules.length} horaires pour ${city}`);
      return citySchedules;
    } catch (error) {
      console.error(`Erreur lors de la récupération des horaires pour ${city}:`, error);
      return [];
    }
  }

  // Obtenir les horaires de collecte pour aujourd'hui
  async getTodaySchedules(city: string): Promise<CollectionSchedule[]> {
    const allSchedules = await this.getCollectionSchedules(city);
    const today = new Date().getDay(); // 0 = Dimanche, 1 = Lundi, etc.
    
    return allSchedules.filter(schedule => 
      schedule.enabled && schedule.dayOfWeek === today
    );
  }

  // Obtenir les horaires de collecte pour demain
  async getTomorrowSchedules(city: string): Promise<CollectionSchedule[]> {
    const allSchedules = await this.getCollectionSchedules(city);
    const tomorrow = (new Date().getDay() + 1) % 7; // 0 = Dimanche, 1 = Lundi, etc.
    
    return allSchedules.filter(schedule => 
      schedule.enabled && schedule.dayOfWeek === tomorrow
    );
  }

  // Obtenir les horaires de collecte pour cette semaine
  async getWeekSchedules(city: string): Promise<{ [day: string]: CollectionSchedule[] }> {
    const allSchedules = await this.getCollectionSchedules(city);
    const weekSchedules: { [day: string]: CollectionSchedule[] } = {};
    
    const daysOfWeek = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    
    for (let i = 0; i < 7; i++) {
      weekSchedules[daysOfWeek[i]] = allSchedules.filter(schedule => 
        schedule.enabled && schedule.dayOfWeek === i
      );
    }
    
    return weekSchedules;
  }

  // Obtenir les paramètres de notification par défaut
  getDefaultNotificationSettings(): NotificationSettings {
    return { ...DEFAULT_NOTIFICATION_SETTINGS };
  }

  // Rechercher une ville par nom
  async searchCity(cityName: string): Promise<string[]> {
    try {
      return await this.apiService.searchCities(cityName, 10);
    } catch (error) {
      console.error('Erreur lors de la recherche de ville:', error);
      return [];
    }
  }

  // Obtenir toutes les villes disponibles
  async getAvailableCities(): Promise<string[]> {
    try {
      return await this.apiService.getAllCities();
    } catch (error) {
      console.error('Erreur lors de la récupération des villes:', error);
      return ['Paris', 'Lyon', 'Marseille', 'Toulouse']; // Fallback
    }
  }

  // Obtenir les informations détaillées d'un type de collecte
  getCollectionTypeInfo(type: string): {
    name: string;
    description: string;
    icon: string;
    color: string;
    tips: string[];
  } {
    const typeInfo: { [key: string]: any } = {
      plastic: {
        name: 'Plastique',
        description: 'Bouteilles, flacons, emballages plastique',
        icon: 'recycle',
        color: '#2196F3',
        tips: [
          'Rincez les emballages avant de les jeter',
          'Retirez les bouchons et couvercles',
          'Aplatissez les bouteilles pour gagner de la place'
        ]
      },
      glass: {
        name: 'Verre',
        description: 'Bouteilles et pots en verre',
        icon: 'glass-fragile',
        color: '#4CAF50',
        tips: [
          'Rincez les contenants',
          'Retirez les bouchons et couvercles',
          'Ne cassez pas le verre'
        ]
      },
      paper: {
        name: 'Papier',
        description: 'Journaux, magazines, cartons',
        icon: 'file-document-outline',
        color: '#FF9800',
        tips: [
          'Pliez les cartons pour gagner de la place',
          'Retirez les films plastique',
          'Ne mettez pas de papier souillé'
        ]
      },
      metal: {
        name: 'Métal',
        description: 'Canettes, boîtes de conserve',
        icon: 'silverware-fork-knife',
        color: '#9E9E9E',
        tips: [
          'Rincez les boîtes de conserve',
          'Aplatissez les canettes',
          'Retirez les étiquettes si possible'
        ]
      },
      organic: {
        name: 'Déchets verts',
        description: 'Épluchures, restes alimentaires',
        icon: 'leaf',
        color: '#8BC34A',
        tips: [
          'Compostez vos déchets verts',
          'Évitez les produits laitiers',
          'Ne mettez pas de viande'
        ]
      },
      electronics: {
        name: 'Électronique',
        description: 'Petits appareils électriques',
        icon: 'battery',
        color: '#FF5722',
        tips: [
          'Retirez les piles',
          'Apportez en déchetterie',
          'Ne jetez pas avec les ordures ménagères'
        ]
      },
      textile: {
        name: 'Textile',
        description: 'Vêtements, chaussures, linge',
        icon: 'tshirt-crew',
        color: '#E91E63',
        tips: [
          'Donnez les vêtements en bon état',
          'Mettez dans les conteneurs dédiés',
          'Évitez les vêtements souillés'
        ]
      }
    };

    return typeInfo[type] || {
      name: type,
      description: 'Type de déchet non spécifié',
      icon: 'help-circle',
      color: '#757575',
      tips: []
    };
  }

  // Vérifier si une collecte a lieu aujourd'hui
  async hasCollectionToday(city: string, type?: string): Promise<boolean> {
    const todaySchedules = await this.getTodaySchedules(city);
    
    if (type) {
      return todaySchedules.some(schedule => schedule.type === type);
    }
    
    return todaySchedules.length > 0;
  }

  // Obtenir le prochain jour de collecte pour un type
  async getNextCollectionDay(city: string, type: string): Promise<{ day: string; time: string } | null> {
    const allSchedules = await this.getCollectionSchedules(city);
    const typeSchedules = allSchedules.filter(schedule => 
      schedule.enabled && schedule.type === type
    );

    if (typeSchedules.length === 0) {
      return null;
    }

    const today = new Date().getDay();
    const daysOfWeek = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    
    // Trouver le prochain jour de collecte
    for (let i = 1; i <= 7; i++) {
      const checkDay = (today + i) % 7;
      const schedule = typeSchedules.find(s => s.dayOfWeek === checkDay);
      
      if (schedule) {
        return {
          day: daysOfWeek[checkDay],
          time: schedule.time
        };
      }
    }

    return null;
  }

  // Vider le cache
  clearCache(): void {
    this.cachedData = {};
    this.lastFetch = {};
    console.log('Cache vidé');
  }

  // Forcer la mise à jour des données
  async refreshData(city?: string): Promise<void> {
    if (city) {
      delete this.cachedData[city];
      delete this.lastFetch[city];
    } else {
      this.clearCache();
    }
    
    if (city) {
      await this.getCollectionSchedules(city);
    }
  }
}

export default CollectionScheduleService; 