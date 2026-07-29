import { 
    TelemetryHydrationResponse, 
    ClimateActionPlan, 
    EnergyAnalysisReport, 
    MobilityIntelligenceReport,
    MobilityInputs,
    ClaimVerificationResult, 
    EnvironmentalSnapshot, 
    WaterAnalysisReport, 
    FoodWasteAnalysisReport, 
    EwasteAnalysisReport, 
    ExposureAnalysis,
    CalculatorResults,
    EnergyData,
    ExposureAgentInputs,
    TelemetryProfile,
    ElectricityBillExtraction,
    EnergyAnalysisInputs,
    WaterAnalysisInputs
} from "../types";

import { generateFromAPI } from "./aiClient";

// --- SCHEMAS ---

const EXPOSURE_SCHEMA = {
    type: "OBJECT",
    properties: {
        estimated_aqi: { type: "NUMBER" },
        pm25_concentration_ug_m3: { type: "NUMBER" },
        risk_level: { type: "STRING", enum: ['Low', 'Moderate', 'High', 'Critical'] },
        health_implication: { type: "STRING" },
        mitigation_strategy: { type: "ARRAY", items: { type: "STRING" } },
        methodology_note: { type: "STRING" },
        predicted_annual_accumulation_pm25: { type: "NUMBER" },
        peak_exposure_times: { type: "ARRAY", items: { type: "STRING" } }
    },
    required: ['estimated_aqi', 'pm25_concentration_ug_m3', 'risk_level', 'health_implication', 'mitigation_strategy', 'methodology_note', 'predicted_annual_accumulation_pm25', 'peak_exposure_times']
};

const TELEMETRY_SCHEMA = {
    type: "OBJECT",
    properties: {
        water: {
            type: "OBJECT",
            properties: {
                leakingTaps: { type: "NUMBER" },
                leakingToilets: { type: "NUMBER" },
                leakageHoursPerDay: { type: "NUMBER" },
                monthlyBillLE: { type: "NUMBER" }
            },
            required: ['leakingTaps', 'leakingToilets', 'leakageHoursPerDay', 'monthlyBillLE']
        },
        food: {
            type: "OBJECT",
            properties: {
                mealsPerDay: { type: "NUMBER" },
                costPerMealLE: { type: "NUMBER" },
                wastePercentage: { type: "NUMBER" }
            },
            required: ['mealsPerDay', 'costPerMealLE', 'wastePercentage']
        },
        energy: {
            type: "OBJECT",
            properties: {
                monthlyKwh: { type: "NUMBER" },
                billEgp: { type: "NUMBER" },
                acCount: { type: "NUMBER" },
                acHoursPerDay: { type: "NUMBER" },
                acSetTemperature: { type: "NUMBER" },
                acType: { type: "STRING" },
                majorAppliances: { type: "NUMBER" }
            },
            required: ['monthlyKwh', 'billEgp', 'acCount', 'acHoursPerDay', 'acSetTemperature', 'acType', 'majorAppliances']
        },
        meta: {
            type: "OBJECT",
            properties: {
                confidence_score: { type: "NUMBER" },
                recommended_modules: { type: "ARRAY", items: { type: "STRING" } },
                reasoning_summary: { type: "STRING" }
            },
            required: ['confidence_score', 'recommended_modules', 'reasoning_summary']
        }
    },
    required: ['water', 'food', 'energy', 'meta']
};

