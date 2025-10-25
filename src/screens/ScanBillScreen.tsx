import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DatabaseService from '../services/DatabaseService';
import EnergyCalculatorService from '../services/EnergyCalculatorService';
import {ElectricityBill} from '../models/User';
import {getCurrentPeriod, isValidPeriod} from '../utils/dateUtils';

export default function ScanBillScreen() {
  const navigation = useNavigation();
  const [period, setPeriod] = useState('');
  const [consumption, setConsumption] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleScanSimulation = () => {
    Alert.alert(
      'Escaneo OCR',
      'En una implementación completa, aquí se abriría la cámara para escanear el recibo usando OCR. Por ahora, ingresa los datos manualmente.',
      [{text: 'Entendido'}],
    );
  };

  const handleSubmit = async () => {
    if (!period || !consumption || !amount) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    // Validate period format (YYYY-MM)
    if (!isValidPeriod(period)) {
      Alert.alert('Error', 'Formato de periodo inválido. Usa YYYY-MM (ej: 2025-10)');
      return;
    }

    setLoading(true);
    try {
      const user = await DatabaseService.getCurrentUser();
      if (!user) {
        Alert.alert('Error', 'Usuario no encontrado');
        return;
      }

      // Check if bill already exists for this period
      const existingBill = await DatabaseService.getBillByPeriod(user.id, period);
      if (existingBill) {
        Alert.alert('Error', 'Ya existe un recibo para este periodo');
        setLoading(false);
        return;
      }

      const newBill: ElectricityBill = {
        id: `bill_${user.id}_${period}_${Date.now()}`,
        userId: user.id,
        period,
        consumptionKwh: parseFloat(consumption),
        amountPaid: parseFloat(amount),
        billDate: new Date(),
        createdAt: new Date(),
      };

      await DatabaseService.createBill(newBill);

      // Calculate cashback for this period
      const cashback = await EnergyCalculatorService.processCashback(user.id, period);

      let message = 'Recibo registrado exitosamente';
      if (cashback && cashback.savingsKwh > 0) {
        message += `\n\n¡Felicidades! Ahorraste ${cashback.savingsKwh} kWh (${cashback.savingsPercentage.toFixed(1)}%)\n\nCashback: $${cashback.cashbackAmount.toFixed(2)} MXN`;
      } else if (cashback) {
        message += '\n\nNo hubo ahorro en este periodo. ¡Intenta reducir tu consumo el próximo mes!';
      }

      Alert.alert('Éxito', message, [
        {
          text: 'Ver Dashboard',
          onPress: () => navigation.navigate('Dashboard' as never),
        },
      ]);

      // Clear form
      setPeriod('');
      setConsumption('');
      setAmount('');
    } catch (error) {
      console.error('Error saving bill:', error);
      Alert.alert('Error', 'No se pudo guardar el recibo');
    } finally {
      setLoading(false);
    }
  };

  const fillSampleData = () => {
    setPeriod(getCurrentPeriod());
    setConsumption('350');
    setAmount('1050');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Icon name="info" size={24} color="#1976D2" />
        <Text style={styles.headerText}>
          Escanea tu recibo de luz o ingresa los datos manualmente
        </Text>
      </View>

      {/* OCR Simulation Button */}
      <TouchableOpacity
        style={styles.scanButton}
        onPress={handleScanSimulation}>
        <Icon name="camera-alt" size={32} color="#fff" />
        <Text style={styles.scanButtonText}>Escanear Recibo (OCR)</Text>
        <Text style={styles.scanButtonSubtext}>Próximamente disponible</Text>
      </TouchableOpacity>

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>o ingresa manualmente</Text>
        <View style={styles.dividerLine} />
      </View>

      {/* Manual Input Form */}
      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Periodo (YYYY-MM)</Text>
          <TextInput
            style={styles.input}
            placeholder="2025-10"
            value={period}
            onChangeText={setPeriod}
            editable={!loading}
          />
          <Text style={styles.hint}>Ejemplo: 2025-10 para Octubre 2025</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Consumo (kWh)</Text>
          <TextInput
            style={styles.input}
            placeholder="350"
            value={consumption}
            onChangeText={setConsumption}
            keyboardType="numeric"
            editable={!loading}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Monto Pagado (MXN)</Text>
          <TextInput
            style={styles.input}
            placeholder="1050"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            editable={!loading}
          />
        </View>

        <TouchableOpacity
          style={styles.sampleButton}
          onPress={fillSampleData}
          disabled={loading}>
          <Text style={styles.sampleButtonText}>Llenar con datos de ejemplo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Guardar Recibo</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.infoBox}>
        <Icon name="lightbulb" size={20} color="#FFA000" />
        <Text style={styles.infoText}>
          Tip: Mantén tus recibos actualizados para calcular tu cashback mensual automáticamente
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
  header: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    padding: 16,
    margin: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#1976D2',
    lineHeight: 20,
  },
  scanButton: {
    backgroundColor: '#E20714',
    margin: 20,
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 12,
  },
  scanButtonSubtext: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
    opacity: 0.9,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#ddd',
  },
  dividerText: {
    marginHorizontal: 10,
    color: '#666',
    fontSize: 14,
  },
  form: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  hint: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  sampleButton: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  sampleButtonText: {
    color: '#666',
    fontSize: 14,
  },
  submitButton: {
    backgroundColor: '#E20714',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#FFF3E0',
    margin: 20,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 13,
    color: '#E65100',
    lineHeight: 18,
  },
});
