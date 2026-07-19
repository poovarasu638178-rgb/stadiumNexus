"use strict";

// 1. CONSTANTS
"use strict";
// Powered by NVIDIA GenAI (e.g. nvapi-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX)
const CONSTANTS = Object.freeze({
  STADIUM_CAPACITY: 85000,
  UPDATE_INTERVAL_MS: 10000,
  TRANSPORT_UPDATE_MS: 30000,
  MAX_CROWD_CRITICAL: 90,
  MAX_CROWD_HIGH: 75,
  MAX_CROWD_MEDIUM: 50,
  DEBOUNCE_MS: 300,
  API_RATE_LIMIT_MS: 2000,
  ZONES: ['North', 'South', 'East', 'West', 'Concourse A', 'Concourse B'],
  LANGUAGES: ['English', 'Spanish', 'French', 'Arabic', 'Portuguese'],
  CO2_METRO: 0.02,
  CO2_BUS: 0.08,
  CO2_BIKE: 0,
  CO2_CAR: 0.21
});
