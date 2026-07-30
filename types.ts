export interface WaterData {
    leakingTaps: number;
    leakingToilets: number;
    leakageHoursPerDay: number;
    monthlyBillLE: number;
    volumetricM3?: number;
}

export interface FoodData {
    mealsPerDay: number;
    costPerMealLE: number;
    wastePercentage: number;
}

export interface EnergyData {
    monthlyKwh: number;
    billEgp: number;
    acCount: number;
    acHoursPerDay: number;
    acSetTemperature: number;
    acType: 'old' | 'standard' | 'inverter';
    majorAppliances: number;
}

export interface CalculatorResults {
    water: {
        monthlyWastedLiters: number;
        monthlyCostLE: number;
        peopleSupported: number;
        irrigationPotential: number;
        co2FootprintKg: number;
    };
    food: {
        monthlyWastedMeals: number;
        monthlyFinancialLossLE: number;
        familiesSupported: number;
        co2EquivalentKg: number;
    };
    energy: {
        monthlyKwh: number;
        monthlyCostEGP: number;
        wastedKwh: number;
        wastedEGP: number;
        co2FootprintKg: number;
        tariffTier: number;
        nextTierKwh: number;
        efficiencyScore: number;
    };
    totalCo2Kg: number;
    totalFinancialLeakageEGP: number;
}

export interface UserProgress {
    waterScore: number;
    badges: string[];
    co2TargetKg: number | null;
    pledges: string[];
}

export interface TrackedAction {
    id: string;
    text: string;
    category: 'daily' | 'weekly' | 'monthly';
    completed: boolean;
    dateAdded: number;
}

export interface SmartAction {
    id: string;
    title: string;
    description: string;
    impact_level: 'High' | 'Medium' | 'Low';
    category: 'Water' | 'Energy' | 'Food' | 'Transport';
    estimated_savings: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface ClimateActionPlan {
    meta: {
        engine_version: string;
        processing_time_ms: number;
        data_quality_score: number;
        language: string;
    };
    baseline: {
        total_co2_kg: number;
        national_comparison: string;
    };
    risk_assessment: {
        level: 'Low' | 'Moderate' | 'High' | 'Critical';
        primary_vector: string;
        description: string;
    };
    financial_analysis: {
        monthly_waste_egp: number;
        annual_waste_egp: number;
        investment_required_egp: number;
        roi_period_months: number;
    };
    impact_summary: string;
    local_context_explanation: string;
    global_context_explanation: string;
    recommended_actions: string[];
    climate_action_plan: {
        daily_actions: SmartAction[];
        weekly_actions: SmartAction[];
        monthly_actions: SmartAction[];
        expected_impact: {
            water: string;
            food: string;
            energy: string;
            co2: string;
        };
    };
}

export interface ExposureAgentInputs {
    locationName: string;
    hoursOutdoors: number;
    transportMode: string;
    lat?: number;
    lon?: number;
}

export interface TelemetryProfile {
    familySize: number;
    housingType: string;
    lifestyle: string;
}

export interface TelemetryHydrationResponse {
    water: WaterData;
    food: FoodData;
    energy: EnergyData;
    meta: {
        confidence_score: number;
        recommended_modules: string[];
        reasoning_summary: string;
    };
}

// Energy Analysis Types
export interface EnergyBillExtraction {
    meter_number: string;
    subscription_type: string;
    property_type: 'residential' | 'commercial';
    previous_reading: number;
    current_reading: number;
    consumption_kwh: number;
    total_amount: number;
    additional_fees: number;
    consumption_tier: string;
    distribution_company: string;
    confidence: number;
}

export interface EnergyAnalysisInputs {
    type: 'residential' | 'corporate';
    ocrData?: EnergyBillExtraction | null;
    
