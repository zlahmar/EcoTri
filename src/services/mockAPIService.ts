// Service API mock utilisant les données JSON fournies
// Ce service simule l'API nationale de collecte des déchets

// Import du fichier JSON local avec les vraies données
import collectionData from '../assets/collecte-des-dechets-jours-feries.json';
import nationalData from '../assets/collecte-nationale-etendue.json';

export interface APICollectionData {
  lieu: string;
  semaine: number;
  type_recyclable_ordures_menageresllecte: string;
  jour: string;
}

export interface APIResponse {
  total_count: number;
  results: APICollectionData[];
}

export interface APIError {
  message: string;
  status?: number;
  code?: string;
}

// Utilisation des vraies données du fichier JSON (combinaison des deux sources)
const LOCAL_DATA: APICollectionData[] = (collectionData as any).results || collectionData;
const NATIONAL_DATA: any[] = nationalData;

// Conversion des données nationales au format APICollectionData
const convertNationalData = (): APICollectionData[] => {
  return NATIONAL_DATA.map(item => ({
    lieu: item.ville,
    semaine: 1,
    type_recyclable_ordures_menageresllecte: item.type_collecte,
    jour: item.jour
  }));
};

// Combinaison des deux sources de données
const MOCK_API_DATA: APICollectionData[] = [
  ...LOCAL_DATA,
  ...convertNationalData()
];

class MockAPIService {
  private static instance: MockAPIService;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheExpiry = 24 * 60 * 60 * 1000; // 24 heures

  private constructor() {
    console.log(`Service API mock initialisé avec ${MOCK_API_DATA.length} enregistrements de collecte`);
  }

  static getInstance(): MockAPIService {
    if (!MockAPIService.instance) {
      MockAPIService.instance = new MockAPIService();
    }
    return MockAPIService.instance;
  }

  // Simulation d'un délai réseau
  private async simulateNetworkDelay(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
  }