const PLAN_SCHEMA = {
    type: "OBJECT",
    properties: {
        meta: {
            type: "OBJECT",
            properties: {
                engine_version: { type: "STRING" },
                processing_time_ms: { type: "NUMBER" },
                data_quality_score: { type: "NUMBER" },
                language: { type: "STRING" }
            },
            required: ['engine_version', 'processing_time_ms', 'data_quality_score', 'language']
        },
        baseline: {
            type: "OBJECT",
            properties: {
                total_co2_kg: { type: "NUMBER" },
                national_comparison: { type: "STRING" }
            },
            required: ['total_co2_kg', 'national_comparison']
        },
        risk_assessment: {
            type: "OBJECT",
            properties: {
                level: { type: "STRING", enum: ['Low', 'Moderate', 'High', 'Critical'] },
                primary_vector: { type: "STRING" },
                description: { type: "STRING" }
            },
            required: ['level', 'primary_vector', 'description']
        },
        financial_analysis: {
            type: "OBJECT",
            properties: {
                monthly_waste_egp: { type: "NUMBER" },
                annual_waste_egp: { type: "NUMBER" },
                investment_required_egp: { type: "NUMBER" },
                roi_period_months: { type: "NUMBER" }
            },
            required: ['monthly_waste_egp', 'annual_waste_egp', 'investment_required_egp', 'roi_period_months']
        },
        impact_summary: { type: "STRING" },
        local_context_explanation: { type: "STRING" },
        global_context_explanation: { type: "STRING" },
        recommended_actions: { type: "ARRAY", items: { type: "STRING" } },
        climate_action_plan: {
            type: "OBJECT",
            properties: {
                daily_actions: {
                    type: "ARRAY",
                    items: {
                        type: "OBJECT",
                        properties: {
                            id: { type: "STRING" },
                            title: { type: "STRING" },
                            description: { type: "STRING" },
                            impact_level: { type: "STRING", enum: ['High', 'Medium', 'Low'] },
                            category: { type: "STRING", enum: ['Water', 'Energy', 'Food', 'Transport'] },
                            estimated_savings: { type: "STRING" },
                            difficulty: { type: "STRING", enum: ['Easy', 'Medium', 'Hard'] }
                        },
                        required: ['id', 'title', 'description', 'impact_level', 'category', 'estimated_savings', 'difficulty']
                    }
                },
                weekly_actions: {
                    type: "ARRAY",
                    items: {
                        type: "OBJECT",
                        properties: {
                            id: { type: "STRING" },
                            title: { type: "STRING" },
                            description: { type: "STRING" },
                            impact_level: { type: "STRING" },
                            category: { type: "STRING" },
                            estimated_savings: { type: "STRING" },
                            difficulty: { type: "STRING" }
                        },
                        required: ['id', 'title', 'description', 'impact_level', 'category', 'estimated_savings', 'difficulty']
                    }
                },
                monthly_actions: {
                    type: "ARRAY",
                    items: {
                        type: "OBJECT",
                        properties: {
                            id: { type: "STRING" },
                            title: { type: "STRING" },
                            description: { type: "STRING" },
                            impact_level: { type: "STRING" },
                            category: { type: "STRING" },
                            estimated_savings: { type: "STRING" },
                            difficulty: { type: "STRING" }
                        },
                        required: ['id', 'title', 'description', 'impact_level', 'category', 'estimated_savings', 'difficulty']
                    }
                },
                expected_impact: {
                    type: "OBJECT",
                    properties: {
                        water: { type: "STRING" },
                        food: { type: "STRING" },
                        energy: { type: "STRING" },
                        co2: { type: "STRING" }
                    },
                    required: ['water', 'food', 'energy', 'co2']
                }
            },
            required: ['daily_actions', 'weekly_actions', 'monthly_actions', 'expected_impact']
        }
    },
    required: ['meta', 'baseline', 'risk_assessment', 'financial_analysis', 'impact_summary', 'local_context_explanation', 'global_context_explanation', 'recommended_actions', 'climate_action_plan']
};

const ENERGY_SCHEMA = {
    type: 'OBJECT',
    properties: {
        metrics: {
            type: 'OBJECT',
            properties: {
                estimated_consumption_kwh: { type: 'NUMBER' },
                energy_efficiency_score: { type: 'NUMBER' },
                energy_waste_score: { type: 'NUMBER' },
                carbon_footprint_kg: { type: 'NUMBER' },
                cost_optimization_score: { type: 'NUMBER' },
                peak_load_risk: { type: 'STRING' },
                sustainability_rating: { type: 'STRING' },
                energy_intensity_index: { type: 'NUMBER' },
                financial_loss_estimate_egp: { type: 'NUMBER' },
                current_tariff_tier: { type: 'STRING' },
                average_kwh_price_egp: { type: 'NUMBER' }
            },
            required: ['estimated_consumption_kwh', 'energy_efficiency_score', 'energy_waste_score', 'carbon_footprint_kg', 'cost_optimization_score', 'peak_load_risk', 'sustainability_rating', 'energy_intensity_index', 'financial_loss_estimate_egp', 'current_tariff_tier', 'average_kwh_price_egp']
        },
        benchmarks: {
            type: 'OBJECT',
            properties: {
                similar_properties_avg_kwh: { type: 'NUMBER' },
                national_avg_kwh: { type: 'NUMBER' },
                user_estimated_kwh: { type: 'NUMBER' }
            },
            required: ['similar_properties_avg_kwh', 'national_avg_kwh', 'user_estimated_kwh']
        },
        ai_energy_intelligence: {
            type: 'OBJECT',
            properties: {
                high_bill_reasons: { type: 'ARRAY', items: { type: 'STRING' } },
                top_consuming_devices: { 
                    type: 'ARRAY', 
                    items: { 
                        type: 'OBJECT', 
                        properties: { name: { type: 'STRING' }, percentage: { type: 'NUMBER' } },
                        required: ['name', 'percentage']
                    } 
                },
                savings_opportunities: { type: 'STRING' },
                quick_wins: { type: 'ARRAY', items: { type: 'STRING' } },
                operational_risks: { type: 'ARRAY', items: { type: 'STRING' } }
            },
            required: ['high_bill_reasons', 'top_consuming_devices', 'savings_opportunities', 'quick_wins', 'operational_risks']
        },
        scenario_simulation: {
            type: 'OBJECT',
            properties: {
                replace_with_led: { type: 'OBJECT', properties: { savings_egp: {type:'NUMBER'}, savings_kwh: {type:'NUMBER'}, emissions_reduction_kg: {type:'NUMBER'}, roi_months: {type:'NUMBER'}, description: {type:'STRING'} }, required: ['savings_egp', 'savings_kwh', 'emissions_reduction_kg', 'roi_months', 'description'] },
                ac_to_24: { type: 'OBJECT', properties: { savings_egp: {type:'NUMBER'}, savings_kwh: {type:'NUMBER'}, emissions_reduction_kg: {type:'NUMBER'}, roi_months: {type:'NUMBER'}, description: {type:'STRING'} }, required: ['savings_egp', 'savings_kwh', 'emissions_reduction_kg', 'roi_months', 'description'] },
                replace_old_devices: { type: 'OBJECT', properties: { savings_egp: {type:'NUMBER'}, savings_kwh: {type:'NUMBER'}, emissions_reduction_kg: {type:'NUMBER'}, roi_months: {type:'NUMBER'}, description: {type:'STRING'} }, required: ['savings_egp', 'savings_kwh', 'emissions_reduction_kg', 'roi_months', 'description'] },
                solar_panels: { type: 'OBJECT', properties: { savings_egp: {type:'NUMBER'}, savings_kwh: {type:'NUMBER'}, emissions_reduction_kg: {type:'NUMBER'}, roi_months: {type:'NUMBER'}, description: {type:'STRING'} }, required: ['savings_egp', 'savings_kwh', 'emissions_reduction_kg', 'roi_months', 'description'] },
                thermal_insulation: { type: 'OBJECT', properties: { savings_egp: {type:'NUMBER'}, savings_kwh: {type:'NUMBER'}, emissions_reduction_kg: {type:'NUMBER'}, roi_months: {type:'NUMBER'}, description: {type:'STRING'} }, required: ['savings_egp', 'savings_kwh', 'emissions_reduction_kg', 'roi_months', 'description'] }
            },
            required: ['replace_with_led', 'ac_to_24', 'replace_old_devices', 'solar_panels', 'thermal_insulation']
        }
    },
    required: ['metrics', 'benchmarks', 'ai_energy_intelligence', 'scenario_simulation']
};

