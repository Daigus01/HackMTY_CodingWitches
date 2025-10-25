export interface User {
  id: string;
  name: string;
  email: string;
  accountNumber: string;
  address: string;
  phoneNumber: string;
  createdAt: Date;
  userType: 'customer' | 'bank';
}

export interface ElectricityBill {
  id: string;
  userId: string;
  period: string; // Format: YYYY-MM
  consumptionKwh: number;
  amountPaid: number;
  billDate: Date;
  scannedImageUri?: string;
  createdAt: Date;
}

export interface EnergyBaseline {
  id: string;
  userId: string;
  period: string;
  baselineKwh: number;
  calculatedAt: Date;
}

export interface Cashback {
  id: string;
  userId: string;
  period: string;
  savingsKwh: number;
  savingsPercentage: number;
  cashbackAmount: number;
  status: 'pending' | 'approved' | 'paid';
  createdAt: Date;
}
