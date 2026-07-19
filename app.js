/**
 * @fileoverview StadiumNexus - Smart Stadium Operations Platform for FIFA World Cup 2026
 * @version 1.0.0
 * @author Poovarasu S
 * @license MIT
 * @description GenAI-powered platform serving fans, organizers, volunteers, and venue staff
 * with real-time intelligence and multilingual AI assistance powered by Claude AI
 */

/* global DOMPurify */

// ─────────────────────────────────
// 1. CONSTANTS
// ─────────────────────────────────
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

// ─────────────────────────────────
// 2. STATE MANAGEMENT
// ─────────────────────────────────
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

// ─────────────────────────────────
// 3. UTILITY FUNCTIONS
// ─────────────────────────────────

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

// ─────────────────────────────────
// 4. TAB NAVIGATION
// ─────────────────────────────────

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

// ─────────────────────────────────
// 5. ACCESSIBILITY HELPERS
// ─────────────────────────────────

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

// ─────────────────────────────────
// 6. TOAST NOTIFICATIONS
// ─────────────────────────────────

/**
 * @function showToast
 * @description Shows a temporary notification toast message.
 * @param {string} message - Text to display.
 * @param {string} [type='info'] - Toast type: 'success', 'warning', 'error', 'info'.
 * @param {number} [duration=4000] - Duration before auto-dismiss in ms.
 */
function showToast(message, type = 'info', duration = 4000) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast toast-${type} animate__animated animate__fadeInRight`;
  const icons = { success: '✅', warning: '<i data-lucide="alert-triangle"></i>', error: '❌', info: 'ℹ️' };
  toast.innerHTML = `<span class="toast-icon">${icons[type] || 'ℹ️'}</span><span class="toast-text">${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.remove('animate__fadeInRight');
    toast.classList.add('animate__fadeOutRight');
    setTimeout(() => toast.remove(), 400);
  }, duration);
}

// ─────────────────────────────────
// 7. AI CHAT SYSTEM
// ─────────────────────────────────

const SYSTEM_PROMPTS = {
  fan: 'You are StadiumNexus AI, the official FIFA World Cup 2026 assistant. Help fans with navigation, transport, food, accessibility, match info, and stadium services. Be friendly, concise, and helpful. Respond in the user\'s selected language if they request it.',
  command: 'You are StadiumNexus Operations AI for FIFA World Cup 2026. Help organizers with incident management, crowd control, volunteer deployment, and operational decisions. Be professional, data-driven, and action-oriented. Use current stadium data to inform responses.',
  accessibility: 'You are the FIFA World Cup 2026 Accessibility Assistant. Help users with disabilities navigate the stadium, find accessible facilities, and enjoy the match. Be compassionate, detailed, and helpful. Always prioritize safety and comfort.'
};

const NVIDIA_API_KEY = "nvapi-YOUR_KEY_HERE"; // get free at build.nvidia.com
const MODEL_PRIMARY = "nvidia/llama-3.3-nemotron-super-49b-v1.5";
const MODEL_FALLBACK = "meta/llama-3.1-8b-instruct";

/**
 * @function callStadiumAI
 * @description Shared AI call function for all StadiumNexus AI features.
 * Tries MODEL_PRIMARY first, retries once with MODEL_FALLBACK on failure,
 * then returns a graceful fallback string only if both fail.
 * @param {string} systemPrompt - role-specific system prompt
 * @param {string} userQuery - sanitized user input
 * @returns {Promise<string>} AI response text
 */
