
import { WaterData, FoodData, EnergyData, CalculatorResults } from '../types';

// BASLINES (Egypt & MENA Context)
const AVG_TAP_LEAK_LITER_PER_HOUR = 3; 
const AVG_TOILET_LEAK_LITER_PER_HOUR = 20; 

// Cost & Consumption
const COST_PER_CUBIC_METER_WATER = 12.5; // Blended tier average
const DRINKING_WATER_REQ_PER_PERSON_DAILY = 3; 
const AVG_FAMILY_SIZE = 4.2; 
const TREE_IRRIGATION_LITERS_MONTH = 120; 

// Carbon Footprint Coefficients
const CO2_PER_M3_WATER = 0.25;
const CO2_PER_KG_FOOD_WASTE = 2.5; 
const AVG_MEAL_WEIGHT_KG = 0.5;

/**
 * Egypt Electricity Grid Factor
 * Standard for Egypt is approx 0.45 kg CO2 per kWh.
 */
const CO2_PER_KWH_EGYPT = 0.45;

/**
 * Egyptian residential electricity slabs (2024-2025, non-commercial).
 * Egypt charges the rate of the bracket the reading falls into against the whole
 * consumption, so a single rate applies to the full month.
 */
export interface EgyptianElectricitySlab {
    maxKwh: number;
    ratePerKwh: number;
    tier: number;
}

export const EGYPT_RESIDENTIAL_ELECTRICITY_SLABS: readonly EgyptianElectricitySlab[] = [
    { maxKwh: 50, ratePerKwh: 0.58, tier: 1 },
    { maxKwh: 100, ratePerKwh: 0.68, tier: 2 },
    { maxKwh: 200, ratePerKwh: 0.83, tier: 3 },
    { maxKwh: 350, ratePerKwh: 1.25, tier: 4 },
    { maxKwh: 650, ratePerKwh: 1.40, tier: 5 },
    { maxKwh: 1000, ratePerKwh: 1.50, tier: 6 },
    { maxKwh: Number.POSITIVE_INFINITY, ratePerKwh: 1.65, tier: 7 },
];

/** Shared platform constants so every module uses the same assumptions. */
export const ELECTRICITY_GRID_CARBON_KG_PER_KWH = CO2_PER_KWH_EGYPT;
export const WATER_CARBON_KG_PER_M3 = CO2_PER_M3_WATER;
export const WATER_BLENDED_RATE_EGP_PER_M3 = COST_PER_CUBIC_METER_WATER;
/** Editable fallback for commercial/industrial bills when kWh is unknown. */
export const DEFAULT_COMMERCIAL_KWH_PRICE_EGP = 2.0;

/**
 * Egyptian Electricity Tariff Engine (2024-2025 Slabs)
 * Domestic Consumption (Non-Commercial)
 */
export const calculateEgyptianElectricBill = (kwh: number): { bill: number, tier: number, nextTier: number } => {
    const slab = EGYPT_RESIDENTIAL_ELECTRICITY_SLABS.find((candidate) => kwh <= candidate.maxKwh)
        ?? EGYPT_RESIDENTIAL_ELECTRICITY_SLABS[EGYPT_RESIDENTIAL_ELECTRICITY_SLABS.length - 1];
    const bill = kwh * slab.ratePerKwh;
    const nextTier = Number.isFinite(slab.maxKwh) ? slab.maxKwh - kwh : 0;

    return { bill: parseFloat(bill.toFixed(2)), tier: slab.tier, nextTier };
};

