import {format, subMonths} from 'date-fns';
import DatabaseService from './DatabaseService';
import {Cashback} from '../models/User';

class EnergyCalculatorService {
  /**
   * Calculate the energy baseline for a user based on their historical consumption
   * Uses weighted average of last 3-6 months
   */
  async calculateBaseline(userId: string, currentPeriod: string): Promise<number> {
    const bills = await DatabaseService.getBillsByUserId(userId);
    
    // Get bills from previous periods (excluding current) and ensure they're sorted
    const previousBills = bills
      .filter(bill => bill.period < currentPeriod)
      .sort((a, b) => b.period.localeCompare(a.period)); // Sort descending by period
    
    if (previousBills.length === 0) {
      // No history, use a default baseline
      return 400; // Default 400 kWh
    }

    // Take last 3-6 months for calculation
    const recentBills = previousBills.slice(0, Math.min(6, previousBills.length));
    
    // Calculate weighted average (more recent months have higher weight)
    let totalWeight = 0;
    let weightedSum = 0;
    
    recentBills.forEach((bill, index) => {
      const weight = recentBills.length - index; // More recent = higher weight
      weightedSum += bill.consumptionKwh * weight;
      totalWeight += weight;
    });
    
    return Math.round(weightedSum / totalWeight);
  }

  /**
   * Calculate cashback based on energy savings
   * @param savingsKwh - Amount of energy saved in kWh
   * @param baselineKwh - Baseline consumption
   * @returns Cashback amount in currency
   */
  calculateCashbackAmount(savingsKwh: number, baselineKwh: number): number {
    if (savingsKwh <= 0) {
      return 0;
    }

    const savingsPercentage = (savingsKwh / baselineKwh) * 100;
    
    // Cashback tiers:
    // 0-5%: $1.5 per kWh saved
    // 5-10%: $2 per kWh saved
    // 10-15%: $2.5 per kWh saved
    // 15%+: $3 per kWh saved
    
    let ratePerKwh = 1.5;
    
    if (savingsPercentage >= 15) {
      ratePerKwh = 3;
    } else if (savingsPercentage >= 10) {
      ratePerKwh = 2.5;
    } else if (savingsPercentage >= 5) {
      ratePerKwh = 2;
    }
    
    return Math.round(savingsKwh * ratePerKwh * 100) / 100;
  }

  /**
   * Process cashback for a user's current period
   */
  async processCashback(userId: string, period: string): Promise<Cashback | null> {
    // Get current bill
    const currentBill = await DatabaseService.getBillByPeriod(userId, period);
    if (!currentBill) {
      return null;
    }

    // Calculate or get baseline
    let baseline = await DatabaseService.getBaselineByUserAndPeriod(userId, period);
    if (!baseline) {
      const baselineKwh = await this.calculateBaseline(userId, period);
      baseline = {
        id: `baseline_${userId}_${period}`,
        userId,
        period,
        baselineKwh,
        calculatedAt: new Date(),
      };
      await DatabaseService.createBaseline(baseline);
    }

    // Calculate savings
    const savingsKwh = baseline.baselineKwh - currentBill.consumptionKwh;
    const savingsPercentage = Math.round((savingsKwh / baseline.baselineKwh) * 1000) / 10;

    // Calculate cashback
    const cashbackAmount = this.calculateCashbackAmount(savingsKwh, baseline.baselineKwh);

    // Check if cashback already exists
    const existingCashbacks = await DatabaseService.getCashbacksByUserId(userId);
    const existingCashback = existingCashbacks.find(c => c.period === period);

    if (existingCashback) {
      // Update existing cashback
      await DatabaseService.updateCashback(existingCashback.id, {
        savingsKwh,
        savingsPercentage,
        cashbackAmount,
      });
      return {
        ...existingCashback,
        savingsKwh,
        savingsPercentage,
        cashbackAmount,
      };
    }

    // Create new cashback
    const newCashback: Cashback = {
      id: `cashback_${userId}_${period}_${Date.now()}`,
      userId,
      period,
      savingsKwh,
      savingsPercentage,
      cashbackAmount,
      status: savingsKwh > 0 ? 'approved' : 'pending',
      createdAt: new Date(),
    };

    await DatabaseService.createCashback(newCashback);
    return newCashback;
  }

  /**
   * Get current period in YYYY-MM format
   */
  getCurrentPeriod(): string {
    return format(new Date(), 'yyyy-MM');
  }

  /**
   * Get previous period in YYYY-MM format
   */
  getPreviousPeriod(monthsAgo: number = 1): string {
    return format(subMonths(new Date(), monthsAgo), 'yyyy-MM');
  }
}

export default new EnergyCalculatorService();