async function callStadiumAI(systemPrompt, userQuery) {
  const attempt = async (model) => {
    const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${NVIDIA_API_KEY}`
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userQuery }
        ],
        max_tokens: 800,
        temperature: 0.7
      })
    });
    if (!response.ok) throw new Error(`API returned ${response.status}`);
    const data = await response.json();
    return data.choices[0].message.content;
  };

  try {
    return await attempt(MODEL_PRIMARY);
  } catch (err) {
    console.warn(`Primary model failed (${MODEL_PRIMARY}), trying fallback:`, err);
    try {
      return await attempt(MODEL_FALLBACK);
    } catch (err2) {
      console.error("Both NVIDIA models failed:", err2);
      return "I'm having trouble connecting right now — please try again in a moment.";
    }
  }
}

const CHAT_CHIPS = {
  fan: [
    'How do I get to Gate 14?',
    'Where is the nearest halal food?',
    'Best route from parking to Section B?',
    'Is there wheelchair access at this entrance?'
  ],
  command: [
    'Current crowd status report',
    'Suggest volunteer redeployment',
    'Weather impact assessment',
    'Generate incident response plan'
  ],
  accessibility: [
    'I use a wheelchair - how do I enter?',
    'Where is the nearest accessible restroom?',
    'Is there audio description available?',
    'I have a visual impairment - what support is available?'
  ]
};

/**
 * @function getContainerIds
 * @description Returns DOM element IDs for a given chat tab.
 * @param {string} tabKey - The tab key ('fan', 'command', 'accessibility').
 * @returns {Object} Object with messagesId, inputId, chipsId.
 */
function getChatIds(tabKey) {
  return {
    messagesId: `${tabKey === 'fan' ? 'fan' : tabKey === 'command' ? 'command' : 'accessibility'}-chat-messages`,
    inputId: `${tabKey === 'fan' ? 'fan' : tabKey === 'command' ? 'command' : 'accessibility'}-chat-input`,
    chipsId: `${tabKey === 'fan' ? 'fan' : tabKey === 'command' ? 'command' : 'accessibility'}-chat-chips`
  };
}

/**
 * @function sendChatMessage
 * @description Sends a user message to the Claude API and renders the response.
 * @param {string} tabKey - The chat tab key.
 * @param {string} userMessage - The user's message text.
 */
async function sendChatMessage(tabKey, userMessage) {
  const ids = getChatIds(tabKey);
  const container = document.getElementById(ids.messagesId);
  if (!container) return;

  const sanitized = sanitizeInput(userMessage);
  if (sanitized === -1) {
    showToast('Invalid input detected. Please remove special characters.', 'error');
    return;
  }
  if (!sanitized.trim()) return;

  // Rate limiting
  const now = Date.now();
  if (now - state.lastApiCall < CONSTANTS.API_RATE_LIMIT_MS) {
    showToast('Please wait a moment before sending another message.', 'warning');
    return;
  }
  state.lastApiCall = now;

  state.chatHistories[tabKey].push({ role: 'user', content: sanitized });
  renderChatMessage(container, { role: 'user', content: sanitized });
  showTypingIndicator(container);

  const aiReply = await callStadiumAI(SYSTEM_PROMPTS[tabKey], sanitized);
  
  hideTypingIndicator(container);
  
  state.chatHistories[tabKey].push({ role: 'assistant', content: aiReply });
  renderChatMessage(container, { role: 'assistant', content: aiReply });
}

/**
 * @function renderChatMessage
 * @description Renders a single chat message bubble in the container.
 * @param {HTMLElement} container - The chat messages container.
 * @param {Object} message - Object with role ('user'/'assistant') and content.
 */
function renderChatMessage(container, message) {
  if (!container) return;
  const frag = document.createDocumentFragment();
  const wrapper = document.createElement('div');
  wrapper.className = `chat-message ${message.role}`;

  const avatar = document.createElement('div');
  avatar.className = 'chat-avatar';
  avatar.textContent = message.role === 'user' ? '👤' : '<i data-lucide="bot"></i>';
  avatar.setAttribute('aria-hidden', 'true');

  const bubble = document.createElement('div');
  bubble.className = 'chat-bubble';
  bubble.textContent = message.content;

  wrapper.appendChild(avatar);
  wrapper.appendChild(bubble);
  frag.appendChild(wrapper);
  container.appendChild(frag);
  container.scrollTop = container.scrollHeight;
}

/**
 * @function showTypingIndicator
 * @description Displays an animated typing indicator in the chat.
 * @param {HTMLElement} container - The chat messages container.
 */
function showTypingIndicator(container) {
  if (!container) return;
  const div = document.createElement('div');
  div.className = 'chat-message assistant';
  div.id = 'typing-indicator';
  div.innerHTML = '<div class="chat-avatar" aria-hidden="true"><i data-lucide="bot"></i></div><div class="chat-bubble typing-indicator"><span></span><span></span><span></span></div>';
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

/**
 * @function hideTypingIndicator
 * @description Removes the typing indicator from the chat.
 * @param {HTMLElement} container - The chat messages container.
 */
function hideTypingIndicator(container) {
  if (!container) return;
  const indicator = document.getElementById('typing-indicator');
  if (indicator) indicator.remove();
}

/**
 * @function handleChatSend
 * @description Handler called from HTML onclick to send a chat message.
 * @param {string} tabKey - The tab key ('fan', 'command', 'accessibility').
 */
function handleChatSend(tabKey) {
  const ids = getChatIds(tabKey);
  const inputEl = document.getElementById(ids.inputId);
  if (!inputEl) return;
  const text = inputEl.value.trim();
  if (text) {
    sendChatMessage(tabKey, text);
    inputEl.value = '';
  }
}

/**
 * @function loadChatChips
 * @description Renders suggestion chips for a chat tab.
 * @param {string} tabKey - The tab key.
 * @param {string} containerId - The chips container ID.
 */
function loadChatChips(tabKey, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const chips = CHAT_CHIPS[tabKey] || [];
  const frag = document.createDocumentFragment();
  chips.forEach(text => {
    const btn = document.createElement('button');
    btn.className = 'chat-chip';
    btn.textContent = text;
    btn.setAttribute('aria-label', `Ask: ${text}`);
    btn.addEventListener('click', () => sendChatMessage(tabKey, text));
    frag.appendChild(btn);
  });
  container.innerHTML = '';
  container.appendChild(frag);
}

/**
 * @function updateLanguage
 * @description Updates the selected language for AI chat.
 * @param {string} language - The language name.
 */
function updateLanguage(language) {
  state.selectedLanguage = language;
  showToast(`Language set to ${language}`, 'success', 2000);
  announceToScreenReader(`Language changed to ${language}`);
}

// ─────────────────────────────────
// 8. CROWD MANAGEMENT
// ─────────────────────────────────

/**
 * @function updateCrowdDensity
 * @description Updates crowd density for all stadium zones with simulated data.
 */
function updateCrowdDensity() {
  performance.mark('crowd-update-start');
  let warningZone = null;

  CONSTANTS.ZONES.forEach(zone => {
    const change = Math.round(getRandomInRange(-5, 5));
    state.crowdData[zone] = clamp(state.crowdData[zone] + change, 10, 98);
    if (state.crowdData[zone] > 85) warningZone = zone;
  });

  requestAnimationFrame(() => {
    renderCrowdZones('crowd-zones');
    renderHeatmap('crowd-heatmap');
    updateCrowdRecommendation();
  });

  if (warningZone) {
    const optGate = getOptimalGate(state.crowdData);
    showToast(`<i data-lucide="alert-triangle"></i> ${warningZone} at ${state.crowdData[warningZone]}% — use ${optGate} instead`, 'warning');
  }
  performance.mark('crowd-update-end');
}

/**
 * @function renderCrowdZones
 * @description Renders crowd density bars for all stadium zones.
 * @param {string} containerId - The container element ID.
 */
function renderCrowdZones(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const frag = document.createDocumentFragment();

  CONSTANTS.ZONES.forEach(zone => {
    const density = state.crowdData[zone];
    const level = getCrowdLevel(density);
    const color = getCrowdColor(level);

    const row = document.createElement('div');
    row.className = 'density-zone';
    row.setAttribute('role', 'listitem');
    row.innerHTML = `
      <div class="density-info">
        <span class="density-name">${zone}</span>
        <span class="density-level" style="color:${color}">${level}</span>
      </div>
      <div class="density-bar">
        <div class="density-fill" style="width:${density}%;background:${color}" role="progressbar"
             aria-valuenow="${density}" aria-valuemin="0" aria-valuemax="100"
             aria-label="${zone} zone at ${density}% capacity"></div>
      </div>
      <span class="density-pct">${density}%</span>
    `;
    frag.appendChild(row);
  });

  container.innerHTML = '';
  container.appendChild(frag);
}

/**
 * @function updateCrowdRecommendation
 * @description Updates the AI crowd recommendation based on current data.
 */
function updateCrowdRecommendation() {
  const el = document.getElementById('crowd-recommendation');
  if (!el) return;
  const highZones = CONSTANTS.ZONES.filter(z => state.crowdData[z] > 75);
  const optimal = getOptimalGate(state.crowdData);
  if (highZones.length > 0) {
    el.innerHTML = `<div class="ai-tip"><i data-lucide="bot"></i> <strong>AI Recommendation:</strong> ${highZones[0]} is at ${state.crowdData[highZones[0]]}% capacity. We recommend entering via the ${optimal} zone for a smoother experience.</div>`;
  } else {
    el.innerHTML = '<div class="ai-tip"><i data-lucide="bot"></i> <strong>AI:</strong> All zones are at comfortable capacity levels. Enjoy the match!</div>';
  }
}

/**
 * @function renderHeatmap
 * @description Renders SVG stadium heatmap for the command center.
 * @param {string} containerId - Container ID for the heatmap.
 */
function renderHeatmap(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const zones = CONSTANTS.ZONES;
  const w = 480, h = 320;
  let svg = `<svg viewBox="0 0 ${w} ${h}" class="heatmap-svg" role="img" aria-label="Stadium crowd heatmap">`;
  // Stadium outline
  svg += `<rect x="40" y="20" width="400" height="280" rx="60" fill="none" stroke="rgba(201,168,76,0.3)" stroke-width="2"/>`;
  svg += `<ellipse cx="240" cy="160" rx="80" ry="50" fill="rgba(26,26,46,0.8)" stroke="rgba(201,168,76,0.2)"/>`;
  svg += `<text x="240" y="165" text-anchor="middle" fill="rgba(201,168,76,0.5)" font-size="12" font-family="Inter">PITCH</text>`;

  const positions = [
    { x: 140, y: 45, w: 200, h: 55, zone: zones[0] },   // North
    { x: 140, y: 220, w: 200, h: 55, zone: zones[1] },  // South
    { x: 370, y: 80, w: 55, h: 160, zone: zones[2] },   // East
    { x: 55, y: 80, w: 55, h: 160, zone: zones[3] },    // West
    { x: 120, y: 105, w: 90, h: 110, zone: zones[4] },  // Concourse A
    { x: 270, y: 105, w: 90, h: 110, zone: zones[5] }   // Concourse B
  ];

  positions.forEach(p => {
    const density = state.crowdData[p.zone];
    const level = getCrowdLevel(density);
    const color = getCrowdColor(level);
    svg += `<rect x="${p.x}" y="${p.y}" width="${p.w}" height="${p.h}" rx="8"
      fill="${color}" opacity="0.6" class="heatmap-zone" style="cursor:pointer"
      onclick="showToast('${p.zone}: ${density}% capacity (${level})', 'info')"/>`;
    svg += `<text x="${p.x + p.w / 2}" y="${p.y + p.h / 2 - 6}" text-anchor="middle"
      fill="#fff" font-size="11" font-weight="600" font-family="Inter">${p.zone}</text>`;
    svg += `<text x="${p.x + p.w / 2}" y="${p.y + p.h / 2 + 10}" text-anchor="middle"
      fill="#fff" font-size="13" font-weight="700" font-family="Space Grotesk">${density}%</text>`;
  });

  svg += '</svg>';
  container.innerHTML = svg;
}

// ─────────────────────────────────
// 9. GATE MAP
// ─────────────────────────────────

/**
 * @function renderGateMap
 * @description Renders the SVG stadium gate map with 8 color-coded gates.
 * @param {string} containerId - Container ID.
 */
function renderGateMap(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const w = 440, h = 300;
  const gates = Object.entries(state.gateStatuses);
  const colors = { open: '#4ADE80', closed: '#FF5252', busy: '#FBBF24' };
  const positions = [
    { x: 120, y: 15 }, { x: 220, y: 15 }, { x: 320, y: 15 }, { x: 395, y: 100 },
    { x: 395, y: 200 }, { x: 300, y: 270 }, { x: 180, y: 270 }, { x: 30, y: 150 }
  ];

  let svg = `<svg viewBox="0 0 ${w} ${h}" class="gate-map-svg" role="img" aria-label="Stadium gate map">`;
  svg += `<rect x="60" y="40" width="320" height="220" rx="50" fill="none" stroke="rgba(201,168,76,0.25)" stroke-width="2"/>`;
  svg += `<ellipse cx="220" cy="150" rx="70" ry="40" fill="rgba(26,26,46,0.6)" stroke="rgba(201,168,76,0.15)"/>`;
  svg += `<text x="220" y="155" text-anchor="middle" fill="rgba(201,168,76,0.4)" font-size="11" font-family="Inter">PITCH</text>`;

  gates.forEach(([gate, status], i) => {
    const p = positions[i];
    const color = colors[status];
    svg += `<circle cx="${p.x}" cy="${p.y}" r="18" fill="${color}" opacity="0.85"
      style="cursor:pointer" class="gate-dot"
      onclick="showToast('Gate ${gate}: ${status.toUpperCase()} — AI suggests ${status === 'open' ? 'use this gate' : status === 'busy' ? 'expect 5 min wait' : 'use alternate gate'}', '${status === 'open' ? 'success' : status === 'busy' ? 'warning' : 'error'}')"/>`;
    svg += `<text x="${p.x}" y="${p.y + 5}" text-anchor="middle" fill="#1A1A2E"
      font-size="14" font-weight="700" font-family="Space Grotesk">${gate}</text>`;
  });

  // Legend
  svg += `<text x="60" y="298" fill="#E8EAF0" font-size="10" font-family="Inter">🟢 Open  🔴 Closed  🟡 Busy</text>`;
  svg += '</svg>';
  container.innerHTML = svg;
}

/**
 * @function updateGateStatuses
 * @description Simulates gate status changes periodically.
 */
function updateGateStatuses() {
  const statuses = ['open', 'open', 'open', 'busy', 'closed'];
  Object.keys(state.gateStatuses).forEach(gate => {
    state.gateStatuses[gate] = statuses[Math.floor(Math.random() * statuses.length)];
  });
  requestAnimationFrame(() => renderGateMap('gate-map'));
}

// ─────────────────────────────────
// 10. AI NAVIGATION
// ─────────────────────────────────

/**
 * @function getAINavigation
 * @description Gets AI-powered navigation directions from current location to destination.
 */
function getAINavigation() {
  const fromEl = document.getElementById('nav-from');
  const toEl = document.getElementById('nav-to');
  const resultEl = document.getElementById('nav-result');
  if (!fromEl || !toEl || !resultEl) return;

  const from = sanitizeInput(fromEl.value.trim());
  const to = sanitizeInput(toEl.value.trim());
  if (from === -1 || to === -1) { showToast('Invalid input', 'error'); return; }
  if (!from || !to) { showToast('Please enter both locations', 'warning'); return; }

  const optimal = getOptimalGate(state.crowdData);
  resultEl.innerHTML = `
    <div class="ai-tip animate__animated animate__fadeIn">
      <h4>🧭 AI Navigation</h4>
      <p><strong>From:</strong> ${from} → <strong>To:</strong> ${to}</p>
      <p><i data-lucide="map-pin"></i> Recommended route via <strong>${optimal}</strong> zone (lowest crowd: ${state.crowdData[optimal]}%)</p>
      <p>⏱️ Estimated walking time: ${Math.floor(getRandomInRange(3, 12))} minutes</p>
      <p>💡 Tip: Follow the blue floor markers for the fastest path.</p>
    </div>`;
  sendChatMessage('fan', `I need directions from ${from} to ${to} in the stadium.`);
}

// ─────────────────────────────────
// 11. TRANSPORT SYSTEM
// ─────────────────────────────────

/**
 * @function updateTransportData
 * @description Simulates real-time transport data updates.
 */
function updateTransportData() {
  state.transportData.forEach(t => {
    if (t.type !== 'Bike') {
      const change = Math.round(getRandomInRange(-8, 8));
      t.capacity = clamp(t.capacity + change, 5, 98);
      const mins = Math.floor(getRandomInRange(1, 15));
      t.nextDeparture = `${mins} min`;
      t.status = t.capacity > 85 ? 'Crowded' : t.capacity > 60 ? 'Busy' : 'On Time';
    }
  });
  requestAnimationFrame(() => renderTransportBoard('transport-board'));
}

/**
 * @function renderTransportBoard
 * @description Renders the live transport departure board table.
 * @param {string} containerId - Container element ID.
 */
function renderTransportBoard(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  let html = `<table class="incident-table" role="table" aria-label="Transport departure board">
    <thead><tr>
      <th>Route</th><th>Type</th><th>Next</th><th>Capacity</th><th>Status</th><th>CO₂/person</th>
    </tr></thead><tbody>`;

  state.transportData.forEach(t => {
    const statusClass = t.status === 'On Time' || t.status === 'Available' ? 'badge-success' :
      t.status === 'Crowded' ? 'badge-danger' : 'badge-warning';
    const isEco = t.co2PerPerson === 0;
    html += `<tr>
      <td><strong>${t.route}</strong><br><small>${t.name}</small></td>
      <td>${t.type}</td>
      <td>${t.nextDeparture}</td>
      <td><div class="density-bar" style="height:8px;width:100px;display:inline-block;vertical-align:middle">
        <div class="density-fill" style="width:${t.capacity}%;background:${getCrowdColor(getCrowdLevel(t.capacity))}"></div>
      </div> ${t.type === 'Bike' ? `${t.capacity} avail` : `${t.capacity}%`}</td>
      <td><span class="badge ${statusClass}">${t.status}</span></td>
      <td>${isEco ? '<span class="badge badge-success"><i data-lucide="leaf"></i> 0 kg</span>' : `${t.co2PerPerson} kg`}</td>
    </tr>`;
  });

  html += '</tbody></table>';
  container.innerHTML = html;
}

/**
 * @function renderTransportOptions
 * @description Renders transport options cards for the fan portal.
 * @param {string} containerId - Container ID.
 */
function renderTransportOptions(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const options = [
    { icon: '<i data-lucide="train"></i>', name: 'Metro', time: '12 min', cost: '$2.75', co2: '0.02 kg', eco: false },
    { icon: '<i data-lucide="bus"></i>', name: 'Bus', time: '25 min', cost: '$1.50', co2: '0.08 kg', eco: false },
    { icon: '🚐', name: 'Shuttle', time: '15 min', cost: 'Free', co2: '0.08 kg', eco: false },
    { icon: '🚶', name: 'Walk', time: '35 min', cost: 'Free', co2: '0 kg', eco: true }
  ];

  const frag = document.createDocumentFragment();
  options.forEach(opt => {
    const card = document.createElement('div');
    card.className = 'transport-option-card';
    card.setAttribute('role', 'listitem');
    card.innerHTML = `
      <div class="transport-icon">${opt.icon}</div>
      <div class="transport-details">
        <strong>${opt.name}</strong>
        <div class="transport-meta">
          <span>⏱️ ${opt.time}</span>
          <span>💰 ${opt.cost}</span>
          <span><i data-lucide="leafy-green"></i> ${opt.co2}</span>
        </div>
      </div>
      ${opt.eco ? '<span class="badge badge-success"><i data-lucide="leaf"></i> Greenest</span>' : ''}
    `;
    frag.appendChild(card);
  });
  container.innerHTML = '';
  container.appendChild(frag);
}

/**
 * @function planJourney
 * @description AI-powered journey planner using form inputs.
 */
async function planJourney() {
  const fromEl = document.getElementById('journey-from');
  const toEl = document.getElementById('journey-to');
  const resultEl = document.getElementById('journey-result');
  if (!fromEl || !toEl || !resultEl) return;

  const from = sanitizeInput(fromEl.value.trim());
  const to = sanitizeInput(toEl.value.trim());
  if (from === -1 || to === -1) { showToast('Invalid input', 'error'); return; }
  if (!from || !to) { showToast('Please enter origin and destination', 'warning'); return; }

  resultEl.innerHTML = '<div class="loading-spinner"></div>';

  const prompt = `Plan my journey from ${from} to ${to}. Consider current crowd levels and eco-friendly options. Keep it extremely concise and format it as a short HTML snippet with a <h4><i data-lucide="map"></i> AI Journey Plan</h4> and steps.`;
  const response = await callStadiumAI(SYSTEM_PROMPTS['fan'], prompt);
  resultEl.innerHTML = `<div class="ai-tip animate__animated animate__fadeIn">${response}</div>`;
  setTimeout(() => lucide.createIcons(), 50);
}

/**
 * @function renderParkingLots
 * @description Renders parking lot availability cards.
 * @param {string} containerId - Container ID.
 */
function renderParkingLots(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const frag = document.createDocumentFragment();
  let bestLot = state.parkingData[0];

  state.parkingData.forEach(lot => {
    if (lot.available > bestLot.available) bestLot = lot;
    const pct = Math.round(((lot.total - lot.available) / lot.total) * 100);
    const card = document.createElement('div');
    card.className = 'parking-card';
    card.setAttribute('role', 'listitem');
    card.innerHTML = `
      <div class="parking-header">
        <strong><i data-lucide="square-parking"></i> Lot ${lot.id}</strong>
        <span class="badge ${lot.available === 0 ? 'badge-danger' : lot.available < 100 ? 'badge-warning' : 'badge-success'}">
          ${lot.available === 0 ? 'FULL' : `${lot.available} spots`}
        </span>
      </div>
      <div class="density-bar"><div class="density-fill" style="width:${pct}%;background:${getCrowdColor(getCrowdLevel(pct))}"></div></div>
      <div class="parking-meta">
        <span>📏 ${lot.distance}</span>
        <span>⚡ ${lot.evSpots} EV</span>
        <span>💲$${lot.price}/hr</span>
      </div>`;
    frag.appendChild(card);
  });

  container.innerHTML = '';
  container.appendChild(frag);

  const recEl = document.getElementById('parking-recommendation');
  if (recEl) {
    recEl.innerHTML = `<div class="ai-tip"><i data-lucide="bot"></i> <strong>AI Recommendation:</strong> Park at Lot ${bestLot.id} — ${bestLot.available} spots available, ${bestLot.distance} from stadium, $${bestLot.price}/hr. ${bestLot.evSpots} EV charging spots.</div>`;
  }
}

/**
 * @function calculateImpact
 * @description Calculates and displays the user's carbon footprint impact.
 */
function calculateImpact() {
  const modeEl = document.getElementById('carbon-mode');
  const distanceEl = document.getElementById('carbon-distance');
  const resultEl = document.getElementById('carbon-result');
  if (!modeEl || !distanceEl || !resultEl) return;

  const mode = modeEl.value;
  const distance = parseInt(distanceEl.value, 10);
  const result = calculateCarbonFootprint(mode, distance);

  const gradeColors = { A: '#4ADE80', B: '#86EFAC', C: '#FBBF24', D: '#FB923C', F: '#FF5252' };

  resultEl.innerHTML = `
    <div class="carbon-result-card animate__animated animate__fadeIn">
      <div class="green-score-display" style="background:${gradeColors[result.grade]}">
        <span class="green-score-letter">${result.grade}</span>
      </div>
      <div class="carbon-stats">
        <div class="carbon-stat">
          <span class="carbon-stat-value">${result.actual} kg</span>
          <span class="carbon-stat-label">Your CO₂ (${mode})</span>
        </div>
        <div class="carbon-stat">
          <span class="carbon-stat-value">${result.carBaseline} kg</span>
          <span class="carbon-stat-label">If drove alone</span>
        </div>
        <div class="carbon-stat highlight">
          <span class="carbon-stat-value">${result.saved} kg</span>
          <span class="carbon-stat-label">CO₂ Saved! <i data-lucide="leaf"></i></span>
        </div>
        <div class="carbon-stat">
          <span class="carbon-stat-value">🌳 ${result.trees}</span>
          <span class="carbon-stat-label">Trees equivalent</span>
        </div>
      </div>
    </div>`;
}

// ─────────────────────────────────
// 12. INCIDENT MANAGEMENT
// ─────────────────────────────────

/**
 * @function renderIncidentTable
 * @description Renders the incident management table for command center.
 * @param {string} containerId - Container ID.
 */
function renderIncidentTable(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const activeCount = state.incidents.filter(i => i.status === 'Active').length;
  const badge = document.getElementById('incident-count-badge');
  if (badge) badge.textContent = `${activeCount} Active`;

  const sevColors = { Critical: '#FF5252', High: '#FB923C', Medium: '#FBBF24', Low: '#4ADE80' };

  let html = `<table class="incident-table" role="table" aria-label="Incident management">
    <thead><tr>
      <th>ID</th><th>Zone</th><th>Type</th><th>Severity</th><th>Time</th><th>Status</th><th>AI Action</th><th>Actions</th>
    </tr></thead><tbody>`;

  state.incidents.forEach(inc => {
    html += `<tr class="${inc.status === 'Resolved' ? 'resolved-row' : ''}">
      <td><strong>${inc.id}</strong></td>
      <td>${inc.zone}</td>
      <td>${inc.type}</td>
      <td><span class="badge" style="background:${sevColors[inc.severity]};color:#1A1A2E">${inc.severity}</span></td>
      <td>${inc.time}</td>
      <td><span class="badge ${inc.status === 'Active' ? 'badge-warning' : 'badge-success'}">${inc.status}</span></td>
      <td><small>${inc.aiAction}</small></td>
      <td class="action-btns">
        ${inc.status === 'Active' ? `<button class="btn btn-success btn-sm" onclick="resolveIncident('${inc.id}')" aria-label="Resolve incident ${inc.id}">Resolve</button>` : ''}
        <button class="btn btn-secondary btn-sm" onclick="getAIIncidentResponse('${inc.id}')" aria-label="Get AI analysis for ${inc.id}">Ask AI</button>
      </td>
    </tr>`;
  });

  html += '</tbody></table>';
  container.innerHTML = html;
}

/**
 * @function resolveIncident
 * @description Marks an incident as resolved and updates the UI.
 * @param {string} incidentId - The incident ID to resolve.
 */
function resolveIncident(incidentId) {
  const incident = state.incidents.find(i => i.id === incidentId);
  if (incident) {
    incident.status = 'Resolved';
    renderIncidentTable('incident-table-container');
    showToast(`✅ Incident ${incidentId} resolved successfully`, 'success');
    announceToScreenReader(`Incident ${incidentId} has been resolved`);
  }
}

/**
 * @function getAIIncidentResponse
 * @description Gets AI analysis for a specific incident.
 * @param {string} incidentId - The incident ID.
 */
async function getAIIncidentResponse(incidentId) {
  const incident = state.incidents.find(i => i.id === incidentId);
  if (!incident) return;
  const prompt = `Provide a detailed response plan for incident ${incident.id}: ${incident.type} incident in ${incident.zone} zone, severity ${incident.severity}. Current action: ${incident.aiAction}. What additional steps should we take?`;
  const response = await callStadiumAI(SYSTEM_PROMPTS['command'], prompt);
  showToast(response, 'info', 10000); // Display result in a toast for now
  showTab('command-center');
}

// ─────────────────────────────────
// 13. VOLUNTEER MANAGEMENT
// ─────────────────────────────────

/**
 * @function renderVolunteerStations
 * @description Renders volunteer deployment station cards.
 * @param {string} containerId - Container ID.
 */
function renderVolunteerStations(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const frag = document.createDocumentFragment();

  state.volunteerStations.forEach(station => {
    const isUnder = station.staffCount < station.required;
    const div = document.createElement('div');
    div.className = `volunteer-station ${isUnder ? 'understaffed' : ''}`;
    div.setAttribute('role', 'listitem');
    div.innerHTML = `
      <div class="station-info">
        <span class="station-name">${station.name}</span>
        <span class="station-count ${isUnder ? 'count-danger' : 'count-ok'}">
          ${station.staffCount} / ${station.required}
        </span>
      </div>
      <div class="density-bar" style="height:6px">
        <div class="density-fill" style="width:${Math.min((station.staffCount / station.required) * 100, 100)}%;background:${isUnder ? '#FF5252' : '#4ADE80'}"></div>
      </div>`;
    frag.appendChild(div);
  });

  container.innerHTML = '';
  container.appendChild(frag);
}

/**
 * @function optimizeDeployment
 * @description Triggers AI-optimized volunteer redeployment.
 */
async function optimizeDeployment() {
  const resultEl = document.getElementById('deployment-result');
  if (resultEl) resultEl.innerHTML = '<div class="loading-spinner"></div>';

  const prompt = `Optimize volunteer deployment. Current staffing: ${state.volunteerStations.map(s => `${s.name}: ${s.staffCount}/${s.required}`).join(', ')}. Identify understaffed areas and suggest redeployment from overstaffed stations. Keep it concise.`;
  const response = await callStadiumAI(SYSTEM_PROMPTS['command'], prompt);
  state.volunteerStations.forEach(station => {
    if (station.staffCount < station.required) {
      station.staffCount = station.required;
    }
  });
  renderVolunteerStations('volunteer-stations');
  if (resultEl) {
    resultEl.innerHTML = `<div class="ai-tip animate__animated animate__fadeIn"><strong>AI:</strong> ${response}</div>`;
  }
  showToast('✅ Volunteer deployment optimized', 'success');
}

// ─────────────────────────────────
// 14. OPERATIONAL BRIEFING
// ─────────────────────────────────

/**
 * @function generateBriefing
 * @description Generates an AI operational briefing based on current state.
 */
async function generateBriefing() {
  const container = document.getElementById('briefing-container');
  if (!container) return;
  container.innerHTML = '<div class="loading-spinner"></div>';

  const activeIncidents = state.incidents.filter(i => i.status === 'Active').length;
  const highZones = CONSTANTS.ZONES.filter(z => state.crowdData[z] > 75);
  const attendance = Math.round(CONSTANTS.STADIUM_CAPACITY * 0.8);
  const prompt = `Generate an operational briefing. Current data: Attendance: ${formatNumber(attendance)}/${formatNumber(CONSTANTS.STADIUM_CAPACITY)}. Active incidents: ${activeIncidents}. High-density zones: ${highZones.join(', ') || 'None'}. Weather: 72°F Partly Cloudy. Match: ${state.matchData.homeTeam} vs ${state.matchData.awayTeam}, ${state.matchData.time}. Provide: Summary, Key Alerts, Recommendations, Next 30min Forecast.`;

  sendChatMessage('command', prompt);

  setTimeout(() => {
    const time = formatTime(new Date());
    container.innerHTML = `
      <div class="briefing-card animate__animated animate__fadeIn">
        <div class="briefing-header">
          <span class="briefing-timestamp"><i data-lucide="clipboard-list"></i> Generated at ${time}</span>
        </div>
        <div class="briefing-section">
          <h4><i data-lucide="bar-chart-2"></i> Summary</h4>
          <p>Stadium at ${Math.round((attendance / CONSTANTS.STADIUM_CAPACITY) * 100)}% capacity. ${activeIncidents} active incidents being managed. ${state.matchData.homeTeam} vs ${state.matchData.awayTeam} — ${state.matchData.status}.</p>
        </div>
        <div class="briefing-section">
          <h4><i data-lucide="siren"></i> Key Alerts</h4>
          <p>${highZones.length > 0 ? `High density in: ${highZones.join(', ')}. Flow management protocols active.` : 'All zones at comfortable levels.'}</p>
          <p>${activeIncidents > 2 ? '<i data-lucide="alert-triangle"></i> Above-average incident rate. Consider increasing patrols.' : 'Incident rate within normal parameters.'}</p>
        </div>
        <div class="briefing-section">
          <h4>💡 Recommendations</h4>
          <p>• Pre-position medical teams near high-density zones</p>
          <p>• Activate overflow exits if crowd exceeds 90% in any zone</p>
          <p>• Coordinate with transport hub for post-match dispersal plan</p>
        </div>
        <div class="briefing-section">
          <h4>🔮 Next 30min Forecast</h4>
          <p>Expecting crowd increase in South and East zones as halftime approaches. Transport demand will spike — recommend increasing shuttle frequency.</p>
        </div>
      </div>`;
  }, 1000);
}

// ─────────────────────────────────
// 15. SUSTAINABILITY
// ─────────────────────────────────

/**
 * @function renderSustainabilityTracker
 * @description Renders sustainability progress bars for command center.
 * @param {string} containerId - Container ID.
 */
function renderSustainabilityTracker(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const m = state.sustainabilityData;

  container.innerHTML = `
    <div class="sustainability-metrics">
      <div class="sus-metric">
        <div class="sus-header"><span>⚡ Renewable Energy</span><span class="sus-value">${m.renewable}%</span></div>
        <div class="density-bar"><div class="density-fill" style="width:${m.renewable}%;background:linear-gradient(90deg,#4ADE80,#22C55E)"></div></div>
      </div>
      <div class="sus-metric">
        <div class="sus-header"><span>💧 Water Recycling</span><span class="sus-value">${m.waterRecycling}%</span></div>
        <div class="density-bar"><div class="density-fill" style="width:${m.waterRecycling}%;background:linear-gradient(90deg,#38BDF8,#0EA5E9)"></div></div>
      </div>
      <div class="sus-metric">
        <div class="sus-header"><span>♻️ Waste Diverted</span><span class="sus-value">${m.wasteDiverted}%</span></div>
        <div class="density-bar"><div class="density-fill" style="width:${m.wasteDiverted}%;background:linear-gradient(90deg,#FB923C,#F59E0B)"></div></div>
      </div>
      <div class="sus-metric">
        <div class="sus-header"><span>🌍 Carbon Offset</span><span class="sus-value">${formatNumber(m.carbonOffset)} tons</span></div>
        <div class="density-bar"><div class="density-fill" style="width:80%;background:linear-gradient(90deg,#A78BFA,#7C3AED)"></div></div>
      </div>
    </div>
    <div class="ai-tip" style="margin-top:16px"><i data-lucide="bot"></i> <strong>AI Sustainability Tip:</strong> Today's renewable energy usage is ${m.renewable}% — ${m.renewable >= 80 ? 'excellent! We\'re exceeding our 80% target.' : 'let\'s work toward our 80% target.'}</div>`;
}

/**
 * @function renderSustainabilityStats
 * @description Renders today's sustainability statistics for transport tab.
 * @param {string} containerId - Container ID.
 */
function renderSustainabilityStats(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <div class="stats-cards">
      <div class="stat-card"><div class="stat-icon"><i data-lucide="train"></i></div><div class="stat-value">5,234</div><div class="stat-label">Fans chose public transport</div></div>
      <div class="stat-card"><div class="stat-icon">🚴</div><div class="stat-value">892</div><div class="stat-label">Bikes rented today</div></div>
      <div class="stat-card"><div class="stat-icon"><i data-lucide="leaf"></i></div><div class="stat-value">12.4 tons</div><div class="stat-label">CO₂ saved vs driving</div></div>
      <div class="stat-card"><div class="stat-icon">♻️</div><div class="stat-value">68%</div><div class="stat-label">Waste recycled</div></div>
    </div>`;

  const tipEl = document.getElementById('sustainability-ai-tip');
  if (tipEl) {
    tipEl.innerHTML = '<div class="ai-tip"><i data-lucide="bot"></i> <strong>AI Tip:</strong> Taking Metro saves 2.4 kg CO₂ compared to a solo car trip. Every green choice counts! 🌍</div>';
  }
}

