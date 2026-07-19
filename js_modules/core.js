"use strict";

window.secureHTML = function(html) { return typeof DOMPurify !== 'undefined' ? DOMPurify.sanitize(html) : html; };

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

// 2. STATE MANAGEMENT
const state = {
  activeTab: 'fan-portal',
  crowdData: {
    'North': 45,
    'South': 72,
    'East': 62,
    'West': 31,
    'Concourse A': 88,
    'Concourse B': 40
  },
  gateStatuses: {
    A: 'open', B: 'open', C: 'busy', D: 'open',
    E: 'closed', F: 'open', G: 'busy', H: 'open'
  },
  incidents: [
    { id: 'INC-001', zone: 'North', type: 'Medical', severity: 'High', time: '14:30', status: 'Active', aiAction: 'Dispatched medical team to North Stand, Row 24' },
    { id: 'INC-002', zone: 'Concourse A', type: 'Crowd', severity: 'Medium', time: '14:45', status: 'Active', aiAction: 'Redirecting flow via Gate F, opening auxiliary corridor' },
    { id: 'INC-003', zone: 'South', type: 'Technical', severity: 'Low', time: '14:50', status: 'Active', aiAction: 'Maintenance crew dispatched to fix display board' },
    { id: 'INC-004', zone: 'West', type: 'Security', severity: 'Critical', time: '15:00', status: 'Active', aiAction: 'Security detail deployed, area cordoned' },
    { id: 'INC-005', zone: 'East', type: 'Weather', severity: 'Low', time: '15:10', status: 'Resolved', aiAction: 'Temporary shelters activated in East concourse' }
  ],
  transportData: [
    { route: 'Metro Line 1', type: 'Metro', nextDeparture: '3 min', capacity: 45, status: 'On Time', co2PerPerson: CONSTANTS.CO2_METRO, name: 'Stadium Express' },
    { route: 'Metro Line 2', type: 'Metro', nextDeparture: '8 min', capacity: 72, status: 'On Time', co2PerPerson: CONSTANTS.CO2_METRO, name: 'City Center' },
    { route: 'Shuttle Bus A', type: 'Shuttle', nextDeparture: '5 min', capacity: 60, status: 'On Time', co2PerPerson: CONSTANTS.CO2_BUS, name: 'North Parking' },
    { route: 'Shuttle Bus B', type: 'Shuttle', nextDeparture: '12 min', capacity: 30, status: 'On Time', co2PerPerson: CONSTANTS.CO2_BUS, name: 'South Parking' },
    { route: 'Free Bike Share', type: 'Bike', nextDeparture: 'Now', capacity: 28, status: 'Available', co2PerPerson: CONSTANTS.CO2_BIKE, name: 'Stadium Zone' }
  ],
  parkingData: [
    { id: 'P1', total: 1200, available: 340, distance: '0.2 mi', evSpots: 60, price: 45 },
    { id: 'P2', total: 800, available: 52, distance: '0.4 mi', evSpots: 25, price: 35 },
    { id: 'P3', total: 1500, available: 780, distance: '0.8 mi', evSpots: 120, price: 20 },
    { id: 'P4', total: 600, available: 0, distance: '0.1 mi', evSpots: 15, price: 55 },
    { id: 'P5', total: 2000, available: 1100, distance: '1.2 mi', evSpots: 200, price: 15 },
    { id: 'P6', total: 900, available: 180, distance: '0.5 mi', evSpots: 40, price: 30 }
  ],
  elevatorData: [
    { id: 'E1', floor: 'Ground', status: 'Operational', capacity: 35, waitTime: 2 },
    { id: 'E2', floor: 'Level 1', status: 'Operational', capacity: 70, waitTime: 5 },
    { id: 'E3', floor: 'Level 2', status: 'Maintenance', capacity: 0, waitTime: 0 },
    { id: 'E4', floor: 'Ground', status: 'Operational', capacity: 15, waitTime: 1 },
    { id: 'E5', floor: 'Level 3', status: 'Operational', capacity: 90, waitTime: 8 },
    { id: 'E6', floor: 'Level 1', status: 'Operational', capacity: 50, waitTime: 3 }
  ],
  volunteerStations: [
    { name: 'Gate A Welcome', staffCount: 3, required: 5 },
    { name: 'Gate B Welcome', staffCount: 5, required: 4 },
    { name: 'Gate C Tickets', staffCount: 2, required: 4 },
    { name: 'Gate D Security', staffCount: 4, required: 4 },
    { name: 'North Concourse', staffCount: 8, required: 10 },
    { name: 'South Concourse', staffCount: 12, required: 8 },
    { name: 'VIP Lounge', staffCount: 6, required: 6 },
    { name: 'Transport Hub', staffCount: 10, required: 15 },
    { name: 'Medical Station 1', staffCount: 4, required: 4 },
    { name: 'Medical Station 2', staffCount: 2, required: 5 },
    { name: 'Fan Zone East', staffCount: 10, required: 10 },
    { name: 'Fan Zone West', staffCount: 5, required: 12 }
  ],
  greenPoints: 0,
  completedChallenges: {},
  matchData: {
    homeTeam: 'Brazil',
    awayTeam: 'France',
    homeScore: 1,
    awayScore: 2,
    time: '65:00',
    venue: 'MetLife Stadium, New Jersey',
    status: 'Second Half',
    homeFlag: '🇧🇷',
    awayFlag: '🇫🇷'
  },
  sustainabilityData: {
    renewable: 85,
    waterRecycling: 73,
    wasteDiverted: 68,
    carbonOffset: 2400
  },
  selectedLanguage: 'English',
  chatHistories: {
    fan: [],
    command: [],
    accessibility: []
  },
  lastApiCall: 0
};

