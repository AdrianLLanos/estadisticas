const MLB_BASE = "https://statsapi.mlb.com/api/v1";
const ESPN_SCOREBOARD = "https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/scoreboard";
const MAX_TEAM_CACHE = 40;
const MAX_PITCHER_CACHE = 140;
const MAX_RECENT_CONTEXT_CACHE = 90;
const LEAGUE = {
  runsPerGame: 4.45,
  hitsPerGame: 8.25,
  era: 4.25,
  whip: 1.30,
  ops: 0.720,
  obp: 0.320,
  slg: 0.400,
  homeRunsPerGame: 1.15,
  walksPerGame: 3.25,
  strikeoutsPerGame: 8.70,
  pitcherK9: 8.60,
  pitcherBb9: 3.20,
  pitcherHr9: 1.15,
  pitcherHits9: 8.45,
  starterInnings: 5.20,
  battingAverage: 0.245,
  runsAllowedPerGame: 4.45,
  totalRunsLine: 8.5,
  // Sabermetric constants
  woba: 0.318,           // League average wOBA
  cFIP: 3.10,            // FIP constant (calibrated to ERA scale)
  babip: 0.300,          // League average BABIP for pitchers
  homeRunRate: 0.032,    // HR per PA league average
  fip: 4.25,             // League average FIP
};

const MLB_STADIUMS = {
  "Angel Stadium": { parkFactor: 1.00, stadiumType: "Neutral", elevation: 160, latitude: 33.8003, longitude: -117.8827 },
  "Chase Field": { parkFactor: 1.04, stadiumType: "Hitter-friendly", elevation: 1086, latitude: 33.4457, longitude: -112.0667 },
  "Oriole Park at Camden Yards": { parkFactor: 1.02, stadiumType: "Hitter-friendly", elevation: 19, latitude: 39.2839, longitude: -76.6216 },
  "Fenway Park": { parkFactor: 1.05, stadiumType: "Hitter-friendly", elevation: 20, latitude: 42.3467, longitude: -71.0972 },
  "Wrigley Field": { parkFactor: 1.03, stadiumType: "Hitter-friendly", elevation: 594, latitude: 41.9484, longitude: -87.6553 },
  "Great American Ball Park": { parkFactor: 1.04, stadiumType: "Hitter-friendly", elevation: 492, latitude: 39.0974, longitude: -84.5067 },
  "Progressive Field": { parkFactor: 1.00, stadiumType: "Neutral", elevation: 660, latitude: 41.4962, longitude: -81.6852 },
  "Coors Field": { parkFactor: 1.12, stadiumType: "Hitter-friendly", elevation: 5280, latitude: 39.7559, longitude: -104.9942 },
  "Comerica Park": { parkFactor: 0.99, stadiumType: "Pitcher-friendly", elevation: 600, latitude: 42.3400, longitude: -83.0486 },
  "Minute Maid Park": { parkFactor: 1.02, stadiumType: "Hitter-friendly", elevation: 50, latitude: 29.7572, longitude: -95.3556 },
  "Daikin Park": { parkFactor: 1.02, stadiumType: "Hitter-friendly", elevation: 50, latitude: 29.7572, longitude: -95.3556 },
  "Dakin Park": { parkFactor: 1.02, stadiumType: "Hitter-friendly", elevation: 50, latitude: 29.7572, longitude: -95.3556 },
  "Kauffman Stadium": { parkFactor: 0.99, stadiumType: "Pitcher-friendly", elevation: 750, latitude: 39.0517, longitude: -94.4803 },
  "Dodger Stadium": { parkFactor: 0.98, stadiumType: "Pitcher-friendly", elevation: 515, latitude: 34.0739, longitude: -118.2400 },
  "Nationals Park": { parkFactor: 1.01, stadiumType: "Neutral", elevation: 26, latitude: 38.8730, longitude: -77.0075 },
  "Citi Field": { parkFactor: 0.99, stadiumType: "Pitcher-friendly", elevation: 28, latitude: 40.7571, longitude: -73.8458 },
  "Sutter Health Park": { parkFactor: 1.01, stadiumType: "Neutral", elevation: 30, latitude: 38.5800, longitude: -121.4931 },
  "PNC Park": { parkFactor: 0.99, stadiumType: "Pitcher-friendly", elevation: 720, latitude: 40.4468, longitude: -80.0058 },
  "Petco Park": { parkFactor: 0.96, stadiumType: "Pitcher-friendly", elevation: 16, latitude: 32.7076, longitude: -117.1570 },
  "T-Mobile Park": { parkFactor: 0.97, stadiumType: "Pitcher-friendly", elevation: 10, latitude: 47.5914, longitude: -122.3327 },
  "Oracle Park": { parkFactor: 0.98, stadiumType: "Pitcher-friendly", elevation: 10, latitude: 37.7786, longitude: -122.3893 },
  "Busch Stadium": { parkFactor: 0.99, stadiumType: "Pitcher-friendly", elevation: 465, latitude: 38.6226, longitude: -90.1928 },
  "George M. Steinbrenner Field": { parkFactor: 1.01, stadiumType: "Neutral", elevation: 10, latitude: 27.9789, longitude: -82.6948 },
  "Globe Life Field": { parkFactor: 1.00, stadiumType: "Neutral", elevation: 558, latitude: 32.7555, longitude: -97.0926 },
  "Rogers Centre": { parkFactor: 1.02, stadiumType: "Hitter-friendly", elevation: 270, latitude: 43.6414, longitude: -79.3894 },
  "Target Field": { parkFactor: 1.00, stadiumType: "Neutral", elevation: 810, latitude: 44.9817, longitude: -93.2783 },
  "Citizens Bank Park": { parkFactor: 1.04, stadiumType: "Hitter-friendly", elevation: 30, latitude: 39.9054, longitude: -75.1665 },
  "Truist Park": { parkFactor: 0.99, stadiumType: "Pitcher-friendly", elevation: 1050, latitude: 33.8900, longitude: -84.4677 },
  "Guaranteed Rate Field": { parkFactor: 1.00, stadiumType: "Neutral", elevation: 595, latitude: 41.8300, longitude: -87.6339 },
  "loanDepot park": { parkFactor: 0.99, stadiumType: "Pitcher-friendly", elevation: 6, latitude: 25.7781, longitude: -80.2197 },
  "Yankee Stadium": { parkFactor: 1.03, stadiumType: "Hitter-friendly", elevation: 28, latitude: 40.8296, longitude: -73.9262 },
  "American Family Field": { parkFactor: 1.02, stadiumType: "Hitter-friendly", elevation: 635, latitude: 43.0282, longitude: -87.9711 },
  "Oakland Coliseum": { parkFactor: 0.89, stadiumType: "Pitcher-friendly", elevation: 20, latitude: 37.7502, longitude: -122.2005 },
  "Tropicana Field": { parkFactor: 0.89, stadiumType: "Pitcher-friendly", elevation: 14, latitude: 27.7683, longitude: -82.6534 },
};

const MLB_PARK_FACTORS = Object.fromEntries(Object.entries(MLB_STADIUMS).map(([name, stadium]) => [name, stadium.parkFactor]));

const MLB_UMPIRES = {
  "Lance Barksdale":   { runsImpact:  0.40, kMultiplier: 0.91, zoneType: "Over / Zona Estrecha" },
  "Angel Hernandez":   { runsImpact:  0.35, kMultiplier: 0.93, zoneType: "Over / Zona Inconsistente" },
  "CB Bucknor":        { runsImpact:  0.30, kMultiplier: 0.94, zoneType: "Over / Zona Inconsistente" },
  "Dan Bellino":       { runsImpact: -0.35, kMultiplier: 1.08, zoneType: "Under / Zona Amplia" },
  "Pat Hoberg":        { runsImpact: -0.20, kMultiplier: 1.05, zoneType: "Precisión Elite / Neutro" },
  "Mark Wegner":       { runsImpact: -0.30, kMultiplier: 1.07, zoneType: "Under / Zona Amplia" },
  "Vic Carapazza":     { runsImpact:  0.25, kMultiplier: 0.95, zoneType: "Over / Zona Estrecha" },
  "Doug Eddings":      { runsImpact:  0.30, kMultiplier: 0.93, zoneType: "Over / Zona Estrecha" },
  "Laz Diaz":          { runsImpact:  0.25, kMultiplier: 0.94, zoneType: "Over / Zona Estrecha" },
  "Ron Kulpa":         { runsImpact: -0.25, kMultiplier: 1.06, zoneType: "Under / Zona Amplia" },
  "Bill Miller":       { runsImpact: -0.30, kMultiplier: 1.07, zoneType: "Under / Zona Amplia" },
  "Jim Wolf":          { runsImpact: -0.25, kMultiplier: 1.06, zoneType: "Under / Zona Amplia" },
  "Ted Barrett":       { runsImpact: -0.20, kMultiplier: 1.04, zoneType: "Under / Zona Amplia" },
  "Alfonso Marquez":   { runsImpact:  0.20, kMultiplier: 0.96, zoneType: "Over / Zona Estrecha" },
  "Nic Lentz":         { runsImpact: -0.25, kMultiplier: 1.05, zoneType: "Under / Zona Amplia" },
};

const MLB_TEAM_DEFENSE = {
  "Toronto Blue Jays":      { drs:  32, oaa:  28, rating: 1.05, label: "Defensa Elite (+DRS)" },
  "Milwaukee Brewers":      { drs:  35, oaa:  30, rating: 1.06, label: "Defensa Elite (+DRS)" },
  "Cleveland Guardians":    { drs:  28, oaa:  24, rating: 1.04, label: "Defensa Excelente" },
  "Texas Rangers":          { drs:  22, oaa:  18, rating: 1.03, label: "Defensa Fuerte" },
  "Arizona Diamondbacks":   { drs:  20, oaa:  16, rating: 1.03, label: "Defensa Fuerte" },
  "Atlanta Braves":         { drs:  18, oaa:  15, rating: 1.02, label: "Defensa Sobre Promedio" },
  "Los Angeles Dodgers":    { drs:  15, oaa:  14, rating: 1.02, label: "Defensa Sobre Promedio" },
  "Baltimore Orioles":      { drs:  14, oaa:  12, rating: 1.02, label: "Defensa Sobre Promedio" },
  "Houston Astros":         { drs:  12, oaa:  10, rating: 1.01, label: "Defensa Solida" },
  "Seattle Mariners":       { drs:  10, oaa:   8, rating: 1.01, label: "Defensa Solida" },
  "San Diego Padres":       { drs:   8, oaa:   6, rating: 1.01, label: "Defensa Solida" },
  "Tampa Bay Rays":         { drs:   6, oaa:   5, rating: 1.01, label: "Defensa Promedio" },
  "New York Yankees":       { drs:   4, oaa:   3, rating: 1.00, label: "Defensa Promedio" },
  "Philadelphia Phillies":  { drs:   2, oaa:   1, rating: 1.00, label: "Defensa Promedio" },
  "Chicago Cubs":           { drs:   0, oaa:   0, rating: 1.00, label: "Defensa Promedio" },
  "Minnesota Twins":        { drs:  -2, oaa:  -2, rating: 0.99, label: "Defensa Promedio" },
  "San Francisco Giants":   { drs:  -4, oaa:  -3, rating: 0.99, label: "Defensa Promedio" },
  "St. Louis Cardinals":    { drs:  -5, oaa:  -4, rating: 0.99, label: "Defensa Bajo Promedio" },
  "Detroit Tigers":         { drs:  -8, oaa:  -6, rating: 0.98, label: "Defensa Bajo Promedio" },
  "Boston Red Sox":         { drs: -12, oaa: -10, rating: 0.97, label: "Defensa Vulnerable" },
  "New York Mets":          { drs: -14, oaa: -11, rating: 0.97, label: "Defensa Vulnerable" },
  "Cincinnati Reds":        { drs: -16, oaa: -14, rating: 0.96, label: "Defensa Vulnerable" },
  "Pittsburgh Pirates":     { drs: -18, oaa: -15, rating: 0.96, label: "Defensa Vulnerable" },
  "Kansas City Royals":     { drs: -20, oaa: -16, rating: 0.95, label: "Defensa Débil" },
  "Los Angeles Angels":     { drs: -22, oaa: -18, rating: 0.95, label: "Defensa Débil" },
  "Washington Nationals":   { drs: -25, oaa: -20, rating: 0.94, label: "Defensa Deficiente (-DRS)" },
  "Miami Marlins":          { drs: -28, oaa: -22, rating: 0.94, label: "Defensa Deficiente (-DRS)" },
  "Colorado Rockies":       { drs: -30, oaa: -25, rating: 0.93, label: "Defensa Deficiente (-DRS)" },
  "Chicago White Sox":      { drs: -35, oaa: -30, rating: 0.92, label: "Defensa Muy Débil (-DRS)" },
  "Oakland Athletics":      { drs: -38, oaa: -32, rating: 0.91, label: "Defensa Muy Débil (-DRS)" },
};

function obtenerDefensaEquipo(teamName) {
  if (!teamName) return { drs: 0, oaa: 0, rating: 1.00, label: "Defensa Promedio" };
  if (MLB_TEAM_DEFENSE[teamName]) return MLB_TEAM_DEFENSE[teamName];
  const norm = normalizeName(teamName || "");
  for (const [key, val] of Object.entries(MLB_TEAM_DEFENSE)) {
    if (normalizeName(key) === norm || norm.includes(normalizeName(key))) return val;
  }
  return { drs: 0, oaa: 0, rating: 1.00, label: "Defensa Promedio" };
}

function calcularImpactoArbitro(umpireName) {
  if (!umpireName) return { runsImpact: 0, kMultiplier: 1.0, zoneType: "Neutro / No Asignado", name: "" };
  if (MLB_UMPIRES[umpireName]) return { ...MLB_UMPIRES[umpireName], name: umpireName };
  const norm = normalizeName(umpireName || "");
  for (const [key, val] of Object.entries(MLB_UMPIRES)) {
    if (normalizeName(key) === norm || norm.includes(normalizeName(key))) return { ...val, name: key };
  }
  return { runsImpact: 0, kMultiplier: 1.0, zoneType: "Zona Estándar", name: umpireName };
}

function extractMlbUmpire(mlbBoxscore) {
  const officials = mlbBoxscore?.officials || mlbBoxscore?.liveData?.boxscore?.officials || [];
  const hp = officials.find(o => 
    String(o.officialType || o.position?.displayName || o.position?.name || o.position || "").toLowerCase().includes("home")
  );
  if (!hp) return null;
  return hp.official?.fullName || hp.athlete?.displayName || hp.displayName || hp.name || null;
}

function extractEspnUmpire(espnEvent, mlbBoxscore = null) {
  const officials = espnEvent?.competitions?.[0]?.officials || [];
  const hp = officials.find(o => 
    String(o.position?.displayName || o.position?.name || o.position || "").toLowerCase().includes("home")
  );
  if (hp) {
    const name = hp.athlete?.displayName || hp.displayName || hp.name || null;
    if (name) return name;
  }
  return extractMlbUmpire(mlbBoxscore);
}


// Maps each stadium name to its local downloaded image file
const STADIUM_IMAGE_MAP = {
  "Angel Stadium":                 "images/angel_stadium.jpg",
  "Chase Field":                   "images/chase_field.jpg",
  "Truist Park":                   "images/truist_park.jpg",
  "Oriole Park at Camden Yards":   "images/oriole_park_at_camden_yards.jpg",
  "Fenway Park":                   "images/fenway_park.jpg",
  "Wrigley Field":                 "images/wrigley_field.jpg",
  "Great American Ball Park":      "images/great_american_ball_park.jpg",
  "Progressive Field":             "images/progressive_field.jpg",
  "Coors Field":                   "images/coors_field.jpg",
  "Comerica Park":                 "images/comerica_park.jpg",
  "Minute Maid Park":              "images/minute_maid_park.jpg",
  "Daikin Park":                   "images/minute_maid_park.jpg",
  "Dakin Park":                    "images/minute_maid_park.jpg",
  "Kauffman Stadium":              "images/kauffman_stadium.jpg",
  "Dodger Stadium":                "images/dodger_stadium.jpg",
  "loanDepot park":                "images/loandepot_park.jpg",
  "American Family Field":         "images/american_family_field.jpg",
  "Target Field":                  "images/target_field.jpg",
  "Yankee Stadium":                "images/yankee_stadium.jpg",
  "Citi Field":                    "images/citi_field.jpg",
  "Citizens Bank Park":            "images/citizens_bank_park.jpg",
  "PNC Park":                      "images/pnc_park.jpg",
  "Petco Park":                    "images/petco_park.jpg",
  "T-Mobile Park":                 "images/t_mobile_park.jpg",
  "Oracle Park":                   "images/oracle_park.jpg",
  "Busch Stadium":                 "images/busch_stadium.jpg",
  "Oakland Coliseum":              "images/oakland_coliseum.jpg",
  "Tropicana Field":               "images/tropicana_field.jpg",
  "Globe Life Field":              "images/globe_life_field.jpg",
  "Rogers Centre":                 "images/rogers_centre.jpg",
  "Nationals Park":                "images/nationals_park.jpg",
  "Guaranteed Rate Field":         "images/guaranteed_rate_field.jpg",
  "Sutter Health Park":            "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Sutter_Health_Park_aerial_view_2023_%28Quintin_Soloviev%29.jpg/1280px-Sutter_Health_Park_aerial_view_2023_%28Quintin_Soloviev%29.jpg",
  "George M. Steinbrenner Field":  "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/MacDill_Aircrew%2C_service_members_kick_off_opening_day_ceremony_for_TB_Rays_%28250328-F-YW699-1029%29.jpg/1280px-MacDill_Aircrew%2C_service_members_kick_off_opening_day_ceremony_for_TB_Rays_%28250328-F-YW699-1029%29.jpg",
};

// Resolves stadium image for a given venue name (fuzzy match)
function getStadiumImage(venueName) {
  if (!venueName) return null;
  if (STADIUM_IMAGE_MAP[venueName]) return STADIUM_IMAGE_MAP[venueName];
  const norm = venueName.toLowerCase();
  for (const [key, val] of Object.entries(STADIUM_IMAGE_MAP)) {
    if (norm.includes(key.toLowerCase()) || key.toLowerCase().includes(norm)) return val;
  }
  return null;
}

// Updates the card #matchupBg element with the correct stadium photo
function setStadiumBackground(venueName) {
  const localBg = document.getElementById('matchupBg');
  const img = getStadiumImage(venueName);
  
  if (!img) {
    if (localBg) localBg.style.opacity = '0';
    return;
  }
  
  // Fade out, swap image, fade back in
  if (localBg) {
    localBg.style.opacity = '0';
    setTimeout(() => {
      localBg.style.backgroundImage = `url('${img}')`;
      localBg.style.opacity = '1';
    }, 350);
  }
}

const LINEUP_POLL_INTERVAL_MS = 3 * 60 * 1000; // 3 minutos

const state = {
  games: [],
  espnEvents: [],
  selectedGamePk: null,
  teamStats: new Map(),
  pitcherStats: new Map(),
  recentContexts: new Map(),
  weatherCache: new Map(),
  activeProjection: null,
  lineupStatusMap: new Map(),
  lineupPollTimer: null,
  isPollingLineups: false,
};

const els = {
  dateInput: document.querySelector("#dateInput"),
  loadBtn: document.querySelector("#loadBtn"),
  compareBtn: document.querySelector("#compareBtn"),
  gamesList: document.querySelector("#gamesList"),
  gameCount: document.querySelector("#gameCount"),
  matchupHeader: document.querySelector("#matchupHeader"),
  matchupMetadata: document.querySelector("#matchupMetadata"),
  predictorCardContent: document.querySelector("#predictorCardContent"),
  statusBox: document.querySelector("#statusBox"),
  summaryGrid: document.querySelector("#summaryGrid"),
  pitcherGrid: document.querySelector("#pitcherGrid"),
  teamStatsGrid: document.querySelector("#teamStatsGrid"),
  resultsBody: document.querySelector("#resultsBody"),
  sourceBadge: document.querySelector("#sourceBadge"),
  lineupAutoBadge: document.querySelector("#lineupAutoBadge"),
  themeToggleBtn: document.querySelector("#themeToggleBtn"),
  themeToggleIcon: document.querySelector("#themeToggleIcon"),
  readingModeBtn: document.querySelector("#readingModeBtn"),
  readingModeIcon: document.querySelector("#readingModeIcon"),
  geminiKeyBtn: document.querySelector("#geminiKeyBtn"),
  geminiKeyModal: document.querySelector("#geminiKeyModal"),
  closeGeminiModalBtn: document.querySelector("#closeGeminiModalBtn"),
  geminiApiKeyInput: document.querySelector("#geminiApiKeyInput"),
  saveGeminiKeyBtn: document.querySelector("#saveGeminiKeyBtn"),
  clearGeminiKeyBtn: document.querySelector("#clearGeminiKeyBtn"),
  aiSummarySection: document.querySelector("#aiSummarySection"),
  bestBetsSection: document.querySelector("#bestBetsSection"),
};

document.addEventListener("DOMContentLoaded", () => {
  els.dateInput.value = toDateInputValue(new Date());
  els.loadBtn.addEventListener("click", loadSlate);
  els.compareBtn.addEventListener("click", compareSelectedGame);
  
  if (els.themeToggleBtn) {
    els.themeToggleBtn.addEventListener("click", toggleTheme);
    updateThemeUI();
  }

  if (els.readingModeBtn) {
    els.readingModeBtn.addEventListener("click", toggleReadingMode);
    updateReadingModeUI();
  }

  if (els.geminiKeyBtn) {
    els.geminiKeyBtn.addEventListener("click", openGeminiModal);
  }
  if (els.closeGeminiModalBtn) {
    els.closeGeminiModalBtn.addEventListener("click", closeGeminiModal);
  }
  if (els.saveGeminiKeyBtn) {
    els.saveGeminiKeyBtn.addEventListener("click", () => {
      const key = els.geminiApiKeyInput ? els.geminiApiKeyInput.value : "";
      setGeminiApiKey(key);
      closeGeminiModal();
      setStatus(key ? "Clave API de Gemini guardada." : "Clave de Gemini eliminada.", "ok");
      if (state.activeProjection) generateGeminiSummary(state.activeProjection);
    });
  }
  if (els.clearGeminiKeyBtn) {
    els.clearGeminiKeyBtn.addEventListener("click", () => {
      setGeminiApiKey("");
      if (els.geminiApiKeyInput) els.geminiApiKeyInput.value = "";
      closeGeminiModal();
      setStatus("Clave API de Gemini borrada.", "neutral");
      if (state.activeProjection) generateGeminiSummary(state.activeProjection);
    });
  }
  
  if (window.lucide) window.lucide.createIcons();
  loadSlate();
  scheduleMidnightReset();
});

function scheduleMidnightReset() {
  const now = new Date();
  const nextMidnight = new Date(now);
  nextMidnight.setHours(24, 0, 0, 0); // Establece a las 12:00 AM del día siguiente
  const msToMidnight = nextMidnight.getTime() - now.getTime();

  setTimeout(() => {
    console.log("Rollover a medianoche: Limpiando caches y actualizando jornada...");
    
    // Limpiar caches en memoria para datos frescos del nuevo día
    state.weatherCache.clear();
    state.teamStats.clear();
    state.pitcherStats.clear();
    state.recentContexts.clear();
    
    const newDateStr = toDateInputValue(new Date());
    
    // Actualizar el selector de fecha al nuevo día
    if (els.dateInput) {
      els.dateInput.value = newDateStr;
    }
    
    // Cargar automáticamente la nueva cartelera avisando al usuario de forma transparente
    loadSlate().then(() => {
      setStatus(`📅 Cambio de fecha automático: Se ha cargado la jornada del ${newDateStr}.`, "ok");
    });
    
    // Agendar el reinicio para el siguiente día
    scheduleMidnightReset();
  }, msToMidnight);
}

function toggleTheme() {
  const isDark = document.documentElement.classList.toggle("dark");
  localStorage.setItem("theme", isDark ? "dark" : "light");
  updateThemeUI();
  if (state.activeProjection) {
    renderPredictor(state.activeProjection);
    renderTeamStats(state.activeProjection);
  }
}

function updateThemeUI() {
  const isDark = document.documentElement.classList.contains("dark");
  if (els.themeToggleIcon) {
    els.themeToggleIcon.setAttribute("data-lucide", isDark ? "sun" : "moon");
    if (window.lucide) window.lucide.createIcons();
  }
}

function toggleReadingMode() {
  const isEnabled = document.documentElement.classList.toggle("reading-mode");
  localStorage.setItem("readingMode", isEnabled ? "enabled" : "disabled");
  updateReadingModeUI();
}

function updateReadingModeUI() {
  const isEnabled = document.documentElement.classList.contains("reading-mode");
  if (els.readingModeBtn) {
    if (isEnabled) {
      els.readingModeBtn.classList.remove("bg-white", "dark:bg-slate-900", "text-slate-900", "dark:text-white");
      els.readingModeBtn.classList.add("bg-amber-100", "dark:bg-amber-950/40", "text-amber-800", "dark:text-amber-300", "border-amber-300", "dark:border-amber-800/80");
    } else {
      els.readingModeBtn.classList.add("bg-white", "dark:bg-slate-900", "text-slate-900", "dark:text-white");
      els.readingModeBtn.classList.remove("bg-amber-100", "dark:bg-amber-950/40", "text-amber-800", "dark:text-amber-300", "border-amber-300", "dark:border-amber-800/80");
    }
  }
}

function stopLineupPolling() {
  if (state.lineupPollTimer) {
    clearInterval(state.lineupPollTimer);
    state.lineupPollTimer = null;
  }
}

function startLineupPolling() {
  stopLineupPolling();
  state.lineupStatusMap.clear();
  checkAllLineups();
  state.lineupPollTimer = setInterval(checkAllLineups, LINEUP_POLL_INTERVAL_MS);
}

async function checkAllLineups() {
  if (state.isPollingLineups || !state.games.length) return;
  state.isPollingLineups = true;
  updateLineupAutoBadge("loading");

  try {
    let newlyConfirmedGame = null;
    let newlyAssignedPitcherGame = null;

    const date = els.dateInput.value || toDateInputValue(new Date());

    // 1. Consulta periódica en segundo plano a las APIs de ESPN y MLB para detectar pitchers abridores asignados recientemente por el manager
    try {
      const [mlbPoll, espnPoll] = await Promise.allSettled([
        fetchJson(`${MLB_BASE}/schedule?sportId=1&date=${date}&hydrate=team,probablePitcher,linescore`),
        fetchJson(`${ESPN_SCOREBOARD}?dates=${date.replaceAll("-", "")}`),
      ]);

      if (espnPoll.status === "fulfilled" && espnPoll.value?.events) {
        state.espnEvents = espnPoll.value.events;
      }

      if (mlbPoll.status === "fulfilled") {
        const dateGroup = mlbPoll.value?.dates?.find((d) => d.date === date) || mlbPoll.value?.dates?.[0];
        const latestMlbGames = dateGroup?.games || [];

        state.games.forEach((game) => {
          const freshMlbGame = latestMlbGames.find((g) => g.gamePk === game.gamePk);
          const espnEvent = findEspnEvent(game);
          const espnPitchers = extractEspnPitchers(espnEvent);

          const hadAwayPitcher = Boolean(game.teams?.away?.probablePitcher?.id || game.teams?.away?.probablePitcher?.fullName);
          const hadHomePitcher = Boolean(game.teams?.home?.probablePitcher?.id || game.teams?.home?.probablePitcher?.fullName);

          if (freshMlbGame?.teams?.away?.probablePitcher) {
            game.teams.away.probablePitcher = freshMlbGame.teams.away.probablePitcher;
          }
          if (freshMlbGame?.teams?.home?.probablePitcher) {
            game.teams.home.probablePitcher = freshMlbGame.teams.home.probablePitcher;
          }

          const hasAwayPitcherNow = Boolean(game.teams?.away?.probablePitcher?.id || espnPitchers?.away?.id);
          const hasHomePitcherNow = Boolean(game.teams?.home?.probablePitcher?.id || espnPitchers?.home?.id);

          const newlyAssigned = (!hadAwayPitcher && hasAwayPitcherNow) || (!hadHomePitcher && hasHomePitcherNow);
          if (newlyAssigned && game.gamePk === state.selectedGamePk) {
            newlyAssignedPitcherGame = game;
          }
        });
      }
    } catch (ePoll) {
      console.warn("Error refrescando lanzadores en segundo plano:", ePoll);
    }

    // 2. Comprobar alineaciones oficiales
    await Promise.allSettled(
      state.games.map(async (game) => {
        const previousStatus = state.lineupStatusMap.get(game.gamePk);
        
        if (previousStatus?.hasLineup) {
          return previousStatus;
        }

        const espnEvent = findEspnEvent(game);
        const feeds = await fetchLineupData(game.gamePk, espnEvent?.id);
        
        const mlbAwayLineup = feeds.mlbBoxscore ? extractMlbLineup(feeds.mlbBoxscore.teams?.away) : null;
        const mlbHomeLineup = feeds.mlbBoxscore ? extractMlbLineup(feeds.mlbBoxscore.teams?.home) : null;
        
        let hasLineup = false;
        let source = "Ninguno";

        if (mlbAwayLineup && mlbHomeLineup) {
          hasLineup = true;
          source = "MLB";
        } else if (feeds.espnSummary) {
          const espnAway = extractEspnLineup(feeds.espnSummary, "away");
          const espnHome = extractEspnLineup(feeds.espnSummary, "home");
          if (espnAway && espnHome) {
            hasLineup = true;
            source = "ESPN";
          }
        }

        const wasConfirmed = previousStatus?.hasLineup || false;

        const currentStatus = {
          gamePk: game.gamePk,
          hasLineup,
          source,
          lastChecked: Date.now(),
        };
        state.lineupStatusMap.set(game.gamePk, currentStatus);

        if (!wasConfirmed && hasLineup && game.gamePk === state.selectedGamePk) {
          newlyConfirmedGame = { game, source };
        }

        return currentStatus;
      })
    );

    const confirmedCount = [...state.lineupStatusMap.values()].filter((s) => s.hasLineup).length;
    const allConfirmed = state.games.length > 0 && confirmedCount === state.games.length;

    updateLineupAutoBadge("ok", allConfirmed);
    renderGames();

    if (newlyConfirmedGame) {
      if (state.activeProjection) {
        setStatus(`¡Alineación oficial confirmada (${newlyConfirmedGame.source}) para ${newlyConfirmedGame.game.teams.away.team.name} vs ${newlyConfirmedGame.game.teams.home.team.name}! Recalculando al instante...`, "ok");
        compareSelectedGame();
      } else {
        setStatus(`¡Alineación oficial confirmada (${newlyConfirmedGame.source}) para ${newlyConfirmedGame.game.teams.away.team.name} vs ${newlyConfirmedGame.game.teams.home.team.name}!`, "ok");
      }
    } else if (newlyAssignedPitcherGame) {
      if (state.activeProjection) {
        setStatus(`¡Pitcher abridor asignado por el manager para ${newlyAssignedPitcherGame.teams.away.team.name} vs ${newlyAssignedPitcherGame.teams.home.team.name}! Recalculando estimaciones e IA...`, "ok");
        compareSelectedGame();
      } else {
        setStatus(`¡Pitcher abridor asignado por el manager para ${newlyAssignedPitcherGame.teams.away.team.name} vs ${newlyAssignedPitcherGame.teams.home.team.name}!`, "ok");
      }
    }
  } catch (err) {
    console.warn("Error en verificación automática de alineaciones y abridores:", err);
    updateLineupAutoBadge("error");
  } finally {
    state.isPollingLineups = false;
  }
}

function updateLineupAutoBadge(status = "ok", allConfirmed = false) {
  if (!els.lineupAutoBadge) return;
  const confirmedCount = [...state.lineupStatusMap.values()].filter((s) => s.hasLineup).length;
  const totalGames = state.games.length;

  if (status === "loading") {
    els.lineupAutoBadge.innerHTML = `
      <span class="relative flex h-2 w-2">
        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
        <span class="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
      </span>
      <span>Auto-Monitoreo (Pitchers & Lineups)...</span>
    `;
    return;
  }

  if (status === "error") {
    els.lineupAutoBadge.innerHTML = `
      <span class="h-2 w-2 rounded-full bg-rose-500"></span>
      <span>Auto-Monitoreo: Error</span>
    `;
    return;
  }

  if (allConfirmed || (totalGames > 0 && confirmedCount === totalGames)) {
    els.lineupAutoBadge.innerHTML = `
      <span class="h-2 w-2 rounded-full bg-emerald-500"></span>
      <span>Auto-Monitoreo Activo (Pitchers & Lineups ${confirmedCount}/${totalGames})</span>
    `;
    return;
  }

  els.lineupAutoBadge.innerHTML = `
    <span class="relative flex h-2 w-2">
      <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
      <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
    </span>
    <span>Auto-Monitoreo Activo (Cada 3 min)</span>
  `;
}

async function loadSlate() {
  setBusy(true, "Cargando partidos de la jornada...");
  clearResults();
  
  // Limpia la caché de clima por completo al cambiar de fecha o recargar la jornada
  state.weatherCache.clear();

  try {
    const date = els.dateInput.value || toDateInputValue(new Date());
    const [mlbResult, espnResult] = await Promise.allSettled([
      fetchJson(`${MLB_BASE}/schedule?sportId=1&date=${date}&hydrate=team,probablePitcher,linescore`),
      fetchJson(`${ESPN_SCOREBOARD}?dates=${date.replaceAll("-", "")}`),
    ]);

    if (mlbResult.status !== "fulfilled") {
      throw new Error("MLB Stats API no respondió correctamente.");
    }

    // Buscar el grupo de la fecha solicitada de forma exacta en la respuesta de la MLB
    const dateGroup = mlbResult.value?.dates?.find((d) => d.date === date) || mlbResult.value?.dates?.[0];
    const rawGames = dateGroup?.games || [];

    state.games = rawGames.filter((game) => {
      // 1. Filtrar partidos cuyo officialDate coincida exactamente con la fecha seleccionada
      const officialDate = game.officialDate || (game.gameDate ? game.gameDate.slice(0, 10) : "");
      const matchesTargetDate = !officialDate || officialDate === date;

      // 2. Descartar partidos cancelados, postergados o reprogramados
      const detailedState = game.status?.detailedState;
      const isNotPostponed = detailedState !== "Postponed" && detailedState !== "Cancelled" && detailedState !== "Rescheduled";

      return matchesTargetDate && isNotPostponed;
    });
    state.espnEvents = espnResult.status === "fulfilled" ? espnResult.value?.events || [] : [];
    state.selectedGamePk = state.games[0]?.gamePk || null;

    renderGames();
    renderMatchupHeader(getSelectedGame());
    els.compareBtn.disabled = !state.selectedGamePk;

    if (!state.games.length) {
      stopLineupPolling();
      updateLineupAutoBadge("ok");
      setStatus("No hay partidos MLB para la fecha seleccionada.", "warn");
      return;
    }

    const espnNote = state.espnEvents.length ? "ESPN conectado" : "ESPN sin respuesta";
    setStatus(`${state.games.length} partidos cargados. ${espnNote}.`, "ok");
    startLineupPolling();
  } catch (error) {
    stopLineupPolling();
    state.games = [];
    state.espnEvents = [];
    state.selectedGamePk = null;
    renderGames();
    renderMatchupHeader(null);
    els.compareBtn.disabled = true;
    setStatus(error.message || "No se pudo cargar la jornada.", "error");
  } finally {
    setBusy(false);
  }
}

