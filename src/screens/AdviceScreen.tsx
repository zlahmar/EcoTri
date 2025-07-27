import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  SafeAreaView, 
  RefreshControl,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  FlatList
} from 'react-native';
import { 
  Button, 
  Card, 
  Chip, 
  IconButton, 
  Searchbar, 
  FAB,
  ActivityIndicator,
  Divider
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../styles/colors';
import { adviceService, Advice, AdviceCategory } from '../services/adviceService';
import { auth } from '../../firebaseConfig';

const AdviceScreen = ({ navigation }: { navigation: any }) => {
  const [advice, setAdvice] = useState<Advice[]>([]);
  const [filteredAdvice, setFilteredAdvice] = useState<Advice[]>([]);
  const [categories, setCategories] = useState<AdviceCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedAdvice, setSelectedAdvice] = useState<Advice | null>(null);
  const [popularAdvice, setPopularAdvice] = useState<Advice[]>([]);

  // États pour l'ajout de conseil
  const [newAdvice, setNewAdvice] = useState({
    title: '',
    content: '',
    category: 'general',
    tags: [] as string[]
  });
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterAdvice();
  }, [advice, selectedCategory, searchQuery]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Charger les catégories
      const categoriesData = adviceService.getCategories();
      setCategories(categoriesData);
      
      // Charger tous les conseils
      const adviceData = await adviceService.getAllAdvice();
      setAdvice(adviceData);
      
      // Charger les conseils populaires
      const popularData = await adviceService.getPopularAdvice(3);
      setPopularAdvice(popularData);
      
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      Alert.alert('Erreur', 'Impossible de charger les conseils');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const filterAdvice = async () => {
    let filtered = [...advice];

    // Filtrer par catégorie
    if (selectedCategory !== 'all') {
      try {
        const categoryAdvice = await adviceService.getAdviceByCategory(selectedCategory);
        filtered = categoryAdvice;
      } catch (error) {
        console.error('Erreur lors du filtrage par catégorie:', error);
      }
    }

    // Filtrer par recherche
    if (searchQuery.trim()) {
      try {
        const searchResults = await adviceService.searchAdvice(searchQuery);
        filtered = searchResults;
      } catch (error) {
        console.error('Erreur lors de la recherche:', error);
      }
    }

    setFilteredAdvice(filtered);
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const handleAdvicePress = async (adviceItem: Advice) => {
    setSelectedAdvice(adviceItem);
    setShowDetailModal(true);
    
    // Incrémenter les vues
    if (adviceItem.id) {
      await adviceService.incrementViews(adviceItem.id);
    }
  };

  const handleLike = async (adviceId: string) => {
    try {
      await adviceService.toggleLike(adviceId);
      // Recharger les données pour mettre à jour les likes
      await loadData();
    } catch {
      Alert.alert('Erreur', 'Impossible de liker ce conseil');
    }
  };

  const handleAddAdvice = async () => {
    if (!auth.currentUser) {
      Alert.alert('Connexion requise', 'Vous devez être connecté pour ajouter un conseil');
      return;
    }

    if (!newAdvice.title.trim() || !newAdvice.content.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      await adviceService.addAdvice({
        ...newAdvice,
        tags: newAdvice.tags.filter(tag => tag.trim()),
        isPublished: false
      });

      Alert.alert(
        'Succès', 
        'Votre conseil a été ajouté et sera publié après modération',
        [{ text: 'OK', onPress: () => {
          setShowAddModal(false);
          setNewAdvice({ title: '', content: '', category: 'general', tags: [] });
          loadData();
        }}]
      );
    } catch {
      Alert.alert('Erreur', 'Impossible d\'ajouter le conseil');
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !newAdvice.tags.includes(tagInput.trim())) {
      setNewAdvice(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setNewAdvice(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const renderAdviceCard = ({ item }: { item: Advice }) => (
    <Card style={styles.adviceCard} onPress={() => handleAdvicePress(item)}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleContainer}>
            <Text style={styles.cardTitle} numberOfLines={2}>
              {item.title}
            </Text>
            <View style={styles.cardMeta}>
              <Text style={styles.cardAuthor}>{item.authorName}</Text>
              <Text style={styles.cardDate}>{formatDate(item.createdAt)}</Text>
            </View>
          </View>
          <View style={styles.cardStats}>
            <IconButton
              icon="eye"
              size={16}
              iconColor={colors.text}
            />
            <Text style={styles.statText}>{item.views}</Text>
            <IconButton
              icon="heart"
              size={16}
              iconColor={colors.primary}
              onPress={() => item.id && handleLike(item.id)}
            />
            <Text style={styles.statText}>{item.likes}</Text>
          </View>
        </View>
        
        <Text style={styles.cardContent} numberOfLines={3}>
          {item.content}
        </Text>
        
        <View style={styles.cardFooter}>
          <Chip 
            icon={() => (
              <MaterialCommunityIcons 
                name={categories.find(cat => cat.id === item.category)?.icon as any} 
                size={16} 
                color={colors.white}
              />
            )}
            style={[
              styles.categoryChip,
              { backgroundColor: categories.find(cat => cat.id === item.category)?.color }
            ]}
          >
            {categories.find(cat => cat.id === item.category)?.name}
          </Chip>
          
          {item.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {item.tags.slice(0, 2).map((tag, index) => (
                <Chip key={index} style={styles.tagChip} textStyle={styles.tagText}>
                  {tag}
                </Chip>
              ))}
              {item.tags.length > 2 && (
                <Text style={styles.moreTags}>+{item.tags.length - 2}</Text>
              )}
            </View>
          )}
        </View>
      </Card.Content>
    </Card>
  );

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
      <Text style={[
        styles.categoryChipText,
        { color: selectedCategory === item.id ? colors.white : item.color }
      ]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

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
        {/* Header */}
        <View style={styles.header}>
          <IconButton
            icon="arrow-left"
            size={30}
            onPress={() => navigation.goBack()}
          />
          <Text style={styles.headerTitle}>Conseils Écologiques</Text>
        </View>

        {/* Barre de recherche */}
        <Searchbar
          placeholder="Rechercher un conseil..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />

        {/* Conseils populaires */}
        {popularAdvice.length > 0 && (
          <View style={styles.popularSection}>
            <Text style={styles.sectionTitle}>Conseils populaires</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {popularAdvice.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.popularCard}
                  onPress={() => handleAdvicePress(item)}
                >
                  <Text style={styles.popularTitle} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <Text style={styles.popularContent} numberOfLines={3}>
                    {item.content}
                  </Text>
                  <View style={styles.popularStats}>
                    <MaterialCommunityIcons name="heart" size={16} color={colors.primary} />
                    <Text style={styles.popularStatText}>{item.likes}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Filtres par catégorie */}
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Filtrer par catégorie</Text>
          <FlatList
            data={categories}
            renderItem={renderCategoryChip}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
          />
        </View>

        {/* Liste des conseils */}
        <View style={styles.adviceSection}>
          <Text style={styles.sectionTitle}>
            {selectedCategory === 'all' ? 'Tous les conseils' : 
             categories.find(cat => cat.id === selectedCategory)?.name}
            {filteredAdvice.length > 0 && ` (${filteredAdvice.length})`}
          </Text>
          
          <FlatList
            data={filteredAdvice}
            renderItem={renderAdviceCard}
            keyExtractor={(item) => item.id || ''}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <MaterialCommunityIcons name="lightbulb-off" size={64} color={colors.text} />
                <Text style={styles.emptyText}>
                  {searchQuery ? 'Aucun conseil trouvé pour cette recherche' : 
                   'Aucun conseil disponible pour cette catégorie'}
                </Text>
              </View>
            }
          />
        </View>

        {/* FAB pour ajouter un conseil */}
        <FAB
          icon="plus"
          style={styles.fab}
          onPress={() => setShowAddModal(true)}
          label="Ajouter un conseil"
        />
      </View>

      {/* Modal d'ajout de conseil */}
      <Modal visible={showAddModal} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Ajouter un conseil</Text>
            <IconButton
              icon="close"
              size={30}
              onPress={() => setShowAddModal(false)}
            />
          </View>
          
          <ScrollView style={styles.modalContent}>
            <TextInput
              placeholder="Titre du conseil"
              value={newAdvice.title}
              onChangeText={(text) => setNewAdvice(prev => ({ ...prev, title: text }))}
              style={styles.modalInput}
            />
            
            <TextInput
              placeholder="Contenu du conseil"
              value={newAdvice.content}
              onChangeText={(text) => setNewAdvice(prev => ({ ...prev, content: text }))}
              style={[styles.modalInput, styles.modalTextArea]}
              multiline
              numberOfLines={6}
            />
            
            <Text style={styles.modalLabel}>Catégorie</Text>
            <View style={styles.categorySelector}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryOption,
                    newAdvice.category === category.id && styles.selectedCategoryOption,
                    { borderColor: category.color }
                  ]}
                  onPress={() => setNewAdvice(prev => ({ ...prev, category: category.id }))}
                >
                  <MaterialCommunityIcons 
                    name={category.icon as any} 
                    size={20} 
                    color={newAdvice.category === category.id ? colors.white : category.color}
                  />
                  <Text style={[
                    styles.categoryOptionText,
                    { color: newAdvice.category === category.id ? colors.white : category.color }
                  ]}>
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <Text style={styles.modalLabel}>Tags (optionnel)</Text>
            <View style={styles.tagInputContainer}>
              <TextInput
                placeholder="Ajouter un tag"
                value={tagInput}
                onChangeText={setTagInput}
                style={styles.tagInput}
                onSubmitEditing={addTag}
              />
              <Button mode="contained" onPress={addTag} style={styles.addTagButton}>
                Ajouter
              </Button>
            </View>
            
            {newAdvice.tags.length > 0 && (
              <View style={styles.tagsList}>
                {newAdvice.tags.map((tag, index) => (
                  <Chip
                    key={index}
                    onClose={() => removeTag(tag)}
                    style={styles.modalTagChip}
                  >
                    {tag}
                  </Chip>
                ))}
              </View>
            )}
          </ScrollView>
          
          <View style={styles.modalActions}>
            <Button mode="outlined" onPress={() => setShowAddModal(false)} style={styles.modalButton}>
              Annuler
            </Button>
            <Button mode="contained" onPress={handleAddAdvice} style={styles.modalButton}>
              Ajouter
            </Button>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Modal de détail du conseil */}
      <Modal visible={showDetailModal} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          {selectedAdvice && (
            <>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Détail du conseil</Text>
                <IconButton
                  icon="close"
                  size={30}
                  onPress={() => setShowDetailModal(false)}
                />
              </View>
              
              <ScrollView style={styles.modalContent}>
                <Text style={styles.detailTitle}>{selectedAdvice.title}</Text>
                <Text style={styles.detailAuthor}>
                  Par {selectedAdvice.authorName} • {formatDate(selectedAdvice.createdAt)}
                </Text>
                
                <View style={styles.detailStats}>
                  <View style={styles.detailStat}>
                    <MaterialCommunityIcons name="eye" size={20} color={colors.text} />
                    <Text style={styles.detailStatText}>{selectedAdvice.views} vues</Text>
                  </View>
                  <View style={styles.detailStat}>
                    <MaterialCommunityIcons name="heart" size={20} color={colors.primary} />
                    <Text style={styles.detailStatText}>{selectedAdvice.likes} likes</Text>
                  </View>
                </View>
                
                <Divider style={styles.detailDivider} />
                
                <Text style={styles.detailContent}>{selectedAdvice.content}</Text>
                
                {selectedAdvice.tags.length > 0 && (
                  <View style={styles.detailTags}>
                    <Text style={styles.detailTagsTitle}>Tags :</Text>
                    <View style={styles.detailTagsList}>
                      {selectedAdvice.tags.map((tag, index) => (
                        <Chip key={index} style={styles.detailTagChip}>
                          {tag}
                        </Chip>
                      ))}
                    </View>
                  </View>
                )}
              </ScrollView>
              
              <View style={styles.modalActions}>
                <Button 
                  mode="contained" 
                  onPress={() => selectedAdvice.id && handleLike(selectedAdvice.id)}
                  style={styles.modalButton}
                  icon="heart"
                >
                  J'aime
                </Button>
                <Button 
                  mode="outlined" 
                  onPress={() => setShowDetailModal(false)}
                  style={styles.modalButton}
                >
                  Fermer
                </Button>
              </View>
            </>
          )}
        </SafeAreaView>
      </Modal>
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
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primaryDark,
    marginLeft: 10,
  },
  searchBar: {
    marginBottom: 20,
    backgroundColor: colors.white,
  },
  popularSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primaryDark,
    marginBottom: 10,
  },
  popularCard: {
    backgroundColor: colors.white,
    padding: 15,
    borderRadius: 12,
    marginRight: 15,
    width: 200,
    elevation: 2,
  },
  popularTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primaryDark,
    marginBottom: 8,
  },
  popularContent: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 10,
  },
  popularStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  popularStatText: {
    fontSize: 12,
    color: colors.text,
    marginLeft: 5,
  },
  categoriesSection: {
    marginBottom: 20,
  },
  categoriesList: {
    paddingRight: 20,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 2,
  },
  selectedCategoryChip: {
    elevation: 4,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 5,
  },
  adviceSection: {
    flex: 1,
  },
  adviceCard: {
    marginBottom: 15,
    backgroundColor: colors.white,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  cardTitleContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primaryDark,
    marginBottom: 5,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardAuthor: {
    fontSize: 12,
    color: colors.text,
    opacity: 0.7,
  },
  cardDate: {
    fontSize: 12,
    color: colors.text,
    opacity: 0.7,
    marginLeft: 10,
  },
  cardStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 12,
    color: colors.text,
    marginRight: 10,
  },
  cardContent: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    marginBottom: 10,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  // categoryChip: {
  //   marginRight: 10,
  // },
  tagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagChip: {
    marginRight: 5,
    backgroundColor: colors.secondary,
  },
  tagText: {
    fontSize: 10,
  },
  moreTags: {
    fontSize: 10,
    color: colors.text,
    opacity: 0.7,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    marginTop: 10,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: colors.primary,
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
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.secondary,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primaryDark,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalInput: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  modalTextArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primaryDark,
    marginBottom: 10,
  },
  categorySelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    margin: 5,
    borderRadius: 8,
    borderWidth: 2,
  },
  selectedCategoryOption: {
    backgroundColor: colors.primary,
  },
  categoryOptionText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 5,
  },
  tagInputContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  tagInput: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 12,
    marginRight: 10,
  },
  addTagButton: {
    backgroundColor: colors.primary,
  },
  tagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  modalTagChip: {
    margin: 5,
    backgroundColor: colors.secondary,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.secondary,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 5,
  },
  detailTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primaryDark,
    marginBottom: 10,
  },
  detailAuthor: {
    fontSize: 14,
    color: colors.text,
    opacity: 0.7,
    marginBottom: 15,
  },
  detailStats: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  detailStat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  detailStatText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 5,
  },
  detailDivider: {
    marginVertical: 15,
  },
  detailContent: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
    marginBottom: 20,
  },
  detailTags: {
    marginTop: 10,
  },
  detailTagsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primaryDark,
    marginBottom: 10,
  },
  detailTagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  detailTagChip: {
    margin: 5,
    backgroundColor: colors.secondary,
  },
});

export default AdviceScreen;
