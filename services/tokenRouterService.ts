import { 
    TelemetryHydrationResponse, 
    ClimateActionPlan, 
    EnergyAnalysisReport, 
    MobilityIntelligenceReport,
    MobilityInputs,
    ClaimVerificationResult, 
    EnvironmentalSnapshot, 
    WaterAnalysisReport, 
    EwasteAnalysisReport, 
    ExposureAnalysis,
    CalculatorResults,
    ExposureAgentInputs,
    TelemetryProfile,
    ElectricityBillExtraction,
    EnergyAnalysisInputs,
    WaterAnalysisInputs,
    WaterBillExtraction,
    FoodReceiptExtraction
} from "../types";

import { generateFromAPI } from "./aiClient";
import {
    clampRange,
    clampScore,
    computeElectricityFacts,
    computeWaterFacts,
    factsPromptBlock,
} from "./tariffEngine";
import {
    normalizeElectricityExtraction,
    normalizeFoodExtraction,
    normalizeWaterExtraction,
} from "./billExtraction";
import { computeFoodFacts, foodFactsPromptBlock } from "./foodFacts";
import { recordAnalysisRunSafe } from "./analysisTelemetry";
import { computeMobilityFacts } from './mobilityFacts';

const KAIRO_ARABIC_STYLE = `
Write every user-facing string in clear modern Arabic that any Arab reader can understand,
with a light professional Egyptian tone where it makes the instruction warmer and more direct.
Use correct environmental and engineering terminology, short sentences, and familiar Egyptian
expressions such as "جنيه" and "ابدأ من هنا" only when natural. Avoid heavy classical wording,
street slang, untranslated English, decorative punctuation, and exaggerated claims.
Distinguish measurements, user inputs, derived indicators, forecasts, and AI estimates.
`;

const KAIRO_EVIDENCE_RULES = `
Evidence rules:
- Never present an inferred number as a live measurement or a verified market price.
- Use only the supplied inputs for calculations. If an input is missing, state the assumption in the available explanation field.
- Keep scores between 0 and 100 and keep percentage breakdowns internally consistent.
- Separate observed condition, derived score, estimate, and recommendation.
- Prefer a specific next action with a measurable reason over generic sustainability advice.
- Do not claim access to live tariffs, Google results, sensor feeds, or current market listings unless such evidence is explicitly supplied.
`;

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
        reading_date: { type: "STRING" },
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
        billing_period_days: { type: "NUMBER" },
        evidence_note: { type: "STRING" },
        currency: { type: "STRING" },
        confidence: { type: "NUMBER" },
        isStub: { type: "BOOLEAN" },
        message: { type: "STRING" }
    },
    required: ['total_consumption_m3', 'total_amount', 'currency', 'confidence', 'evidence_note']
};

const FOOD_SCHEMA = { type: 'OBJECT', properties: { metrics: { type: 'OBJECT', properties: { food_waste_index: { type: 'NUMBER' }, food_efficiency_score: { type: 'NUMBER' }, monthly_waste_cost: { type: 'NUMBER' }, annual_waste_cost: { type: 'NUMBER' }, carbon_footprint_kg: { type: 'NUMBER' }, methane_emissions_kg: { type: 'NUMBER' }, water_footprint_loss_liters: { type: 'NUMBER' }, food_recovery_potential_egp: { type: 'NUMBER' }, sustainability_rating: { type: 'STRING' } }, required: ['food_waste_index', 'food_efficiency_score', 'monthly_waste_cost', 'annual_waste_cost', 'carbon_footprint_kg', 'methane_emissions_kg', 'water_footprint_loss_liters', 'food_recovery_potential_egp', 'sustainability_rating'] }, ai_waste_analysis: { type: 'OBJECT', properties: { primary_causes: { type: 'ARRAY', items: { type: 'STRING' } }, behavioral_insights: { type: 'STRING' } }, required: ['primary_causes', 'behavioral_insights'] }, ai_financial_insights: { type: 'OBJECT', properties: { monthly_savings_potential: { type: 'NUMBER' }, annual_savings_potential: { type: 'NUMBER' }, redirect_suggestions: { type: 'ARRAY', items: { type: 'STRING' } } }, required: ['monthly_savings_potential', 'annual_savings_potential', 'redirect_suggestions'] }, ai_supply_chain_diagnosis: { type: 'OBJECT', properties: { most_inefficient_stage: { type: 'STRING' }, stage_breakdown_percentages: { type: 'OBJECT', properties: { purchase: { type: 'NUMBER' }, storage: { type: 'NUMBER' }, preparation: { type: 'NUMBER' }, consumption: { type: 'NUMBER' }, disposal: { type: 'NUMBER' } }, required: ['purchase', 'storage', 'preparation', 'consumption', 'disposal'] }, bottleneck_explanation: { type: 'STRING' } }, required: ['most_inefficient_stage', 'stage_breakdown_percentages', 'bottleneck_explanation'] }, ai_optimization_plan: { type: 'OBJECT', properties: { immediate_actions: { type: 'ARRAY', items: { type: 'STRING' } }, long_term_habits: { type: 'ARRAY', items: { type: 'STRING' } } }, required: ['immediate_actions', 'long_term_habits'] } }, required: ['metrics', 'ai_waste_analysis', 'ai_financial_insights', 'ai_supply_chain_diagnosis', 'ai_optimization_plan'] };