export const calculateImpact = (water: WaterData, food: FoodData, energy: EnergyData): CalculatorResults => {
  // --- WATER CALCULATIONS ---
  const dailyTapWaste = water.leakingTaps * AVG_TAP_LEAK_LITER_PER_HOUR * water.leakageHoursPerDay;
  const dailyToiletWaste = water.leakingToilets * AVG_TOILET_LEAK_LITER_PER_HOUR * water.leakageHoursPerDay;
  
  const dailyTotalWaterWaste = dailyTapWaste + dailyToiletWaste;
  const monthlyWastedLiters = dailyTotalWaterWaste * 30;
  const monthlyWastedM3 = monthlyWastedLiters / 1000;
  
  const monthlyWaterCostLE = monthlyWastedM3 * COST_PER_CUBIC_METER_WATER;
  const peopleSupportedWater = Math.floor(monthlyWastedLiters / (DRINKING_WATER_REQ_PER_PERSON_DAILY * 30));
  const irrigationPotential = Math.floor(monthlyWastedLiters / TREE_IRRIGATION_LITERS_MONTH);
  const waterCo2 = monthlyWastedM3 * CO2_PER_M3_WATER;

  // --- FOOD CALCULATIONS ---
  const monthlyTotalMeals = food.mealsPerDay * 30;
  const monthlyWastedMeals = Math.floor(monthlyTotalMeals * (food.wastePercentage / 100));
  
  const monthlyFinancialLossLE = monthlyWastedMeals * food.costPerMealLE;
  const familiesSupportedFood = Math.floor(monthlyWastedMeals / AVG_FAMILY_SIZE); 
  const foodCo2 = Math.floor(monthlyWastedMeals * AVG_MEAL_WEIGHT_KG * CO2_PER_KG_FOOD_WASTE);

  // --- ENERGY CALCULATIONS ---
  const { bill, tier, nextTier } = calculateEgyptianElectricBill(energy.monthlyKwh);
  
  // Wasted Energy Logic: AC Inefficiency
  // Rules of Thumb: Every degree below 24C costs 6% more. 
  // Old ACs consume 30% more than Standard. Standard costs 40% more than Inverter.
  const tempDelta = Math.max(0, 24 - energy.acSetTemperature);
  const tempInefficiency = tempDelta * 0.06;
  const typeInefficiency = energy.acType === 'old' ? 0.35 : energy.acType === 'standard' ? 0.20 : 0;
  
  // Estimation: AC usually accounts for 50-70% of summer bills in Egypt
  const acPortionKwh = energy.monthlyKwh * 0.6;
  const wastedKwh = (acPortionKwh * tempInefficiency) + (acPortionKwh * typeInefficiency);
  const wastedEGP = wastedKwh * (bill / energy.monthlyKwh);
  const energyCo2 = energy.monthlyKwh * CO2_PER_KWH_EGYPT;
  
  const efficiencyScore = Math.max(0, 100 - (tempInefficiency * 100) - (typeInefficiency * 100));

  return {
    water: {
      monthlyWastedLiters: Math.round(monthlyWastedLiters),
      monthlyCostLE: parseFloat(monthlyWaterCostLE.toFixed(2)),
      peopleSupported: peopleSupportedWater,
      irrigationPotential,
      co2FootprintKg: parseFloat(waterCo2.toFixed(1))
    },
    food: {
      monthlyWastedMeals,
      monthlyFinancialLossLE: parseFloat(monthlyFinancialLossLE.toFixed(2)),
      familiesSupported: familiesSupportedFood,
      co2EquivalentKg: foodCo2
    },
    energy: {
        monthlyKwh: energy.monthlyKwh,
        monthlyCostEGP: bill,
        wastedKwh: Math.round(wastedKwh),
        wastedEGP: parseFloat(wastedEGP.toFixed(2)),
        co2FootprintKg: parseFloat(energyCo2.toFixed(1)),
        tariffTier: tier,
        nextTierKwh: nextTier,
        efficiencyScore: Math.round(efficiencyScore)
    },
    totalCo2Kg: parseFloat((waterCo2 + foodCo2 + energyCo2).toFixed(1)),
    totalFinancialLeakageEGP: parseFloat((monthlyWaterCostLE + monthlyFinancialLossLE + wastedEGP).toFixed(2))
  };
};