const MOBILITY_SCHEMA = {
    type: "OBJECT",
    properties: {
        metrics: {
            type: "OBJECT",
            properties: {
                monthly_cost_egp: { type: "NUMBER" },
                monthly_carbon_kg: { type: "NUMBER" },
                annual_carbon_kg: { type: "NUMBER" },
                monthly_hours_lost: { type: "NUMBER" },
                annual_time_lost: { type: "NUMBER" }
            },
            required: ["monthly_cost_egp", "monthly_carbon_kg", "annual_carbon_kg", "monthly_hours_lost", "annual_time_lost"]
        },
        scores: {
            type: "OBJECT",
            properties: {
                fuel_dependency: { type: "NUMBER" },
                urban_exposure: { type: "STRING" },
                mobility_efficiency: { type: "NUMBER" },
                transportation_risk: { type: "NUMBER" },
                financial_waste_index: { type: "NUMBER" },
            },
            required: ["fuel_dependency", "urban_exposure", "mobility_efficiency", "transportation_risk", "financial_waste_index"]
        },
        recommendations: {
            type: "OBJECT",
            properties: {
                financial: { type: "ARRAY", items: { type: "STRING" } },
                time_optimization: { type: "ARRAY", items: { type: "STRING" } },
                transportation: { type: "ARRAY", items: { type: "STRING" } },
                carbon_reduction: { type: "ARRAY", items: { type: "STRING" } },
                urban_health: { type: "ARRAY", items: { type: "STRING" } }
            },
            required: ["financial", "time_optimization", "transportation", "carbon_reduction", "urban_health"]
        },
        advanced_insights: {
            type: "OBJECT",
            properties: {
                potential_savings_egp_month: { type: "NUMBER" },
                potential_co2_reduction_kg: { type: "NUMBER" },
                potential_time_recovery_hours: { type: "NUMBER" },
                potential_fuel_reduction_liters: { type: "NUMBER" },
                before_vs_after_narrative: { type: "STRING" }
            },
            required: ["potential_savings_egp_month", "potential_co2_reduction_kg", "potential_time_recovery_hours", "before_vs_after_narrative"]
        }
    },
    required: ["metrics", "scores", "recommendations", "advanced_insights"]
};

const VERIFICATION_SCHEMA = {
    type: "OBJECT",
    properties: {
        verdict: { type: "STRING", enum: ['Scientifically Accurate', 'Plausible', 'Misleading', 'False'] },
        confidence_score: { type: "NUMBER" },
        analysis: { type: "STRING" },
        red_flags: { type: "ARRAY", items: { type: "STRING" } },
        improvement_suggestion: { type: "STRING" }
    },
    required: ['verdict', 'confidence_score', 'analysis', 'red_flags', 'improvement_suggestion']
};

const CONTEXT_SCHEMA = {
    type: "OBJECT",
    properties: {
        location: { type: "STRING" },
        aqi_estimate: { type: "NUMBER" },
        co2_estimate_ppm: { type: "NUMBER" },
        health_implication: { type: "STRING" },
        status: { type: "STRING", enum: ['Good', 'Moderate', 'Unhealthy', 'Hazardous'] },
        methodology: { type: "STRING" }
    },
    required: ['location', 'aqi_estimate', 'co2_estimate_ppm', 'health_implication', 'status', 'methodology']
};

