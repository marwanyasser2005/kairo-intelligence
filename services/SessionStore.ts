
// Define all keys used across the application for persistence
const APP_STORAGE_KEYS = [
    'kairo_baseline_results',
    'kairo_input_water',
    'kairo_input_food',
    'kairo_report_carbon',
    'kairo_report_water',
    'kairo_report_food',
    'kairo_report_exposure',
    'kairo_report_ewaste',
    'kairo_report_energy',
    'kairo_report_transport',
    'kairo_user_progress',
    'kairo_baseline_profile',
    'kairo_generated_plan',
    'kairo_actions',
    'kairo_last_review',
    'kairo_early_warning',
    'kairo_scenarios',
    'kairo_audience',
    'kairo_energy_temp', 'kairo_energy_hours', 'kairo_energy_loc',
    'kairo_trans_mode', 'kairo_trans_km', 'kairo_trans_loc',
    'kairo_water_faucets', 'kairo_water_toilets', 'kairo_water_hours', 'kairo_water_hh_size',
    'kairo_food_meals', 'kairo_food_cost',
    'kairo_exposure_loc', 'kairo_exposure_coords', 'kairo_exposure_hours', 'kairo_exposure_mode',
    'kairo_ewaste_type', 'kairo_ewaste_model', 'kairo_ewaste_cond', 'kairo_ewaste_details'
];

export interface SessionSnapshot {
    id: string;
    name: string;
    timestamp: number;
    data: Record<string, any>;
    previewMetrics?: {
        financialRisk: number;
        co2Total: number;
    };
}

export const SessionStore = {
    /**
     * Captures the current state of localStorage for all known Kairo keys
     */
    captureSnapshot: (name: string): SessionSnapshot => {
        const data: Record<string, any> = {};
        
        APP_STORAGE_KEYS.forEach(key => {
            const raw = localStorage.getItem(key);
            if (raw) {
                try {
                    data[key] = JSON.parse(raw);
                } catch {
                    data[key] = raw;
                }
            }
        });

        // Calculate preview metrics for the session list UI
        const waterReport = data['kairo_report_water'];
        const foodReport = data['kairo_report_food'];
        const energyReport = data['kairo_report_energy'];
        const transportReport = data['kairo_report_transport'];
        const carbonReport = data['kairo_report_carbon'];
        const financialRisk =
            (waterReport?.metrics?.financial_loss_estimate_egp || 0) +
            (foodReport?.metrics?.monthly_waste_cost || 0) +
            (energyReport?.metrics?.financial_loss_estimate_egp || 0);
        const co2Total =
            (carbonReport?.baseline?.monthly_total_kg_co2 || 0) +
            (energyReport?.metrics?.carbon_footprint_kg || 0) +
            (transportReport?.metrics?.monthly_carbon_kg || 0) +
            (foodReport?.metrics?.carbon_footprint_kg || 0);

        return {
            id: Math.random().toString(36).substr(2, 9),
            name: name || `Session ${new Date().toLocaleDateString()}`,
            timestamp: Date.now(),
            data,
            previewMetrics: { financialRisk, co2Total }
        };
    },

    /**
     * Saves a snapshot to the list of saved sessions
     */
    saveSession: (name: string) => {
        const snapshot = SessionStore.captureSnapshot(name);
        const sessions: SessionSnapshot[] = JSON.parse(localStorage.getItem('kairo_saved_sessions') || '[]');
        sessions.unshift(snapshot); // Add to top
        localStorage.setItem('kairo_saved_sessions', JSON.stringify(sessions));
        return snapshot;
    },

    /**
     * Loads a session state back into localStorage (requires page reload to take effect fully in React state)
     */
    loadSession: (sessionId: string) => {
        const sessions: SessionSnapshot[] = JSON.parse(localStorage.getItem('kairo_saved_sessions') || '[]');
        const session = sessions.find(s => s.id === sessionId);
        
        if (session) {
            // clear current state first to avoid stale keys
            APP_STORAGE_KEYS.forEach(key => localStorage.removeItem(key));
            
            // restore keys
            Object.entries(session.data).forEach(([key, value]) => {
                localStorage.setItem(key, JSON.stringify(value));
            });
            return true;
        }
        return false;
    },

    getSessions: (): SessionSnapshot[] => {
        return JSON.parse(localStorage.getItem('kairo_saved_sessions') || '[]');
    },

    deleteSession: (sessionId: string) => {
        const sessions: SessionSnapshot[] = JSON.parse(localStorage.getItem('kairo_saved_sessions') || '[]');
        const updated = sessions.filter(s => s.id !== sessionId);
        localStorage.setItem('kairo_saved_sessions', JSON.stringify(updated));
        return updated;
    },

    clearCurrentState: () => {
        APP_STORAGE_KEYS.forEach(key => localStorage.removeItem(key));
    }
};
