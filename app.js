const MLB_BASE = "https://statsapi.mlb.com/api/v1";
const ESPN_SCOREBOARD = "https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/scoreboard";
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

const state = {
  games: [],
  espnEvents: [],
  selectedGamePk: null,
  teamStats: new Map(),
  pitcherStats: new Map(),
  recentContexts: new Map(),
};

const els = {
  dateInput: document.querySelector("#dateInput"),
  loadBtn: document.querySelector("#loadBtn"),
  compareBtn: document.querySelector("#compareBtn"),
  gamesList: document.querySelector("#gamesList"),
  gameCount: document.querySelector("#gameCount"),
  matchupHeader: document.querySelector("#matchupHeader"),
  statusBox: document.querySelector("#statusBox"),
  summaryGrid: document.querySelector("#summaryGrid"),
  pitcherGrid: document.querySelector("#pitcherGrid"),
  resultsBody: document.querySelector("#resultsBody"),
  sourceBadge: document.querySelector("#sourceBadge"),
};

document.addEventListener("DOMContentLoaded", () => {
  els.dateInput.value = toDateInputValue(new Date());
  els.loadBtn.addEventListener("click", loadSlate);
  els.compareBtn.addEventListener("click", compareSelectedGame);
  if (window.lucide) window.lucide.createIcons();
  loadSlate();
});