const WATER_SCHEMA = {
    type: "OBJECT",
    properties: {
        meta: {
            type: "OBJECT",
            properties: {
                timestamp: { type: "STRING" },
                methodology: { type: "STRING" }
            },
            required: ['timestamp', 'methodology']
        },
        metrics: {
            type: "OBJECT",
            properties: {
                water_efficiency_score: { type: "NUMBER" },
                leak_probability_score: { type: "NUMBER" },
                annual_water_waste_liters: { type: "NUMBER" },
                financial_loss_estimate_egp: { type: "NUMBER" },
                water_scarcity_impact_score: { type: "NUMBER" },
                household_sustainability_score: { type: "NUMBER" },
                water_risk_level: { type: "STRING", enum: ["Excellent", "Very Good", "Good", "Needs Improvement", "High Risk"] },
            },
            required: ['water_efficiency_score', 'leak_probability_score', 'annual_water_waste_liters', 'financial_loss_estimate_egp', 'water_scarcity_impact_score', 'household_sustainability_score', 'water_risk_level']
        },
        benchmarks: {
            type: "OBJECT",
            properties: {
                similar_household_avg_liters: { type: "NUMBER" },
                national_avg_liters: { type: "NUMBER" },
                user_estimated_liters: { type: "NUMBER" }
            },
            required: ['similar_household_avg_liters', 'national_avg_liters', 'user_estimated_liters']
        },
        ai_water_intelligence: {
            type: "OBJECT",
            properties: {
                leak_probability_analysis: { type: "STRING" },
                consumption_reduction_opportunities: { type: "STRING" },
                cost_reduction_opportunities: { type: "STRING" },
                primary_bill_drivers: { type: "ARRAY", items: { type: "STRING" } }
            },
            required: ['leak_probability_analysis', 'consumption_reduction_opportunities', 'cost_reduction_opportunities', 'primary_bill_drivers']
        },
        ai_recommendations: {
            type: "ARRAY",
            items: {
                type: "OBJECT",
                properties: {
                    action: { type: "STRING" },
                    impact: { type: "STRING", enum: ["High", "Medium", "Low"] },
                    cost: { type: "STRING", enum: ["High", "Medium", "Low", "Zero"] },
                    speed: { type: "STRING", enum: ["Fast", "Medium", "Slow"] }
                },
                required: ['action', 'impact', 'cost', 'speed']
            }
        },
        scenario_simulation: {
            type: "OBJECT",
            properties: {
                fix_leaks: { type: "OBJECT", properties: { savings_egp: { type: "NUMBER" }, savings_liters: { type: "NUMBER" } }, required: ['savings_egp', 'savings_liters'] },
                reduce_10_percent: { type: "OBJECT", properties: { savings_egp: { type: "NUMBER" }, savings_liters: { type: "NUMBER" } }, required: ['savings_egp', 'savings_liters'] },
                reduce_25_percent: { type: "OBJECT", properties: { savings_egp: { type: "NUMBER" }, savings_liters: { type: "NUMBER" } }, required: ['savings_egp', 'savings_liters'] },
                install_aerators: { type: "OBJECT", properties: { savings_egp: { type: "NUMBER" }, savings_liters: { type: "NUMBER" } }, required: ['savings_egp', 'savings_liters'] }
            },
            required: ['fix_leaks', 'reduce_10_percent', 'reduce_25_percent', 'install_aerators']
        }
    },
    required: ['meta', 'metrics', 'benchmarks', 'ai_water_intelligence', 'ai_recommendations', 'scenario_simulation']
};

const WATER_OCR_SCHEMA = {
    type: "OBJECT",
    properties: {
        meter_number: { type: "STRING" },
        bill_date: { type: "STRING" },
        current_reading: { type: "NUMBER" },
        previous_reading: { type: "NUMBER" },
        total_consumption_m3: { type: "NUMBER" },
        total_amount: { type: "NUMBER" },
        pricing_tiers: { 
            type: "ARRAY", 
            items: { 
                type: "OBJECT", 
                properties: { 
                    tier_name: { type: "STRING" }, 
                    volume: { type: "NUMBER" }, 
                    rate: { type: "NUMBER" } 
                }, 
                required: ['tier_name', 'volume', 'rate'] 
            } 
        },
        additional_fees: { type: "NUMBER" },
        currency: { type: "STRING" },
        confidence: { type: "NUMBER" }
    },
    required: ['meter_number', 'bill_date', 'current_reading', 'previous_reading', 'total_consumption_m3', 'total_amount', 'pricing_tiers', 'additional_fees', 'currency', 'confidence']
};