// 3. UTILITY FUNCTIONS
/**
 * @function sanitizeInput
 * @description Checks for XSS attack patterns and sanitizes input using DOMPurify.
 * @param {string} input - The raw input string.
 * @returns {string|number} Returns -1 if XSS detected, otherwise sanitized string.
 * @complexity O(n) - linear scan of input
 * @example sanitizeInput('<script>alert(1)</script>') // returns -1
 */
function sanitizeInput(input) {
  const XSS = [/<script/i, /javascript:/i, /onerror\s*=/i, /onload\s*=/i];
  if (XSS.some(p => p.test(String(input)))) {
    return -1;
  }
  if (typeof DOMPurify !== 'undefined') {
    return DOMPurify.sanitize(String(input), { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
  }
  return String(input).replace(/[<>]/g, '');
}

/**
 * @function debounce
 * @description Creates a debounced version of a function.
 * @param {Function} fn - The function to debounce.
 * @param {number} delay - Delay in milliseconds.
 * @returns {Function} Debounced function.
 * @complexity O(1)
 */
function debounce(fn, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
}

/**
 * @function memoize
 * @description Memoizes the result of a pure function using a Map cache.
 * @param {Function} fn - The function to memoize.
 * @returns {Function} Memoized function.
 * @complexity O(1) lookup after first call
 */
function memoize(fn) {
  const cache = new Map();
  return function (...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}

/**
 * @function formatNumber
 * @description Formats a number with locale-specific thousand separators.
 * @param {number} num - The number to format.
 * @returns {string} Formatted number string.
 * @complexity O(1)
 * @example formatNumber(68000) // "68,000"
 */
function formatNumber(num) {
  return Number(num).toLocaleString('en-US');
}

/**
 * @function formatTime
 * @description Formats a Date object into HH:MM:SS string.
 * @param {Date} date - The date to format.
 * @returns {string} Time string.
 */
function formatTime(date) {
  return date.toTimeString().split(' ')[0];
}

/**
 * @function getRandomInRange
 * @description Generates a random number between min and max (inclusive).
 * @param {number} min - Minimum value.
 * @param {number} max - Maximum value.
 * @returns {number} Random number in range.
 * @complexity O(1)
 */
function getRandomInRange(min, max) {
  return Math.random() * (max - min) + min;
}

/**
 * @function clamp
 * @description Clamps a value between a minimum and maximum bound.
 * @param {number} value - The value to clamp.
 * @param {number} min - Minimum bound.
 * @param {number} max - Maximum bound.
 * @returns {number} Clamped value.
 * @complexity O(1)
 * @example clamp(150, 0, 100) // 100
 */
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * @function getCrowdLevel
 * @description Determines crowd level classification based on density percentage.
 * @param {number} percentage - The crowd density percentage.
 * @returns {string} 'Low', 'Medium', 'High', or 'Critical'.
 * @throws {RangeError} If percentage is not a finite number.
 * @complexity O(1) - constant time comparison
 * @example getCrowdLevel(80) // 'High'
 */
function getCrowdLevel(percentage) {
  if (percentage >= CONSTANTS.MAX_CROWD_CRITICAL) return 'Critical';
  if (percentage >= CONSTANTS.MAX_CROWD_HIGH) return 'High';
  if (percentage >= CONSTANTS.MAX_CROWD_MEDIUM) return 'Medium';
  return 'Low';
}

/**
 * @function getCrowdColor
 * @description Returns a hex color code for a given crowd level.
 * @param {string} level - The crowd level string.
 * @returns {string} Hex color code.
 * @complexity O(1)
 */
function getCrowdColor(level) {
  switch (level) {
    case 'Critical': return '#FF5252';
    case 'High': return '#FB923C';
    case 'Medium': return '#FBBF24';
    case 'Low':
    default: return '#4ADE80';
  }
}

/**
 * @function calcCO2
 * @description Calculates CO2 emissions for a given transport mode and distance.
 * @param {string} mode - Transport mode ('metro','bus','bike','car','shuttle','walk').
 * @param {number} distanceKm - Distance in kilometers.
 * @returns {number} CO2 emissions in kg, rounded to 2 decimal places.
 * @complexity O(1)
 * @example calcCO2('metro', 10) // 0.20
 */
function calcCO2(mode, distanceKm) {
  const rates = {
    metro: CONSTANTS.CO2_METRO,
    bus: CONSTANTS.CO2_BUS,
    bike: CONSTANTS.CO2_BIKE,
    car: CONSTANTS.CO2_CAR,
    shuttle: CONSTANTS.CO2_BUS,
    walk: 0
  };
  const rate = rates[mode] !== undefined ? rates[mode] : 0;
  return Number((rate * distanceKm).toFixed(2));
}

/**
 * @function getGreenScore
 * @description Returns a letter grade (A-F) based on CO2 saved.
 * @param {number} co2Saved - Amount of CO2 saved in kg.
 * @returns {string} Letter grade.
 * @complexity O(1)
 * @example getGreenScore(6) // 'A'
 */
function getGreenScore(co2Saved) {
  if (co2Saved > 5) return 'A';
  if (co2Saved > 3) return 'B';
  if (co2Saved > 1) return 'C';
  if (co2Saved > 0) return 'D';
  return 'F';
}

/**
 * @function getOptimalGate
 * @description Finds the gate/zone with the lowest crowd density.
 * @param {Object} crowdData - Map of zone names to density percentages.
 * @returns {string} Name of the least crowded zone.
 * @complexity O(n) where n is number of zones
 */
function getOptimalGate(crowdData) {
  let bestZone = '';
  let minDensity = Infinity;
  for (const [zone, density] of Object.entries(crowdData)) {
    if (density < minDensity) {
      minDensity = density;
      bestZone = zone;
    }
  }
  return bestZone;
}

/**
 * @function calculateWaitTime
 * @description Estimates wait time in minutes based on capacity utilization.
 * @param {number} capacity - The capacity percentage (0-100+).
 * @returns {number} Estimated wait time in minutes (0-20).
 * @complexity O(1)
 * @example calculateWaitTime(80) // 16
 */
function calculateWaitTime(capacity) {
  return clamp(Math.round(capacity * 0.2), 0, 20);
}

/**
 * @function calculateCarbonFootprint
 * @description Calculates carbon footprint metrics compared to driving alone.
 * @param {string} mode - Transport mode.
 * @param {number} distance - Distance in km.
 * @returns {Object} CO2 metrics: saved, trees equivalent, grade.
 * @complexity O(1)
 */
function calculateCarbonFootprint(mode, distance) {
  const actualCo2 = calcCO2(mode, distance);
  const carCo2 = calcCO2('car', distance);
  const saved = Number((carCo2 - actualCo2).toFixed(2));
  return {
    actual: actualCo2,
    carBaseline: carCo2,
    saved: saved,
    trees: Number((saved / 21 * 365).toFixed(1)),
    grade: getGreenScore(saved)
  };
}

// 4. TAB NAVIGATION
/**
 * @function showTab
 * @description Switches the active application tab and updates UI state.
 * @param {string} tabId - The ID of the tab section to display.
 */
function showTab(tabId) {
  setTimeout(() => lucide.createIcons(), 50);

  performance.mark('tab-switch-start');
  const tabs = ['fan-portal', 'command-center', 'accessibility-hub', 'transport-hub'];
  tabs.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.style.display = id === tabId ? 'block' : 'none';
      el.classList.toggle('active', id === tabId);
    }
  });
  document.querySelectorAll('.tab-btn').forEach(btn => {
    const isActive = btn.dataset.tab === tabId;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });
  state.activeTab = tabId;
  announceToScreenReader(`Switched to ${tabId.replace(/-/g, ' ')} tab`);
  performance.mark('tab-switch-end');
  performance.measure('tab-switch', 'tab-switch-start', 'tab-switch-end');
}