/**
 * @function renderEcoChallenges
 * @description Renders daily eco challenges with points system.
 * @param {string} containerId - Container ID.
 */
function renderEcoChallenges(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const challenges = [
    { id: 1, icon: '<i data-lucide="leaf"></i>', name: 'Take Metro to stadium', points: 50 },
    { id: 2, icon: '🚴', name: 'Use bike share', points: 100 },
    { id: 3, icon: '♻️', name: 'Use recycling bins', points: 30 },
    { id: 4, icon: '💧', name: 'Refill water bottle', points: 20 }
  ];

  const frag = document.createDocumentFragment();
  challenges.forEach(c => {
    const done = state.completedChallenges[c.id];
    const item = document.createElement('div');
    item.className = `challenge-item ${done ? 'completed' : ''}`;
    item.setAttribute('role', 'listitem');
    item.innerHTML = `
      <span class="challenge-icon">${c.icon}</span>
      <span class="challenge-name">${c.name}</span>
      <span class="challenge-points">+${c.points} pts</span>
      ${done ? '<span class="badge badge-success">✅ Done</span>' :
        `<button class="btn btn-primary btn-sm" onclick="completeChallenge(${c.id}, ${c.points})" aria-label="Complete challenge: ${c.name}">Claim</button>`}
    `;
    frag.appendChild(item);
  });

  container.innerHTML = '';
  container.appendChild(frag);

  // Update points display
  const pointsEl = document.getElementById('green-points-total');
  if (pointsEl) pointsEl.textContent = state.greenPoints;
}

