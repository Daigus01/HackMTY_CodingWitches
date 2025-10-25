import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DatabaseService from '../services/DatabaseService';
import {ElectricityBill} from '../models/User';

export default function BillHistoryScreen() {
  const [bills, setBills] = useState<ElectricityBill[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadBills();
  }, []);

  const loadBills = async () => {
    try {
      const user = await DatabaseService.getCurrentUser();
      if (user) {
        const userBills = await DatabaseService.getBillsByUserId(user.id);
        setBills(userBills);
      }
    } catch (error) {
      console.error('Error loading bills:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadBills();
  };

  const renderBillItem = ({item}: {item: ElectricityBill}) => (
    <View style={styles.billCard}>
      <View style={styles.billHeader}>
        <View style={styles.periodBadge}>
          <Text style={styles.periodText}>{item.period}</Text>
        </View>
        <Icon name="receipt" size={24} color="#E20714" />
      </View>
      
      <View style={styles.billContent}>
        <View style={styles.billRow}>
          <Text style={styles.label}>Consumo</Text>
          <Text style={styles.value}>{item.consumptionKwh} kWh</Text>
        </View>
        <View style={styles.billRow}>
          <Text style={styles.label}>Monto Pagado</Text>
          <Text style={styles.value}>${item.amountPaid} MXN</Text>
        </View>
        <View style={styles.billRow}>
          <Text style={styles.label}>Costo por kWh</Text>
          <Text style={styles.value}>
            ${(item.amountPaid / item.consumptionKwh).toFixed(2)}
          </Text>
        </View>
        <View style={styles.billRow}>
          <Text style={styles.label}>Fecha</Text>
          <Text style={styles.value}>
            {new Date(item.billDate).toLocaleDateString('es-MX')}
          </Text>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E20714" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {bills.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="receipt-long" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No hay recibos registrados</Text>
          <Text style={styles.emptySubtext}>
            Escanea tu primer recibo para comenzar
          </Text>
        </View>
      ) : (
        <FlatList
          data={bills}
          renderItem={renderBillItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        />
      )}
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
  listContainer: {
    padding: 20,
  },
  billCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  billHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  periodBadge: {
    backgroundColor: '#E20714',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  periodText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  billContent: {
    gap: 12,
  },
  billRow: {
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
});
