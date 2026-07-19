# ⚽ StadiumNexus

> **One Platform. Every Experience.**

![StadiumNexus](https://img.shields.io/badge/StadiumNexus-FIFA_2026-C9A84C?style=for-the-badge&labelColor=1A1A2E)
![Version](https://img.shields.io/badge/Version-1.0.0-4ADE80?style=for-the-badge&labelColor=1A1A2E)
![License](https://img.shields.io/badge/License-MIT-E8EAF0?style=for-the-badge&labelColor=1A1A2E)
![Tests](https://img.shields.io/badge/Tests-120%2B_Passing-4ADE80?style=for-the-badge&labelColor=1A1A2E)
![WCAG](https://img.shields.io/badge/WCAG-AA_Compliant-C9A84C?style=for-the-badge&labelColor=1A1A2E)

## 🏟️ Overview

**StadiumNexus** is a GenAI-enabled Smart Stadium Operations Platform built for FIFA World Cup 2026. It enhances stadium operations and the overall tournament experience for **fans**, **organizers**, **volunteers**, and **venue staff** through real-time intelligence, multilingual AI assistance, and operational excellence.

## ✨ Features

### 🏟️ Fan Portal
- **AI Multilingual Assistant** — Chat with Claude AI in 5 languages (English, Spanish, French, Arabic, Portuguese)
- **Smart Navigation** — SVG-based stadium map with 8 gates (A-H), color-coded by status
- **Real-Time Crowd Density** — 6 stadium zones with live capacity monitoring
- **Transport Planner** — Metro, Bus, Shuttle, Walk options with CO2 footprint comparison
- **Match Info** — Live match card with simulated score updates
- **Services Locator** — Food, Restrooms, First Aid, Prayer Rooms, and more

### 🎯 Command Center
- **Live Metrics** — Attendance, Incidents, Staff, Weather at a glance
- **Crowd Heatmap** — SVG overhead view with density visualization
- **AI Incident Manager** — Real-time incident log with AI-suggested responses
- **Volunteer Deployment** — 12 stations with AI-optimized staffing
- **AI Operational Briefing** — Auto-generated briefings with forecasts
- **Sustainability Tracker** — Energy, water, waste, and carbon metrics

### ♿ Accessibility Hub
- **Accessibility AI Assistant** — Dedicated chat for accessibility needs
- **Accessible Route Planner** — Step-free routes with elevator/ramp info
- **Services Grid** — Wheelchair zones, audio description, hearing loops, and more
- **Real-Time Elevator Status** — 6 elevators with live monitoring
- **Companion Request System** — Request personal assistance with AI assignment

### 🚌 Transport & Sustainability
- **Live Transport Board** — Real-time departures with capacity and CO2 data
- **AI Journey Planner** — Eco-friendly route suggestions considering crowd levels
- **Parking Intelligence** — 6 lots with availability, EV charging, and pricing
- **Carbon Impact Calculator** — Personal carbon footprint with green score grading
- **Eco Challenges** — Daily challenges with green points and leaderboard
- **Sustainability Stats** — Today's environmental impact at the stadium

## 🛠️ Tech Stack

| Technology | Purpose |
|-----------|---------|
| HTML5 | Semantic structure |
| CSS3 | Premium glassmorphism design |
| Vanilla JavaScript | Interactive functionality |
| Claude AI (Anthropic) | GenAI-powered features |
| DOMPurify | XSS input sanitization |
| Animate.css | Smooth animations |
| Google Fonts | Inter + Space Grotesk typography |

## 🎨 Design System

- **Primary**: `#1A1A2E` (Dark Navy)
- **Secondary**: `#16213E` (Deeper Navy)
- **Accent**: `#C9A84C` (FIFA Gold)
- **Success**: `#4ADE80` (Green)
- **Danger**: `#FF5252` (Red)
- **Text**: `#E8EAF0` (Light)

## 🚀 Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- An Anthropic API key (for AI features)

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/StadiumNexus.git
   cd StadiumNexus
   ```

2. Add your API key in `app.js`:
   ```javascript
   const API_KEY = 'YOUR_ANTHROPIC_API_KEY';
   ```

3. Open `index.html` in your browser or serve with any static server:
   ```bash
   npx serve .
   ```

## 🧪 Testing

Open the browser console to see the test suite auto-run on load, or execute manually:

```javascript
executeAllTests()
```

**120+ real assertions** covering:
- ✅ Crowd Level Calculations (25 tests)
- ✅ CO2 Emissions Calculations (25 tests)
- ✅ Input Sanitization / XSS Prevention (20 tests)
- ✅ Green Score Grading (15 tests)
- ✅ Utility Functions (15 tests)
- ✅ Transport Logic (15 tests)
- ✅ Accessibility Data (10 tests)

## ♿ Accessibility

- WCAG AA compliant
- Skip navigation link
- ARIA labels on all interactive elements
- Screen reader announcements via `aria-live`
- Focus-visible indicators (gold outline)
- Keyboard navigable
- `prefers-reduced-motion` support
- Minimum 44px touch targets

## 🔒 Security

- Content Security Policy headers
- XSS prevention via DOMPurify + pattern matching
- Input sanitization on all user inputs
- No inline event handlers (except controlled onclick)
- `nosniff` and `strict-origin` referrer policies

## 📱 Responsive Design

- Mobile: 320px+
- Tablet: 768px+
- Desktop: 1024px+
- 4K: 2000px+ (enhanced spacing/fonts)
- Print stylesheet included

## 📄 License

MIT License — Built by **Poovarasu S** for PromptWars Virtual 2026

## 🙏 Acknowledgments

- FIFA World Cup 2026
- Anthropic Claude AI
- Google Fonts (Inter, Space Grotesk)
- DOMPurify by cure53
- Animate.css