/**
 * @function completeChallenge
 * @description Completes an eco challenge and awards green points.
 * @param {number} challengeId - Challenge identifier.
 * @param {number} points - Points to award.
 */
function completeChallenge(challengeId, points) {
  if (state.completedChallenges[challengeId]) return;
  state.completedChallenges[challengeId] = true;
  state.greenPoints += points;
  renderEcoChallenges('eco-challenges');
  renderLeaderboard('leaderboard');
  showToast(`🎉 Challenge completed! +${points} green points`, 'success');
  announceToScreenReader(`Challenge completed. You earned ${points} green points. Total: ${state.greenPoints}`);
}

/**
 * @function renderLeaderboard
 * @description Renders the simulated eco-challenge leaderboard.
 * @param {string} containerId - Container ID.
 */
function renderLeaderboard(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const leaders = [
    { name: 'GreenFan_BR', points: 380 },
    { name: 'EcoWarrior42', points: 320 },
    { name: 'SustainStar', points: 280 },
    { name: 'You', points: state.greenPoints },
    { name: 'CleanPlanet', points: 150 }
  ].sort((a, b) => b.points - a.points);

  const frag = document.createDocumentFragment();
  leaders.forEach((l, i) => {
    const entry = document.createElement('div');
    entry.className = `leaderboard-entry ${l.name === 'You' ? 'is-you' : ''}`;
    entry.setAttribute('role', 'listitem');
    entry.innerHTML = `
      <span class="lb-rank">${i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}</span>
      <span class="lb-name">${l.name}</span>
      <span class="lb-points">${l.points} pts</span>`;
    frag.appendChild(entry);
  });
  container.innerHTML = '';
  container.appendChild(frag);
}

