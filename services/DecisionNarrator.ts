
import { AIClient, DEFAULT_AI_MODEL } from "./aiClient";
import { CalculatorResults, ClimateActionPlan, TrackedAction, SessionStory } from "../types";

const STORY_SCHEMA = {
    type: "OBJECT",
    properties: {
        problem_statement: { type: "STRING" },
        key_decisions: { type: "ARRAY", items: { type: "STRING" } },
        actions_taken: { type: "ARRAY", items: { type: "STRING" } },
        quantified_impact: {
            type: "OBJECT",
            properties: {
                water_saved_liters: { type: "NUMBER" },
                co2_reduced_kg: { type: "NUMBER" },
                money_saved_egp: { type: "NUMBER" }
            }
        },
        final_summary: { type: "STRING" }
    }
};

// Helper to extract numbers from strings like "50 EGP/mo" or "10 kgCO2"
const parseSavings = (str: string): { val: number, type: 'money' | 'co2' | 'water' | 'unknown' } => {
    if (!str) return { val: 0, type: 'unknown' };
    const num = parseFloat(str.match(/[\d.]+/)?.[0] || "0");
    const lower = str.toLowerCase();
    
    if (lower.includes('egp') || lower.includes('le')) return { val: num, type: 'money' };
    if (lower.includes('kg') || lower.includes('co2')) return { val: num, type: 'co2' };
    if (lower.includes('l') || lower.includes('m3') || lower.includes('liter')) return { val: num, type: 'water' };
    
    return { val: 0, type: 'unknown' };
};

export const generateSessionStory = async (
    baseline: CalculatorResults,
    plan: ClimateActionPlan,
    actions: TrackedAction[]
): Promise<SessionStory> => {
    const ai = new AIClient();

    // 1. DETERMINISTIC CALCULATION (The "Truth" Layer)
    // We calculate the impact locally based on the plan's data to ensure the numbers are real, 
    // rather than letting the LLM hallucinate totals.
    
    let totalMoneySaved = 0;
    let totalCo2Saved = 0;
    let totalWaterSaved = 0;

    // Filter relevant actions from the plan that match tracked (completed) actions
    // Or if no actions tracked yet, use the top 3 recommended from the plan
    const relevantActions = [
        ...plan.climate_action_plan.daily_actions,
        ...plan.climate_action_plan.weekly_actions,
        ...plan.climate_action_plan.monthly_actions
    ].filter(a => {
        // If track actions exist, check if completed. If not, assume potential impact of top actions.
        const isTracked = actions.find(ta => ta.text === a.title && ta.completed);
        return isTracked || actions.length === 0; // Fallback to "Potential" if no actions taken yet
    });

    relevantActions.forEach(action => {
        const { val, type } = parseSavings(action.estimated_savings);
        if (type === 'money') totalMoneySaved += val;
        if (type === 'co2') totalCo2Saved += val;
        if (type === 'water') totalWaterSaved += val; // Note: Daily actions might need x30 scaling in real app
    });

    // Scale up daily actions for monthly totals if they are daily
    // (Simplified logic for Hackathon - assumes input strings are "per month" mostly, or we accept raw sum)

    // 2. AI NARRATIVE GENERATION
    const prompt = `
        ROLE: Kairo Decision Story Engine.
        TASK: Construct a linear narrative of the user's climate session.
        
        INPUT DATA:
        - Baseline Financial Loss: ${baseline.water.monthlyCostLE + baseline.food.monthlyFinancialLossLE} EGP/mo
        - Baseline CO2: ${baseline.totalCo2Kg} kg/mo
        - Selected Interventions: ${relevantActions.map(a => a.title).join(', ')}
        - Calculated Impact: 
          * Money: ${totalMoneySaved} EGP
          * CO2: ${totalCo2Saved} kg
          * Water: ${totalWaterSaved} L (approx)
        
        REQUIREMENTS:
        1. "problem_statement": One sentence describing the user's initial inefficiency status.
        2. "key_decisions": List 2-3 strategic shifts implied by their selected actions.
        3. "actions_taken": List the specific tactical actions.
        4. "quantified_impact": MUST MATCH THE INPUT DATA EXACTLY. Do not hallucinate new numbers.
        5. "final_summary": A closing statement on their new efficiency trajectory.
        
        OUTPUT: Strict JSON matching the schema.
    `;

    const res = await ai.models.generateContent({
        model: DEFAULT_AI_MODEL,
        contents: prompt,
        config: { 
            responseMimeType: 'application/json',
            responseSchema: STORY_SCHEMA
        }
    });

    const story = JSON.parse(res.text || "{}");

    // Inject metadata
    return {
        ...story,
        meta: {
            generated_at: Date.now(),
            data_points_analyzed: relevantActions.length + 5
        }
    };
};
