
import { AIClient, DEFAULT_AI_MODEL } from "./aiClient";
import { Scenario, ScenarioComparisonAnalysis, CalculatorResults, WaterData, FoodData } from "../types";

const COMPARISON_SCHEMA = {
    type: "OBJECT",
    properties: {
        optimal_scenario_id: { type: "STRING" },
        analysis_summary: { type: "STRING" },
        key_differentiators: { type: "ARRAY", items: { type: "STRING" } },
        trade_offs: {
            type: "ARRAY",
            items: {
                type: "OBJECT",
                properties: {
                    scenario_id: { type: "STRING" },
                    pro: { type: "STRING" },
                    con: { type: "STRING" }
                }
            }
        },
        high_leverage_actions: { type: "ARRAY", items: { type: "STRING" } }
    }
};

const getAi = () => new AIClient();

// --- LOCAL STORAGE UTILS ---

export const saveScenario = (name: string, results: CalculatorResults, waterInput: WaterData, foodInput: FoodData): Scenario => {
    const scenarios: Scenario[] = JSON.parse(localStorage.getItem('kairo_scenarios') || '[]');
    
    const newScenario: Scenario = {
        id: Math.random().toString(36).substr(2, 9),
        name: name || `Scenario ${scenarios.length + 1}`,
        timestamp: Date.now(),
        results,
        waterInput,
        foodInput
    };

    scenarios.push(newScenario);
    localStorage.setItem('kairo_scenarios', JSON.stringify(scenarios));
    return newScenario;
};

export const getScenarios = (): Scenario[] => {
    return JSON.parse(localStorage.getItem('kairo_scenarios') || '[]');
};

export const deleteScenario = (id: string): Scenario[] => {
    const scenarios: Scenario[] = JSON.parse(localStorage.getItem('kairo_scenarios') || '[]');
    const updated = scenarios.filter(s => s.id !== id);
    localStorage.setItem('kairo_scenarios', JSON.stringify(updated));
    return updated;
};

// --- AI REASONING ---

export const compareScenariosAgent = async (scenarios: Scenario[]): Promise<ScenarioComparisonAnalysis> => {
    if (scenarios.length < 2) throw new Error("At least 2 scenarios needed for comparison.");

    const ai = getAi();
    
    // Format scenarios for the prompt
    const contextData = scenarios.map(s => `
        ID: ${s.id}
        Name: ${s.name}
        Total CO2: ${s.results.totalCo2Kg} kg
        Water Wasted: ${s.results.water.monthlyWastedLiters} L
        Financial Loss: ${(s.results.water.monthlyCostLE + s.results.food.monthlyFinancialLossLE).toFixed(0)} EGP
    `).join('\n---\n');

    const prompt = `
        ROLE: Strategic Environmental Planner.
        TASK: Compare these user sustainability scenarios for an Egyptian household.
        
        DATA:
        ${contextData}
        
        CONTEXT: 
        - Egypt Water Scarcity Line: <550m3/capita.
        - Economic Inflation: Prioritize financial savings (EGP).
        - Energy Grid: 0.45 kgCO2/kWh.
        
        OBJECTIVE:
        1. Identify the Optimal Scenario (Balance of Feasibility & Impact).
        2. Highlight strict trade-offs (e.g., "Scenario B saves more water but costs more upfront").
        3. Determine high leverage actions based on the delta between scenarios.
        
        OUTPUT: Strict JSON matching schema.
    `;

    const res = await ai.models.generateContent({
        model: DEFAULT_AI_MODEL,
        contents: prompt,
        config: { 
            responseMimeType: 'application/json',
            responseSchema: COMPARISON_SCHEMA
        }
    });

    return JSON.parse(res.text || "{}");
};