    // Quick Assessment (Residential / Commercial base)
    property_type?: 'apartment' | 'house' | 'villa' | 'office' | 'store' | 'restaurant' | 'factory' | 'school' | 'hospital';
    occupants?: number;
    area_m2?: number;
    monthly_bill?: number;
    bill_increased?: 'yes' | 'no' | 'unknown';
    ac_count?: number;
    ac_hours_daily?: number;
    fridge_count?: number;
    has_electric_heater?: 'yes' | 'no';
    has_dishwasher?: 'yes' | 'no';
    has_dryer?: 'yes' | 'no';
    daily_occupancy_hours?: number;
    lighting_type?: 'led' | 'traditional' | 'mixed';
    has_solar_panels?: 'yes' | 'no';
    has_high_consumption_devices?: 'yes' | 'no';
    
    // Advanced Audit (Corporate specifics)
    computers_count?: number;
    servers_count?: number;
    shifts_count?: number;
    has_data_center?: 'yes' | 'no';
    has_cooling_systems?: 'yes' | 'no';
    has_industrial_equipment?: 'yes' | 'no';
}

export interface EnergyAnalysisReport {
    metrics: {
        estimated_consumption_kwh: number;
        energy_efficiency_score: number;
        energy_waste_score: number;
        carbon_footprint_kg: number;
        cost_optimization_score: number;
        peak_load_risk: string;
        sustainability_rating: string;
        energy_intensity_index: number;
        financial_loss_estimate_egp: number;
        current_tariff_tier: string;
        average_kwh_price_egp: number;
    };
    benchmarks: {
        similar_properties_avg_kwh: number;
        national_avg_kwh: number;
        user_estimated_kwh: number;
    };
    ai_energy_intelligence: {
        high_bill_reasons: string[];
        top_consuming_devices: Array<{ name: string; percentage: number }>;
        savings_opportunities: string;
        quick_wins: string[];
        operational_risks: string[];
    };
    scenario_simulation: {
        replace_with_led: { savings_egp: number; savings_kwh: number; emissions_reduction_kg: number; roi_months: number; description: string };
        ac_to_24: { savings_egp: number; savings_kwh: number; emissions_reduction_kg: number; roi_months: number; description: string };
        replace_old_devices: { savings_egp: number; savings_kwh: number; emissions_reduction_kg: number; roi_months: number; description: string };
        solar_panels: { savings_egp: number; savings_kwh: number; emissions_reduction_kg: number; roi_months: number; description: string };
        thermal_insulation: { savings_egp: number; savings_kwh: number; emissions_reduction_kg: number; roi_months: number; description: string };
    };
}

export interface MobilityInputs {
    occupationType: string;
    weeklyCommuteDays: number;
    governorate: string;
    primaryTransport: string;
    returnTransport: string;
    transfers: string;
    commuteTime: string;
    monthlySpending: string;
    trafficExposure: string;
    isCar: boolean;
    fuelType?: string;
    vehicleYear?: string;
    passengers?: string;
    acUsage?: string;
    fromLocation?: string;
    toLocation?: string;
}

export interface MobilityIntelligenceReport {
    metrics: {
        monthly_cost_egp: number;
        monthly_carbon_kg: number;
        annual_carbon_kg: number;
        monthly_hours_lost: number;
        annual_time_lost: number;
    };
    scores: {
        fuel_dependency: number;
        urban_exposure: string;
        mobility_efficiency: number;
        transportation_risk: number;
        financial_waste_index: number;
    };
    recommendations: {
        financial: string[];
        time_optimization: string[];
        transportation: string[];
        carbon_reduction: string[];
        urban_health: string[];
    };
    advanced_insights: {
        potential_savings_egp_month: number;
        potential_co2_reduction_kg: number;
        potential_time_recovery_hours: number;
        potential_fuel_reduction_liters?: number;
        before_vs_after_narrative: string;
    };
}

export interface ClaimVerificationResult {
    verdict: 'Scientifically Accurate' | 'Plausible' | 'Misleading' | 'False';
    confidence_score: number;
    analysis: string;
    red_flags: string[];
    improvement_suggestion: string;
}

export interface EnvironmentalSnapshot {
    location: string;
    aqi_estimate: number;
    co2_estimate_ppm: number;
    health_implication: string;
    status: 'Good' | 'Moderate' | 'Unhealthy' | 'Hazardous';
    methodology: string;
}

export interface WaterBillExtraction {
    meter_number: string;
    bill_date: string;
    current_reading: number;
    previous_reading: number;
    total_consumption_m3: number;
    total_amount: number;
    pricing_tiers: Array<{ tier_name: string; volume: number; rate: number }>;
    additional_fees: number;
    currency: string;
    confidence: number;
}

export interface WaterAnalysisInputs {
    type: 'residential' | 'corporate';
    family_size?: number;
    housing_type?: 'apartment' | 'house' | 'villa';
    monthly_bill: number;
    bill_increased: 'yes' | 'no' | 'unknown';
    constant_water_sound: 'yes' | 'no';
    damp_stains: 'yes' | 'no';
    toilet_refills: 'yes' | 'no';
    washing_machine_weekly: number;
    