async function compareSelectedGame() {
  const game = getSelectedGame();
  if (!game) return;

  // Update stadium background using home team's venue
  setStadiumBackground(game.venue?.name || '');

  const away = game.teams.away.team;
  const home = game.teams.home.team;
  setBusy(true, `Calculando ${away.name} vs ${home.name}...`);

  try {
    const espnEvent = findEspnEvent(game);
    const espnPitchers = extractEspnPitchers(espnEvent);
    const espnWeather = extractEspnWeather(espnEvent);
    const season = String(game.season || new Date(game.gameDate || Date.now()).getFullYear());
    const referenceDate = game.officialDate || toDateInputValue(new Date(game.gameDate || Date.now()));
    
    const [
      awayStats, 
      homeStats, 
      awayMlbPitcher, 
      homeMlbPitcher, 
      awayRecent, 
      homeRecent, 
      awaySplits,
      homeSplits,
      openMeteoWeather, 
      awayBullpenRoster, 
      homeBullpenRoster,
      lineupFeeds,
      awayRosterMap,
      homeRosterMap
    ] = await Promise.all([
      getTeamStats(away.id),
      getTeamStats(home.id),
      getPitcherStats(game.teams.away.probablePitcher?.id, season),
      getPitcherStats(game.teams.home.probablePitcher?.id, season),
      getTeamRecentContext(away.id, referenceDate, game.teams.away.probablePitcher?.id, season),
      getTeamRecentContext(home.id, referenceDate, game.teams.home.probablePitcher?.id, season),
      getTeamHomeAwaySplits(away.id, season),
      getTeamHomeAwaySplits(home.id, season),
      fetchOpenMeteoWeather(game.venue?.name, game.gameDate),
      fetchBullpenRoster(away.id, season, game.teams.away.probablePitcher?.id),
      fetchBullpenRoster(home.id, season, game.teams.home.probablePitcher?.id),
      fetchLineupData(game.gamePk, espnEvent?.id),
      fetchRosterHittingStats(away.id, season),
      fetchRosterHittingStats(home.id, season),
    ]);

    const awayPitcher = mergePitcherSources(espnPitchers.away, awayMlbPitcher, game.teams.away.probablePitcher);
    const homePitcher = mergePitcherSources(espnPitchers.home, homeMlbPitcher, game.teams.home.probablePitcher);
    const weather = openMeteoWeather || espnWeather;

    const awayPitcherMetrics = calcularMetricasPitcher(awayPitcher);
    const homePitcherMetrics = calcularMetricasPitcher(homePitcher);

    // Extract lineups
    const mlbAwayLineupIds = lineupFeeds.mlbBoxscore ? extractMlbLineup(lineupFeeds.mlbBoxscore.teams?.away) : null;
    const mlbHomeLineupIds = lineupFeeds.mlbBoxscore ? extractMlbLineup(lineupFeeds.mlbBoxscore.teams?.home) : null;
    
    let awayLineupPlayers = null;
    let homeLineupPlayers = null;
    let lineupSource = "Ninguno";
    
    if (mlbAwayLineupIds && mlbHomeLineupIds) {
      awayLineupPlayers = getMlbLineupPlayers(mlbAwayLineupIds, lineupFeeds.mlbBoxscore.teams?.away);
      homeLineupPlayers = getMlbLineupPlayers(mlbHomeLineupIds, lineupFeeds.mlbBoxscore.teams?.home);
      lineupSource = "MLB";
    } else if (lineupFeeds.espnSummary) {
      const espnAwayLineup = extractEspnLineup(lineupFeeds.espnSummary, "away");
      const espnHomeLineup = extractEspnLineup(lineupFeeds.espnSummary, "home");
      if (espnAwayLineup && espnHomeLineup) {
        awayLineupPlayers = espnAwayLineup;
        homeLineupPlayers = espnHomeLineup;
        lineupSource = "ESPN";
      }
    }

    const [awayLineupResolved, homeLineupResolved] = await Promise.all([
      awayLineupPlayers ? resolveLineupStats(awayLineupPlayers, awayRosterMap, awayStats, season, homePitcherMetrics) : null,
      homeLineupPlayers ? resolveLineupStats(homeLineupPlayers, homeRosterMap, homeStats, season, awayPitcherMetrics) : null,
    ]);

    // Compute lineup offense stats and adjust team stats
    let adjustedAwayStats = { ...awayStats };
    let adjustedHomeStats = { ...homeStats };
    
    const awayLineupOffense = computeLineupStats(awayLineupResolved, homePitcherMetrics.hand, awayStats);
    const homeLineupOffense = computeLineupStats(homeLineupResolved, awayPitcherMetrics.hand, homeStats);
    
    if (awayLineupOffense) {
      adjustedAwayStats = { ...adjustedAwayStats, ...awayLineupOffense };
    }
    if (homeLineupOffense) {
      adjustedHomeStats = { ...adjustedHomeStats, ...homeLineupOffense };
    }

    const projection = buildProjection({
      game,
      awayStats: adjustedAwayStats,
      homeStats: adjustedHomeStats,
      awayPitcher,
      homePitcher,
      awayRecent,
      homeRecent,
      awaySplits,
      homeSplits,
      espnEvent,
      mlbBoxscore: lineupFeeds?.mlbBoxscore,
      weather,
    });

    projection.awayBullpenRoster = awayBullpenRoster;
    projection.homeBullpenRoster = homeBullpenRoster;
    projection.awayLineup = awayLineupResolved;
    projection.homeLineup = homeLineupResolved;
    projection.lineupSource = lineupSource;

    state.activeProjection = projection;

    if (lineupSource !== "Ninguno") {
      const prevStatus = state.lineupStatusMap.get(game.gamePk);
      if (!prevStatus?.hasLineup) {
        state.lineupStatusMap.set(game.gamePk, {
          gamePk: game.gamePk,
          hasLineup: true,
          source: lineupSource,
          lastChecked: Date.now(),
        });
        updateLineupAutoBadge("ok");
        renderGames();
      }
    }

    renderMatchupHeader(game, projection);
    renderSummary(projection);
    renderBestBets(projection);
    renderPitchers(projection);
    renderLineups(projection);
    renderBullpens(projection);
    renderTeamStats(projection);
    renderResults(projection);
    renderPredictor(projection);
    generateGeminiSummary(projection);
    els.sourceBadge.textContent = espnPitchers.away || espnPitchers.home ? "MLB + ESPN pitchers" : "MLB";
    setStatus(`Comparación actualizada (Alineación ${lineupSource === "Ninguno" ? "estimada" : "confirmada via " + lineupSource}).`, "ok");
  } catch (error) {
    setStatus(error.message || "No se pudo calcular la comparación.", "error");
  } finally {
    setBusy(false);
  }
}

function buildProjection({ game, awayStats, homeStats, awayPitcher, homePitcher, awayRecent, homeRecent, awaySplits, homeSplits, espnEvent, mlbBoxscore = null, weather }) {
  const awayTeam = game.teams.away.team;
  const homeTeam = game.teams.home.team;
  const awayName = shortName(awayTeam.name);
  const homeName = shortName(homeTeam.name);

  const odds = extractEspnOdds(espnEvent);
  const espnRecords = extractEspnTeamRecords(espnEvent);
  const espnTeams = extractEspnTeams(espnEvent);
  awayStats = { ...awayStats, ...espnRecords.away };
  homeStats = { ...homeStats, ...espnRecords.home };
  const awayTeamProfile = buildTeamSplitProfile({
    team: awayTeam,
    recentContext: awayRecent,
    logo: espnTeams.away?.logo,
    abbreviation: espnTeams.away?.abbreviation,
    role: "Visitante",
    seasonStats: awayStats,
  });
  const homeTeamProfile = buildTeamSplitProfile({
    team: homeTeam,
    recentContext: homeRecent,
    logo: espnTeams.home?.logo,
    abbreviation: espnTeams.home?.abbreviation,
    role: "Local",
    seasonStats: homeStats,
  });
  const awayLast10Metrics = awayRecent?.games?.length ? aggregateRecentGames(awayRecent.games, awayStats) : null;
  const homeLast10Metrics = homeRecent?.games?.length ? aggregateRecentGames(homeRecent.games, homeStats) : null;
  const awayOverallMetrics = getFullTeamStatMetrics(awayStats);
  const homeOverallMetrics = getFullTeamStatMetrics(homeStats);
  const awaySplitMetrics = awaySplits?.away || awayTeamProfile.splits.away || null;
  const homeSplitMetrics = homeSplits?.home || homeTeamProfile.splits.home || null;

  const umpireName = extractEspnUmpire(espnEvent, mlbBoxscore);
  const umpireImpact = calcularImpactoArbitro(umpireName);

  const awayDefense = obtenerDefensaEquipo(awayTeam.name);
  const homeDefense = obtenerDefensaEquipo(homeTeam.name);

  const awayPitcherMetrics = calcularMetricasPitcher(awayPitcher);
  const homePitcherMetrics = calcularMetricasPitcher(homePitcher);

  if (umpireImpact.kMultiplier !== 1.0) {
    awayPitcherMetrics.k9 *= umpireImpact.kMultiplier;
    homePitcherMetrics.k9 *= umpireImpact.kMultiplier;
  }

  const awayOffense = calcularOfensivaEquipo(awayStats, homePitcherMetrics.hand, awayLast10Metrics);
  const homeOffense = calcularOfensivaEquipo(homeStats, awayPitcherMetrics.hand, homeLast10Metrics);
  const awayForm = calcularFormaReciente(awayRecent);
  const homeForm = calcularFormaReciente(homeRecent);
  const awayBullpen = calcularBullpenAproximado(awayRecent?.bullpen);
  const homeBullpen = calcularBullpenAproximado(homeRecent?.bullpen);
  const awayLocalia = calcularVentajaLocalia(awayStats, awayRecent, false);
  const homeLocalia = calcularVentajaLocalia(homeStats, homeRecent, true);
  const awayMatchup = calcularMatchup(awayOffense, homePitcherMetrics, homeBullpen, awayForm);
  const homeMatchup = calcularMatchup(homeOffense, awayPitcherMetrics, awayBullpen, homeForm);
  const awaySplitBaseRuns = calcularBaseCarrerasPorSplit({
    offenseSplit: awayTeamProfile.splits.away,
    defenseSplit: homeTeamProfile.splits.home,
    offenseFallbackSplit: awayTeamProfile.splits.all,
    defenseFallbackSplit: homeTeamProfile.splits.all,
    seasonOffenseRuns: fallback(awayStats?.runsPerGame || awayOffense?.runsPerGame, LEAGUE.runsPerGame),
    seasonDefenseRuns: fallback(homeStats?.runsAllowedPerGame, LEAGUE.runsAllowedPerGame),
  });
  const homeSplitBaseRuns = calcularBaseCarrerasPorSplit({
    offenseSplit: homeTeamProfile.splits.home,
    defenseSplit: awayTeamProfile.splits.away,
    offenseFallbackSplit: homeTeamProfile.splits.all,
    defenseFallbackSplit: awayTeamProfile.splits.all,
    seasonOffenseRuns: fallback(homeStats?.runsPerGame || homeOffense?.runsPerGame, LEAGUE.runsPerGame),
    seasonDefenseRuns: fallback(awayStats?.runsAllowedPerGame, LEAGUE.runsAllowedPerGame),
  });
  const awayRunsBase = proyectarCarrerasEquipo({
    splitBaseRuns: awaySplitBaseRuns,
    opponentPitcher: homePitcherMetrics,
    opponentBullpen: homeBullpen,
    recentForm: awayForm,
    matchup: awayMatchup,
    last10Metrics: awayLast10Metrics,
    teamSlg: awayStats?.slg,
    teamSeasonRuns: awayStats?.runsPerGame,
    opponentDefense: homeDefense,
    umpireImpact,
  });
  const homeRunsBase = proyectarCarrerasEquipo({
    splitBaseRuns: homeSplitBaseRuns,
    opponentPitcher: awayPitcherMetrics,
    opponentBullpen: awayBullpen,
    recentForm: homeForm,
    matchup: homeMatchup,
    last10Metrics: homeLast10Metrics,
    teamSlg: homeStats?.slg,
    teamSeasonRuns: homeStats?.runsPerGame,
    opponentDefense: awayDefense,
    umpireImpact,
  });
  const weatherAdjustment = calcularImpactoClima(weather);
  const parkFactor = obtenerParkFactor(game);
  const awayRuns = (awayRunsBase + weatherAdjustment / 2) * parkFactor;
  const homeRuns = (homeRunsBase + weatherAdjustment / 2) * parkFactor;
  const totalRuns = calcularTotalCarreras(awayRuns, homeRuns);
  const awayHits = proyectarHitsEquipo(awayStats, homeStats, homePitcherMetrics, awayForm, homeForm, homePitcherMetrics.hand);
  const homeHits = proyectarHitsEquipo(homeStats, awayStats, awayPitcherMetrics, homeForm, awayForm, awayPitcherMetrics.hand);
  const totalHits = calcularHitsTotales(awayStats, homeStats, homePitcherMetrics, awayPitcherMetrics, awayForm, homeForm);

  // Run Poisson solver for hits (16.5 benchmark)
  const hitsPoisson = calcularHitsPoisson(awayHits, homeHits, 16.5);
  let hitsLean = "";
  let hitsProb = 0;
  if (hitsPoisson.overProb >= 0.525) {
    hitsLean = "Over 16.5 hits";
    hitsProb = hitsPoisson.overProb;
  } else if (hitsPoisson.underProb >= 0.525) {
    hitsLean = "Under 16.5 hits";
    hitsProb = hitsPoisson.underProb;
  } else {
    hitsLean = "Total hits medio";
    hitsProb = Math.max(hitsPoisson.overProb, hitsPoisson.underProb);
  }

  let hitsConfidence = "Baja";
  if (hitsProb >= 0.58) hitsConfidence = "Alta";
  else if (hitsProb >= 0.53) hitsConfidence = "Media";
  const awayRecentRuns = awayRecent?.games?.map(g => g.runsFor);
  const homeRecentRuns = homeRecent?.games?.map(g => g.runsFor);

  // === ANCLA BAYESIANA: Línea de apuestas de ESPN ===
  // El mercado de apuestas es el predictor más eficiente (incorpora todo el contexto)
  // Usamos la línea O/U para anclar parcialmente nuestra proyección (peso: 30%)
  let anchoredAwayRuns = awayRuns;
  let anchoredHomeRuns = homeRuns;
  if (odds.overUnder && odds.overUnder > 0) {
    const linePerTeam = odds.overUnder / 2;
    // Si el modelo difiere mucho de la línea, el mercado tiene razón en un 30%
    anchoredAwayRuns = awayRuns * 0.70 + linePerTeam * 0.30;
    anchoredHomeRuns = homeRuns * 0.70 + linePerTeam * 0.30;
  }

  // === LOB% Factor: eficiencia de conversión Hits → Carreras ===
  const awayLobFactor = awayOffense?.lobFactor ?? 1.0;
  const homeLobFactor = homeOffense?.lobFactor ?? 1.0;
  anchoredAwayRuns = anchoredAwayRuns * awayLobFactor;
  anchoredHomeRuns = anchoredHomeRuns * homeLobFactor;

  // === FACTOR DE CANSANCIO DEL EQUIPO ===
  // Si el equipo llevó 7+ días seguidos sin descanso: -3% en proyección de carreras
  const awayGames = awayRecent?.games || [];
  const homeGames = homeRecent?.games || [];
  const countConsecutiveGames = (games) => {
    if (!games.length) return 0;
    const sorted = [...games].sort((a, b) => String(b.date).localeCompare(String(a.date)));
    let streak = 1;
    for (let i = 1; i < sorted.length; i++) {
      const prev = new Date(sorted[i - 1].date);
      const curr = new Date(sorted[i].date);
      const diff = Math.round((prev - curr) / (1000 * 60 * 60 * 24));
      if (diff === 1) streak++;
      else break;
    }
    return streak;
  };
  const awayStreak = countConsecutiveGames(awayGames);
  const homeStreak = countConsecutiveGames(homeGames);
  const awayFatigueFactor = awayStreak >= 9 ? 0.95 : awayStreak >= 7 ? 0.97 : 1.0;
  const homeFatigueFactor = homeStreak >= 9 ? 0.95 : homeStreak >= 7 ? 0.97 : 1.0;
  anchoredAwayRuns = anchoredAwayRuns * awayFatigueFactor;
  anchoredHomeRuns = anchoredHomeRuns * homeFatigueFactor;

  const calibratedAwayRuns = clamp(anchoredAwayRuns, 1.5, 11.5);
  const calibratedHomeRuns = clamp(anchoredHomeRuns, 1.5, 11.5);
  const calibratedTotalRuns = calcularTotalCarreras(calibratedAwayRuns, calibratedHomeRuns);

  const calibratedAwayHitsRaw = awayHits;
  const calibratedHomeHitsRaw = homeHits;

  const probability = calcularProbabilidadGanador({
    awayRuns: calibratedAwayRuns,
    homeRuns: calibratedHomeRuns,
    awayScores: { pitcher: awayPitcherMetrics, offense: awayOffense, form: awayForm, bullpen: awayBullpen, localia: awayLocalia, matchup: awayMatchup },
    homeScores: { pitcher: homePitcherMetrics, offense: homeOffense, form: homeForm, bullpen: homeBullpen, localia: homeLocalia, matchup: homeMatchup },
    awayRecentRuns,
    homeRecentRuns,
  });
  const diff = round1(calibratedHomeRuns - calibratedAwayRuns);
  const favorite = probability.favorite === "home" ? homeName : awayName;
  const underdog = probability.favorite === "home" ? awayName : homeName;
  const winProbability = probability.value;

  // Run solver using the sportsbook line or standard 8.5
  const targetLine = odds.overUnder || 8.5;
  const finalPoisson = calcularMatrizPoisson(calibratedAwayRuns, calibratedHomeRuns, targetLine, awayRecentRuns, homeRecentRuns, parkFactor);

  // === MOTOR DE SIMULACIÓN MONTE CARLO (10,000 PARTIDOS JUGADA A JUGADA) ===
  const monteCarlo = runMonteCarloSimulation({
    awayRuns: calibratedAwayRuns,
    homeRuns: calibratedHomeRuns,
    awayHits,
    homeHits,
    totalLine: targetLine,
    awayRecentRuns,
    homeRecentRuns,
    iterations: 10000,
    parkFactor,
  });

  // Over/Under lean and probability (ponderado 50% Monte Carlo, 50% Poisson)
  const blendedOverProb = 0.50 * monteCarlo.overProb + 0.50 * finalPoisson.overProb;
  const blendedUnderProb = 0.50 * monteCarlo.underProb + 0.50 * finalPoisson.underProb;

  let totalLean = "";
  let totalProb = 0;
  if (odds.overUnder) {
    if (blendedOverProb >= 0.525) {
      totalLean = `Over ${targetLine}`;
      totalProb = blendedOverProb;
    } else if (blendedUnderProb >= 0.525) {
      totalLean = `Under ${targetLine}`;
      totalProb = blendedUnderProb;
    } else {
      totalLean = `Cerca de ${targetLine}`;
      totalProb = Math.max(blendedOverProb, blendedUnderProb);
    }
  } else {
    if (calibratedTotalRuns >= 8.9) {
      totalLean = "Over estimado";
      totalProb = blendedOverProb;
    } else if (calibratedTotalRuns <= 7.4) {
      totalLean = "Under estimado";
      totalProb = blendedUnderProb;
    } else {
      totalLean = "Total medio";
      totalProb = Math.max(blendedOverProb, blendedUnderProb);
    }
  }

  // Run Line handicap pick and probability (ponderado 50% Monte Carlo, 50% Poisson)
  const blendedHomeMinus1_5 = 0.50 * monteCarlo.homeMinus1_5Prob + 0.50 * finalPoisson.homeMinus1_5Prob;
  const blendedAwayMinus1_5 = 0.50 * monteCarlo.awayMinus1_5Prob + 0.50 * finalPoisson.awayMinus1_5Prob;

  let runLinePick = "";
  let runLineProb = 0;
  if (probability.favorite === "home") {
    if (blendedHomeMinus1_5 >= 0.46) {
      runLinePick = `${homeTeam.name} -1.5`;
      runLineProb = blendedHomeMinus1_5;
    } else {
      runLinePick = `${awayTeam.name} +1.5`;
      runLineProb = 1 - blendedHomeMinus1_5;
    }
  } else {
    if (blendedAwayMinus1_5 >= 0.46) {
      runLinePick = `${awayTeam.name} -1.5`;
      runLineProb = blendedAwayMinus1_5;
    } else {
      runLinePick = `${homeTeam.name} +1.5`;
      runLineProb = 1 - blendedAwayMinus1_5;
    }
  }

  // Confidence calculations based on solver/Sabermetric probabilities
  let confidence = "Baja";
  if (winProbability >= 0.62) confidence = "Alta";
  else if (winProbability >= 0.55) confidence = "Media";

  let totalConfidence = "Baja";
  if (totalProb >= 0.58) totalConfidence = "Alta";
  else if (totalProb >= 0.53) totalConfidence = "Media";

  let handicapConfidence = "Baja";
  if (runLineProb >= 0.58) handicapConfidence = "Alta";
  else if (runLineProb >= 0.53) handicapConfidence = "Media";

  // CANDADO DE CONSISTENCIA DINÁMICA (Ratio Hits-Carreras) aplicado antes de ponderación
  const awayHitsTodayLocked = Math.max(calibratedAwayHitsRaw, calibratedAwayRuns * 1.82);
  const homeHitsTodayLocked = Math.max(calibratedHomeHitsRaw, calibratedHomeRuns * 1.82);

  // REGLA DE PONDERACIÓN ESTRICTA (75/25) para Hits finales
  const finalAwayHits = 0.75 * awayHitsTodayLocked + 0.25 * (awayRecent?.last10?.hitsPerGame ?? LEAGUE.hitsPerGame);
  const finalHomeHits = 0.75 * homeHitsTodayLocked + 0.25 * (homeRecent?.last10?.hitsPerGame ?? LEAGUE.hitsPerGame);
  const finalTotalHits = clamp(finalAwayHits + finalHomeHits, 11.5, 22.5);

  // Run Negative Binomial/Poisson solver for hits
  const awayRecentHits = awayRecent?.games?.map(g => g.hits);
  const homeRecentHits = homeRecent?.games?.map(g => g.hits);
  const hitsPoissonResult = calcularHitsPoisson(finalAwayHits, finalHomeHits, 16.5, awayRecentHits, homeRecentHits);

  let finalHitsLean = "";
  let finalHitsProb = 0;
  if (hitsPoissonResult.overProb >= 0.525) {
    finalHitsLean = "Over 16.5 hits";
    finalHitsProb = hitsPoissonResult.overProb;
  } else if (hitsPoissonResult.underProb >= 0.525) {
    finalHitsLean = "Under 16.5 hits";
    finalHitsProb = hitsPoissonResult.underProb;
  } else {
    finalHitsLean = "Total hits medio";
    finalHitsProb = Math.max(hitsPoissonResult.overProb, hitsPoissonResult.underProb);
  }

  let finalHitsConfidence = "Baja";
  if (finalHitsProb >= 0.58) finalHitsConfidence = "Alta";
  else if (finalHitsProb >= 0.53) finalHitsConfidence = "Media";

  const stadiumInfo = findStadiumInfo(game.venue?.name || "");
  const airDensity = calcularIndiceDensidadAire(weather?.temperature, weather?.humidity, stadiumInfo?.elevation);

  const explanation = buildExplanation({
    awayName,
    homeName,
    awayPitcherMetrics,
    homePitcherMetrics,
    awayOffense,
    homeOffense,
    awayForm,
    homeForm,
    awayBullpen,
    homeBullpen,
    weather,
    odds,
    totalRuns: calibratedTotalRuns,
    monteCarlo,
    airDensity,
  });
  const finalPick = generarPronosticoFinal({
    ganador: favorite,
    probabilidadGanador: Math.round(winProbability * 100),
    carrerasEquipoVisitante: round1(calibratedAwayRuns),
    carrerasEquipoLocal: round1(calibratedHomeRuns),
    totalCarreras: calibratedTotalRuns,
    recomendacionTotal: totalLean,
    handicap: runLinePick,
    hitsTotales: round1(finalTotalHits),
    confianza: confidence,
    marcadorEstimado: `${awayName} ${Math.max(1, Math.round(calibratedAwayRuns))} - ${homeName} ${Math.max(1, Math.round(calibratedHomeRuns))}`,
    explicacion: explanation,
  });

  return {
    ...finalPick,
    game,
    awayName,
    homeName,
    awayRuns: round1(calibratedAwayRuns),
    homeRuns: round1(calibratedHomeRuns),
    awayHits: round1(finalAwayHits),
    homeHits: round1(finalHomeHits),
    totalRuns: calibratedTotalRuns,
    totalHits: round1(finalTotalHits),
    weather,
    airDensity,
    umpireName,
    umpireImpact,
    awayDefense,
    homeDefense,
    monteCarlo,
    diff,
    favorite,
    winProbability,
    runLinePick,
    runLineProb,
    handicapConfidence,
    totalLean,
    confidence,
    totalConfidence,
    odds,
    awayColor: espnTeams.away?.color || "",
    homeColor: espnTeams.home?.color || "",
    awayAlternateColor: espnTeams.away?.alternateColor || "",
    homeAlternateColor: espnTeams.home?.alternateColor || "",
    awayAbbreviation: espnTeams.away?.abbreviation || game.teams.away.team.abbreviation || "",
    homeAbbreviation: espnTeams.home?.abbreviation || game.teams.home.team.abbreviation || "",
    awayOverallMetrics,
    homeOverallMetrics,
    awaySplitMetrics,
    homeSplitMetrics,
    awayLast10Metrics,
    homeLast10Metrics,
    pitchers: {
      away: awayPitcher,
      home: homePitcher,
    },
    model: {
      awayPitcherMetrics,
      homePitcherMetrics,
      awayOffense,
      homeOffense,
      awayForm,
      homeForm,
      awayBullpen,
      homeBullpen,
      awayMatchup,
      homeMatchup,
      weather,
    },
    rows: [
      {
        market: "Ganador",
        pick: favorite,
        estimate: `${Math.round(winProbability * 100)}%`,
        confidence,
        base: explanation[0] || `Carreras: ${awayName} ${round1(calibratedAwayRuns)} - ${homeName} ${round1(calibratedHomeRuns)}`,
      },
      {
        market: "Total carreras",
        pick: totalLean,
        estimate: `${calibratedTotalRuns.toFixed(1)} runs`,
        confidence: totalConfidence,
        base: odds.overUnder
          ? `Línea de ESPN: ${odds.overUnder} (Prob del pick: ${Math.round(totalProb * 100)}% por solver ${finalPoisson.distribution.away === "NegativeBinomial" || finalPoisson.distribution.home === "NegativeBinomial" ? "NB" : "Poisson"})`
          : `Total estimado: ${calibratedTotalRuns.toFixed(1)} (Prob del pick: ${Math.round(totalProb * 100)}% por solver ${finalPoisson.distribution.away === "NegativeBinomial" || finalPoisson.distribution.home === "NegativeBinomial" ? "NB" : "Poisson"})`,
      },
      {
        market: "Handicap",
        pick: runLinePick,
        estimate: `Prob: ${Math.round(runLineProb * 100)}%`,
        confidence: handicapConfidence,
        base: `Diferencia proyectada de carreras: ${diff > 0 ? '+' : ''}${diff}. Calculado vía solver.`,
      },
      {
        market: "Hits totales",
        pick: finalHitsLean,
        estimate: `${finalTotalHits.toFixed(1)} H`,
        confidence: finalHitsConfidence,
        base: `${awayName} ${round1(finalAwayHits)} H, ${homeName} ${round1(finalHomeHits)} H (Prob del pick: ${Math.round(finalHitsProb * 100)}% por solver ${hitsPoissonResult.distribution.away === "NegativeBinomial" || hitsPoissonResult.distribution.home === "NegativeBinomial" ? "NB" : "Poisson"} contra línea 16.5)`,
      },
      ...(weather
        ? [
            {
              market: "Clima",
              pick: `${weather.temperature}°C ${weather.description}`,
              estimate: weather.highTemperature ? `Máx ${weather.highTemperature}°` : "N/D",
              confidence: "Media",
              base: weather.link ? "Datos ESPN" : "Clima obtenido de ESPN",
              outcome: null,
            },
          ]
        : []),
      {
        market: "Árbitro principal",
        pick: umpireImpact && umpireImpact.name ? umpireImpact.name : "Por confirmar",
        estimate: umpireImpact && umpireImpact.name ? umpireImpact.zoneType : "Zona Estándar",
        confidence: umpireImpact && umpireImpact.name ? "Alta" : "Referencia",
        base: umpireImpact && umpireImpact.name
          ? (umpireImpact.runsImpact !== 0 ? `Impacto de zona: ${umpireImpact.runsImpact > 0 ? '+' : ''}${umpireImpact.runsImpact} carreras (Mult. K: ${umpireImpact.kMultiplier}x)` : "Zona de strike estándar")
          : "Árbitro no anunciado aún por MLB/ESPN. Se asume zona neutral estándar.",
        outcome: null,
      },
      {
        market: "Defensa de equipo",
        pick: `${awayName}: ${awayDefense.label} | ${homeName}: ${homeDefense.label}`,
        estimate: `DRS: ${awayDefense.drs} vs ${homeDefense.drs}`,
        confidence: "Media",
        base: `Factor BABIP defensivo: ${awayName} ${awayDefense.rating}x, ${homeName} ${homeDefense.rating}x`,
        outcome: null,
      },
      {
        market: "Marcador estimado",
        pick: finalPick.marcadorEstimado,
        estimate: `${calibratedTotalRuns.toFixed(1)} carreras`,
        confidence: "Referencia",
        base: explanation.slice(1, 3).join(" "),
        outcome: null,
      },
    ],
  };
}

function calcularMetricasPitcher(pitcher = {}) {
  const innings = fallback(pitcher?.innings, LEAGUE.starterInnings * 8);
  const recent = pitcher?.recentStarts || {};
  const recentRuns = Number.isFinite(recent.runsAllowedPerStart) ? recent.runsAllowedPerStart : LEAGUE.runsPerGame * 0.55;
  const recentHits = Number.isFinite(recent.hitsAllowedPerStart) ? recent.hitsAllowedPerStart : LEAGUE.hitsPerGame * 0.55;
  const hand = String(pitcher?.pitchHand || pitcher?.throws || "R").toUpperCase().startsWith("L") ? "L" : "R";

  const rawEra = fallback(pitcher?.era, LEAGUE.era);
  const rawK9 = fallback(pitcher?.k9, LEAGUE.pitcherK9);
  const rawBb9 = fallback(pitcher?.bb9, LEAGUE.pitcherBb9);
  const rawHr9 = fallback(pitcher?.hr9, LEAGUE.pitcherHr9);

  // === FIP (Fielding Independent Pitching) ===
  // Mide solo lo que el pitcher controla: K, BB, HR. Más predictivo que ERA.
  const fip = innings > 0
    ? ((13 * numberOr(pitcher?.homeRuns, (rawHr9 * innings) / 9)) +
       (3  * numberOr(pitcher?.walks,    (rawBb9 * innings) / 9)) -
       (2  * numberOr(pitcher?.strikeouts,(rawK9 * innings) / 9))) / innings + LEAGUE.cFIP
    : LEAGUE.fip;

  // === xFIP (Expected Fielding Independent Pitching) & SIERA ===
  // Reemplaza los HR reales por la tasa neutralizada de la liga (10.5% de batazos de elevado)
  const hits = numberOr(pitcher?.hits, (LEAGUE.pitcherHits9 * innings) / 9);
  const hr   = numberOr(pitcher?.homeRuns, (rawHr9 * innings) / 9);
  const k    = numberOr(pitcher?.strikeouts, (rawK9 * innings) / 9);
  const bb   = numberOr(pitcher?.walks, (rawBb9 * innings) / 9);
  const bfpEst = innings > 0 ? innings * 4.3 : 1;
  const babip = bfpEst > (k + bb + hr) ? (hits - hr) / (bfpEst - k - bb - hr) : LEAGUE.babip;
  const babipLuck = clamp((LEAGUE.babip - clamp(babip, 0.220, 0.380)) * 2.0, -0.25, 0.25);

  const flyballEst = Math.max(1, (bfpEst - k - bb) * 0.35);
  const expectedHrXfip = flyballEst * 0.105;
  const xfip = innings > 0
    ? ((13 * expectedHrXfip) + (3 * bb) - (2 * k)) / innings + LEAGUE.cFIP
    : LEAGUE.fip;

  const kRatePitcher = bfpEst > 0 ? k / bfpEst : 0.20;
  const bbRatePitcher = bfpEst > 0 ? bb / bfpEst : 0.08;
  const siera = clamp(
    6.145 - 16.986 * kRatePitcher + 11.434 * bbRatePitcher + 7.653 * Math.pow(kRatePitcher, 2),
    1.80, 8.20
  );

  // === ERA ajustada: trinomio ERA + FIP + xFIP (40/35/25) con corrección de suerte BABIP ===
  const eraBlended = rawEra * 0.40 + fip * 0.35 + xfip * 0.25;
  const eraAdjusted = clamp(eraBlended - babipLuck * 0.5, 1.50, 8.50);

  // === Forma Reciente: últimas salidas (si existen) ponderan 45% ===
  const recentCount = numberOr(recent.count, 0);
  const recentEraEst = recentCount >= 2
    ? clamp((recentRuns / LEAGUE.runsPerGame) * LEAGUE.era, 1.50, 9.00)
    : eraAdjusted;
  const finalEra = recentCount >= 2
    ? eraAdjusted * 0.55 + recentEraEst * 0.45
    : eraAdjusted;

  // === TTOP (Times Through the Order Penalty) & Catcher Framing ===
  // Los abridores sufren un incremento promedio del +14% en carreras en su 3ª vuelta al orden al bate (bateador #18+)
  const ips = fallback(pitcher?.inningsPerStart, LEAGUE.starterInnings);
  const ttopPenaltyFactor = ips >= 5.2 ? 1.05 : (ips >= 4.5 ? 1.03 : 1.01);

  const framingBoost = numberOr(pitcher?.catcherFramingBoost, 1.0);
  const k9Adjusted = rawK9 * framingBoost;
  const bb9Adjusted = rawBb9 / framingBoost;

  const eraWithTTOP = finalEra * ttopPenaltyFactor;

  const metrics = {
    era: eraWithTTOP,
    eraBase: finalEra,
    eraRaw: rawEra,
    fip: clamp(fip, 1.50, 8.50),
    xfip: clamp(xfip, 1.50, 8.50),
    siera: clamp(siera, 1.50, 8.50),
    babip: clamp(babip, 0.220, 0.380),
    babipLuck,
    ttopPenaltyFactor,
    whip: fallback(pitcher?.whip, LEAGUE.whip),
    innings,
    hits,
    runs: numberOr(pitcher?.runs, (LEAGUE.runsPerGame * innings) / 9),
    earnedRuns: numberOr(pitcher?.earnedRuns, (LEAGUE.era * innings) / 9),
    strikeouts: k,
    walks: bb,
    homeRuns: hr,
    k9: k9Adjusted,
    bb9: bb9Adjusted,
    hr9: rawHr9,
    hitsPerNine: fallback(pitcher?.hitsPerNine, LEAGUE.pitcherHits9),
    inningsPerStart: ips,
    wins: numberOr(pitcher?.wins, 0),
    losses: numberOr(pitcher?.losses, 0),
    throws: pitcher?.throws || pitcher?.pitchHand || "",
    hand,
    recentStarts: recentCount,
    recentRuns,
    recentHits,
  };

  // Score usando FIP+ERA ajustada con TTOP como base principal
  const score =
    normalizeLower(eraWithTTOP, 2.4, 6.2) * 0.20 +
    normalizeLower(metrics.fip, 2.4, 5.8) * 0.18 +
    normalizeLower(metrics.whip, 0.95, 1.65) * 0.15 +
    normalizeHigher(metrics.k9, 5.5, 11.8) * 0.14 +
    normalizeLower(metrics.bb9, 1.4, 5.0) * 0.10 +
    normalizeLower(metrics.hr9, 0.55, 1.95) * 0.10 +
    normalizeHigher(metrics.inningsPerStart, 3.8, 6.6) * 0.07 +
    normalizeLower(recentRuns, 1.1, 4.8) * 0.06;

  return { ...metrics, score: clamp(score, 0, 1), label: scoreLabel(score) };
}

function calcularOfensivaEquipo(team = {}, opponentHand = "R", last10Metrics = null) {
  const splitOps = opponentHand === "L" ? team.opsVsLeft : team.opsVsRight;
  let runsPerGame = fallback(team.runsPerGame, LEAGUE.runsPerGame);
  let hitsPerGame = fallback(team.hitsPerGame, LEAGUE.hitsPerGame);
  let slg = fallback(team.slg, LEAGUE.slg);
  let obp = fallback(team.obp, LEAGUE.obp);
  let homeRunsPerGame = fallback(team.homeRunsPerGame, LEAGUE.homeRunsPerGame);
  let walksPerGame = fallback(team.walksPerGame, LEAGUE.walksPerGame);
  let battingAverage = fallback(team.battingAverage, LEAGUE.battingAverage);

  if (last10Metrics && last10Metrics.games > 0) {
    runsPerGame = 0.70 * runsPerGame + 0.30 * last10Metrics.runsForPerGame;
    hitsPerGame = 0.70 * hitsPerGame + 0.30 * last10Metrics.hitsPerGame;
    if (last10Metrics.slg) slg = 0.70 * slg + 0.30 * last10Metrics.slg;
    if (last10Metrics.homeRunsPerGame) homeRunsPerGame = 0.70 * homeRunsPerGame + 0.30 * last10Metrics.homeRunsPerGame;
  }

  // === wOBA aproximado (Weighted On-Base Average) ===
  // Pondera correctamente cada tipo de batazo por su valor real en carreras
  const estPA = 38.0; // PAs estimados por juego (9 bateadores × ~4.2 PA)
  const bbRate = clamp(walksPerGame / estPA, 0.04, 0.18);
  const hrRate = clamp(homeRunsPerGame / estPA, 0.005, 0.12);
  const hitRate = clamp(hitsPerGame / estPA, 0.10, 0.35);
  const xbhRate = clamp((slg - battingAverage) * hitRate * 0.45, 0.01, 0.08); // XBH rate aprox
  const woba = clamp(
    0.69 * bbRate + 0.89 * (hitRate - xbhRate - hrRate) + 1.27 * xbhRate + 2.10 * hrRate,
    0.250, 0.420
  );
  const wobaFactor = woba / LEAGUE.woba; // ratio vs media de liga

  // === LOB% como factor de eficiencia de conversión Hits→Carreras ===
  const lobPct = numberOr(last10Metrics?.lobPct, 70);
  const lobFactor = lobPct > 75 ? 0.94 : lobPct < 65 ? 1.06 : 1.0;

  const metrics = {
    runsPerGame,
    hitsPerGame,
    ops: fallback(splitOps, fallback(team.ops, LEAGUE.ops)),
    obp,
    slg,
    battingAverage,
    strikeoutsPerGame: fallback(team.strikeoutsPerGame, LEAGUE.strikeoutsPerGame),
    walksPerGame,
    homeRunsPerGame,
    woba,
    wobaFactor,
    lobFactor,
  };

  const score =
    normalizeHigher(metrics.runsPerGame, 3.2, 5.8) * 0.20 +
    normalizeHigher(woba, 0.290, 0.380) * 0.18 +
    normalizeHigher(metrics.ops, 0.63, 0.82) * 0.15 +
    normalizeHigher(metrics.obp, 0.285, 0.355) * 0.12 +
    normalizeHigher(metrics.slg, 0.345, 0.47) * 0.12 +
    normalizeHigher(metrics.hitsPerGame, 6.7, 9.8) * 0.10 +
    normalizeHigher(metrics.walksPerGame, 2.4, 4.2) * 0.07 +
    normalizeHigher(metrics.homeRunsPerGame, 0.65, 1.65) * 0.06;

  return { ...metrics, score: clamp(score, 0, 1), label: scoreLabel(score) };
}

function calcularFormaReciente(context = {}) {
  const last10 = context?.last10 || {};
  const rawGames = context?.games || last10.rawGames || [];
  const gamesList = Array.isArray(rawGames) ? rawGames.slice(-10) : [];
  const sequence = gamesList.map((g) => ((g.win ?? (g.runsFor > g.runsAllowed)) ? "W" : "L"));

  const games10 = gamesList.length || numberOr(last10.games, 0);
  const wins10 = gamesList.length
    ? gamesList.filter((g) => (g.win ?? (g.runsFor > g.runsAllowed))).length
    : numberOr(last10.wins, 0);
  const losses10 = games10 - wins10;

  const metrics = {
    games10,
    wins10,
    losses10,
    sequence,
    runsFor10: fallback(last10.runsForPerGame, average(gamesList.map((g) => g.runsFor)) || LEAGUE.runsPerGame),
    runsAllowed10: fallback(last10.runsAllowedPerGame, average(gamesList.map((g) => g.runsAllowed)) || LEAGUE.runsPerGame),
    hits10: fallback(last10.hitsPerGame, average(gamesList.map((g) => g.hits)) || LEAGUE.hitsPerGame),
    hitsAllowed10: fallback(last10.hitsAllowedPerGame, average(gamesList.map((g) => g.opponentHits)) || LEAGUE.hitsPerGame),
    overRate: Number.isFinite(last10.overRate) ? last10.overRate : 0.5,
  };
  const winRate10 = metrics.games10 ? metrics.wins10 / metrics.games10 : 0.5;
  const runDiff10 = metrics.runsFor10 - metrics.runsAllowed10;
  const score =
    normalizeHigher(winRate10, 0.25, 0.75) * 0.32 +
    normalizeHigher(runDiff10, -1.7, 1.7) * 0.31 +
    normalizeHigher(metrics.runsFor10, 2.8, 6.2) * 0.2 +
    normalizeLower(metrics.runsAllowed10, 2.8, 6.2) * 0.17;

  return { ...metrics, winRate10, runDiff10, score: clamp(score, 0, 1), label: scoreLabel(score) };
}

