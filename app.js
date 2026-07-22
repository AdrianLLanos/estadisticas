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

    await Promise.allSettled(
      state.games.map(async (game) => {
        const previousStatus = state.lineupStatusMap.get(game.gamePk);
        
        // Si el partido ya tiene alineación confirmada, omitir nueva petición a las APIs
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

    if (allConfirmed) {
      stopLineupPolling();
    }

    updateLineupAutoBadge("ok", allConfirmed);
    renderGames();

    if (newlyConfirmedGame) {
      if (state.activeProjection && state.activeProjection.lineupSource === "Ninguno") {
        setStatus(`¡Alineación confirmada detectada (${newlyConfirmedGame.source}) para ${newlyConfirmedGame.game.teams.away.team.name} vs ${newlyConfirmedGame.game.teams.home.team.name}! Actualizando proyecciones...`, "ok");
        compareSelectedGame();
      }
    }
  } catch (err) {
    console.warn("Error en verificación automática de alineaciones:", err);
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
      <span>Auto-Bateadores: Consultando...</span>
    `;
    return;
  }

  if (status === "error") {
    els.lineupAutoBadge.innerHTML = `
      <span class="h-2 w-2 rounded-full bg-rose-500"></span>
      <span>Auto-Bateadores: Error</span>
    `;
    return;
  }

  if (allConfirmed || (totalGames > 0 && confirmedCount === totalGames)) {
    els.lineupAutoBadge.innerHTML = `
      <span class="h-2 w-2 rounded-full bg-emerald-500"></span>
      <span>Auto-Bateadores: ${confirmedCount}/${totalGames} confirmadas (Completo)</span>
    `;
    return;
  }

  els.lineupAutoBadge.innerHTML = `
    <span class="relative flex h-2 w-2">
      <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
      <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
    </span>
    <span>Auto-Bateadores: ${confirmedCount}/${totalGames} confirmadas (3 min)</span>
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

    // Resolve detailed lineup stats (including split & recent AVG)
    const [awayLineupResolved, homeLineupResolved] = await Promise.all([
      resolveLineupStats(awayLineupPlayers, awayRosterMap, awayStats, season, homePitcherMetrics),
      resolveLineupStats(homeLineupPlayers, homeRosterMap, homeStats, season, awayPitcherMetrics),
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
      weather,
    });

    projection.awayBullpenRoster = awayBullpenRoster;
    projection.homeBullpenRoster = homeBullpenRoster;
    projection.awayLineup = awayLineupResolved;
    projection.homeLineup = homeLineupResolved;
    projection.lineupSource = lineupSource;

    state.activeProjection = projection;

    renderSummary(projection);
    renderPitchers(projection);
    renderTeamStats(projection);
    renderBullpens(projection);
    renderLineups(projection);
    renderResults(projection);
    renderPredictor(projection);
    els.sourceBadge.textContent = espnPitchers.away || espnPitchers.home ? "MLB + ESPN pitchers" : "MLB";
    setStatus("Comparación actualizada.", "ok");
  } catch (error) {
    setStatus(error.message || "No se pudo calcular la comparación.", "error");
  } finally {
    setBusy(false);
  }
}

function buildProjection({ game, awayStats, homeStats, awayPitcher, homePitcher, awayRecent, homeRecent, awaySplits, homeSplits, espnEvent, weather }) {
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

  const awayPitcherMetrics = calcularMetricasPitcher(awayPitcher);
  const homePitcherMetrics = calcularMetricasPitcher(homePitcher);
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
  });
  const homeSplitBaseRuns = calcularBaseCarrerasPorSplit({
    offenseSplit: homeTeamProfile.splits.home,
    defenseSplit: awayTeamProfile.splits.away,
    offenseFallbackSplit: homeTeamProfile.splits.all,
    defenseFallbackSplit: awayTeamProfile.splits.all,
  });
  const awayRunsBase = proyectarCarrerasEquipo({
    splitBaseRuns: awaySplitBaseRuns,
    opponentPitcher: homePitcherMetrics,
    opponentBullpen: homeBullpen,
    recentForm: awayForm,
    matchup: awayMatchup,
    last10Metrics: awayLast10Metrics,
  });
  const homeRunsBase = proyectarCarrerasEquipo({
    splitBaseRuns: homeSplitBaseRuns,
    opponentPitcher: awayPitcherMetrics,
    opponentBullpen: awayBullpen,
    recentForm: homeForm,
    matchup: homeMatchup,
    last10Metrics: homeLast10Metrics,
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

  // Proyecciones base de carreras y hits
  const calibratedAwayRuns = clamp(awayRuns, 2.0, 8.5);
  const calibratedHomeRuns = clamp(homeRuns, 2.0, 8.5);
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
  const finalPoisson = calcularMatrizPoisson(calibratedAwayRuns, calibratedHomeRuns, targetLine, awayRecentRuns, homeRecentRuns);

  // Over/Under lean and probability
  let totalLean = "";
  let totalProb = 0;
  if (odds.overUnder) {
    if (finalPoisson.overProb >= 0.525) {
      totalLean = `Over ${targetLine}`;
      totalProb = finalPoisson.overProb;
    } else if (finalPoisson.underProb >= 0.525) {
      totalLean = `Under ${targetLine}`;
      totalProb = finalPoisson.underProb;
    } else {
      totalLean = `Cerca de ${targetLine}`;
      totalProb = Math.max(finalPoisson.overProb, finalPoisson.underProb);
    }
  } else {
    if (calibratedTotalRuns >= 8.9) {
      totalLean = "Over estimado";
      totalProb = finalPoisson.overProb;
    } else if (calibratedTotalRuns <= 7.4) {
      totalLean = "Under estimado";
      totalProb = finalPoisson.underProb;
    } else {
      totalLean = "Total medio";
      totalProb = Math.max(finalPoisson.overProb, finalPoisson.underProb);
    }
  }

  // Run Line handicap pick and probability
  let runLinePick = "";
  let runLineProb = 0;
  if (probability.favorite === "home") {
    if (finalPoisson.homeMinus1_5Prob >= 0.46) {
      runLinePick = `${homeTeam.name} -1.5`;
      runLineProb = finalPoisson.homeMinus1_5Prob;
    } else {
      runLinePick = `${awayTeam.name} +1.5`;
      runLineProb = 1 - finalPoisson.homeMinus1_5Prob;
    }
  } else {
    if (finalPoisson.awayMinus1_5Prob >= 0.46) {
      runLinePick = `${awayTeam.name} -1.5`;
      runLineProb = finalPoisson.awayMinus1_5Prob;
    } else {
      runLinePick = `${homeTeam.name} +1.5`;
      runLineProb = 1 - finalPoisson.awayMinus1_5Prob;
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

  // EVALUAR RESULTADO REAL PARA PARTIDOS FINALIZADOS (FEEDBACK LOOP)


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
    diff,
    favorite,
    winProbability,
    runLinePick,
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
  const metrics = {
    era: fallback(pitcher?.era, LEAGUE.era),
    whip: fallback(pitcher?.whip, LEAGUE.whip),
    innings,
    hits: numberOr(pitcher?.hits, (LEAGUE.pitcherHits9 * innings) / 9),
    runs: numberOr(pitcher?.runs, (LEAGUE.runsPerGame * innings) / 9),
    earnedRuns: numberOr(pitcher?.earnedRuns, (LEAGUE.era * innings) / 9),
    strikeouts: numberOr(pitcher?.strikeouts, (LEAGUE.pitcherK9 * innings) / 9),
    walks: numberOr(pitcher?.walks, (LEAGUE.pitcherBb9 * innings) / 9),
    homeRuns: numberOr(pitcher?.homeRuns, (LEAGUE.pitcherHr9 * innings) / 9),
    k9: fallback(pitcher?.k9, LEAGUE.pitcherK9),
    bb9: fallback(pitcher?.bb9, LEAGUE.pitcherBb9),
    hr9: fallback(pitcher?.hr9, LEAGUE.pitcherHr9),
    hitsPerNine: fallback(pitcher?.hitsPerNine, LEAGUE.pitcherHits9),
    inningsPerStart: fallback(pitcher?.inningsPerStart, LEAGUE.starterInnings),
    wins: numberOr(pitcher?.wins, 0),
    losses: numberOr(pitcher?.losses, 0),
    throws: pitcher?.throws || pitcher?.pitchHand || "",
    hand,
    recentStarts: numberOr(recent.count, 0),
    recentRuns,
    recentHits,
  };
  const score =
    normalizeLower(metrics.era, 2.4, 6.2) * 0.22 +
    normalizeLower(metrics.whip, 0.95, 1.65) * 0.18 +
    normalizeHigher(metrics.k9, 5.5, 11.8) * 0.14 +
    normalizeLower(metrics.bb9, 1.4, 5.0) * 0.1 +
    normalizeLower(metrics.hr9, 0.55, 1.95) * 0.1 +
    normalizeLower(metrics.hitsPerNine, 6.2, 10.8) * 0.08 +
    normalizeHigher(metrics.inningsPerStart, 3.8, 6.6) * 0.08 +
    normalizeLower(recentRuns, 1.1, 4.8) * 0.07 +
    normalizeLower(recentHits, 3.4, 8.4) * 0.03;

  return { ...metrics, score: clamp(score, 0, 1), label: scoreLabel(score) };
}

function calcularOfensivaEquipo(team = {}, opponentHand = "R", last10Metrics = null) {
  const splitOps = opponentHand === "L" ? team.opsVsLeft : team.opsVsRight;
  let runsPerGame = fallback(team.runsPerGame, LEAGUE.runsPerGame);
  let hitsPerGame = fallback(team.hitsPerGame, LEAGUE.hitsPerGame);
  let slg = fallback(team.slg, LEAGUE.slg);
  let homeRunsPerGame = fallback(team.homeRunsPerGame, LEAGUE.homeRunsPerGame);

  if (last10Metrics && last10Metrics.games > 0) {
    runsPerGame = 0.70 * runsPerGame + 0.30 * last10Metrics.runsForPerGame;
    hitsPerGame = 0.70 * hitsPerGame + 0.30 * last10Metrics.hitsPerGame;
    if (last10Metrics.slg) slg = 0.70 * slg + 0.30 * last10Metrics.slg;
    if (last10Metrics.homeRunsPerGame) homeRunsPerGame = 0.70 * homeRunsPerGame + 0.30 * last10Metrics.homeRunsPerGame;
  }

  const metrics = {
    runsPerGame,
    hitsPerGame,
    ops: fallback(splitOps, fallback(team.ops, LEAGUE.ops)),
    obp: fallback(team.obp, LEAGUE.obp),
    slg,
    battingAverage: fallback(team.battingAverage, LEAGUE.battingAverage),
    strikeoutsPerGame: fallback(team.strikeoutsPerGame, LEAGUE.strikeoutsPerGame),
    walksPerGame: fallback(team.walksPerGame, LEAGUE.walksPerGame),
    homeRunsPerGame,
  };
  const score =
    normalizeHigher(metrics.runsPerGame, 3.2, 5.8) * 0.23 +
    normalizeHigher(metrics.ops, 0.63, 0.82) * 0.2 +
    normalizeHigher(metrics.obp, 0.285, 0.355) * 0.13 +
    normalizeHigher(metrics.slg, 0.345, 0.47) * 0.13 +
    normalizeHigher(metrics.hitsPerGame, 6.7, 9.8) * 0.11 +
    normalizeHigher(metrics.walksPerGame, 2.4, 4.2) * 0.07 +
    normalizeHigher(metrics.homeRunsPerGame, 0.65, 1.65) * 0.07 +
    normalizeLower(metrics.strikeoutsPerGame, 6.6, 10.3) * 0.06;

  return { ...metrics, score: clamp(score, 0, 1), label: scoreLabel(score) };
}

function calcularFormaReciente(context = {}) {
  const last10 = context?.last10 || {};
  const metrics = {
    games10: numberOr(last10.games, 0),
    wins10: numberOr(last10.wins, 0),
    runsFor10: fallback(last10.runsForPerGame, LEAGUE.runsPerGame),
    runsAllowed10: fallback(last10.runsAllowedPerGame, LEAGUE.runsPerGame),
    hits10: fallback(last10.hitsPerGame, LEAGUE.hitsPerGame),
    hitsAllowed10: fallback(last10.hitsAllowedPerGame, LEAGUE.hitsPerGame),
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

function calcularBaseCarrerasPorSplit({ offenseSplit, defenseSplit, offenseFallbackSplit, defenseFallbackSplit }) {
  const offenseRuns = firstFinite(
    offenseSplit?.runsForPerGame,
    offenseFallbackSplit?.runsForPerGame,
    LEAGUE.runsPerGame
  );
  const defenseRunsAllowed = firstFinite(
    defenseSplit?.runsAllowedPerGame,
    defenseFallbackSplit?.runsAllowedPerGame,
    LEAGUE.runsAllowedPerGame
  );

  return clamp((offenseRuns + defenseRunsAllowed) / 2, 2.0, 8.5);
}

function proyectarCarrerasEquipo({ splitBaseRuns, opponentPitcher, opponentBullpen, recentForm, matchup, last10Metrics = null }) {
  // Pitcher factor: starting pitcher ERA relative to league average and their score
  const pitcherEraRatio = fallback(opponentPitcher?.era, LEAGUE.era) / LEAGUE.era;
  const pitcherScoreFactor = 1.0 + (0.5 - numberOr(opponentPitcher?.score, 0.5)) * 0.30;
  const pitcherFactor = (pitcherEraRatio * 0.6 + pitcherScoreFactor * 0.4);

  // Bullpen factor: bullpen ERA relative to league average and its score
  const bullpenEraRatio = fallback(opponentBullpen?.era, LEAGUE.era) / LEAGUE.era;
  const bullpenScoreFactor = 1.0 + (0.5 - numberOr(opponentBullpen?.score, 0.5)) * 0.20;
  const bullpenFactor = (bullpenEraRatio * 0.5 + bullpenScoreFactor * 0.5);

  // Recent form factor (residual trend)
  const formFactor = 1.0 + (numberOr(recentForm?.score, 0.5) - 0.5) * 0.20;

  // Matchup factor
  const matchupFactor = 1.0 + (numberOr(matchup?.score, 0.5) - 0.5) * 0.20;

  let baseExpectedRuns = fallback(splitBaseRuns, LEAGUE.runsPerGame);
  if (last10Metrics && last10Metrics.runsForPerGame) {
    baseExpectedRuns = 0.70 * baseExpectedRuns + 0.30 * last10Metrics.runsForPerGame;
  }

  const raw = baseExpectedRuns * pitcherFactor * bullpenFactor * formFactor * matchupFactor;

  return clamp(raw, 2.0, 8.5);
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

  // Model index edge (traditional composite weight)
  const modelEdge = clamp((homeComposite - awayComposite) * 1.35, -0.25, 0.25);
  const compositeHomeProb = clamp(0.5 + modelEdge, 0.25, 0.75);

  // Consolidate the probabilities: 50% solver, 35% Pythagenpat, 15% Composite score
  const homeProb = clamp(poissonHomeProb * 0.50 + pythagenpatHomeProb * 0.35 + compositeHomeProb * 0.15, 0.20, 0.80);
  const favorite = homeProb >= 0.5 ? "home" : "away";

  return {
    favorite,
    value: favorite === "home" ? homeProb : 1 - homeProb,
    homeProb,
    awayComposite,
    homeComposite,
    poissonResult
  };
}

function calcularTotalCarreras(awayRuns, homeRuns) {
  return round1(clamp(awayRuns + homeRuns, 5, 13.5));
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
        const stat = item.person?.stats?.[0]?.splits?.[0]?.stat || {};
        const games = number(stat.gamesPlayed);
        const starts = number(stat.gamesStarted);
        // Include if 0 starts or starts are ≤45% of appearances → reliever
        return games === 0 || starts <= Math.max(1, games * 0.45);
      })
      .map((item) => {
        const person = item.person || {};
        const stat = person.stats?.[0]?.splits?.[0]?.stat || {};
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
        id: player.id || player.espnId || `fb-${index}`,
        name: player.name || "Jugador N/D",
        position: player.position || "",
        ...fallbackVal
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
    
    const hitterHrPerGame = stats.homeRuns / (stats.games || 1);
    const pitcherHr9 = numberOr(opposingPitcher?.hr9, LEAGUE.pitcherHr9);
    const pitcherHrFactor = pitcherHr9 / LEAGUE.pitcherHr9;
    const adjustedHrFactor = 1.0 + (pitcherHrFactor - 1.0) * 0.5;
    const expectedHr = hitterHrPerGame * adjustedHrFactor;
    let hrProb = 1.0 - Math.exp(-expectedHr);
    hrProb = clamp(hrProb, 0.01, 0.45);
    
    return {
      ...stats,
      pBase,
      hrProb,
      splitLabel: `${splitObp.toFixed(3)} vs${opponentHand}`,
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
        lineupBadgeHtml = `<span class="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-350 bg-emerald-100 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800/60"><i data-lucide="check-circle-2" class="h-3 w-3"></i> Lineup ${lineupInfo.source}</span>`;
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

function renderMatchupHeader(game) {
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

  // Render metadata on the top row
  if (els.matchupMetadata) {
    els.matchupMetadata.innerHTML = `
      <div class="flex items-center gap-1.5">
        <i data-lucide="clock" class="h-3.5 w-3.5 text-slate-605 dark:text-slate-300"></i>
        <span class="font-bold text-slate-900 dark:text-white">${time}</span>
      </div>
      <div class="h-3 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block"></div>
      <div class="flex items-start gap-1.5">
        <i data-lucide="map-pin" class="h-3.5 w-3.5 text-slate-605 dark:text-slate-300 mt-0.5"></i>
        <div class="flex flex-col">
          <span class="font-bold uppercase tracking-wider text-slate-900 dark:text-white">${escapeHtml(venue)}</span>
          ${location ? `<span class="text-[9px] sm:text-[10px] text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider mt-0.5">${escapeHtml(location)}</span>` : ""}
        </div>
      </div>
    `;
  }

  // Render full matchups on the bottom row (below the button/metadata)
  els.matchupHeader.innerHTML = `
    <div class="flex items-center justify-center gap-6 sm:gap-12 w-full py-2 relative z-10">
      <!-- Away Team -->
      <div class="flex flex-col items-center text-center max-w-[160px] sm:max-w-[200px]">
        <img src="${awayLogo}" alt="${away}" class="h-12 w-12 sm:h-14 sm:w-14 object-contain img-smooth" onerror="this.style.display='none'" />
        <span class="mt-2 text-sm sm:text-base font-black uppercase text-slate-900 dark:text-white tracking-wider">${escapeHtml(away)}</span>
        <span class="mt-0.5 text-xs sm:text-sm text-slate-700 dark:text-slate-200 font-bold">${escapeHtml(awayRecord)}</span>
      </div>
      
      <!-- @ Circle -->
      <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900">
        <span class="text-xs font-bold text-slate-600 dark:text-slate-300">@</span>
      </div>
      
      <!-- Home Team -->
      <div class="flex flex-col items-center text-center max-w-[160px] sm:max-w-[200px]">
        <img src="${homeLogo}" alt="${home}" class="h-12 w-12 sm:h-14 sm:w-14 object-contain img-smooth" onerror="this.style.display='none'" />
        <span class="mt-2 text-sm sm:text-base font-black uppercase text-slate-900 dark:text-white tracking-wider">${escapeHtml(home)}</span>
        <span class="mt-0.5 text-xs sm:text-sm text-slate-700 dark:text-slate-200 font-bold">${escapeHtml(homeRecord)}</span>
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
    ["Handicap", handicapDisplay, projection.confidence],
  ];

  if (projection.weather) {
    const weather = projection.weather;
    const desc = translateWeatherDescription(weather.description || "Clima");
    const icon = weatherIconFromDescription(desc);
    const weatherLabel = `${icon} ${weather.temperature ?? "N/D"}°C`;
    const rainProbText = (weather.precipitationProbability !== undefined && weather.precipitationProbability !== null) ? ` · Lluvia ${weather.precipitationProbability}%` : "";
    const weatherMeta = `${desc} · Viento ${weather.windSpeed ?? "N/D"} km/h · Humedad ${weather.humidity ?? "N/D"}%${rainProbText}`;
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

  els.teamStatsGrid.innerHTML = `
    <section class="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 shadow-panel dark:shadow-panel-dark">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between px-4 pt-4 pb-3 border-b border-slate-100 dark:border-slate-800 gap-1">
        <div class="flex items-center gap-2">
          <i data-lucide="bar-chart-2" class="h-4 w-4 text-emerald-600 dark:text-emerald-400"></i>
          <h3 class="text-base font-black text-slate-900 dark:text-white">Estadísticas por Equipo (Comparativa)</h3>
        </div>
        <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">General vs Split vs Últimos 10 Juegos</span>
      </div>

      <div class="p-4 grid gap-5 grid-cols-1 lg:grid-cols-3">
        <!-- 1. General (Temporada) -->
        <div class="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 p-3">
          <div class="flex items-center justify-between pb-2 mb-2 border-b border-slate-200 dark:border-slate-800">
            <span class="text-xs font-extrabold uppercase tracking-wide text-slate-700 dark:text-slate-300">General (Temporada)</span>
            <span class="text-[10px] font-bold text-slate-500">162 G Target</span>
          </div>
          ${renderStatsComparisonTable(awayName, homeName, awayLogo, homeLogo, awayOverall, homeOverall)}
        </div>

        <!-- 2. Split (Local / Visitante) -->
        <div class="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 p-3">
          <div class="flex items-center justify-between pb-2 mb-2 border-b border-slate-200 dark:border-slate-800">
            <span class="text-xs font-extrabold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">Split (Visitante / Local)</span>
            <span class="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Por Condición</span>
          </div>
          ${renderStatsComparisonTable(awayName, homeName, awayLogo, homeLogo, awaySplit, homeSplit)}
        </div>

        <!-- 3. Últimos 10 Juegos -->
        <div class="rounded-lg border border-amber-200/80 dark:border-amber-900/50 bg-amber-50/30 dark:bg-amber-950/10 p-3">
          <div class="flex items-center justify-between pb-2 mb-2 border-b border-amber-200 dark:border-amber-900/50">
            <span class="text-xs font-extrabold uppercase tracking-wide text-amber-800 dark:text-amber-300">Últimos 10 Juegos</span>
            <span class="text-[10px] font-bold text-amber-600 dark:text-amber-400">Forma Reciente</span>
          </div>
          ${renderStatsComparisonTable(awayName, homeName, awayLogo, homeLogo, awayLast10, homeLast10)}
        </div>
      </div>
    </section>
  `;

  if (window.lucide) window.lucide.createIcons();
}

function renderStatsComparisonTable(awayName, homeName, awayLogo, homeLogo, awayStats, homeStats) {
  const getNum = (val) => (Number.isFinite(val) && val !== null && val !== undefined ? val : null);

  const awayRuns = getNum(awayStats?.runsPerGame ?? awayStats?.runsForPerGame);
  const homeRuns = getNum(homeStats?.runsPerGame ?? homeStats?.runsForPerGame);

  const awayRA = getNum(awayStats?.runsAllowedPerGame);
  const homeRA = getNum(homeStats?.runsAllowedPerGame);

  const awayDiff = getNum(awayStats?.diff ?? (awayRuns !== null && awayRA !== null ? awayRuns - awayRA : null));
  const homeDiff = getNum(homeStats?.diff ?? (homeRuns !== null && homeRA !== null ? homeRuns - homeRA : null));

  const awayHR = awayStats && Number.isFinite(awayStats.homeRunsTotal) ? awayStats.homeRunsTotal : (awayStats && Number.isFinite(awayStats.homeRunsPerGame) ? Math.round(awayStats.homeRunsPerGame * (awayStats.games || 10)) : null);
  const homeHR = homeStats && Number.isFinite(homeStats.homeRunsTotal) ? homeStats.homeRunsTotal : (homeStats && Number.isFinite(homeStats.homeRunsPerGame) ? Math.round(homeStats.homeRunsPerGame * (homeStats.games || 10)) : null);

  const awayHRPct = awayStats && Number.isFinite(awayStats.hrPct) ? `${awayStats.hrPct.toFixed(1)}%` : "N/D";
  const homeHRPct = homeStats && Number.isFinite(homeStats.hrPct) ? `${homeStats.hrPct.toFixed(1)}%` : "N/D";

  const awaySLG = awayStats && Number.isFinite(awayStats.slg) ? awayStats.slg.toFixed(2) : "N/D";
  const homeSLG = homeStats && Number.isFinite(homeStats.slg) ? homeStats.slg.toFixed(2) : "N/D";

  const awayLOB = awayStats && Number.isFinite(awayStats.lobPct) ? `${awayStats.lobPct.toFixed(1)}%` : "N/D";
  const homeLOB = homeStats && Number.isFinite(homeStats.lobPct) ? `${homeStats.lobPct.toFixed(1)}%` : "N/D";

  const awayBB = awayStats && Number.isFinite(awayStats.bbPct) ? `${awayStats.bbPct.toFixed(1)}%` : "N/D";
  const homeBB = homeStats && Number.isFinite(homeStats.bbPct) ? `${homeStats.bbPct.toFixed(1)}%` : "N/D";

  const rows = [
    { label: "Runs / G", awayVal: awayRuns !== null ? awayRuns.toFixed(2) : "N/D", homeVal: homeRuns !== null ? homeRuns.toFixed(2) : "N/D", isHigherBetter: true, rawA: awayRuns, rawH: homeRuns },
    { label: "RA / G", awayVal: awayRA !== null ? awayRA.toFixed(2) : "N/D", homeVal: homeRA !== null ? homeRA.toFixed(2) : "N/D", isHigherBetter: false, rawA: awayRA, rawH: homeRA },
    { label: "Diff", awayVal: awayDiff !== null ? formatSigned(awayDiff) : "N/D", homeVal: homeDiff !== null ? formatSigned(homeDiff) : "N/D", isHigherBetter: true, rawA: awayDiff, rawH: homeDiff },
    { label: "Homeruns", awayVal: awayHR !== null ? awayHR : "N/D", homeVal: homeHR !== null ? homeHR : "N/D", isHigherBetter: true, rawA: awayHR, rawH: homeHR },
    { label: "HR %", awayVal: awayHRPct, homeVal: homeHRPct, isHigherBetter: true, rawA: awayStats?.hrPct, rawH: homeStats?.hrPct },
    { label: "SLG", awayVal: awaySLG, homeVal: homeSLG, isHigherBetter: true, rawA: awayStats?.slg, rawH: homeStats?.slg },
    { label: "LOB %", awayVal: awayLOB, homeVal: homeLOB, isHigherBetter: true, rawA: awayStats?.lobPct, rawH: homeStats?.lobPct },
    { label: "BB %", awayVal: awayBB, homeVal: homeBB, isHigherBetter: true, rawA: awayStats?.bbPct, rawH: homeStats?.bbPct },
  ];

  return `
    <table class="w-full text-xs">
      <thead>
        <tr class="text-[11px] text-slate-500 dark:text-slate-400 border-b border-slate-200/60 dark:border-slate-800">
          <th class="py-1 text-left font-bold truncate max-w-[75px]">Stats</th>
          <th class="py-1 text-center font-bold">
            <div class="flex items-center justify-center gap-1">
              <img src="${awayLogo}" class="w-3.5 h-3.5 object-contain img-smooth" alt="" />
              <span class="truncate max-w-[70px]">${awayName}</span>
            </div>
          </th>
          <th class="py-1 text-center font-bold">
            <div class="flex items-center justify-center gap-1">
              <img src="${homeLogo}" class="w-3.5 h-3.5 object-contain img-smooth" alt="" />
              <span class="truncate max-w-[70px]">${homeName}</span>
            </div>
          </th>
        </tr>
      </thead>
      <tbody class="divide-y divide-slate-100 dark:divide-slate-800/60 font-semibold">
        ${rows.map(r => {
          const numA = r.rawA !== undefined ? r.rawA : parseFloat(r.awayVal);
          const numH = r.rawH !== undefined ? r.rawH : parseFloat(r.homeVal);
          let aClass = "text-slate-700 dark:text-slate-200";
          let hClass = "text-slate-700 dark:text-slate-200";

          if (Number.isFinite(numA) && Number.isFinite(numH) && numA !== numH) {
            if (r.isHigherBetter) {
              if (numA > numH) aClass = "text-emerald-600 dark:text-emerald-400 font-extrabold";
              else hClass = "text-emerald-600 dark:text-emerald-400 font-extrabold";
            } else {
              if (numA < numH) aClass = "text-emerald-600 dark:text-emerald-400 font-extrabold";
              else hClass = "text-emerald-600 dark:text-emerald-400 font-extrabold";
            }
          }

          return `
            <tr>
              <td class="py-1 text-slate-500 dark:text-slate-400 font-medium">${r.label}</td>
              <td class="py-1 text-center ${aClass}">${r.awayVal ?? "N/D"}</td>
              <td class="py-1 text-center ${hClass}">${r.homeVal ?? "N/D"}</td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>
  `;
}

function formatSigned(val) {
  if (!Number.isFinite(val)) return "0.00";
  return (val > 0 ? "+" : "") + val.toFixed(2);
}

function renderBullpens(projection) {
  const awayTeam = projection.game.teams.away.team;
  const homeTeam = projection.game.teams.home.team;
  const awayRelievers = projection.awayBullpenRoster || [];
  const homeRelievers = projection.homeBullpenRoster || [];

  if (!awayRelievers.length && !homeRelievers.length) return;

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

  const bullpenSection = document.createElement("section");
  bullpenSection.id = "bullpenSection";
  bullpenSection.className = "overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 shadow-panel dark:shadow-panel-dark";
  bullpenSection.innerHTML = `
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
  `;

  // Insert right after the pitcherGrid section
  const existingBullpen = document.getElementById("bullpenSection");
  if (existingBullpen) {
    existingBullpen.replaceWith(bullpenSection);
  } else {
    els.pitcherGrid.insertAdjacentElement("afterend", bullpenSection);
  }
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

      const pBaseStr = hitter.pBase != null ? `${Math.round(hitter.pBase * 100)}%` : "-";
      const pBaseWeight = hitter.pBase >= 0.35 ? "text-emerald-500 font-black" : (hitter.pBase < 0.26 ? "text-rose-500 font-semibold" : "font-bold text-slate-900 dark:text-white");

      const hrStr = hitter.hrProb != null && hitter.hrProb >= 0.005 ? `${(hitter.hrProb * 100).toFixed(1)}%` : "-";
      const hrWeight = hitter.hrProb >= 0.15 ? "text-amber-500 font-black" : "font-bold text-slate-700 dark:text-slate-200";

      return `
        <tr class="odd:bg-white dark:odd:bg-slate-900/10 even:bg-slate-50/50 dark:even:bg-slate-900/30 hover:bg-blue-50/50 dark:hover:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800/80 transition-colors">
          <td class="px-3 py-2 text-center text-slate-500 dark:text-slate-400 font-bold font-mono text-xs">${bo}</td>
          <td class="px-3 py-2 text-left font-semibold text-slate-900 dark:text-white whitespace-nowrap">
            <span class="hover:underline cursor-default">${escapeHtml(hitter.name)}</span>
            ${hitter.position ? `<span class="text-[10px] font-bold text-slate-400 dark:text-slate-500 ml-1.5 uppercase font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">${escapeHtml(hitter.position)}</span>` : ""}
          </td>
          <td class="px-3 py-2 text-center font-mono font-medium text-slate-800 dark:text-slate-200">${avgStr}</td>
          <td class="px-3 py-2 text-center font-mono font-medium text-slate-800 dark:text-slate-200">${obpStr}</td>
          <td class="px-3 py-2 text-center font-mono font-medium text-slate-800 dark:text-slate-200">${splitStr}</td>
          <td class="px-3 py-2 text-center font-mono font-medium ${streakClass}">${streakStr}</td>
          <td class="px-3 py-2 text-center font-mono text-sm ${pBaseWeight}">${pBaseStr}</td>
          <td class="px-3 py-2 text-center font-mono text-sm ${hrWeight}">${hrStr}</td>
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
          <table class="w-full min-w-[700px] text-left text-xs">
            <thead class="bg-slate-50/80 dark:bg-slate-950/20 text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-850">
              <tr>
                <th class="px-3 py-2 text-center w-8">#</th>
                <th class="px-3 py-2 text-left">Bateador</th>
                <th class="px-3 py-2 text-center w-16">AVG</th>
                <th class="px-3 py-2 text-center w-16">OBP</th>
                <th class="px-3 py-2 text-center w-24">Split</th>
                <th class="px-3 py-2 text-center w-24">Racha 14J</th>
                <th class="px-3 py-2 text-center w-20">P(Base)</th>
                <th class="px-3 py-2 text-center w-20">HR%</th>
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
  els.sourceBadge.textContent = "Sin datos";
  const existingBullpen = document.getElementById("bullpenSection");
  if (existingBullpen) existingBullpen.remove();
  
  const lineupSection = document.getElementById("lineupSection");
  if (lineupSection) {
    lineupSection.innerHTML = "";
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

function extractEspnWeather(event) {
  const weather = event?.weather;
  if (!weather) return null;

  let temperature = number(weather.temperature);
  let highTemperature = number(weather.highTemperature || weather.maxTemperature);
  let lowTemperature = number(weather.lowTemperature);
  let windSpeed = number(weather.windSpeed || weather.wind?.speed);
  const description = weather.displayValue || weather.text || weather.shortPhrase || weather.longPhrase || "Clima disponible";
  const windDirection = weather.wind?.direction || weather.wind?.dir || "";
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

function calcularImpactoClima(weather) {
  if (!weather) return 0;

  let impact = 0;
  const description = String(weather.description || "").toLowerCase();
  const temp = number(weather.temperature);
  const wind = number(weather.windSpeed);
  const humidity = number(weather.humidity);

  if (/rain|storm|thunder|snow|showers|drizzle|sleet|hail/.test(description)) {
    impact -= 0.45;
  }
  if (/wind|breezy|blustery/.test(description) || wind >= 25) {
    impact -= 0.18;
  } else if (wind >= 18) {
    impact -= 0.1;
  }
  if (humidity >= 85 && temp >= 75) {
    impact -= 0.08;
  }

  if (temp >= 95) {
    impact += 0.35;
  } else if (temp >= 90) {
    impact += 0.18;
  } else if (temp <= 32) {
    impact -= 0.3;
  } else if (temp <= 40) {
    impact -= 0.15;
  }

  return Math.max(-0.65, Math.min(0.4, impact));
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
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${stadium.latitude}&longitude=${stadium.longitude}&hourly=temperature_2m,relativehumidity_2m,windspeed_10m,precipitation_probability,weathercode&start_date=${startDate}&end_date=${startDate}&timezone=UTC`;
    const data = await fetchJson(url);
    const weather = pickOpenMeteoWeather(data, dateUtc);
    if (!weather) return null;

    const result = {
      temperature: weather.temperature,
      highTemperature: weather.highTemperature,
      lowTemperature: weather.lowTemperature,
      description: weather.description,
      windSpeed: weather.windSpeed,
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
  return {
    temperature: number(temperatures[index]),
    highTemperature: number(highTemperature),
    lowTemperature: number(lowTemperature),
    windSpeed: number(windSpeeds[index]),
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

  // Platoon split adjustment for opposing pitcher hand
  const splitFactor = opponentHand === "L" ? (fallback(team?.opsVsLeft, team?.ops) || LEAGUE.ops) / LEAGUE.ops : (fallback(team?.opsVsRight, team?.ops) || LEAGUE.ops) / LEAGUE.ops;
  const platoonFactor = 1.0 + (splitFactor - 1.0) * 0.08;

  // Sabermetric multiplicative projection
  let raw = baseExpectedHits * pitcherFactor * formFactor * baFactor * platoonFactor;

  return clamp(raw, 5.0, 12.0);
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

function calcularMatrizPoisson(awayRuns, homeRuns, overUnderLine, awayRecentRuns, homeRecentRuns) {
  let homeWinProb = 0;
  let awayWinProb = 0;
  let overProb = 0;
  let underProb = 0;
  let homeMinus1_5Prob = 0;
  let awayMinus1_5Prob = 0;

  const MAX_RUNS = 18;

  const awayDist = obtenerDistribucion(awayRuns, awayRecentRuns);
  const homeDist = obtenerDistribucion(homeRuns, homeRecentRuns);

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

function obtenerDistribucion(mean, recentValues) {
  if (recentValues && recentValues.length >= 2) {
    const avg = average(recentValues);
    if (avg > 0) {
      const sumSqDiff = recentValues.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0);
      const variance = sumSqDiff / (recentValues.length - 1);
      if (variance > avg) {
        const dispersion = variance / avg;
        const projectedVariance = dispersion * mean;
        const r = (mean * mean) / (projectedVariance - mean);
        const p = (projectedVariance - mean) / projectedVariance;
        return { type: "NegativeBinomial", r, p, mean, variance: projectedVariance };
      }
    }
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


