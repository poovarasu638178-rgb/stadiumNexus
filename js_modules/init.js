"use strict";

// 19. INITIALIZATION
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