const FOOD_SCHEMA = { type: 'OBJECT', properties: { metrics: { type: 'OBJECT', properties: { food_waste_index: { type: 'NUMBER' }, food_efficiency_score: { type: 'NUMBER' }, monthly_waste_cost: { type: 'NUMBER' }, annual_waste_cost: { type: 'NUMBER' }, carbon_footprint_kg: { type: 'NUMBER' }, methane_emissions_kg: { type: 'NUMBER' }, water_footprint_loss_liters: { type: 'NUMBER' }, food_recovery_potential_egp: { type: 'NUMBER' }, sustainability_rating: { type: 'STRING' } }, required: ['food_waste_index', 'food_efficiency_score', 'monthly_waste_cost', 'annual_waste_cost', 'carbon_footprint_kg', 'methane_emissions_kg', 'water_footprint_loss_liters', 'food_recovery_potential_egp', 'sustainability_rating'] }, ai_waste_analysis: { type: 'OBJECT', properties: { primary_causes: { type: 'ARRAY', items: { type: 'STRING' } }, behavioral_insights: { type: 'STRING' } }, required: ['primary_causes', 'behavioral_insights'] }, ai_financial_insights: { type: 'OBJECT', properties: { monthly_savings_potential: { type: 'NUMBER' }, annual_savings_potential: { type: 'NUMBER' }, redirect_suggestions: { type: 'ARRAY', items: { type: 'STRING' } } }, required: ['monthly_savings_potential', 'annual_savings_potential', 'redirect_suggestions'] }, ai_supply_chain_diagnosis: { type: 'OBJECT', properties: { most_inefficient_stage: { type: 'STRING' }, stage_breakdown_percentages: { type: 'OBJECT', properties: { purchase: { type: 'NUMBER' }, storage: { type: 'NUMBER' }, preparation: { type: 'NUMBER' }, consumption: { type: 'NUMBER' }, disposal: { type: 'NUMBER' } }, required: ['purchase', 'storage', 'preparation', 'consumption', 'disposal'] }, bottleneck_explanation: { type: 'STRING' } }, required: ['most_inefficient_stage', 'stage_breakdown_percentages', 'bottleneck_explanation'] }, ai_optimization_plan: { type: 'OBJECT', properties: { immediate_actions: { type: 'ARRAY', items: { type: 'STRING' } }, long_term_habits: { type: 'ARRAY', items: { type: 'STRING' } } }, required: ['immediate_actions', 'long_term_habits'] } }, required: ['metrics', 'ai_waste_analysis', 'ai_financial_insights', 'ai_supply_chain_diagnosis', 'ai_optimization_plan'] };

const EWASTE_SCHEMA = {
    type: "OBJECT",
    properties: {
        device_health_score: { type: "NUMBER" },
        device_grade: { type: "STRING", enum: ['Grade A', 'Grade B', 'Grade C', 'Grade D', 'Grade E'] },
        circular_economy_score: { type: "NUMBER" },
        device_longevity_index: { type: "NUMBER" },
        recommended_pathway: { type: "STRING", enum: ['Continue Using', 'Repair', 'Refurbish', 'Upgrade', 'Donate', 'Resell', 'Trade-In', 'Recycle', 'Urban Mining'] },
        pathway_reasoning: { type: "STRING" },
        alternative_pathways: {
            type: "ARRAY",
            items: {
                type: "OBJECT",
                properties: {
                    pathway: { type: "STRING" },
                    reasoning: { type: "STRING" },
                    roi_estimate: { type: "NUMBER" }
                },
                required: ["pathway", "reasoning", "roi_estimate"]
            }
        },
        economic_analysis: {
            type: "OBJECT",
            properties: {
                current_market_value_egp: { type: "NUMBER" },
                depreciation_percentage: { type: "NUMBER" },
                residual_value_egp: { type: "NUMBER" },
                refurbish_cost_estimate_egp: { type: "NUMBER" },
                refurbish_roi_percentage: { type: "NUMBER" },
                replacement_cost_egp: { type: "NUMBER" },
                total_ownership_value_egp: { type: "NUMBER" }
            },
            required: ["current_market_value_egp", "depreciation_percentage", "residual_value_egp", "refurbish_cost_estimate_egp", "refurbish_roi_percentage", "replacement_cost_egp", "total_ownership_value_egp"]
        },
        environmental_impact: {
            type: "OBJECT",
            properties: {
                carbon_savings_kg: { type: "NUMBER" },
                raw_material_savings_kg: { type: "NUMBER" },
                ewaste_prevented_kg: { type: "NUMBER" },
                resource_circularity_score: { type: "NUMBER" },
                circular_economy_impact_score: { type: "NUMBER" }
            },
            required: ["carbon_savings_kg", "raw_material_savings_kg", "ewaste_prevented_kg", "resource_circularity_score", "circular_economy_impact_score"]
        },
        urban_mining_potential: {
            type: "OBJECT",
            properties: {
                estimated_value_egp: { type: "NUMBER" },
                materials: {
                    type: "OBJECT",
                    properties: {
                        gold_g: { type: "NUMBER" },
                        copper_g: { type: "NUMBER" },
                        silver_g: { type: "NUMBER" },
                        aluminum_g: { type: "NUMBER" },
                        lithium_g: { type: "NUMBER" },
                        cobalt_g: { type: "NUMBER" },
                        rare_earth_elements_g: { type: "NUMBER" }
                    },
                    required: ["gold_g", "copper_g", "silver_g", "aluminum_g", "lithium_g", "cobalt_g", "rare_earth_elements_g"]
                }
            },
            required: ["estimated_value_egp", "materials"]
        },
        security_risk_assessment: {
            type: "OBJECT",
            properties: {
                risk_level: { type: "STRING", enum: ['Low', 'Medium', 'High', 'Critical'] },
                identified_risks: { type: "ARRAY", items: { type: "STRING" } },
                data_wipe_plan: { type: "ARRAY", items: { type: "STRING" } }
            },
            required: ["risk_level", "identified_risks", "data_wipe_plan"]
        },
        ai_executive_recommendation: { type: "STRING" }
    },
    required: ["device_health_score", "device_grade", "circular_economy_score", "device_longevity_index", "recommended_pathway", "pathway_reasoning", "alternative_pathways", "economic_analysis", "environmental_impact", "urban_mining_potential", "security_risk_assessment", "ai_executive_recommendation"]
};

