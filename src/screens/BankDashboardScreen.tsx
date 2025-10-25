import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
  TouchableOpacity,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DatabaseService from '../services/DatabaseService';
import {User, Cashback} from '../models/User';

export default function BankDashboardScreen() {
  const navigation = useNavigation();
  const [users, setUsers] = useState<User[]>([]);
  const [cashbacks, setCashbacks] = useState<Cashback[]>([]);
  const [totalCashback, setTotalCashback] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalSavings, setTotalSavings] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadBankData();
  }, []);

  const loadBankData = async () => {
    try {
      const allUsers = await DatabaseService.getAllUsers();
      const customers = allUsers.filter(u => u.userType === 'customer');
      setUsers(customers);
      setTotalUsers(customers.length);

      const allCashbacks = await DatabaseService.getAllCashbacks();
      setCashbacks(allCashbacks);

      const total = allCashbacks
        .filter(c => c.status === 'approved' || c.status === 'paid')
        .reduce((sum, c) => sum + c.cashbackAmount, 0);
      setTotalCashback(total);

      const savings = allCashbacks.reduce((sum, c) => sum + c.savingsKwh, 0);
      setTotalSavings(savings);
    } catch (error) {
      console.error('Error loading bank data:', error);
      Alert.alert('Error', 'No se pudo cargar la información');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadBankData();
  };

  const handleLogout = async () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        {text: 'Cancelar', style: 'cancel'},
        {
          text: 'Salir',
          style: 'destructive',
          onPress: async () => {
            await DatabaseService.logout();
            navigation.reset({
              index: 0,
              routes: [{name: 'Login' as never}],
            });
          },
        },
      ],
    );
  };

  const renderUserItem = ({item}: {item: User}) => {
    const userCashbacks = cashbacks.filter(c => c.userId === item.id);
    const userTotal = userCashbacks
      .filter(c => c.status === 'approved' || c.status === 'paid')
      .reduce((sum, c) => sum + c.cashbackAmount, 0);

    return (
      <View style={styles.userCard}>
        <View style={styles.userHeader}>
          <Icon name="account-circle" size={40} color="#E20714" />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{item.name}</Text>
            <Text style={styles.userEmail}>{item.email}</Text>
            <Text style={styles.userAccount}>Cuenta: {item.accountNumber}</Text>
          </View>
        </View>
        <View style={styles.userStats}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Cashback Total</Text>
            <Text style={styles.statValue}>${userTotal.toFixed(2)}</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Recibos</Text>
            <Text style={styles.statValue}>{userCashbacks.length}</Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E20714" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Dashboard Banorte</Text>
            <Text style={styles.subtitle}>Administración del Sistema</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Icon name="logout" size={24} color="#E20714" />
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Icon name="people" size={32} color="#fff" />
            <Text style={styles.statCardValue}>{totalUsers}</Text>
            <Text style={styles.statCardLabel}>Usuarios Activos</Text>
          </View>

          <View style={[styles.statCard, styles.statCardGreen]}>
            <Icon name="attach-money" size={32} color="#fff" />
            <Text style={styles.statCardValue}>${totalCashback.toFixed(0)}</Text>
            <Text style={styles.statCardLabel}>Cashback Total</Text>
          </View>

          <View style={[styles.statCard, styles.statCardBlue]}>
            <Icon name="flash-on" size={32} color="#fff" />
            <Text style={styles.statCardValue}>{totalSavings.toFixed(0)}</Text>
            <Text style={styles.statCardLabel}>kWh Ahorrados</Text>
          </View>
        </View>

        {/* Impact Section */}
        <View style={styles.impactSection}>
          <Text style={styles.sectionTitle}>Impacto Ambiental</Text>
          <View style={styles.impactCard}>
            <Icon name="eco" size={40} color="#4CAF50" />
            <View style={styles.impactContent}>
              <Text style={styles.impactValue}>
                {(totalSavings * 0.5).toFixed(1)} kg
              </Text>
              <Text style={styles.impactLabel}>CO₂ reducido</Text>
              <Text style={styles.impactDescription}>
                Equivalente a plantar {Math.round(totalSavings / 20)} árboles
              </Text>
            </View>
          </View>
        </View>

        {/* Users List */}
        <View style={styles.usersSection}>
          <Text style={styles.sectionTitle}>Usuarios ({users.length})</Text>
          {users.map(user => (
            <View key={user.id}>{renderUserItem({item: user})}</View>
          ))}
        </View>

        {/* Recent Cashbacks */}
        <View style={styles.recentSection}>
          <Text style={styles.sectionTitle}>Cashbacks Recientes</Text>
          {cashbacks.slice(0, 5).map(cashback => {
            const user = users.find(u => u.id === cashback.userId);
            return (
              <View key={cashback.id} style={styles.cashbackItem}>
                <View style={styles.cashbackInfo}>
                  <Text style={styles.cashbackUser}>{user?.name || 'Usuario'}</Text>
                  <Text style={styles.cashbackPeriod}>{cashback.period}</Text>
                </View>
                <View style={styles.cashbackAmount}>
                  <Text style={styles.cashbackValue}>
                    ${cashback.cashbackAmount.toFixed(2)}
                  </Text>
                  <Text style={styles.cashbackSavings}>
                    {cashback.savingsKwh} kWh
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  logoutButton: {
    padding: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#E20714',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statCardGreen: {
    backgroundColor: '#4CAF50',
  },
  statCardBlue: {
    backgroundColor: '#2196F3',
  },
  statCardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 8,
  },
  statCardLabel: {
    fontSize: 12,
    color: '#fff',
    marginTop: 4,
    textAlign: 'center',
  },
  impactSection: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  impactCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  impactContent: {
    marginLeft: 16,
    flex: 1,
  },
  impactValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  impactLabel: {
    fontSize: 16,
    color: '#333',
    marginTop: 4,
  },
  impactDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  usersSection: {
    padding: 20,
    paddingTop: 0,
  },
  userCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  userInfo: {
    marginLeft: 12,
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  userEmail: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  userAccount: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  userStats: {
    flexDirection: 'row',
    gap: 12,
  },
  stat: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E20714',
    marginTop: 4,
  },
  recentSection: {
    padding: 20,
    paddingTop: 0,
  },
  cashbackItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cashbackInfo: {
    flex: 1,
  },
  cashbackUser: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  cashbackPeriod: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  cashbackAmount: {
    alignItems: 'flex-end',
  },
  cashbackValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  cashbackSavings: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
});