function calcularBullpenAproximado(bullpen = {}) {
  const innings7 = numberOr(bullpen?.innings7, 0);
  const metrics = {
    relieversAvailable: numberOr(bullpen?.relieversAvailable, 7),
    innings7,
    innings3: numberOr(bullpen?.innings3, 0),
    runs7: innings7 > 0 ? numberOr(bullpen?.runs7, (LEAGUE.runsPerGame * innings7) / 9) : LEAGUE.runsPerGame,
    earnedRuns7: innings7 > 0 ? numberOr(bullpen?.earnedRuns7, (LEAGUE.era * innings7) / 9) : LEAGUE.era,
    hits7: innings7 > 0 ? numberOr(bullpen?.hits7, (LEAGUE.hitsPerGame * innings7) / 9) : LEAGUE.hitsPerGame,
    walks7: innings7 > 0 ? numberOr(bullpen?.walks7, (LEAGUE.walksPerGame * innings7) / 9) : LEAGUE.walksPerGame,
    pitches3: numberOr(bullpen?.pitches3, 0),
    outingsBackToBack: numberOr(bullpen?.outingsBackToBack, 0),
  };
  metrics.era = innings7 > 0 ? (metrics.earnedRuns7 * 9) / innings7 : LEAGUE.era;
  metrics.whip = innings7 > 0 ? (metrics.hits7 + metrics.walks7) / innings7 : LEAGUE.whip;
  metrics.runsPerNine = innings7 > 0 ? (metrics.runs7 / innings7) * 9 : LEAGUE.runsPerGame;
  metrics.fatigue = clamp(
    normalizeHigher(metrics.innings3, 4, 14) * 0.52 +
      normalizeHigher(metrics.pitches3, 70, 230) * 0.34 +
      normalizeHigher(metrics.outingsBackToBack, 0, 5) * 0.14,
    0,
    1
  );
  const score =
    normalizeLower(metrics.era, 2.8, 5.8) * 0.33 +
    normalizeLower(metrics.whip, 1.05, 1.65) * 0.25 +
    normalizeLower(metrics.runsPerNine, 2.8, 6.3) * 0.17 +
    normalizeLower(metrics.fatigue, 0, 1) * 0.18 +
    normalizeHigher(metrics.relieversAvailable, 5, 10) * 0.07;

  return { ...metrics, score: clamp(score, 0, 1), label: scoreLabel(score) };
}

function calcularVentajaLocalia(team = {}, context = {}, isHome = false) {
  const record = isHome ? team.homeRecord : team.awayRecord;
  const pct = Number.isFinite(record?.pct) ? record.pct : 0.5;
  const recentLocationPct = isHome ? context?.homeWinRate : context?.awayWinRate;
  const base = isHome ? 0.53 : 0.47;
  const score = clamp(base + (pct - 0.5) * 0.35 + (numberOr(recentLocationPct, 0.5) - 0.5) * 0.15, 0.35, 0.65);
  return { score, isHome, recordPct: pct, label: isHome ? "Local" : "Visitante" };
}

function calcularMatchup(offense, opponentPitcher, opponentBullpen, recentForm) {
  const pitcherWeakness = 1 - numberOr(opponentPitcher?.score, 0.5);
  const bullpenWeakness = 1 - numberOr(opponentBullpen?.score, 0.5);
  const score =
    numberOr(offense?.score, 0.5) * 0.38 +
    pitcherWeakness * 0.3 +
    bullpenWeakness * 0.16 +
    numberOr(recentForm?.score, 0.5) * 0.16;

  return { score: clamp(score, 0, 1), pitcherWeakness, bullpenWeakness, label: scoreLabel(score) };
}

function calcularBaseCarrerasPorSplit({ offenseSplit, defenseSplit, offenseFallbackSplit, defenseFallbackSplit, seasonOffenseRuns = LEAGUE.runsPerGame, seasonDefenseRuns = LEAGUE.runsAllowedPerGame }) {
  const recentOffenseRuns = firstFinite(
    offenseSplit?.runsForPerGame,
    offenseFallbackSplit?.runsForPerGame,
    seasonOffenseRuns
  );
  const recentDefenseRunsAllowed = firstFinite(
    defenseSplit?.runsAllowedPerGame,
    defenseFallbackSplit?.runsAllowedPerGame,
    seasonDefenseRuns
  );

  // Ponderación sabermétrica: 60% temporada completa + 40% muestra reciente
  const offenseRuns = 0.60 * seasonOffenseRuns + 0.40 * recentOffenseRuns;
  const defenseRunsAllowed = 0.60 * seasonDefenseRuns + 0.40 * recentDefenseRunsAllowed;

  return clamp((offenseRuns + defenseRunsAllowed) / 2, 1.5, 11.5);
}

function proyectarCarrerasEquipo({ splitBaseRuns, opponentPitcher, opponentBullpen, recentForm, matchup, last10Metrics = null, teamSlg = null, teamSeasonRuns = null, opponentDefense = null, umpireImpact = null }) {
  // Pitcher factor: starting pitcher ERA relative to league average and score
  const pitcherEraRatio = fallback(opponentPitcher?.era, LEAGUE.era) / LEAGUE.era;
  const pitcherScoreFactor = 1.0 + (0.5 - numberOr(opponentPitcher?.score, 0.5)) * 0.25;
  const starterFactor = (pitcherEraRatio * 0.6 + pitcherScoreFactor * 0.4);

  // Bullpen factor: bullpen ERA relative to league average and score
  const bullpenEraRatio = fallback(opponentBullpen?.era, LEAGUE.era) / LEAGUE.era;
  const bullpenScoreFactor = 1.0 + (0.5 - numberOr(opponentBullpen?.score, 0.5)) * 0.15;
  const bullpenFactor = (bullpenEraRatio * 0.6 + bullpenScoreFactor * 0.4);

  // Ponderación MLB real: Abridor lanza ~5.2 IP (58%), Bullpen lanza ~3.8 IP (42%)
  const pitchingFactor = starterFactor * 0.58 + bullpenFactor * 0.42;

  // Recent form factor (residual trend)
  const formFactor = 1.0 + (numberOr(recentForm?.score, 0.5) - 0.5) * 0.15;

  // Matchup factor
  const matchupFactor = 1.0 + (numberOr(matchup?.score, 0.5) - 0.5) * 0.15;

  // Factor de Eficiencia Defensiva del Equipo (DRS / OAA)
  const defenseRating = numberOr(opponentDefense?.rating, 1.00);
  const defenseFactor = 1.0 / defenseRating; // Defensa Elite (1.05) reduce carreras rivales

  // Ajuste por Árbitro Principal (Home Plate Umpire)
  const umpireAdjustment = numberOr(umpireImpact?.runsImpact, 0) / 2.0;

  // BASE: usar carreras de temporada del equipo como ancla principal
  let baseExpectedRuns;
  const seasonRuns = fallback(teamSeasonRuns, 0);
  const splitRuns = fallback(splitBaseRuns, 0);

  if (seasonRuns > 0 && splitRuns > 0) {
    baseExpectedRuns = 0.65 * seasonRuns + 0.35 * splitRuns;
  } else if (seasonRuns > 0) {
    baseExpectedRuns = seasonRuns;
  } else if (splitRuns > 0) {
    baseExpectedRuns = splitRuns;
  } else {
    baseExpectedRuns = LEAGUE.runsPerGame;
  }

  if (last10Metrics && last10Metrics.runsForPerGame > 0) {
    baseExpectedRuns = 0.80 * baseExpectedRuns + 0.20 * last10Metrics.runsForPerGame;
  }

  let raw = baseExpectedRuns * pitchingFactor * formFactor * matchupFactor * defenseFactor + umpireAdjustment;

  // Factor de Poder / ISO: Si el SLG del equipo es mayor a 0.420
  const slgValue = numberOr(teamSlg, 0);
  if (slgValue > 0.420) {
    raw *= (1.0 + (slgValue - 0.420) * 1.5);
  }

  return clamp(raw, 1.5, 11.5);
}

function calcularProbabilidadGanador({ awayRuns, homeRuns, awayScores, homeScores, awayRecentRuns, homeRecentRuns }) {
  const weights = { pitcher: 0.3, offense: 0.25, form: 0.15, bullpen: 0.15, localia: 0.05, matchup: 0.1 };
  const awayComposite = weightedTeamScore(awayScores, weights);
  const homeComposite = weightedTeamScore(homeScores, weights);
  
  // Calculate winning probability via Pythagenpat
  const pythagenpatHomeProb = pythagoreanWinProb(awayRuns, homeRuns);
  
  // Calculate winning probability via solver matrix (which handles NB / Poisson dynamically)
  const poissonResult = calcularMatrizPoisson(awayRuns, homeRuns, LEAGUE.totalRunsLine, awayRecentRuns, homeRecentRuns);
  const poissonHomeProb = poissonResult.homeWinProb;

  // Monte Carlo 10,000 games simulation for win probability
  const monteCarloResult = runMonteCarloSimulation({
    awayRuns,
    homeRuns,
    awayHits: awayRuns * 1.82,
    homeHits: homeRuns * 1.82,
    totalLine: LEAGUE.totalRunsLine,
    awayRecentRuns,
    homeRecentRuns,
    iterations: 10000,
  });
  const monteCarloHomeProb = monteCarloResult.homeWinProb;

  // Model index edge (traditional composite weight)
  const modelEdge = clamp((homeComposite - awayComposite) * 1.35, -0.25, 0.25);
  const compositeHomeProb = clamp(0.5 + modelEdge, 0.25, 0.75);

  // Consolidate the probabilities: 40% Monte Carlo 10k, 30% Poisson solver, 20% Pythagenpat, 10% Composite score
  const homeProb = clamp(
    monteCarloHomeProb * 0.40 +
    poissonHomeProb * 0.30 +
    pythagenpatHomeProb * 0.20 +
    compositeHomeProb * 0.10,
    0.20,
    0.80
  );
  const favorite = homeProb >= 0.5 ? "home" : "away";

  return {
    favorite,
    value: favorite === "home" ? homeProb : 1 - homeProb,
    homeProb,
    awayComposite,
    homeComposite,
    poissonResult,
    monteCarloResult,
  };
}

function calcularTotalCarreras(awayRuns, homeRuns) {
  return round1(clamp(awayRuns + homeRuns, 3.0, 22.0));
}

function calcularHandicap({ diff, favorite, underdog }) {
  return Math.abs(diff) >= 1.25 ? `${favorite} -1.5` : `${underdog} +1.5`;
}

function calcularHitsTotales(awayStats, homeStats, homePitcher, awayPitcher, awayForm, homeForm) {
  const awayHits = proyectarHitsEquipo(awayStats, homeStats, homePitcher, awayForm, homeForm);
  const homeHits = proyectarHitsEquipo(homeStats, awayStats, awayPitcher, homeForm, awayForm);
  return round1(clamp(awayHits + homeHits, 11.5, 22.5));
}

function calcularConfianza({ diff, winProbability, awayScore, homeScore }) {
  const modelGap = Math.abs(homeScore - awayScore);
  if (diff >= 1.7 && winProbability >= 0.6 && modelGap >= 0.09) return "Alta";
  if (diff >= 0.85 && winProbability >= 0.55 && modelGap >= 0.045) return "Media";
  return "Baja";
}

function generarPronosticoFinal(result) {
  return {
    ganador: result.ganador || "",
    probabilidadGanador: Math.round(numberOr(result.probabilidadGanador, 0)),
    carrerasEquipoVisitante: round1(numberOr(result.carrerasEquipoVisitante, 0)),
    carrerasEquipoLocal: round1(numberOr(result.carrerasEquipoLocal, 0)),
    totalCarreras: round1(numberOr(result.totalCarreras, 0)),
    recomendacionTotal: result.recomendacionTotal || "",
    handicap: result.handicap || "",
    hitsTotales: round1(numberOr(result.hitsTotales, 0)),
    confianza: result.confianza || "Baja",
    marcadorEstimado: result.marcadorEstimado || "",
    explicacion: Array.isArray(result.explicacion) ? result.explicacion : [],
  };
}

async function fetchTeamRecent10Games(teamId, referenceDate, season) {
  let year = Number(season || (referenceDate ? String(referenceDate).split("-")[0] : new Date().getFullYear()));

  for (let currentYear of [year, year - 1]) {
    try {
      const [hittingRes, pitchingRes] = await Promise.allSettled([
        fetchJson(`${MLB_BASE}/teams/${teamId}/stats?stats=gameLog&group=hitting&season=${currentYear}`),
        fetchJson(`${MLB_BASE}/teams/${teamId}/stats?stats=gameLog&group=pitching&season=${currentYear}`)
      ]);

      const hittingLogs = hittingRes.status === "fulfilled" ? hittingRes.value?.stats?.[0]?.splits || [] : [];
      const pitchingLogs = pitchingRes.status === "fulfilled" ? pitchingRes.value?.stats?.[0]?.splits || [] : [];

      if (hittingLogs.length > 0) {
        const recentLogs = hittingLogs.slice(-10);
        const parsedGames = recentLogs.map(hLog => {
          const dateStr = hLog.date;
          const pStat = pitchingLogs.find(p => p.date === dateStr)?.stat || {};
          const hStat = hLog.stat || {};
          const runsFor = number(hStat.runs);
          const runsAllowed = number(pStat.runs) || number(pStat.earnedRuns);
          const hits = number(hStat.hits);
          const opponentHits = number(pStat.hits) || estimateHitsFromRuns(runsAllowed);
          const hr = number(hStat.homeRuns);
          const bb = number(hStat.baseOnBalls);
          const ab = number(hStat.atBats) || 34;
          const slg = number(hStat.slg) || LEAGUE.slg;
          const isHome = hLog.isHome ?? true;

          return {
            gamePk: hLog.game?.gamePk || Math.random(),
            date: dateStr,
            isHome,
            runsFor,
            runsAllowed,
            hits,
            opponentHits,
            win: runsFor > runsAllowed || Boolean(hLog.isWin),
            totalRuns: runsFor + runsAllowed,
            over: (runsFor + runsAllowed) >= LEAGUE.totalRunsLine,
            bullpen: null,
            hr,
            bb,
            lob: Math.max(1, hits + bb - runsFor),
            ab,
            slg,
          };
        });

        if (parsedGames.length > 0) return parsedGames;
      }
    } catch (e) {
      console.warn(`No se pudo obtener gameLog para el año ${currentYear}:`, e);
    }
  }

  return [];
}

async function getTeamRecentContext(teamId, referenceDate, probablePitcherId, season) {
  const cacheKey = `${teamId}-${referenceDate}-${probablePitcherId || "na"}`;
  if (state.recentContexts.has(cacheKey)) return state.recentContexts.get(cacheKey);

  try {
    let parsedGames = [];
    const end = addDays(referenceDate, -1);
    const start = addDays(referenceDate, -120);

    try {
      const schedule = await fetchJson(`${MLB_BASE}/schedule?sportId=1&teamId=${teamId}&startDate=${start}&endDate=${end}&hydrate=team,linescore`);
      const finalGames = (schedule.dates || [])
        .flatMap((date) => date.games || [])
        .filter((game) => {
          const state = String(game.status?.abstractGameState || game.status?.detailedState || "").toLowerCase();
          const code = String(game.status?.statusCode || "").toLowerCase();
          return (state.includes("final") || state.includes("completed") || code === "f") &&
                 !state.includes("postponed") && !state.includes("cancelled");
        });

      if (finalGames.length >= 5) {
        const games = finalGames.slice(-10);
        const boxscores = await Promise.allSettled(games.map((game) => fetchJson(`${MLB_BASE}/game/${game.gamePk}/boxscore`)));
        games.forEach((game, index) => {
          const boxscore = boxscores[index].status === "fulfilled" ? boxscores[index].value : null;
          const parsed = parseRecentTeamGame(game, boxscore, teamId);
          if (parsed) parsedGames.push(parsed);
        });
      }
    } catch (errSched) {
      console.warn("Error consultando schedule para recientes:", errSched);
    }

    if (parsedGames.length < 5) {
      const logGames = await fetchTeamRecent10Games(teamId, referenceDate, season);
      if (logGames.length > 0) {
        parsedGames = logGames;
      }
    }

    const roster = await getActivePitchers(teamId, probablePitcherId).catch(() => ({ relieversAvailable: 7 }));
    const bullpenGames = parsedGames.map(g => g.bullpen).filter(Boolean);

    const context = {
      games: parsedGames,
      splitGames: {
        all: parsedGames,
        home: parsedGames.filter((game) => game.isHome),
        away: parsedGames.filter((game) => !game.isHome),
      },
      last10: aggregateRecentGames(parsedGames),
      bullpen: aggregateBullpenGames(bullpenGames, referenceDate, roster.relieversAvailable || 7),
      homeWinRate: locationWinRate(parsedGames, true),
      awayWinRate: locationWinRate(parsedGames, false),
    };

    setLimitedMapValue(state.recentContexts, cacheKey, context, MAX_RECENT_CONTEXT_CACHE);
    return context;
  } catch (err) {
    console.warn("Error en getTeamRecentContext:", err);
    const neutral = {
      games: [],
      splitGames: { all: [], home: [], away: [] },
      last10: null,
      bullpen: aggregateBullpenGames([], referenceDate, 7),
      homeWinRate: 0.5,
      awayWinRate: 0.5,
    };
    setLimitedMapValue(state.recentContexts, cacheKey, neutral, MAX_RECENT_CONTEXT_CACHE);
    return neutral;
  }
}

async function getActivePitchers(teamId, probablePitcherId) {
  try {
    const data = await fetchJson(`${MLB_BASE}/teams/${teamId}/roster?rosterType=active&hydrate=person(stats(type=season,group=pitching))`);
    const pitchers = (data.roster || []).filter((item) => item.position?.type === "Pitcher");
    const relievers = pitchers.filter((item) => {
      const stat = item.person?.stats?.[0]?.splits?.[0]?.stat || {};
      const games = number(stat.gamesPlayed);
      const starts = number(stat.gamesStarted);
      return item.person?.id !== probablePitcherId && (games === 0 || starts <= Math.max(1, games * 0.45));
    });
    return { pitchers, relieversAvailable: relievers.length || Math.max(pitchers.length - 5, 6) };
  } catch {
    return { pitchers: [], relieversAvailable: 7 };
  }
}

async function fetchBullpenRoster(teamId, season, probablePitcherId) {
  try {
    const data = await fetchJson(
      `${MLB_BASE}/teams/${teamId}/roster?rosterType=active&hydrate=person(stats(type=season,group=pitching,season=${season}))`
    );
    const pitchers = (data.roster || []).filter((item) => item.position?.type === "Pitcher");
    const relievers = pitchers
      .filter((item) => {
        if (item.person?.id === probablePitcherId) return false;
        const personStats = item.person?.stats || [];
        const pitchingGroup = personStats.find((s) => s.group?.displayName === "pitching") || personStats[0];
        const stat = pitchingGroup?.splits?.[0]?.stat || {};
        const games = number(stat.gamesPlayed);
        const starts = number(stat.gamesStarted);
        // Include if 0 starts or starts are ≤45% of appearances → reliever
        return games === 0 || starts <= Math.max(1, games * 0.45);
      })
      .map((item) => {
        const person = item.person || {};
        const personStats = person.stats || [];
        const pitchingGroup = personStats.find((s) => s.group?.displayName === "pitching") || personStats[0];
        const stat = pitchingGroup?.splits?.[0]?.stat || {};
        const innings = inningsToNumber(stat.inningsPitched);
        const earnedRuns = number(stat.earnedRuns);
        const era = innings > 0 ? (earnedRuns * 9) / innings : null;
        const hits = number(stat.hits);
        const walks = number(stat.baseOnBalls);
        const whip = innings > 0 ? (hits + walks) / innings : null;
        const strikeouts = number(stat.strikeOuts);
        const k9 = innings > 0 ? (strikeouts * 9) / innings : null;
        const games = number(stat.gamesPlayed);
        const saves = number(stat.saves);
        const holds = number(stat.holds);
        const blownSaves = number(stat.blownSaves);
        const hand = String(person.pitchHand?.code || person.pitchHand?.description || "R").toUpperCase().startsWith("L") ? "L" : "R";
        return {
          id: person.id,
          name: person.fullName || item.person?.fullName || "N/D",
          shortName: person.lastName || person.fullName || "N/D",
          jersey: item.jerseyNumber || "",
          hand,
          games,
          innings,
          inningsDisplay: stat.inningsPitched || (innings > 0 ? innings.toFixed(1) : "N/D"),
          era,
          whip,
          k9,
          saves,
          holds,
          blownSaves,
          strikeouts,
          walks,
        };
      })
      // Sort: closers first (saves), then holds, then ERA
      .sort((a, b) => {
        if (b.saves !== a.saves) return b.saves - a.saves;
        if (b.holds !== a.holds) return b.holds - a.holds;
        const eraA = Number.isFinite(a.era) ? a.era : 99;
        const eraB = Number.isFinite(b.era) ? b.era : 99;
        return eraA - eraB;
      });
    return relievers;
  } catch {
    return [];
  }
}

async function fetchRosterHittingStats(teamId, season) {
  try {
    const url = `${MLB_BASE}/teams/${teamId}/roster?rosterType=active&hydrate=person(stats(type=[season,statSplits,gameLog],group=[hitting],sitCodes=[vl,vr],season=${season}))`;
    const data = await fetchJson(url);
    const players = data.roster || [];
    const rosterMap = new Map();
    
    players.forEach(item => {
      const person = item.person || {};
      const position = item.position || {};
      const parsed = parseHitterStats(person, position);
      if (parsed) {
        rosterMap.set(String(parsed.id), parsed);
        rosterMap.set(normalizeName(parsed.name), parsed);
      }
    });
    return rosterMap;
  } catch (err) {
    console.error(`Error fetching roster hitting stats for team ${teamId}:`, err);
    return new Map();
  }
}

function parseHitterStats(person, positionObj = {}) {
  if (!person || !person.id) return null;
  const statsArray = person.stats || [];
  const seasonStats = statsArray.find(s => s.type?.displayName === "season")?.splits?.[0]?.stat || {};
  const splitStats = statsArray.find(s => s.type?.displayName === "statSplits")?.splits || [];
  const gameLogSplits = statsArray.find(s => s.type?.displayName === "gameLog")?.splits || [];

  const vlObp = splitStats.find(s => s.situation?.code === "vl")?.stat?.obp;
  const vrObp = splitStats.find(s => s.situation?.code === "vr")?.stat?.obp;

  const sortedLogs = [...gameLogSplits]
    .sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")))
    .slice(0, 14);

  let recentAvg = null;
  if (sortedLogs.length > 0) {
    const hits = sum(sortedLogs.map(l => l.stat?.hits));
    const atBats = sum(sortedLogs.map(l => l.stat?.atBats));
    recentAvg = atBats > 0 ? hits / atBats : null;
  }

  const seasonAvg = numberOr(seasonStats.avg, 0);
  const seasonObp = numberOr(seasonStats.obp, 0);
  const seasonSlg = numberOr(seasonStats.slg, 0);
  const homeRuns = number(seasonStats.homeRuns);
  const games = number(seasonStats.gamesPlayed) || 1;

  return {
    id: person.id,
    name: person.fullName || person.lastName || "N/D",
    position: positionObj.abbreviation || "",
    avg: seasonAvg,
    obp: seasonObp,
    slg: seasonSlg,
    vlObp: numberOr(vlObp, seasonObp),
    vrObp: numberOr(vrObp, seasonObp),
    recentAvg: recentAvg,
    homeRuns: homeRuns,
    games: games,
  };
}

async function fetchHitterStatsFallback(playerId, season) {
  try {
    const statsUrl = `${MLB_BASE}/people/${playerId}/stats?stats=season,statSplits,gameLog&group=hitting&season=${season}&sitCodes=vl,vr`;
    const data = await fetchJson(statsUrl);
    const statsArray = data.stats || [];
    
    const personUrl = `${MLB_BASE}/people/${playerId}`;
    const personData = await fetchJson(personUrl);
    const person = personData.people?.[0] || { id: playerId, fullName: "N/D" };
    person.stats = statsArray;

    return parseHitterStats(person, { abbreviation: person.primaryPosition?.abbreviation });
  } catch (err) {
    console.error(`Error fetching fallback stats for player ${playerId}:`, err);
    return null;
  }
}

function getHitterFallbackStats(teamStats) {
  return {
    avg: teamStats.battingAverage || LEAGUE.battingAverage,
    obp: teamStats.obp || LEAGUE.obp,
    slg: teamStats.slg || LEAGUE.slg,
    vlObp: teamStats.obp || LEAGUE.obp,
    vrObp: teamStats.obp || LEAGUE.obp,
    recentAvg: teamStats.battingAverage || LEAGUE.battingAverage,
    homeRuns: 10,
    games: 80,
  };
}

async function fetchLineupData(gamePk, espnEventId) {
  let mlbBoxscore = null;
  let espnSummary = null;
  
  try {
    mlbBoxscore = await fetchJson(`${MLB_BASE}/game/${gamePk}/boxscore`);
  } catch (err) {
    console.warn("No se pudo obtener el boxscore de MLB:", err);
  }
  
  const mlbAwayLineup = mlbBoxscore ? extractMlbLineup(mlbBoxscore.teams?.away) : null;
  const mlbHomeLineup = mlbBoxscore ? extractMlbLineup(mlbBoxscore.teams?.home) : null;
  
  if ((!mlbAwayLineup || !mlbHomeLineup) && espnEventId) {
    try {
      espnSummary = await fetchJson(`https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/summary?event=${espnEventId}`);
    } catch (err) {
      console.warn("No se pudo obtener el summary de ESPN:", err);
    }
  }
  
  return { mlbBoxscore, espnSummary };
}

function extractMlbLineup(teamBoxscore) {
  if (!teamBoxscore) return null;
  if (Array.isArray(teamBoxscore.battingOrder) && teamBoxscore.battingOrder.length >= 9) {
    return teamBoxscore.battingOrder.slice(0, 9);
  }
  
  const players = teamBoxscore.players || {};
  const starters = [];
  for (const [key, player] of Object.entries(players)) {
    const bo = player.battingOrder;
    if (bo && bo.length === 3 && bo.endsWith("00")) {
      const idx = parseInt(bo[0], 10) - 1;
      if (idx >= 0 && idx < 9) {
        starters[idx] = player.person?.id;
      }
    }
  }
  
  const filteredStarters = starters.filter(id => id != null);
  if (filteredStarters.length >= 9) {
    return filteredStarters;
  }
  
  if (Array.isArray(teamBoxscore.batters) && teamBoxscore.batters.length >= 9) {
    return teamBoxscore.batters.slice(0, 9);
  }
  
  return null;
}

function extractEspnLineup(espnSummary, side) {
  if (!espnSummary) return null;
  const rosters = espnSummary.rosters || [];
  const teamRoster = rosters.find(r => r.team?.homeAway === side) || {};
  const players = teamRoster.roster || [];
  
  const starters = players
    .filter(p => p.starter && p.battingOrder >= 1 && p.battingOrder <= 9)
    .sort((a, b) => a.battingOrder - b.battingOrder);
    
  if (starters.length >= 9) {
    return starters.slice(0, 9).map(p => ({
      name: p.athlete?.displayName || "N/D",
      position: p.position?.abbreviation || p.athlete?.position?.abbreviation || "",
      espnId: p.athlete?.id,
    }));
  }
  return null;
}

function getMlbLineupPlayers(mlbLineupIds, teamBoxscore) {
  const players = teamBoxscore.players || {};
  return mlbLineupIds.map(id => {
    const player = players[`ID${id}`] || {};
    return {
      id: id,
      name: player.person?.fullName || "N/D",
      position: player.position?.abbreviation || "",
    };
  });
}

function getProjectedLineupFromRoster(rosterMap, teamStats) {
  let hitters = [];
  if (rosterMap && rosterMap.size > 0) {
    hitters = Array.from(rosterMap.values())
      .filter(p => p && p.name && p.name !== "N/D");
  }
  
  hitters.sort((a, b) => {
    const scoreA = ((a.obp || a.avg || 0.250) + (a.slg || 0.400)) * Math.min(a.games || 10, 50);
    const scoreB = ((b.obp || b.avg || 0.250) + (b.slg || 0.400)) * Math.min(b.games || 10, 50);
    return scoreB - scoreA;
  });

  const avg = teamStats?.battingAverage || LEAGUE.battingAverage;
  const obp = teamStats?.obp || LEAGUE.obp;
  const slg = teamStats?.slg || LEAGUE.slg;

  if (hitters.length < 9) {
    while (hitters.length < 9) {
      const idx = hitters.length + 1;
      hitters.push({
        id: `fb-${idx}`,
        name: `Bateador Destacado #${idx}`,
        position: "D",
        avg, obp, slg, homeRuns: 10, games: 80, recentAvg: avg
      });
    }
  }

  return hitters.slice(0, 9).map((p, i) => ({
    id: p.id || `p-${i}`,
    name: p.name,
    position: p.position || "D",
    avg: p.avg || avg,
    obp: p.obp || obp,
    slg: p.slg || slg,
    homeRuns: p.homeRuns || 10,
    games: p.games || 80,
    recentAvg: p.recentAvg || p.avg || avg
  }));
}

function calcularMetricasStatcast(hitter = {}, teamStats = {}) {
  const avg = Number.isFinite(hitter.avg) && hitter.avg > 0 ? hitter.avg : (teamStats.battingAverage || LEAGUE.battingAverage);
  const slg = Number.isFinite(hitter.slg) && hitter.slg > 0 ? hitter.slg : (teamStats.slg || LEAGUE.slg);
  const iso = Math.max(0.03, slg - avg);

  const kRate = Number.isFinite(hitter.kPct) ? hitter.kPct : 0.20;

  // Métricas Statcast estimadas según ISO, SLG y OBP
  const hardHitPct = clamp(0.28 + (iso - 0.150) * 1.35 + (slg - 0.400) * 0.40, 0.18, 0.58);
  const barrelPct = clamp(0.02 + (iso - 0.120) * 0.45, 0.01, 0.18);
  const exitVeloMph = clamp(86.5 + hardHitPct * 12.5 + barrelPct * 15.0, 84.0, 95.5);

  // xBA (Expected Batting Average)
  const xBABIP = clamp(0.270 + hardHitPct * 0.12 + barrelPct * 0.15, 0.250, 0.350);
  const xBA = clamp((1 - kRate) * xBABIP, 0.180, 0.340);

  // xSLG (Expected Slugging)
  const xSLG = clamp(xBA + iso * (0.85 + barrelPct * 2.2), 0.300, 0.680);

  // Delta de Suerte y factor de regresión a la media
  const luckDelta = avg - xBA;
  const regressionFactor = clamp(1.0 - luckDelta * 0.75, 0.88, 1.12);

  return {
    xBA: round1(xBA * 1000) / 1000,
    xSLG: round1(xSLG * 1000) / 1000,
    hardHitPct: round1(hardHitPct * 100),
    barrelPct: round1(barrelPct * 100),
    exitVeloMph: round1(exitVeloMph * 10) / 10,
    luckDelta: round1(luckDelta * 1000) / 1000,
    regressionFactor,
  };
}

async function resolveLineupStats(lineupPlayers, rosterMap, teamStats, season, opposingPitcher) {
  if (!lineupPlayers) return null;
  
  const resolved = await Promise.all(lineupPlayers.map(async (player, index) => {
    let stats = player.id ? rosterMap.get(String(player.id)) : null;
    
    if (!stats) {
      stats = rosterMap.get(normalizeName(player.name));
    }
    
    if (!stats && player.id) {
      stats = await fetchHitterStatsFallback(player.id, season);
      if (stats) {
        rosterMap.set(String(player.id), stats);
        rosterMap.set(normalizeName(stats.name), stats);
      }
    }
    
    if (!stats) {
      const fallbackVal = getHitterFallbackStats(teamStats);
      stats = {
        ...fallbackVal,
        ...player,
        id: player.id || player.espnId || `fb-${index}`,
        name: (player.name && !player.name.includes("N/D")) ? player.name : `Bateador #${index + 1}`,
        position: player.position || "D"
      };
    } else {
      if (player.position) stats.position = player.position;
    }
    
    const pitcherWhip = numberOr(opposingPitcher?.whip, LEAGUE.whip);
    const pitcherFactor = pitcherWhip / LEAGUE.whip;
    const adjustedFactor = 1.0 + (pitcherFactor - 1.0) * 0.75;
    
    const opponentHand = String(opposingPitcher?.hand || opposingPitcher?.throws || "R").toUpperCase().startsWith("L") ? "L" : "R";
    const splitObp = opponentHand === "L" ? stats.vlObp : stats.vrObp;
    
    let pBase = splitObp * adjustedFactor;
    pBase = clamp(pBase, 0.15, 0.50);

    // --- CÁLCULO MATEMÁTICO AVANZADO DE HITS Y BASES TOTALES (BINOMIAL + LOG5 + LINEUP PA) ---
    // 1. Turnos proyectados (PA) y Turnos Oficiales (AB) según puesto en lineup
    const lineupOrder = index + 1;
    const expectedPA = lineupOrder <= 2 ? 4.7 : (lineupOrder <= 5 ? 4.4 : 3.8);
    const bbRate = Number.isFinite(stats.bbPct) ? stats.bbPct : 0.08;
    const expectedAB = Math.max(3.0, expectedPA * (1 - bbRate));

    // Statcast xBA & xSLG regression factor
    const statcast = calcularMetricasStatcast(stats, teamStats);

    // 2. Promedio ponderado (70% temporada, 30% racha reciente en 14J) ajustado por Statcast xBA
    let effectiveAvg = Number.isFinite(stats.avg) && stats.avg > 0 ? stats.avg : LEAGUE.battingAverage;
    if (Number.isFinite(stats.recentAvg) && stats.recentAvg > 0) {
      effectiveAvg = 0.70 * effectiveAvg + 0.30 * stats.recentAvg;
    }
    effectiveAvg = effectiveAvg * statcast.regressionFactor;

    // === Historial BvP Directo (Bateador vs Pitcher H2H) ===
    const bvpAB = numberOr(stats.bvpAtBats, 0);
    if (bvpAB >= 8 && Number.isFinite(stats.bvpAvg)) {
      const bvpWeight = Math.min(0.25, bvpAB / 40.0); // Hasta 25% de peso para muestras H2H de 10+ turnos
      effectiveAvg = (1 - bvpWeight) * effectiveAvg + bvpWeight * stats.bvpAvg;
    }

    // === Matcheo Arsenal de Pitcheo (Pitch Mix Matching) ===
    const pitcherK9Val = numberOr(opposingPitcher?.k9, LEAGUE.pitcherK9);
    const pitchMixFactor = pitcherK9Val >= 10.0 ? (stats.slg > 0.450 ? 1.03 : 0.95) : 1.0;
    effectiveAvg *= pitchMixFactor;

    // 3. Matcheo Log5 Bill James (Bateador vs Pitcher H/9)
    const pitcherH9 = numberOr(opposingPitcher?.hitsPerNine, LEAGUE.pitcherHits9);
    const pitcherRate = clamp(pitcherH9 / 9.0, 0.15, 0.42);
    const pLog5 = (effectiveAvg * pitcherRate) / ((effectiveAvg * pitcherRate) + ((1 - effectiveAvg) * (1 - pitcherRate)));

    // 4. Ajuste por K% y factor de ajuste general del pitcher
    const kRate = Number.isFinite(stats.kPct) ? stats.kPct : 0.20;
    const pHitPA = clamp(pLog5 * (1 - 0.25 * kRate) * adjustedFactor, 0.14, 0.42);

    const projectedHits = expectedAB * pHitPA;

    // 5. Modelo Binomial Exacto P(Hits >= 1) y P(Hits >= 2)
    const pZeroHits = Math.pow(1 - pHitPA, expectedAB);
    const pOneHit = expectedAB * pHitPA * Math.pow(1 - pHitPA, expectedAB - 1);

    const pHits1 = clamp(1 - pZeroHits, 0.20, 0.95);
    const pHits2 = clamp(1 - pZeroHits - pOneHit, 0.05, 0.60);

    // 6. CÁLCULO SABERMÉTRICO AVANZADO DE BASES TOTALES (TB)
    const slg = Number.isFinite(stats.slg) && stats.slg > 0 ? stats.slg : LEAGUE.slg;
    const iso = Math.max(0.03, slg - (Number.isFinite(stats.avg) && stats.avg > 0 ? stats.avg : LEAGUE.battingAverage));
    
    // Log5 SLG vs Pitcher
    const pitcherSlgFactor = clamp(pitcherH9 / LEAGUE.pitcherHits9, 0.65, 1.40);
    const effectiveSlg = clamp(slg * (0.60 + 0.40 * pitcherSlgFactor) * adjustedFactor, 0.250, 0.700);
    const tbPerHit = clamp(1.0 + (iso / Math.max(0.180, effectiveAvg)) * 1.30, 1.15, 2.20);
    const projectedTB = projectedHits * tbPerHit;

    // Probabilidad de Over 1.5 Bases Totales (Necesita 2+ Hits o 1 Extra-Base Hit: Doble, Triple o Jonrón)
    const xbhRate = clamp(iso / Math.max(0.200, slg), 0.15, 0.55); // % de hits que son extrabases
    const pXbhPA = pHitPA * xbhRate;
    const pAtLeastOneXbh = 1 - Math.pow(1 - pXbhPA, expectedAB);
    const pTB1_5 = clamp(Math.max(pHits2, pAtLeastOneXbh + (1 - pAtLeastOneXbh) * pHits2 * 0.75), 0.10, 0.88);

    // --- CÁLCULO SABERMÉTRICO DE JONRONES (HR%) CON LOG5 + RACHA + PITCHER HR/9 ---
    // 1. Ratio de Jonrones por Aparición (HR/PA) con Suavizado Bayesiano
    const totalPa = stats.plateAppearances || (stats.games ? stats.games * 3.8 : 150);
    const homeRuns = stats.homeRuns || 0;
    const batterHrPerPA = (homeRuns + 2.0) / (Math.max(30, totalPa) + 70);

    // 2. Factor de Racha Reciente (14J) / Temperatura del Bateador
    let streakFactor = 1.0;
    let isColdHitter = false;
    let isHotHitter = false;

    if (Number.isFinite(stats.recentAvg) && stats.recentAvg > 0 && Number.isFinite(stats.avg) && stats.avg > 0) {
      const streakDiff = stats.recentAvg - stats.avg;
      const streakRatio = stats.recentAvg / stats.avg;
      
      if (streakDiff <= -0.040 || stats.recentAvg < 0.190) {
        isColdHitter = true;
        streakFactor = clamp(1.0 + streakDiff * 2.2, 0.60, 0.88);
      } else if (streakDiff >= 0.040 && stats.recentAvg >= 0.260) {
        isHotHitter = true;
        streakFactor = clamp(1.0 + streakDiff * 1.8, 1.12, 1.35);
      } else {
        streakFactor = clamp(1.0 + (streakRatio - 1.0) * 0.4, 0.88, 1.12);
      }
    }

    // 3. Matcheo Log5 de HR% (Bateador HR/PA vs Pitcher HR/PA)
    const pitcherHr9 = numberOr(opposingPitcher?.hr9, LEAGUE.pitcherHr9);
    const pitcherHrPerPA = clamp((pitcherHr9 / 9.0) * 0.26, 0.008, 0.065);
    const leagueHrPerPA = LEAGUE.homeRunRate || 0.032;

    // Fórmula Log5 para HR Rate
    const hrRateLog5 = (batterHrPerPA * pitcherHrPerPA) / Math.max(0.0001, leagueHrPerPA);

    // 4. Ajuste por Split vs Lanzador Rival (OBP / Split)
    const splitObpVal = splitObp || stats.obp || LEAGUE.obp;
    const splitFactor = clamp(splitObpVal / LEAGUE.obp, 0.80, 1.25);

    // 5. HR Esperados en el Partido (Modelo Poisson P(HR >= 1) = 1 - e^-λ)
    const effectiveHrPerPA = clamp(hrRateLog5 * streakFactor * splitFactor * adjustedFactor, 0.005, 0.120);
    const expectedHrGame = expectedPA * effectiveHrPerPA;
    let hrProb = 1.0 - Math.exp(-expectedHrGame);
    hrProb = clamp(hrProb, 0.01, 0.48);

    // 6. Score de Selección para Best Bets (penaliza fuertemente a bateadores en frío)
    const coldPenaltyMultiplier = isColdHitter ? 0.50 : (stats.recentAvg < 0.210 ? 0.65 : 1.0);
    const hotBoostMultiplier = isHotHitter ? 1.20 : 1.0;
    const hrScore = hrProb * streakFactor * coldPenaltyMultiplier * hotBoostMultiplier;

    return {
      ...stats,
      pBase,
      hrProb,
      streakFactor,
      isColdHitter,
      isHotHitter,
      hrScore,
      statcast,
      expectedPA: round1(expectedPA),
      projectedHits: round1(projectedHits),
      pHits1,
      pHits2,
      projectedTB: round1(projectedTB),
      pTB1_5,
      splitLabel: `${(splitObp || stats.obp || 0.320).toFixed(3)} vs${opponentHand}`,
    };
  }));
  
  return resolved;
}