const BILL_SCHEMA = {
    type: "OBJECT",
    properties: {
        kwh: { type: "NUMBER" },
        totalAmount: { type: "NUMBER" },
        currency: { type: "STRING" },
        confidence: { type: "NUMBER" },
        isStub: { type: "BOOLEAN" },
        message: { type: "STRING" }
    },
    required: ['kwh', 'totalAmount', 'currency', 'confidence']
};

const EWASTE_OCR_SCHEMA = {
    type: "OBJECT",
    properties: {
        deviceType: { type: "STRING" },
        brand: { type: "STRING" },
        purchaseYear: { type: "NUMBER" },
        approximatePurchasePrice: { type: "NUMBER" },
        batteryHealth: { type: "NUMBER" }
    },
    required: ['deviceType', 'brand']
};

const FOOD_RECEIPT_SCHEMA = {
    type: "OBJECT",
    properties: {
        total_cost_egp: { type: "NUMBER" },
        items_count: { type: "NUMBER" },
        receipt_date: { type: "STRING" }
    },
    required: ['total_cost_egp', 'items_count', 'receipt_date']
};

// --- AGENTS (Updated for API Backend calls) ---

export const runExposureAgent = async (inputs: ExposureAgentInputs, language: string = 'en'): Promise<ExposureAnalysis> => {
    const langInstruction = language === 'ar' 
        ? "CRITICAL: The user interface is strictly in Arabic. All text output, explanations, strategies, and strings MUST be generated in native, authentic Egyptian Arabic (professional environmental/engineering dialect). Do NOT translate English. Generate natively." 
        : "Output in English.";
    const prompt = `ROLE: Environmental Analyst. TASK: Estimate exposure. ${langInstruction} DATA: ${JSON.stringify(inputs)}`;
    return generateFromAPI(prompt, EXPOSURE_SCHEMA);
};

export const runTelemetryHydration = async (profile: TelemetryProfile, language: string = 'en'): Promise<TelemetryHydrationResponse> => {
    const langInstruction = language === 'ar' 
        ? "CRITICAL ARABIC CONTEXT: Return meta.reasoning_summary in native Egyptian Arabic. Use EGP currency (جنيه) and local context accurately. Do not use direct translation." 
        : "Return meta.reasoning_summary in English. Use Egypt context.";
    
    const prompt = `You are KairoMini. Based on profile ${JSON.stringify(profile)}, estimate water, food, and energy metrics for Egypt. ${langInstruction} Return JSON.`;
    return generateFromAPI(prompt, TELEMETRY_SCHEMA);
};

export const KairoOrchestrator = {
    generateComprehensivePlan: async (results: CalculatorResults, language: string = 'en'): Promise<ClimateActionPlan> => {
        const langPrompt = language === 'ar' 
            ? "CRITICAL ARABIC CONTEXT: Output ALL string values in native Arabic (Egyptian Context). Use Egyptian currency (جنيه مصري) and cultural norms. Tone: Professional yet practical engineering. Ensure environmental terminology is accurate to Egyptian standards." 
            : "Output in English. Use Egyptian context.";
        const prompt = `
            Act as Kairo Orchestrator. 
            Inputs:
            - Water Waste: ${results.water.monthlyWastedLiters}L
            - Food Waste: ${results.food.monthlyWastedMeals} meals
            - Energy Waste: ${results.energy.wastedKwh}kWh / ${results.energy.wastedEGP}EGP
            - Tariff Tier: ${results.energy.tariffTier}
            - Carbon Total: ${results.totalCo2Kg}kg
            
            ${langPrompt}
            Generate Climate Action Plan. Egypt context. Prioritize High ROI actions.
            Use deep reasoning to produce specific, localized steps.
        `;
        return generateFromAPI(prompt, PLAN_SCHEMA);
    }
};