const EWASTE_SCHEMA = {
    type: "OBJECT",
    properties: {
        device_identity: {
            type: "OBJECT",
            properties: {
                normalized_name: { type: "STRING" },
                category: { type: "STRING" },
                brand: { type: "STRING" },
                model: { type: "STRING" },
                identification_confidence: { type: "NUMBER" },
                evidence_basis: { type: "STRING" },
                market_data_status: { type: "STRING" }
            },
            required: ["normalized_name", "category", "brand", "model", "identification_confidence", "evidence_basis", "market_data_status"]
        },
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
    required: ["device_identity", "device_health_score", "device_grade", "circular_economy_score", "device_longevity_index", "recommended_pathway", "pathway_reasoning", "alternative_pathways", "economic_analysis", "environmental_impact", "urban_mining_potential", "security_risk_assessment", "ai_executive_recommendation"]
};

const ELECTRICITY_OCR_SCHEMA = {
    type: "OBJECT",
    properties: {
        meter_number: { type: "STRING" },
        subscription_type: { type: "STRING" },
        property_type: { type: "STRING" },
        previous_reading: { type: "NUMBER" },
        current_reading: { type: "NUMBER" },
        consumption_kwh: { type: "NUMBER" },
        total_amount: { type: "NUMBER" },
        additional_fees: { type: "NUMBER" },
        consumption_tier: { type: "STRING" },
        distribution_company: { type: "STRING" },
        bill_date: { type: "STRING" },
        reading_date: { type: "STRING" },
        billing_period_days: { type: "NUMBER" },
        evidence_note: { type: "STRING" },
        confidence: { type: "NUMBER" },
        isStub: { type: "BOOLEAN" },
        message: { type: "STRING" }
    },
    required: ['consumption_kwh', 'total_amount', 'confidence', 'evidence_note']
};

const EWASTE_OCR_SCHEMA = {
    type: "OBJECT",
    properties: {
        deviceType: { type: "STRING" },
        brand: { type: "STRING" },
        model: { type: "STRING" },
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

const TRANSPORT_RECEIPT_SCHEMA = {
    type: "OBJECT",
    properties: {
        document_type: {
            type: "STRING",
            enum: ['Fuel Receipt', 'Ride Hailing', 'Public Transit', 'EV Charging', 'Other']
        },
        provider: { type: "STRING" },
        amount_egp: { type: "NUMBER" },
        transport_mode: {
            type: "STRING",
            enum: ['Private Car', 'Uber', 'Careem', 'Metro', 'Bus', 'Train', 'Microbus', 'Motorcycle', 'Bicycle', 'Walking', 'Unknown']
        },
        receipt_date: { type: "STRING" },
        confidence: { type: "NUMBER" },
        evidence_note: { type: "STRING" }
    },
    required: ['document_type', 'provider', 'amount_egp', 'transport_mode', 'receipt_date', 'confidence', 'evidence_note']
};

// --- AGENTS (Updated for API Backend calls) ---

export const runExposureAgent = async (inputs: ExposureAgentInputs, language: string = 'en'): Promise<ExposureAnalysis> => {
    const langInstruction = language === 'ar' 
        ? KAIRO_ARABIC_STYLE
        : "Output in English.";
    const prompt = `ROLE: Environmental Analyst. TASK: Estimate exposure. ${langInstruction} ${KAIRO_EVIDENCE_RULES} DATA: ${JSON.stringify(inputs)}`;
    const report = await generateFromAPI(prompt, EXPOSURE_SCHEMA);

    recordAnalysisRunSafe({
        module: 'exposure',
        language: language === 'ar' ? 'ar' : 'en',
        inputs: {
            hours_outdoors: Number(inputs?.hoursOutdoors) || undefined,
            transport_mode: inputs?.transportMode,
        },
        metrics: {
            estimated_aqi: report?.estimated_aqi,
            exposure_level: report?.exposure_level,
            confidence: report?.confidence,
        },
    });

    return report;
};

export const runTelemetryHydration = async (profile: TelemetryProfile, language: string = 'en'): Promise<TelemetryHydrationResponse> => {
    const langInstruction = language === 'ar' 
        ? `${KAIRO_ARABIC_STYLE} Return meta.reasoning_summary in this style and use جنيه for EGP.`
        : "Return meta.reasoning_summary in English. Use Egypt context.";
    
    const prompt = `You are the KAIRO baseline estimator. Based on profile ${JSON.stringify(profile)}, estimate water, food, and energy metrics for Egypt. ${langInstruction} Return JSON.`;
    return generateFromAPI(prompt, TELEMETRY_SCHEMA);
};

export const KairoOrchestrator = {
    generateComprehensivePlan: async (results: CalculatorResults, language: string = 'en'): Promise<ClimateActionPlan> => {
        const langPrompt = language === 'ar' 
            ? `${KAIRO_ARABIC_STYLE} Use Egyptian context and جنيه مصري where currency is needed.`
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
    const langInstructions = isAr ? `${KAIRO_ARABIC_STYLE} Use جنيه مصري. Explain peak load, energy waste, and return on investment in familiar Arabic.` : 'Output in English. Use EGP and refer to Egyptian electricity tariffs.';
    const facts = computeElectricityFacts(inputs);

    const prompt = `
        You are a world-class Energy Efficiency and Sustainability AI Assessor. Execute a deep-dive Energy Intelligence Analysis.
        Evaluate the user's energy consumption based on the following inputs.

        INPUTS:
        ${JSON.stringify(inputs, null, 2)}

        ${factsPromptBlock(facts, isAr ? 'ar' : 'en')}

        INSTRUCTIONS:
        1. The computed facts above are authoritative. Use the consumption, tier, average price, and carbon values exactly as given; never recompute them from the bill.
        2. Identify behavioral flags (e.g., leaving ACs on all day, running non-inverter appliances) and suggest actionable optimizations.
        3. Determine the waste signals and efficiency scores yourself, but keep every score between 0 and 100.
        4. financial_loss_estimate_egp must be a MONTHLY figure and must never exceed the monthly cost.
        5. Benchmarks should compare against typical Egyptian households or comparable businesses.
        6. Populate the scenarios with realistic estimates for Return on Investment (ROI) and cost/emissions savings if applied.

        ${langInstructions}
        ${KAIRO_EVIDENCE_RULES}
    `;

    const report = await generateFromAPI(prompt, ENERGY_SCHEMA);
    const applied = applyElectricityFacts(report, facts, isAr);

    recordAnalysisRunSafe({
        module: 'energy',
        language: isAr ? 'ar' : 'en',
        inputs: {
            type: inputs?.type,
            property_type: inputs?.property_type,
            area_m2: Number(inputs?.area_m2) || undefined,
            occupants: Number(inputs?.occupants) || undefined,
            ac_count: Number(inputs?.ac_count) || undefined,
            ac_hours_daily: Number(inputs?.ac_hours_daily) || undefined,
            ac_type: inputs?.ac_type,
            lighting_type: inputs?.lighting_type,
            has_solar: inputs?.has_solar_panels,
            monthly_bill_egp: Number(inputs?.monthly_bill) || undefined,
            has_ocr: Boolean(inputs?.ocrData),
        },
        facts: {
            source: facts.source,
            consumption_kwh: facts.consumptionKwh,
            tier: facts.tier,
            average_price_egp: facts.averagePriceEgpPerKwh,
            monthly_cost_egp: facts.monthlyCostEgp,
            carbon_kg: facts.carbonKg,
        },
        metrics: {
            estimated_consumption_kwh: applied?.metrics?.estimated_consumption_kwh,
            energy_efficiency_score: applied?.metrics?.energy_efficiency_score,
            financial_loss_estimate_egp: applied?.metrics?.financial_loss_estimate_egp,
            carbon_footprint_kg: applied?.metrics?.carbon_footprint_kg,
        },
        reviewRequired: facts.reviewRequired,
    });

    return applied;
};

const applyElectricityFacts = (
    report: EnergyAnalysisReport,
    facts: ReturnType<typeof computeElectricityFacts>,
    isAr: boolean,
): EnergyAnalysisReport => {
    const monthlyCost = facts.monthlyCostEgp || report.metrics?.financial_loss_estimate_egp || 0;
    const metrics = report.metrics ?? ({} as EnergyAnalysisReport['metrics']);

    return {
        ...report,
        meta: {
            timestamp: new Date().toISOString(),
            methodology: facts.methodology[isAr ? 'ar' : 'en'],
            authoritative: {
                consumption: facts.consumptionKwh,
                unit: 'kWh' as const,
                amount_egp: facts.monthlyCostEgp,
                source: facts.sourceLabel[isAr ? 'ar' : 'en'],
                review_required: facts.reviewRequired,
                warnings: facts.warnings.map((warning) => warning[isAr ? 'ar' : 'en']),
            },
        },
        metrics: {
            ...metrics,
            estimated_consumption_kwh: facts.consumptionKwh,
            average_kwh_price_egp: facts.averagePriceEgpPerKwh,
            carbon_footprint_kg: facts.carbonKg,
            current_tariff_tier: facts.tier ? `${facts.tier}` : metrics.current_tariff_tier,
            energy_efficiency_score: clampScore(metrics.energy_efficiency_score),
            energy_waste_score: clampScore(metrics.energy_waste_score),
            cost_optimization_score: clampScore(metrics.cost_optimization_score),
            financial_loss_estimate_egp: clampRange(metrics.financial_loss_estimate_egp, 0, monthlyCost),
        },
        benchmarks: {
            ...report.benchmarks,
            user_estimated_kwh: facts.consumptionKwh,
        },
    };
};

export const runMobilityIntelligence = async (inputs: MobilityInputs, language: string = 'en'): Promise<MobilityIntelligenceReport> => {
    const facts = computeMobilityFacts(inputs);
    const langPrompt = language === 'ar' ? `${KAIRO_ARABIC_STYLE} Use جنيه for savings and familiar Egyptian mobility context such as الزحام والمترو when relevant.` : "Output in English. Use EGP for cost. Assume Egyptian traffic contexts.";
    const prompt = `ROLE: Mobility Intelligence & Urban Transportation Optimization System Analyst. TASK: Generate a highly detailed mobility analysis for user with the following profile: ${JSON.stringify(inputs)}. ${langPrompt} ${KAIRO_EVIDENCE_RULES} Return JSON.`;
    const report = await generateFromAPI(`${prompt}\nAuthoritative computed mobility facts: ${JSON.stringify(facts)}. Copy metrics exactly. Factors are declared planning assumptions, not live local measurements. Scores and recommendations remain estimates. Explain missing distance and midpoint assumptions. Do not claim route verification or current fuel prices.`, MOBILITY_SCHEMA);
    report.metrics = facts.metrics;

    recordAnalysisRunSafe({
        module: 'mobility',
        facts: { ...facts, metrics: facts.metrics },
        reviewRequired: facts.reviewRequired,
        language: language === 'ar' ? 'ar' : 'en',
        inputs: {
            weekly_commute_days: Number(inputs?.weeklyCommuteDays) || undefined,
            primary_transport: inputs?.primaryTransport,
            return_transport: inputs?.returnTransport,
            transfers: inputs?.transfers,
            commute_time: inputs?.commuteTime,
            monthly_spending_band: inputs?.monthlySpending,
            traffic_exposure: inputs?.trafficExposure,
            one_way_distance_km: Number(inputs?.oneWayDistanceKm) || undefined,
            actual_monthly_cost_egp: Number(inputs?.actualMonthlyCostEgp) || undefined,
            daily_commute_minutes: Number(inputs?.dailyCommuteMinutes) || undefined,
            is_car: inputs?.isCar,
            fuel_type: inputs?.fuelType,
            vehicle_year: inputs?.vehicleYear,
            has_ac: inputs?.acUsage,
        },
        metrics: {
            monthly_carbon_kg: report?.metrics?.monthly_carbon_kg,
            monthly_cost_egp: report?.metrics?.monthly_cost_egp,
            mobility_efficiency: report?.scores?.mobility_efficiency,
        },
    });

    return report;
};

export const runVerificationEngine = async (claim: string, language: string = 'en'): Promise<ClaimVerificationResult> => {
    const langPrompt = language === 'ar' ? KAIRO_ARABIC_STYLE : "Output in English.";
    const prompt = `ROLE: Sustainability Auditor. TASK: Verify this corporate claim for greenwashing and scientific accuracy: "${claim}". ${langPrompt} Return JSON.`;
    return generateFromAPI(prompt, VERIFICATION_SCHEMA);
};

export const runContextEngine = async (lat: number, lng: number, language: string = 'en'): Promise<EnvironmentalSnapshot> => {
    const langPrompt = language === 'ar' ? KAIRO_ARABIC_STYLE : "Output in English.";
    const prompt = `ROLE: Geo-Environmental Data Analyst. TASK: Estimate AQI and CO2 ppm for coordinates [${lat}, ${lng}]. Use regional satellite proxy logic for Egypt. ${langPrompt} Return JSON.`;
    return generateFromAPI(prompt, CONTEXT_SCHEMA);
};

export const runWaterAnalysis = async (inputs: WaterAnalysisInputs, language: string = 'en'): Promise<WaterAnalysisReport> => {
    const isAr = language === 'ar';
    const langPrompt = isAr
        ? `${KAIRO_ARABIC_STYLE} Use Egyptian water context, جنيه, and the accessible term ترشيد المياه.`
        : "Output in English. Be highly professional.";
    const facts = computeWaterFacts(inputs);

    const prompt = `ROLE: Global Expert in AI Product Design, UX, Sustainability & Water Resource Management. TASK: Perform advanced AI water efficiency and scarcity analysis based on realistic household/corporate data. Avoid engineering assumptions like counting leaky drops; use holistic smart analysis of behavioral signs, bills, and facility types. DATA: ${JSON.stringify(inputs)}. ${factsPromptBlock(facts, isAr ? 'ar' : 'en')} INSTRUCTIONS: The computed facts above are authoritative for volume, price, and carbon; use them verbatim and never recompute from the bill. financial_loss_estimate_egp must be a MONTHLY figure and must never exceed the monthly cost. annual_water_waste_liters must not exceed the annual consumption implied by the computed volume. Keep every score between 0 and 100. ${langPrompt} ${KAIRO_EVIDENCE_RULES} Return highly structured, insightful JSON.`;

    const report = await generateFromAPI(prompt, WATER_SCHEMA);
    const applied = applyWaterFacts(report, facts, isAr);

    recordAnalysisRunSafe({
        module: 'water',
        language: isAr ? 'ar' : 'en',
        inputs: {
            type: inputs?.type,
            family_size: Number(inputs?.family_size) || undefined,
            housing_type: inputs?.housing_type,
            facility_type: inputs?.facility_type,
            monthly_bill_egp: Number(inputs?.monthly_bill) || undefined,
            bill_increased: inputs?.bill_increased,
            constant_water_sound: inputs?.constant_water_sound,
            damp_stains: inputs?.damp_stains,
            toilet_refills: inputs?.toilet_refills,
            has_ocr: Boolean(inputs?.ocrData),
        },
        facts: {
            source: facts.source,
            consumption_m3: facts.consumptionM3,
            blended_rate_egp: facts.blendedRateEgpPerM3,
            monthly_cost_egp: facts.monthlyCostEgp,
            carbon_kg: facts.carbonKg,
        },
        metrics: {
            water_efficiency_score: applied?.metrics?.water_efficiency_score,
            leak_probability_score: applied?.metrics?.leak_probability_score,
            financial_loss_estimate_egp: applied?.metrics?.financial_loss_estimate_egp,
        },
        reviewRequired: facts.reviewRequired,
    });

    return applied;
};

const applyWaterFacts = (
    report: WaterAnalysisReport,
    facts: ReturnType<typeof computeWaterFacts>,
    isAr: boolean,
): WaterAnalysisReport => {
    const metrics = report.metrics ?? ({} as WaterAnalysisReport['metrics']);
    const monthlyCost = facts.monthlyCostEgp || 0;
    const annualLiters = facts.consumptionM3 * 1000 * 12;

    return {
        ...report,
        meta: {
            timestamp: new Date().toISOString(),
            methodology: facts.methodology[isAr ? 'ar' : 'en'],
            authoritative: {
                consumption: facts.consumptionM3,
                unit: 'm3' as const,
                amount_egp: facts.monthlyCostEgp,
                source: facts.sourceLabel[isAr ? 'ar' : 'en'],
                review_required: facts.reviewRequired,
                warnings: facts.warnings.map((warning) => warning[isAr ? 'ar' : 'en']),
            },
        },
        metrics: {
            ...metrics,
            water_efficiency_score: clampScore(metrics.water_efficiency_score),
            leak_probability_score: clampScore(metrics.leak_probability_score),
            household_sustainability_score: clampScore(metrics.household_sustainability_score),
            water_scarcity_impact_score: clampScore(metrics.water_scarcity_impact_score),
            annual_water_waste_liters: Number.isFinite(annualLiters) && annualLiters > 0
                ? clampRange(metrics.annual_water_waste_liters, 0, annualLiters)
                : Math.max(0, Number(metrics.annual_water_waste_liters) || 0),
            financial_loss_estimate_egp: clampRange(metrics.financial_loss_estimate_egp, 0, monthlyCost),
        },
        benchmarks: {
            ...report.benchmarks,
            user_estimated_liters: facts.consumptionM3 * 1000,
        },
    };
};

export const runFoodWasteAnalysis = async (inputs: any, language: string = 'en'): Promise<any> => {
    const isAr = language === 'ar';
    const facts = computeFoodFacts(
        {
            familySize: inputs?.familySize,
            adults: inputs?.adults,
            children: inputs?.children,
            monthlyBudgetEgp: inputs?.monthlyBudget,
            restaurantPercent: inputs?.restaurantPercent,
            homeMealsPerDay: inputs?.homeMealsPerDay,
            deliveryPerWeek: inputs?.deliveryPerWeek,
            shoppingTripsPerWeek: inputs?.shoppingFreq,
            throwAwayFreq: inputs?.throwAwayFreq,
            expiredFound: inputs?.expiredFound,
            hasMealPlan: inputs?.hasMealPlan,
            shelfLifeDays: inputs?.shelfLifeDays,
            reductionTargetPercent: inputs?.reductionTarget,
            receiptTotalEgp: inputs?.receiptTotalEgp,
        },
        isAr ? 'ar' : 'en',
    );
    const langPrompt = isAr
        ? `${KAIRO_ARABIC_STYLE} Focus on familiar purchasing, storage, and consumption behavior.`
        : 'Output in English.';

    const prompt = `ROLE: Global Expert in AI Product Design, UX, Sustainability & Supply Chain. TASK: Analyze household food waste impact conceptually and practically. DATA: ${JSON.stringify(inputs)}. ${foodFactsPromptBlock(facts, isAr ? 'ar' : 'en')} ${langPrompt} ${KAIRO_EVIDENCE_RULES} Provide deep, realistic insights. Return JSON.`;

    const report = await generateFromAPI(prompt, FOOD_SCHEMA);
    const applied = applyFoodFacts(report, facts, isAr);

    recordAnalysisRunSafe({
        module: 'food',
        language: isAr ? 'ar' : 'en',
        inputs: {
            family_size: inputs?.familySize,
            adults: inputs?.adults,
            children: inputs?.children,
            monthly_budget_egp: inputs?.monthlyBudget,
            restaurant_percent: inputs?.restaurantPercent,
            meals_per_day: inputs?.homeMealsPerDay,
            delivery_per_week: inputs?.deliveryPerWeek,
            throw_away_freq: inputs?.throwAwayFreq,
            expired_found: inputs?.expiredFound,
            has_meal_plan: inputs?.hasMealPlan,
            shelf_life_days: inputs?.shelfLifeDays,
            reduction_target: inputs?.reductionTarget,
            has_receipt: Boolean(inputs?.receiptTotalEgp),
        },
        facts: {
            source: facts.source,
            waste_rate_percent: facts.wasteRatePercent,
            cost_per_meal_egp: facts.costPerMealEgp,
            monthly_spend_egp: facts.monthlyFoodSpendEgp,
            wasted_kg_per_month: facts.wastedKgPerMonth,
            monthly_loss_egp: facts.monthlyLossEgp,
            annual_loss_egp: facts.annualLossEgp,
            carbon_kg_per_month: facts.carbonKgPerMonth,
            methane_kg_per_month: facts.methaneKgPerMonth,
            water_liters_per_month: facts.waterLitersPerMonth,
        },
        metrics: {
            food_waste_index: applied?.metrics?.food_waste_index,
            food_efficiency_score: applied?.metrics?.food_efficiency_score,
            monthly_waste_cost: applied?.metrics?.monthly_waste_cost,
            annual_waste_cost: applied?.metrics?.annual_waste_cost,
            carbon_footprint_kg: applied?.metrics?.carbon_footprint_kg,
            methane_emissions_kg: applied?.metrics?.methane_emissions_kg,
            water_footprint_loss_liters: applied?.metrics?.water_footprint_loss_liters,
        },
        reviewRequired: facts.reviewRequired,
    });

    return applied;
};

const applyFoodFacts = (report: any, facts: ReturnType<typeof computeFoodFacts>, isAr: boolean): any => {
    const metrics = report?.metrics ?? {};
    const clampScore = (value: unknown) => {
        const numeric = Number(value);
        if (!Number.isFinite(numeric)) return 0;
        return Math.round(Math.min(100, Math.max(0, numeric)));
    };
    const efficiencyFromWaste = Math.round(Math.min(100, Math.max(0, 100 - facts.wasteRatePercent * 2.2)));

    return {
        ...report,
        meta: {
            timestamp: new Date().toISOString(),
            methodology: facts.methodology[isAr ? 'ar' : 'en'],
            authoritative: {
                consumption: facts.wastedKgPerMonth,
                unit: 'kWh' as const,
                amount_egp: facts.monthlyLossEgp,
                source: facts.sourceLabel[isAr ? 'ar' : 'en'],
                review_required: facts.reviewRequired,
                warnings: facts.warnings.map((warning) => warning[isAr ? 'ar' : 'en']),
            },
        },
        facts: {
            waste_rate_percent: facts.wasteRatePercent,
            cost_per_meal_egp: facts.costPerMealEgp,
            household_meals_per_month: facts.householdMealsPerMonth,
            wasted_meals_per_month: facts.wastedMealsPerMonth,
            wasted_kg_per_month: facts.wastedKgPerMonth,
            reduction_target_egp_monthly: facts.reductionTargetEgpMonthly,
        },
        metrics: {
            ...metrics,
            food_waste_index: clampScore(metrics.food_waste_index ?? facts.wasteRatePercent),
            food_efficiency_score: clampScore(metrics.food_efficiency_score ?? efficiencyFromWaste),
            monthly_waste_cost: facts.monthlyLossEgp,
            annual_waste_cost: facts.annualLossEgp,
            carbon_footprint_kg: facts.carbonKgPerMonth,
            methane_emissions_kg: facts.methaneKgPerMonth,
            water_footprint_loss_liters: facts.waterLitersPerMonth,
            food_recovery_potential_egp: Math.min(
                Number(metrics.food_recovery_potential_egp) || facts.monthlyLossEgp,
                facts.monthlyLossEgp,
            ),
        },
    };
};

export const runEwasteAnalysis = async (inputString: string, language: string = 'en'): Promise<EwasteAnalysisReport> => {
    const langPrompt = language === 'ar' ? KAIRO_ARABIC_STYLE : "Output in English.";
    const prompt = `ROLE: Circular Economy Consultant, E-Waste Lifecycle Analyst & Sustainability Intelligence Architect.
TASK: Perform an advanced lifecycle assessment of the supplied electronic device.
First normalize the device identity from category, brand, model, year, and any OCR evidence. Do not invent an exact model when it was not provided; lower identification_confidence and explain the evidence basis.
Treat all EGP values as transparent estimates derived from purchase price, age, condition, accessories, and repairability. market_data_status must explicitly say whether the result is user-input-derived, catalog-assisted, or lacks live market verification.
Assess repairability, remaining useful life, data-security risk, economic value, circular pathway, and urban-mining potential. Recommend recycling only when continued use, repair, refurbishment, donation, or resale is not reasonable.
DATA: ${inputString}.
${langPrompt}
${KAIRO_EVIDENCE_RULES}
Return JSON.`;
    const report = await generateFromAPI(prompt, EWASTE_SCHEMA);

    recordAnalysisRunSafe({
        module: 'ewaste',
        language: language === 'ar' ? 'ar' : 'en',
        inputs: { payload_size: String(inputString ?? '').length },
        metrics: {
            remaining_life_months: report?.lifecycle?.remaining_life_months,
            circular_economy_impact_score: report?.environmental_impact?.circular_economy_impact_score,
            estimated_value_egp: report?.economic_value?.estimated_value_egp,
            recommended_pathway: report?.circular_pathway?.recommended_pathway,
        },
    });

    return report;
};

export const analyzeWaterBillOCR = async (base64Image: string, language: string = 'en', imageMimeType?: string): Promise<WaterBillExtraction> => {
    const langPrompt = language === 'ar' ? KAIRO_ARABIC_STYLE : "Output in English.";

    const prompt = `
        ROLE: A meticulous Egyptian utility-bill data extractor. Read this water bill image.
        WORK IN THIS ORDER:
        1. Identify the bill layout first: header (company, dates), the meter-readings block, the consumption block, and the payment block before reading any number.
        2. Consumption: prefer the printed total consumption in m³. If it is missing, subtract the previous meter reading from the current reading and report that difference as total_consumption_m3.
        3. Total: read the final amount due in EGP ("الإجمالي" / "المبلغ المستحق"), not an intermediate subtotal, and report additional fees separately.
        4. Context: copy the printed pricing tiers only when they are actually visible, plus meter number, dates, and the billing period in days (estimate it from the two reading dates when not printed).
        5. Evidence: write evidence_note in the requested language naming the exact printed labels and figures you based the numbers on.
        RULES: Arabic-Indic digits are common; convert them to Latin digits in numeric fields.
        Never invent a reading, a meter number, or a tier that is not visible. If a key figure is unreadable,
        return 0 for it and lower the confidence instead of guessing. Return raw JSON only.
        All monetary values are EGP unless the bill states another currency.
        SELF-CHECK before answering, in this order:
        (a) If both readings and the printed volume exist, their difference must match the printed volume within 10%. If it does not, re-examine the readings block.
        (b) Divide the total amount by the volume in m³. That rate must fall between
        1 and 40 EGP/m³ for an Egyptian bill, and a household normally uses under 60 m³ per month. If your
        numbers fail this check you misread the bill: re-examine which figure is the volume (m³) and which
        is the amount due, and never treat a meter serial, subscription number, or barcode digits as volume.
        ${langPrompt}
    `;

    return normalizeWaterExtraction(
        await generateFromAPI(prompt, WATER_OCR_SCHEMA, undefined, base64Image, imageMimeType),
    );
};

export const analyzeElectricityBill = async (base64Image: string, language: string = 'en', imageMimeType?: string): Promise<ElectricityBillExtraction> => {
    const langPrompt = language === 'ar' ? KAIRO_ARABIC_STYLE : "Output in English.";

    const prompt = `
        ROLE: A meticulous Egyptian utility-bill data extractor. Read this electricity bill image.
        WORK IN THIS ORDER:
        1. Identify the bill layout first: find the header (company, subscription, dates), the meter-readings block, the consumption block, and the payment block before reading any number.
        2. Consumption: prefer the printed consumption in kWh ("الاستهلاك" / "فرق القراءة"). If it is missing, subtract the previous meter reading from the current reading and report that difference as consumption_kwh.
        3. Total: read the final amount due in EGP ("الإجمالي" / "المبلغ المستحق"), not an intermediate subtotal, and report additional fees or service charges separately in additional_fees.
        4. Context: copy the printed consumption tier ("الشريحة"), meter number, distribution company, subscription type, property type (residential/commercial), bill date, reading date, and billing period in days only when actually visible. Estimate billing_period_days from the two reading dates when it is not printed.
        5. Evidence: write evidence_note in the requested language naming the exact printed labels and figures you based each number on.
        RULES: Arabic-Indic digits are common; convert them to Latin digits in numeric fields.
        Never invent a reading, a meter number, or a tier that is not visible. If a key figure is unreadable,
        return 0 for it and lower the confidence instead of guessing. Return raw JSON only.
        All monetary values are EGP.
        SELF-CHECK before answering, in this order:
        (a) If both readings and the printed consumption exist, their difference must match the printed consumption within 10%. If it does not, you misread one of them: re-examine the readings block.
        (b) Divide the total amount by the consumption. For an Egyptian bill that effective price must fall
        between 0.5 and 15 EGP/kWh, and a household (منازل) reading is normally under 2,000 kWh per month. If your
        numbers fail this check you misread the bill: re-examine which figure is the consumption (ك.و.س / فرق القراءة) and which
        is the amount due, and never treat a meter serial, subscription number, barcode digits, or a previous/current reading as the consumption.
        ${langPrompt}
    `;

    return normalizeElectricityExtraction(
        await generateFromAPI(prompt, ELECTRICITY_OCR_SCHEMA, undefined, base64Image, imageMimeType),
    );
};

export interface TransportReceiptExtraction {
    document_type: 'Fuel Receipt' | 'Ride Hailing' | 'Public Transit' | 'EV Charging' | 'Other';
    provider: string;
    amount_egp: number;
    transport_mode: 'Private Car' | 'Uber' | 'Careem' | 'Metro' | 'Bus' | 'Train' | 'Microbus' | 'Motorcycle' | 'Bicycle' | 'Walking' | 'Unknown';
    receipt_date: string;
    confidence: number;
    evidence_note: string;
}

export const analyzeEwasteOCR = async (base64Image: string, language: string = 'en', imageMimeType?: string): Promise<any> => {
    const prompt = language === 'ar'
        ? 'حلّل صورة الجهاز الإلكتروني أو فاتورة الشراء أو تقرير صحة البطارية. استخرج فقط المعلومات الظاهرة أو التي يمكن قراءتها بثقة: نوع الجهاز (deviceType)، الماركة (brand)، الموديل الدقيق (model)، سنة الشراء (purchaseYear)، السعر المذكور أو التقريبي (approximatePurchasePrice)، وصحة البطارية (batteryHealth). لا تخمّن موديلًا غير ظاهر. أرجع JSON فقط بدون Markdown. Keys: deviceType, brand, model, purchaseYear, approximatePurchasePrice, batteryHealth.'
        : 'Analyze this electronic-device image, receipt, or battery-health report. Extract only visible or confidently readable information: deviceType, brand, exact model, purchaseYear, stated or approximatePurchasePrice, and batteryHealth. Do not invent a model that is not visible. Return raw JSON only. Keys: deviceType, brand, model, purchaseYear, approximatePurchasePrice, batteryHealth.';
    return generateFromAPI(prompt, EWASTE_OCR_SCHEMA, undefined, base64Image, imageMimeType);
};

export const analyzeFoodReceiptOCR = async (base64Image: string, language: string = 'en', imageMimeType?: string): Promise<FoodReceiptExtraction> => {
    const prompt = language === 'ar'
        ? 'حلّل صورة إيصال المشتريات أو البقالة بدقة. استخرج الإجمالي النهائي المطبوع (total_cost_egp) وهو آخر رقم إجمالي في الإيصال وليس مجموعًا جزئيًا، وعدد العناصر المقروءة (items_count)، وتاريخ الإيصال (receipt_date). الأرقام العربية الهندية شائعة فحوّلها إلى أرقام لاتينية. لا تخمّن قيمة غير ظاهرة. أرجع JSON فقط بدون Markdown.'
        : 'Read this grocery receipt carefully. Extract the final printed total (total_cost_egp), which is the last total on the receipt and not an intermediate subtotal, the count of readable items (items_count), and the receipt date (receipt_date). Arabic-Indic digits are common; convert them to Latin digits. Do not invent missing values. Return raw JSON only.';
    return normalizeFoodExtraction(
        await generateFromAPI(prompt, FOOD_RECEIPT_SCHEMA, undefined, base64Image, imageMimeType),
    );
};

export const analyzeTransportReceiptOCR = async (
    base64Image: string,
    language: string = 'en',
    imageMimeType?: string,
): Promise<TransportReceiptExtraction> => {
    const prompt = language === 'ar'
        ? `حلّل صورة إيصال تنقّل أو وقود أو شحن مركبة. استخرج فقط البيانات المقروءة، وحدد نوع المستند ومقدم الخدمة والمبلغ بالجنيه ووسيلة النقل والتاريخ ودرجة الثقة. لا تحوّل إيصالًا واحدًا إلى إنفاق شهري ولا تخمّن وسيلة غير مدعومة بالنص الظاهر. اكتب evidence_note بالعربية لتوضيح أساس الاستخراج.`
        : `Analyze this mobility, fuel, ride-hailing, public-transit, or EV-charging receipt. Extract only readable evidence: document type, provider, EGP amount, transport mode, date, and confidence. Do not infer monthly spending from one receipt and do not invent an unsupported transport mode. Explain the extraction basis in evidence_note.`;
    return generateFromAPI(
        prompt,
        TRANSPORT_RECEIPT_SCHEMA,
        undefined,
        base64Image,
        imageMimeType,
    );
};