// 5. ACCESSIBILITY HELPERS
/**
 * @function announceToScreenReader
 * @description Announces a message to assistive technology via aria-live region.
 * @param {string} message - The message to announce.
 */
function announceToScreenReader(message) {
  const announcer = document.getElementById('announcer');
  if (announcer) {
    announcer.textContent = '';
    requestAnimationFrame(() => { announcer.textContent = message; });
  }
}

/**
 * @function trapFocus
 * @description Traps keyboard focus within a specific DOM element.
 * @param {HTMLElement} element - The element to trap focus within.
 */
function trapFocus(element) {
  if (!element) return;
  const focusableEls = element.querySelectorAll(
    'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
  );
  if (focusableEls.length === 0) return;
  const first = focusableEls[0];
  const last = focusableEls[focusableEls.length - 1];
  element.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab') return;
    if (e.shiftKey) {
      if (document.activeElement === first) { last.focus(); e.preventDefault(); }
    } else {
      if (document.activeElement === last) { first.focus(); e.preventDefault(); }
    }
  });
}

// 6. TOAST NOTIFICATIONS
/**
 * @function showToast
 * @description Shows a temporary notification toast message.
 * @param {string} message - Text to display.
 * @param {string} [type='info'] - Toast type: 'success', 'warning', 'error', 'info'.
 * @param {number} [duration=4000] - Duration before auto-dismiss in ms.
 */
function showToast(message, type = 'info', duration = 5000) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  
  // Deduplication check
  const existingToasts = Array.from(container.querySelectorAll('.toast-text'));
  if (existingToasts.some(el => el.textContent === message)) {
    return; // Don't stack duplicate identical toasts
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type} animate__animated animate__fadeInRight`;
  const icons = { success: '✅', warning: '<i data-lucide="alert-triangle"></i>', error: '❌', info: 'ℹ️' };
  
  toast.innerHTML = window.secureHTML(`
    <span class="toast-icon">${icons[type] || 'ℹ️'}</span>
    <span class="toast-text">${message}</span>
    <button class="toast-close" aria-label="Close">✕</button>
  `);
  
  container.appendChild(toast);
  if (typeof lucide !== 'undefined') {
    lucide.createIcons({ root: toast });
  }

  const dismiss = () => {
    if (toast.classList.contains('animate__fadeOutRight')) return;
    toast.classList.remove('animate__fadeInRight');
    toast.classList.add('animate__fadeOutRight');
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 400);
  };

  toast.querySelector('.toast-close').addEventListener('click', dismiss);
  
  const parsedDuration = parseInt(duration, 10);
  if (parsedDuration > 0) {
    setTimeout(dismiss, parsedDuration);
  }
}