export const runEnergyAnalysis = async (inputs: EnergyAnalysisInputs, language: string = 'en'): Promise<EnergyAnalysisReport> => {
    const isAr = language === 'ar';
    const langInstructions = isAr ? 'CRITICAL: Output strictly in professional Egyptian Arabic. Use EGP (جنيه مصري). Ensure concepts like "Peak Load", "Energy Waste", and "ROI" are accurately expressed in Egyptian Engineering terms.' : 'Output in English. Use EGP and refer to Egyptian electricity tariffs.';

    const prompt = `
        You are a world-class Energy Efficiency and Sustainability AI Assessor. Execute a deep-dive Energy Intelligence Analysis.
        Evaluate the user's energy consumption based on the following inputs (Note: kWh might be missing, infer from bill EGP if necessary, depending on the property type).
        
        INPUTS:
        ${JSON.stringify(inputs, null, 2)}
        
        INSTRUCTIONS:
        1. Base calculations on Egyptian Electricity Tariffs if a monthly bill is provided and kWh is not explicitly stated.
        2. Identify behavioral flags (e.g., leaving ACs on all day, running non-inverter appliances) and suggest actionable optimizations.
        3. Determine carbon footprint based on the local grid (roughly 0.4 - 0.5 kg CO2 per kWh).
        4. Benchmarks should compare against typical Egyptian households or comparable businesses.
        5. Populate the scenarios with realistic estimates for Return on Investment (ROI) and cost/emissions savings if applied.
        
        ${langInstructions}
    `;

    return generateFromAPI(prompt, ENERGY_SCHEMA);
};

export const runMobilityIntelligence = async (inputs: MobilityInputs, language: string = 'en'): Promise<MobilityIntelligenceReport> => {
    const langPrompt = language === 'ar' ? "CRITICAL: Output strings in native Egyptian Arabic. Use 'جنيه' for savings and Egyptian context (زحمة، مترو، توك توك). Provide realistic estimates suited to the selected governorate and traffic." : "Output in English. Use EGP for cost. Assume Egyptian traffic contexts.";
    const prompt = `ROLE: Mobility Intelligence & Urban Transportation Optimization System Analyst. TASK: Generate a highly detailed mobility analysis for user with the following profile: ${JSON.stringify(inputs)}. ${langPrompt} Return JSON.`;
    return generateFromAPI(prompt, MOBILITY_SCHEMA);
};

export const runVerificationEngine = async (claim: string, language: string = 'en'): Promise<ClaimVerificationResult> => {
    const langPrompt = language === 'ar' ? "CRITICAL: Output strings in formal Environmental Audit Arabic." : "Output in English.";
    const prompt = `ROLE: Sustainability Auditor. TASK: Verify this corporate claim for greenwashing and scientific accuracy: "${claim}". ${langPrompt} Return JSON.`;
    return generateFromAPI(prompt, VERIFICATION_SCHEMA);
};

export const runContextEngine = async (lat: number, lng: number, language: string = 'en'): Promise<EnvironmentalSnapshot> => {
    const langPrompt = language === 'ar' ? "Output strings in Arabic (Egyptian)." : "Output in English.";
    const prompt = `ROLE: Geo-Environmental Data Analyst. TASK: Estimate AQI and CO2 ppm for coordinates [${lat}, ${lng}]. Use regional satellite proxy logic for Egypt. ${langPrompt} Return JSON.`;
    return generateFromAPI(prompt, CONTEXT_SCHEMA);
};

export const runWaterAnalysis = async (inputs: WaterAnalysisInputs, language: string = 'en'): Promise<WaterAnalysisReport> => {
    const langPrompt = language === 'ar' 
        ? "CRITICAL ARABIC CONTEXT: Output ALL string values, reasoning, and advice in native Egyptian Arabic (اللهجة المصرية). Use Egyptian context (جنيه، ندرة النيل، ترشيد الماية) with a blend of professional yet accessible Egyptian phrasing." 
        : "Output in English. Be highly professional.";
    
    const prompt = `ROLE: Global Expert in AI Product Design, UX, Sustainability & Water Resource Management. TASK: Perform advanced AI water efficiency and scarcity analysis based on realistic household/corporate data. Avoid engineering assumptions like counting leaky drops; use holistic smart analysis of behavioral signs, bills, and facility types. DATA: ${JSON.stringify(inputs)}. ${langPrompt} Return highly structured, insightful JSON.`;
    return generateFromAPI(prompt, WATER_SCHEMA);
};

export const runFoodWasteAnalysis = async (inputs: any, language: string = 'en'): Promise<any> => { const langPrompt = language === 'ar' ? 'CRITICAL: Output strings in native Egyptian Arabic (اللهجة المصرية) focusing on consumer behavior.' : 'Output in English.'; const prompt = `ROLE: Global Expert in AI Product Design, UX, Sustainability & Supply Chain. TASK: Analyze household food waste impact conceptually and practically. DATA: ${JSON.stringify(inputs)}. ${langPrompt} Provide deep, realistic insights. Return JSON.`; return generateFromAPI(prompt, FOOD_SCHEMA); };

export const runEwasteAnalysis = async (inputString: string, language: string = 'en'): Promise<EwasteAnalysisReport> => {
    const langPrompt = language === 'ar' ? "Output strings in Egyptian Arabic (باللهجة المصرية)." : "Output in English.";
    const prompt = `ROLE: Circular Economy Consultant, E-Waste Lifecycle Analyst & Sustainability Intelligence Architect. TASK: Perform an advanced Lifecycle Assessment of the electronic device based on the provided inputs. Formulate a Circular Pathway analyzing Economic Value, Refurbish ROI, Sustainability Impact, and Urban Mining possibilities. Use realistic market data for EGP values and CO2 estimates. Include Security & Data Risk Assessment. The output should be highly detailed and professional. DATA: ${inputString}. ${langPrompt} Return JSON.`;
    return generateFromAPI(prompt, EWASTE_SCHEMA);
};

