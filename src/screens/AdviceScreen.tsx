import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  SafeAreaView, 
  TouchableOpacity,
  FlatList
} from 'react-native';
import { 
  Card, 
  Chip, 
  IconButton, 
  ActivityIndicator,
  Divider
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../styles/colors';
import { adviceService, Advice, AdviceCategory, DailyAdvice, FavoriteAdvice } from '../services/adviceService';
import { auth } from '../../firebaseConfig';

const AdviceScreen = ({ navigation }: { navigation: any }) => {
  const [categories, setCategories] = useState<AdviceCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [adviceByCategory, setAdviceByCategory] = useState<Record<string, Advice[]>>({});
  const [loading, setLoading] = useState(true);
  const [dailyAdvice, setDailyAdvice] = useState<DailyAdvice | null>(null);
  const [favorites, setFavorites] = useState<FavoriteAdvice[]>([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [isDailyAdviceTime, setIsDailyAdviceTime] = useState(false);
  const [timeUntilNextAdvice, setTimeUntilNextAdvice] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Chargement des catégories
      const categoriesData = adviceService.getCategories();
      setCategories(categoriesData);
      
      // Chargement des conseils prédéfinis par catégorie
      const predefinedAdvice = adviceService.getPredefinedAdvice();
      setAdviceByCategory(predefinedAdvice);
      
      // Chargement du conseil quotidien
      const dailyAdviceData = adviceService.getDailyAdvice();
      setDailyAdvice(dailyAdviceData);
      
      // Vérification si c'est l'heure du conseil quotidien
      const isTime = adviceService.isDailyAdviceTime();
      setIsDailyAdviceTime(isTime);
      
      // Calcul du temps restant
      const timeRemaining = adviceService.getTimeUntilNextAdvice();
      setTimeUntilNextAdvice(timeRemaining);
      
      // Chargement des favoris si l'utilisateur est connecté
      if (auth.currentUser) {
        const userFavorites = await adviceService.getFavorites();
        setFavorites(userFavorites);
      }
      
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setShowFavorites(false);
  };

  const handleToggleFavorite = async (advice: Advice) => {
    try {
      if (!auth.currentUser) {
        alert('Veuillez vous connecter pour sauvegarder des favoris');
        return;
      }

      const isFav = await adviceService.isFavorite(advice.id || '');
      
      if (isFav) {
        await adviceService.removeFromFavorites(advice.id || '');
      } else {
        await adviceService.addToFavorites(advice);
      }
      
      // Rechargement des favoris
      const userFavorites = await adviceService.getFavorites();
      setFavorites(userFavorites);
      
    } catch (error) {
      console.error('Erreur lors de la gestion des favoris:', error);
    }
  };

  const handleShowFavorites = () => {
    setShowFavorites(!showFavorites);
    setSelectedCategory('all');
  };

  const formatTimeUntilNext = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} min`;
    } else if (minutes < 1440) { // 24h
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours}h${mins > 0 ? ` ${mins}min` : ''}`;
    } else {
      const hours = Math.floor(minutes / 60);
      return `${Math.floor(hours / 24)}j ${hours % 24}h`;
    }
  };

  const handleAdvicePress = (advice: Advice) => {
    alert(`${advice.title}\n\n${advice.content}`);
  };

  const renderDailyAdviceCard = () => {
    if (!dailyAdvice) return null;

    return (
      <Card style={styles.dailyAdviceCard}>
        <Card.Content>
          <View style={styles.dailyAdviceHeader}>
            <MaterialCommunityIcons name="calendar-today" size={24} color={colors.primary} />
            <Text style={styles.dailyAdviceTitle}>Conseil du jour</Text>
            <MaterialCommunityIcons name="star" size={20} color={colors.warning} />
          </View>
          
          {isDailyAdviceTime ? (
            <View>
              <Text style={styles.dailyAdviceContent}>
                {dailyAdvice.advice.content}
              </Text>
              <View style={styles.dailyAdviceFooter}>
                <Text style={styles.dailyAdviceCategory}>
                  {dailyAdvice.advice.category}
                </Text>
                {auth.currentUser && (
                  <TouchableOpacity
                    onPress={() => handleToggleFavorite(dailyAdvice.advice)}
                    style={styles.favoriteButton}
                  >
                    <MaterialCommunityIcons
                      name={favorites.some(fav => fav.adviceId === dailyAdvice.advice.id) ? "heart" : "heart-outline"}
                      size={20}
                      color={favorites.some(fav => fav.adviceId === dailyAdvice.advice.id) ? colors.error : colors.secondary}
                    />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ) : (
            <View style={styles.waitingAdviceContainer}>
              <MaterialCommunityIcons name="clock-outline" size={48} color={colors.secondary} />
              <Text style={styles.waitingAdviceText}>
                Rendez-vous à midi pour découvrir le conseil du jour !
              </Text>
              <Text style={styles.timeRemainingText}>
                Plus que {formatTimeUntilNext(timeUntilNextAdvice)}
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>
    );
  };

  const renderAdviceCard = ({ item }: { item: Advice }) => {
    const isFavorite = favorites.some(fav => fav.adviceId === item.id);
    
    return (
      <Card style={styles.adviceCard} onPress={() => handleAdvicePress(item)}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons 
              name="lightbulb-outline" 
              size={24} 
              color={colors.primary} 
            />
            <Text style={styles.cardTitle} numberOfLines={2}>
              {item.title}
            </Text>
            {auth.currentUser && (
              <TouchableOpacity
                onPress={() => handleToggleFavorite(item)}
                style={styles.favoriteButton}
              >
                <MaterialCommunityIcons
                  name={isFavorite ? "heart" : "heart-outline"}
                  size={20}
                  color={isFavorite ? colors.error : colors.secondary}
                />
              </TouchableOpacity>
            )}
          </View>
          
          <Text style={styles.cardContent} numberOfLines={3}>
            {item.content}
          </Text>
          
          <View style={styles.cardFooter}>
            <Chip 
              icon={() => (
                <MaterialCommunityIcons 
                  name="tag" 
                  size={16} 
                  color={colors.white}
                />
              )}
              style={styles.tagChip}
            >
              {item.tags[0]}
            </Chip>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderCategoryChip = ({ item }: { item: AdviceCategory }) => (
    <TouchableOpacity
      style={[
        styles.categoryChip,
        selectedCategory === item.id && styles.selectedCategoryChip,
        { backgroundColor: selectedCategory === item.id ? item.color : colors.white }
      ]}
      onPress={() => handleCategorySelect(item.id)}
    >
      <MaterialCommunityIcons 
        name={item.icon as any} 
        size={20} 
        color={selectedCategory === item.id ? colors.white : item.color}
      />
      <Text 
        style={[
          styles.categoryChipText,
          { color: selectedCategory === item.id ? colors.white : item.color }
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const getCurrentAdvice = () => {
    if (showFavorites) {
      return favorites.map(fav => fav.advice);
    }
    
    if (selectedCategory === 'all') {
      return Object.values(adviceByCategory).flat();
    }
    return adviceByCategory[selectedCategory] || [];
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeAreaContainer}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Chargement des conseils...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <IconButton
              icon="arrow-left"
              size={30}
              onPress={() => navigation.goBack()}
            />
            <Text style={styles.headerTitle}>Conseils Écologiques</Text>
          </View>
          {auth.currentUser && (
            <IconButton
              icon={showFavorites ? "heart" : "heart-outline"}
              size={24}
              iconColor={showFavorites ? colors.error : colors.secondary}
              onPress={handleShowFavorites}
            />
          )}
        </View>

        {/* Conseil quotidien */}
        {renderDailyAdviceCard()}

        {/* Filtres par catégorie ou bouton favoris */}
        {!showFavorites ? (
          <View style={styles.categoriesSection}>
            <Text style={styles.sectionTitle}>Choisir une catégorie</Text>
            <FlatList
              data={[{ id: 'all', name: 'Tous', icon: 'view-list', color: colors.primary, description: 'Tous les conseils' }, ...categories]}
              renderItem={renderCategoryChip}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesList}
            />
          </View>
        ) : (
          <View style={styles.favoritesSection}>
            <Text style={styles.sectionTitle}>
              Mes favoris ({favorites.length})
            </Text>
          </View>
        )}

        <Divider style={styles.divider} />

        {/* Liste des conseils */}
        <View style={styles.adviceSection}>
          <FlatList
            data={getCurrentAdvice()}
            renderItem={renderAdviceCard}
            keyExtractor={(item) => item.id || item.title}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.adviceList}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primaryDark,
    marginLeft: 10,
  },
  categoriesSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primaryDark,
    marginBottom: 15,
  },
  categoriesList: {
    paddingRight: 20,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.secondary,
  },
  selectedCategoryChip: {
    elevation: 4,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  divider: {
    marginBottom: 20,
    backgroundColor: colors.secondary,
  },
  adviceSection: {
    flex: 1,
  },
  adviceList: {
    paddingBottom: 20,
  },
  adviceCard: {
    marginBottom: 16,
    backgroundColor: colors.white,
    elevation: 3,
    borderRadius: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primaryDark,
    flex: 1,
    marginLeft: 12,
  },
  cardContent: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.text,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tagChip: {
    backgroundColor: colors.primary,
    height: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: colors.text,
    marginTop: 10,
  },
  
  // STYLES CONSEIL QUOTIDIEN
  dailyAdviceCard: {
    marginBottom: 20,
    backgroundColor: colors.white,
    elevation: 4,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  dailyAdviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dailyAdviceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginLeft: 8,
    flex: 1,
  },
  dailyAdviceContent: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.text,
    marginBottom: 12,
  },
  dailyAdviceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dailyAdviceCategory: {
    fontSize: 12,
    color: colors.secondary,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  waitingAdviceContainer: {
    alignItems: 'center',
    padding: 20,
  },
  waitingAdviceText: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  timeRemainingText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  
  // STYLES FAVORIS
  favoritesSection: {
    marginBottom: 20,
  },
  favoriteButton: {
    padding: 4,
    marginLeft: 8,
  },
});

export default AdviceScreen;