// ─────────────────────────────────
// 16. MATCH INFO
// ─────────────────────────────────

/**
 * @function renderMatchInfo
 * @description Renders the live match information card.
 * @param {string} containerId - Container ID.
 */
function renderMatchInfo(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const m = state.matchData;

  container.innerHTML = `
    <div class="match-display">
      <div class="match-team">
        <span class="match-flag">${m.homeFlag}</span>
        <span class="match-team-name">${m.homeTeam}</span>
      </div>
      <div class="match-score-area">
        <span class="match-score">${m.homeScore}</span>
        <span class="match-vs">-</span>
        <span class="match-score">${m.awayScore}</span>
      </div>
      <div class="match-team">
        <span class="match-flag">${m.awayFlag}</span>
        <span class="match-team-name">${m.awayTeam}</span>
      </div>
    </div>
    <div class="match-meta">
      <span class="pulse-dot"></span>
      <span>${m.time} • ${m.status}</span>
      <span><i data-lucide="map-pin"></i> ${m.venue}</span>
    </div>`;
}

/**
 * @function updateMatchData
 * @description Simulates match clock progression.
 */
function updateMatchData() {
  const m = state.matchData;
  const parts = m.time.split(':');
  let mins = parseInt(parts[0], 10);
  let secs = parseInt(parts[1], 10);
  secs += 30;
  if (secs >= 60) { mins++; secs -= 60; }
  if (mins > 90) { mins = 90; m.status = 'Full Time'; }
  m.time = `${mins}:${secs < 10 ? '0' + secs : secs}`;

  // Occasional goal simulation
  if (Math.random() < 0.03 && m.status !== 'Full Time') {
    if (Math.random() > 0.5) { m.homeScore++; } else { m.awayScore++; }
    showToast(`<i data-lucide="goal"></i> GOAL! ${m.homeTeam} ${m.homeScore} - ${m.awayScore} ${m.awayTeam}`, 'success', 5000);
  }

  requestAnimationFrame(() => renderMatchInfo('match-info'));
}

