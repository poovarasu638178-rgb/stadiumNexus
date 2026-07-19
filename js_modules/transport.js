"use strict";

// 11. TRANSPORT SYSTEM
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
    card.innerHTML = window.secureHTML(`
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
    `);
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

  resultEl.innerHTML = window.secureHTML('<div class="loading-spinner"></div>');

  const prompt = `Plan my journey from ${from} to ${to}. Consider current crowd levels and eco-friendly options. Keep it extremely concise and format it as a short HTML snippet with a <h4><i data-lucide="map"></i> AI Journey Plan</h4> and steps.`;
  const response = await callStadiumAI(SYSTEM_PROMPTS['fan'], prompt);
  resultEl.innerHTML = window.secureHTML(`<div class="ai-tip animate__animated animate__fadeIn">${DOMPurify.sanitize(response)}</div>`);
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
    card.innerHTML = window.secureHTML(`
      <div class="parking-header">
        <strong><i data-lucide="square-parking"></i> Lot ${lot.id}</strong>
        <span class="badge ${lot.available === 0 ? 'badge-danger' : lot.available < 100 ? 'badge-warning' : 'badge-success'}">
          ${lot.available === 0 ? 'FULL' : `)${lot.available} spots`}
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
    recEl.innerHTML = window.secureHTML(`<div class="ai-tip"><i data-lucide="bot"></i> <strong>AI Recommendation:</strong> Park at Lot ${bestLot.id} — ${bestLot.available} spots available, ${bestLot.distance} from stadium, $${bestLot.price}/hr. ${bestLot.evSpots} EV charging spots.</div>`);
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

  resultEl.innerHTML = window.secureHTML(`
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
    </div>`);
}
