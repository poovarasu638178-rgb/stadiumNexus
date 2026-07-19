const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, 'index.html');
const cssPath = path.join(__dirname, 'styles.css');
const jsPath = path.join(__dirname, 'app.js');

let html = fs.readFileSync(htmlPath, 'utf8');
let css = fs.readFileSync(cssPath, 'utf8');
let js = fs.readFileSync(jsPath, 'utf8');

// 1. UPDATE index.html
// CSP
html = html.replace('https://api.anthropic.com', 'https://integrate.api.nvidia.com');
html = html.replace('https://api.anthropic.com', 'https://integrate.api.nvidia.com');

// Footer
html = html.replace('Powered by Claude AI', 'Powered by NVIDIA AI');

// Add Lucide script
if (!html.includes('lucide.min.js')) {
  html = html.replace('</head>', '  <script src="https://unpkg.com/lucide@latest"></script>\n</head>');
}

// Replace common Emojis in HTML with placeholder Lucide icons
const iconMap = {
  '⚽': '<i data-lucide="goal"></i>',
  '🏟️': '<i data-lucide="building"></i>',
  '🎯': '<i data-lucide="crosshair"></i>',
  '♿': '<i data-lucide="accessibility"></i>',
  '🚌': '<i data-lucide="bus"></i>',
  '🤖': '<i data-lucide="bot"></i>',
  '🗺️': '<i data-lucide="map"></i>',
  '📊': '<i data-lucide="bar-chart-2"></i>',
  '🚇': '<i data-lucide="train"></i>',
  '📍': '<i data-lucide="map-pin"></i>',
  '👥': '<i data-lucide="users"></i>',
  '⚠️': '<i data-lucide="alert-triangle"></i>',
  '👮': '<i data-lucide="shield"></i>',
  '🌤️': '<i data-lucide="cloud-sun"></i>',
  '🔥': '<i data-lucide="flame"></i>',
  '🚨': '<i data-lucide="siren"></i>',
  '🙋': '<i data-lucide="hand"></i>',
  '📋': '<i data-lucide="clipboard-list"></i>',
  '🌱': '<i data-lucide="leaf"></i>',
  '🛤️': '<i data-lucide="route"></i>',
  '🏥': '<i data-lucide="hospital"></i>',
  '🛗': '<i data-lucide="arrow-up-down"></i>',
  '🤝': '<i data-lucide="handshake"></i>',
  '🅿️': '<i data-lucide="square-parking"></i>',
  '🧮': '<i data-lucide="calculator"></i>',
  '🏆': '<i data-lucide="trophy"></i>',
  '🌿': '<i data-lucide="leafy-green"></i>',
  '🏅': '<i data-lucide="medal"></i>'
};

for (const [emoji, svg] of Object.entries(iconMap)) {
  html = html.split(emoji).join(svg);
  js = js.split(emoji).join(svg);
}

// Ensure Lucide icons initialize on load
if (!js.includes('lucide.createIcons();')) {
  js = js.replace('function showTab(tabId) {', 'function showTab(tabId) {\n  setTimeout(() => lucide.createIcons(), 50);\n');
}

// 2. UPDATE app.js AI Calls
// We already inserted callStadiumAI, now update the 4 features to use it

// planJourney
js = js.replace(
  /setTimeout\(\(\) => \{\s+const metroCO2[\s\S]*?\}, 800\);\s+sendChatMessage\('fan', `Plan my journey from \$\{from\} to \$\{to\}\. Consider current crowd levels and eco-friendly options\.`\);/m,
  `const prompt = \`Plan my journey from \${from} to \${to}. Consider current crowd levels and eco-friendly options. Keep it extremely concise and format it as a short HTML snippet with a <h4><i data-lucide="map"></i> AI Journey Plan</h4> and steps.\`;
  const response = await callStadiumAI(SYSTEM_PROMPTS['fan'], prompt);
  resultEl.innerHTML = \`<div class="ai-tip animate__animated animate__fadeIn">\${response}</div>\`;
  setTimeout(() => lucide.createIcons(), 50);`
);
js = js.replace('function planJourney() {', 'async function planJourney() {');

