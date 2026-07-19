"use strict";

// 7. AI CHAT SYSTEM
const SYSTEM_PROMPTS = {
  fan: `You are StadiumNexus AI, the official FIFA World Cup 2026 stadium assistant. This is a demo app with simulated data — you do not have real restaurant names, addresses, or transit schedules. Keep every response under 3 sentences. Never invent specific restaurant names, street addresses, or bus/train numbers — instead give general, confident guidance using the app's own simulated features (e.g. 'Check the Stadium Services section for Food Court locations' or 'Use the Transport Planner tab for real-time options'). Be direct and helpful, never ask clarifying questions — just answer using what's simulated in this app.`,
  command: `You are StadiumNexus Operations AI for FIFA World Cup 2026. This is a demo app with simulated data — do not invent real names, external contacts, or non-existent incidents. Keep every response under 3 sentences. Give general, confident guidance based on the app's simulated features (e.g. 'Check the Incident Management section to deploy volunteers' or 'View Crowd Density for gate status'). Be direct, data-driven, and action-oriented. Never ask clarifying questions — just answer using what's simulated in this app.`,
  accessibility: `You are the FIFA World Cup 2026 Accessibility Assistant. This is a demo app with simulated data — do not invent real service locations, medical names, or external addresses. Keep every response under 3 sentences. Provide general, confident guidance using the app's features (e.g. 'Check the Stadium Services section for accessible seating' or 'Use the Transport Planner for accessible transit options'). Be direct and helpful, never ask clarifying questions — just answer using what's simulated in this app.`
};

let API_KEY = localStorage.getItem('stadiumnexus_nvidia_key') || atob('bnZhcGktTzFFaFNMZzI0dEFYUGtSYmlIZVpGXzBqTTEwdHlzYVpaWi1tRUxORERtbzd1TU1BZnVTME5IM2U4aFV6RlV4VA==');
let API_KEY_FALLBACK = atob('bnZhcGktUXFiQVV3SXB5VjJWTUY2YTZmVUtQZEgzOGRKakU0UllPdTJpNUR2Q016a3lmNU5fdGZkc3lnQzVwaUswaWR3cw==');
const MODEL_PRIMARY = "nvidia/llama-3.3-nemotron-super-49b-v1";
const MODEL_FALLBACK = "meta/llama-3.1-8b-instruct";

/**
 * @function openSettings
 * @description Opens the API configuration modal.
 */
function openSettings() {
  const modal = document.getElementById('settings-modal');
  const input = document.getElementById('gemini-api-key');
  if (modal && input) {
    input.value = API_KEY;
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
  }
}

/**
 * @function closeSettings
 * @description Closes the API configuration modal.
 */
function closeSettings() {
  const modal = document.getElementById('settings-modal');
  if (modal) {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
  }
}

/**
 * @function saveSettings
 * @description Saves the API configuration to localStorage.
 */
function saveSettings() {
  const input = document.getElementById('gemini-api-key');
  if (input) {
    API_KEY = input.value.trim();
    localStorage.setItem('stadiumnexus_nvidia_key', API_KEY);
    showToast('Configuration saved successfully', 'success');
    closeSettings();
  }
}

/**
 * @function callStadiumAI
 * @description Shared AI call function using Google Gemini API.
 * @param {string} systemPrompt - role-specific system prompt
 * @param {string} userQuery - sanitized user input
 * @returns {Promise<string>} AI response text
 */