export const analyzeWaterBillOCR = async (base64Image: string, language: string = 'en', imageMimeType?: string): Promise<WaterBillExtraction> => {
    const langPrompt = language === 'ar' ? "Output strings in Arabic where appropriate." : "Output in English.";
    
    const prompt = `
        Analyze this Water Bill (Egyptian or International). Extract complete OCR structured data including meter number, dates, current/previous reading, total consumption in cubic meters, total cost, pricing tiers (if visible), and additional fees.
        ${langPrompt}
    `;

    return generateFromAPI(prompt, WATER_OCR_SCHEMA, undefined, base64Image, imageMimeType);
};

export const analyzeElectricityBill = async (base64Image: string, language: string = 'en', imageMimeType?: string): Promise<ElectricityBillExtraction> => {
    const langPrompt = language === 'ar' ? "Output strings in Arabic where appropriate." : "Output in English.";
    
    const prompt = `
        Analyze this Egyptian Electricity Bill. Extract monthly consumption (kWh) and total cost.
        ${langPrompt}
    `;

    return generateFromAPI(prompt, BILL_SCHEMA, undefined, base64Image, imageMimeType);
};

export const analyzeWaterBill = async (base64Image: string, language: string = 'en', imageMimeType?: string): Promise<ElectricityBillExtraction> => {
    const langPrompt = language === 'ar' ? "Output strings in Arabic where appropriate." : "Output in English.";
    
    const prompt = `
        Analyze this Egyptian Water Bill. Extract monthly volumetric consumption in cubic meters and map it to the "kwh" field in the output schema. Extract total cost and map to "totalAmount".
        ${langPrompt}
    `;

    return generateFromAPI(prompt, BILL_SCHEMA, undefined, base64Image, imageMimeType);
};

export interface WaterBillExtraction {
    meter_number?: string;
    bill_date?: string;
    current_reading?: number;
    previous_reading?: number;
    consumption_m3?: number;
    total_cost_egp?: number;
    isStub?: boolean;
}

export interface FoodReceiptExtraction {
    total_cost_egp: number;
    items_count: number;
    receipt_date: string;
    isStub?: boolean;
}

export const analyzeEwasteOCR = async (base64Image: string, language: string = 'en', imageMimeType?: string): Promise<any> => {
    try {
        const prompt = language === 'ar' 
            ? 'قم بتحليل هذه الصورة للجهاز الإلكتروني أو فاتورة الشراء أو تقرير صحة البطارية. استخرج أكبر قدر ممكن من المعلومات: نوع الجهاز (deviceType: الهاتف، اللابتوب...)، الماركة (brand)، سنة الشراء (purchaseYear)، السعر التقريبي (approximatePurchasePrice)، وصحة البطارية (batteryHealth) إذا وجدت. قم بإرجاع JSON فقط بدون Markdown. Keys: deviceType, brand, purchaseYear, approximatePurchasePrice, batteryHealth.'
            : 'Analyze this image of an electronic device, purchase receipt, or battery health report. Extract as much information as possible: device type (deviceType like Smartphone, Laptop, etc.), brand, purchase year (purchaseYear), approximate purchase price (approximatePurchasePrice), and battery health (batteryHealth) if available. Return ONLY raw JSON. Keys: deviceType, brand, purchaseYear, approximatePurchasePrice, batteryHealth.';
        return await generateFromAPI(prompt, EWASTE_OCR_SCHEMA, undefined, base64Image, imageMimeType);
    } catch (e) {
        console.error('OCR Extraction failed:', e);
        return { deviceType: 'smartphone', brand: 'Unknown' };
    }
};

export const analyzeFoodReceiptOCR = async (base64Image: string, language: string = 'en', imageMimeType?: string): Promise<FoodReceiptExtraction> => {
    try {
        const prompt = language === 'ar' 
            ? 'قم بتحليل إيصال المشتريات/البقالة هذا. استخرج القيمة الإجمالية (total_cost_egp) وعدد العناصر المشتراة (items_count) وتاريخ الإيصال (receipt_date). قم بإرجاع JSON فقط بدون Markdown. استخدم Keys: total_cost_egp, items_count, receipt_date.'
            : 'Analyze this grocery receipt. Extract the total cost in EGP (total_cost_egp), the number of items (items_count), and the date (receipt_date). Return ONLY raw JSON. Keys: total_cost_egp, items_count, receipt_date.';
        return await generateFromAPI(prompt, FOOD_RECEIPT_SCHEMA, undefined, base64Image, imageMimeType);
    } catch (e) {
        console.error('Food receipt OCR failed', e);
        return { total_cost_egp: 200, items_count: 5, receipt_date: '2024-01-01', isStub: true };
    }
};
