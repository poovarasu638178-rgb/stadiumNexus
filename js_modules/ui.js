"use strict";

// 8. CROWD MANAGEMENT
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
    // Suppress toast spam, rely on the visual recommendation card instead.
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
    row.innerHTML = window.secureHTML(`
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
    `);
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
    el.innerHTML = window.secureHTML(`<div class="ai-tip"><i data-lucide="bot"></i> <strong>AI Recommendation:</strong> ${highZones[0]} is at ${state.crowdData[highZones[0]]}% capacity. We recommend entering via the ${optimal} zone for a smoother experience.</div>`);
  } else {
    el.innerHTML = window.secureHTML('<div class="ai-tip"><i data-lucide="bot"></i> <strong>AI:</strong> All zones are at comfortable capacity levels. Enjoy the match!</div>');
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

// 9. GATE MAP
/**
 * @function renderGateMap
 * @description Renders the SVG stadium gate map with 8 color-coded gates.
 * @param {string} containerId - Container ID.
 */
function renderGateMap(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const w = 440, h = 300;
  const cx = 220, cy = 150, rx = 180, ry = 110;
  const gates = Object.entries(state.gateStatuses);
  const colors = { open: '#4ADE80', closed: '#FF5252', busy: '#FBBF24' };

  let svg = `<svg width="100%" height="100%" viewBox="0 0 ${w} ${h}" class="gate-map-svg" role="img" aria-label="Stadium gate map">`;
  
  // Pitch
  svg += `<ellipse cx="${cx}" cy="${cy}" rx="70" ry="40" fill="rgba(26,26,46,0.6)" stroke="rgba(201,168,76,0.15)"/>`;
  svg += `<text x="${cx}" y="${cy+4}" text-anchor="middle" fill="rgba(201,168,76,0.4)" font-size="11" font-family="Inter">PITCH</text>`;
  
  // Stadium Bowl
  svg += `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="none" stroke="rgba(201,168,76,0.25)" stroke-width="2"/>`;

  // Animated Path
  if (state.activeNavPath) {
    svg += `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="none" stroke="var(--color-accent)" stroke-width="4" stroke-dasharray="1200" stroke-dashoffset="1200" class="nav-path-anim"/>`;
  }

  // Gates on Perimeter
  gates.forEach(([gate, status], i) => {
    // Math to position evenly around perimeter (start from left, go clockwise)
    const angle = (i * Math.PI) / 4 + Math.PI;
    const px = cx + rx * Math.cos(angle);
    const py = cy + ry * Math.sin(angle);
    const color = colors[status];
    svg += `<circle cx="${px}" cy="${py}" r="18" fill="${color}" opacity="0.9"
      style="cursor:pointer; transition: all 0.2s ease;" class="gate-dot"
      onclick="showToast('Gate ${gate}: ${status.toUpperCase()} — AI suggests ${status === 'open' ? 'use this gate' : status === 'busy' ? 'expect 5 min wait' : 'use alternate gate'}', '${status === 'open' ? 'success' : status === 'busy' ? 'warning' : 'error'}')"/>`;
    svg += `<text x="${px}" y="${py + 5}" text-anchor="middle" fill="#1A1A2E"
      font-size="14" font-weight="700" font-family="Space Grotesk" style="pointer-events: none;">${gate}</text>`;
  });

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

// 12. INCIDENT MANAGEMENT
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

// 13. VOLUNTEER MANAGEMENT
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
    div.innerHTML = window.secureHTML(`
      <div class="station-info">
        <span class="station-name">${station.name}</span>
        <span class="station-count ${isUnder ? 'count-danger' : 'count-ok'}">
          ${station.staffCount} / ${station.required}
        </span>
      </div>
      <div class="density-bar" style="height:6px">
        <div class="density-fill" style="width:${Math.min((station.staffCount / station.required) * 100, 100)}%;background:${isUnder ? '#FF5252' : '#4ADE80'}"></div>
      </div>`);
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
  if (resultEl) resultEl.innerHTML = window.secureHTML('<div class="loading-spinner"></div>');

  const prompt = `Optimize volunteer deployment. Current staffing: ${state.volunteerStations.map(s => `${s.name}: ${s.staffCount}/${s.required}`).join(', ')}. Identify understaffed areas and suggest redeployment from overstaffed stations. Keep it concise.`;
  const response = await callStadiumAI(SYSTEM_PROMPTS['command'], prompt);
  state.volunteerStations.forEach(station => {
    if (station.staffCount < station.required) {
      station.staffCount = station.required;
    }
  });
  renderVolunteerStations('volunteer-stations');
  if (resultEl) {
    resultEl.innerHTML = window.secureHTML(`<div class="ai-tip animate__animated animate__fadeIn"><strong>AI:</strong> ${DOMPurify.sanitize(response)}</div>`);
  }
  showToast('✅ Volunteer deployment optimized', 'success');
}

// 15. SUSTAINABILITY
/**
 * @function renderSustainabilityTracker
 * @description Renders sustainability progress bars for command center.
 * @param {string} containerId - Container ID.
 */
function renderSustainabilityTracker(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const m = state.sustainabilityData;

  container.innerHTML = window.secureHTML(`
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
    <div class="ai-tip" style="margin-top:16px"><i data-lucide="bot"></i> <strong>AI Sustainability Tip:</strong> Today's renewable energy usage is ${m.renewable}% — ${m.renewable >= 80 ? 'excellent! We\'re exceeding our 80% target.' : 'let\'s work toward our 80% target.'}</div>`);
}

/**
 * @function renderSustainabilityStats
 * @description Renders today's sustainability statistics for transport tab.
 * @param {string} containerId - Container ID.
 */
function renderSustainabilityStats(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = window.secureHTML(`
    <div class="stats-cards">
      <div class="stat-card"><div class="stat-icon"><i data-lucide="train"></i></div><div class="stat-value">5,234</div><div class="stat-label">Fans chose public transport</div></div>
      <div class="stat-card"><div class="stat-icon">🚴</div><div class="stat-value">892</div><div class="stat-label">Bikes rented today</div></div>
      <div class="stat-card"><div class="stat-icon"><i data-lucide="leaf"></i></div><div class="stat-value">12.4 tons</div><div class="stat-label">CO₂ saved vs driving</div></div>
      <div class="stat-card"><div class="stat-icon">♻️</div><div class="stat-value">68%</div><div class="stat-label">Waste recycled</div></div>
    </div>`);

  const tipEl = document.getElementById('sustainability-ai-tip');
  if (tipEl) {
    tipEl.innerHTML = window.secureHTML('<div class="ai-tip"><i data-lucide="bot"></i> <strong>AI Tip:</strong> Taking Metro saves 2.4 kg CO₂ compared to a solo car trip. Every green choice counts! 🌍</div>');
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
    item.innerHTML = window.secureHTML(`
      <span class="challenge-icon">${c.icon}</span>
      <span class="challenge-name">${c.name}</span>
      <span class="challenge-points">+${c.points} pts</span>
      ${done ? '<span class="badge badge-success">✅ Done</span>' :
        `)<button class="btn btn-primary btn-sm" onclick="completeChallenge(${c.id}, ${c.points})" aria-label="Complete challenge: ${c.name}">Claim</button>`}
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
    entry.innerHTML = window.secureHTML(`
      <span class="lb-rank">${i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `)#${i + 1}`}</span>
      <span class="lb-name">${l.name}</span>
      <span class="lb-points">${l.points} pts</span>`;
    frag.appendChild(entry);
  });
  container.innerHTML = '';
  container.appendChild(frag);
}

// 16. MATCH INFO
/**
 * @function renderMatchInfo
 * @description Renders the live match information card.
 * @param {string} containerId - Container ID.
 */
function renderMatchInfo(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const m = state.matchData;

  container.innerHTML = window.secureHTML(`
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
    </div>`);
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

// 17. SERVICES LOCATOR
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
    card.innerHTML = window.secureHTML(`
      <span class="service-icon">${srv.icon}</span>
      <strong class="service-name">${srv.name}</strong>
      <span class="service-detail">${srv.detail}</span>`);
    card.addEventListener('click', () => sendChatMessage('fan', srv.query));
    card.addEventListener('keydown', (e) => { if (e.key === 'Enter') sendChatMessage('fan', srv.query); });
    frag.appendChild(card);
  });

  container.innerHTML = '';
  container.appendChild(frag);
}

// 18. ACCESSIBILITY FEATURES
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
    card.innerHTML = window.secureHTML(`
      <span class="service-icon">${srv.icon}</span>
      <strong class="service-name">${srv.name}</strong>
      <span class="service-detail">${srv.detail}</span>`);
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
    card.innerHTML = window.secureHTML(`
      <div class="elevator-header">
        <span class="elevator-id"><i data-lucide="arrow-up-down"></i> ${el.id}</span>
        <span class="elevator-status-dot" style="background:${statusColors[el.status] || '#4ADE80'}"></span>
      </div>
      <div class="elevator-info">
        <span><i data-lucide="map-pin"></i> ${el.floor}</span>
        <span>⏱️ ${el.status === 'Maintenance' ? 'N/A' : el.waitTime + ' min wait'}</span>
        <span class="badge ${el.status === 'Operational' ? 'badge-success' : el.status === 'Maintenance' ? 'badge-danger' : 'badge-warning'}">${el.status}</span>
      </div>`);
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

  resultEl.innerHTML = window.secureHTML('<div class="loading-spinner"></div>');

  const filterText = filters.length > 0 ? ` Needs: ${filters.join(', ')}.` : '';
  const prompt = `Plan an accessible route from ${from} to ${to}.${filterText} Include elevators, ramps, and rest points. Format as a short HTML snippet.`;
  const response = await callStadiumAI(SYSTEM_PROMPTS['accessibility'], prompt);
  resultEl.innerHTML = window.secureHTML(`<div class="ai-tip animate__animated animate__fadeIn">${DOMPurify.sanitize(response)}</div>`);
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

  resultEl.innerHTML = window.secureHTML('<div class="loading-spinner"></div>');

  setTimeout(() => {
    const eta = Math.floor(getRandomInRange(3, 8));
    resultEl.innerHTML = window.secureHTML(`
      <div class="ai-tip animate__animated animate__fadeIn">
        <h4>✅ Companion Request Confirmed</h4>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Assistance:</strong> ${need}</p>
        <p><strong>Location:</strong> ${location}</p>
        <p><strong>Assigned:</strong> Volunteer #${Math.floor(getRandomInRange(100, 999))}</p>
        <p class="eta-highlight">⏱️ Estimated arrival: <strong>${eta} minutes</strong></p>
      </div>`);
    showToast(`✅ Companion assigned! ETA: ${eta} minutes`, 'success');
    document.getElementById('companion-form').reset();
  }, 1000);
}