function computeLineupStats(playersResolved, opponentHand, teamStats) {
  if (!playersResolved || playersResolved.length < 9) return null;
  
  const avgs = playersResolved.map(p => p.avg);
  const obps = playersResolved.map(p => p.obp);
  const slgs = playersResolved.map(p => p.slg);
  
  const avg = average(avgs);
  const obp = average(obps);
  const slg = average(slgs);
  const ops = obp + slg;
  
  const totalHr = sum(playersResolved.map(p => p.homeRuns));
  const totalGames = sum(playersResolved.map(p => p.games));
  const lineupHrRate = totalGames > 0 ? (totalHr / totalGames) * 9 : LEAGUE.homeRunsPerGame;
  
  const teamOps = teamStats.ops || LEAGUE.ops;
  const teamAvg = teamStats.battingAverage || LEAGUE.battingAverage;
  const teamHr = teamStats.homeRunsPerGame || LEAGUE.homeRunsPerGame;
  
  const runsPerGame = (teamStats.runsPerGame || LEAGUE.runsPerGame) * (ops / teamOps);
  const hitsPerGame = (teamStats.hitsPerGame || LEAGUE.hitsPerGame) * (avg / teamAvg);
  const homeRunsPerGame = teamHr * (lineupHrRate / teamHr);
  
  return {
    battingAverage: avg,
    obp: obp,
    slg: slg,
    ops: ops,
    opsVsLeft: average(playersResolved.map(p => p.vlObp + p.slg)),
    opsVsRight: average(playersResolved.map(p => p.vrObp + p.slg)),
    runsPerGame,
    hitsPerGame,
    homeRunsPerGame,
  };
}

function parseTeamBattingFromBoxscore(teamBlock, teamScore, teamHits) {
  const b = teamBlock?.teamStats?.batting || {};
  const hr = Number.isFinite(number(b.homeRuns)) && b.homeRuns !== undefined ? number(b.homeRuns) : Math.max(0, Math.round(teamScore * 0.22));
  const bb = Number.isFinite(number(b.baseOnBalls)) && b.baseOnBalls !== undefined ? number(b.baseOnBalls) : Math.max(1, Math.round(teamScore * 0.65));
  const lob = Number.isFinite(number(b.leftOnBase)) && b.leftOnBase !== undefined ? number(b.leftOnBase) : Math.max(2, Math.round((teamHits + bb - teamScore) * 0.9));
  const ab = number(b.atBats) || 34;
  const slg = number(b.slg) || 0.400;
  return { hr, bb, lob, ab, slg };
}

function parseRecentTeamGame(game, boxscore, teamId) {
  const side = game.teams?.home?.team?.id === teamId ? "home" : game.teams?.away?.team?.id === teamId ? "away" : null;
  if (!side) return null;
  const opponentSide = side === "home" ? "away" : "home";
  const linescore = game.linescore?.teams || {};
  const teamScore = number(game.teams?.[side]?.score);
  const opponentScore = number(game.teams?.[opponentSide]?.score);
  const teamHits = number(linescore?.[side]?.hits);
  const opponentHits = number(linescore?.[opponentSide]?.hits);
  const teamBlock = boxscore?.teams?.[side];
  const bullpen = parseBullpenFromBoxscore(teamBlock, game.officialDate);
  const batting = parseTeamBattingFromBoxscore(teamBlock, teamScore, teamHits || estimateHitsFromRuns(teamScore));

  return {
    gamePk: game.gamePk,
    date: game.officialDate,
    isHome: side === "home",
    runsFor: teamScore,
    runsAllowed: opponentScore,
    hits: teamHits || estimateHitsFromRuns(teamScore),
    opponentHits: opponentHits || estimateHitsFromRuns(opponentScore),
    win: teamScore > opponentScore,
    totalRuns: teamScore + opponentScore,
    over: teamScore + opponentScore >= LEAGUE.totalRunsLine,
    bullpen,
    hr: batting.hr,
    bb: batting.bb,
    lob: batting.lob,
    ab: batting.ab,
    slg: batting.slg,
  };
}

function getFullTeamStatMetrics(teamStats) {
  const g = teamStats.games || 162;
  const rG = teamStats.runsPerGame || LEAGUE.runsPerGame;
  const raG = teamStats.runsAllowedPerGame || LEAGUE.runsAllowedPerGame;
  const diff = rG - raG;
  const hrG = teamStats.homeRunsPerGame || LEAGUE.homeRunsPerGame;
  const hrTotal = Math.round(hrG * g);
  const hrPct = clamp((hrG / 34) * 100, 0.8, 6.0);
  const slg = teamStats.slg || LEAGUE.slg;
  const bbG = teamStats.walksPerGame || LEAGUE.walksPerGame;
  const hG = teamStats.hitsPerGame || LEAGUE.hitsPerGame;

  const num = Math.max(0.1, hG + bbG - rG);
  const den = Math.max(0.5, hG + bbG - 1.4 * hrG);
  const lobPct = clamp((num / den) * 100, 50, 92);
  const bbPct = clamp((bbG / (34 + bbG)) * 100, 5, 20);

  return {
    runsPerGame: rG,
    runsAllowedPerGame: raG,
    diff,
    homeRunsTotal: hrTotal,
    homeRunsPerGame: hrG,
    hrPct,
    slg,
    lobPct,
    bbPct,
  };
}

function aggregateRecentGames(games, teamSeasonStats = {}) {
  const count = games.length;
  if (!count) {
    return null;
  }

  const wins = games.filter((game) => game.win).length;
  const losses = count - wins;
  const runsForPerGame = average(games.map((game) => game.runsFor));
  const runsAllowedPerGame = average(games.map((game) => game.runsAllowed));
  const hitsPerGame = average(games.map((game) => game.hits));
  const hitsAllowedPerGame = average(games.map((game) => game.opponentHits));

  const homeRunsTotal = sum(games.map((game) => game.hr || 0));
  const homeRunsPerGame = count > 0 ? homeRunsTotal / count : LEAGUE.homeRunsPerGame;
  const bbTotal = sum(games.map((game) => game.bb || 0));
  const abTotal = sum(games.map((game) => game.ab || 34));

  const hrPct = abTotal > 0 ? (homeRunsTotal / abTotal) * 100 : (homeRunsPerGame / 34) * 100;
  const bbPct = (abTotal + bbTotal) > 0 ? clamp((bbTotal / (abTotal + bbTotal)) * 100, 4.0, 22.0) : 10.0;

  const totalH = sum(games.map(g => g.hits));
  const totalR = sum(games.map(g => g.runsFor));
  const lobNum = Math.max(0.1, totalH + bbTotal - totalR);
  const lobDen = Math.max(0.5, totalH + bbTotal - (1.4 * homeRunsTotal));
  const lobPct = clamp((lobNum / lobDen) * 100, 50, 92);

  const slg = average(games.map(g => g.slg || teamSeasonStats.slg || LEAGUE.slg));

  return {
    games: count,
    wins,
    losses,
    runsPerGame: runsForPerGame,
    runsForPerGame,
    runsAllowedPerGame,
    diff: runsForPerGame - runsAllowedPerGame,
    hitsPerGame,
    hitsAllowedPerGame,
    homeRunsTotal,
    homeRunsPerGame,
    hrPct,
    slg,
    lobPct,
    bbPct,
    overRate: games.filter((game) => game.over).length / count,
  };
}

function buildTeamSplitProfile({ team, recentContext = {}, logo = "", abbreviation = "", role = "", seasonStats = null }) {
  const games = recentContext?.games || [];
  const splitGames = recentContext?.splitGames || {};
  const splits = {
    all: summarizeTeamSplit(splitGames.all || games, seasonStats),
    home: summarizeTeamSplit(splitGames.home || games.filter((game) => game.isHome), seasonStats),
    away: summarizeTeamSplit(splitGames.away || games.filter((game) => !game.isHome), seasonStats),
  };

  return {
    name: team?.name || "Equipo N/D",
    abbreviation: abbreviation || teamAbbrev(team?.name || ""),
    logo: team?.id ? mlbTeamLogoUrl(team.id) : logo,
    role,
    splits,
  };
}

function summarizeTeamSplit(games, seasonFallback = null) {
  const count = games.length;
  if (!count) {
    return null;
  }

  const runsForPerGame = average(games.map((game) => game.runsFor));
  const runsAllowedPerGame = average(games.map((game) => game.runsAllowed));
  const hitsPerGame = average(games.map((game) => game.hits));
  const hitsAllowedPerGame = average(games.map((game) => game.opponentHits));

  const homeRunsTotal = sum(games.map((g) => g.hr || 0));
  const homeRunsPerGame = count > 0 ? homeRunsTotal / count : (seasonFallback?.homeRunsPerGame || LEAGUE.homeRunsPerGame);
  const bbTotal = sum(games.map((g) => g.bb || 0));
  const abTotal = sum(games.map((g) => g.ab || 34));

  const hrPct = abTotal > 0 ? (homeRunsTotal / abTotal) * 100 : (homeRunsPerGame / 34) * 100;
  const bbPct = (abTotal + bbTotal) > 0 ? clamp((bbTotal / (abTotal + bbTotal)) * 100, 4.0, 22.0) : 10.0;

  const totalH = sum(games.map(g => g.hits));
  const totalR = sum(games.map(g => g.runsFor));
  const lobNum = Math.max(0.1, totalH + bbTotal - totalR);
  const lobDen = Math.max(0.5, totalH + bbTotal - (1.4 * homeRunsTotal));
  const lobPct = clamp((lobNum / lobDen) * 100, 50, 92);

  const slg = average(games.map(g => g.slg || seasonFallback?.slg || LEAGUE.slg));

  return {
    games: count,
    runsPerGame: runsForPerGame,
    runsForPerGame,
    runsAllowedPerGame,
    diff: runsForPerGame - runsAllowedPerGame,
    runDiffPerGame: runsForPerGame - runsAllowedPerGame,
    hitsPerGame,
    hitsAllowedPerGame,
    homeRunsTotal,
    homeRunsPerGame,
    hrPct,
    slg,
    lobPct,
    bbPct,
    overRate: games.filter((game) => game.over).length / count,
  };
}

function aggregateBullpenGames(bullpenGames, referenceDate, relieversAvailable) {
  const cutoff7 = addDays(referenceDate, -7);
  const cutoff3 = addDays(referenceDate, -3);
  const recent7 = bullpenGames.filter((item) => item?.date >= cutoff7);
  const recent3 = bullpenGames.filter((item) => item?.date >= cutoff3);
  const relieverUse = new Map();
  recent3.forEach((game) => {
    (game.relieverIds || []).forEach((id) => relieverUse.set(id, (relieverUse.get(id) || 0) + 1));
  });

  return {
    relieversAvailable,
    innings7: sum(recent7.map((game) => game.innings)),
    innings3: sum(recent3.map((game) => game.innings)),
    runs7: sum(recent7.map((game) => game.runs)),
    earnedRuns7: sum(recent7.map((game) => game.earnedRuns)),
    hits7: sum(recent7.map((game) => game.hits)),
    walks7: sum(recent7.map((game) => game.walks)),
    pitches3: sum(recent3.map((game) => game.pitches)),
    outingsBackToBack: [...relieverUse.values()].filter((uses) => uses >= 2).length,
  };
}

function summarizePitcherRecentStarts(splits) {
  const starts = (splits || [])
    .filter((split) => number(split.stat?.gamesStarted) > 0 || inningsToNumber(split.stat?.inningsPitched) >= 3)
    .sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")))
    .slice(0, 10);

  if (!starts.length) {
    return {
      count: 0,
      inningsPerStart: LEAGUE.starterInnings,
      runsAllowedPerStart: LEAGUE.runsPerGame * 0.55,
      hitsAllowedPerStart: LEAGUE.hitsPerGame * 0.55,
    };
  }

  return {
    count: starts.length,
    inningsPerStart: average(starts.map((split) => inningsToNumber(split.stat?.inningsPitched))),
    runsAllowedPerStart: average(starts.map((split) => number(split.stat?.runs))),
    hitsAllowedPerStart: average(starts.map((split) => number(split.stat?.hits))),
  };
}

async function getTeamStats(teamId) {
  if (state.teamStats.has(teamId)) return state.teamStats.get(teamId);

  try {
    const [seasonData, splitLeftData, splitRightData] = await Promise.all([
      fetchJson(`${MLB_BASE}/teams/${teamId}/stats?stats=season&group=hitting,pitching`),
      fetchJson(`${MLB_BASE}/teams/${teamId}/stats?stats=statSplits&group=hitting&sitCodes=vl`),
      fetchJson(`${MLB_BASE}/teams/${teamId}/stats?stats=statSplits&group=hitting&sitCodes=vr`),
    ]);

    const hitting = seasonData.stats?.find((item) => item.group?.displayName === "hitting")?.splits?.[0]?.stat || {};
    const pitching = seasonData.stats?.find((item) => item.group?.displayName === "pitching")?.splits?.[0]?.stat || {};
    const games = number(hitting.gamesPlayed) || number(pitching.gamesPlayed) || 1;
    const innings = inningsToNumber(pitching.inningsPitched);
    const pitchingGames = number(pitching.gamesPlayed) || games;
    const earnedRuns = number(pitching.earnedRuns);
    const allowedRuns = number(pitching.runs) || earnedRuns * 1.08;
    const opsGeneral = number(hitting.ops) || LEAGUE.ops;
    const opsVsLeft = number(splitLeftData.stats?.[0]?.splits?.[0]?.stat?.ops) || opsGeneral;
    const opsVsRight = number(splitRightData.stats?.[0]?.splits?.[0]?.stat?.ops) || opsGeneral;

    const normalized = {
      games,
      runsPerGame: number(hitting.runs) / games,
      hitsPerGame: number(hitting.hits) / games,
      battingAverage: number(hitting.avg),
      obp: number(hitting.obp),
      slg: number(hitting.slg),
      ops: opsGeneral,
      opsVsLeft,
      opsVsRight,
      homeRunsPerGame: number(hitting.homeRuns) / games,
      walksPerGame: number(hitting.baseOnBalls) / games,
      strikeoutsPerGame: number(hitting.strikeOuts) / games,
      runsAllowedPerGame: allowedRuns / pitchingGames,
      hitsAllowedPerGame: number(pitching.hits) / pitchingGames,
      walksAllowedPerGame: number(pitching.baseOnBalls) / pitchingGames,
      homeRunsAllowedPerGame: number(pitching.homeRuns) / pitchingGames,
      pitchingStrikeoutsPerGame: number(pitching.strikeOuts) / pitchingGames,
      era: number(pitching.era) || (innings ? (earnedRuns * 9) / innings : LEAGUE.era),
      whip: number(pitching.whip) || LEAGUE.whip,
    };

    setLimitedMapValue(state.teamStats, teamId, normalized, MAX_TEAM_CACHE);
    return normalized;
  } catch {
    const fallbackValue = {
      ops: LEAGUE.ops,
      opsVsLeft: LEAGUE.ops,
      opsVsRight: LEAGUE.ops,
      runsPerGame: LEAGUE.runsPerGame,
      hitsPerGame: LEAGUE.hitsPerGame,
      battingAverage: LEAGUE.battingAverage,
    };
    setLimitedMapValue(state.teamStats, teamId, fallbackValue, MAX_TEAM_CACHE);
    return fallbackValue;
  }
}

async function getTeamHomeAwaySplits(teamId, season) {
  const currentSeason = season || new Date().getFullYear();
  const cacheKey = `split-${teamId}-${currentSeason}`;
  if (state.teamSplits && state.teamSplits.has(cacheKey)) return state.teamSplits.get(cacheKey);

  try {
    const [homeAwayRes, sitSplitsRes] = await Promise.allSettled([
      fetchJson(`${MLB_BASE}/teams/${teamId}/stats?stats=homeAndAway&group=hitting,pitching&season=${currentSeason}`),
      fetchJson(`${MLB_BASE}/teams/${teamId}/stats?stats=statSplits&group=hitting,pitching&sitCodes=h,a&season=${currentSeason}`)
    ]);

    let homeHitting = {}, awayHitting = {}, homePitching = {}, awayPitching = {};

    if (homeAwayRes.status === "fulfilled" && homeAwayRes.value?.stats) {
      const statsList = homeAwayRes.value.stats;
      const hittingGroup = statsList.find(s => s.group?.displayName === "hitting")?.splits || [];
      const pitchingGroup = statsList.find(s => s.group?.displayName === "pitching")?.splits || [];

      homeHitting = hittingGroup.find(s => s.homeAway === "home")?.stat || {};
      awayHitting = hittingGroup.find(s => s.homeAway === "away")?.stat || {};
      homePitching = pitchingGroup.find(s => s.homeAway === "home")?.stat || {};
      awayPitching = pitchingGroup.find(s => s.homeAway === "away")?.stat || {};
    }

    if (!homeHitting.gamesPlayed && sitSplitsRes.status === "fulfilled" && sitSplitsRes.value?.stats) {
      const statsList = sitSplitsRes.value.stats;
      const hittingGroup = statsList.find(s => s.group?.displayName === "hitting")?.splits || [];
      const pitchingGroup = statsList.find(s => s.group?.displayName === "pitching")?.splits || [];

      homeHitting = hittingGroup.find(s => s.situation?.code === "h" || s.split?.code === "h")?.stat || homeHitting;
      awayHitting = hittingGroup.find(s => s.situation?.code === "a" || s.split?.code === "a")?.stat || awayHitting;
      homePitching = pitchingGroup.find(s => s.situation?.code === "h" || s.split?.code === "h")?.stat || homePitching;
      awayPitching = pitchingGroup.find(s => s.situation?.code === "a" || s.split?.code === "a")?.stat || awayPitching;
    }

    const buildSplitMetrics = (hitting, pitching) => {
      const g = number(hitting.gamesPlayed) || number(pitching.gamesPlayed) || 0;
      if (!g) return null;
      const pitchG = number(pitching.gamesPlayed) || g;
      const runsFor = number(hitting.runs);
      const runsAllow = number(pitching.runs) || (number(pitching.earnedRuns) * 1.08);
      const runsPerG = runsFor / g;
      const runsAllowPerG = runsAllow / pitchG;
      const hrTotal = number(hitting.homeRuns);
      const ab = number(hitting.atBats);
      const bb = number(hitting.baseOnBalls);
      const hits = number(hitting.hits);
      const slg = number(hitting.slg) || LEAGUE.slg;

      const hrPct = ab > 0 ? (hrTotal / ab) * 100 : (runsPerG > 0 ? (hrTotal / g / 34) * 100 : 1.9);
      const bbPct = (ab + bb) > 0 ? (bb / (ab + bb)) * 100 : 8.5;

      const num = Math.max(0.1, hits + bb - runsFor);
      const den = Math.max(0.5, hits + bb - 1.4 * hrTotal);
      const lobPct = clamp((num / den) * 100, 50, 92);

      return {
        games: g,
        runsPerGame: runsPerG,
        runsForPerGame: runsPerG,
        runsAllowedPerGame: runsAllowPerG,
        diff: runsPerG - runsAllowPerG,
        homeRunsTotal: hrTotal,
        homeRunsPerGame: hrTotal / g,
        hrPct,
        slg,
        lobPct,
        bbPct,
      };
    };

    const splitsObj = {
      home: buildSplitMetrics(homeHitting, homePitching),
      away: buildSplitMetrics(awayHitting, awayPitching),
    };

    if (!state.teamSplits) state.teamSplits = new Map();
    setLimitedMapValue(state.teamSplits, cacheKey, splitsObj, MAX_TEAM_CACHE);
    return splitsObj;
  } catch (err) {
    console.warn("Error al obtener los splits de local/visitante:", err);
    return { home: null, away: null };
  }
}

async function getPitcherStats(playerId, season = new Date().getFullYear()) {
  if (!playerId) return null;
  const cacheKey = `${playerId}-${season}`;
  if (state.pitcherStats.has(cacheKey)) return state.pitcherStats.get(cacheKey);

  try {
    const [seasonResult, personResult, gameLogResult] = await Promise.allSettled([
      fetchJson(`${MLB_BASE}/people/${playerId}/stats?stats=season&group=pitching`),
      fetchJson(`${MLB_BASE}/people/${playerId}`),
      fetchJson(`${MLB_BASE}/people/${playerId}/stats?stats=gameLog&group=pitching&season=${season}`),
    ]);
    if (seasonResult.status !== "fulfilled") throw new Error("Pitcher season stats unavailable");
    const data = seasonResult.value;
    const person = personResult.status === "fulfilled" ? personResult.value?.people?.[0] || {} : {};
    const gameLog = gameLogResult.status === "fulfilled" ? gameLogResult.value?.stats?.[0]?.splits || [] : [];
    const stat = data.stats?.[0]?.splits?.[0]?.stat || {};
    const innings = inningsToNumber(stat.inningsPitched);
    const starts = number(stat.gamesStarted);
    const games = number(stat.gamesPlayed);
    const strikeouts = number(stat.strikeOuts);
    const walks = number(stat.baseOnBalls);
    const hits = number(stat.hits);
    const runs = number(stat.runs);
    const earnedRuns = number(stat.earnedRuns);
    const homeRuns = number(stat.homeRuns);
    const recentStarts = summarizePitcherRecentStarts(gameLog);
    const normalized = {
      era: number(stat.era) || LEAGUE.era,
      whip: number(stat.whip) || LEAGUE.whip,
      innings,
      inningsDisplay: stat.inningsPitched || "",
      starts,
      games,
      wins: number(stat.wins),
      losses: number(stat.losses),
      hits,
      runs,
      earnedRuns,
      strikeouts,
      walks,
      homeRuns,
      k9: ratePerNine(strikeouts, innings),
      bb9: ratePerNine(walks, innings),
      hr9: ratePerNine(homeRuns, innings),
      hitsPerNine: ratePerNine(hits, innings),
      inningsPerStart: starts ? innings / starts : innings / Math.max(games, 1),
      throws: person.pitchHand?.code || person.pitchHand?.description || "",
      pitchHand: person.pitchHand?.code || "",
      recentStarts,
    };
    setLimitedMapValue(state.pitcherStats, cacheKey, normalized, MAX_PITCHER_CACHE);
    return normalized;
  } catch {
    setLimitedMapValue(state.pitcherStats, cacheKey, null, MAX_PITCHER_CACHE);
    return null;
  }
}

function extractEspnPitchers(event) {
  const pitchers = { away: null, home: null };
  const competitors = event?.competitions?.[0]?.competitors || [];

  competitors.forEach((competitor) => {
    const side = competitor.homeAway;
    if (side !== "away" && side !== "home") return;

    const probable =
      (competitor.probables || []).find((item) => item.name === "probableStartingPitcher") || competitor.probables?.[0];
    if (!probable) return;

    const stats = statsArrayToObject(probable.statistics || []);
    pitchers[side] = {
      id: probable.playerId || probable.athlete?.id || null,
      name: probable.athlete?.displayName || probable.athlete?.fullName || "Pitcher N/D",
      shortName: probable.athlete?.shortName || probable.athlete?.displayName || "Pitcher N/D",
      headshot: probable.athlete?.headshot || "",
      jersey: probable.athlete?.jersey || "",
      position: probable.athlete?.position?.abbreviation || probable.athlete?.position || "SP",
      record: probable.record || "",
      team: competitor.team?.displayName || "",
      teamAbbreviation: competitor.team?.abbreviation || "",
      teamLogo: competitor.team?.logo || "",
      source: "ESPN",
      stats,
      era: number(stats.ERA),
      wins: number(stats.wins),
      losses: number(stats.losses),
      saves: number(stats.saves),
      errors: number(stats.errors),
    };
  });

  return pitchers;
}

function mergePitcherSources(espnPitcher, mlbPitcher, mlbProbable) {
  if (espnPitcher) {
    return {
      ...espnPitcher,
      mlbId: mlbProbable?.id || null,
      headshot: mlbProbable?.id ? mlbPitcherHeadshotUrl(mlbProbable.id) : espnPitcher.headshot,
      era: fallback(espnPitcher.era, mlbPitcher?.era || LEAGUE.era),
      whip: mlbPitcher?.whip || null,
      innings: mlbPitcher?.innings || null,
      inningsDisplay: mlbPitcher?.inningsDisplay || "",
      hits: mlbPitcher?.hits || null,
      runs: mlbPitcher?.runs || null,
      earnedRuns: mlbPitcher?.earnedRuns || null,
      strikeouts: mlbPitcher?.strikeouts || null,
      walks: mlbPitcher?.walks || null,
      homeRuns: mlbPitcher?.homeRuns || null,
      k9: mlbPitcher?.k9 || null,
      bb9: mlbPitcher?.bb9 || null,
      hr9: mlbPitcher?.hr9 || null,
      hitsPerNine: mlbPitcher?.hitsPerNine || null,
      inningsPerStart: mlbPitcher?.inningsPerStart || null,
      throws: mlbPitcher?.throws || espnPitcher.throws || "",
      pitchHand: mlbPitcher?.pitchHand || "",
      recentStarts: mlbPitcher?.recentStarts || null,
      wins: Number.isFinite(espnPitcher.wins) ? espnPitcher.wins : mlbPitcher?.wins,
      losses: Number.isFinite(espnPitcher.losses) ? espnPitcher.losses : mlbPitcher?.losses,
      source: "ESPN",
    };
  }

  if (mlbProbable || mlbPitcher) {
    return {
      id: mlbProbable?.id || null,
      mlbId: mlbProbable?.id || null,
      name: mlbProbable?.fullName || "Pitcher N/D",
      shortName: mlbProbable?.fullName || "Pitcher N/D",
      headshot: mlbProbable?.id ? mlbPitcherHeadshotUrl(mlbProbable.id) : "",
      jersey: "",
      position: "SP",
      record: "",
      team: "",
      teamAbbreviation: "",
      teamLogo: "",
      source: "MLB respaldo",
      stats: {},
      era: mlbPitcher?.era || LEAGUE.era,
      whip: mlbPitcher?.whip || null,
      innings: mlbPitcher?.innings || null,
      inningsDisplay: mlbPitcher?.inningsDisplay || "",
      hits: mlbPitcher?.hits || null,
      runs: mlbPitcher?.runs || null,
      earnedRuns: mlbPitcher?.earnedRuns || null,
      strikeouts: mlbPitcher?.strikeouts || null,
      walks: mlbPitcher?.walks || null,
      homeRuns: mlbPitcher?.homeRuns || null,
      k9: mlbPitcher?.k9 || null,
      bb9: mlbPitcher?.bb9 || null,
      hr9: mlbPitcher?.hr9 || null,
      hitsPerNine: mlbPitcher?.hitsPerNine || null,
      inningsPerStart: mlbPitcher?.inningsPerStart || null,
      throws: mlbPitcher?.throws || "",
      pitchHand: mlbPitcher?.pitchHand || "",
      recentStarts: mlbPitcher?.recentStarts || null,
      wins: mlbPitcher?.wins ?? null,
      losses: mlbPitcher?.losses ?? null,
      saves: null,
      errors: null,
    };
  }

  return null;
}

function renderGames() {
  const currentDate = els.dateInput?.value || "";
  els.gameCount.textContent = currentDate ? `${state.games.length} (${currentDate})` : state.games.length;
  const scrollTop = els.gamesList ? els.gamesList.scrollTop : 0;

  if (!state.games.length) {
    els.gamesList.innerHTML = emptyState("Sin partidos para esta fecha.");
    return;
  }

  els.gamesList.innerHTML = state.games
    .map((game) => {
      const away = game.teams.away.team;
      const home = game.teams.home.team;
      const selected = game.gamePk === state.selectedGamePk;
      const status = game.status?.detailedState || "Programado";
      const time = game.gameDate ? formatTime(game.gameDate) : "";
      const espnPitchers = extractEspnPitchers(findEspnEvent(game));
      const awayPitcherName = espnPitchers.away?.shortName || game.teams.away.probablePitcher?.fullName || "Abridor N/D";
      const homePitcherName = espnPitchers.home?.shortName || game.teams.home.probablePitcher?.fullName || "Abridor N/D";
      
      const lineupInfo = state.lineupStatusMap.get(game.gamePk);
      let lineupBadgeHtml = "";
      if (lineupInfo?.hasLineup) {
        const source = lineupInfo.source || "MLB";
        lineupBadgeHtml = `<span class="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-350 bg-emerald-100 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-800/60 px-2 py-0.5 rounded-full border"><i data-lucide="check-circle-2" class="h-3 w-3"></i> Lineup ${source} (Oficial)</span>`;
      } else {
        lineupBadgeHtml = `<span class="inline-flex items-center gap-1 text-[10px] font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800/50"><i data-lucide="clock" class="h-3 w-3"></i> Lineup pendiente</span>`;
      }

      return `
        <button
          class="mb-2 w-full rounded-lg border px-3 py-3 text-left transition ${
            selected
              ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-950 dark:text-emerald-300 shadow-sm"
              : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50"
          }"
          type="button"
          data-game-pk="${game.gamePk}"
        >
          <div class="flex flex-wrap items-center justify-between gap-1.5">
            <span class="text-xs font-bold uppercase tracking-wide text-slate-700 dark:text-slate-200">${time}</span>
            <div class="flex flex-wrap items-center gap-1.5">
              ${lineupBadgeHtml}
              <span class="rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 text-xs font-bold text-slate-800 dark:text-slate-100">${status}</span>
            </div>
          </div>
          <div class="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
            <span class="truncate">${away.name}</span>
            <span class="text-slate-550 dark:text-slate-400">@</span>
            <span class="truncate text-right">${home.name}</span>
          </div>
          <div class="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-750 dark:text-slate-200">
            <span class="truncate">${awayPitcherName}</span>
            <span class="truncate text-right">${homePitcherName}</span>
          </div>
        </button>
      `;
    })
    .join("");

  if (els.gamesList) els.gamesList.scrollTop = scrollTop;

  els.gamesList.querySelectorAll("[data-game-pk]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedGamePk = Number(button.dataset.gamePk);
      renderGames();
      renderMatchupHeader(getSelectedGame());
      clearResults(false);
      els.compareBtn.disabled = false;
      if (window.lucide) window.lucide.createIcons();
    });
  });

  if (window.lucide) window.lucide.createIcons();
}

function buildFormBadgeSequence(sequence = [], formScore = null) {
  if (!sequence || !sequence.length) {
    if (Number.isFinite(formScore)) {
      const pct = (formScore * 100).toFixed(1);
      return `
        <div class="mt-1.5 flex flex-col items-center">
          <div class="inline-flex items-center gap-1 rounded-full border border-emerald-300 dark:border-emerald-800 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
            <span>${pct}</span>
            <span class="text-[9px] uppercase tracking-wider font-semibold opacity-90">Forma Promedio</span>
          </div>
        </div>
      `;
    }
    return "";
  }

  const badgeElements = sequence.map((res) => {
    const isWin = res === "W" || res === true;
    const bg = isWin
      ? "bg-emerald-500 text-white font-black"
      : "bg-rose-500 text-white font-black";
    const label = isWin ? "W" : "L";
    return `<span class="inline-flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded ${bg} text-[9px] sm:text-[10px] font-bold leading-none shadow-xs shrink-0" title="${isWin ? 'Victoria' : 'Derrota'}">${label}</span>`;
  }).join("");

  let scoreHtml = "";
  if (Number.isFinite(formScore)) {
    const pct = (formScore * 100).toFixed(1);
    const scoreTone = formScore >= 0.55
      ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800"
      : formScore <= 0.45
        ? "bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800"
        : "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800";

    scoreHtml = `
      <div class="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-bold ${scoreTone}">
        <span>${pct}</span>
        <span class="text-[9px] uppercase tracking-wider font-semibold opacity-90">Forma Promedio</span>
      </div>
    `;
  }

  return `
    <div class="mt-2 flex flex-col items-center gap-1">
      ${scoreHtml}
      <div class="flex items-center justify-center gap-0.5 sm:gap-1 flex-wrap mt-0.5 max-w-[180px] sm:max-w-[210px]">${badgeElements}</div>
    </div>
  `;
}

function renderMatchupHeader(game, projection = null) {
  if (!game) {
    els.matchupHeader.innerHTML = `
      <div class="text-center py-4">
        <h2 class="text-lg font-bold text-slate-700 dark:text-slate-300">Sin comparación</h2>
      </div>
    `;
    if (els.matchupMetadata) {
      els.matchupMetadata.innerHTML = `
        <span class="text-slate-400 dark:text-slate-500 font-semibold">Selecciona un partido de la lista</span>
      `;
    }
    setStadiumBackground('');
    return;
  }

  // Update stadium background using home team's venue immediately
  setStadiumBackground(game.venue?.name || '');

  const away = game.teams.away.team.name;
  const home = game.teams.home.team.name;
  const awayId = game.teams.away.team.id;
  const homeId = game.teams.home.team.id;

  // W-L records
  const awayWins = game.teams.away.leagueRecord?.wins ?? 0;
  const awayLosses = game.teams.away.leagueRecord?.losses ?? 0;
  const homeWins = game.teams.home.leagueRecord?.wins ?? 0;
  const homeLosses = game.teams.home.leagueRecord?.losses ?? 0;

  const awayRecord = (awayWins || awayLosses) ? `${awayWins}-${awayLosses}` : "";
  const homeRecord = (homeWins || homeLosses) ? `${homeWins}-${homeLosses}` : "";

  const awayLogo = mlbTeamLogoUrl(awayId);
  const homeLogo = mlbTeamLogoUrl(homeId);

  const venue = game.venue?.name || "Estadio N/D";
  
  // Try to find location (City, State) from ESPN event context if loaded
  const espnEvent = findEspnEvent(game);
  const espnVenue = espnEvent?.competitions?.[0]?.venue;
  const city = espnVenue?.address?.city || "";
  const state = espnVenue?.address?.state || "";
  const location = city && state ? `${city}, ${state}` : "";

  const time = game.gameDate ? formatTime(game.gameDate) : "";

  // Form Badges if active projection available
  const proj = projection || (state.activeProjection?.game?.gamePk === game.gamePk ? state.activeProjection : null);
  const awayForm = proj?.model?.awayForm;
  const homeForm = proj?.model?.homeForm;
  const awayFormHtml = buildFormBadgeSequence(awayForm?.sequence, awayForm?.score);
  const homeFormHtml = buildFormBadgeSequence(homeForm?.sequence, homeForm?.score);

  // Render metadata on the top row
  if (els.matchupMetadata) {
    const umpireDisplay = proj?.umpireName || "Por confirmar";
    els.matchupMetadata.innerHTML = `
      <div class="flex items-center gap-1.5">
        <i data-lucide="clock" class="h-3.5 w-3.5 text-slate-600 dark:text-slate-300"></i>
        <span class="font-bold text-slate-900 dark:text-white">${time}</span>
      </div>
      <div class="h-3 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block"></div>
      <div class="flex items-start gap-1.5">
        <i data-lucide="map-pin" class="h-3.5 w-3.5 text-slate-600 dark:text-slate-300 mt-0.5"></i>
        <div class="flex flex-col">
          <span class="font-bold uppercase tracking-wider text-slate-900 dark:text-white">${escapeHtml(venue)}</span>
          ${location ? `<span class="text-[9px] sm:text-[10px] text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider mt-0.5">${escapeHtml(location)}</span>` : ""}
        </div>
      </div>
      <div class="h-3 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block"></div>
      <div class="flex items-center gap-1.5">
        <i data-lucide="user-check" class="h-3.5 w-3.5 text-slate-600 dark:text-slate-300"></i>
        <span class="font-bold text-slate-900 dark:text-white">Árbitro: <span class="${proj?.umpireName ? 'text-amber-600 dark:text-amber-400 font-black' : 'text-slate-500 font-medium'}">${escapeHtml(umpireDisplay)}</span></span>
      </div>
    `;
  }

  // Render full matchups on the bottom row (below the button/metadata)
  els.matchupHeader.innerHTML = `
    <div class="flex items-center justify-center gap-4 sm:gap-10 w-full py-2 relative z-10">
      <!-- Away Team -->
      <div class="flex flex-col items-center text-center max-w-[170px] sm:max-w-[220px]">
        <img src="${awayLogo}" alt="${away}" class="h-12 w-12 sm:h-14 sm:w-14 object-contain img-smooth" onerror="this.style.display='none'" />
        <span class="mt-2 text-sm sm:text-base font-black uppercase text-slate-900 dark:text-white tracking-wider">${escapeHtml(away)}</span>
        <span class="mt-0.5 text-xs sm:text-sm text-slate-700 dark:text-slate-200 font-bold">${escapeHtml(awayRecord)}</span>
        ${awayFormHtml}
      </div>
      
      <!-- @ Circle -->
      <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 self-center">
        <span class="text-xs font-bold text-slate-600 dark:text-slate-300">@</span>
      </div>
      
      <!-- Home Team -->
      <div class="flex flex-col items-center text-center max-w-[170px] sm:max-w-[220px]">
        <img src="${homeLogo}" alt="${home}" class="h-12 w-12 sm:h-14 sm:w-14 object-contain img-smooth" onerror="this.style.display='none'" />
        <span class="mt-2 text-sm sm:text-base font-black uppercase text-slate-900 dark:text-white tracking-wider">${escapeHtml(home)}</span>
        <span class="mt-0.5 text-xs sm:text-sm text-slate-700 dark:text-slate-200 font-bold">${escapeHtml(homeRecord)}</span>
        ${homeFormHtml}
      </div>
    </div>
  `;

  // Instantiate Lucide icons inside the newly injected HTML
  if (window.lucide) window.lucide.createIcons();
}