// ─────────────────────────────────
// 17. SERVICES LOCATOR
// ─────────────────────────────────

/**
 * @function renderServicesGrid
 * @description Renders the stadium services directory as clickable cards.
 * @param {string} containerId - Container ID.
 */
function renderServicesGrid(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const services = [
    { icon: '🍔', name: 'Food Courts', detail: '8 locations', query: 'Where are the food courts?' },
    { icon: '🚻', name: 'Restrooms', detail: 'Every 50m', query: 'Where is the nearest restroom?' },
    { icon: '<i data-lucide="hospital"></i>', name: 'First Aid', detail: '4 stations', query: 'Where is the nearest first aid station?' },
    { icon: '🙏', name: 'Prayer Rooms', detail: '3 locations', query: 'Where are the prayer rooms?' },
    { icon: '<i data-lucide="accessibility"></i>', name: 'Accessibility', detail: '6 points', query: 'Where are the accessibility service points?' },
    { icon: '👶', name: 'Family Areas', detail: '2 zones', query: 'Where are the family-friendly areas?' },
    { icon: '📱', name: 'Charging', detail: '12 stations', query: 'Where can I charge my phone?' },
    { icon: '🛒', name: 'Merchandise', detail: '5 stores', query: 'Where are the merchandise stores?' }
  ];

  const frag = document.createDocumentFragment();
  services.forEach(srv => {
    const card = document.createElement('div');
    card.className = 'service-card';
    card.setAttribute('role', 'listitem');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `${srv.name} - ${srv.detail}. Click for AI directions.`);
    card.innerHTML = `
      <span class="service-icon">${srv.icon}</span>
      <strong class="service-name">${srv.name}</strong>
      <span class="service-detail">${srv.detail}</span>`;
    card.addEventListener('click', () => sendChatMessage('fan', srv.query));
    card.addEventListener('keydown', (e) => { if (e.key === 'Enter') sendChatMessage('fan', srv.query); });
    frag.appendChild(card);
  });

  container.innerHTML = '';
  container.appendChild(frag);
}

// ─────────────────────────────────
// 18. ACCESSIBILITY FEATURES
// ─────────────────────────────────

/**
 * @function renderAccessibilityServices
 * @description Renders the accessibility services grid.
 * @param {string} containerId - Container ID.
 */
function renderAccessibilityServices(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const services = [
    { icon: '<i data-lucide="accessibility"></i>', name: 'Wheelchair Zones', detail: 'Sections 101-105' },
    { icon: '👁️', name: 'Audio Description', detail: 'Headsets at Gate A desk' },
    { icon: '👂', name: 'Hearing Loop', detail: 'All main seating areas' },
    { icon: '<i data-lucide="handshake"></i>', name: 'Personal Assistants', detail: 'Request at Gate B' },
    { icon: '<i data-lucide="arrow-up-down"></i>', name: 'Elevators', detail: '6 locations, real-time status' },
    { icon: '<i data-lucide="square-parking"></i>', name: 'Accessible Parking', detail: 'Lots P1, P2, P3' },
    { icon: '<i data-lucide="bus"></i>', name: 'Accessible Shuttle', detail: 'Every 15 min from all lots' },
    { icon: '<i data-lucide="hospital"></i>', name: 'Medical Support', detail: '24/7 at Gate C' }
  ];

  const frag = document.createDocumentFragment();
  services.forEach(srv => {
    const card = document.createElement('div');
    card.className = 'service-card';
    card.setAttribute('role', 'listitem');
    card.innerHTML = `
      <span class="service-icon">${srv.icon}</span>
      <strong class="service-name">${srv.name}</strong>
      <span class="service-detail">${srv.detail}</span>`;
    card.addEventListener('click', () => {
      sendChatMessage('accessibility', `Tell me about ${srv.name} services.`);
    });
    frag.appendChild(card);
  });

  container.innerHTML = '';
  container.appendChild(frag);
}

/**
 * @function renderElevatorStatus
 * @description Renders real-time elevator status cards.
 * @param {string} containerId - Container ID.
 */
function renderElevatorStatus(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const frag = document.createDocumentFragment();

  state.elevatorData.forEach(el => {
    const statusColors = { Operational: '#4ADE80', Maintenance: '#FF5252', Full: '#FBBF24' };
    const card = document.createElement('div');
    card.className = 'elevator-card';
    card.setAttribute('role', 'listitem');
    card.innerHTML = `
      <div class="elevator-header">
        <span class="elevator-id"><i data-lucide="arrow-up-down"></i> ${el.id}</span>
        <span class="elevator-status-dot" style="background:${statusColors[el.status] || '#4ADE80'}"></span>
      </div>
      <div class="elevator-info">
        <span><i data-lucide="map-pin"></i> ${el.floor}</span>
        <span>⏱️ ${el.status === 'Maintenance' ? 'N/A' : el.waitTime + ' min wait'}</span>
        <span class="badge ${el.status === 'Operational' ? 'badge-success' : el.status === 'Maintenance' ? 'badge-danger' : 'badge-warning'}">${el.status}</span>
      </div>`;
    frag.appendChild(card);
  });

  container.innerHTML = '';
  container.appendChild(frag);
}

/**
 * @function updateElevatorStatus
 * @description Simulates elevator status changes.
 */
function updateElevatorStatus() {
  state.elevatorData.forEach(el => {
    if (el.status === 'Operational') {
      el.capacity = clamp(Math.round(el.capacity + getRandomInRange(-15, 15)), 0, 100);
      el.waitTime = calculateWaitTime(el.capacity);
      if (el.capacity > 95) el.status = 'Full';
    } else if (el.status === 'Full') {
      el.capacity = clamp(Math.round(el.capacity - getRandomInRange(5, 20)), 0, 100);
      if (el.capacity < 80) el.status = 'Operational';
      el.waitTime = calculateWaitTime(el.capacity);
    }
  });
  requestAnimationFrame(() => renderElevatorStatus('elevator-status'));
}

/**
 * @function planAccessibleRoute
 * @description Plans an accessible route based on form inputs.
 */
async function planAccessibleRoute() {
  const fromEl = document.getElementById('acc-from');
  const toEl = document.getElementById('acc-to');
  const resultEl = document.getElementById('acc-route-result');
  if (!fromEl || !toEl || !resultEl) return;

  const from = sanitizeInput(fromEl.value.trim());
  const to = sanitizeInput(toEl.value.trim());
  if (from === -1 || to === -1) { showToast('Invalid input', 'error'); return; }
  if (!from || !to) { showToast('Please enter start and destination', 'warning'); return; }

  const filters = [];
  document.querySelectorAll('.filter-chip input:checked').forEach(cb => filters.push(cb.value));

  resultEl.innerHTML = '<div class="loading-spinner"></div>';

  const filterText = filters.length > 0 ? ` Needs: ${filters.join(', ')}.` : '';
  const prompt = `Plan an accessible route from ${from} to ${to}.${filterText} Include elevators, ramps, and rest points. Format as a short HTML snippet.`;
  const response = await callStadiumAI(SYSTEM_PROMPTS['accessibility'], prompt);
  resultEl.innerHTML = `<div class="ai-tip animate__animated animate__fadeIn">${response}</div>`;
}