async function callStadiumAI(systemPrompt, userQuery) {
  if (!API_KEY) {
    showToast('API Key missing. Please configure AI settings.', 'error');
    openSettings();
    return "I need an API key to function. Please configure the AI settings.";
  }

  const makeRequest = async (model, key) => {
    const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${key}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userQuery }
        ],
        temperature: 0.6,
        top_p: 0.95,
        max_tokens: 1024,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();
    if (data.choices && data.choices.length > 0 && data.choices[0].message) {
      return data.choices[0].message.content;
    }
    throw new Error('Invalid response format');
  };

  try {
    return await makeRequest(MODEL_PRIMARY, API_KEY);
  } catch (err) {
    console.warn("Primary AI model failed, attempting fallback...", err);
    try {
      return await makeRequest(MODEL_FALLBACK, API_KEY_FALLBACK);
    } catch (fallbackErr) {
      console.error("Fallback AI model also failed:", fallbackErr);
      return "I couldn't generate a proper response at this time.";
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
 * @function parseMarkdown
 * @description Lightweight markdown-to-HTML converter for bold, italics, and headers.
 * @param {string} text - The markdown text
 * @returns {string} HTML string
 */
function parseMarkdown(text) {
  if (!text) return '';
  return text
    .replace(/^### (.*$)/gim, '<strong>$1</strong><br>')
    .replace(/^## (.*$)/gim, '<strong>$1</strong><br>')
    .replace(/^# (.*$)/gim, '<strong>$1</strong><br>')
    .replace(/\*\*([^*]+)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/gim, '<em>$1</em>')
    .replace(/\n/gim, '<br>');
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
  avatar.innerHTML = message.role === 'user' ? '👤' : '<i data-lucide="bot"></i>';
  avatar.setAttribute('aria-hidden', 'true');

  const bubble = document.createElement('div');
  bubble.className = 'chat-bubble';
  
  const htmlContent = parseMarkdown(message.content);
  bubble

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
  div.innerHTML = window.secureHTML('<div class="chat-avatar" aria-hidden="true"><i data-lucide="bot"></i></div><div class="chat-bubble typing-indicator"><span></span><span></span><span></span></div>');
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

// 10. AI NAVIGATION
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
  resultEl.innerHTML = window.secureHTML(`
    <div class="ai-tip animate__animated animate__fadeIn">
      <h4>🧭 AI Navigation</h4>
      <p><strong>From:</strong> ${from} → <strong>To:</strong> ${to}</p>
      <p><i data-lucide="map-pin"></i> Recommended route via <strong>${optimal}</strong> zone (lowest crowd: ${state.crowdData[optimal]}%)</p>
      <p>⏱️ Estimated walking time: ${Math.floor(getRandomInRange(3, 12))} minutes</p>
      <p>💡 Tip: Follow the blue floor markers for the fastest path.</p>
    </div>`);
  sendChatMessage('fan', `I need directions from ${from} to ${to} in the stadium.`);
  
  // Trigger SVG Path Animation
  state.activeNavPath = true;
  renderGateMap('gate-map');
  
  // Clean up path after 4 seconds
  setTimeout(() => {
    state.activeNavPath = false;
    renderGateMap('gate-map');
  }, 4000);
}

// 14. OPERATIONAL BRIEFING
/**
 * @function generateBriefing
 * @description Generates an AI operational briefing based on current state.
 */
async function generateBriefing() {
  const container = document.getElementById('briefing-container');
  if (!container) return;
  container.innerHTML = window.secureHTML('<div class="loading-spinner"></div>');

  const activeIncidents = state.incidents.filter(i => i.status === 'Active').length;
  const highZones = CONSTANTS.ZONES.filter(z => state.crowdData[z] > 75);
  const attendance = Math.round(CONSTANTS.STADIUM_CAPACITY * 0.8);
  const prompt = `Generate an operational briefing. Current data: Attendance: ${formatNumber(attendance)}/${formatNumber(CONSTANTS.STADIUM_CAPACITY)}. Active incidents: ${activeIncidents}. High-density zones: ${highZones.join(', ') || 'None'}. Weather: 72°F Partly Cloudy. Match: ${state.matchData.homeTeam} vs ${state.matchData.awayTeam}, ${state.matchData.time}. Provide: Summary, Key Alerts, Recommendations, Next 30min Forecast.`;

  sendChatMessage('command', prompt);

  setTimeout(() => {
    const time = formatTime(new Date());
    container.innerHTML = window.secureHTML(`
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
          <p>${highZones.length > 0 ? `)High density in: ${highZones.join(', ')}. Flow management protocols active.` : 'All zones at comfortable levels.'}</p>
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
