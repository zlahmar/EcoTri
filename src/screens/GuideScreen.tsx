import * as React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconButton, Card } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../styles/colors';

const GuideScreen = ({ navigation }: { navigation: any }) => {
  const guideSteps = [
    {
      icon: 'camera',
      title: '1. Scanner vos déchets',
      description: 'Utilisez l\'appareil photo pour scanner vos déchets et découvrir comment les recycler correctement.',
      color: colors.primary
    },
    {
      icon: 'lightbulb',
      title: '2. Recevoir des conseils',
      description: 'Consultez la section conseils pour des astuces écologiques personnalisées selon vos habitudes.',
      color: colors.success
    },
    {
      icon: 'chart-line',
      title: '3. Suivre vos progrès',
      description: 'Votre profil affiche vos statistiques de recyclage et vos habitudes écologiques.',
      color: colors.warning
    },
    {
      icon: 'trophy',
      title: '4. Gagner des points',
      description: 'Chaque scan vous fait gagner des points et améliore votre niveau écologique.',
      color: colors.primary
    }
  ];

  const features = [
    {
      icon: 'brain',
      title: 'IA Intégrée',
      description: 'Reconnaissance automatique des déchets grâce à l\'intelligence artificielle'
    },
    {
      icon: 'leaf',
      title: 'Impact Écologique',
      description: 'Conseils personnalisés pour réduire votre empreinte environnementale'
    },
    {
      icon: 'trending-up',
      title: 'Suivi Personnel',
      description: 'Statistiques détaillées de vos habitudes de recyclage'
    }
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <IconButton
            icon="arrow-left"
            size={30}
            onPress={() => navigation.goBack()}
          />
          <Text style={styles.title}>Guide d'utilisation</Text>
        </View>

        {/* Welcome Section */}
        <Card style={styles.welcomeCard}>
          <Card.Content>
            <View style={styles.welcomeHeader}>
              <MaterialCommunityIcons name="recycle" size={40} color={colors.primary} />
              <Text style={styles.welcomeTitle}>Bienvenue dans EcoTri !</Text>
            </View>
            <Text style={styles.welcomeText}>
              Votre assistant personnel pour un recyclage intelligent et des habitudes plus écologiques.
            </Text>
          </Card.Content>
        </Card>

        {/* Steps Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🚀 Comment utiliser l'app ?</Text>
          {guideSteps.map((step, index) => (
            <Card key={index} style={styles.stepCard}>
              <Card.Content style={styles.stepContent}>
                <View style={[styles.stepIcon, { backgroundColor: step.color + '20' }]}>
                  <MaterialCommunityIcons name={step.icon as any} size={30} color={step.color} />
                </View>
                <View style={styles.stepText}>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  <Text style={styles.stepDescription}>{step.description}</Text>
                </View>
              </Card.Content>
            </Card>
          ))}
        </View>

        {/* Features Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>✨ Fonctionnalités principales</Text>
          {features.map((feature, index) => (
            <Card key={index} style={styles.featureCard}>
              <Card.Content style={styles.featureContent}>
                <MaterialCommunityIcons name={feature.icon as any} size={24} color={colors.primary} />
                <View style={styles.featureText}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
              </Card.Content>
            </Card>
          ))}
        </View>

        {/* Tips Section */}
        <Card style={styles.tipsCard}>
          <Card.Content>
            <Text style={styles.tipsTitle}>💡 Conseils pour bien commencer</Text>
            <Text style={styles.tipsText}>
              • Scannez différents types de déchets pour découvrir toutes les catégories{'\n'}
              • Consultez régulièrement vos statistiques dans le profil{'\n'}
              • Lisez les conseils personnalisés pour améliorer vos habitudes{'\n'}
              • Chaque scan compte pour votre progression écologique !
            </Text>
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primaryDark,
    marginLeft: 10,
  },
  welcomeCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    elevation: 4,
    marginBottom: 20,
  },
  welcomeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primaryDark,
    marginLeft: 15,
  },
  welcomeText: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primaryDark,
    marginBottom: 15,
  },
  stepCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    elevation: 2,
    marginBottom: 12,
  },
  stepContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  stepText: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primaryDark,
    marginBottom: 5,
  },
  stepDescription: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
  featureCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    elevation: 2,
    marginBottom: 10,
  },
  featureContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureText: {
    flex: 1,
    marginLeft: 15,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primaryDark,
    marginBottom: 3,
  },
  featureDescription: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 18,
  },
  tipsCard: {
    backgroundColor: colors.secondary,
    borderRadius: 16,
    elevation: 2,
    marginBottom: 20,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primaryDark,
    marginBottom: 10,
  },
  tipsText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 22,
  },
});

export default GuideScreen;