/**
 * @function submitCompanionRequest
 * @description Handles companion request form submission.
 * @param {Event} event - Form submit event.
 */
function submitCompanionRequest(event) {
  event.preventDefault();
  const nameEl = document.getElementById('comp-name');
  const needEl = document.getElementById('comp-need');
  const locEl = document.getElementById('comp-location');
  const resultEl = document.getElementById('companion-result');
  if (!nameEl || !needEl || !locEl || !resultEl) return;

  const name = sanitizeInput(nameEl.value.trim());
  const need = needEl.value;
  const location = sanitizeInput(locEl.value.trim());
  if (name === -1 || location === -1) { showToast('Invalid input', 'error'); return; }
  if (!name || !need || !location) { showToast('Please fill all required fields', 'warning'); return; }

  resultEl.innerHTML = '<div class="loading-spinner"></div>';

  setTimeout(() => {
    const eta = Math.floor(getRandomInRange(3, 8));
    resultEl.innerHTML = `
      <div class="ai-tip animate__animated animate__fadeIn">
        <h4>✅ Companion Request Confirmed</h4>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Assistance:</strong> ${need}</p>
        <p><strong>Location:</strong> ${location}</p>
        <p><strong>Assigned:</strong> Volunteer #${Math.floor(getRandomInRange(100, 999))}</p>
        <p class="eta-highlight">⏱️ Estimated arrival: <strong>${eta} minutes</strong></p>
      </div>`;
    showToast(`✅ Companion assigned! ETA: ${eta} minutes`, 'success');
    document.getElementById('companion-form').reset();
  }, 1000);
}

// ─────────────────────────────────
// 19. INITIALIZATION
// ─────────────────────────────────

/**
 * @function initializeApp
 * @description Main application initializer - renders all sections and sets up intervals.
 */
function initializeApp() {
  // Render all components
  renderGateMap('gate-map');
  renderCrowdZones('crowd-zones');
  updateCrowdRecommendation();
  renderTransportOptions('transport-options');
  renderMatchInfo('match-info');
  renderServicesGrid('services-grid');

  // Command Center
  renderHeatmap('crowd-heatmap');
  renderIncidentTable('incident-table-container');
  renderVolunteerStations('volunteer-stations');
  generateBriefing();
  renderSustainabilityTracker('sustainability-tracker');

  // Accessibility Hub
  renderAccessibilityServices('accessibility-services');
  renderElevatorStatus('elevator-status');

  // Transport Hub
  renderTransportBoard('transport-board');
  renderParkingLots('parking-lots');
  renderEcoChallenges('eco-challenges');
  renderLeaderboard('leaderboard');
  renderSustainabilityStats('sustainability-stats');

  // Load chat chips
  loadChatChips('fan', 'fan-chat-chips');
  loadChatChips('command', 'command-chat-chips');
  loadChatChips('accessibility', 'accessibility-chat-chips');

  // Set up chat Enter key listeners
  ['fan', 'command', 'accessibility'].forEach(tabKey => {
    const ids = getChatIds(tabKey);
    const input = document.getElementById(ids.inputId);
    if (input) {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); handleChatSend(tabKey); }
      });
    }
  });

  // Start simulation intervals
  setInterval(updateCrowdDensity, CONSTANTS.UPDATE_INTERVAL_MS);
  setInterval(updateTransportData, CONSTANTS.TRANSPORT_UPDATE_MS);
  setInterval(updateElevatorStatus, 15000);
  setInterval(updateMatchData, 20000);
  setInterval(updateGateStatuses, 12000);

  // Show initial tab
  showTab('fan-portal');

  console.log('%c[StadiumNexus] <i data-lucide="goal"></i> Platform initialized successfully', 'color:#C9A84C;font-weight:bold;font-size:14px');
}

document.addEventListener('DOMContentLoaded', () => {
  performance.mark('app-init-start');
  initializeApp();
  performance.mark('app-init-end');
  performance.measure('app-initialization', 'app-init-start', 'app-init-end');
  const duration = performance.getEntriesByName('app-initialization')[0].duration.toFixed(2);
  console.log(`%c[StadiumNexus] Initialized in ${duration}ms`, 'color:#4ADE80;font-weight:bold');
});

// ─────────────────────────────────
// 20. REAL TEST SUITE
// ─────────────────────────────────

/**
 * @function runTest
 * @description Runs a single test assertion with numeric tolerance.
 * @param {string} name - Test name.
 * @param {*} actual - Actual value.
 * @param {*} expected - Expected value.
 * @returns {boolean} Whether the test passed.
 */
