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
import {Cashback} from '../models/User';

export default function CashbackHistoryScreen() {
  const [cashbacks, setCashbacks] = useState<Cashback[]>([]);
  const [totalCashback, setTotalCashback] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadCashbacks();
  }, []);

  const loadCashbacks = async () => {
    try {
      const user = await DatabaseService.getCurrentUser();
      if (user) {
        const userCashbacks = await DatabaseService.getCashbacksByUserId(user.id);
        setCashbacks(userCashbacks);
        
        const total = userCashbacks
          .filter(c => c.status === 'approved' || c.status === 'paid')
          .reduce((sum, c) => sum + c.cashbackAmount, 0);
        setTotalCashback(total);
      }
    } catch (error) {
      console.error('Error loading cashbacks:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadCashbacks();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return '#4CAF50';
      case 'paid':
        return '#2196F3';
      default:
        return '#FFA000';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Aprobado';
      case 'paid':
        return 'Pagado';
      default:
        return 'Pendiente';
    }
  };

  const renderCashbackItem = ({item}: {item: Cashback}) => (
    <View style={styles.cashbackCard}>
      <View style={styles.cardHeader}>
        <View style={styles.periodBadge}>
          <Text style={styles.periodText}>{item.period}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            {backgroundColor: getStatusColor(item.status)},
          ]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>

      <View style={styles.amountSection}>
        <Text style={styles.amountLabel}>Cashback</Text>
        <Text style={styles.amountValue}>${item.cashbackAmount.toFixed(2)} MXN</Text>
      </View>

      <View style={styles.detailsSection}>
        <View style={styles.detailRow}>
          <Icon name="flash-on" size={20} color="#4CAF50" />
          <Text style={styles.detailLabel}>Ahorro de energía</Text>
        </View>
        <Text style={styles.detailValue}>
          {item.savingsKwh} kWh ({item.savingsPercentage.toFixed(1)}%)
        </Text>
      </View>

      <Text style={styles.dateText}>
        {new Date(item.createdAt).toLocaleDateString('es-MX')}
      </Text>
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
      <View style={styles.summaryCard}>
        <Icon name="account-balance-wallet" size={32} color="#fff" />
        <View style={styles.summaryContent}>
          <Text style={styles.summaryLabel}>Cashback Total</Text>
          <Text style={styles.summaryAmount}>${totalCashback.toFixed(2)} MXN</Text>
        </View>
      </View>

      {cashbacks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="money-off" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No hay cashback registrado</Text>
          <Text style={styles.emptySubtext}>
            Escanea tus recibos para comenzar a ganar cashback
          </Text>
        </View>
      ) : (
        <FlatList
          data={cashbacks}
          renderItem={renderCashbackItem}
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
  summaryCard: {
    backgroundColor: '#E20714',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryContent: {
    marginLeft: 16,
    flex: 1,
  },
  summaryLabel: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.9,
  },
  summaryAmount: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 4,
  },
  listContainer: {
    padding: 20,
    paddingTop: 0,
  },
  cashbackCard: {
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  periodBadge: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  periodText: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 14,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  amountSection: {
    marginBottom: 16,
  },
  amountLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  detailsSection: {
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
    marginLeft: 28,
  },
  dateText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
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