function renderSummary(projection) {
  const getAbbrev = (teamName, gameObj) => {
    if (!gameObj || !gameObj.teams) return teamAbbrev(teamName);
    const away = gameObj.teams.away?.team;
    const home = gameObj.teams.home?.team;
    if (away && normalizeName(away.name) === normalizeName(teamName)) {
      return away.abbreviation || teamAbbrev(away.name);
    }
    if (home && normalizeName(home.name) === normalizeName(teamName)) {
      return home.abbreviation || teamAbbrev(home.name);
    }
    return teamAbbrev(teamName);
  };

  const getTeamNickname = (teamName, gameObj) => {
    if (!gameObj || !gameObj.teams) return teamName;
    const away = gameObj.teams.away?.team;
    const home = gameObj.teams.home?.team;
    if (away && normalizeName(away.name) === normalizeName(teamName)) {
      return away.teamName || away.name;
    }
    if (home && normalizeName(home.name) === normalizeName(teamName)) {
      return home.teamName || home.name;
    }
    return teamName;
  };

  const winnerDisplay = getTeamNickname(projection.favorite, projection.game);
  const handicapDisplay = projection.runLinePick;

  const cards = [
    ["Ganador", winnerDisplay, `${Math.round(projection.winProbability * 100)}%`],
    ["Carreras", projection.totalRuns.toFixed(1), `${projection.awayName} ${projection.awayRuns} · ${projection.homeName} ${projection.homeRuns}`],
    ["Hits", projection.totalHits.toFixed(1), `${projection.awayName} ${projection.awayHits} · ${projection.homeName} ${projection.homeHits}`],
    ["Handicap", handicapDisplay, projection.handicapConfidence || projection.confidence],
  ];

  if (projection.monteCarlo) {
    const mc = projection.monteCarlo;
    const f5FavName = mc.f5Favorite === "home" ? projection.homeName : projection.awayName;
    const f5Fav = getTeamNickname(f5FavName, projection.game);
    const f5Prob = Math.round(mc.f5FavoriteProb * 100);
    cards.push([
      "Monte Carlo (10k)",
      `F5: ${f5Fav}`,
      `Prob F5: ${f5Prob}% · Empate 1st 5: ${Math.round(mc.f5TieProb * 100)}% · 10k iteraciones`,
    ]);
  }

  if (projection.weather) {
    const weather = projection.weather;
    const desc = translateWeatherDescription(weather.description || "Clima");
    const icon = weatherIconFromDescription(desc);
    const densityText = projection.airDensity ? ` · 🎈 Densidad: ${projection.airDensity.density} kg/m³ (${projection.airDensity.densityAltitudeFt}ft Alt)` : "";
    const weatherLabel = `${icon} ${weather.temperature ?? "N/D"}°C`;
    const rainProbText = (weather.precipitationProbability !== undefined && weather.precipitationProbability !== null) ? ` · 🌧️ ${weather.precipitationProbability}%` : "";

    // Dirección del viento con ícono y análisis de impacto
    let windDirText = "";
    if (weather.windDirection) {
      const dir = String(weather.windDirection).toLowerCase();
      const windSpeedNum = number(weather.windSpeed);
      const isOut = /\bout\b|s[ew]?$|s[ew][a-z]*|south/.test(dir);
      const isIn  = /\bin\b|n[ew]?$|n[ew][a-z]*|north/.test(dir);
      let windArrow = "💨";
      let windImpact = "";
      if (isOut && windSpeedNum >= 15) {
        windArrow = "⬆️";
        windImpact = " (↑ Over)";
      } else if (isIn && windSpeedNum >= 15) {
        windArrow = "⬇️";
        windImpact = " (↓ Under)";
      }
      windDirText = ` · ${windArrow} ${weather.windDirection}${windImpact}`;
    }

    const weatherMeta = `${desc} · Viento ${weather.windSpeed ?? "N/D"} km/h${windDirText} · Humedad ${weather.humidity ?? "N/D"}%${rainProbText}${densityText}`;
    cards.push(["Clima", weatherLabel, weatherMeta, getWeatherCardClasses(desc) + " sm:col-span-2"]);
  }

  els.summaryGrid.innerHTML = cards
    .map(
      ([label, value, meta, customClasses]) => {
        const baseClasses = "rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-4 shadow-panel dark:shadow-panel-dark";
        let finalClasses = baseClasses;
        if (customClasses) {
          if (customClasses.includes("border") || customClasses.includes("from-")) {
            finalClasses = customClasses;
          } else {
            finalClasses = `${baseClasses} ${customClasses}`;
          }
        }
        
        // Dynamically adjust font size to avoid overflow of long team names
        const valStr = String(value);
        let fontSizeClass = "text-2xl sm:text-3xl";
        if (valStr.length > 20) {
          fontSizeClass = "text-sm sm:text-base";
        } else if (valStr.length > 14) {
          fontSizeClass = "text-base sm:text-lg";
        } else if (valStr.length > 10) {
          fontSizeClass = "text-lg sm:text-xl";
        }
        
        return `
          <article class="${finalClasses}">
            <p class="truncate ${fontSizeClass} font-sports font-black text-black dark:text-white leading-none tracking-wider uppercase" title="${escapeHtml(value)}">${value}</p>
            <p class="mt-1.5 text-[10px] sm:text-xs font-bold tracking-widest uppercase text-slate-700 dark:text-slate-200 font-sans">${label}</p>
            <p class="mt-2 text-xs font-semibold text-slate-900 dark:text-slate-100 font-sans">${meta}</p>
          </article>
        `;
      }
    )
    .join("");
}

function calcularBestBets(projection) {
  if (!projection) return [];

  const candidateBets = [];
  const awayName = projection.awayName;
  const homeName = projection.homeName;
  const awayPitcher = projection.pitchers?.away;
  const homePitcher = projection.pitchers?.home;

  // 1. Ganador Directo (Moneyline) — con teamItems para diseño consistente
  const winProb = projection.winProbability;
  const favTeam = projection.favorite;
  const favPct = Math.round(winProb * 100);
  if (winProb >= 0.52) {
    let tier = "VALOR";
    let tierBadge = "🎯 Ángulo de Valor";
    let tierBg = "bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700";
    if (winProb >= 0.66) {
      tier = "CANDADO";
      tierBadge = "👑 Candado Ganador";
      tierBg = "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700";
    } else if (winProb >= 0.58) {
      tier = "SEGURA";
      tierBadge = "🛡️ Apuesta Segura";
      tierBg = "bg-indigo-100 dark:bg-indigo-950/50 text-indigo-800 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700";
    }

    const awayWinPct = favTeam === awayName ? favPct : 100 - favPct;
    const homeWinPct = favTeam === homeName ? favPct : 100 - favPct;
    const awayForm = projection.model?.awayForm;
    const homeForm = projection.model?.homeForm;
    const awayFormStr = awayForm?.rating ? ` · Forma: ${awayForm.rating}` : "";
    const homeFormStr = homeForm?.rating ? ` · Forma: ${homeForm.rating}` : "";

    candidateBets.push({
      category: "EQUIPO · GANADOR",
      title: `${favTeam} — Ganador Directo (Moneyline)`,
      selection: `${favTeam} a Ganar`,
      prob: winProb,
      probPct: favPct,
      tier,
      tierBadge,
      tierBg,
      metricLabel: `Prob: ${awayWinPct}% (${awayName}) | ${homeWinPct}% (${homeName})`,
      teamItems: [
        {
          icon: "✈️",
          teamName: awayName,
          playerName: favTeam === awayName ? "⭐ Favorito (Pick)" : "Visitante",
          betLine: `${awayWinPct}% Win`,
          probPct: awayWinPct,
          isPick: favTeam === awayName,
          barColor: awayWinPct >= 55 ? "bg-gradient-to-r from-emerald-500 to-teal-400" : "bg-gradient-to-r from-amber-500 to-yellow-400",
          details: `<strong>${awayName} Moneyline</strong> · Prob victoria: ${awayWinPct}%${awayFormStr}`
        },
        {
          icon: "🏠",
          teamName: homeName,
          playerName: favTeam === homeName ? "⭐ Favorito (Pick)" : "Local",
          betLine: `${homeWinPct}% Win`,
          probPct: homeWinPct,
          isPick: favTeam === homeName,
          barColor: homeWinPct >= 55 ? "bg-gradient-to-r from-emerald-500 to-teal-400" : "bg-gradient-to-r from-amber-500 to-yellow-400",
          details: `<strong>${homeName} Moneyline</strong> · Prob victoria: ${homeWinPct}%${homeFormStr}`
        }
      ],
      icon: "trophy",
      order: 1
    });
  }

  // 2. Total Carreras (Over / Under) — Siempre disponible para todos los partidos
  if (projection.totalRuns != null) {
    const estimate = projection.totalRuns.toFixed(1);
    const lineVal = projection.odds?.overUnder || 8.5;
    let leanText = projection.totalLean;
    if (!leanText || leanText.includes("medio") || leanText.includes("Cerca")) {
      leanText = projection.totalRuns >= lineVal ? `Over ${lineVal}` : `Under ${lineVal}`;
    }
    const awayR = projection.awayRuns ?? (projection.totalRuns / 2);
    const homeR = projection.homeRuns ?? (projection.totalRuns / 2);
    const totalProb = projection.totalConfidence === "Alta" ? 0.65 : (projection.totalConfidence === "Media" ? 0.58 : 0.53);
    const totalProbPct = Math.round(totalProb * 100);
    let tier = "VALOR";
    let tierBadge = "🎯 Ángulo de Valor";
    let tierBg = "bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700";
    if (totalProb >= 0.62) {
      tier = "SEGURA";
      tierBadge = "🛡️ Apuesta Segura";
      tierBg = "bg-indigo-100 dark:bg-indigo-950/50 text-indigo-800 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700";
    }
    const awayRunPct = Math.round((awayR / (awayR + homeR || 1)) * 100);
    const homeRunPct = 100 - awayRunPct;

    candidateBets.push({
      category: "PARTIDO · CARRERAS",
      title: `${leanText} Carreras`,
      selection: `${leanText} (${estimate} est.)`,
      prob: totalProb,
      probPct: totalProbPct,
      tier,
      tierBadge,
      tierBg,
      metricLabel: `Est: ${estimate} runs`,
      teamItems: [
        {
          icon: "✈️",
          teamName: awayName,
          playerName: `${awayR.toFixed(1)} Carreras Est.`,
          betLine: `${awayRunPct}% ataque`,
          probPct: awayRunPct,
          barColor: "bg-gradient-to-r from-indigo-500 to-sky-400",
          details: `<strong>${awayName}</strong> proyecta <strong>${awayR.toFixed(1)} carreras</strong> · Total: ${estimate} R`
        },
        {
          icon: "🏠",
          teamName: homeName,
          playerName: `${homeR.toFixed(1)} Carreras Est.`,
          betLine: `${homeRunPct}% ataque`,
          probPct: homeRunPct,
          barColor: "bg-gradient-to-r from-indigo-500 to-sky-400",
          details: `<strong>${homeName}</strong> proyecta <strong>${homeR.toFixed(1)} carreras</strong> · ${leanText} (${projection.odds?.overUnder ?? estimate} R)`
        }
      ],
      icon: "trending-up",
      order: 2
    });
  }

  // 3. Handicap / Run Line (+1.5 / -1.5) — SIEMPRE se muestra para todos los partidos de forma coherente
  {
    const rlPick = projection.runLinePick || `${favTeam} -1.5`;
    const rlProb = projection.runLineProb || (projection.handicapConfidence === "Alta" ? 0.64 : projection.handicapConfidence === "Media" ? 0.57 : 0.52);
    const rlConfidence = projection.handicapConfidence || projection.confidence || "Baja";
    const rlPct = Math.round(rlProb * 100);

    const isAwayPick = rlPick.includes(awayName);
    const isHomePick = rlPick.includes(homeName);
    const isPlusLine = rlPick.includes("+1.5");

    let awayLine = "-1.5 Runs";
    let homeLine = "-1.5 Runs";
    let awayLabel = "Favorito -1.5";
    let homeLabel = "Favorito -1.5";
    let awayProb = 100 - rlPct;
    let homeProb = 100 - rlPct;
    let awayIsPick = false;
    let homeIsPick = false;

    if (isAwayPick) {
      awayIsPick = true;
      awayProb = rlPct;
      homeProb = 100 - rlPct;
      if (isPlusLine) {
        awayLine = "+1.5 Runs";
        awayLabel = "⭐ Underdog +1.5 (Pick)";
        homeLine = "-1.5 Runs";
        homeLabel = "Favorito -1.5";
      } else {
        awayLine = "-1.5 Runs";
        awayLabel = "⭐ Run Line -1.5 (Pick)";
        homeLine = "+1.5 Runs";
        homeLabel = "Underdog +1.5";
      }
    } else if (isHomePick) {
      homeIsPick = true;
      homeProb = rlPct;
      awayProb = 100 - rlPct;
      if (isPlusLine) {
        homeLine = "+1.5 Runs";
        homeLabel = "⭐ Underdog +1.5 (Pick)";
        awayLine = "-1.5 Runs";
        awayLabel = "Favorito -1.5";
      } else {
        homeLine = "-1.5 Runs";
        homeLabel = "⭐ Run Line -1.5 (Pick)";
        awayLine = "+1.5 Runs";
        awayLabel = "Underdog +1.5";
      }
    } else {
      if (favTeam === awayName) {
        awayIsPick = true;
        awayProb = rlPct;
        homeProb = 100 - rlPct;
        awayLine = "-1.5 Runs";
        awayLabel = "⭐ Run Line -1.5";
        homeLine = "+1.5 Runs";
        homeLabel = "Underdog +1.5";
      } else {
        homeIsPick = true;
        homeProb = rlPct;
        awayProb = 100 - rlPct;
        homeLine = "-1.5 Runs";
        homeLabel = "⭐ Run Line -1.5";
        awayLine = "+1.5 Runs";
        awayLabel = "Underdog +1.5";
      }
    }

    let tier = "VALOR";
    let tierBadge = "🎯 Ángulo de Valor";
    let tierBg = "bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700";
    if (rlPct >= 60 || rlConfidence === "Alta") {
      tier = "SEGURA";
      tierBadge = "🛡️ Apuesta Segura";
      tierBg = "bg-indigo-100 dark:bg-indigo-950/50 text-indigo-800 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700";
    }

    candidateBets.push({
      category: "EQUIPO · HANDICAP",
      title: rlPick,
      selection: rlPick,
      prob: rlProb,
      probPct: rlPct,
      tier,
      tierBadge,
      tierBg,
      metricLabel: `Diff: ${formatSigned(projection.diff)}`,
      teamItems: [
        {
          icon: "✈️",
          teamName: awayName,
          playerName: awayLabel,
          betLine: awayLine,
          probPct: awayProb,
          isPick: awayIsPick,
          barColor: awayIsPick ? "bg-gradient-to-r from-emerald-500 to-teal-400" : "bg-gradient-to-r from-amber-500 to-yellow-400",
          details: `<strong>${awayName} ${awayLine}</strong> · Diff proyectado: ${formatSigned(projection.diff)} · Prob: ${awayProb}%`
        },
        {
          icon: "🏠",
          teamName: homeName,
          playerName: homeLabel,
          betLine: homeLine,
          probPct: homeProb,
          isPick: homeIsPick,
          barColor: homeIsPick ? "bg-gradient-to-r from-emerald-500 to-teal-400" : "bg-gradient-to-r from-amber-500 to-yellow-400",
          details: `<strong>${homeName} ${homeLine}</strong> · Diff proyectado: ${formatSigned(projection.diff)} · Prob: ${homeProb}%`
        }
      ],
      icon: "shield-check",
      order: 3
    });
  }

  // 4. Ponches de Pitcher Abridor — Destacados por Equipo (1 Visitante ✈️ y 1 Local 🏠)
  const isPitchingDuel = (projection.totalRuns ?? 8.5) < 7.8;
  const awayEra = projection.model?.awayPitcherMetrics?.era ?? projection.pitchers?.away?.era ?? 4.0;
  const homeEra = projection.model?.homePitcherMetrics?.era ?? projection.pitchers?.home?.era ?? 4.0;
  const isAceDuel = (awayEra > 0 && awayEra < 3.50) && (homeEra > 0 && homeEra < 3.50);

  const isAwayPitcherDominant = (projection.model?.awayPitcherMetrics?.era != null && projection.model.awayPitcherMetrics.era < 3.20) ||
                                (projection.model?.awayPitcherMetrics?.whip != null && projection.model.awayPitcherMetrics.whip < 1.10) ||
                                (projection.model?.awayPitcherMetrics?.k9 != null && projection.model.awayPitcherMetrics.k9 > 9.5);
                                
  const isHomePitcherDominant = (projection.model?.homePitcherMetrics?.era != null && projection.model.homePitcherMetrics.era < 3.20) ||
                                (projection.model?.homePitcherMetrics?.whip != null && projection.model.homePitcherMetrics.whip < 1.10) ||
                                (projection.model?.homePitcherMetrics?.k9 != null && projection.model.homePitcherMetrics.k9 > 9.5);

  const pitcherItems = [];
  [
    { p: awayPitcher, m: projection.model?.awayPitcherMetrics, teamName: awayName, icon: "✈️" },
    { p: homePitcher, m: projection.model?.homePitcherMetrics, teamName: homeName, icon: "🏠" }
  ].forEach(({ p, m, teamName, icon }) => {
    if (!p || !m) return;
    const k9 = numberOr(m.k9, LEAGUE.pitcherK9);
    const ipEst = m.inningsPerStart || 5.2;
    const estKs = (k9 / 9) * ipEst;
    const line = Math.max(3.5, Math.floor(estKs - 0.4) + 0.5);
    const prob = clamp(0.52 + (estKs - line) * 0.12, 0.50, 0.85);
    const pPct = Math.round(prob * 100);
    
    pitcherItems.push({
      icon,
      teamName,
      playerName: p.name || p.shortName || "Abridor",
      betLine: `Over ${line} K`,
      probPct: pPct,
      barColor: pPct >= 65 ? "bg-gradient-to-r from-emerald-500 to-teal-400" : "bg-gradient-to-r from-indigo-500 to-sky-400",
      details: `<strong>Over ${line} Ponches</strong> (${estKs.toFixed(1)} K Est.) · ${k9.toFixed(1)} K/9 en ${ipEst.toFixed(1)} IP`
    });
  });

  if (pitcherItems.length > 0) {
    const maxProb = Math.max(...pitcherItems.map(i => i.probPct));
    let tier = "VALOR";
    let tierBadge = "🎯 Ángulo de Valor";
    let tierBg = "bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700";
    if (maxProb >= 67 || isAceDuel || isPitchingDuel) {
      tier = "CANDADO";
      tierBadge = "👑 Candado Ponches";
      tierBg = "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700";
    } else if (maxProb >= 60) {
      tier = "SEGURA";
      tierBadge = "🛡️ Apuesta Segura";
      tierBg = "bg-indigo-100 dark:bg-indigo-950/50 text-indigo-800 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700";
    }

    candidateBets.push({
      category: "PITCHER · PONCHES (STRIKEOUTS)",
      title: "Ponches de Pitcher Abridor Por Jugador",
      selection: `Ponches (${pitcherItems.map(i => i.playerName).join(" / ")})`,
      prob: maxProb / 100,
      probPct: maxProb,
      tier,
      tierBadge,
      tierBg,
      metricLabel: `Ponches Abridor (${awayName} vs ${homeName})`,
      teamItems: pitcherItems,
      icon: "activity",
      order: (isAceDuel || isPitchingDuel) ? 2.5 : 4
    });
  }

  // 5. Props de Bateadores (Hits, Bases Totales, Jonrones) — Disponibles solo con lineup oficial confirmado
  const rawAwayLineup = (projection.awayLineup && projection.awayLineup.length > 0)
    ? projection.awayLineup.map(h => ({ ...h, teamName: awayName })).filter(h => h && h.name)
    : [];

  const rawHomeLineup = (projection.homeLineup && projection.homeLineup.length > 0)
    ? projection.homeLineup.map(h => ({ ...h, teamName: homeName })).filter(h => h && h.name)
    : [];

  const awayHitters = rawAwayLineup.map(h => ({ ...h, teamName: awayName, role: "Visitante", icon: "✈️" }));
  const homeHitters = rawHomeLineup.map(h => ({ ...h, teamName: homeName, role: "Local", icon: "🏠" }));

  if (awayHitters.length > 0 && homeHitters.length > 0) {

    // A) JONRÓN DE DESTACADO POR EQUIPO
    const getBestHrHitter = (hitters, isOppDominant) => {
      if (!hitters || hitters.length === 0) return null;
      const candidates = hitters
        .filter(h => h.hrProb >= 0.06 && (h.recentAvg == null || (!h.isColdHitter && h.recentAvg >= 0.200)))
        .filter(h => !isOppDominant || (h.slg || 0) >= 0.460)
        .sort((a, b) => (b.hrScore || b.hrProb) - (a.hrScore || a.hrProb));
      if (candidates.length > 0) return candidates[0];
      // Fallback: pick hitter with highest HR probability/score if strict filters returned no match
      return hitters.sort((a, b) => (b.hrScore || b.hrProb || 0) - (a.hrScore || a.hrProb || 0))[0] || null;
    };

    const awayTopHr = getBestHrHitter([...awayHitters], isHomePitcherDominant);
    const homeTopHr = getBestHrHitter([...homeHitters], isAwayPitcherDominant);

    const createHrItem = (hitter, icon) => {
      if (!hitter) return null;
      let rawProb = hitter.hrProb;
      if (isPitchingDuel) rawProb *= 0.70;
      const pPct = Math.round(rawProb * 100);
      let streakStr = "";
      if (hitter.recentAvg != null) {
        const recentFormat = `.${Math.round(hitter.recentAvg * 1000)}`;
        if (hitter.isHotHitter) streakStr = ` · 🔥 en racha (${recentFormat} en 14J)`;
        else if (hitter.recentAvg >= 0.250) streakStr = ` · Buen momento (${recentFormat})`;
        else streakStr = ` · 14J: ${recentFormat}`;
      }
      return {
        icon,
        teamName: hitter.teamName,
        playerName: hitter.name,
        betLine: "Over 0.5 HR",
        probPct: pPct,
        barColor: pPct >= 20 ? "bg-gradient-to-r from-purple-500 to-indigo-500" : "bg-gradient-to-r from-purple-400 to-amber-500",
        details: `<strong>Over 0.5 Jonrones</strong>${streakStr} · ${hitter.homeRuns || 10} HR temp`
      };
    };

    const hrItems = [createHrItem(awayTopHr, "✈️"), createHrItem(homeTopHr, "🏠")].filter(Boolean);

    if (hrItems.length > 0 && !isPitchingDuel) {
      const maxHrProb = Math.max(...hrItems.map(i => i.probPct));
      candidateBets.push({
        category: "BATEADOR · JONRONES",
        title: "Jonrón Destacado Por Jugador",
        selection: `Over 0.5 HR (${hrItems.map(i => i.playerName).join(" / ")})`,
        prob: maxHrProb / 100,
        probPct: maxHrProb,
        tier: "VALOR",
        tierBadge: "💥 Poder Extrabase",
        tierBg: "bg-purple-100 dark:bg-purple-950/50 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-700",
        metricLabel: `Prob HR (${awayName} vs ${homeName})`,
        teamItems: hrItems,
        icon: "sparkles",
        order: 7
      });
    }

    // B) HITS DESTACADOS POR EQUIPO (Con filtro de lanzador dominante y duelo de picheo)
    const getBestHitsHitter = (hitters, isOppDominant) => {
      if (!hitters || hitters.length === 0) return null;
      const filtered = hitters
        .filter(h => !h.isColdHitter && (h.recentAvg == null || h.recentAvg >= 0.200))
        .filter(h => !isOppDominant || (h.avg || 0.250) >= 0.260);
      if (filtered.length > 0) {
        return filtered.sort((a, b) => (b.pHits1 || 0) - (a.pHits1 || 0))[0];
      }
      // Fallback si ningún bateador supera los filtros estrictos, para garantizar que ambos equipos aparezcan
      return hitters.sort((a, b) => (b.pHits1 || b.projectedHits || 0) - (a.pHits1 || a.projectedHits || 0))[0] || null;
    };

    const awayTopHits = getBestHitsHitter([...awayHitters], isHomePitcherDominant);
    const homeTopHits = getBestHitsHitter([...homeHitters], isAwayPitcherDominant);

    const createHitsItem = (hitter, icon, isOppDominant) => {
      if (!hitter) return null;
      // Priorizar Over 0.5 Hits para mantener apuestas de alta confianza (65%-85%)
      // Exigir Over 1.5 Hits únicamente cuando la probabilidad binomial de 2+ hits sea verdaderamente alta (>= 52%)
      const isOver1_5 = (hitter.pHits2 || 0) >= 0.52;
      const lineText = isOver1_5 ? "Over 1.5 Hits" : "Over 0.5 Hits";
      let prob = isOver1_5 ? (hitter.pHits2 || 0.35) : (hitter.pHits1 || 0.60);
      if (isPitchingDuel) prob *= 0.80;
      if (isOppDominant) prob *= 0.85;
      const pPct = Math.round(prob * 100);
      const recentStr = hitter.recentAvg ? ` · ult 14J: .${Math.round(hitter.recentAvg * 1000)}` : "";
      return {
        icon,
        teamName: hitter.teamName,
        playerName: hitter.name,
        betLine: lineText,
        probPct: pPct,
        barColor: pPct >= 70 ? "bg-gradient-to-r from-emerald-500 to-teal-400" : "bg-gradient-to-r from-indigo-500 to-sky-400",
        details: `<strong>${lineText}</strong> (${(hitter.projectedHits || 1.0).toFixed(1)} Hits Est.) · AVG .${Math.round((hitter.avg || 0.245) * 1000)}${recentStr}`
      };
    };

    const hitsItems = [
      createHitsItem(awayTopHits, "✈️", isHomePitcherDominant),
      createHitsItem(homeTopHits, "🏠", isAwayPitcherDominant)
    ].filter(Boolean);

    if (hitsItems.length > 0) {
      const avgProb = Math.round(sum(hitsItems.map(i => i.probPct)) / hitsItems.length);
      let tier = "VALOR";
      let tierBadge = "🎯 Ángulo de Valor";
      let tierBg = "bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700";
      if (avgProb >= 70 && !isPitchingDuel) {
        tier = "CANDADO";
        tierBadge = "👑 Candado de Hits";
        tierBg = "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700";
      } else if (avgProb >= 63 && !isPitchingDuel) {
        tier = "SEGURA";
        tierBadge = "🛡️ Apuesta Segura";
        tierBg = "bg-indigo-100 dark:bg-indigo-950/50 text-indigo-800 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700";
      }

      candidateBets.push({
        category: "BATEADOR · HITS",
        title: "Hits Totales Por Jugador",
        selection: `Hits (${hitsItems.map(i => i.playerName).join(" / ")})`,
        prob: avgProb / 100,
        probPct: avgProb,
        tier,
        tierBadge,
        tierBg,
        metricLabel: `Hits Est. (${awayName} vs ${homeName})`,
        teamItems: hitsItems,
        icon: "zap",
        order: isPitchingDuel ? 6 : 5
      });
    }

    // C) BASES TOTALES DESTACADAS POR EQUIPO (Con filtro estricto de Duelo de Picheo / Pitcher Dominante / Racha Fría)
    const getBestTbHitter = (hitters, isOppDominant) => {
      if (!hitters || hitters.length === 0) return null;
      // Regla 3: No sugerir 1+ TB para bateadores en rachas frías o contra lanzadores dominantes
      const validHitters = hitters.filter(h => {
        const isCold = h.isColdHitter || (h.recentAvg != null && h.recentAvg < 0.210);
        if (isCold) return false;
        if (isOppDominant && (h.slg || 0.400) < 0.440) return false;
        return true;
      });
      const pool = validHitters.length > 0 ? validHitters : hitters;
      return pool.sort((a, b) => (b.pTB1_5 || b.projectedTB || 0) - (a.pTB1_5 || a.projectedTB || 0))[0] || null;
    };

    const awayTopTb = getBestTbHitter([...awayHitters], isHomePitcherDominant);
    const homeTopTb = getBestTbHitter([...homeHitters], isAwayPitcherDominant);

    const createTbItem = (hitter, icon, isOppDominant) => {
      if (!hitter) return null;
      const isOver1_5 = hitter.pTB1_5 >= 0.48 || hitter.projectedTB >= 1.45;
      const lineText = isOver1_5 ? "Over 1.5 TB" : "Over 0.5 TB";
      let rawProb = isOver1_5 ? hitter.pTB1_5 : clamp(1 - Math.exp(-hitter.projectedTB), 0.40, 0.90);
      // Regla 1: Si el total proyectado es menor a 7.8 (Duelo de Picheo), reduce drásticamente la confianza
      if (isPitchingDuel) rawProb *= 0.70;
      if (isOppDominant) rawProb *= 0.80;
      const pPct = Math.round(rawProb * 100);
      const note = isPitchingDuel ? " · ⚠️ Duelo de Picheo (<7.8 R)" : (isOppDominant ? " · ⚠️ Pitcher Dominante" : "");
      return {
        icon,
        teamName: hitter.teamName,
        playerName: hitter.name,
        betLine: lineText,
        probPct: pPct,
        barColor: pPct >= 60 ? "bg-gradient-to-r from-indigo-500 to-sky-400" : "bg-gradient-to-r from-amber-500 to-yellow-400",
        details: `<strong>${lineText}</strong> (${hitter.projectedTB.toFixed(1)} TB Est.) · SLG .${Math.round((hitter.slg || 0.400) * 1000)}${note}`
      };
    };

    const tbItems = [
      createTbItem(awayTopTb, "✈️", isHomePitcherDominant),
      createTbItem(homeTopTb, "🏠", isAwayPitcherDominant)
    ].filter(Boolean);

    if (tbItems.length > 0) {
      const avgProb = Math.round(sum(tbItems.map(i => i.probPct)) / tbItems.length);
      let tier = "VALOR";
      let tierBadge = "🎯 Ángulo de Valor";
      let tierBg = "bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700";
      
      if (isPitchingDuel || isAceDuel) {
        tier = "PRECAUCIÓN";
        tierBadge = "⚠️ Bajo en Duelo Picheo";
        tierBg = "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700";
      } else if (avgProb >= 58) {
        tier = "CANDADO";
        tierBadge = "👑 Candado Extrabase";
        tierBg = "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700";
      } else if (avgProb >= 50) {
        tier = "SEGURA";
        tierBadge = "🛡️ Apuesta Segura";
        tierBg = "bg-indigo-100 dark:bg-indigo-950/50 text-indigo-800 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700";
      }

      candidateBets.push({
        category: "BATEADOR · BASES TOTALES",
        title: "Bases Totales Destacadas Por Jugador",
        selection: `Bases Totales (${tbItems.map(i => i.playerName).join(" / ")})`,
        prob: avgProb / 100,
        probPct: avgProb,
        tier,
        tierBadge,
        tierBg,
        metricLabel: `TB Est. (${awayName} vs ${homeName})`,
        teamItems: tbItems,
        icon: "flame",
        order: (isPitchingDuel || isAceDuel) ? 8 : 6
      });
    }
  }

  // Ordenar apuestas por categoría definida
  candidateBets.sort((a, b) => a.order - b.order);

  return candidateBets;
}

function renderBestBets(projection) {
  const container = document.getElementById("bestBetsSection");
  if (!container) return;

  if (!projection) {
    container.innerHTML = "";
    return;
  }

  const bets = calcularBestBets(projection);
  const isOfficialLineup = (projection.lineupSource === "MLB" || projection.lineupSource === "ESPN");

  const candados = bets.filter(b => b.tier === "CANDADO");
  const seguras = bets.filter(b => b.tier === "SEGURA");

  const renderBetCard = (bet) => {
    const getRiskBadge = (pct) => {
      if (pct >= 70) {
        return `<span class="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-black uppercase whitespace-nowrap bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">🟢 Muy Segura</span>`;
      }
      if (pct >= 60) {
        return `<span class="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-black uppercase whitespace-nowrap bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800">🔵 Segura</span>`;
      }
      if (pct >= 50) {
        return `<span class="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-black uppercase whitespace-nowrap bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">🟡 Medio Arriesgada</span>`;
      }
      return `<span class="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-black uppercase whitespace-nowrap bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800">🔴 Arriesgada</span>`;
    };

    const isSinglePickCard = bet.category.includes("GANADOR") || bet.category.includes("HANDICAP");

    const teamListHtml = bet.teamItems ? `
      <div class="space-y-2 mb-3">
        ${bet.teamItems.map(item => {
          const isSelectedPick = item.isPick || (item.playerName && item.playerName.includes("Pick"));
          
          let boxClasses = "bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-200/80 dark:border-slate-800 min-w-0";
          let pickBadgeHtml = "";

          if (isSinglePickCard) {
            if (isSelectedPick) {
              boxClasses = "bg-emerald-50/90 dark:bg-emerald-950/40 p-2.5 rounded-lg border-2 border-emerald-500 dark:border-emerald-600 shadow-sm min-w-0";
              pickBadgeHtml = `<span class="inline-flex items-center shrink-0 rounded bg-emerald-600 px-1.5 py-0.5 text-[9px] font-black text-white uppercase tracking-wider font-mono whitespace-nowrap">✅ PICK OFICIAL</span>`;
            } else {
              boxClasses = "bg-slate-100/50 dark:bg-slate-900/40 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 opacity-60 min-w-0";
              pickBadgeHtml = `<span class="inline-flex items-center shrink-0 rounded bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 text-[9px] font-bold text-slate-600 dark:text-slate-400 uppercase font-mono whitespace-nowrap">❌ LADO OPUESTO</span>`;
            }
          }

          const itemRiskBadge = (!isSinglePickCard || isSelectedPick) ? getRiskBadge(item.probPct) : "";

          return `
            <div class="${boxClasses}">
              <!-- Fila 1: Icono + Equipo (Izq) & Badges (Der) -->
              <div class="flex items-center justify-between gap-1.5 flex-wrap mb-1">
                <div class="flex items-center gap-1.5 font-mono text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase truncate min-w-0 max-w-[55%]">
                  <span class="text-sm leading-none shrink-0">${item.icon}</span>
                  <span class="truncate">${escapeHtml(item.teamName)}</span>
                </div>
                <div class="flex items-center gap-1 shrink-0 flex-wrap justify-end ml-auto">
                  ${pickBadgeHtml}
                  <span class="inline-flex items-center shrink-0 rounded bg-slate-200/80 dark:bg-slate-700/80 px-2 py-0.5 text-[10px] font-black text-slate-800 dark:text-slate-200 font-mono whitespace-nowrap">
                    ${escapeHtml(item.betLine)}
                  </span>
                </div>
              </div>
              
              <!-- Fila 2: NOMBRE DEL JUGADOR / PICK -->
              <div class="text-sm font-black text-slate-900 dark:text-white tracking-tight leading-snug break-words">
                ${escapeHtml(item.playerName)}
              </div>

              <!-- Fila 3: Detalles Estadísticos / Racha -->
              <div class="text-[11px] font-semibold text-slate-600 dark:text-slate-350 leading-snug mt-0.5 break-words">
                ${item.details}
              </div>

              <!-- Fila 4: Mini Barra de Porcentaje por Jugador / Opción -->
              <div class="mt-1.5 pt-1.5 border-t border-slate-200/60 dark:border-slate-700/50">
                <div class="flex items-center justify-between text-[10px] font-bold mb-1">
                  <span class="text-slate-500 dark:text-slate-400 uppercase tracking-tight">Probabilidad</span>
                  <span class="text-slate-900 dark:text-white font-mono font-black text-xs">${item.probPct}%</span>
                </div>
                ${itemRiskBadge ? `<div class="mb-1 flex items-center">${itemRiskBadge}</div>` : ''}
                <div class="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div class="h-full rounded-full ${item.barColor} transition-all duration-500" style="width: ${item.probPct}%"></div>
                </div>
              </div>
            </div>
          `;
        }).join("")}
      </div>
    ` : `<p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium mb-3">${escapeHtml(bet.subText)}</p>`;

    return `
      <div class="relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 shadow-panel dark:shadow-panel-dark transition hover:border-emerald-500/50 flex flex-col min-w-0">
        <!-- Contenido principal arriba -->
        <div class="min-w-0">
          <!-- Cabecera: Categoría e Insignia de Seguridad -->
          <div class="flex items-center justify-between gap-2 mb-2 flex-wrap">
            <span class="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono truncate">${escapeHtml(bet.category)}</span>
            <span class="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-black uppercase tracking-wider whitespace-nowrap ${bet.tierBg}">
              ${bet.tierBadge}
            </span>
          </div>

          <!-- Título de Selección -->
          <h4 class="text-sm sm:text-base font-black text-slate-900 dark:text-white leading-snug tracking-tight mb-2 break-words">
            ${escapeHtml(bet.title)}
          </h4>

          <!-- Etiqueta Métricas -->
          <div class="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-xs font-bold text-slate-800 dark:text-slate-200 mb-3 max-w-full">
            <i data-lucide="${bet.icon}" class="h-3.5 w-3.5 text-emerald-500 shrink-0"></i>
            <span class="truncate">${escapeHtml(bet.metricLabel)}</span>
          </div>

          <!-- Razón Sabermétrica / Lista de Equipos -->
          ${teamListHtml}
        </div>
      </div>
    `;
  };

  container.innerHTML = `
    <section class="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 shadow-panel dark:shadow-panel-dark mb-5">
      <!-- Encabezado de la Sección -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4 gap-2">
        <div>
          <div class="flex items-center gap-2">
            <span class="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white font-bold shadow-sm">
              <i data-lucide="target" class="h-4 w-4"></i>
            </span>
            <h3 class="text-base font-black uppercase tracking-wider text-slate-900 dark:text-white">🎯 Ángulos de Apuesta & Best Bets (Apuestas Más Seguras)</h3>
          </div>
          <p class="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
            Selección jerarquizada: 1 Ganador, 1 Hándicap, 1 Total, 1 Ponches (Strikeouts), y 1 Bateador destacado por mercado (Hits, Bases y Jonrón).
          </p>
        </div>
        <div class="flex items-center gap-2 self-start sm:self-center shrink-0">
          <span class="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 px-2.5 py-1 text-xs font-bold text-emerald-800 dark:text-emerald-300">
            👑 ${candados.length} Candados
          </span>
          <span class="inline-flex items-center gap-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-300 dark:border-indigo-800 px-2.5 py-1 text-xs font-bold text-indigo-800 dark:text-indigo-300">
            🛡️ ${seguras.length} Seguras
          </span>
        </div>
      </div>

      <!-- Grilla de Tarjetas -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        ${bets.map(renderBetCard).join("")}
      </div>
    </section>
  `;

  if (window.lucide) window.lucide.createIcons();
}


