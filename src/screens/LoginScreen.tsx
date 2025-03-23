import React, { useState } from 'react';
import { TextInput, Button, View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { auth } from '../../firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { colors } from '../styles/colors';
<<<<<<< HEAD
import { Button as PaperButton } from 'react-native-paper';
=======
>>>>>>> c95afc6d013d9e43c6593487d1478fb576db87ba

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Veuillez remplir tous les champs.");
      return;
    }
  
    setLoading(true);
    setError("");
  
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigation.replace("Profile");
    } catch (err) {
      if (err.code === "auth/user-not-found") {
        Alert.alert(
          "Compte introuvable",
          "Aucun compte trouvé avec cet email. Voulez-vous créer un compte ?",
          [
            { text: "Annuler", style: "cancel" },
            { text: "S'inscrire", onPress: () => navigation.navigate("Signup") }
          ]
        );
      } else {
        setError("Email ou mot de passe incorrect.");
      }
    } finally {
      setLoading(false);
    }
  };  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connexion</Text>
<<<<<<< HEAD
      <PaperButton mode="outlined" onPress={() => navigation.navigate("Home")} style={styles.backButton}>
          Retour à l'accueil
        </PaperButton>
=======
>>>>>>> c95afc6d013d9e43c6593487d1478fb576db87ba

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#999"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Mot de passe"
        placeholderTextColor="#999"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} />
      ) : (
        <Button title="Se connecter" onPress={handleLogin} color={colors.primary} />
      )}

      <Text
        style={styles.registerText}
        onPress={() => navigation.navigate("Signup")}
      >
        Pas encore inscrit ? Créer un compte
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20, backgroundColor: colors.background },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, color: colors.primaryDark },
  input: { width: "100%", padding: 10, borderWidth: 1, borderColor: "#ddd", borderRadius: 8, marginBottom: 10, backgroundColor: "#fff" },
  errorText: { color: "red", marginBottom: 10 },
  registerText: { marginTop: 15, color: colors.primaryDark, textDecorationLine: "underline" },
<<<<<<< HEAD
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
});

export default LoginScreen;
=======
});

export default LoginScreen;
>>>>>>> c95afc6d013d9e43c6593487d1478fb576db87ba
