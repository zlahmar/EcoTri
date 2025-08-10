import * as React from 'react';
const { useState } = React;
import { View, Text, StyleSheet, Alert, Modal, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { IconButton, Button, Card, Chip } from 'react-native-paper';
import { colors } from '../styles/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import mlKitService, { VisionAnalysisResult } from '../services/mlKitService';
import storageService from '../services/storageService';
import { auth } from '../../firebaseConfig';

const ScanScreen = ({ navigation }: { navigation: any }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<VisionAnalysisResult | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [savedImageUrl, setSavedImageUrl] = useState<string | null>(null);

  const takePicture = async () => {
    try {
      // Demande des permissions AVANT d'afficher le loading
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission refusée', 'Vous devez autoriser l\'accès à la caméra pour scanner.');
        return;
      }

      // Prise de la photo
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setCapturedImage(result.assets[0].uri);
        setIsScanning(true);
        
        // Analyse de l'image avec ML Kit
        await analyzeImage(result.assets[0].uri);
      }
      
    } catch (error) {
      console.error('Erreur lors de la prise de photo:', error);
      Alert.alert('Erreur', 'Impossible de prendre la photo');
      setIsScanning(false);
    }
  };

  const analyzeImage = async (imageUri: string) => {
    try {
      const analysisResult = await mlKitService.analyzeImage(imageUri);
      
      setScanResult(analysisResult);
      setShowResult(true);
      
    } catch (error) {
      console.error('Erreur lors de l\'analyse:', error);
      Alert.alert('Erreur', 'Impossible d\'analyser l\'image. Veuillez réessayer.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleRetake = () => {
    setShowResult(false);
    setScanResult(null);
    setCapturedImage(null);
    setSavedImageUrl(null);
  };

  const handleConfirm = async () => {
    if (!scanResult) return;

    try {
      setIsScanning(true);
      
      const userId = auth.currentUser?.uid;
      if (!userId) {
        Alert.alert('Erreur', 'Vous devez être connecté pour enregistrer le scan');
        return;
      }

      // Sauvegarde des statistiques de scan (pas d'image)
      await storageService.saveScanStats({
        userId,
        wasteCategory: scanResult.wasteCategory.category,
        confidence: scanResult.confidence,
      });

      Alert.alert(
        'Résultat confirmé',
        `Déchet classé comme : ${scanResult.wasteCategory.category}\n\n+10 points gagnés !`,
        [
          { 
            text: 'OK', 
            onPress: () => {
              setShowResult(false);
              setScanResult(null);
              setCapturedImage(null);
            }
          }
        ]
      );
      
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      Alert.alert('Erreur', 'Impossible de sauvegarder les statistiques');
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <View style={styles.container}>
      {!showResult ? (
        <View style={styles.mainContainer}>
          <View style={styles.header}>
            <IconButton
              icon="arrow-left"
              size={30}
              onPress={() => navigation.goBack()}
            />
            <Text style={styles.title}>Scanner un déchet</Text>
          </View>

          <View style={styles.scanArea}>
            <View style={styles.scanFrame}>
              <MaterialCommunityIcons name="camera" size={80} color={colors.primary} />
              <Text style={styles.scanText}>Appuyez sur le bouton pour scanner un déchet</Text>
            </View>
          </View>

          <View style={styles.captureContainer}>
            <TouchableOpacity
              testID="button"
              style={[styles.captureButton, isScanning && styles.captureButtonDisabled]}
              onPress={takePicture}
              disabled={isScanning}
            >
              {isScanning ? (
                <ActivityIndicator size="large" color="white" />
              ) : (
                <MaterialCommunityIcons name="camera" size={40} color="white" />
              )}
            </TouchableOpacity>
            <Text style={styles.captureText}>Scanner un déchet</Text>
          </View>

          {/* Instructions */}
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsTitle}>Comment ça marche ?</Text>
            <Text style={styles.instructionsText}>
              1. Appuyez sur le bouton caméra{'\n'}
              2. Prenez une photo de votre déchet{'\n'}
              3. Notre IA analysera et classera automatiquement{'\n'}
              4. Suivez les instructions de recyclage
            </Text>
          </View>
        </View>
      ) : (
        <View style={styles.resultContainer}>
          <View style={styles.resultHeader}>
            <IconButton
              icon="arrow-left"
              size={30}
              onPress={() => navigation.goBack()}
            />
            <Text style={styles.resultTitle}>Résultat du scan</Text>
          </View>

          {capturedImage && (
            <Image source={{ uri: capturedImage }} style={styles.capturedImage} />
          )}

          {scanResult && (
            <Card style={styles.resultCard}>
              <Card.Content>
                <View style={styles.resultHeader}>
                  <MaterialCommunityIcons 
                    name={scanResult.wasteCategory.icon as any} 
                    size={40} 
                    color={scanResult.wasteCategory.color} 
                  />
                  <View style={styles.resultInfo}>
                    <Text style={styles.resultCategory}>{scanResult.wasteCategory.category}</Text>
                    <Text style={styles.resultConfidence}>
                      Confiance: {Math.round(scanResult.confidence * 100)}%
                    </Text>
                  </View>
                </View>

                <Text style={styles.instructions}>{scanResult.wasteCategory.instructions}</Text>

                {/* Labels détectés */}
                {scanResult.labels.length > 0 && (
                  <View style={styles.labelsContainer}>
                    <Text style={styles.labelsTitle}>Éléments détectés:</Text>
                    <View style={styles.labelsGrid}>
                      {scanResult.labels.slice(0, 6).map((label, index) => (
                        <Chip 
                          key={index}
                          style={styles.labelChip}
                          textStyle={{ fontSize: 12, color: colors.primaryDark }}
                          selectedColor={colors.secondary}
                        >
                          {label.description} ({Math.round(label.confidence * 100)}%)
                        </Chip>
                      ))}
                    </View>
                  </View>
                )}

                {/* Alternatives possibles */}
                {scanResult.alternatives.length > 0 && (
                  <View style={styles.alternativesContainer}>
                    <Text style={styles.alternativesTitle}>Alternatives possibles:</Text>
                    {scanResult.alternatives.map((alt, index) => (
                      <Chip 
                        key={index}
                        icon={() => <MaterialCommunityIcons name={alt.icon as any} size={20} color={colors.primary} />}
                        style={styles.alternativeChip}
                        textStyle={{ color: colors.primaryDark }}
                        selectedColor={colors.secondary}
                      >
                        {alt.category} ({Math.round(alt.confidence * 100)}%)
                      </Chip>
                    ))}
                  </View>
                )}
              </Card.Content>
            </Card>
          )}

          <View style={styles.resultActions}>
            <Button 
              mode="outlined" 
              onPress={handleRetake} 
              style={styles.actionButton}
              textColor={colors.primary}
              buttonColor="transparent"
            >
              Nouveau scan
            </Button>
            <Button 
              mode="contained" 
              onPress={handleConfirm} 
              style={styles.actionButton}
              loading={isScanning}
              disabled={isScanning}
              buttonColor={colors.primary}
              textColor={colors.white}
            >
              Confirmer
            </Button>
          </View>
        </View>
      )}

      <Modal visible={isScanning} transparent>
        <View style={styles.loadingModal}>
          <View style={styles.loadingContent}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>
              {showResult ? 'Sauvegarde en cours...' : 'Analyse en cours...'}
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  mainContainer: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primaryDark,
    marginLeft: 10,
  },
  scanArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 250,
    height: 250,
    borderWidth: 3,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
    elevation: 3,
  },
  scanText: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  captureContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    marginBottom: 15,
  },
  captureButtonDisabled: {
    backgroundColor: colors.text,
  },
  captureText: {
    fontSize: 16,
    color: colors.primaryDark,
    fontWeight: 'bold',
  },
  instructionsContainer: {
    backgroundColor: colors.white,
    padding: 20,
    borderRadius: 12,
    elevation: 2,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primaryDark,
    marginBottom: 10,
  },
  instructionsText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  resultContainer: {
    flex: 1,
    padding: 20,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primaryDark,
    marginLeft: 10,
  },
  capturedImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 20,
  },
  resultCard: {
    marginBottom: 20,
  },
  resultInfo: {
    marginLeft: 15,
    flex: 1,
  },
  resultCategory: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primaryDark,
  },
  resultConfidence: {
    fontSize: 14,
    color: colors.text,
    opacity: 0.7,
  },
  instructions: {
    fontSize: 16,
    color: colors.text,
    marginTop: 15,
    lineHeight: 22,
  },
  labelsContainer: {
    marginTop: 15,
  },
  labelsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primaryDark,
    marginBottom: 10,
  },
  labelsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  labelChip: {
    marginBottom: 5,
    marginRight: 5,
  },
  alternativesContainer: {
    marginTop: 15,
  },
  alternativesTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primaryDark,
    marginBottom: 10,
  },
  alternativeChip: {
    marginBottom: 5,
  },
  resultActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 5,
  },
  loadingModal: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 12,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: colors.primaryDark,
  },
});

export default ScanScreen; 