const MLB_TEAM_ICONIC_COLORS = {
  "boston red sox": "#bd3039",
  "bos": "#bd3039",
  "san francisco giants": "#fd5a1e",
  "sf": "#fd5a1e",
  "oakland athletics": "#003831",
  "oak": "#003831",
  "detroit tigers": "#fa4616",
  "det": "#fa4616",
  "baltimore orioles": "#df4601",
  "bal": "#df4601",
  "houston astros": "#eb6e1f",
  "hou": "#eb6e1f",
  "colorado rockies": "#33006f",
  "col": "#33006f",
  "milwaukee brewers": "#ffc52f",
  "mil": "#ffc52f",
  "pittsburgh pirates": "#fdb827",
  "pit": "#fdb827",
  "st louis cardinals": "#c41e3a",
  "stl": "#c41e3a",
  "cincinnati reds": "#c6011f",
  "cin": "#c6011f",
  "cleveland guardians": "#e31937",
  "cle": "#e31937",
  "chicago cubs": "#0e3386",
  "chc": "#0e3386",
  "los angeles dodgers": "#005a9c",
  "lad": "#005a9c",
  "new york mets": "#ff5910",
  "nym": "#ff5910",
  "philadelphia phillies": "#e81828",
  "phi": "#e81828",
  "washington nationals": "#ab0003",
  "wsh": "#ab0003",
  "arizona diamondbacks": "#a71930",
  "ari": "#a71930",
  "toronto blue jays": "#134a8e",
  "tor": "#134a8e",
  "tampa bay rays": "#8fbce6",
  "tb": "#8fbce6",
  "seattle mariners": "#005c5c",
  "sea": "#005c5c",
  "miami marlins": "#00a3e0",
  "mia": "#00a3e0"
};

function getTeamColor(colorHex, isHome, alternateColorHex, teamName = "", abbreviation = "") {
  const sanitize = (hex) => {
    if (!hex) return "";
    return hex.startsWith('#') ? hex.slice(1) : hex;
  };
  const nameKey = String(teamName || "").toLowerCase().trim();
  const abbrevKey = String(abbreviation || "").toLowerCase().trim();
  
  const isDarkTheme = document.documentElement.classList.contains("dark");
  if (nameKey === "tampa bay rays" || abbrevKey === "tb") {
    return isDarkTheme ? "#8fbce6" : "#092c5c";
  }

  if (MLB_TEAM_ICONIC_COLORS[nameKey]) return MLB_TEAM_ICONIC_COLORS[nameKey];
  if (MLB_TEAM_ICONIC_COLORS[abbrevKey]) return MLB_TEAM_ICONIC_COLORS[abbrevKey];

  const c = sanitize(colorHex);
  const alt = sanitize(alternateColorHex);
  if (!c || c.toLowerCase() === "ffffff") {
    if (alt && alt.toLowerCase() !== "ffffff") {
      return '#' + alt;
    }
    return isHome ? '#0f172a' : '#0a2351';
  }
  return '#' + c;
}

function renderPredictor(projection) {
  if (!els.predictorCardContent) return;

  const isHomeFavorite = (projection.favorite === projection.homeName);
  const homePct = isHomeFavorite ? (projection.winProbability * 100) : ((1 - projection.winProbability) * 100);
  const awayPct = isHomeFavorite ? ((1 - projection.winProbability) * 100) : (projection.winProbability * 100);

  const awayLogo = projection.game.teams.away.team.id ? mlbTeamLogoUrl(projection.game.teams.away.team.id) : "";
  const homeLogo = projection.game.teams.home.team.id ? mlbTeamLogoUrl(projection.game.teams.home.team.id) : "";

  const awayColor = getTeamColor(
    projection.awayColor,
    false,
    projection.awayAlternateColor,
    projection.game.teams.away.team.name,
    projection.awayAbbreviation
  );
  const homeColor = getTeamColor(
    projection.homeColor,
    true,
    projection.homeAlternateColor,
    projection.game.teams.home.team.name,
    projection.homeAbbreviation
  );

  const R = 75;
  const C = 2 * Math.PI * R; // 471.24
  const offset = 0.0125 * C; // 5.89 (1.25% gap at boundaries)
  const homeLength = Math.max(0, (homePct - 2.5) / 100 * C);
  const awayLength = Math.max(0, (awayPct - 2.5) / 100 * C);

  els.predictorCardContent.innerHTML = `
    <div class="flex flex-col items-center gap-2 pt-3 pb-1 relative z-10">
      <!-- Graphic area -->
      <div class="relative w-36 h-36 flex items-center justify-center">
        <!-- Percentages -->
        <div class="absolute top-[-12px] left-[-12px] text-black dark:text-white font-black text-xl tracking-tight select-none">
          ${round1(awayPct)}<span class="text-xs font-bold ml-0.5 text-slate-700 dark:text-slate-200">%</span>
        </div>
        <div class="absolute bottom-[-12px] right-[-12px] text-black dark:text-white font-black text-xl tracking-tight select-none">
          ${round1(homePct)}<span class="text-xs font-bold ml-0.5 text-slate-700 dark:text-slate-200">%</span>
        </div>

        <!-- SVG Ring -->
        <svg class="w-32 h-32 select-none" viewBox="0 0 200 200">
          <!-- Background track circle -->
          <circle cx="100" cy="100" r="${R}" stroke="currentColor" class="text-slate-200 dark:text-slate-800" stroke-width="14" fill="none" />
          
          <!-- Away segment (left side, scaleX(-1) flips it) -->
          <circle 
            cx="100" 
            cy="100" 
            r="${R}" 
            stroke="${awayColor}" 
            stroke-width="14" 
            fill="none" 
            stroke-dasharray="${awayLength} ${C}" 
            stroke-dashoffset="-${offset}"
            style="transform: scaleX(-1) rotate(-90deg); transform-origin: 100px 100px; transition: stroke-dasharray 0.5s ease;"
          />
          <!-- Home segment (right side, normal clockwise) -->
          <circle 
            cx="100" 
            cy="100" 
            r="${R}" 
            stroke="${homeColor}" 
            stroke-width="14" 
            fill="none" 
            stroke-dasharray="${homeLength} ${C}" 
            stroke-dashoffset="-${offset}"
            style="transform: rotate(-90deg); transform-origin: 100px 100px; transition: stroke-dasharray 0.5s ease;"
          />
        </svg>

        <!-- Inner Logos and Separator -->
        <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div class="flex items-center justify-center gap-2">
            <img src="${awayLogo}" alt="${projection.awayName}" class="w-8 h-8 object-contain img-smooth" onerror="this.style.display='none'" />
            <div class="w-[1px] h-6 bg-slate-300 dark:bg-slate-700"></div>
            <img src="${homeLogo}" alt="${projection.homeName}" class="w-8 h-8 object-contain img-smooth" onerror="this.style.display='none'" />
          </div>
        </div>
      </div>

      <!-- Label below chart -->
      <p class="mt-6 text-[10px] italic text-slate-800 dark:text-slate-200 font-medium tracking-wide">Según Analytics</p>
    </div>
  `;
}

function translateWeatherDescription(description) {
  const desc = String(description || "").toLowerCase();
  if (/tormenta|thunder|storm|rayos/.test(desc)) return "Tormentoso";
  if (/lluvia|rain|showers|drizzle|chubascos/.test(desc)) return "Lluvioso";
  if (/nieve|snow|sleet|granizo/.test(desc)) return "Nevado";
  if (/nublado|cloudy|overcast/.test(desc)) return "Nublado";
  if (/niebla|fog|mist/.test(desc)) return "Con niebla";
  if (/soleado|sunny|clear|despejado/.test(desc)) return "Soleado";
  if (/parcialmente|partly/.test(desc)) return "Parcialmente nublado";
  return description.charAt(0).toUpperCase() + description.slice(1);
}

function weatherIconFromDescription(description) {
  const desc = String(description || "").toLowerCase();
  if (/tormentoso|tormenta|rayos|thunder|storm/.test(desc)) return "⛈️";
  if (/lluvioso|lluvia|rain|drizzle|showers|chubascos/.test(desc)) return "🌧️";
  if (/nevado|nieve|snow|sleet|granizo/.test(desc)) return "❄️";
  if (/nublado|cloudy|overcast/.test(desc)) return "☁️";
  if (/niebla|fog|mist/.test(desc)) return "🌫️";
  if (/soleado|sunny|clear|despejado/.test(desc)) return "☀️";
  return "⛅";
}

function getWeatherCardClasses(description) {
  const desc = String(description || "").toLowerCase();
  if (/tormentoso|tormenta|rayos|thunder|storm/.test(desc)) {
    return "rounded-lg border border-rose-200 dark:border-rose-700 bg-gradient-to-br from-rose-50 to-white dark:from-rose-900 dark:to-slate-800 p-4 shadow-panel dark:shadow-panel-dark";
  }
  if (/lluvioso|lluvia|rain|drizzle|showers|chubascos/.test(desc)) {
    return "rounded-lg border border-sky-200 dark:border-sky-700 bg-gradient-to-br from-sky-50 to-white dark:from-sky-900 dark:to-slate-800 p-4 shadow-panel dark:shadow-panel-dark";
  }
  if (/nevado|nieve|snow|sleet|granizo/.test(desc)) {
    return "rounded-lg border border-indigo-200 dark:border-indigo-700 bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-900 dark:to-slate-800 p-4 shadow-panel dark:shadow-panel-dark";
  }
  if (/nublado|cloudy|overcast/.test(desc)) {
    return "rounded-lg border border-slate-200 dark:border-slate-600 bg-gradient-to-br from-slate-100 to-white dark:from-slate-700 dark:to-slate-800 p-4 shadow-panel dark:shadow-panel-dark";
  }
  if (/niebla|fog|mist/.test(desc)) {
    return "rounded-lg border border-amber-200 dark:border-amber-700 bg-gradient-to-br from-amber-50 to-white dark:from-amber-900 dark:to-slate-800 p-4 shadow-panel dark:shadow-panel-dark";
  }
  if (/soleado|sunny|clear|despejado/.test(desc)) {
    return "rounded-lg border border-yellow-200 dark:border-yellow-750 bg-gradient-to-br from-yellow-50 to-white dark:from-yellow-900 dark:to-slate-800 p-4 shadow-panel dark:shadow-panel-dark";
  }
  return "rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-4 shadow-panel dark:shadow-panel-dark";
}

function renderPitchers(projection) {
  const away = projection.pitchers.away;
  const home = projection.pitchers.home;
  const awayTeam = projection.game.teams.away.team;
  const homeTeam = projection.game.teams.home.team;

  els.pitcherGrid.innerHTML = `
    <section class="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 shadow-panel dark:shadow-panel-dark">
      <div class="px-4 pt-4">
        <h3 class="text-base font-black text-slate-900 dark:text-white">Lanzadores Probables</h3>
        <div class="mt-3 border-t border-dotted border-slate-200 dark:border-slate-800"></div>
      </div>

      <div class="grid grid-cols-[1fr_auto_1fr] items-start gap-2 px-4 py-4">
        ${teamPitcherSide("left", away, awayTeam)}
        <div class="min-w-[86px] text-center">
          <p class="text-xs font-black text-slate-800 dark:text-slate-200">Lanzadores</p>
          <div class="mt-4 flex items-center justify-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
            <span>${pitcherHeadshot(away, "left")}</span>
            <span>vs</span>
            <span>${pitcherHeadshot(home, "right")}</span>
          </div>
        </div>
        ${teamPitcherSide("right", home, homeTeam)}
      </div>

      <div class="overflow-x-auto border-t border-slate-100 dark:border-slate-800">
        <table class="w-full min-w-[680px] text-left text-xs">
          <thead class="bg-slate-50 dark:bg-slate-900/80 text-[11px] font-black uppercase tracking-wide text-slate-850 dark:text-slate-200 border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th class="px-3 py-2">Jugador</th>
              <th class="px-3 py-2 text-center">W-L</th>
              <th class="px-3 py-2 text-center">ERA</th>
              <th class="px-3 py-2 text-center">WHIP</th>
              <th class="px-3 py-2 text-center">IP</th>
              <th class="px-3 py-2 text-center">H</th>
              <th class="px-3 py-2 text-center">K</th>
              <th class="px-3 py-2 text-center">BB</th>
              <th class="px-3 py-2 text-center">HR</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
            ${pitcherTableRow(away)}
            ${pitcherTableRow(home)}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function renderTeamStats(projection) {
  if (!els.teamStatsGrid) return;

  const awayTeam = projection.game.teams.away.team;
  const homeTeam = projection.game.teams.home.team;
  const awayName = projection.awayName;
  const homeName = projection.homeName;
  const awayLogo = mlbTeamLogoUrl(awayTeam.id);
  const homeLogo = mlbTeamLogoUrl(homeTeam.id);

  const awayOverall = projection.awayOverallMetrics;
  const homeOverall = projection.homeOverallMetrics;

  const awaySplit = projection.awaySplitMetrics;
  const homeSplit = projection.homeSplitMetrics;

  const awayLast10 = projection.awayLast10Metrics;
  const homeLast10 = projection.homeLast10Metrics;

  const awayForm = projection.model?.awayForm;
  const homeForm = projection.model?.homeForm;

  els.teamStatsGrid.innerHTML = `
    <section class="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 shadow-panel dark:shadow-panel-dark">
      <div class="px-4 pt-4 pb-3 flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 gap-1">
        <div class="flex items-center gap-2">
          <i data-lucide="bar-chart-2" class="h-4 w-4 text-emerald-600 dark:text-emerald-400"></i>
          <h3 class="text-base font-black text-slate-900 dark:text-white">Estadísticas por Equipo</h3>
        </div>
        <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">Comparativa compacta: General · Splits · Últimos 10 Juegos</span>
      </div>

      <div class="p-4 flex flex-col gap-5">
        <!-- 1. GENERAL (TEMPORADA) -->
        <div>
          <div class="flex items-center justify-between mb-2 px-1">
            <span class="text-xs font-extrabold uppercase tracking-wide text-slate-700 dark:text-slate-300">1. Temporada General (162 G Target)</span>
          </div>
          ${renderCompactTeamTable(awayName, homeName, awayLogo, homeLogo, awayOverall, homeOverall, "general")}
        </div>

        <!-- 2. SPLIT POR SEDE -->
        <div>
          <div class="flex items-center justify-between mb-2 px-1">
            <span class="text-xs font-extrabold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">2. Split por Sede (Visitante vs Local)</span>
          </div>
          ${renderCompactTeamTable(awayName, homeName, awayLogo, homeLogo, awaySplit, homeSplit, "split")}
        </div>

        <!-- 3. ÚLTIMOS 10 JUEGOS -->
        <div>
          <div class="flex items-center justify-between mb-2 px-1">
            <span class="text-xs font-extrabold uppercase tracking-wide text-amber-800 dark:text-amber-300">3. Últimos 10 Juegos (Forma Reciente)</span>
          </div>
          ${renderCompactTeamTable(awayName, homeName, awayLogo, homeLogo, awayLast10, homeLast10, "last10", awayForm, homeForm)}
        </div>
      </div>
    </section>
  `;

  if (window.lucide) window.lucide.createIcons();
}

function renderCompactTeamTable(awayName, homeName, awayLogo, homeLogo, awayStats, homeStats, type = "general", awayForm = null, homeForm = null) {
  const getNum = (val) => (Number.isFinite(val) && val !== null && val !== undefined ? val : null);

  const runsA = getNum(awayStats?.runsPerGame ?? awayStats?.runsForPerGame);
  const runsH = getNum(homeStats?.runsPerGame ?? homeStats?.runsForPerGame);

  const raA = getNum(awayStats?.runsAllowedPerGame);
  const raH = getNum(homeStats?.runsAllowedPerGame);

  const diffA = getNum(awayStats?.diff ?? (runsA !== null && raA !== null ? runsA - raA : null));
  const diffH = getNum(homeStats?.diff ?? (runsH !== null && raH !== null ? runsH - raH : null));

  const hrA = awayStats && Number.isFinite(awayStats.homeRunsTotal) ? awayStats.homeRunsTotal : (awayStats && Number.isFinite(awayStats.homeRunsPerGame) ? Math.round(awayStats.homeRunsPerGame * (awayStats.games || 10)) : null);
  const hrH = homeStats && Number.isFinite(homeStats.homeRunsTotal) ? homeStats.homeRunsTotal : (homeStats && Number.isFinite(homeStats.homeRunsPerGame) ? Math.round(homeStats.homeRunsPerGame * (homeStats.games || 10)) : null);

  const hrPctA = getNum(awayStats?.hrPct);
  const hrPctH = getNum(homeStats?.hrPct);

  const slgA = getNum(awayStats?.slg);
  const slgH = getNum(homeStats?.slg);

  const lobA = getNum(awayStats?.lobPct);
  const lobH = getNum(homeStats?.lobPct);

  const bbA = getNum(awayStats?.bbPct);
  const bbH = getNum(homeStats?.bbPct);

  const highlight = (valA, valH, isHigherBetter) => {
    if (!Number.isFinite(valA) || !Number.isFinite(valH) || valA === valH) {
      return { classA: "text-slate-800 dark:text-slate-100", classH: "text-slate-800 dark:text-slate-100" };
    }
    const isAwayBetter = isHigherBetter ? valA > valH : valA < valH;
    return {
      classA: isAwayBetter ? "font-black text-emerald-600 dark:text-emerald-400" : "text-slate-700 dark:text-slate-300",
      classH: !isAwayBetter ? "font-black text-emerald-600 dark:text-emerald-400" : "text-slate-700 dark:text-slate-300",
    };
  };

  const hRuns = highlight(runsA, runsH, true);
  const hRa = highlight(raA, raH, false);
  const hDiff = highlight(diffA, diffH, true);
  const hHr = highlight(hrA, hrH, true);
  const hHrPct = highlight(hrPctA, hrPctH, true);
  const hSlg = highlight(slgA, slgH, true);
  const hLob = highlight(lobA, lobH, true);
  const hBb = highlight(bbA, bbH, true);

  // Sequences and W-L for Last 10
  const winsA = awayForm?.wins10 ?? awayStats?.wins ?? 0;
  const lossesA = awayForm?.losses10 ?? awayStats?.losses ?? 0;
  const winsH = homeForm?.wins10 ?? homeStats?.wins ?? 0;
  const lossesH = homeForm?.losses10 ?? homeStats?.losses ?? 0;

  const seqA = awayForm?.sequence || [];
  const seqH = homeForm?.sequence || [];

  const renderBadges = (seq) => {
    if (!seq || !seq.length) return "-";
    return seq.map(res => `<span class="inline-flex h-4 w-4 items-center justify-center rounded ${res === 'W' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'} text-[9px] font-black leading-none shrink-0" title="${res === 'W' ? 'Victoria' : 'Derrota'}">${res}</span>`).join("");
  };

  const isLast10 = type === "last10";
  const isSplit = type === "split";

  return `
    <div class="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
      <table class="w-full min-w-[700px] text-left text-xs">
        <thead class="bg-slate-50 dark:bg-slate-900/80 text-[11px] font-black uppercase tracking-wide text-slate-850 dark:text-slate-200 border-b border-slate-200 dark:border-slate-800 whitespace-nowrap">
          <tr>
            <th class="px-3 py-2 text-left whitespace-nowrap">Equipo</th>
            ${isLast10 ? `<th class="px-3 py-2 text-center whitespace-nowrap min-w-[55px]">W-L</th><th class="px-3 py-2 text-center whitespace-nowrap">Racha (L10)</th>` : ""}
            ${isSplit ? `<th class="px-3 py-2 text-center whitespace-nowrap">Condición</th>` : ""}
            <th class="px-3 py-2 text-center whitespace-nowrap">Runs/G</th>
            <th class="px-3 py-2 text-center whitespace-nowrap">RA/G</th>
            <th class="px-3 py-2 text-center whitespace-nowrap">Diff</th>
            <th class="px-3 py-2 text-center whitespace-nowrap">HR</th>
            <th class="px-3 py-2 text-center whitespace-nowrap">HR %</th>
            <th class="px-3 py-2 text-center whitespace-nowrap">SLG</th>
            <th class="px-3 py-2 text-center whitespace-nowrap">LOB %</th>
            <th class="px-3 py-2 text-center whitespace-nowrap">BB %</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
          <!-- Away Team Row -->
          <tr class="odd:bg-white dark:odd:bg-slate-900/20 hover:bg-blue-50 dark:hover:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
            <td class="px-3 py-2 font-semibold text-slate-900 dark:text-white whitespace-nowrap">
              <div class="flex items-center gap-2">
                <img src="${awayLogo}" class="w-4 h-4 object-contain img-smooth" alt="" />
                <span>${escapeHtml(awayName)}</span>
              </div>
            </td>
            ${isLast10 ? `<td class="px-3 py-2 text-center font-bold whitespace-nowrap ${winsA > winsH ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-100'}">${winsA}-${lossesA}</td><td class="px-3 py-2 text-center whitespace-nowrap"><div class="flex items-center justify-center gap-0.5">${renderBadges(seqA)}</div></td>` : ""}
            ${isSplit ? `<td class="px-3 py-2 text-center text-slate-500 dark:text-slate-400 font-semibold whitespace-nowrap">Visitante</td>` : ""}
            <td class="px-3 py-2 text-center whitespace-nowrap ${hRuns.classA}">${runsA !== null ? runsA.toFixed(2) : "N/D"}</td>
            <td class="px-3 py-2 text-center whitespace-nowrap ${hRa.classA}">${raA !== null ? raA.toFixed(2) : "N/D"}</td>
            <td class="px-3 py-2 text-center whitespace-nowrap ${hDiff.classA}">${diffA !== null ? formatSigned(diffA) : "N/D"}</td>
            <td class="px-3 py-2 text-center whitespace-nowrap ${hHr.classA}">${hrA !== null ? hrA : "N/D"}</td>
            <td class="px-3 py-2 text-center whitespace-nowrap ${hHrPct.classA}">${hrPctA !== null ? `${hrPctA.toFixed(1)}%` : "N/D"}</td>
            <td class="px-3 py-2 text-center whitespace-nowrap ${hSlg.classA}">${slgA !== null ? slgA.toFixed(2) : "N/D"}</td>
            <td class="px-3 py-2 text-center whitespace-nowrap ${hLob.classA}">${lobA !== null ? `${lobA.toFixed(1)}%` : "N/D"}</td>
            <td class="px-3 py-2 text-center whitespace-nowrap ${hBb.classA}">${bbA !== null ? `${bbA.toFixed(1)}%` : "N/D"}</td>
          </tr>

          <!-- Home Team Row -->
          <tr class="even:bg-slate-50 dark:even:bg-slate-900/40 hover:bg-blue-50 dark:hover:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
            <td class="px-3 py-2 font-semibold text-slate-900 dark:text-white whitespace-nowrap">
              <div class="flex items-center gap-2">
                <img src="${homeLogo}" class="w-4 h-4 object-contain img-smooth" alt="" />
                <span>${escapeHtml(homeName)}</span>
              </div>
            </td>
            ${isLast10 ? `<td class="px-3 py-2 text-center font-bold whitespace-nowrap ${winsH > winsA ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-100'}">${winsH}-${lossesH}</td><td class="px-3 py-2 text-center whitespace-nowrap"><div class="flex items-center justify-center gap-0.5">${renderBadges(seqH)}</div></td>` : ""}
            ${isSplit ? `<td class="px-3 py-2 text-center text-slate-500 dark:text-slate-400 font-semibold whitespace-nowrap">Local</td>` : ""}
            <td class="px-3 py-2 text-center whitespace-nowrap ${hRuns.classH}">${runsH !== null ? runsH.toFixed(2) : "N/D"}</td>
            <td class="px-3 py-2 text-center whitespace-nowrap ${hRa.classH}">${raH !== null ? raH.toFixed(2) : "N/D"}</td>
            <td class="px-3 py-2 text-center whitespace-nowrap ${hDiff.classH}">${diffH !== null ? formatSigned(diffH) : "N/D"}</td>
            <td class="px-3 py-2 text-center whitespace-nowrap ${hHr.classH}">${hrH !== null ? hrH : "N/D"}</td>
            <td class="px-3 py-2 text-center whitespace-nowrap ${hHrPct.classH}">${hrPctH !== null ? `${hrPctH.toFixed(1)}%` : "N/D"}</td>
            <td class="px-3 py-2 text-center whitespace-nowrap ${hSlg.classH}">${slgH !== null ? slgH.toFixed(2) : "N/D"}</td>
            <td class="px-3 py-2 text-center whitespace-nowrap ${hLob.classH}">${lobH !== null ? `${lobH.toFixed(1)}%` : "N/D"}</td>
            <td class="px-3 py-2 text-center whitespace-nowrap ${hBb.classH}">${bbH !== null ? `${bbH.toFixed(1)}%` : "N/D"}</td>
          </tr>
        </tbody>
      </table>
    </div>
  `;
}

function formatSigned(val) {
  if (!Number.isFinite(val)) return "0.00";
  return (val > 0 ? "+" : "") + val.toFixed(2);
}

function renderBullpens(projection) {
  const target = document.getElementById("bullpenSection");
  if (!target) return;

  const awayTeam = projection.game.teams.away.team;
  const homeTeam = projection.game.teams.home.team;
  const awayRelievers = projection.awayBullpenRoster || [];
  const homeRelievers = projection.homeBullpenRoster || [];

  const awayLogo = mlbTeamLogoUrl(awayTeam.id);
  const homeLogo = mlbTeamLogoUrl(homeTeam.id);
  const awayName = projection.awayName;
  const homeName = projection.homeName;

  function bullpenTable(relievers, teamName, teamLogo, side) {
    const borderColor = side === "away"
      ? "border-sky-200 dark:border-sky-800/50"
      : "border-violet-200 dark:border-violet-800/50";
    const headerBg = side === "away"
      ? "bg-sky-50 dark:bg-sky-950/20"
      : "bg-violet-50 dark:bg-violet-950/20";
    const headerText = side === "away"
      ? "text-sky-800 dark:text-sky-300"
      : "text-violet-800 dark:text-violet-300";
    const roleTag = (r) => {
      if (r.saves >= 3) return `<span class="inline-flex items-center rounded-full bg-amber-100 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-700 px-1.5 py-0.5 text-[9px] font-black text-amber-800 dark:text-amber-300 uppercase tracking-wide ml-1">CL</span>`;
      if (r.holds >= 3) return `<span class="inline-flex items-center rounded-full bg-emerald-100 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-700 px-1.5 py-0.5 text-[9px] font-black text-emerald-800 dark:text-emerald-300 uppercase tracking-wide ml-1">SU</span>`;
      return "";
    };
    const handBadge = (h) => h === "L"
      ? `<span class="inline-flex items-center rounded px-1 py-0.5 text-[9px] font-black bg-indigo-100 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700">L</span>`
      : `<span class="inline-flex items-center rounded px-1 py-0.5 text-[9px] font-black bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">R</span>`;
    const eraColor = (era) => {
      if (!Number.isFinite(era)) return "text-slate-700 dark:text-slate-300";
      if (era <= 2.50) return "text-emerald-700 dark:text-emerald-400 font-black";
      if (era <= 3.50) return "text-sky-700 dark:text-sky-400 font-bold";
      if (era >= 5.00) return "text-rose-700 dark:text-rose-400 font-bold";
      return "text-slate-800 dark:text-slate-200";
    };

    const rows = relievers.length
      ? relievers.map((r) => `
        <tr class="odd:bg-white dark:odd:bg-slate-900/20 even:bg-slate-50/60 dark:even:bg-slate-900/40 hover:bg-blue-50 dark:hover:bg-slate-800/50">
          <td class="px-3 py-1.5 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">
            ${r.jersey ? `<span class="text-slate-500 dark:text-slate-400 mr-1">#${escapeHtml(r.jersey)}</span>` : ""}
            ${escapeHtml(r.name)}
            ${roleTag(r)}
          </td>
          <td class="px-2 py-1.5 text-center">${handBadge(r.hand)}</td>
          <td class="px-3 py-1.5 text-center font-mono ${eraColor(r.era)}">${Number.isFinite(r.era) ? r.era.toFixed(2) : "N/D"}</td>
          <td class="px-3 py-1.5 text-center font-mono text-slate-800 dark:text-slate-200">${Number.isFinite(r.whip) ? r.whip.toFixed(2) : "N/D"}</td>
          <td class="px-3 py-1.5 text-center font-mono text-slate-800 dark:text-slate-200">${escapeHtml(r.inningsDisplay)}</td>
          <td class="px-3 py-1.5 text-center font-mono text-slate-700 dark:text-slate-300">${Number.isFinite(r.k9) ? r.k9.toFixed(1) : "N/D"}</td>
          <td class="px-3 py-1.5 text-center font-mono text-amber-700 dark:text-amber-400 font-bold">${r.saves}</td>
          <td class="px-3 py-1.5 text-center font-mono text-slate-700 dark:text-slate-300">${r.holds}</td>
          <td class="px-3 py-1.5 text-center font-mono text-slate-600 dark:text-slate-400">${r.games}</td>
        </tr>
      `).join("")
      : `<tr><td colspan="9" class="px-3 py-4 text-center text-xs font-semibold text-slate-500 dark:text-slate-400">Sin datos de bullpen disponibles</td></tr>`;

    return `
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 px-3 py-2 ${headerBg} border-b ${borderColor}">
          <img src="${escapeHtml(teamLogo)}" alt="${escapeHtml(teamName)}" class="h-5 w-5 object-contain img-smooth" onerror="this.style.display='none'" />
          <span class="text-xs font-black uppercase tracking-wider ${headerText}">${escapeHtml(teamName)}</span>
          <span class="ml-auto text-[10px] font-bold text-slate-500 dark:text-slate-400">${relievers.length} relevistas</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full min-w-[420px] text-left text-xs">
            <thead class="bg-slate-50 dark:bg-slate-900/80 text-[10px] font-black uppercase tracking-wide text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th class="px-3 py-1.5">Jugador</th>
                <th class="px-2 py-1.5 text-center">M</th>
                <th class="px-3 py-1.5 text-center">ERA</th>
                <th class="px-3 py-1.5 text-center">WHIP</th>
                <th class="px-3 py-1.5 text-center">IP</th>
                <th class="px-3 py-1.5 text-center">K/9</th>
                <th class="px-3 py-1.5 text-center">SV</th>
                <th class="px-3 py-1.5 text-center">HLD</th>
                <th class="px-3 py-1.5 text-center">G</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
              ${rows}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  target.innerHTML = `
      <section class="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 shadow-panel dark:shadow-panel-dark">
        <div class="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
          <div class="flex items-center gap-2">
            <h3 class="text-sm font-black uppercase tracking-wide text-slate-900 dark:text-white">Bullpens</h3>
            <span class="rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-300">Temporada ${new Date().getFullYear()}</span>
          </div>
          <div class="flex items-center gap-1 text-[10px] font-bold text-slate-500 dark:text-slate-400">
            <span class="inline-flex items-center gap-0.5 rounded-full bg-amber-100 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-700 px-1.5 py-0.5 text-[9px] font-black text-amber-800 dark:text-amber-300">CL</span> Closer
            <span class="mx-1.5 text-slate-300 dark:text-slate-700">·</span>
            <span class="inline-flex items-center gap-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-700 px-1.5 py-0.5 text-[9px] font-black text-emerald-800 dark:text-emerald-300">SU</span> Setup
          </div>
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-100 dark:divide-slate-800">
          ${bullpenTable(awayRelievers, awayName, awayLogo, "away")}
          ${bullpenTable(homeRelievers, homeName, homeLogo, "home")}
        </div>
      </section>
    `;
}


