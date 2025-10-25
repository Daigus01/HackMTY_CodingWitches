import AsyncStorage from '@react-native-async-storage/async-storage';
import {User, ElectricityBill, EnergyBaseline, Cashback} from '../models/User';

const STORAGE_KEYS = {
  USERS: '@users',
  BILLS: '@bills',
  BASELINES: '@baselines',
  CASHBACKS: '@cashbacks',
  CURRENT_USER: '@current_user',
};

class DatabaseService {
  // User operations
  async createUser(user: User): Promise<void> {
    const users = await this.getAllUsers();
    users.push(user);
    await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }

  async getAllUsers(): Promise<User[]> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.USERS);
    return data ? JSON.parse(data) : [];
  }

  async getUserById(id: string): Promise<User | null> {
    const users = await this.getAllUsers();
    return users.find(u => u.id === id) || null;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<void> {
    const users = await this.getAllUsers();
    const index = users.findIndex(u => u.id === id);
    if (index !== -1) {
      users[index] = {...users[index], ...updates};
      await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    }
  }

  async setCurrentUser(userId: string): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, userId);
  }

  async getCurrentUser(): Promise<User | null> {
    const userId = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!userId) return null;
    return this.getUserById(userId);
  }

  async logout(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }

  // Electricity Bill operations
  async createBill(bill: ElectricityBill): Promise<void> {
    const bills = await this.getAllBills();
    bills.push(bill);
    await AsyncStorage.setItem(STORAGE_KEYS.BILLS, JSON.stringify(bills));
  }

  async getAllBills(): Promise<ElectricityBill[]> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.BILLS);
    return data ? JSON.parse(data) : [];
  }

  async getBillsByUserId(userId: string): Promise<ElectricityBill[]> {
    const bills = await this.getAllBills();
    return bills
      .filter(b => b.userId === userId)
      .sort((a, b) => {
        // Use string comparison for ISO date periods
        return b.period.localeCompare(a.period);
      });
  }

  async getBillByPeriod(userId: string, period: string): Promise<ElectricityBill | null> {
    const bills = await this.getBillsByUserId(userId);
    return bills.find(b => b.period === period) || null;
  }

  // Energy Baseline operations
  async createBaseline(baseline: EnergyBaseline): Promise<void> {
    const baselines = await this.getAllBaselines();
    baselines.push(baseline);
    await AsyncStorage.setItem(STORAGE_KEYS.BASELINES, JSON.stringify(baselines));
  }

  async getAllBaselines(): Promise<EnergyBaseline[]> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.BASELINES);
    return data ? JSON.parse(data) : [];
  }

  async getBaselineByUserAndPeriod(
    userId: string,
    period: string,
  ): Promise<EnergyBaseline | null> {
    const baselines = await this.getAllBaselines();
    return baselines.find(b => b.userId === userId && b.period === period) || null;
  }

  async getBaselinesByUserId(userId: string): Promise<EnergyBaseline[]> {
    const baselines = await this.getAllBaselines();
    return baselines.filter(b => b.userId === userId);
  }

  // Cashback operations
  async createCashback(cashback: Cashback): Promise<void> {
    const cashbacks = await this.getAllCashbacks();
    cashbacks.push(cashback);
    await AsyncStorage.setItem(STORAGE_KEYS.CASHBACKS, JSON.stringify(cashbacks));
  }

  async getAllCashbacks(): Promise<Cashback[]> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.CASHBACKS);
    return data ? JSON.parse(data) : [];
  }

  async getCashbacksByUserId(userId: string): Promise<Cashback[]> {
    const cashbacks = await this.getAllCashbacks();
    return cashbacks
      .filter(c => c.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async updateCashback(id: string, updates: Partial<Cashback>): Promise<void> {
    const cashbacks = await this.getAllCashbacks();
    const index = cashbacks.findIndex(c => c.id === id);
    if (index !== -1) {
      cashbacks[index] = {...cashbacks[index], ...updates};
      await AsyncStorage.setItem(STORAGE_KEYS.CASHBACKS, JSON.stringify(cashbacks));
    }
  }

  // Initialize with sample data
  async initializeSampleData(): Promise<void> {
    const users = await this.getAllUsers();
    if (users.length === 0) {
      // Create sample users
      const sampleUsers: User[] = [
        {
          id: '1',
          name: 'Juan Pérez',
          email: 'juan.perez@banorte.com',
          accountNumber: '1234567890',
          address: 'Av. Constitución 100, Monterrey, NL',
          phoneNumber: '8112345678',
          createdAt: new Date(),
          userType: 'customer',
        },
        {
          id: '2',
          name: 'María González',
          email: 'maria.gonzalez@banorte.com',
          accountNumber: '0987654321',
          address: 'Calle Juárez 200, Monterrey, NL',
          phoneNumber: '8187654321',
          createdAt: new Date(),
          userType: 'customer',
        },
        {
          id: 'bank1',
          name: 'Banorte Admin',
          email: 'admin@banorte.com',
          accountNumber: 'BANK001',
          address: 'Banorte HQ',
          phoneNumber: '8100000000',
          createdAt: new Date(),
          userType: 'bank',
        },
      ];

      for (const user of sampleUsers) {
        await this.createUser(user);
      }

      // Create sample bills for first user
      const sampleBills: ElectricityBill[] = [
        {
          id: '1',
          userId: '1',
          period: '2025-08',
          consumptionKwh: 450,
          amountPaid: 1350,
          billDate: new Date('2025-08-15'),
          createdAt: new Date(),
        },
        {
          id: '2',
          userId: '1',
          period: '2025-09',
          consumptionKwh: 420,
          amountPaid: 1260,
          billDate: new Date('2025-09-15'),
          createdAt: new Date(),
        },
        {
          id: '3',
          userId: '1',
          period: '2025-10',
          consumptionKwh: 380,
          amountPaid: 1140,
          billDate: new Date('2025-10-15'),
          createdAt: new Date(),
        },
      ];

      for (const bill of sampleBills) {
        await this.createBill(bill);
      }

      // Create sample baselines
      const baseline: EnergyBaseline = {
        id: '1',
        userId: '1',
        period: '2025-10',
        baselineKwh: 435, // Average of previous periods
        calculatedAt: new Date(),
      };
      await this.createBaseline(baseline);

      // Create sample cashback
      const cashback: Cashback = {
        id: '1',
        userId: '1',
        period: '2025-10',
        savingsKwh: 55, // 435 - 380
        savingsPercentage: 12.6,
        cashbackAmount: 137.5, // 55 kWh * $2.5 per kWh (10-15% tier)
        status: 'approved',
        createdAt: new Date(),
      };
      await this.createCashback(cashback);
    }
  }

  // Clear all data (for testing)
  async clearAllData(): Promise<void> {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.USERS,
      STORAGE_KEYS.BILLS,
      STORAGE_KEYS.BASELINES,
      STORAGE_KEYS.CASHBACKS,
      STORAGE_KEYS.CURRENT_USER,
    ]);
  }
}

export default new DatabaseService();