// optimizeDeployment
js = js.replace(
  /sendChatMessage\('command', `Optimize volunteer deployment[\s\S]*?showToast\('✅ Volunteer deployment optimized', 'success'\);\s+\}, 1200\);/m,
  `const prompt = \`Optimize volunteer deployment. Current staffing: \${state.volunteerStations.map(s => \`\${s.name}: \${s.staffCount}/\${s.required}\`).join(', ')}. Identify understaffed areas and suggest redeployment from overstaffed stations. Keep it concise.\`;
  const response = await callStadiumAI(SYSTEM_PROMPTS['command'], prompt);
  state.volunteerStations.forEach(station => {
    if (station.staffCount < station.required) {
      station.staffCount = station.required;
    }
  });
  renderVolunteerStations('volunteer-stations');
  if (resultEl) {
    resultEl.innerHTML = \`<div class="ai-tip animate__animated animate__fadeIn"><strong>AI:</strong> \${response}</div>\`;
  }
  showToast('✅ Volunteer deployment optimized', 'success');`
);
js = js.replace('function optimizeDeployment() {', 'async function optimizeDeployment() {');

// generateBriefing
js = js.replace(
  /sendChatMessage\('command', prompt\);\s+setTimeout\(\(\) => \{[\s\S]*?\}\, 1500\);/m,
  `const response = await callStadiumAI(SYSTEM_PROMPTS['command'], prompt + ' Format as concise HTML snippet inside a div.');
  const time = formatTime(new Date());
  container.innerHTML = \`
    <div class="briefing-card animate__animated animate__fadeIn">
      <div class="briefing-header">
        <span class="briefing-timestamp">📋 Generated at \${time}</span>
      </div>
      <div class="briefing-content">\${response}</div>
    </div>
  \`;`
);
js = js.replace('function generateBriefing() {', 'async function generateBriefing() {');

// planAccessibleRoute
js = js.replace(
  /sendChatMessage\('accessibility', `Plan an accessible route[\s\S]*?\}, 800\);/m,
  `const prompt = \`Plan an accessible route from \${from} to \${to}.\${filterText} Include elevators, ramps, and rest points. Format as a short HTML snippet.\`;
  const response = await callStadiumAI(SYSTEM_PROMPTS['accessibility'], prompt);
  resultEl.innerHTML = \`<div class="ai-tip animate__animated animate__fadeIn">\${response}</div>\`;`
);
js = js.replace('function planAccessibleRoute() {', 'async function planAccessibleRoute() {');

// getAIIncidentResponse
js = js.replace(
  /sendChatMessage\('command', `Provide a detailed response plan[\s\S]*?showTab\('command-center'\);/m,
  `const prompt = \`Provide a detailed response plan for incident \${incident.id}: \${incident.type} incident in \${incident.zone} zone, severity \${incident.severity}. Current action: \${incident.aiAction}. What additional steps should we take?\`;
  const response = await callStadiumAI(SYSTEM_PROMPTS['command'], prompt);
  showToast(response, 'info', 10000); // Display result in a toast for now
  showTab('command-center');`
);
js = js.replace('function getAIIncidentResponse(incidentId) {', 'async function getAIIncidentResponse(incidentId) {');


// 3. UPDATE styles.css
const newCss = `

/* ==========================================================================
   UI/UX PRO MAX OVERHAUL (Phase 3)
   ========================================================================== */

/* Spacing & Transitions */
:root {
  --transition-fast: 0.15s ease-in-out;
  --transition-normal: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  --focus-ring: 0 0 0 3px rgba(201, 168, 76, 0.4);
}

/* Hover States & Cursors */
a, button, select, input[type="radio"], input[type="checkbox"], .card, .chat-chip {
  cursor: pointer;
  transition: all var(--transition-normal);
}
.card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg), 0 8px 30px rgba(0,0,0,0.3);
  border-color: rgba(201,168,76,0.3);
}

/* Visible Focus States for Keyboard Nav */
*:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring);
  border-radius: var(--radius-sm);
}

/* Contrast Fixes */
.text-muted, .section-subtitle, .metric-label, .metric-sub, .briefing-timestamp {
  color: #CBD5E1 !important; /* Min 4.5:1 contrast against #1A1A2E */
}
.badge-warning {
  background: #F59E0B !important; 
  color: #0F172A !important;
}

/* Command Center Bento Grid layout */
#command-center .dashboard-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: var(--spacing-lg);
  align-items: stretch;
}
#command-center .dashboard-grid > .card {
  margin-bottom: 0;
}
/* Card Spans for Bento */
#command-center .dashboard-grid > div:nth-child(1) { grid-column: span 8; } /* Heatmap */
#command-center .dashboard-grid > div:nth-child(2) { grid-column: span 12; } /* Incidents */
#command-center .dashboard-grid > div:nth-child(3) { grid-column: span 4; } /* Chat */
#command-center .dashboard-grid > div:nth-child(4) { grid-column: span 4; } /* Volunteer */
#command-center .dashboard-grid > div:nth-child(5) { grid-column: span 4; } /* Briefing */
#command-center .dashboard-grid > div:nth-child(6) { grid-column: span 4; } /* Sustainability */

/* Crowd Density Viz Improvements */
.density-bar {
  background: rgba(255, 255, 255, 0.1);
  overflow: hidden;
}
.density-fill {
  background-image: linear-gradient(90deg, rgba(255,255,255,0.1), rgba(255,255,255,0.3));
  transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Lucide Icon Alignment */
.lucide {
  width: 1.25rem;
  height: 1.25rem;
  vertical-align: middle;
  display: inline-block;
  margin-right: 0.25rem;
  stroke: currentColor;
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
`;

css += newCss;

fs.writeFileSync(htmlPath, html);
fs.writeFileSync(cssPath, css);
fs.writeFileSync(jsPath, js);
console.log('Successfully upgraded the app!');