function renderLineups(projection) {
  const container = document.getElementById("lineupSection");
  if (!container) return;

  const awayLineup = projection.awayLineup;
  const homeLineup = projection.homeLineup;

  if (!awayLineup || !homeLineup || awayLineup.length === 0 || homeLineup.length === 0) {
    container.innerHTML = `
      <section class="overflow-hidden rounded-lg border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-5 text-center text-sm font-semibold text-slate-800 dark:text-slate-200 shadow-panel dark:shadow-panel-dark mb-5">
        <div class="flex flex-col items-center justify-center py-4">
          <i data-lucide="users" class="h-8 w-8 text-slate-400 mb-2"></i>
          <p>Alineaciones confirmadas no disponibles todavía para este partido (MLB/ESPN).</p>
          <span class="text-xs text-slate-500 mt-1">Se utilizarán las estadísticas promedio de los equipos para los cálculos.</span>
        </div>
      </section>
    `;
    if (window.lucide) window.lucide.createIcons();
    return;
  }

  const awayTeam = projection.game.teams.away.team;
  const homeTeam = projection.game.teams.home.team;
  
  const awayLogo = mlbTeamLogoUrl(awayTeam.id);
  const homeLogo = mlbTeamLogoUrl(homeTeam.id);

  const awayOpponentHand = projection.model.homePitcherMetrics.hand === "L" ? "ZURDO" : "DERECHO";
  const homeOpponentHand = projection.model.awayPitcherMetrics.hand === "L" ? "ZURDO" : "DERECHO";

  const awayColor = getTeamColor(projection.awayColor, false, projection.awayAlternateColor, awayTeam.name, projection.awayAbbreviation);
  const homeColor = getTeamColor(projection.homeColor, true, projection.homeAlternateColor, homeTeam.name, projection.homeAbbreviation);

  const buildTeamLineupTable = (teamName, teamLogo, opponentHandText, lineupResolved, teamColor) => {
    const rowsHtml = lineupResolved.map((hitter, index) => {
      const bo = index + 1;
      
      const avgStr = hitter.avg != null && hitter.avg > 0 ? hitter.avg.toFixed(3) : "-";
      const obpStr = hitter.obp != null && hitter.obp > 0 ? hitter.obp.toFixed(3) : "-";
      const splitStr = hitter.splitLabel || "-";
      
      let streakStr = "-";
      let streakClass = "";
      if (hitter.recentAvg != null) {
        streakStr = hitter.recentAvg.toFixed(3);
        const diff = hitter.recentAvg - hitter.avg;
        if (diff >= 0.040 && hitter.recentAvg >= 0.250) {
          streakStr += " 🔥";
          streakClass = "text-emerald-500 font-bold";
        } else if (diff <= -0.040) {
          streakStr += " ❄️";
          streakClass = "text-rose-500 font-bold";
        }
      }

      const hitsStr = hitter.projectedHits != null ? `${hitter.projectedHits.toFixed(1)} H` : "-";
      const pHitsStr = hitter.pHits1 != null ? `${Math.round(hitter.pHits1 * 100)}%` : "-";
      const hitsWeight = hitter.pHits1 >= 0.70 ? "text-emerald-500 font-black" : (hitter.pHits1 >= 0.62 ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-slate-800 dark:text-slate-200 font-semibold");

      const tbStr = hitter.projectedTB != null ? `${hitter.projectedTB.toFixed(1)} TB` : "-";
      const pTbStr = hitter.pTB1_5 != null ? `${Math.round(hitter.pTB1_5 * 100)}%` : "-";
      const tbWeight = hitter.pTB1_5 >= 0.55 ? "text-indigo-500 font-black" : (hitter.pTB1_5 >= 0.45 ? "text-indigo-600 dark:text-indigo-400 font-bold" : "text-slate-800 dark:text-slate-200 font-semibold");

      const hrStr = hitter.hrProb != null && hitter.hrProb >= 0.005 ? `${(hitter.hrProb * 100).toFixed(1)}%` : "-";
      const hrWeight = hitter.hrProb >= 0.15 ? "text-amber-500 font-black" : "font-bold text-slate-700 dark:text-slate-200";

      return `
        <tr class="odd:bg-white dark:odd:bg-slate-900/10 even:bg-slate-50/50 dark:even:bg-slate-900/30 hover:bg-blue-50/50 dark:hover:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800/80 transition-colors">
          <td class="px-2.5 py-2 text-center text-slate-500 dark:text-slate-400 font-bold font-mono text-xs">${bo}</td>
          <td class="px-3 py-2 text-left font-semibold text-slate-900 dark:text-white whitespace-nowrap">
            <span class="hover:underline cursor-default">${escapeHtml(hitter.name)}</span>
            ${hitter.position ? `<span class="text-[10px] font-bold text-slate-400 dark:text-slate-500 ml-1.5 uppercase font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">${escapeHtml(hitter.position)}</span>` : ""}
          </td>
          <td class="px-2.5 py-2 text-center font-mono font-medium text-slate-800 dark:text-slate-200">${avgStr}</td>
          <td class="px-2.5 py-2 text-center font-mono font-medium text-slate-800 dark:text-slate-200">${obpStr}</td>
          <td class="px-2.5 py-2 text-center font-mono font-medium text-slate-800 dark:text-slate-200">${splitStr}</td>
          <td class="px-2.5 py-2 text-center font-mono font-medium ${streakClass}">${streakStr}</td>
          <td class="px-3 py-2 text-center font-mono text-xs ${hitsWeight}">${hitsStr} <span class="text-[10px] opacity-80">(${pHitsStr})</span></td>
          <td class="px-3 py-2 text-center font-mono text-xs ${tbWeight}">${tbStr} <span class="text-[10px] opacity-80">(${pTbStr})</span></td>
          <td class="px-2.5 py-2 text-center font-mono text-xs ${hrWeight}">${hrStr}</td>
        </tr>
      `;
    }).join("");

    return `
      <div class="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 shadow-panel dark:shadow-panel-dark mb-5">
        <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-4 py-3 bg-slate-50/50 dark:bg-slate-900/40">
          <div class="flex items-center gap-2.5">
            <img src="${teamLogo}" alt="${teamName}" class="h-5 w-5 object-contain img-smooth" onerror="this.style.display='none'" />
            <h3 class="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5" style="border-left: 3px solid ${teamColor}; padding-left: 8px;">
              ${escapeHtml(teamName)} <span class="text-slate-500 dark:text-slate-450 font-medium">— ORDEN DE BATEO</span>
            </h3>
          </div>
          <span class="text-[10px] sm:text-xs font-black uppercase text-slate-700 dark:text-slate-300 font-sans">
            Split vs <span class="font-black text-emerald-600 dark:text-emerald-450">${opponentHandText}</span>
          </span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full min-w-[760px] text-left text-xs">
            <thead class="bg-slate-50/80 dark:bg-slate-950/20 text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-850">
              <tr>
                <th class="px-2.5 py-2 text-center w-7">#</th>
                <th class="px-3 py-2 text-left">Bateador</th>
                <th class="px-2.5 py-2 text-center w-14">AVG</th>
                <th class="px-2.5 py-2 text-center w-14">OBP</th>
                <th class="px-2.5 py-2 text-center w-20">Split</th>
                <th class="px-2.5 py-2 text-center w-20">Racha 14J</th>
                <th class="px-3 py-2 text-center w-24">Hits Est. (P1+H)</th>
                <th class="px-3 py-2 text-center w-28">Bases Tot. Est. (P1.5+TB)</th>
                <th class="px-2.5 py-2 text-center w-16">HR%</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
              ${rowsHtml}
            </tbody>
          </table>
        </div>
      </div>
    `;
  };

  container.innerHTML = `
    <div class="mb-4">
      <h2 class="text-base font-black uppercase tracking-wide text-slate-900 dark:text-white">Análisis de Bateadores vs Pitcher Abridor</h2>
      <p class="text-xs text-slate-600 dark:text-slate-400 font-semibold leading-relaxed mt-0.5">
        OBP de temporada, splits vs zurdo/derecho, racha reciente (14J) y probabilidad de jonrón estimada vs pitcher abridor.
        <span class="text-emerald-600 dark:text-emerald-450 font-bold">(Lineups confirmados vía ${projection.lineupSource})</span>
      </p>
      <div class="mt-2.5 border-t border-dotted border-slate-200 dark:border-slate-800"></div>
    </div>
    <div class="flex flex-col">
      ${buildTeamLineupTable(awayTeam.name, awayLogo, awayOpponentHand, awayLineup, awayColor)}
      ${buildTeamLineupTable(homeTeam.name, homeLogo, homeOpponentHand, homeLineup, homeColor)}
    </div>
  `;
}

function teamPitcherSide(align, pitcher, team) {
  const isRight = align === "right";
  const flexDirection = isRight ? "flex-row-reverse text-right" : "";
  const teamName = typeof team === "string" ? team : team?.name || "";
  const pitcherName = pitcher?.name || "Abridor N/D";
  const throws = pitcher?.throws ? `${pitcher.throws}, ` : "";
  const jersey = pitcher?.jersey ? `#${pitcher.jersey}` : "N/D";

  return `
    <div class="min-w-0">
      <div class="flex items-center gap-2 ${flexDirection}">
        ${teamLogo(team, pitcher)}
        <span class="text-xs font-semibold uppercase text-slate-700 dark:text-slate-300">${escapeHtml(pitcher?.teamAbbreviation || teamAbbrev(teamName))}</span>
      </div>
      <div class="mt-6 ${isRight ? "text-right" : ""}">
        <p class="truncate text-sm font-medium text-slate-900 dark:text-white">${escapeHtml(pitcherName)}</p>
        <p class="mt-0.5 text-xs font-semibold text-slate-750 dark:text-slate-200">${escapeHtml(throws)}${escapeHtml(jersey)}</p>
      </div>
    </div>
  `;
}

function pitcherHeadshot(pitcher, align) {
  const headshot = pitcherHeadshotUrl(pitcher);
  if (headshot) {
    return `<img src="${escapeHtml(headshot)}" alt="${escapeHtml(pitcher.name)}" class="h-14 w-14 rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 object-cover img-smooth ${align === "left" ? "-mr-1" : "-ml-1"}" loading="lazy" />`;
  }

  return `
    <span class="flex h-14 w-14 items-center justify-center rounded-full border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-xs font-black text-slate-700 dark:text-slate-200 ${align === "left" ? "-mr-1" : "-ml-1"}">
      ${escapeHtml(initials(pitcher?.name || ""))}
    </span>
  `;
}

function pitcherTableRow(pitcher) {
  if (!pitcher) {
    return `
      <tr class="bg-slate-50 dark:bg-slate-900/40">
        <td class="px-3 py-2 font-semibold text-slate-700 dark:text-slate-200">Abridor N/D</td>
        <td class="px-3 py-2 text-center text-slate-850 dark:text-slate-205" colspan="8">ESPN no publico datos del lanzador probable.</td>
      </tr>
    `;
  }

  return `
    <tr class="odd:bg-white dark:odd:bg-slate-900/20 even:bg-slate-50 dark:even:bg-slate-900/40 hover:bg-blue-50 dark:hover:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
      <td class="px-3 py-2 font-semibold text-sky-850 dark:text-sky-300">${escapeHtml(pitcher.name)}</td>
      <td class="px-3 py-2 text-center text-slate-850 dark:text-slate-100">${escapeHtml(formatWinLoss(pitcher))}</td>
      <td class="px-3 py-2 text-center text-slate-850 dark:text-slate-100">${escapeHtml(formatStat(pitcher.era, 2))}</td>
      <td class="px-3 py-2 text-center text-slate-850 dark:text-slate-100">${escapeHtml(formatStat(pitcher.whip, 2))}</td>
      <td class="px-3 py-2 text-center text-slate-850 dark:text-slate-100">${escapeHtml(pitcher.inningsDisplay || formatStat(pitcher.innings, 1))}</td>
      <td class="px-3 py-2 text-center text-slate-850 dark:text-slate-100">${escapeHtml(formatNullable(pitcher.hits))}</td>
      <td class="px-3 py-2 text-center text-slate-850 dark:text-slate-100">${escapeHtml(formatNullable(pitcher.strikeouts))}</td>
      <td class="px-3 py-2 text-center text-slate-850 dark:text-slate-100">${escapeHtml(formatNullable(pitcher.walks))}</td>
      <td class="px-3 py-2 text-center text-slate-850 dark:text-slate-100">${escapeHtml(formatNullable(pitcher.homeRuns))}</td>
    </tr>
  `;
}

function teamLogo(team, pitcher) {
  const teamName = typeof team === "string" ? team : team?.name || pitcher?.team || "";
  const logo = typeof team === "object" && team?.id ? mlbTeamLogoUrl(team.id) : pitcher?.teamLogo;
  if (logo) {
    return `<img src="${escapeHtml(logo)}" alt="${escapeHtml(teamName)}" class="h-6 w-6 object-contain img-smooth" loading="lazy" />`;
  }

  return `<span class="flex h-6 w-6 items-center justify-center text-xs font-black text-slate-700 dark:text-slate-300">${escapeHtml(teamAbbrev(teamName).slice(0, 1))}</span>`;
}

function renderResults(projection) {
  els.resultsBody.innerHTML = projection.rows
    .map(
      (row) => {
        return `
          <tr class="bg-white dark:bg-slate-900/20 hover:bg-blue-50 dark:hover:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
            <td class="px-4 py-4 font-bold text-slate-900 dark:text-slate-100">${row.market}</td>
            <td class="px-4 py-4 font-semibold text-emerald-850 dark:text-emerald-300">${row.pick}</td>
            <td class="px-4 py-4 font-semibold text-slate-900 dark:text-slate-100">${row.estimate}</td>
            <td class="px-4 py-4">${confidenceBadge(row.confidence)}</td>
            <td class="px-4 py-4 text-slate-750 dark:text-slate-250">${row.base}</td>
          </tr>
        `;
      }
    )
    .join("");
}

function clearResults(clearHeader = true) {
  state.activeProjection = null;
  els.summaryGrid.innerHTML = "";
  els.pitcherGrid.innerHTML = `<div class="rounded-lg border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-5 text-center text-sm font-semibold text-slate-700 dark:text-slate-200 shadow-panel dark:shadow-panel-dark">Compara un partido para ver los abridores y sus estadisticas.</div>`;
  els.resultsBody.innerHTML = `<tr><td colspan="5" class="px-4 py-8 text-center font-semibold text-slate-700 dark:text-slate-200">Aún no hay comparación.</td></tr>`;
  if (els.bestBetsSection) els.bestBetsSection.innerHTML = "";
  const existingBullpen = document.getElementById("bullpenSection");
  if (existingBullpen) existingBullpen.innerHTML = "";
  
  const lineupSection = document.getElementById("lineupSection");
  if (lineupSection) {
    lineupSection.innerHTML = "";
  }
  const aiSummarySection = document.getElementById("aiSummarySection");
  if (aiSummarySection) {
    aiSummarySection.innerHTML = "";
  }

  if (els.predictorCardContent) {
    els.predictorCardContent.innerHTML = `
      <div class="flex-1 flex flex-col items-center justify-center py-6 text-center text-sm font-semibold text-slate-700 dark:text-slate-200">
        Compara un partido para ver la probabilidad de victoria.
      </div>
    `;
  }
  if (clearHeader) renderMatchupHeader(getSelectedGame());
}

function getSelectedGame() {
  return state.games.find((game) => game.gamePk === state.selectedGamePk) || null;
}

function isEspnTeamMatch(mlbTeam, espnTeam) {
  if (!mlbTeam || !espnTeam) return false;
  const mlbNorm = normalizeName(mlbTeam.name || "");
  const mlbTeamNameNorm = normalizeName(mlbTeam.teamName || "");
  const espnDispNorm = normalizeName(espnTeam.displayName || "");
  const espnNameNorm = normalizeName(espnTeam.name || "");

  if (mlbNorm && espnDispNorm && (mlbNorm === espnDispNorm || mlbNorm.includes(espnDispNorm) || espnDispNorm.includes(mlbNorm))) {
    return true;
  }
  if (mlbTeamNameNorm && espnNameNorm && mlbTeamNameNorm === espnNameNorm) {
    return true;
  }
  if (mlbTeam.abbreviation && espnTeam.abbreviation && mlbTeam.abbreviation === espnTeam.abbreviation) {
    return true;
  }
  return false;
}

function findEspnEvent(game, espnEventsList = state.espnEvents) {
  if (!game || !game.teams || !espnEventsList || !espnEventsList.length) return null;
  const awayMlb = game.teams.away?.team;
  const homeMlb = game.teams.home?.team;

  const matchingEvents = espnEventsList.filter((event) => {
    const competition = event.competitions?.[0];
    const competitors = competition?.competitors || [];
    const awayEspn = competitors.find((item) => item.homeAway === "away")?.team;
    const homeEspn = competitors.find((item) => item.homeAway === "home")?.team;

    return isEspnTeamMatch(awayMlb, awayEspn) && isEspnTeamMatch(homeMlb, homeEspn);
  });

  if (!matchingEvents.length) return null;
  if (matchingEvents.length === 1) return matchingEvents[0];

  // Si hay varios partidos entre los mismos equipos en la fecha (Doubleheader), seleccionar por proximidad de horario
  const gameTime = game.gameDate ? new Date(game.gameDate).getTime() : 0;
  if (!gameTime) return matchingEvents[0];

  let bestEvent = matchingEvents[0];
  let minDiff = Infinity;
  for (const event of matchingEvents) {
    const eventDateStr = event.competitions?.[0]?.date || event.date;
    const eventTime = eventDateStr ? new Date(eventDateStr).getTime() : 0;
    const diff = Math.abs(eventTime - gameTime);
    if (diff < minDiff) {
      minDiff = diff;
      bestEvent = event;
    }
  }
  return bestEvent;
}


function extractEspnOdds(event) {
  const odds = event?.competitions?.[0]?.odds?.[0] || {};
  return {
    overUnder: number(odds.overUnder) || null,
    details: odds.details || "",
    spread: number(odds.spread) || null,
  };
}

function parseWindDirection(val) {
  if (val === null || val === undefined || val === "") return "";
  if (typeof val === "number" || (typeof val === "string" && /^\d+(\.\d+)?$/.test(val.trim()))) {
    return degreesToCardinal(Number(val));
  }
  return String(val).toUpperCase().trim();
}

function degreesToCardinal(deg) {
  if (deg === null || deg === undefined || !Number.isFinite(Number(deg))) return "";
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const index = Math.round(((Number(deg) % 360) / 45)) % 8;
  return directions[(index + 8) % 8];
}

function extractEspnWeather(event) {
  const weather = event?.weather;
  if (!weather) return null;

  let temperature = number(weather.temperature);
  let highTemperature = number(weather.highTemperature || weather.maxTemperature);
  let lowTemperature = number(weather.lowTemperature);
  let windSpeed = number(weather.windSpeed || weather.wind?.speed);
  const description = weather.displayValue || weather.text || weather.shortPhrase || weather.longPhrase || "Clima disponible";
  const windDirectionRaw = weather.wind?.direction || weather.wind?.dir || weather.windDirection || "";
  const windDirection = parseWindDirection(windDirectionRaw);
  const humidity = number(weather.humidity);
  const tempUnit = String(weather.temperatureUnit || weather.unit || weather.units?.temperature || "").toLowerCase();

  const shouldConvertFromFahrenheit =
    tempUnit.includes("f") ||
    (tempUnit === "" && temperature > 50 && temperature <= 150);

  if (shouldConvertFromFahrenheit) {
    temperature = fahrenheitToCelsius(temperature);
    highTemperature = fahrenheitToCelsius(highTemperature);
    lowTemperature = fahrenheitToCelsius(lowTemperature);
    windSpeed = mphToKmh(windSpeed);
  }

  return {
    temperature,
    highTemperature,
    lowTemperature,
    description,
    windSpeed,
    windDirection,
    humidity,
    link: weather.link?.href || "",
    source: "ESPN",
  };
}

function fahrenheitToCelsius(value) {
  if (!Number.isFinite(value)) return value;
  return Number(((value - 32) * (5 / 9)).toFixed(1));
}

function mphToKmh(value) {
  if (!Number.isFinite(value)) return value;
  return Number((value * 1.60934).toFixed(1));
}

function calcularIndiceDensidadAire(temperatureC = 20, humidityPct = 50, elevationFt = 0, pressureHpa = null) {
  const tempC = numberOr(temperatureC, 20);
  const humidity = clamp(numberOr(humidityPct, 50), 0, 100) / 100;
  const elevationM = numberOr(elevationFt, 0) * 0.3048;

  // Presión estimada según elevación si no proviene directamente de OpenMeteo
  const pressure = Number.isFinite(pressureHpa) && pressureHpa > 800
    ? pressureHpa
    : 1013.25 * Math.exp(-elevationM / 8400);

  const T_kelvin = tempC + 273.15;

  // Presión de vapor de saturación (Ecuación de Tetens)
  const p_sat = 6.1078 * Math.pow(10, (7.5 * tempC) / (237.3 + tempC)); // hPa
  const p_v = humidity * p_sat * 100; // Pa
  const p_d = (pressure * 100) - p_v; // Pa

  const R_d = 287.058; // J/(kg·K) aire seco
  const R_v = 461.495; // J/(kg·K) vapor de agua

  const density = (p_d / (R_d * T_kelvin)) + (p_v / (R_v * T_kelvin)); // kg/m^3
  const seaLevelDensity = 1.225; // kg/m^3

  // Altitud de Densidad equivalente (Density Altitude en pies)
  const densityRatio = density / seaLevelDensity;
  const densityAltitudeFt = (1 - Math.pow(densityRatio, 0.23496)) * 145442;

  // Coeficiente de rozamiento / arrastre del aire sobre el vuelo de la pelota (Drag Multiplier)
  const dragReductionMultiplier = 1.0 + (seaLevelDensity - density) * 0.45;

  return {
    density: round1(density * 1000) / 1000,
    densityRatio: round1(densityRatio * 1000) / 1000,
    densityAltitudeFt: Math.round(densityAltitudeFt),
    dragReductionMultiplier: clamp(dragReductionMultiplier, 0.90, 1.18),
  };
}

function calcularImpactoClima(weather, venueName = "") {
  if (!weather) return 0;

  let impact = 0;
  const description = String(weather.description || "").toLowerCase();
  const temp = number(weather.temperature);
  const wind = number(weather.windSpeed);
  const humidity = number(weather.humidity);
  const precProb = number(weather.precipitationProbability);

  // Precipitación
  if (/rain|storm|thunder|snow|showers|drizzle|sleet|hail/.test(description)) {
    impact -= 0.45;
  } else if (precProb >= 60) {
    impact -= 0.25; // Alta probabilidad de lluvia aunque no esté lloviendo aún
  } else if (precProb >= 40) {
    impact -= 0.12;
  }

  // Velocidad del viento (base)
  if (/wind|breezy|blustery/.test(description) || wind >= 25) {
    impact -= 0.18;
  } else if (wind >= 18) {
    impact -= 0.10;
  }

  // === DIRECCIÓN DEL VIENTO (factor crítico en estadios abiertos) ===
  const windDir = String(weather.windDirection || weather.wind?.direction || weather.wind?.dir || "").toLowerCase();
  if (windDir) {
    const isOutBlowing = /\bout\b|s[ew]?$|s[ew][a-z]*|south/.test(windDir); // S, SW, SE, "out to CF"
    const isInBlowing = /\bin\b|n[ew]?$|n[ew][a-z]*|north/.test(windDir);   // N, NW, NE, "in from CF"
    if (isOutBlowing && wind >= 15) {
      impact += 0.15 + Math.min((wind - 15) * 0.008, 0.10); // Viento sale fuerte: +0.15 a +0.25
    } else if (isInBlowing && wind >= 15) {
      impact -= 0.12 + Math.min((wind - 15) * 0.006, 0.08); // Viento entra fuerte: -0.12 a -0.20
    }
  }

  // Temperatura
  if (temp >= 35) {       // > 95°F
    impact += 0.35;
  } else if (temp >= 32) { // > 90°F
    impact += 0.18;
  } else if (temp <= 0) {  // <= 32°F
    impact -= 0.30;
  } else if (temp <= 4) {  // <= 40°F
    impact -= 0.15;
  }

  // Factor de Densidad de Aire (Density Altitude Index)
  const stadium = findStadiumInfo(venueName || weather.venue || "");
  const elevationFt = stadium?.elevation || 0;
  const airDensity = calcularIndiceDensidadAire(temp, humidity, elevationFt);
  
  // Ajuste multiplicativo por densidad del aire (Drag coefficient)
  const densityMultiplier = airDensity.dragReductionMultiplier;
  impact = (impact >= 0 ? impact * densityMultiplier : impact / densityMultiplier);

  return Math.max(-0.75, Math.min(0.55, impact));
}

function extractEspnTeamRecords(event) {
  const result = { away: {}, home: {} };
  const competitors = event?.competitions?.[0]?.competitors || [];
  competitors.forEach((competitor) => {
    const side = competitor.homeAway;
    if (side !== "away" && side !== "home") return;
    const records = competitor.records || [];
    result[side] = {
      overallRecord: parseRecord(records.find((record) => record.type === "total" || record.name === "overall")?.summary),
      homeRecord: parseRecord(records.find((record) => record.type === "home" || record.name === "Home")?.summary),
      awayRecord: parseRecord(records.find((record) => record.type === "road" || record.name === "Road")?.summary),
    };
  });
  return result;
}

function extractEspnTeams(event) {
  const result = { away: {}, home: {} };
  const competitors = event?.competitions?.[0]?.competitors || [];
  competitors.forEach((competitor) => {
    const side = competitor.homeAway;
    if (side !== "away" && side !== "home") return;
    result[side] = {
      abbreviation: competitor.team?.abbreviation || "",
      logo: competitor.team?.logo || "",
      color: competitor.team?.color || "",
      alternateColor: competitor.team?.alternateColor || "",
    };
  });
  return result;
}

function parseRecord(summary) {
  const match = String(summary || "").match(/(\d+)\s*-\s*(\d+)/);
  if (!match) return null;
  const wins = Number(match[1]);
  const losses = Number(match[2]);
  return { wins, losses, pct: wins + losses ? wins / (wins + losses) : 0.5 };
}

function statsArrayToObject(stats) {
  return stats.reduce((acc, item) => {
    acc[item.name] = item.displayValue;
    acc[item.abbreviation] = item.displayValue;
    return acc;
  }, {});
}

async function fetchJson(url) {
  const response = await fetch(url, { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(`Error ${response.status} al consultar datos.`);
  return response.json();
}

function setBusy(isBusy, message) {
  els.loadBtn.disabled = isBusy;
  els.compareBtn.disabled = isBusy || !state.selectedGamePk;
  els.loadBtn.classList.toggle("opacity-70", isBusy);
  els.compareBtn.classList.toggle("opacity-70", isBusy);
  if (message) setStatus(message, "neutral");
}

function setStatus(message, tone = "neutral") {
  const classes = {
    neutral: "border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 px-4 py-3 text-sm font-semibold text-slate-650 dark:text-slate-300",
    ok: "border-b border-emerald-100 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/20 px-4 py-3 text-sm font-semibold text-emerald-700 dark:text-emerald-400",
    warn: "border-b border-amber-100 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/20 px-4 py-3 text-sm font-semibold text-amber-700 dark:text-amber-400",
    error: "border-b border-rose-100 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/20 px-4 py-3 text-sm font-semibold text-rose-700 dark:text-rose-400",
  };
  els.statusBox.className = classes[tone] || classes.neutral;
  els.statusBox.textContent = message;
}

function findStadiumInfo(venueName = "") {
  const normalizedVenue = normalizeName(venueName || "");
  if (MLB_STADIUMS[venueName]) return MLB_STADIUMS[venueName];
  const entry = Object.entries(MLB_STADIUMS).find(([name]) => normalizeName(name) === normalizedVenue);
  return entry ? entry[1] : null;
}

async function fetchOpenMeteoWeather(venueName, gameDate) {
  if (!venueName) return null;
  
  // Limpieza automática de registros antiguos para que no ocupen memoria
  const NOW = Date.now();
  const EXPIRATION_TIME = 2 * 60 * 60 * 1000; // 2 horas en milisegundos

  for (const [key, value] of state.weatherCache.entries()) {
    if (NOW - value.timestamp > EXPIRATION_TIME) {
      state.weatherCache.delete(key);
    }
  }

  // Comprobar si ya tenemos clima válido en caché
  const cached = state.weatherCache.get(venueName);
  if (cached && (NOW - cached.timestamp <= EXPIRATION_TIME)) {
    return cached.data;
  }

  const stadium = findStadiumInfo(venueName);
  if (!stadium?.latitude || !stadium?.longitude || !gameDate) return null;

  try {
    const dateUtc = new Date(gameDate);
    const startDate = dateUtc.toISOString().slice(0, 10);
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${stadium.latitude}&longitude=${stadium.longitude}&hourly=temperature_2m,relativehumidity_2m,windspeed_10m,winddirection_10m,precipitation_probability,weathercode&start_date=${startDate}&end_date=${startDate}&timezone=UTC`;
    const data = await fetchJson(url);
    const weather = pickOpenMeteoWeather(data, dateUtc);
    if (!weather) return null;

    const result = {
      temperature: weather.temperature,
      highTemperature: weather.highTemperature,
      lowTemperature: weather.lowTemperature,
      description: weather.description,
      windSpeed: weather.windSpeed,
      windDirection: weather.windDirection,
      humidity: weather.humidity,
      precipitationProbability: weather.precipitationProbability,
      link: "https://open-meteo.com/",
      source: "Open-Meteo",
      venue: venueName,
      latitude: stadium.latitude,
      longitude: stadium.longitude,
    };

    // Guardar en caché autolimitada (max 30 estadios)
    setLimitedMapValue(state.weatherCache, venueName, { timestamp: NOW, data: result }, 30);
    return result;
  } catch (error) {
    console.warn("Open-Meteo error:", error);
    return null;
  }
}

function pickOpenMeteoWeather(data, dateUtc) {
  const times = data?.hourly?.time || [];
  const temperatures = data?.hourly?.temperature_2m || [];
  const humidities = data?.hourly?.relativehumidity_2m || [];
  const windSpeeds = data?.hourly?.windspeed_10m || [];
  const windDirections = data?.hourly?.winddirection_10m || [];
  const weatherCodes = data?.hourly?.weathercode || [];
  const rainProbs = data?.hourly?.precipitation_probability || [];
  if (!times.length || !temperatures.length || !humidities.length || !windSpeeds.length) return null;

  const targetTime = dateUtc.toISOString().slice(0, 16) + ":00";
  let index = times.indexOf(targetTime);
  if (index < 0) {
    const targetMs = dateUtc.getTime();
    index = times.reduce((closest, _, i) => {
      if (closest === -1) return i;
      const currentMs = Date.parse(times[i]);
      return Math.abs(currentMs - targetMs) < Math.abs(Date.parse(times[closest]) - targetMs) ? i : closest;
    }, -1);
  }
  if (index < 0) return null;

  const highTemperature = Math.max(...temperatures);
  const lowTemperature = Math.min(...temperatures);
  const code = weatherCodes[index];
  const windDeg = windDirections[index];
  return {
    temperature: number(temperatures[index]),
    highTemperature: number(highTemperature),
    lowTemperature: number(lowTemperature),
    windSpeed: number(windSpeeds[index]),
    windDirection: degreesToCardinal(windDeg),
    humidity: number(humidities[index]),
    precipitationProbability: rainProbs[index] !== undefined ? number(rainProbs[index]) : null,
    description: openMeteoWeatherCodeToDescription(code),
  };
}

function openMeteoWeatherCodeToDescription(code) {
  switch (Number(code)) {
    case 0:
      return "Cielo despejado";
    case 1:
    case 2:
    case 3:
      return "Parcialmente nublado";
    case 45:
    case 48:
      return "Niebla";
    case 51:
    case 53:
    case 55:
      return "Lluvia ligera";
    case 61:
    case 63:
    case 65:
      return "Lluvia";
    case 71:
    case 73:
    case 75:
      return "Nieve";
    case 80:
    case 81:
    case 82:
      return "Chubascos";
    case 95:
    case 96:
    case 99:
      return "Tormenta eléctrica";
    default:
      return "Condiciones climáticas";
  }
}

function obtenerParkFactor(game = {}) {
  const venueName = game?.venue?.name || "";
  const stadium = findStadiumInfo(venueName);
  return stadium?.parkFactor ?? 1.0;
}

function confidenceBadge(value) {
  const tone =
    value === "Alta"
      ? "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 border border-transparent dark:border-emerald-800/40"
      : value === "Media"
        ? "bg-sky-100 dark:bg-sky-950/40 text-sky-800 dark:text-sky-400 border border-transparent dark:border-sky-800/40"
        : value === "Referencia"
          ? "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-transparent dark:border-slate-700/40"
          : "bg-amber-100 dark:bg-amber-950/40 text-amber-900 dark:text-amber-400 border border-transparent dark:border-amber-800/40";
  return `<span class="inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${tone}">${value}</span>`;
}

function confidenceFromEdge(edge, probability) {
  if (edge >= 1.8 && probability >= 0.61) return "Alta";
  if (edge >= 0.9 && probability >= 0.55) return "Media";
  return "Baja";
}

function confidenceFromTotalEdge(edge) {
  if (edge >= 1.2) return "Alta";
  if (edge >= 0.6) return "Media";
  return "Baja";
}

function recomendacionTotal(totalRuns, line) {
  if (line) {
    if (totalRuns >= line + 0.45) return `Over ${line}`;
    if (totalRuns <= line - 0.45) return `Under ${line}`;
    return `Cerca de ${line}`;
  }

  if (totalRuns >= 8.9) return "Over estimado";
  if (totalRuns <= 7.4) return "Under estimado";
  return "Total medio";
}

function proyectarHitsEquipo(team, opponent, opponentPitcher, recentForm, opponentRecentForm, opponentHand = "R") {
  const seasonHits = fallback(team?.hitsPerGame, LEAGUE.hitsPerGame);
  const recentHits = fallback(recentForm?.hits10, LEAGUE.hitsPerGame);
  // 75% weight on recent 10 games, 25% weight on season stats
  const teamHitsRPG = recentHits * 0.75 + seasonHits * 0.25;

  const seasonHitsAllowed = fallback(opponent?.hitsAllowedPerGame, LEAGUE.hitsPerGame);
  const recentHitsAllowed = fallback(opponentRecentForm?.hitsAllowed10, LEAGUE.hitsPerGame);
  // 75% weight on recent 10 games, 25% weight on season stats
  const opponentHitsAllowedRPG = recentHitsAllowed * 0.75 + seasonHitsAllowed * 0.25;
  
  // Base hits expectation combining team offense and opponent defense relative to league average
  const baseExpectedHits = (teamHitsRPG * opponentHitsAllowedRPG) / LEAGUE.hitsPerGame;

  // Pitcher hits factor: based on H/9, WHIP, and K/9 relative to league averages
  const pitcherH9Ratio = fallback(opponentPitcher?.hitsPerNine, LEAGUE.pitcherHits9) / LEAGUE.pitcherHits9;
  const pitcherWhipRatio = fallback(opponentPitcher?.whip, LEAGUE.whip) / LEAGUE.whip;
  const pitcherK9Diff = fallback(opponentPitcher?.k9, LEAGUE.pitcherK9) - LEAGUE.pitcherK9;
  const pitcherK9Factor = 1.0 - pitcherK9Diff * 0.012; // High K/9 reduces contact and hits
  
  const pitcherFactor = (pitcherH9Ratio * 0.50 + pitcherWhipRatio * 0.35 + pitcherK9Factor * 0.15);

  // Recent form factor
  const formFactor = 1.0 + (recentHits / LEAGUE.hitsPerGame - 1.0) * 0.30;

  // Batting average factor
  const teamBA = fallback(team?.battingAverage, LEAGUE.battingAverage);
  const baFactor = teamBA / LEAGUE.battingAverage;

  // Platoon split adjustment for opposing pitcher hand (sensibilidad aumentada a 0.28)
  const splitFactor = opponentHand === "L" ? (fallback(team?.opsVsLeft, team?.ops) || LEAGUE.ops) / LEAGUE.ops : (fallback(team?.opsVsRight, team?.ops) || LEAGUE.ops) / LEAGUE.ops;
  const platoonFactor = 1.0 + (splitFactor - 1.0) * 0.28;

  // Sabermetric multiplicative projection
  let raw = baseExpectedHits * pitcherFactor * formFactor * baFactor * platoonFactor;

  return clamp(raw, 5.0, 15.0);
}

function buildExplanation(model) {
  const pitcherEdge = model.homePitcherMetrics.score - model.awayPitcherMetrics.score;
  const offenseEdge = model.homeOffense.score - model.awayOffense.score;
  const formEdge = model.homeForm.score - model.awayForm.score;
  const bullpenEdge = model.homeBullpen.score - model.awayBullpen.score;
  const factors = [
    `${model.awayName} ${scorePercent(model.awayPitcherMetrics.score)} vs ${model.homeName} ${scorePercent(model.homePitcherMetrics.score)} en abridores`,
    `Ofensiva: ${model.awayName} ${scorePercent(model.awayOffense.score)}, ${model.homeName} ${scorePercent(model.homeOffense.score)}`,
    `Forma reciente ultimos 10: ${model.awayName} ${model.awayForm.runsFor10.toFixed(1)} RF/G y ${model.awayForm.runsAllowed10.toFixed(1)} RA/G; ${model.homeName} ${model.homeForm.runsFor10.toFixed(1)} RF/G y ${model.homeForm.runsAllowed10.toFixed(1)} RA/G`,
    `Bullpen: ${model.awayName} ERA aprox ${model.awayBullpen.era.toFixed(2)} y fatiga ${scorePercent(model.awayBullpen.fatigue)}; ${model.homeName} ERA aprox ${model.homeBullpen.era.toFixed(2)} y fatiga ${scorePercent(model.homeBullpen.fatigue)}`,
  ];
  if (model.weather) {
    factors.push(`Clima: ${model.weather.temperature}°C ${model.weather.description}`);
  }

  const leaders = [
    [Math.abs(pitcherEdge), pitcherEdge >= 0 ? `${model.homeName} llega mejor en abridor` : `${model.awayName} llega mejor en abridor`],
    [Math.abs(offenseEdge), offenseEdge >= 0 ? `${model.homeName} tiene mejor perfil ofensivo` : `${model.awayName} tiene mejor perfil ofensivo`],
    [Math.abs(formEdge), formEdge >= 0 ? `${model.homeName} llega con mejor forma reciente` : `${model.awayName} llega con mejor forma reciente`],
    [Math.abs(bullpenEdge), bullpenEdge >= 0 ? `${model.homeName} tiene ventaja de bullpen` : `${model.awayName} tiene ventaja de bullpen`],
  ]
    .sort((a, b) => b[0] - a[0])
    .filter(([edge]) => edge >= 0.04)
    .slice(0, 2)
    .map(([, text]) => text);

  if (leaders.length) factors.unshift(`Factores principales: ${leaders.join("; ")}.`);
  if (model.odds.overUnder) factors.push(`Total proyectado ${model.totalRuns.toFixed(1)} contra linea ESPN ${model.odds.overUnder}.`);
  return factors;
}

function weightedTeamScore(scores, weights) {
  return (
    numberOr(scores.pitcher?.score, 0.5) * weights.pitcher +
    numberOr(scores.offense?.score, 0.5) * weights.offense +
    numberOr(scores.form?.score, 0.5) * weights.form +
    numberOr(scores.bullpen?.score, 0.5) * weights.bullpen +
    numberOr(scores.localia?.score, 0.5) * weights.localia +
    numberOr(scores.matchup?.score, 0.5) * weights.matchup
  );
}

function normalizeHigher(value, low, high) {
  return clamp((numberOr(value, (low + high) / 2) - low) / (high - low), 0, 1);
}

function normalizeLower(value, low, high) {
  return 1 - normalizeHigher(value, low, high);
}

function scoreLabel(score) {
  if (score >= 0.64) return "Fuerte";
  if (score <= 0.38) return "Debil";
  return "Neutro";
}

function scorePercent(score) {
  return `${Math.round(clamp(numberOr(score, 0.5), 0, 1) * 100)}%`;
}

function factorial(n) {
  if (n <= 1) return 1;
  let res = 1;
  for (let i = 2; i <= n; i++) res *= i;
  return res;
}

function poissonProbability(lambda, k) {
  return (Math.pow(lambda, k) * Math.exp(-lambda)) / factorial(k);
}

function calcularMatrizPoisson(awayRuns, homeRuns, overUnderLine, awayRecentRuns, homeRecentRuns, parkFactor = 1.0) {
  let homeWinProb = 0;
  let awayWinProb = 0;
  let overProb = 0;
  let underProb = 0;
  let homeMinus1_5Prob = 0;
  let awayMinus1_5Prob = 0;

  const MAX_RUNS = 22;

  const awayDist = obtenerDistribucion(awayRuns, awayRecentRuns, parkFactor);
  const homeDist = obtenerDistribucion(homeRuns, homeRecentRuns, parkFactor);

  for (let a = 0; a <= MAX_RUNS; a++) {
    const pAway = evaluarProbabilidad(awayDist, a);
    for (let h = 0; h <= MAX_RUNS; h++) {
      const pHome = evaluarProbabilidad(homeDist, h);
      const jointProb = pAway * pHome;

      if (h > a) {
        homeWinProb += jointProb;
      } else if (a > h) {
        awayWinProb += jointProb;
      } else {
        homeWinProb += jointProb * 0.5;
        awayWinProb += jointProb * 0.5;
      }

      const totalRuns = a + h;
      const targetLine = overUnderLine || 8.5;
      if (totalRuns > targetLine) {
        overProb += jointProb;
      } else if (totalRuns < targetLine) {
        underProb += jointProb;
      } else {
        overProb += jointProb * 0.5;
        underProb += jointProb * 0.5;
      }

      if (h - a >= 1.5) homeMinus1_5Prob += jointProb;
      if (a - h >= 1.5) awayMinus1_5Prob += jointProb;
    }
  }

  return {
    homeWinProb,
    awayWinProb,
    overProb,
    underProb,
    homeMinus1_5Prob,
    awayMinus1_5Prob,
    distribution: {
      away: awayDist.type,
      home: homeDist.type
    }
  };
}

function runMonteCarloSimulation({ awayRuns, homeRuns, awayHits, homeHits, totalLine = 8.5, awayRecentRuns = [], homeRecentRuns = [], iterations = 10000, parkFactor = 1.0 }) {
  const awayDist = obtenerDistribucion(awayRuns, awayRecentRuns, parkFactor);
  const homeDist = obtenerDistribucion(homeRuns, homeRecentRuns, parkFactor);

  let awayWins = 0;
  let homeWins = 0;
  let ties = 0;

  let overHits = 0;
  let underHits = 0;

  let homeMinus1_5 = 0;
  let awayMinus1_5 = 0;

  let f5HomeWins = 0;
  let f5AwayWins = 0;
  let f5Ties = 0;

  let totalAwayRunsSum = 0;
  let totalHomeRunsSum = 0;

  // Tablas de probabilidad acumulada para muestreo ultra-rápido (<20ms)
  const MAX_VAL = 22;
  const awayProbTable = [];
  const homeProbTable = [];

  let cumAway = 0;
  let cumHome = 0;

  for (let k = 0; k <= MAX_VAL; k++) {
    const pA = evaluarProbabilidad(awayDist, k);
    const pH = evaluarProbabilidad(homeDist, k);
    cumAway += pA;
    cumHome += pH;
    awayProbTable.push(cumAway);
    homeProbTable.push(cumHome);
  }

  const sampleDist = (cumTable) => {
    const r = Math.random() * cumTable[cumTable.length - 1];
    for (let i = 0; i < cumTable.length; i++) {
      if (r <= cumTable[i]) return i;
    }
    return cumTable.length - 1;
  };

  for (let iter = 0; iter < iterations; iter++) {
    const aRuns = sampleDist(awayProbTable);
    const hRuns = sampleDist(homeProbTable);

    totalAwayRunsSum += aRuns;
    totalHomeRunsSum += hRuns;

    // Ganador de partido completo
    if (hRuns > aRuns) {
      homeWins++;
    } else if (aRuns > hRuns) {
      awayWins++;
    } else {
      ties++;
      if (Math.random() >= 0.5) homeWins++;
      else awayWins++;
    }

    // Over / Under carreras
    const total = aRuns + hRuns;
    if (total > totalLine) overHits++;
    else if (total < totalLine) underHits++;
    else {
      if (Math.random() >= 0.5) overHits++;
      else underHits++;
    }

    // Run Line (-1.5)
    if (hRuns - aRuns >= 1.5) homeMinus1_5++;
    if (aRuns - hRuns >= 1.5) awayMinus1_5++;

    // Primeras 5 Entradas (F5): ~55.5% de las carreras ocurren en las primeras 5 entradas
    const aF5 = Math.max(0, Math.round(aRuns * 0.555 + (Math.random() - 0.5) * 0.9));
    const hF5 = Math.max(0, Math.round(hRuns * 0.555 + (Math.random() - 0.5) * 0.9));

    if (hF5 > aF5) f5HomeWins++;
    else if (aF5 > hF5) f5AwayWins++;
    else f5Ties++;
  }

  return {
    iterations,
    homeWinProb: round1((homeWins / iterations) * 1000) / 1000,
    awayWinProb: round1((awayWins / iterations) * 1000) / 1000,
    overProb: round1((overHits / iterations) * 1000) / 1000,
    underProb: round1((underHits / iterations) * 1000) / 1000,
    homeMinus1_5Prob: round1((homeMinus1_5 / iterations) * 1000) / 1000,
    awayMinus1_5Prob: round1((awayMinus1_5 / iterations) * 1000) / 1000,
    f5HomeWinProb: round1((f5HomeWins / iterations) * 1000) / 1000,
    f5AwayWinProb: round1((f5AwayWins / iterations) * 1000) / 1000,
    f5TieProb: round1((f5Ties / iterations) * 1000) / 1000,
    f5Favorite: (f5HomeWins >= f5AwayWins) ? "home" : "away",
    f5FavoriteProb: Math.max(f5HomeWins, f5AwayWins) / iterations,
    avgAwayRuns: round1((totalAwayRunsSum / iterations) * 10) / 10,
    avgHomeRuns: round1((totalHomeRunsSum / iterations) * 10) / 10,
  };
}

function pythagoreanWinProb(awayRuns, homeRuns) {
  const totalRuns = awayRuns + homeRuns;
  if (totalRuns === 0) return 0.5;
  const exponent = Math.pow(totalRuns, 0.287);
  const homePower = Math.pow(homeRuns, exponent);
  const awayPower = Math.pow(awayRuns, exponent);
  return clamp(homePower / (homePower + awayPower), 0.1, 0.9);
}

function calcularHitsPoisson(awayHits, homeHits, line, awayRecentHits, homeRecentHits) {
  let overProb = 0;
  let underProb = 0;
  const targetLine = line || 16.5;
  const MAX_HITS = 25;

  const awayDist = obtenerDistribucion(awayHits, awayRecentHits);
  const homeDist = obtenerDistribucion(homeHits, homeRecentHits);

  for (let a = 0; a <= MAX_HITS; a++) {
    const pAway = evaluarProbabilidad(awayDist, a);
    for (let h = 0; h <= MAX_HITS; h++) {
      const pHome = evaluarProbabilidad(homeDist, h);
      const jointProb = pAway * pHome;

      const total = a + h;
      if (total > targetLine) {
        overProb += jointProb;
      } else if (total < targetLine) {
        underProb += jointProb;
      } else {
        overProb += jointProb * 0.5;
        underProb += jointProb * 0.5;
      }
    }
  }
  return { 
    overProb, 
    underProb,
    distribution: {
      away: awayDist.type,
      home: homeDist.type
    }
  };
}

function pitcherBase(game, awayPitcher, homePitcher) {
  const awayStarter = awayPitcher?.name || game.teams.away.probablePitcher?.fullName || "Abridor visitante N/D";
  const homeStarter = homePitcher?.name || game.teams.home.probablePitcher?.fullName || "Abridor local N/D";
  return `${awayStarter} (${pitcherModelLine(awayPitcher)}); ${homeStarter} (${pitcherModelLine(homePitcher)})`;
}

function pitcherModelLine(pitcher) {
  if (!pitcher) return "ERA/WHIP N/D";

  const era = Number.isFinite(pitcher.era) ? `ERA ${pitcher.era.toFixed(2)}` : "ERA N/D";
  const whip = Number.isFinite(pitcher.whip) ? `WHIP ${pitcher.whip.toFixed(2)}` : "WHIP N/D";
  const k9 = Number.isFinite(pitcher.k9) ? `K/9 ${pitcher.k9.toFixed(1)}` : "K/9 N/D";
  const hr9 = Number.isFinite(pitcher.hr9) ? `HR/9 ${pitcher.hr9.toFixed(1)}` : "HR/9 N/D";
  return `${era}, ${whip}, ${k9}, ${hr9}`;
}

function pitcherImage(pitcher) {
  const headshot = pitcherHeadshotUrl(pitcher);
  if (headshot) {
    return `<img src="${escapeHtml(headshot)}" alt="${escapeHtml(pitcher.name)}" class="h-16 w-16 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 object-cover img-smooth" loading="lazy" />`;
  }

  return `
    <div class="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-lg font-black text-slate-500 dark:text-slate-400">
      ${escapeHtml(initials(pitcher.name))}
    </div>
  `;
}

function formatRecord(pitcher) {
  if (Number.isFinite(pitcher?.wins) && Number.isFinite(pitcher?.losses)) {
    return `${pitcher.wins}-${pitcher.losses}`;
  }
  return "N/D";
}

function formatStat(value, digits = 1) {
  return Number.isFinite(value) ? value.toFixed(digits) : "N/D";
}

function formatNullable(value) {
  return Number.isFinite(value) ? String(value) : "N/D";
}

function initials(value) {
  return (
    String(value || "")
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "SP"
  );
}

function formatWinLoss(pitcher) {
  const record = String(pitcher?.record || "").match(/(\d+)\s*-\s*(\d+)/);
  if (record) return `${record[1]}-${record[2]}`;
  return formatRecord(pitcher);
}

function teamAbbrev(name) {
  return String(name || "")
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();
}

function mlbTeamLogoUrl(teamId) {
  return `https://www.mlbstatic.com/team-logos/${teamId}.svg`;
}

function mlbPitcherHeadshotUrl(playerId) {
  return `https://img.mlbstatic.com/mlb-photos/image/upload/w_360,q_auto:best,dpr_auto/v1/people/${playerId}/headshot/67/current`;
}

function pitcherHeadshotUrl(pitcher) {
  const playerId = pitcher?.mlbId || (pitcher?.source !== "ESPN" ? pitcher?.id : null);
  if (playerId) return mlbPitcherHeadshotUrl(playerId);
  return pitcher?.headshot || "";
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function emptyState(message) {
  return `<div class="flex min-h-[320px] items-center justify-center rounded-lg border border-dashed border-slate-300 p-5 text-center text-sm font-semibold text-slate-500">${message}</div>`;
}

function toDateInputValue(date) {
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 10);
}

function formatTime(value) {
  if (!value) return "Hora N/D";
  return new Intl.DateTimeFormat("es", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function shortName(name) {
  return name
    .replace("Arizona Diamondbacks", "D-backs")
    .replace("Chicago White Sox", "White Sox")
    .replace("Boston Red Sox", "Red Sox")
    .replace("Toronto Blue Jays", "Blue Jays")
    .replace("San Francisco Giants", "Giants")
    .replace("Los Angeles Dodgers", "Dodgers")
    .replace("Los Angeles Angels", "Angels")
    .replace("New York", "NY")
    .replace("Kansas City", "KC")
    .replace("Tampa Bay", "TB");
}

function normalizeName(value) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function number(value) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function numberOr(value, fallbackValue) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallbackValue;
}

function firstFinite(...values) {
  for (const value of values) {
    const parsed = Number.parseFloat(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return NaN;
}

function ratePerNine(value, innings) {
  return innings > 0 ? (value * 9) / innings : 0;
}

function inningsToNumber(value) {
  if (!value) return 0;
  const [whole, partial = "0"] = String(value).split(".");
  const outs = Number.parseInt(partial, 10) || 0;
  return (Number.parseInt(whole, 10) || 0) + outs / 3;
}

function fallback(value, fallbackValue) {
  return Number.isFinite(value) && value > 0 ? value : fallbackValue;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function round1(value) {
  return Math.round(value * 10) / 10;
}

function sum(values) {
  return values.reduce((total, value) => total + numberOr(value, 0), 0);
}

function average(values) {
  const clean = values.map((value) => numberOr(value, NaN)).filter(Number.isFinite);
  return clean.length ? sum(clean) / clean.length : 0;
}

function addDays(dateValue, days) {
  const date = new Date(`${dateValue}T12:00:00`);
  date.setDate(date.getDate() + days);
  return toDateInputValue(date);
}

function estimateHitsFromRuns(runs) {
  return clamp(LEAGUE.hitsPerGame + (numberOr(runs, LEAGUE.runsPerGame) - LEAGUE.runsPerGame) * 0.72, 4, 15);
}

function locationWinRate(games, isHome) {
  const filtered = games.filter((game) => game.isHome === isHome);
  if (!filtered.length) return 0.5;
  return filtered.filter((game) => game.win).length / filtered.length;
}

function gammaln(z) {
  if (z < 0.5) {
    return Math.log(Math.PI) - Math.log(Math.abs(Math.sin(Math.PI * z))) - gammaln(1 - z);
  }
  const g = 7;
  const p = [
    0.99999999999980993,
    676.5203681218851,
    -1259.1392167224028,
    771.32342877765313,
    -176.61502916214059,
    12.507343278686905,
    -0.13857109526572012,
    9.9843695780195716e-6,
    1.5056327351493116e-7
  ];
  z -= 1;
  let x = p[0];
  for (let i = 1; i < p.length; i++) {
    x += p[i] / (z + i);
  }
  const t = z + g + 0.5;
  return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x);
}

function negativeBinomialProbability(r, p, k) {
  if (k < 0) return 0;
  const logProb = gammaln(k + r) - gammaln(r) - gammaln(k + 1) + r * Math.log(1 - p) + k * Math.log(p);
  return Math.exp(logProb);
}

function obtenerDistribucion(mean, recentValues, parkFactor = 1.0) {
  let variance = mean;

  if (recentValues && recentValues.length >= 2) {
    const avg = average(recentValues);
    if (avg > 0) {
      const sumSqDiff = recentValues.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0);
      const calculatedVariance = sumSqDiff / (recentValues.length - 1);
      if (calculatedVariance > 0) variance = calculatedVariance;
    }
  }

  // Expansión de varianza por Park Factor (> 1.02)
  if (parkFactor > 1.02) {
    variance *= (1.0 + (parkFactor - 1.0) * 1.5);
  }

  if (variance > mean) {
    const dispersion = variance / mean;
    const projectedVariance = dispersion * mean;
    const r = (mean * mean) / (projectedVariance - mean);
    const p = (projectedVariance - mean) / projectedVariance;
    return { type: "NegativeBinomial", r, p, mean, variance: projectedVariance };
  }

  return { type: "Poisson", lambda: mean, mean, variance: mean };
}

function evaluarProbabilidad(dist, k) {
  if (dist.type === "NegativeBinomial") {
    return negativeBinomialProbability(dist.r, dist.p, k);
  } else {
    return poissonProbability(dist.lambda, k);
  }
}

function setLimitedMapValue(map, key, value, maxSize) {
  if (map.has(key)) map.delete(key);
  map.set(key, value);

  while (map.size > maxSize) {
    const oldestKey = map.keys().next().value;
    map.delete(oldestKey);
  }
}

// ==========================================
// GEMINI API & AI STATS SUMMARY MODULE
// ==========================================

function getGeminiApiKey() {
  return localStorage.getItem("gemini_api_key") || "";
}

function setGeminiApiKey(key) {
  if (key) {
    localStorage.setItem("gemini_api_key", key.trim());
  } else {
    localStorage.removeItem("gemini_api_key");
  }
}

function openGeminiModal() {
  const modal = document.querySelector("#geminiKeyModal");
  const input = document.querySelector("#geminiApiKeyInput");
  if (modal) {
    if (input) input.value = getGeminiApiKey();
    modal.classList.remove("hidden");
  }
}

function closeGeminiModal() {
  const modal = document.querySelector("#geminiKeyModal");
  if (modal) modal.classList.add("hidden");
}

async function generateGeminiSummary(projection) {
  const container = document.querySelector("#aiSummarySection");
  if (!container || !projection) return;

  container.innerHTML = `
    <section class="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 shadow-panel dark:shadow-panel-dark animate-pulse my-5">
      <div class="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
        <div class="flex items-center gap-2">
          <div class="h-6 w-6 rounded-full bg-indigo-500/20"></div>
          <div class="h-5 w-56 rounded bg-slate-200 dark:bg-slate-800"></div>
        </div>
        <div class="h-5 w-28 rounded-full bg-slate-200 dark:bg-slate-800"></div>
      </div>
      <div class="space-y-3">
        <div class="h-4 w-3/4 rounded bg-slate-200 dark:bg-slate-800"></div>
        <div class="h-4 w-full rounded bg-slate-200 dark:bg-slate-800"></div>
        <div class="h-4 w-5/6 rounded bg-slate-200 dark:bg-slate-800"></div>
      </div>
    </section>
  `;

  const apiKey = getGeminiApiKey();
  const summaryResult = await fetchOrSynthesizeAiSummary(projection, apiKey);
  renderAiSummaryCard(projection, summaryResult.summary, summaryResult.source);
}

async function fetchOrSynthesizeAiSummary(projection, apiKey) {
  const awayName = projection.awayName || "Visitante";
  const homeName = projection.homeName || "Local";
  const venue = projection.game?.venue?.name || "Estadio MLB";
  const awayRuns = Number.isFinite(projection.awayRuns) ? projection.awayRuns.toFixed(1) : (projection.model?.awayRuns != null ? projection.model.awayRuns.toFixed(1) : "4.0");
  const homeRuns = Number.isFinite(projection.homeRuns) ? projection.homeRuns.toFixed(1) : (projection.model?.homeRuns != null ? projection.model.homeRuns.toFixed(1) : "4.5");
  const roundedAway = Math.max(1, Math.round(projection.awayRuns ?? projection.model?.awayRuns ?? 4));
  const roundedHome = Math.max(1, Math.round(projection.homeRuns ?? projection.model?.homeRuns ?? 5));
  const winner = projection.favorite || (projection.awayRuns >= projection.homeRuns ? awayName : homeName);
  
  const weather = projection.weather;
  const tempStr = weather?.temperature != null ? `${weather.temperature}°C` : "22°C";
  const windSpeedStr = weather?.windSpeed != null ? `${weather.windSpeed} km/h` : "12 km/h";
  const windDirStr = weather?.windDirectionLabel || "Viento moderado";

  const awayPitcher = projection.pitchers?.away?.name || projection.pitchers?.away?.fullName || projection.game?.teams?.away?.probablePitcher?.fullName || "Abridor Visitante";
  const homePitcher = projection.pitchers?.home?.name || projection.pitchers?.home?.fullName || projection.game?.teams?.home?.probablePitcher?.fullName || "Abridor Local";
  const awayPitcherEra = projection.model?.awayPitcherMetrics?.era != null ? projection.model.awayPitcherMetrics.era.toFixed(2) : "N/D";
  const homePitcherEra = projection.model?.homePitcherMetrics?.era != null ? projection.model.homePitcherMetrics.era.toFixed(2) : "N/D";

  const totalEstimate = Number.isFinite(projection.totalRuns) ? projection.totalRuns.toFixed(1) : (projection.model?.totalRuns != null ? projection.model.totalRuns.toFixed(1) : "8.5");
  const overUnderPick = projection.totalLean || (Number(totalEstimate) > 8.5 ? "Over 8.5 carreras" : "Under 8.5 carreras");

  const awayLineupDetails = projection.awayLineup && projection.awayLineup.length > 0
    ? projection.awayLineup.map((h, i) => `${i + 1}. ${h.name} (${h.position || "D"}, OBP:${h.obp != null ? h.obp.toFixed(3) : ".300"})`).join("; ")
    : "Alineación general estimada";

  const homeLineupDetails = projection.homeLineup && projection.homeLineup.length > 0
    ? projection.homeLineup.map((h, i) => `${i + 1}. ${h.name} (${h.position || "D"}, OBP:${h.obp != null ? h.obp.toFixed(3) : ".300"})`).join("; ")
    : "Alineación general estimada";

  const mc = projection.monteCarlo;
  const mcInfoStr = mc ? `Simulación Monte Carlo (10,000 partidos): Prob Ganador ${winner === homeName ? (mc.homeWinProb * 100).toFixed(1) : (mc.awayWinProb * 100).toFixed(1)}%, F5 (1st 5 Innings) Favorito: ${mc.f5Favorite === "home" ? homeName : awayName} (${(mc.f5FavoriteProb * 100).toFixed(1)}%), Over Prob: ${(mc.overProb * 100).toFixed(1)}%.` : "";
  const airDensityStr = projection.airDensity ? `Densidad del Aire: ${projection.airDensity.density} kg/m³ (Altitud de Densidad: ${projection.airDensity.densityAltitudeFt} ft, Multiplicador de vuelo: ${projection.airDensity.dragReductionMultiplier}x).` : "";
  const umpireStr = projection.umpireName ? `Árbitro Principal: ${projection.umpireName} (${projection.umpireImpact?.zoneType || "Zona Estándar"}).` : "Árbitro Estándar.";
  const defenseStr = `Defensa: ${awayName} (${projection.awayDefense?.label || "Promedio"}), ${homeName} (${projection.homeDefense?.label || "Promedio"}).`;

  if (apiKey) {
    try {
      const prompt = `Analiza el siguiente partido de béisbol MLB en español y devuelve ÚNICAMENTE un JSON válido con esta estructura exacta sin explicaciones adicionales:
{
  "introduccionPartido": "Resumen narrativo periodístico en 2 párrafos 100% ÚNICO, dinámico y fluido introduciendo el duelo entre ${awayName} y ${homeName} en el ${venue}, analizando el contraste de los abridores (${awayPitcher} vs ${homePitcher}), clima y momento reciente, concluyendo con: 'Nuestro modelo proyecta una victoria ${winner === homeName ? 'local' : 'visitante'} para ${winner} por ${winner === homeName ? `${roundedHome}-${roundedAway}` : `${roundedAway}-${roundedHome}`}'. Evita usar plantillas o frases idénticas a otros partidos.",
  "overUnderText": "Análisis del mercado Over/Under ${totalEstimate} carreras y probabilidad de bateo basada en simulación Monte Carlo de 10,000 iteraciones.",
  "first5Text": "Proyección y dinamismo para las primeras 5 entradas (1st 5 Innings) basada en Monte Carlo 10k.",
  "secondHalfText": "Impacto de relevistas y tramo final del partido.",
  "pitchingMatchupText": "Comparativa entre ${awayPitcher} (ERA ${awayPitcherEra}) y ${homePitcher} (ERA ${homePitcherEra}).",
  "fatigueText": "Análisis de fatiga de abridores (penalización TTOP), bullpen e itinerario reciente.",
  "weatherParkText": "Impacto del clima (${tempStr}), densidad del aire y viento Open-Meteo (${windSpeedStr}, ${windDirStr}) en el ${venue}.",
  "predictionAngle": "Ángulo de apuesta principal recomendado (ej: ${overUnderPick} o Handicap) con nivel de confianza y justificación clave sobre la alineación oficial."
}

Datos detallados del partido:
- Partido: ${awayName} vs ${homeName} en ${venue}.
- Abridores: ${awayPitcher} (ERA ${awayPitcherEra}) vs ${homePitcher} (ERA ${homePitcherEra}).
- Modelo Proyecta: ${awayName} ${awayRuns} - ${homeName} ${homeRuns} (Ganador estimado: ${winner}).
- ${mcInfoStr}
- ${airDensityStr}
- Clima Open-Meteo: ${tempStr}, Viento: ${windSpeedStr} (${windDirStr}).
- Fuente de Alineación: ${projection.lineupSource === "Ninguno" ? "Estimada" : "Confirmada vía " + projection.lineupSource}.
- Lineup Confirmado ${awayName} (del 1º al 9º): ${awayLineupDetails}.
- Lineup Confirmado ${homeName} (del 1º al 9º): ${homeLineupDetails}.`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          tools: [{ googleSearch: {} }],
          generationConfig: { temperature: 0.3 }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return { summary: parsed, source: "Gemini API en vivo + Google Search" };
        }
      }
    } catch (e) {
      console.warn("Gemini API error, usando síntesis estadística:", e);
    }
  }

  // Generadores Dinámicos Únicos por Partido
  const introduccionDinamica = generarIntroduccionDinamica({
    awayName, homeName, venue, awayPitcher, homePitcher, awayPitcherEra, homePitcherEra,
    totalEstimate, winner, roundedAway, roundedHome, windDirStr, tempStr
  });

  const overUnderDinamico = generarOverUnderDinamico(projection);
  const pitchingMatchupDinamico = generarPitchingMatchupDinamico(projection);
  const fatigaDinamica = generarFatigaDinamica(projection);
  const climaDinamico = generarClimaDinamico(projection);

  // Fallback: Síntesis Estadística de alta precisión
  const synthetic = {
    introduccionPartido: introduccionDinamica,
    overUnderText: overUnderDinamico,
    first5Text: `Primeras 5 entradas (1st 5 Innings) — Se proyecta un inicio disputado. La efectividad de ${awayPitcher} y ${homePitcher} contra el primer tercio del orden al bate dictará las carreras tempranas.`,
    secondHalfText: `Segunda mitad (Entradas 6-9) — El desgaste del bullpen proyecta oportunidades de carreras en el tramo final si los abridores superan los 85 picheos.`,
    pitchingMatchupText: pitchingMatchupDinamico,
    fatigueText: fatigaDinamica,
    weatherParkText: climaDinamico,
    predictionAngle: `Ángulo de Apuesta Principal: Predicción enfocada en ${overUnderPick} y ventaja para ${winner} (${winner === homeName ? `${homeRuns}` : `${awayRuns}`} carreras estimadas). Se sugiere monitorear cambios tras la alineación oficial.`
  };

  return { summary: synthetic, source: "Síntesis Estadística Estructurada" };
}

function generarOverUnderDinamico(projection) {
  const totalNum = Number.isFinite(projection.totalRuns) ? projection.totalRuns : (parseFloat(projection.model?.totalRuns) || 8.5);
  const awayRuns = Number.isFinite(projection.awayRuns) ? projection.awayRuns.toFixed(1) : (projection.model?.awayRuns != null ? projection.model.awayRuns.toFixed(1) : "4.0");
  const homeRuns = Number.isFinite(projection.homeRuns) ? projection.homeRuns.toFixed(1) : (projection.model?.homeRuns != null ? projection.model.homeRuns.toFixed(1) : "4.5");
  const pick = projection.totalLean || (totalNum > 8.5 ? "Over 8.5 carreras" : "Under 8.5 carreras");

  if (totalNum >= 9.5) {
    return `Alta expectativa de carreraje: El modelo calcula un total proyectado de ${totalNum.toFixed(1)} carreras (${projection.awayName} ${awayRuns} - ${projection.homeName} ${homeRuns}). La combinación de porcentaje de contacto y factores del estadio respalda una tendencia hacia el ${pick}.`;
  }
  if (totalNum <= 7.8) {
    return `Baja expectativa de carreraje: La proyección del modelo apunta a un duelo defensivo apretado de ${totalNum.toFixed(1)} carreras totales. El control del picheo abridor sugiere una línea sólida hacia el ${pick}.`;
  }
  return `Línea equilibrada en ${totalNum.toFixed(1)} carreras estimadas. El análisis de OBP colectivo y efectividad de lanzadores indica inclinación hacia el ${pick} con margen moderado.`;
}

function generarPitchingMatchupDinamico(projection) {
  const awayP = projection.pitchers?.away?.name || projection.game?.teams?.away?.probablePitcher?.fullName || "Abridor Visitante";
  const homeP = projection.pitchers?.home?.name || projection.game?.teams?.home?.probablePitcher?.fullName || "Abridor Local";
  const eraA = projection.model?.awayPitcherMetrics?.era;
  const eraH = projection.model?.homePitcherMetrics?.era;
  const whipA = projection.model?.awayPitcherMetrics?.whip;
  const whipH = projection.model?.homePitcherMetrics?.whip;
  const venue = projection.game?.venue?.name || "Estadio MLB";

  const eraAStr = Number.isFinite(eraA) ? eraA.toFixed(2) : "N/D";
  const eraHStr = Number.isFinite(eraH) ? eraH.toFixed(2) : "N/D";
  const whipAStr = Number.isFinite(whipA) ? whipA.toFixed(2) : "N/D";
  const whipHStr = Number.isFinite(whipH) ? whipH.toFixed(2) : "N/D";

  if (Number.isFinite(eraA) && Number.isFinite(eraH) && Math.abs(eraA - eraH) >= 1.0) {
    const dominant = eraA < eraH ? awayP : homeP;
    const domEra = eraA < eraH ? eraAStr : eraHStr;
    const challenger = eraA < eraH ? homeP : awayP;
    const chalEra = eraA < eraH ? eraHStr : eraAStr;
    return `Contraste en la lomita: ${dominant} (ERA ${domEra}, WHIP ${eraA < eraH ? whipAStr : whipHStr}) muestra una ventaja métrica clara frente a ${challenger} (ERA ${chalEra}), quien enfrentará la exigencia de contener el orden al bate rival en el ${venue}.`;
  }

  return `Duelo parejo en el picheo abridor: ${awayP} (ERA ${eraAStr}, WHIP ${whipAStr}) busca neutralizar la ofensiva rival, mientras que ${homeP} (ERA ${eraHStr}, WHIP ${whipHStr}) defenderá la lomita local apoyándose en su control de zona de strike.`;
}

function generarFatigaDinamica(projection) {
  const awayName = projection.awayName || "Visitante";
  const homeName = projection.homeName || "Local";
  const awayRelievers = projection.awayBullpenRoster || [];
  const homeRelievers = projection.homeBullpenRoster || [];

  const totalRelievers = awayRelievers.length + homeRelievers.length;
  if (totalRelievers > 10) {
    return `Reserva de bullpen amplia: ${awayName} cuenta con ${awayRelievers.length} relevistas disponibles y ${homeName} con ${homeRelievers.length}. Los abridores llegan con días de descanso regular, permitiendo una rotación de picheo saludable.`;
  }
  return `Gestión de relevistas: Bullpens con carga de trabajo regular. Las entradas finales dependerán de la durabilidad de los abridores y la disponibilidad de los closers para cerrar el encuentro.`;
}

function generarClimaDinamico(projection) {
  const weather = projection.weather;
  const venue = projection.game?.venue?.name || "Estadio MLB";
  if (!weather) {
    return `Condiciones climáticas estándar para el juego en el ${venue}. Sin impactos significativos previstos en el vuelo de la pelota.`;
  }

  const tempStr = weather.temperature != null ? `${weather.temperature}°C` : "20°C";
  const windStr = weather.windSpeed != null ? `${weather.windSpeed} km/h` : "10 km/h";
  const windDir = weather.windDirectionLabel || "Viento moderado";

  if (windDir.includes("favor") || windDir.includes("Outfield")) {
    return `Factor Clima en ${venue}: Temperatura de ${tempStr} con viento a favor (${windStr}, ${windDir}). Esta condición meteorológica beneficia a los bateadores y favorece el incremento de batazos profundos al outfield.`;
  }
  if (windDir.includes("contra") || windDir.includes("Infield")) {
    return `Factor Clima en ${venue}: Temperatura de ${tempStr} y viento en contra (${windStr}, ${windDir}). El viento frenará los batazos elevados, ayudando a los jardineros y favoreciendo al picheo abridor.`;
  }
  return `Factor Clima en ${venue}: Temperatura agradable de ${tempStr} y viento cruzado de ${windStr} (${windDir}). Condiciones neutras que permiten un desarrollo normal del partido.`;
}

function generarIntroduccionDinamica(ctx) {
  const { awayName, homeName, venue, awayPitcher, homePitcher, awayPitcherEra, homePitcherEra, totalEstimate, winner, roundedAway, roundedHome, windDirStr, tempStr } = ctx;
  const isHomeWinner = winner === homeName;
  const scoreStr = isHomeWinner ? `${roundedHome}-${roundedAway}` : `${roundedAway}-${roundedHome}`;
  const winnerSideStr = isHomeWinner ? `local para ${homeName}` : `visitante para ${awayName}`;
  const totalNum = parseFloat(totalEstimate) || 8.5;
  const eraA = parseFloat(awayPitcherEra);
  const eraH = parseFloat(homePitcherEra);

  // Variante 1: Duelo de Pitcheo Dominante (Bajo ERA en ambos lanzadores)
  if (Number.isFinite(eraA) && Number.isFinite(eraH) && eraA <= 3.60 && eraH <= 3.60) {
    return `Un auténtico duelo de ases se vislumbra en el ${venue}, donde ${awayPitcher} (${awayPitcherEra} ERA) y ${homePitcher} (${homePitcherEra} ERA) saltan a la lomita con la encomienda de maniatar a las maderas enemigas desde el primer lanzamiento. Ambas rotaciones exhiben métricas de control envidiables, lo que augura un juego decidido por detalles finos en las entradas intermedias. Nuestro modelo prevé un choque de bajo carreraje y proyecta una victoria ${winnerSideStr} por marcador de ${scoreStr}.`;
  }

  // Variante 2: Juego de Alto Vuelo / Bateo Encendido / Viento a Favor
  if (totalNum >= 9.0 || windDirStr.includes("Outfield") || windDirStr.includes("favor")) {
    return `Las condiciones climáticas y el potencial ofensivo en el ${venue} anticipan un encuentro de alta velocidad y dinamismo con el madero. Con una temperatura de ${tempStr} y el viento soplando a favor de los bateadores, tanto ${awayName} como ${homeName} buscarán capitalizar desde temprano sobre el picheo abridor (${awayPitcher} vs ${homePitcher}). El modelo proyecta una jornada prolífica en bases y batazos de poder, apuntando a una victoria ${winnerSideStr} con resultado estimado de ${scoreStr}.`;
  }

  // Variante 3: Ventaja de Abridor Específico (Un pitcher es claramente superior)
  if (Number.isFinite(eraA) && Number.isFinite(eraH) && Math.abs(eraA - eraH) >= 1.20) {
    const dominantPitcher = eraA < eraH ? awayPitcher : homePitcher;
    const dominantTeam = eraA < eraH ? awayName : homeName;
    const challengerPitcher = eraA < eraH ? homePitcher : awayPitcher;
    return `La brecha de efectividad en el picheo abridor emerge como la clave táctica principal en el ${venue}. ${dominantPitcher} llega respaldado por métricas superiores para comandar el picheo de ${dominantTeam}, mientras que ${challengerPitcher} enfrenta la exigencia de contener un orden al bate oponente agresivo. Basado en este contraste en la lomita, nuestro modelo proyecta un triunfo ${winnerSideStr} por ${scoreStr}.`;
  }

  // Variante 4: Desafío Táctico y Bateo Oportuno
  if (totalNum <= 7.8) {
    return `La jornada en el ${venue} plantea una prueba de paciencia e inteligencia en las bases entre ${awayName} y ${homeName}. Con ${awayPitcher} y ${homePitcher} enfocados en inducir batazos de out al cuadro, la capacidad de fabricar carreras en momentos apretados y castigar al bullpen rival será determinante. El modelo anticipa un encuentro cerrado y otorga la ventaja ${winnerSideStr} por ${scoreStr}.`;
  }

  // Variante 5: Narrativa Balanceada
  return `El choque entre ${awayName} y ${homeName} en el ${venue} promete emociones intensas sobre el terreno de juego. El abridor visitante ${awayPitcher} (${awayPitcherEra} ERA) intentará imponer condiciones temprano frente al abridor de casa ${homePitcher} (${homePitcherEra} ERA), en un compromiso donde el manejo del bullpen y el bateo oportuno dictarán el desenlace. Tras procesar las métricas de la jornada, nuestro modelo pronostica una victoria ${winnerSideStr} por marcador de ${scoreStr}.`;
}

function renderAiSummaryCard(projection, summary, sourceTag) {
  const container = document.querySelector("#aiSummarySection");
  if (!container || !summary) return;

  const awayName = projection.awayName || "Visitante";
  const homeName = projection.homeName || "Local";
  const winner = projection.favorite || (projection.awayRuns >= projection.homeRuns ? awayName : homeName);
  const confidence = projection.confidence || projection.model?.confidence || "Media";

  container.innerHTML = `
    <section class="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-panel dark:shadow-panel-dark my-5">
      <div class="flex flex-wrap items-center justify-between border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-indigo-50/80 via-slate-50 to-emerald-50/80 dark:from-indigo-950/40 dark:via-slate-900/40 dark:to-emerald-950/40 px-5 py-3.5">
        <div class="flex items-center gap-2.5">
          <span class="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold shadow-sm">
            <i data-lucide="sparkles" class="h-4 w-4"></i>
          </span>
          <div>
            <h3 class="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">Gemini AI Stats Summary</h3>
            <p class="text-[11px] text-slate-500 dark:text-slate-400">Análisis narrativo, clima Open-Meteo, fatiga y ángulo de apuesta</p>
          </div>
        </div>
        <div class="flex items-center gap-2 mt-2 sm:mt-0">
          <span class="inline-flex items-center gap-1.5 rounded-full bg-indigo-100 dark:bg-indigo-950/60 border border-indigo-300 dark:border-indigo-800 px-2.5 py-0.5 text-xs font-bold text-indigo-800 dark:text-indigo-300">
            <span class="h-2 w-2 rounded-full bg-indigo-500 animate-pulse"></span>
            ${escapeHtml(sourceTag)}
          </span>
        </div>
      </div>

      <div class="p-5 space-y-5">
        <!-- Bloque 1: Introducción del Partido -->
        <div class="rounded-lg border border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/30 dark:bg-indigo-950/20 p-4">
          <h4 class="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2 flex items-center gap-1.5">
            <i data-lucide="book-open" class="h-4 w-4"></i> Introducción del Partido
          </h4>
          <p class="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
            ${escapeHtml(summary.introduccionPartido)}
          </p>
        </div>

        <!-- Bloque 2: Desglose de Indicadores y Factores Clave -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
          <!-- Total de Carreras / Over-Under -->
          <div class="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 p-3.5">
            <div class="flex items-center gap-2 font-bold text-slate-900 dark:text-white mb-1">
              <i data-lucide="trending-up" class="h-4 w-4 text-emerald-500"></i>
              <span>Línea Over / Under & Probabilidad</span>
            </div>
            <p class="text-slate-600 dark:text-slate-300 leading-normal">${escapeHtml(summary.overUnderText)}</p>
          </div>

          <!-- Duelo de Abridores -->
          <div class="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 p-3.5">
            <div class="flex items-center gap-2 font-bold text-slate-900 dark:text-white mb-1">
              <i data-lucide="user-check" class="h-4 w-4 text-sky-500"></i>
              <span>Duelo de Abridores</span>
            </div>
            <p class="text-slate-600 dark:text-slate-300 leading-normal">${escapeHtml(summary.pitchingMatchupText)}</p>
          </div>

          <!-- Fatiga & Descanso -->
          <div class="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 p-3.5">
            <div class="flex items-center gap-2 font-bold text-slate-900 dark:text-white mb-1">
              <i data-lucide="activity" class="h-4 w-4 text-amber-500"></i>
              <span>Fatiga & Descanso (Bullpen e Itinerario)</span>
            </div>
            <p class="text-slate-600 dark:text-slate-300 leading-normal">${escapeHtml(summary.fatigueText)}</p>
          </div>

          <!-- Clima & Viento Open-Meteo -->
          <div class="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 p-3.5">
            <div class="flex items-center gap-2 font-bold text-slate-900 dark:text-white mb-1">
              <i data-lucide="wind" class="h-4 w-4 text-cyan-500"></i>
              <span>Factor Clima & Viento Open-Meteo</span>
            </div>
            <p class="text-slate-600 dark:text-slate-300 leading-normal">${escapeHtml(summary.weatherParkText)}</p>
          </div>
        </div>
      </div>
    </section>
  `;

  if (window.lucide) window.lucide.createIcons();
}


