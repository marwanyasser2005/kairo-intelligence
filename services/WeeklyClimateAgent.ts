
import { AIClient, DEFAULT_AI_MODEL } from "./aiClient";
import { 
    CalculatorResults, 
    ClimateActionPlan, 
    TrackedAction 
} from "../types";

// SCHEMAS (Reusing PLAN_SCHEMA structure for consistency)
const REVISED_PLAN_SCHEMA = {
    type: "OBJECT",
    properties: {
        meta: {
            type: "OBJECT",
            properties: {
                engine_version: { type: "STRING" },
                processing_time_ms: { type: "NUMBER" },
                data_quality_score: { type: "NUMBER" },
                language: { type: "STRING" }
            }
        },
        baseline: {
            type: "OBJECT",
            properties: {
                total_co2_kg: { type: "NUMBER" },
                national_comparison: { type: "STRING" }
            }
        },
        risk_assessment: {
            type: "OBJECT",
            properties: {
                level: { type: "STRING", enum: ['Low', 'Moderate', 'High', 'Critical'] },
                primary_vector: { type: "STRING" },
                description: { type: "STRING" }
            }
        },
        financial_analysis: {
            type: "OBJECT",
            properties: {
                monthly_waste_egp: { type: "NUMBER" },
                annual_waste_egp: { type: "NUMBER" },
                investment_required_egp: { type: "NUMBER" },
                roi_period_months: { type: "NUMBER" }
            }
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
                        }
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
                        }
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
                        }
                    }
                },
                expected_impact: {
                    type: "OBJECT",
                    properties: {
                        water: { type: "STRING" },
                        food: { type: "STRING" },
                        co2: { type: "STRING" }
                    }
                }
            }
        }
    }
};

interface AgentContext {
    baseline: CalculatorResults | null;
    currentPlan: ClimateActionPlan | null;
    actionHistory: TrackedAction[];
    lastReviewDate: number;
}

/**
 * WeeklyClimateAgent
 * 
 * WHY MULTI-STEP?
 * 1. Deterministic Audit: An LLM cannot "see" LocalStorage or calculate accurate percentages of checked boxes from raw text easily.
 * 2. State Comparison: We need to compare the *intended* plan vs. *actual* behavior mathematically before asking for qualitative advice.
 * 3. Token Efficiency: Sending the entire history log is wasteful; we summarize the "Compliance Score" first.
 */
export const runWeeklyReview = async (): Promise<{ status: 'updated' | 'skipped' | 'error', newPlan?: ClimateActionPlan }> => {
    
    // --- STEP 1: STATE LOADING ---
    // Gather all persistence layers to form the context
    const context: AgentContext = {
        baseline: JSON.parse(localStorage.getItem('kairo_baseline_results') || 'null'),
        currentPlan: JSON.parse(localStorage.getItem('kairo_generated_plan') || 'null'),
        actionHistory: JSON.parse(localStorage.getItem('kairo_actions') || '[]'),
        lastReviewDate: parseInt(localStorage.getItem('kairo_last_review') || '0')
    };

    const NOW = Date.now();
    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

    // Guard Clause: Only run if data exists and enough time has passed (or force run for demo)
    if (!context.baseline || !context.currentPlan) {
        return { status: 'skipped' };
    }

    // Check if 7 days have passed (manual dashboard runs can bypass the scheduled cadence).
    // In production: if (NOW - context.lastReviewDate < SEVEN_DAYS_MS) return { status: 'skipped' };

    // --- STEP 2: ANALYZE PROGRESS (Deterministic) ---
    // Calculate adherence score
    const completedActions = context.actionHistory.filter(a => a.completed).length;
    const totalActionsTracked = context.actionHistory.length;
    const adherenceScore = totalActionsTracked > 0 ? (completedActions / totalActionsTracked) * 100 : 0;

    // Detect if high-impact actions were ignored (simplified logic)
    const highImpactIgnored = context.actionHistory.filter(a => !a.completed && a.text.toLowerCase().includes('leak')).length > 0;

    // --- STEP 3: RE-EVALUATE METRICS (Logic) ---
    // If adherence is low (< 30%), the risk level increases.
    // If adherence is high (> 80%), we can introduce "Advanced" actions.
    const riskMultiplier = adherenceScore < 30 ? 1.2 : adherenceScore > 80 ? 0.9 : 1.0;
    const currentRiskLevel = context.currentPlan.risk_assessment.level;
    
    // --- STEP 4: SYNTHESIZE NEW PLAN (LLM) ---
    const ai = new AIClient();
    
    const systemPrompt = `
        ROLE: Kairo Weekly Review Agent.
        TASK: Update the user's Climate Action Plan based on last week's performance.
        
        INPUT CONTEXT:
        - Previous Risk Level: ${currentRiskLevel}
        - Adherence Score: ${adherenceScore.toFixed(1)}%
        - Total Actions Completed: ${completedActions}/${totalActionsTracked}
        - High Impact Neglect: ${highImpactIgnored ? "YES (User ignored leakage fixes)" : "NO"}
        
        LOGIC RULES:
        1. If Adherence < 30%: The user is overwhelmed. Simplify the plan. Remove "Hard" tasks. Focus on 1-2 "Easy" wins. Change tone to "Encouraging".
        2. If Adherence > 80%: The user is a champion. Introduce "Advanced" tasks (e.g. Solar investment, Community audits). Change tone to "Ambitious".
        3. If High Impact Neglected: Escalate risk level to "Critical" and add specific warning in "impact_summary".
        
        OUTPUT:
        - Generate a FULL valid ClimateActionPlan JSON object.
        - Ensure "risk_assessment" reflects the new reality.
    `;

    try {
        const res = await ai.models.generateContent({
            model: DEFAULT_AI_MODEL,
            contents: systemPrompt,
            config: { 
                responseMimeType: 'application/json', 
                responseSchema: REVISED_PLAN_SCHEMA,
                thinkingConfig: { thinkingBudget: 2048 } // Explicitly set to integer
            }
        });

        if (!res.text) throw new Error("Empty response from Review Agent");
        
        const newPlan = JSON.parse(res.text) as ClimateActionPlan;
        
        // Add meta tags for UI visibility
        newPlan.meta.engine_version = "Kairo Review Agent v1.0";
        newPlan.meta.processing_time_ms = Date.now() - NOW;

        // --- STEP 5: SAVE STATE ---
        localStorage.setItem('kairo_generated_plan', JSON.stringify(newPlan));
        localStorage.setItem('kairo_last_review', NOW.toString());

        return { status: 'updated', newPlan };

    } catch (e) {
        console.error("Weekly Review Agent Failed:", e);
        return { status: 'error' };
    }
};
