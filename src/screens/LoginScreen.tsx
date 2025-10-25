import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RootStackParamList} from '../navigation/AppNavigator';
import DatabaseService from '../services/DatabaseService';

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

export default function LoginScreen() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await DatabaseService.initializeSampleData();
        
        // Check if user is already logged in
        const currentUser = await DatabaseService.getCurrentUser();
        if (currentUser) {
          if (currentUser.userType === 'bank') {
            navigation.replace('BankTabs');
          } else {
            navigation.replace('UserTabs');
          }
        }
      } catch (error) {
        console.error('Error initializing app:', error);
      } finally {
        setInitializing(false);
      }
    };

    initializeApp();
  }, [navigation]);

  const handleLogin = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu correo electrónico');
      return;
    }

    setLoading(true);
    try {
      const users = await DatabaseService.getAllUsers();
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

      if (!user) {
        Alert.alert('Error', 'Usuario no encontrado');
        setLoading(false);
        return;
      }

      await DatabaseService.setCurrentUser(user.id);

      if (user.userType === 'bank') {
        navigation.replace('BankTabs');
      } else {
        navigation.replace('UserTabs');
      }
    } catch (error) {
      Alert.alert('Error', 'Error al iniciar sesión');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (initializing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E20714" />
        <Text style={styles.loadingText}>Inicializando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Banorte</Text>
        <Text style={styles.subtitle}>Energía Inteligente</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Correo Electrónico</Text>
        <TextInput
          style={styles.input}
          placeholder="usuario@banorte.com"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          editable={!loading}
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Iniciar Sesión</Text>
          )}
        </TouchableOpacity>

        <View style={styles.demoSection}>
          <Text style={styles.demoTitle}>Usuarios Demo:</Text>
          <Text style={styles.demoText}>Cliente: juan.perez@banorte.com</Text>
          <Text style={styles.demoText}>Cliente: maria.gonzalez@banorte.com</Text>
          <Text style={styles.demoText}>Banco: admin@banorte.com</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Smart Cities - HackMTY 2025</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#E20714',
    padding: 40,
    alignItems: 'center',
    paddingTop: 80,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#fff',
  },
  form: {
    flex: 1,
    padding: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#E20714',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  demoSection: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  demoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  demoText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    color: '#999',
    fontSize: 12,
  },
});
