// Service pour gérer les appels à l'API nationale de collecte des déchets

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

class APIService {
  private static instance: APIService;
  private baseUrl = 'https://api.example.com/api/explore/v2.1/catalog/datasets/collecte-des-dechets-jours-feries/records';
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheExpiry = 24 * 60 * 60 * 1000; // 24 heures
  private retryAttempts = 3;
  private retryDelay = 1000; // 1 seconde

  private constructor() {}

  static getInstance(): APIService {
    if (!APIService.instance) {
      APIService.instance = new APIService();
    }
    return APIService.instance;
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

  // Attente d'un délai
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Exécution d'une requête avec retry
  private async fetchWithRetry(url: string, options: RequestInit = {}): Promise<Response> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        console.log(`Tentative ${attempt}/${this.retryAttempts} pour ${url}`);
        
        const response = await fetch(url, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'EcoTri-App/1.0',
            ...options.headers,
          },
        });

        if (response.ok) {
          return response;
        }

        // Si c'est une erreur 4xx, ne pas réessayer
        if (response.status >= 400 && response.status < 500) {
          throw new Error(`Erreur client: ${response.status} ${response.statusText}`);
        }

        throw new Error(`Erreur serveur: ${response.status} ${response.statusText}`);
      } catch (error) {
        lastError = error as Error;
        console.warn(`Tentative ${attempt} échouée:`, error);
        
        if (attempt < this.retryAttempts) {
          await this.delay(this.retryDelay * attempt);
        }
      }
    }

    throw lastError || new Error('Toutes les tentatives ont échoué');
  }

  // Récupération des données de collecte
  async getCollectionData(params: {
    city?: string;
    limit?: number;
    offset?: number;
    useCache?: boolean;
  } = {}): Promise<APICollectionData[]> {
    const { city, limit = 1000, offset = 0, useCache = true } = params;
    
    // Construction de l'URL
    const url = new URL(this.baseUrl);
    url.searchParams.set('limit', limit.toString());
    url.searchParams.set('offset', offset.toString());
    
    if (city) {
      url.searchParams.set('where', `lieu like "%${city}%"`);
    }

    const cacheKey = this.generateCacheKey(url.pathname, Object.fromEntries(url.searchParams));
    
    // Vérification du cache
    if (useCache) {
      const cached = this.getFromCache<APICollectionData[]>(cacheKey);
      if (cached) {
        return cached;
      }
    }

    try {
      console.log(`Récupération des données depuis l'API: ${url.toString()}`);
      
      const response = await this.fetchWithRetry(url.toString());
      const data: APIResponse = await response.json();
      
      console.log(`Récupéré ${data.results.length} enregistrements de l'API`);
      
      // Mise en cache
      if (useCache) {
        this.setCache(cacheKey, data.results);
      }
      
      return data.results;
    } catch (error) {
      console.error('Erreur lors de la récupération des données API:', error);
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
      const data = await this.getCollectionData({ useCache: false });
      const cities = [...new Set(data.map(item => item.lieu))].sort();
      
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

  // Vérification de la connectivité à l'API
  async checkConnectivity(): Promise<boolean> {
    try {
      const url = new URL(this.baseUrl);
      url.searchParams.set('limit', '1');
      
      const response = await this.fetchWithRetry(url.toString());
      return response.ok;
    } catch (error) {
      console.error('Erreur de connectivité API:', error);
      return false;
    }
  }

  // Vidage du cache
  clearCache(): void {
    this.cache.clear();
    console.log('Cache API vidé');
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

export default APIService; 