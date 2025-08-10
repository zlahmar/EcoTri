import APIService, { APICollectionData } from '../services/apiService';

// Mock de fetch
global.fetch = jest.fn();

describe('APIService', () => {
  let apiService: APIService;

  beforeEach(() => {
    apiService = APIService.getInstance();
    (fetch as jest.Mock).mockClear();
  });

  afterEach(() => {
    apiService.clearCache();
  });

  describe('getInstance', () => {
    it('should return the same instance', () => {
      const instance1 = APIService.getInstance();
      const instance2 = APIService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('getCollectionData', () => {
    const mockAPIResponse = {
      total_count: 2,
      results: [
        {
          lieu: 'Paris',
          semaine: 1,
          type_recyclable_ordures_menageresllecte: 'recyclable',
          jour: 'lundi'
        },
        {
          lieu: 'Lyon',
          semaine: 1,
          type_recyclable_ordures_menageresllecte: 'ordures ménagères',
          jour: 'mardi'
        }
      ]
    };

    it('should fetch data successfully', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockAPIResponse
      });

      const result = await apiService.getCollectionData();

      expect(result).toEqual(mockAPIResponse.results);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/explore/v2.1/catalog/datasets/collecte-des-dechets-jours-feries/records'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'User-Agent': 'EcoTri-App/1.0'
          })
        })
      );
    });

    it('should use cache for subsequent calls', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockAPIResponse
      });

      // Premier appel
      await apiService.getCollectionData();
      expect(fetch).toHaveBeenCalledTimes(1);

      // Deuxième appel (devrait utiliser le cache)
      await apiService.getCollectionData();
      expect(fetch).toHaveBeenCalledTimes(1); // Pas d'appel supplémentaire
    });

    it.skip('should handle API errors', async () => {
      // Mock pour faire échouer toutes les tentatives
      (fetch as jest.Mock).mockRejectedValue(new Error('Network Error'));

      // Le service fait 3 tentatives avant de lancer l'erreur
      await expect(apiService.getCollectionData()).rejects.toThrow('Network Error');
      expect(fetch).toHaveBeenCalledTimes(3); // 3 tentatives
    });

    it('should retry on network errors', async () => {
      (fetch as jest.Mock)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockAPIResponse
        });

      const result = await apiService.getCollectionData();

      expect(result).toEqual(mockAPIResponse.results);
      expect(fetch).toHaveBeenCalledTimes(3);
    });
  });

  describe('getAllCities', () => {
    it('should return unique cities from API data', async () => {
      const mockData = [
        { lieu: 'Paris', semaine: 1, type_recyclable_ordures_menageresllecte: 'recyclable', jour: 'lundi' },
        { lieu: 'Paris', semaine: 2, type_recyclable_ordures_menageresllecte: 'recyclable', jour: 'mardi' },
        { lieu: 'Lyon', semaine: 1, type_recyclable_ordures_menageresllecte: 'recyclable', jour: 'lundi' }
      ];

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ total_count: 3, results: mockData })
      });

      const cities = await apiService.getAllCities();

      expect(cities).toEqual(['Lyon', 'Paris']); // Trié alphabétiquement
    });
  });

  describe('searchCities', () => {
    it('should filter cities by search term', async () => {
      const mockData = [
        { lieu: 'Paris', semaine: 1, type_recyclable_ordures_menageresllecte: 'recyclable', jour: 'lundi' },
        { lieu: 'Lyon', semaine: 1, type_recyclable_ordures_menageresllecte: 'recyclable', jour: 'lundi' },
        { lieu: 'Marseille', semaine: 1, type_recyclable_ordures_menageresllecte: 'recyclable', jour: 'lundi' }
      ];

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ total_count: 3, results: mockData })
      });

      const cities = await apiService.searchCities('par');

      expect(cities).toEqual(['Paris']);
    });

    it('should limit results', async () => {
      const mockData = Array.from({ length: 20 }, (_, i) => ({
        lieu: `City${i}`,
        semaine: 1,
        type_recyclable_ordures_menageresllecte: 'recyclable',
        jour: 'lundi'
      }));

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ total_count: 20, results: mockData })
      });

      const cities = await apiService.searchCities('city', 5);

      expect(cities).toHaveLength(5);
    });
  });

  describe('checkConnectivity', () => {
    it('should return true when API is accessible', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ total_count: 1, results: [] })
      });

      const isConnected = await apiService.checkConnectivity();

      expect(isConnected).toBe(true);
    });

    it('should return false when API is not accessible', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500
      });

      const isConnected = await apiService.checkConnectivity();

      expect(isConnected).toBe(false);
    });
  });

  describe('cache management', () => {
    it('should clear cache', () => {
      const stats = apiService.getCacheStats();
      expect(stats.size).toBe(0);

      // Ajouter des données au cache (simulation)
      apiService['cache'].set('test', { data: 'test', timestamp: Date.now() });
      
      expect(apiService.getCacheStats().size).toBe(1);

      apiService.clearCache();
      expect(apiService.getCacheStats().size).toBe(0);
    });

    it('should provide cache statistics', () => {
      const now = Date.now();
      apiService['cache'].set('test1', { data: 'test1', timestamp: now - 1000 });
      apiService['cache'].set('test2', { data: 'test2', timestamp: now });

      const stats = apiService.getCacheStats();

      expect(stats.size).toBe(2);
      expect(stats.keys).toContain('test1');
      expect(stats.keys).toContain('test2');
      expect(stats.oldestEntry).toBe(now - 1000);
      expect(stats.newestEntry).toBe(now);
    });
  });

  describe('testAPI', () => {
    it('should test API successfully', async () => {
      const mockData = [
        { lieu: 'Paris', semaine: 1, type_recyclable_ordures_menageresllecte: 'recyclable', jour: 'lundi' }
      ];

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ total_count: 1, results: mockData })
      });

      const result = await apiService.testAPI();

      expect(result.success).toBe(true);
      expect(result.dataCount).toBe(1);
      expect(result.responseTime).toBeDefined();
    });

    it('should handle API test failures', async () => {
      // Mock toutes les tentatives pour échouer
      (fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      });

      const result = await apiService.testAPI();

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.responseTime).toBeDefined();
    });
  });
}); 