    // Corporate
    facility_type?: 'office' | 'factory' | 'hotel' | 'restaurant' | 'hospital' | 'university' | 'school';
    employees_count?: number;
    visitors_count?: number;
    monthly_water_use_m3?: number;
    irrigation_systems?: 'yes' | 'no';
    cooling_towers?: 'yes' | 'no';
    cleaning_systems?: 'yes' | 'no';

    // OCR overrides
    ocrData?: WaterBillExtraction | null;
}

export interface WaterAnalysisReport {
    meta: {
        timestamp: string;
        methodology: string;
    };
    metrics: {
        water_efficiency_score: number;
        leak_probability_score: number;
        annual_water_waste_liters: number;
        financial_loss_estimate_egp: number;
        water_scarcity_impact_score: number;
        household_sustainability_score: number;
        water_risk_level: 'Excellent' | 'Very Good' | 'Good' | 'Needs Improvement' | 'High Risk';
    };
    benchmarks: {
        similar_household_avg_liters: number;
        national_avg_liters: number;
        user_estimated_liters: number;
    };
    ai_water_intelligence: {
        leak_probability_analysis: string;
        consumption_reduction_opportunities: string;
        cost_reduction_opportunities: string;
        primary_bill_drivers: string[];
    };
    ai_recommendations: Array<{
        action: string;
        impact: 'High' | 'Medium' | 'Low';
        cost: 'High' | 'Medium' | 'Low' | 'Zero';
        speed: 'Fast' | 'Medium' | 'Slow';
    }>;
    scenario_simulation: {
        fix_leaks: { savings_egp: number; savings_liters: number };
        reduce_10_percent: { savings_egp: number; savings_liters: number };
        reduce_25_percent: { savings_egp: number; savings_liters: number };
        install_aerators: { savings_egp: number; savings_liters: number };
    };
}

export interface FoodWasteAnalysisReport { metrics: { food_waste_index: number; food_efficiency_score: number; monthly_waste_cost: number; annual_waste_cost: number; carbon_footprint_kg: number; methane_emissions_kg: number; water_footprint_loss_liters: number; food_recovery_potential_egp: number; sustainability_rating: string; }; ai_waste_analysis: { primary_causes: string[]; behavioral_insights: string; }; ai_financial_insights: { monthly_savings_potential: number; annual_savings_potential: number; redirect_suggestions: string[]; }; ai_supply_chain_diagnosis: { most_inefficient_stage: string; stage_breakdown_percentages: { purchase: number; storage: number; preparation: number; consumption: number; disposal: number; }; bottleneck_explanation: string; }; ai_optimization_plan: { immediate_actions: string[]; long_term_habits: string[]; }; }

export interface EwasteAnalysisReport {
    device_identity: {
        normalized_name: string;
        category: string;
        brand: string;
        model: string;
        identification_confidence: number;
        evidence_basis: string;
        market_data_status: string;
    };
    device_health_score: number;
    device_grade: 'Grade A' | 'Grade B' | 'Grade C' | 'Grade D' | 'Grade E';
    circular_economy_score: number;
    device_longevity_index: number;
    recommended_pathway: 'Continue Using' | 'Repair' | 'Refurbish' | 'Upgrade' | 'Donate' | 'Resell' | 'Trade-In' | 'Recycle' | 'Urban Mining';
    pathway_reasoning: string;
    alternative_pathways: Array<{
        pathway: string;
        reasoning: string;
        roi_estimate: number;
    }>;
    economic_analysis: {
        current_market_value_egp: number;
        depreciation_percentage: number;
        residual_value_egp: number;
        refurbish_cost_estimate_egp: number;
        refurbish_roi_percentage: number;
        replacement_cost_egp: number;
        total_ownership_value_egp: number;
    };
    environmental_impact: {
        carbon_savings_kg: number;
        raw_material_savings_kg: number;
        ewaste_prevented_kg: number;
        resource_circularity_score: number;
        circular_economy_impact_score: number;
    };
    urban_mining_potential: {
        estimated_value_egp: number;
        materials: {
            gold_g: number;
            copper_g: number;
            silver_g: number;
            aluminum_g: number;
            lithium_g: number;
            cobalt_g: number;
            rare_earth_elements_g: number;
        };
    };
    security_risk_assessment: {
        risk_level: 'Low' | 'Medium' | 'High' | 'Critical';
        identified_risks: string[];
        data_wipe_plan: string[];
    };
    ai_executive_recommendation: string;
}

export interface ExposureAnalysis {
    estimated_aqi: number;
    pm25_concentration_ug_m3: number;
    risk_level: 'Low' | 'Moderate' | 'High' | 'Critical';
    health_implication: string;
    mitigation_strategy: string[];
    methodology_note: string;
    predicted_annual_accumulation_pm25: number;
    peak_exposure_times: string[];
}

export interface CarbonAnalysisReport {
    baseline: {
        monthly_total_kg_co2: number;
    };
    air_quality?: {
        aqi: number;
        city: string;
        status: string;
        updated_at: number;
        pm2_5: number;
        no2: number;
    };
}

export interface ScenarioBaseline {
    waterWasteLitersMonth: number;
    waterCostLossEgpMonth: number;
    energyConsumptionKwhMonth: number;
    energyCostLossEgpMonth: number;
    energyCarbonKgMonth: number;
    foodCostLossEgpMonth: number;
    foodCarbonKgMonth: number;
    mobilityCostEgpMonth: number;
    mobilityCarbonKgMonth: number;
    ewasteAvoidableKg: number;
    connectedModules: number;
}

export interface ScenarioLevers {
    waterReductionPct: number;
    energyReductionPct: number;
    foodWasteReductionPct: number;
    mobilityShiftPct: number;
    circularityPct: number;
    investmentEgp: number;
}

export interface ScenarioOutcomes {
    waterSavedLiters: number;
    energySavedKwh: number;
    financialSavingsEgp: number;
    carbonAvoidedKg: number;
    ewasteAvoidedKg: number;
    paybackMonths: number | null;
    impactScore: number;
}

export interface Scenario {
    id: string;
    name: string;
    timestamp: number;
    audience: 'individual' | 'community' | 'education' | 'business' | 'government';
    horizonMonths: number;
    baseline: ScenarioBaseline;
    levers: ScenarioLevers;
    outcomes: ScenarioOutcomes;
    synced?: boolean;
}

export interface ScenarioComparisonAnalysis {
    optimal_scenario_id: string;
    analysis_summary: string;
    key_differentiators: string[];
    trade_offs: {
        scenario_id: string;
        pro: string;
        con: string;
    }[];
    high_leverage_actions: string[];
}

export interface SessionStory {
    meta: {
        generated_at: number;
        data_points_analyzed: number;
    };
    problem_statement: string;
    key_decisions: string[];
    actions_taken: string[];
    quantified_impact: {
        water_saved_liters: number;
        co2_reduced_kg: number;
        money_saved_egp: number;
    };
    final_summary: string;
}

export interface ElectricityBillExtraction {
    kwh: number;
    totalAmount: number;
    currency: string;
    confidence: number;
    isStub?: boolean;
    message?: string;
}
