import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView , SafeAreaView} from 'react-native';
import { Button, List } from 'react-native-paper';
import { colors } from '../styles/colors';


const AdviceScreen = ({navigation}) => {
  const [advice, setAdvice] = useState('');

  useEffect(() => {
    
    const getAdvice = async () => {
      try {
        const response = await fetch('https://jsonplaceholder.typicode.com/posts/1');
        const data = await response.json();
        setAdvice(data.body); 
      } catch (error) {
        console.error('Erreur API:', error);
      }
    };

    getAdvice();
  }, []);

    return (
      <SafeAreaView style={styles.safeAreaContainer}>
        <ScrollView contentContainerStyle={styles.container}>
        <Button mode="outlined" onPress={() => navigation.navigate("Home")} style={styles.backButton}>
          Retour à l'accueil
        </Button>
          <View style={styles.headerContainer}>
            <Text style={styles.header}>Conseils Écologiques</Text>
          </View>
          <Text style={styles.subHeader}>Voici un conseil pour vous :</Text>
          <Text style={styles.adviceText}>{advice}</Text>
        </ScrollView>
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
    backgroundColor: colors.background,
    padding: 20,
  },
  headerContainer: {
    backgroundColor: colors.primaryDark,
    padding: 10,
    borderRadius: 10,
    marginBottom: 15,
    marginTop: 15,
    alignItems: 'center',
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  header: {
    fontSize: 28,
    color: colors.white,
    fontWeight: 'bold',
  },
  subHeader: {
    fontSize: 18,
    color: colors.primaryDark,
    marginVertical: 10,
  },
  adviceText: {
    fontSize: 16,
    color: colors.primary,
    lineHeight: 22,
    textAlign: 'justify',
  },
});

export default AdviceScreen;
