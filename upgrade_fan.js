const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, 'index.html');
const cssPath = path.join(__dirname, 'styles.css');
const jsPath = path.join(__dirname, 'app.js');

let html = fs.readFileSync(htmlPath, 'utf8');
let css = fs.readFileSync(cssPath, 'utf8');
let js = fs.readFileSync(jsPath, 'utf8');

// 1. Footer text
html = html.replace('Powered by Claude AI', 'Powered by NVIDIA AI');
fs.writeFileSync(htmlPath, html);

// 2. CSS Updates
const newCss = `
/* FAN PORTAL UPGRADES */
#fan-portal {
  display: flex;
  flex-direction: column;
  gap: 32px;
}
#fan-portal .card {
  margin-bottom: 0;
}

.nav-path-anim {
  animation: drawPath 2.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@keyframes drawPath {
  0% { stroke-dashoffset: 1200; }
  100% { stroke-dashoffset: 400; }
}

/* Hover States */
.gate-dot, .chat-chip, .service-card, .transport-option {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.chat-chip:hover, .service-card:hover, .transport-option:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 15px rgba(201, 168, 76, 0.3);
  border-color: rgba(201, 168, 76, 0.5);
}

.gate-dot:hover {
  filter: drop-shadow(0px 0px 8px rgba(201, 168, 76, 0.8));
  r: 20;
}
`;
if (!css.includes('/* FAN PORTAL UPGRADES */')) {
  css += '\n' + newCss;
  fs.writeFileSync(cssPath, css);
}

// 3. JS Updates for Map and Path
js = js.replace(/function renderGateMap\(containerId\) \{[\s\S]*?container\.innerHTML = svg;\n\}/m, `function renderGateMap(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const w = 440, h = 300;
  const cx = 220, cy = 150, rx = 180, ry = 110;
  const gates = Object.entries(state.gateStatuses);
  const colors = { open: '#4ADE80', closed: '#FF5252', busy: '#FBBF24' };

  let svg = \`<svg viewBox="0 0 \${w} \${h}" class="gate-map-svg" role="img" aria-label="Stadium gate map">\`;
  
  // Pitch
  svg += \`<ellipse cx="\${cx}" cy="\${cy}" rx="70" ry="40" fill="rgba(26,26,46,0.6)" stroke="rgba(201,168,76,0.15)"/>\`;
  svg += \`<text x="\${cx}" y="\${cy+4}" text-anchor="middle" fill="rgba(201,168,76,0.4)" font-size="11" font-family="Inter">PITCH</text>\`;
  
  // Stadium Bowl
  svg += \`<ellipse cx="\${cx}" cy="\${cy}" rx="\${rx}" ry="\${ry}" fill="none" stroke="rgba(201,168,76,0.25)" stroke-width="2"/>\`;

  // Animated Path
  if (state.activeNavPath) {
    svg += \`<ellipse cx="\${cx}" cy="\${cy}" rx="\${rx}" ry="\${ry}" fill="none" stroke="var(--color-accent)" stroke-width="4" stroke-dasharray="1200" stroke-dashoffset="1200" class="nav-path-anim"/>\`;
  }

  // Gates on Perimeter
  gates.forEach(([gate, status], i) => {
    // Math to position evenly around perimeter (start from left, go clockwise)
    const angle = (i * Math.PI) / 4 + Math.PI;
    const px = cx + rx * Math.cos(angle);
    const py = cy + ry * Math.sin(angle);
    const color = colors[status];
    svg += \`<circle cx="\${px}" cy="\${py}" r="18" fill="\${color}" opacity="0.9"
      style="cursor:pointer; transition: all 0.2s ease;" class="gate-dot"
      onclick="showToast('Gate \${gate}: \${status.toUpperCase()} — AI suggests \${status === 'open' ? 'use this gate' : status === 'busy' ? 'expect 5 min wait' : 'use alternate gate'}', '\${status === 'open' ? 'success' : status === 'busy' ? 'warning' : 'error'}')"/>\`;
    svg += \`<text x="\${px}" y="\${py + 5}" text-anchor="middle" fill="#1A1A2E"
      font-size="14" font-weight="700" font-family="Space Grotesk" style="pointer-events: none;">\${gate}</text>\`;
  });

  svg += '</svg>';
  container.innerHTML = svg;
}`);

// Add animation trigger to getAINavigation
js = js.replace(/sendChatMessage\('fan', `I need directions from \$\{from\} to \$\{to\} in the stadium.`\);\s+\}/m, `sendChatMessage('fan', \`I need directions from \${from} to \${to} in the stadium.\`);
  
  // Trigger SVG Path Animation
  state.activeNavPath = true;
  renderGateMap('gate-map');
  
  // Clean up path after 4 seconds
  setTimeout(() => {
    state.activeNavPath = false;
    renderGateMap('gate-map');
  }, 4000);
}`);

fs.writeFileSync(jsPath, js);
console.log('Fan Portal UI upgraded');