  // Génération d'une clé de cache
  private generateCacheKey(endpoint: string, params: Record<string, string> = {}): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');
    return `${endpoint}?${sortedParams}`;
  }

  // Vérification si les données en cache sont valides
  private isCacheValid(cacheKey: string): boolean {
    const cached = this.cache.get(cacheKey);
    if (!cached) return false;
    
    const now = Date.now();
    return (now - cached.timestamp) < this.cacheExpiry;
  }

  // Récupération des données depuis le cache
  private getFromCache<T>(cacheKey: string): T | null {
    if (this.isCacheValid(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      console.log(`Données récupérées du cache: ${cacheKey}`);
      return cached?.data as T;
    }
    return null;
  }

  // Mise en cache des données
  private setCache<T>(cacheKey: string, data: T): void {
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
    console.log(`Données mises en cache: ${cacheKey}`);
  }

  // Récupération des données de collecte
  async getCollectionData(params: {
    city?: string;
    limit?: number;
    offset?: number;
    useCache?: boolean;
  } = {}): Promise<APICollectionData[]> {
    const { city, limit = 1000, offset = 0, useCache = true } = params;
    
    const cacheKey = this.generateCacheKey('/records', { 
      city: city || '', 
      limit: limit.toString(), 
      offset: offset.toString() 
    });
    
    // Vérification du cache
    if (useCache) {
      const cached = this.getFromCache<APICollectionData[]>(cacheKey);
      if (cached) {
        return cached;
      }
    }

    try {
      console.log(`Récupération des données depuis l'API mock pour la ville: "${city}"`);
      await this.simulateNetworkDelay();
      
      let filteredData = MOCK_API_DATA;
      
      // Filtre par ville si spécifiée
      if (city) {
        const normalizedCity = city.toLowerCase().trim();
        filteredData = MOCK_API_DATA.filter(item => {
          const normalizedLieu = item.lieu.toLowerCase().trim();
          return normalizedLieu.includes(normalizedCity) || 
                 normalizedCity.includes(normalizedLieu) ||
                 normalizedLieu === normalizedCity;
        });
      }
      
      // Application de la pagination
      const paginatedData = filteredData.slice(offset, offset + limit);
      
      console.log(`Récupéré ${paginatedData.length} enregistrements de l'API mock (${filteredData.length} après filtrage)`);
      
      // Mise en cache
      if (useCache) {
        this.setCache(cacheKey, paginatedData);
      }
      
      return paginatedData;
    } catch (error) {
      console.error('Erreur lors de la récupération des données API mock:', error);
      throw this.createAPIError(error as Error);
    }
  }

  // Récupération de toutes les villes disponibles
  async getAllCities(useCache: boolean = true): Promise<string[]> {
    const cacheKey = 'all_cities';
    
    if (useCache) {
      const cached = this.getFromCache<string[]>(cacheKey);
      if (cached) {
        return cached;
      }
    }

    try {
      await this.simulateNetworkDelay();
      const cities = [...new Set(MOCK_API_DATA.map(item => item.lieu))].sort();
      
      if (useCache) {
        this.setCache(cacheKey, cities);
      }
      
      return cities;
    } catch (error) {
      console.error('Erreur lors de la récupération des villes:', error);
      throw this.createAPIError(error as Error);
    }
  }

  // Recherche de villes par nom
  async searchCities(searchTerm: string, limit: number = 10): Promise<string[]> {
    try {
      const allCities = await this.getAllCities();
      const normalizedSearch = searchTerm.toLowerCase();
      
      return allCities
        .filter(city => city.toLowerCase().includes(normalizedSearch))
        .slice(0, limit);
    } catch (error) {
      console.error('Erreur lors de la recherche de villes:', error);
      throw this.createAPIError(error as Error);
    }
  }

  // Récupération des données pour une ville spécifique
  async getCityData(city: string, useCache: boolean = true): Promise<APICollectionData[]> {
    try {
      return await this.getCollectionData({ city, useCache });
    } catch (error) {
      console.error(`Erreur lors de la récupération des données pour ${city}:`, error);
      throw this.createAPIError(error as Error);
    }
  }

  // Vérification de la connectivité à l'API (toujours true pour le mock)
  async checkConnectivity(): Promise<boolean> {
    await this.simulateNetworkDelay();
    return true;
  }

  // Vidage du cache
  clearCache(): void {
    this.cache.clear();
    console.log('Cache API mock vidé');
  }

  // Vidage du cache pour une clé spécifique
  clearCacheKey(cacheKey: string): void {
    this.cache.delete(cacheKey);
    console.log(`Cache vidé pour: ${cacheKey}`);
  }

  // Récupération des statistiques du cache
  getCacheStats(): {
    size: number;
    keys: string[];
    oldestEntry: number | null;
    newestEntry: number | null;
  } {
    const keys = Array.from(this.cache.keys());
    const timestamps = Array.from(this.cache.values()).map(entry => entry.timestamp);
    
    return {
      size: this.cache.size,
      keys,
      oldestEntry: timestamps.length > 0 ? Math.min(...timestamps) : null,
      newestEntry: timestamps.length > 0 ? Math.max(...timestamps) : null,
    };
  }

  // Création d'une erreur API standardisée
  private createAPIError(error: Error): APIError {
    return {
      message: error.message,
      code: 'API_ERROR',
    };
  }

  // Test de l'API avec des données d'exemple
  async testAPI(): Promise<{
    success: boolean;
    dataCount?: number;
    error?: string;
    responseTime?: number;
  }> {
    const startTime = Date.now();
    
    try {
      const data = await this.getCollectionData({ limit: 5, useCache: false });
      const responseTime = Date.now() - startTime;
      
      return {
        success: true,
        dataCount: data.length,
        responseTime,
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      return {
        success: false,
        error: (error as Error).message,
        responseTime,
      };
    }
  }
}

export default MockAPIService; 