async function loadSlate() {
  setBusy(true, "Cargando partidos de la jornada...");
  clearResults();

  try {
    const date = els.dateInput.value || toDateInputValue(new Date());
    const [mlbResult, espnResult] = await Promise.allSettled([
      fetchJson(`${MLB_BASE}/schedule?sportId=1&date=${date}&hydrate=team,probablePitcher`),
      fetchJson(`${ESPN_SCOREBOARD}?dates=${date.replaceAll("-", "")}`),
    ]);

    if (mlbResult.status !== "fulfilled") {
      throw new Error("MLB Stats API no respondió correctamente.");
    }

    state.games = mlbResult.value?.dates?.[0]?.games || [];
    state.espnEvents = espnResult.status === "fulfilled" ? espnResult.value?.events || [] : [];
    state.selectedGamePk = state.games[0]?.gamePk || null;

    renderGames();
    renderMatchupHeader(getSelectedGame());
    els.compareBtn.disabled = !state.selectedGamePk;

    if (!state.games.length) {
      setStatus("No hay partidos MLB para la fecha seleccionada.", "warn");
      return;
    }

    const espnNote = state.espnEvents.length ? "ESPN conectado" : "ESPN sin respuesta";
    setStatus(`${state.games.length} partidos cargados. ${espnNote}.`, "ok");
  } catch (error) {
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

  const away = game.teams.away.team;
  const home = game.teams.home.team;
  setBusy(true, `Calculando ${away.name} vs ${home.name}...`);

  try {
    const espnEvent = findEspnEvent(game);
    const espnPitchers = extractEspnPitchers(espnEvent);
    const season = String(game.season || new Date(game.gameDate || Date.now()).getFullYear());
    const referenceDate = game.officialDate || toDateInputValue(new Date(game.gameDate || Date.now()));
    const [awayStats, homeStats, awayMlbPitcher, homeMlbPitcher, awayRecent, homeRecent] = await Promise.all([
      getTeamStats(away.id),
      getTeamStats(home.id),
      getPitcherStats(game.teams.away.probablePitcher?.id, season),
      getPitcherStats(game.teams.home.probablePitcher?.id, season),
      getTeamRecentContext(away.id, referenceDate, game.teams.away.probablePitcher?.id),
      getTeamRecentContext(home.id, referenceDate, game.teams.home.probablePitcher?.id),
    ]);

    const awayPitcher = mergePitcherSources(espnPitchers.away, awayMlbPitcher, game.teams.away.probablePitcher);
    const homePitcher = mergePitcherSources(espnPitchers.home, homeMlbPitcher, game.teams.home.probablePitcher);
    const projection = buildProjection({
      game,
      awayStats,
      homeStats,
      awayPitcher,
      homePitcher,
      awayRecent,
      homeRecent,
      espnEvent,
    });

    renderSummary(projection);
    renderPitchers(projection);
    renderResults(projection);
    els.sourceBadge.textContent = espnPitchers.away || espnPitchers.home ? "MLB + ESPN pitchers" : "MLB";
    setStatus("Comparación actualizada.", "ok");
  } catch (error) {
    setStatus(error.message || "No se pudo calcular la comparación.", "error");
  } finally {
    setBusy(false);
  }
}

function buildProjection({ game, awayStats, homeStats, awayPitcher, homePitcher, awayRecent, homeRecent, espnEvent }) {
  const awayTeam = game.teams.away.team;
  const homeTeam = game.teams.home.team;
  const awayName = shortName(awayTeam.name);
  const homeName = shortName(homeTeam.name);

  const odds = extractEspnOdds(espnEvent);
  const weather = extractEspnWeather(espnEvent);
  const espnRecords = extractEspnTeamRecords(espnEvent);
  awayStats = { ...awayStats, ...espnRecords.away };
  homeStats = { ...homeStats, ...espnRecords.home };
  const awayPitcherMetrics = calcularMetricasPitcher(awayPitcher);
  const homePitcherMetrics = calcularMetricasPitcher(homePitcher);
  const awayOffense = calcularOfensivaEquipo(awayStats);
  const homeOffense = calcularOfensivaEquipo(homeStats);
  const awayForm = calcularFormaReciente(awayRecent);
  const homeForm = calcularFormaReciente(homeRecent);
  const awayBullpen = calcularBullpenAproximado(awayRecent?.bullpen);
  const homeBullpen = calcularBullpenAproximado(homeRecent?.bullpen);
  const awayLocalia = calcularVentajaLocalia(awayStats, awayRecent, false);
  const homeLocalia = calcularVentajaLocalia(homeStats, homeRecent, true);
  const awayMatchup = calcularMatchup(awayOffense, homePitcherMetrics, homeBullpen, awayForm);
  const homeMatchup = calcularMatchup(homeOffense, awayPitcherMetrics, awayBullpen, homeForm);
  const awayRunsBase = proyectarCarrerasEquipo({
    teamStats: awayStats,
    opponentStats: homeStats,
    offense: awayOffense,
    opponentPitcher: homePitcherMetrics,
    opponentBullpen: homeBullpen,
    recentForm: awayForm,
    localia: awayLocalia,
    matchup: awayMatchup,
    isHome: false,
  });
  const homeRunsBase = proyectarCarrerasEquipo({
    teamStats: homeStats,
    opponentStats: awayStats,
    offense: homeOffense,
    opponentPitcher: awayPitcherMetrics,
    opponentBullpen: awayBullpen,
    recentForm: homeForm,
    localia: homeLocalia,
    matchup: homeMatchup,
    isHome: true,
  });
  const weatherAdjustment = calcularImpactoClima(weather);
  const awayRuns = awayRunsBase + weatherAdjustment / 2;
  const homeRuns = homeRunsBase + weatherAdjustment / 2;
  const totalRuns = calcularTotalCarreras(awayRuns, homeRuns);
  const awayHits = proyectarHitsEquipo(awayStats, homeStats, homePitcherMetrics, awayForm);
  const homeHits = proyectarHitsEquipo(homeStats, awayStats, awayPitcherMetrics, homeForm);
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
  const probability = calcularProbabilidadGanador({
    awayRuns,
    homeRuns,
    awayScores: { pitcher: awayPitcherMetrics, offense: awayOffense, form: awayForm, bullpen: awayBullpen, localia: awayLocalia, matchup: awayMatchup },
    homeScores: { pitcher: homePitcherMetrics, offense: homeOffense, form: homeForm, bullpen: homeBullpen, localia: homeLocalia, matchup: homeMatchup },
  });
  const diff = round1(homeRuns - awayRuns);
  const favorite = probability.favorite === "home" ? homeName : awayName;
  const underdog = probability.favorite === "home" ? awayName : homeName;
  const winProbability = probability.value;

  // Run Poisson solver using the sportsbook line or standard 8.5
  const targetLine = odds.overUnder || 8.5;
  const finalPoisson = calcularMatrizPoisson(awayRuns, homeRuns, targetLine);

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
    if (totalRuns >= 8.9) {
      totalLean = "Over estimado";
      totalProb = finalPoisson.overProb;
    } else if (totalRuns <= 7.4) {
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
      runLinePick = `${homeName} -1.5`;
      runLineProb = finalPoisson.homeMinus1_5Prob;
    } else {
      runLinePick = `${awayName} +1.5`;
      runLineProb = 1 - finalPoisson.homeMinus1_5Prob;
    }
  } else {
    if (finalPoisson.awayMinus1_5Prob >= 0.46) {
      runLinePick = `${awayName} -1.5`;
      runLineProb = finalPoisson.awayMinus1_5Prob;
    } else {
      runLinePick = `${homeName} +1.5`;
      runLineProb = 1 - finalPoisson.awayMinus1_5Prob;
    }
  }

  // Confidence calculations based on Poisson/Sabermetric probabilities
  let confidence = "Baja";
  if (winProbability >= 0.62) confidence = "Alta";
  else if (winProbability >= 0.55) confidence = "Media";

  let totalConfidence = "Baja";
  if (totalProb >= 0.58) totalConfidence = "Alta";
  else if (totalProb >= 0.53) totalConfidence = "Media";

  let handicapConfidence = "Baja";
  if (runLineProb >= 0.58) handicapConfidence = "Alta";
  else if (runLineProb >= 0.53) handicapConfidence = "Media";

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
    totalRuns,
  });
  const finalPick = generarPronosticoFinal({
    ganador: favorite,
    probabilidadGanador: Math.round(winProbability * 100),
    carrerasEquipoVisitante: round1(awayRuns),
    carrerasEquipoLocal: round1(homeRuns),
    totalCarreras: totalRuns,
    recomendacionTotal: totalLean,
    handicap: runLinePick,
    hitsTotales: totalHits,
    confianza: confidence,
    marcadorEstimado: `${awayName} ${Math.max(1, Math.round(awayRuns))} - ${homeName} ${Math.max(1, Math.round(homeRuns))}`,
    explicacion: explanation,
  });

  return {
    ...finalPick,
    game,
    awayName,
    homeName,
    awayRuns: round1(awayRuns),
    homeRuns: round1(homeRuns),
    awayHits: round1(awayHits),
    homeHits: round1(homeHits),
    totalRuns,
    totalHits,
    weather,
    diff,
    favorite,
    winProbability,
    runLinePick,
    totalLean,
    confidence,
    totalConfidence,
    odds,
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
        base: explanation[0] || `Carreras: ${awayName} ${round1(awayRuns)} - ${homeName} ${round1(homeRuns)}`,
      },
      {
        market: "Total carreras",
        pick: totalLean,
        estimate: `${totalRuns.toFixed(1)} runs`,
        confidence: totalConfidence,
        base: odds.overUnder
          ? `Línea de ESPN: ${odds.overUnder} (Prob del pick: ${Math.round(totalProb * 100)}% por Poisson)`
          : `Total estimado: ${totalRuns.toFixed(1)} (Prob del pick: ${Math.round(totalProb * 100)}% por Poisson)`,
      },
      {
        market: "Handicap",
        pick: runLinePick,
        estimate: `Prob: ${Math.round(runLineProb * 100)}%`,
        confidence: handicapConfidence,
        base: `Diferencia proyectada de carreras: ${diff > 0 ? '+' : ''}${diff}. Calculado vía Poisson.`,
      },
      {
        market: "Hits totales",
        pick: hitsLean,
        estimate: `${totalHits.toFixed(1)} H`,
        confidence: hitsConfidence,
        base: `${awayName} ${round1(awayHits)} H, ${homeName} ${round1(homeHits)} H (Prob del pick: ${Math.round(hitsProb * 100)}% por Poisson contra línea 16.5)`,
      },
      ...(weather
        ? [
            {
              market: "Clima",
              pick: `${weather.temperature}°C ${weather.description}`,
              estimate: weather.highTemperature ? `Máx ${weather.highTemperature}°` : "N/D",
              confidence: "Media",
              base: weather.link ? "Datos ESPN" : "Clima obtenido de ESPN",
            },
          ]
        : []),
      {
        market: "Marcador estimado",
        pick: finalPick.marcadorEstimado,
        estimate: `${totalRuns.toFixed(1)} carreras`,
        confidence: "Referencia",
        base: explanation.slice(1, 3).join(" "),
      },
    ],
  };
}

