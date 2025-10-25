import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DatabaseService from '../services/DatabaseService';
import {User, ElectricityBill, Cashback} from '../models/User';

export default function UserDashboardScreen() {
  const navigation = useNavigation();
  const [user, setUser] = useState<User | null>(null);
  const [recentBill, setRecentBill] = useState<ElectricityBill | null>(null);
  const [totalCashback, setTotalCashback] = useState(0);
  const [recentCashback, setRecentCashback] = useState<Cashback | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const currentUser = await DatabaseService.getCurrentUser();
      if (!currentUser) {
        return;
      }

      setUser(currentUser);

      // Get recent bill
      const bills = await DatabaseService.getBillsByUserId(currentUser.id);
      if (bills.length > 0) {
        setRecentBill(bills[0]);
      }

      // Get cashback data
      const cashbacks = await DatabaseService.getCashbacksByUserId(currentUser.id);
      const total = cashbacks
        .filter(c => c.status === 'approved' || c.status === 'paid')
        .reduce((sum, c) => sum + c.cashbackAmount, 0);
      setTotalCashback(total);

      if (cashbacks.length > 0) {
        setRecentCashback(cashbacks[0]);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
      Alert.alert('Error', 'No se pudo cargar el dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E20714" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hola,</Text>
          <Text style={styles.userName}>{user?.name || 'Usuario'}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Icon name="logout" size={24} color="#E20714" />
        </TouchableOpacity>
      </View>

      {/* Cashback Card */}
      <View style={styles.cashbackCard}>
        <View style={styles.cashbackHeader}>
          <Icon name="attach-money" size={30} color="#fff" />
          <Text style={styles.cashbackTitle}>Tu Cashback</Text>
        </View>
        <Text style={styles.cashbackAmount}>${totalCashback.toFixed(2)} MXN</Text>
        <Text style={styles.cashbackSubtitle}>Acumulado total</Text>
      </View>

      {/* Recent Bill Card */}
      {recentBill && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="receipt" size={24} color="#E20714" />
            <Text style={styles.cardTitle}>Último Recibo</Text>
          </View>
          <View style={styles.cardContent}>
            <View style={styles.row}>
              <Text style={styles.label}>Periodo:</Text>
              <Text style={styles.value}>{recentBill.period}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Consumo:</Text>
              <Text style={styles.value}>{recentBill.consumptionKwh} kWh</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Monto:</Text>
              <Text style={styles.value}>${recentBill.amountPaid} MXN</Text>
            </View>
          </View>
        </View>
      )}

      {/* Recent Cashback Card */}
      {recentCashback && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Icon name="trending-down" size={24} color="#4CAF50" />
            <Text style={styles.cardTitle}>Ahorro del Mes</Text>
          </View>
          <View style={styles.cardContent}>
            <View style={styles.row}>
              <Text style={styles.label}>Periodo:</Text>
              <Text style={styles.value}>{recentCashback.period}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Ahorro:</Text>
              <Text style={[styles.value, styles.successText]}>
                {recentCashback.savingsKwh} kWh ({recentCashback.savingsPercentage.toFixed(1)}%)
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Cashback:</Text>
              <Text style={[styles.value, styles.successText]}>
                ${recentCashback.cashbackAmount.toFixed(2)} MXN
              </Text>
            </View>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>
                {recentCashback.status === 'approved' ? '✓ Aprobado' : 
                 recentCashback.status === 'paid' ? '✓ Pagado' : 'Pendiente'}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Quick Actions */}
      <View style={styles.actionsContainer}>
        <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('ScanBill' as never)}>
            <Icon name="camera-alt" size={32} color="#E20714" />
            <Text style={styles.actionText}>Escanear Recibo</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('BillHistory' as never)}>
            <Icon name="history" size={32} color="#E20714" />
            <Text style={styles.actionText}>Ver Historial</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Info Section */}
      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>¿Cómo funciona?</Text>
        <Text style={styles.infoText}>
          1. Escanea tu recibo de luz cada mes{'\n'}
          2. Nuestro algoritmo calcula tu consumo vs. tu línea base{'\n'}
          3. Si ahorras energía, recibes cashback{'\n'}
          4. ¡Mientras más ahorres, más ganas!
        </Text>
      </View>
    </ScrollView>
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
    fontSize: 16,
    color: '#666',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  logoutButton: {
    padding: 8,
  },
  cashbackCard: {
    backgroundColor: '#E20714',
    margin: 20,
    padding: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cashbackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cashbackTitle: {
    fontSize: 18,
    color: '#fff',
    marginLeft: 8,
    fontWeight: '600',
  },
  cashbackAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  cashbackSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#333',
  },
  cardContent: {
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    color: '#666',
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  successText: {
    color: '#4CAF50',
  },
  statusBadge: {
    backgroundColor: '#E8F5E9',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  statusText: {
    color: '#4CAF50',
    fontWeight: '600',
    fontSize: 14,
  },
  actionsContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionText: {
    marginTop: 8,
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
  },
  infoSection: {
    margin: 20,
    padding: 16,
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1976D2',
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 22,
  },
});