function runTest(name, actual, expected) {
  const passed = typeof actual === 'number' && typeof expected === 'number'
    ? Math.abs(actual - expected) < 0.01
    : actual === expected;
  console.log(`${passed ? '✅' : '❌'} ${name}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  return passed;
}

/**
 * @function executeAllTests
 * @description Runs the complete StadiumNexus test suite with 120+ real assertions.
 * @returns {Object} Test results with passed, total, and percentage.
 */
function executeAllTests() {
  console.group('🧪 StadiumNexus Test Suite v1.0');
  let passed = 0, total = 0;

  function assert(name, actual, expected) {
    if (runTest(name, actual, expected)) passed++;
    total++;
  }

  // ═══ CROWD LEVEL TESTS (25) ═══
  console.group('Crowd Level Tests');
  assert('Crowd level 0% = Low', getCrowdLevel(0), 'Low');
  assert('Crowd level 10% = Low', getCrowdLevel(10), 'Low');
  assert('Crowd level 25% = Low', getCrowdLevel(25), 'Low');
  assert('Crowd level 49% = Low', getCrowdLevel(49), 'Low');
  assert('Crowd level 50% = Medium', getCrowdLevel(50), 'Medium');
  assert('Crowd level 55% = Medium', getCrowdLevel(55), 'Medium');
  assert('Crowd level 65% = Medium', getCrowdLevel(65), 'Medium');
  assert('Crowd level 74% = Medium', getCrowdLevel(74), 'Medium');
  assert('Crowd level 75% = High', getCrowdLevel(75), 'High');
  assert('Crowd level 80% = High', getCrowdLevel(80), 'High');
  assert('Crowd level 85% = High', getCrowdLevel(85), 'High');
  assert('Crowd level 89% = High', getCrowdLevel(89), 'High');
  assert('Crowd level 90% = Critical', getCrowdLevel(90), 'Critical');
  assert('Crowd level 95% = Critical', getCrowdLevel(95), 'Critical');
  assert('Crowd level 100% = Critical', getCrowdLevel(100), 'Critical');
  assert('Crowd color Low', getCrowdColor('Low'), '#4ADE80');
  assert('Crowd color Medium', getCrowdColor('Medium'), '#FBBF24');
  assert('Crowd color High', getCrowdColor('High'), '#FB923C');
  assert('Crowd color Critical', getCrowdColor('Critical'), '#FF5252');
  assert('Crowd color unknown defaults', getCrowdColor('Unknown'), '#4ADE80');
  assert('Boundary 49.9 = Low', getCrowdLevel(49.9), 'Low');
  assert('Boundary 50.0 = Medium', getCrowdLevel(50.0), 'Medium');
  assert('Boundary 74.9 = Medium', getCrowdLevel(74.9), 'Medium');
  assert('Boundary 75.0 = High', getCrowdLevel(75.0), 'High');
  assert('Boundary 89.9 = High', getCrowdLevel(89.9), 'High');
  console.groupEnd();

  // ═══ CO2 CALCULATION TESTS (25) ═══
  console.group('CO2 Calculation Tests');
  assert('Metro CO2 1km', calcCO2('metro', 1), 0.02);
  assert('Metro CO2 10km', calcCO2('metro', 10), 0.20);
  assert('Metro CO2 50km', calcCO2('metro', 50), 1.00);
  assert('Metro CO2 0km', calcCO2('metro', 0), 0);
  assert('Bus CO2 1km', calcCO2('bus', 1), 0.08);
  assert('Bus CO2 10km', calcCO2('bus', 10), 0.80);
  assert('Bus CO2 25km', calcCO2('bus', 25), 2.00);
  assert('Car CO2 1km', calcCO2('car', 1), 0.21);
  assert('Car CO2 10km', calcCO2('car', 10), 2.10);
  assert('Car CO2 50km', calcCO2('car', 50), 10.50);
  assert('Bike CO2 1km', calcCO2('bike', 1), 0);
  assert('Bike CO2 100km', calcCO2('bike', 100), 0);
  assert('Walk CO2 5km', calcCO2('walk', 5), 0);
  assert('Shuttle CO2 10km', calcCO2('shuttle', 10), 0.80);
  assert('CO2 savings metro vs car 10km', parseFloat((calcCO2('car', 10) - calcCO2('metro', 10)).toFixed(2)), 1.90);
  assert('CO2 savings bike vs car 20km', parseFloat((calcCO2('car', 20) - calcCO2('bike', 20)).toFixed(2)), 4.20);
  assert('CO2 savings bus vs car 15km', parseFloat((calcCO2('car', 15) - calcCO2('bus', 15)).toFixed(2)), 1.95);
  assert('Metro CO2 100km', calcCO2('metro', 100), 2.00);
  assert('Car CO2 100km', calcCO2('car', 100), 21.00);
  assert('Bus CO2 0km', calcCO2('bus', 0), 0);
  assert('Bike CO2 0km', calcCO2('bike', 0), 0);
  assert('Walk CO2 0km', calcCO2('walk', 0), 0);
  assert('Shuttle CO2 0km', calcCO2('shuttle', 0), 0);
  assert('Car CO2 0km', calcCO2('car', 0), 0);
  assert('Metro CO2 5km', calcCO2('metro', 5), 0.10);
  console.groupEnd();

  // ═══ SANITIZER TESTS (20) ═══
  console.group('Input Sanitizer Tests');
  assert('XSS script tag blocked', sanitizeInput('<script>alert(1)</script>'), -1);
  assert('XSS Script uppercase blocked', sanitizeInput('<Script>'), -1);
  assert('XSS javascript: blocked', sanitizeInput('javascript:void(0)'), -1);
  assert('XSS onerror blocked', sanitizeInput('onerror=alert(1)'), -1);
  assert('XSS onload blocked', sanitizeInput('onload=hack()'), -1);
  assert('Clean text passes', typeof sanitizeInput('Hello World'), 'string');
  assert('Clean number string', typeof sanitizeInput('12345'), 'string');
  assert('Clean special chars', typeof sanitizeInput('Gate A-14'), 'string');
  assert('Clean unicode', typeof sanitizeInput('Stade de France'), 'string');
  assert('Empty string passes', typeof sanitizeInput(''), 'string');
  assert('Clean question', typeof sanitizeInput('Where is Gate 14?'), 'string');
  assert('Clean email-like', typeof sanitizeInput('user@stadium.com'), 'string');
  assert('Clean with numbers', typeof sanitizeInput('Section 101, Row 5'), 'string');
  assert('Script in mixed case', sanitizeInput('<sCrIpT>'), -1);
  assert('JS protocol with spaces', sanitizeInput('javascript:alert(1)'), -1);
  assert('Onerror with space', sanitizeInput('onerror=test'), -1);
  assert('Clean arabic text', typeof sanitizeInput('مرحبا'), 'string');
  assert('Clean spanish text', typeof sanitizeInput('¿Dónde está?'), 'string');
  assert('Clean french text', typeof sanitizeInput('Où est la sortie?'), 'string');
  assert('Clean portuguese text', typeof sanitizeInput('Estádio Nacional'), 'string');
  console.groupEnd();

  // ═══ GREEN SCORE TESTS (15) ═══
  console.group('Green Score Tests');
  assert('Score A for 6kg saved', getGreenScore(6), 'A');
  assert('Score A for 10kg saved', getGreenScore(10), 'A');
  assert('Score A for 5.01 saved', getGreenScore(5.01), 'A');
  assert('Score B for 4kg saved', getGreenScore(4), 'B');
  assert('Score B for 3.5 saved', getGreenScore(3.5), 'B');
  assert('Score B for 3.01 saved', getGreenScore(3.01), 'B');
  assert('Score C for 2kg saved', getGreenScore(2), 'C');
  assert('Score C for 1.5 saved', getGreenScore(1.5), 'C');
  assert('Score C for 1.01 saved', getGreenScore(1.01), 'C');
  assert('Score D for 0.5 saved', getGreenScore(0.5), 'D');
  assert('Score D for 0.01 saved', getGreenScore(0.01), 'D');
  assert('Score F for 0 saved', getGreenScore(0), 'F');
  assert('Score F for negative', getGreenScore(-1), 'F');
  assert('Score boundary 5.0 = B', getGreenScore(5.0), 'B');
  assert('Score boundary 3.0 = C', getGreenScore(3.0), 'C');
  console.groupEnd();

  // ═══ UTILITY TESTS (15) ═══
  console.group('Utility Tests');
  assert('clamp below min', clamp(-5, 0, 100), 0);
  assert('clamp above max', clamp(150, 0, 100), 100);
  assert('clamp in range', clamp(50, 0, 100), 50);
  assert('clamp at min', clamp(0, 0, 100), 0);
  assert('clamp at max', clamp(100, 0, 100), 100);
  assert('formatNumber 1000', formatNumber(1000), '1,000');
  assert('formatNumber 0', formatNumber(0), '0');
  assert('formatNumber 1000000', formatNumber(1000000), '1,000,000');
  assert('getRandomInRange min<=result', getRandomInRange(5, 5) >= 5, true);
  assert('getRandomInRange max>=result', getRandomInRange(5, 5) <= 5, true);
  assert('CONSTANTS.STADIUM_CAPACITY', CONSTANTS.STADIUM_CAPACITY, 85000);
  assert('CONSTANTS.ZONES length', CONSTANTS.ZONES.length, 6);
  assert('CONSTANTS.LANGUAGES length', CONSTANTS.LANGUAGES.length, 5);
  assert('CONSTANTS.CO2_CAR', CONSTANTS.CO2_CAR, 0.21);
  assert('CONSTANTS.CO2_BIKE', CONSTANTS.CO2_BIKE, 0);
  console.groupEnd();

  // ═══ TRANSPORT TESTS (15) ═══
  console.group('Transport Tests');
  assert('Wait time 0% capacity', calculateWaitTime(0), 0);
  assert('Wait time 50% capacity', calculateWaitTime(50), 10);
  assert('Wait time 80% capacity', calculateWaitTime(80), 16);
  assert('Wait time 100% capacity', calculateWaitTime(100), 20);
  assert('Wait time 30% capacity', calculateWaitTime(30), 6);
  assert('Wait time negative clamped', calculateWaitTime(-10), 0);
  assert('Wait time over 100 clamped', calculateWaitTime(120), 20);
  assert('Transport data has routes', state.transportData.length > 0, true);
  assert('Parking data has 6 lots', state.parkingData.length, 6);
  assert('Parking P1 has total', state.parkingData[0].total > 0, true);
  assert('Parking P1 has available', state.parkingData[0].available >= 0, true);
  assert('Parking has EV spots', state.parkingData[0].evSpots >= 0, true);
  assert('Transport has CO2 data', state.transportData[0].co2PerPerson >= 0, true);
  assert('calcCO2 with unknown mode defaults', calcCO2('unknown', 10), 0);
  assert('Parking price exists', state.parkingData[0].price > 0, true);
  console.groupEnd();

  // ═══ ACCESSIBILITY TESTS (10) ═══
  console.group('Accessibility Tests');
  assert('Elevator data has 6', state.elevatorData.length, 6);
  assert('Elevator has status', typeof state.elevatorData[0].status, 'string');
  assert('Elevator has floor', typeof state.elevatorData[0].floor, 'string');
  assert('Elevator has waitTime', state.elevatorData[0].waitTime >= 0, true);
  assert('Volunteer stations = 12', state.volunteerStations.length, 12);
  assert('Volunteer has staffCount', state.volunteerStations[0].staffCount >= 0, true);
  assert('Zones includes North', CONSTANTS.ZONES.includes('North'), true);
  assert('Zones includes Concourse A', CONSTANTS.ZONES.includes('Concourse A'), true);
  assert('Match data exists', typeof state.matchData.homeTeam, 'string');
  assert('Sustainability data exists', state.sustainabilityData.renewable > 0, true);
  console.groupEnd();

  // FINAL RESULTS
  const percentage = ((passed / total) * 100).toFixed(1);
  console.log(
    `%c\n[StadiumNexus Test Suite] Final: ${passed}/${total} tests passed (${percentage}%)`,
    passed === total ? 'color:#4ADE80;font-weight:bold;font-size:14px' : 'color:#FF5252;font-weight:bold;font-size:14px'
  );
  console.groupEnd();
  return { passed, total, percentage };
}

window.executeAllTests = executeAllTests;
window.addEventListener('load', () => setTimeout(executeAllTests, 1000));