function calcularMetricasPitcher(pitcher = {}) {
  const innings = fallback(pitcher?.innings, LEAGUE.starterInnings * 8);
  const recent = pitcher?.recentStarts || {};
  const recentRuns = Number.isFinite(recent.runsAllowedPerStart) ? recent.runsAllowedPerStart : LEAGUE.runsPerGame * 0.55;
  const recentHits = Number.isFinite(recent.hitsAllowedPerStart) ? recent.hitsAllowedPerStart : LEAGUE.hitsPerGame * 0.55;
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

function calcularOfensivaEquipo(team = {}) {
  const metrics = {
    runsPerGame: fallback(team.runsPerGame, LEAGUE.runsPerGame),
    hitsPerGame: fallback(team.hitsPerGame, LEAGUE.hitsPerGame),
    ops: fallback(team.ops, LEAGUE.ops),
    obp: fallback(team.obp, LEAGUE.obp),
    slg: fallback(team.slg, LEAGUE.slg),
    battingAverage: fallback(team.battingAverage, LEAGUE.battingAverage),
    strikeoutsPerGame: fallback(team.strikeoutsPerGame, LEAGUE.strikeoutsPerGame),
    walksPerGame: fallback(team.walksPerGame, LEAGUE.walksPerGame),
    homeRunsPerGame: fallback(team.homeRunsPerGame, LEAGUE.homeRunsPerGame),
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

function proyectarCarrerasEquipo({ teamStats, opponentStats, offense, opponentPitcher, opponentBullpen, recentForm, localia, matchup, isHome }) {
  const teamOffenseRPG = fallback(teamStats?.runsPerGame, LEAGUE.runsPerGame);
  const opponentDefenseRPG = fallback(opponentStats?.runsAllowedPerGame, LEAGUE.runsAllowedPerGame);
  
  // Base expectation combining team offense and opponent defense relative to league average
  const baseExpectedRuns = (teamOffenseRPG * opponentDefenseRPG) / LEAGUE.runsPerGame;

  // Pitcher factor: starting pitcher ERA relative to league average and their score
  const pitcherEraRatio = fallback(opponentPitcher?.era, LEAGUE.era) / LEAGUE.era;
  const pitcherScoreFactor = 1.0 + (0.5 - numberOr(opponentPitcher?.score, 0.5)) * 0.30;
  const pitcherFactor = (pitcherEraRatio * 0.6 + pitcherScoreFactor * 0.4);

  // Bullpen factor: bullpen ERA relative to league average and its score
  const bullpenEraRatio = fallback(opponentBullpen?.era, LEAGUE.era) / LEAGUE.era;
  const bullpenScoreFactor = 1.0 + (0.5 - numberOr(opponentBullpen?.score, 0.5)) * 0.20;
  const bullpenFactor = (bullpenEraRatio * 0.5 + bullpenScoreFactor * 0.5);

  // Recent form factor: recent runs scored and team score relative to average
  const recentRunsRPG = fallback(recentForm?.runsFor10, LEAGUE.runsPerGame);
  const formFactor = 1.0 + (recentRunsRPG / LEAGUE.runsPerGame - 1.0) * 0.25 + (numberOr(recentForm?.score, 0.5) - 0.5) * 0.20;

  // Matchup factor
  const matchupFactor = 1.0 + (numberOr(matchup?.score, 0.5) - 0.5) * 0.20;

  // Home/Away field advantage factor
  const localiaFactor = localia?.score ? localia.score / (isHome ? 0.53 : 0.47) : 1.0;

  // Sabermetric multiplicative projection
  let raw = baseExpectedRuns * pitcherFactor * bullpenFactor * formFactor * matchupFactor * localiaFactor;

  return clamp(raw, 2.0, 8.5);
}

function calcularProbabilidadGanador({ awayRuns, homeRuns, awayScores, homeScores }) {
  const weights = { pitcher: 0.3, offense: 0.25, form: 0.15, bullpen: 0.15, localia: 0.05, matchup: 0.1 };
  const awayComposite = weightedTeamScore(awayScores, weights);
  const homeComposite = weightedTeamScore(homeScores, weights);
  
  // Calculate winning probability via Pythagenpat
  const pythagenpatHomeProb = pythagoreanWinProb(awayRuns, homeRuns);
  
  // Calculate winning probability via Poisson distribution
  const poissonResult = calcularMatrizPoisson(awayRuns, homeRuns, LEAGUE.totalRunsLine);
  const poissonHomeProb = poissonResult.homeWinProb;

  // Model index edge (traditional composite weight)
  const modelEdge = clamp((homeComposite - awayComposite) * 1.35, -0.25, 0.25);
  const compositeHomeProb = clamp(0.5 + modelEdge, 0.25, 0.75);

  // Consolidate the probabilities: 50% Poisson, 35% Pythagenpat, 15% Composite score
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
  const awayHits = proyectarHitsEquipo(awayStats, homeStats, homePitcher, awayForm);
  const homeHits = proyectarHitsEquipo(homeStats, awayStats, awayPitcher, homeForm);
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

async function getTeamRecentContext(teamId, referenceDate, probablePitcherId) {
  const cacheKey = `${teamId}-${referenceDate}-${probablePitcherId || "na"}`;
  if (state.recentContexts.has(cacheKey)) return state.recentContexts.get(cacheKey);

  try {
    const end = addDays(referenceDate, -1);
    const start = addDays(referenceDate, -24);
    const schedule = await fetchJson(`${MLB_BASE}/schedule?sportId=1&teamId=${teamId}&startDate=${start}&endDate=${end}&hydrate=team,linescore`);
    const games = (schedule.dates || [])
      .flatMap((date) => date.games || [])
      .filter((game) => game.status?.abstractGameState === "Final")
      .slice(-10);
    const boxscores = await Promise.allSettled(games.map((game) => fetchJson(`${MLB_BASE}/game/${game.gamePk}/boxscore`)));
    const parsedGames = [];
    const bullpenGames = [];

    games.forEach((game, index) => {
      const boxscore = boxscores[index].status === "fulfilled" ? boxscores[index].value : null;
      const parsed = parseRecentTeamGame(game, boxscore, teamId);
      if (!parsed) return;
      parsedGames.push(parsed);
      bullpenGames.push(parsed.bullpen);
    });

    const roster = await getActivePitchers(teamId, probablePitcherId);
    const context = {
      games: parsedGames,
      last10: aggregateRecentGames(parsedGames),
      bullpen: aggregateBullpenGames(bullpenGames, referenceDate, roster.relieversAvailable),
      homeWinRate: locationWinRate(parsedGames, true),
      awayWinRate: locationWinRate(parsedGames, false),
    };
    state.recentContexts.set(cacheKey, context);
    return context;
  } catch {
    const neutral = {
      games: [],
      last10: aggregateRecentGames([]),
      bullpen: aggregateBullpenGames([], referenceDate, 7),
      homeWinRate: 0.5,
      awayWinRate: 0.5,
    };
    state.recentContexts.set(cacheKey, neutral);
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
  };
}

function parseBullpenFromBoxscore(teamBlock, officialDate) {
  const pitcherIds = teamBlock?.pitchers || [];
  const starterId = pitcherIds[0];
  const result = {
    date: officialDate,
    innings: 0,
    runs: 0,
    earnedRuns: 0,
    hits: 0,
    walks: 0,
    pitches: 0,
    relieversUsed: 0,
    relieverIds: [],
  };

  pitcherIds.slice(1).forEach((pitcherId) => {
    if (!pitcherId || pitcherId === starterId) return;
    const player = teamBlock.players?.[`ID${pitcherId}`];
    const pitching = player?.stats?.pitching;
    const innings = inningsToNumber(pitching?.inningsPitched);
    if (!innings) return;
    result.innings += innings;
    result.runs += number(pitching.runs);
    result.earnedRuns += number(pitching.earnedRuns);
    result.hits += number(pitching.hits);
    result.walks += number(pitching.baseOnBalls);
    result.pitches += number(pitching.pitchesThrown);
    result.relieversUsed += 1;
    result.relieverIds.push(pitcherId);
  });

  return result;
}

function aggregateRecentGames(games) {
  const count = games.length;
  if (!count) {
    return {
      games: 0,
      wins: 0,
      losses: 0,
      runsForPerGame: LEAGUE.runsPerGame,
      runsAllowedPerGame: LEAGUE.runsPerGame,
      hitsPerGame: LEAGUE.hitsPerGame,
      overRate: 0.5,
    };
  }

  return {
    games: count,
    wins: games.filter((game) => game.win).length,
    losses: games.filter((game) => !game.win).length,
    runsForPerGame: average(games.map((game) => game.runsFor)),
    runsAllowedPerGame: average(games.map((game) => game.runsAllowed)),
    hitsPerGame: average(games.map((game) => game.hits)),
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

  const data = await fetchJson(`${MLB_BASE}/teams/${teamId}/stats?stats=season&group=hitting,pitching`);
  const hitting = data.stats?.find((item) => item.group?.displayName === "hitting")?.splits?.[0]?.stat || {};
  const pitching = data.stats?.find((item) => item.group?.displayName === "pitching")?.splits?.[0]?.stat || {};
  const games = number(hitting.gamesPlayed) || number(pitching.gamesPlayed) || 1;
  const innings = inningsToNumber(pitching.inningsPitched);
  const pitchingGames = number(pitching.gamesPlayed) || games;
  const earnedRuns = number(pitching.earnedRuns);
  const allowedRuns = number(pitching.runs) || earnedRuns * 1.08;

  const normalized = {
    games,
    runsPerGame: number(hitting.runs) / games,
    hitsPerGame: number(hitting.hits) / games,
    battingAverage: number(hitting.avg),
    obp: number(hitting.obp),
    slg: number(hitting.slg),
    ops: number(hitting.ops),
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

  state.teamStats.set(teamId, normalized);
  return normalized;
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
    state.pitcherStats.set(cacheKey, normalized);
    return normalized;
  } catch {
    state.pitcherStats.set(cacheKey, null);
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
      name: mlbProbable?.fullName || "Pitcher N/D",
      shortName: mlbProbable?.fullName || "Pitcher N/D",
      headshot: "",
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
  els.gameCount.textContent = state.games.length;

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
      return `
        <button
          class="mb-2 w-full rounded-lg border px-3 py-3 text-left transition ${
            selected
              ? "border-emerald-500 bg-emerald-50 shadow-sm"
              : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
          }"
          type="button"
          data-game-pk="${game.gamePk}"
        >
          <div class="flex items-center justify-between gap-3">
            <span class="text-xs font-bold uppercase tracking-wide text-slate-500">${time}</span>
            <span class="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">${status}</span>
          </div>
          <div class="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-sm font-bold text-slate-950">
            <span class="truncate">${away.name}</span>
            <span class="text-slate-400">@</span>
            <span class="truncate text-right">${home.name}</span>
          </div>
          <div class="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-500">
            <span class="truncate">${awayPitcherName}</span>
            <span class="truncate text-right">${homePitcherName}</span>
          </div>
        </button>
      `;
    })
    .join("");

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
}

function renderMatchupHeader(game) {
  if (!game) {
    els.matchupHeader.innerHTML = `
      <p class="text-sm font-semibold text-slate-500">Selecciona un partido</p>
      <h2 class="mt-1 text-2xl font-bold text-slate-950">Sin comparación</h2>
    `;
    return;
  }

  const away = game.teams.away.team.name;
  const home = game.teams.home.team.name;
  const venue = game.venue?.name || "Estadio N/D";
  els.matchupHeader.innerHTML = `
    <p class="text-sm font-semibold text-slate-500">${formatTime(game.gameDate)} · ${venue}</p>
    <h2 class="mt-1 text-2xl font-bold text-slate-950">${away} @ ${home}</h2>
  `;
}

function renderSummary(projection) {
  const cards = [
    ["Ganador", projection.favorite, `${Math.round(projection.winProbability * 100)}%`],
    ["Carreras", projection.totalRuns.toFixed(1), `${projection.awayName} ${projection.awayRuns} · ${projection.homeName} ${projection.homeRuns}`],
    ["Hits", projection.totalHits.toFixed(1), `${projection.awayName} ${projection.awayHits} · ${projection.homeName} ${projection.homeHits}`],
    ["Handicap", projection.runLinePick, projection.confidence],
  ];

  els.summaryGrid.innerHTML = cards
    .map(
      ([label, value, meta]) => `
        <article class="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p class="text-xs font-bold uppercase tracking-wide text-slate-500">${label}</p>
          <p class="mt-2 truncate text-2xl font-black text-slate-950">${value}</p>
          <p class="mt-1 truncate text-sm font-semibold text-slate-500">${meta}</p>
        </article>
      `
    )
    .join("");
}

function renderPitchers(projection) {
  const away = projection.pitchers.away;
  const home = projection.pitchers.home;
  const awayTeam = projection.game.teams.away.team.name;
  const homeTeam = projection.game.teams.home.team.name;

  els.pitcherGrid.innerHTML = `
    <section class="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-panel">
      <div class="px-4 pt-4">
        <h3 class="text-base font-black text-slate-900">Lanzadores Probables</h3>
        <div class="mt-3 border-t border-dotted border-slate-300"></div>
      </div>

      <div class="grid grid-cols-[1fr_auto_1fr] items-start gap-2 px-4 py-4">
        ${teamPitcherSide("left", away, awayTeam)}
        <div class="min-w-[86px] text-center">
          <p class="text-xs font-black text-slate-900">Lanzadores</p>
          <div class="mt-4 flex items-center justify-center gap-2 text-xs font-semibold text-slate-400">
            <span>${pitcherHeadshot(away, "left")}</span>
            <span>vs</span>
            <span>${pitcherHeadshot(home, "right")}</span>
          </div>
        </div>
        ${teamPitcherSide("right", home, homeTeam)}
      </div>

      <div class="overflow-x-auto border-t border-slate-200">
        <table class="w-full min-w-[680px] text-left text-xs">
          <thead class="bg-slate-50 text-[11px] font-black uppercase tracking-wide text-slate-600">
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
          <tbody class="divide-y divide-slate-100">
            ${pitcherTableRow(away)}
            ${pitcherTableRow(home)}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function teamPitcherSide(align, pitcher, teamName) {
  const isRight = align === "right";
  const flexDirection = isRight ? "flex-row-reverse text-right" : "";
  const pitcherName = pitcher?.name || "Abridor N/D";
  const throws = pitcher?.throws ? `${pitcher.throws}, ` : "";
  const jersey = pitcher?.jersey ? `#${pitcher.jersey}` : "N/D";

  return `
    <div class="min-w-0">
      <div class="flex items-center gap-2 ${flexDirection}">
        ${teamLogo(pitcher, teamName)}
        <span class="text-xs font-semibold uppercase text-slate-600">${escapeHtml(pitcher?.teamAbbreviation || teamAbbrev(teamName))}</span>
      </div>
      <div class="mt-6 ${isRight ? "text-right" : ""}">
        <p class="truncate text-sm font-medium text-slate-900">${escapeHtml(pitcherName)}</p>
        <p class="mt-0.5 text-xs font-semibold text-slate-500">${escapeHtml(throws)}${escapeHtml(jersey)}</p>
      </div>
    </div>
  `;
}

function pitcherHeadshot(pitcher, align) {
  if (pitcher?.headshot) {
    return `<img src="${escapeHtml(pitcher.headshot)}" alt="${escapeHtml(pitcher.name)}" class="h-14 w-14 rounded-full border border-slate-300 bg-white object-cover img-smooth ${align === "left" ? "-mr-1" : "-ml-1"}" loading="lazy" />`;
  }

  return `
    <span class="flex h-14 w-14 items-center justify-center rounded-full border border-slate-300 bg-slate-100 text-xs font-black text-slate-500 ${align === "left" ? "-mr-1" : "-ml-1"}">
      ${escapeHtml(initials(pitcher?.name || ""))}
    </span>
  `;
}

function pitcherTableRow(pitcher) {
  if (!pitcher) {
    return `
      <tr class="bg-white">
        <td class="px-3 py-2 font-semibold text-slate-500">Abridor N/D</td>
        <td class="px-3 py-2 text-center text-slate-400" colspan="8">ESPN no publico datos del lanzador probable.</td>
      </tr>
    `;
  }

  return `
    <tr class="odd:bg-white even:bg-slate-50">
      <td class="px-3 py-2 font-semibold text-sky-700">${escapeHtml(pitcher.name)}</td>
      <td class="px-3 py-2 text-center text-slate-600">${escapeHtml(formatWinLoss(pitcher))}</td>
      <td class="px-3 py-2 text-center text-slate-600">${escapeHtml(formatStat(pitcher.era, 2))}</td>
      <td class="px-3 py-2 text-center text-slate-600">${escapeHtml(formatStat(pitcher.whip, 2))}</td>
      <td class="px-3 py-2 text-center text-slate-600">${escapeHtml(pitcher.inningsDisplay || formatStat(pitcher.innings, 1))}</td>
      <td class="px-3 py-2 text-center text-slate-600">${escapeHtml(formatNullable(pitcher.hits))}</td>
      <td class="px-3 py-2 text-center text-slate-600">${escapeHtml(formatNullable(pitcher.strikeouts))}</td>
      <td class="px-3 py-2 text-center text-slate-600">${escapeHtml(formatNullable(pitcher.walks))}</td>
      <td class="px-3 py-2 text-center text-slate-600">${escapeHtml(formatNullable(pitcher.homeRuns))}</td>
    </tr>
  `;
}

function teamLogo(pitcher, teamName) {
  if (pitcher?.teamLogo) {
    return `<img src="${escapeHtml(pitcher.teamLogo)}" alt="${escapeHtml(teamName)}" class="h-5 w-5 object-contain img-crisp" loading="lazy" />`;
  }

  return `<span class="flex h-5 w-5 items-center justify-center text-xs font-black text-slate-700">${escapeHtml(teamAbbrev(teamName).slice(0, 1))}</span>`;
}

function renderResults(projection) {
  els.resultsBody.innerHTML = projection.rows
    .map(
      (row) => `
        <tr class="bg-white">
          <td class="px-4 py-4 font-bold text-slate-950">${row.market}</td>
          <td class="px-4 py-4 font-semibold text-emerald-700">${row.pick}</td>
          <td class="px-4 py-4 font-semibold text-slate-800">${row.estimate}</td>
          <td class="px-4 py-4">${confidenceBadge(row.confidence)}</td>
          <td class="px-4 py-4 text-slate-500">${row.base}</td>
        </tr>
      `
    )
    .join("");
}

function clearResults(clearHeader = true) {
  els.summaryGrid.innerHTML = "";
  els.pitcherGrid.innerHTML = `<div class="rounded-lg border border-dashed border-slate-300 bg-white p-5 text-center text-sm font-semibold text-slate-500 shadow-panel">Compara un partido para ver los abridores y sus estadisticas.</div>`;
  els.resultsBody.innerHTML = `<tr><td colspan="5" class="px-4 py-8 text-center font-semibold text-slate-500">Aún no hay comparación.</td></tr>`;
  els.sourceBadge.textContent = "Sin datos";
  if (clearHeader) renderMatchupHeader(getSelectedGame());
}

function getSelectedGame() {
  return state.games.find((game) => game.gamePk === state.selectedGamePk) || null;
}

function findEspnEvent(game) {
  const away = normalizeName(game.teams.away.team.name);
  const home = normalizeName(game.teams.home.team.name);

  return state.espnEvents.find((event) => {
    const competition = event.competitions?.[0];
    const competitors = competition?.competitors || [];
    const eventAway = normalizeName(competitors.find((item) => item.homeAway === "away")?.team?.displayName || "");
    const eventHome = normalizeName(competitors.find((item) => item.homeAway === "home")?.team?.displayName || "");
    return eventAway === away && eventHome === home;
  });
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

  const temperature = number(weather.temperature);
  const highTemperature = number(weather.highTemperature || weather.maxTemperature);
  const lowTemperature = number(weather.lowTemperature);
  const description = weather.displayValue || weather.text || weather.shortPhrase || weather.longPhrase || "Clima disponible";
  const windSpeed = number(weather.windSpeed || weather.wind?.speed);
  const windDirection = weather.wind?.direction || weather.wind?.dir || "";
  const humidity = number(weather.humidity);

  return {
    temperature,
    highTemperature,
    lowTemperature,
    description,
    windSpeed,
    windDirection,
    humidity,
    link: weather.link?.href || "",
  };
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
    neutral: "border-b border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700",
    ok: "border-b border-slate-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800",
    warn: "border-b border-slate-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900",
    error: "border-b border-slate-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800",
  };
  els.statusBox.className = classes[tone] || classes.neutral;
  els.statusBox.textContent = message;
}

function confidenceBadge(value) {
  const tone =
    value === "Alta"
      ? "bg-emerald-100 text-emerald-800"
      : value === "Media"
        ? "bg-sky-100 text-sky-800"
        : value === "Referencia"
          ? "bg-slate-100 text-slate-700"
          : "bg-amber-100 text-amber-900";
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

function proyectarHitsEquipo(team, opponent, opponentPitcher, recentForm) {
  const teamHitsRPG = fallback(team?.hitsPerGame, LEAGUE.hitsPerGame);
  const opponentHitsAllowedRPG = fallback(opponent?.hitsAllowedPerGame, LEAGUE.hitsPerGame);
  
  // Base hits expectation combining team offense and opponent defense relative to league average
  const baseExpectedHits = (teamHitsRPG * opponentHitsAllowedRPG) / LEAGUE.hitsPerGame;

  // Pitcher hits factor: based on H/9, WHIP, and K/9 relative to league averages
  const pitcherH9Ratio = fallback(opponentPitcher?.hitsPerNine, LEAGUE.pitcherHits9) / LEAGUE.pitcherHits9;
  const pitcherWhipRatio = fallback(opponentPitcher?.whip, LEAGUE.whip) / LEAGUE.whip;
  const pitcherK9Diff = fallback(opponentPitcher?.k9, LEAGUE.pitcherK9) - LEAGUE.pitcherK9;
  const pitcherK9Factor = 1.0 - pitcherK9Diff * 0.012; // High K/9 reduces contact and hits
  
  const pitcherFactor = (pitcherH9Ratio * 0.50 + pitcherWhipRatio * 0.35 + pitcherK9Factor * 0.15);

  // Recent form factor
  const recentHitsRPG = fallback(recentForm?.hits10, LEAGUE.hitsPerGame);
  const formFactor = 1.0 + (recentHitsRPG / LEAGUE.hitsPerGame - 1.0) * 0.30;

  // Batting average factor
  const teamBA = fallback(team?.battingAverage, LEAGUE.battingAverage);
  const baFactor = teamBA / LEAGUE.battingAverage;

  // Sabermetric multiplicative projection
  let raw = baseExpectedHits * pitcherFactor * formFactor * baFactor;

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

function calcularMatrizPoisson(awayRuns, homeRuns, overUnderLine) {
  let homeWinProb = 0;
  let awayWinProb = 0;
  let overProb = 0;
  let underProb = 0;
  let homeMinus1_5Prob = 0;
  let awayMinus1_5Prob = 0;

  const MAX_RUNS = 18;

  for (let a = 0; a <= MAX_RUNS; a++) {
    const pAway = poissonProbability(awayRuns, a);
    for (let h = 0; h <= MAX_RUNS; h++) {
      const pHome = poissonProbability(homeRuns, h);
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
    awayMinus1_5Prob
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

function calcularHitsPoisson(awayHits, homeHits, line) {
  let overProb = 0;
  let underProb = 0;
  const targetLine = line || 16.5;
  const MAX_HITS = 25;

  for (let a = 0; a <= MAX_HITS; a++) {
    const pAway = poissonProbability(awayHits, a);
    for (let h = 0; h <= MAX_HITS; h++) {
      const pHome = poissonProbability(homeHits, h);
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
  return { overProb, underProb };
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
  if (pitcher.headshot) {
    return `<img src="${escapeHtml(pitcher.headshot)}" alt="${escapeHtml(pitcher.name)}" class="h-16 w-16 rounded-lg border border-slate-200 bg-white object-cover img-smooth" loading="lazy" />`;
  }

  return `
    <div class="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-lg font-black text-slate-500">
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
