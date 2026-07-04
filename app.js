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
};

const state = {
  games: [],
  espnEvents: [],
  selectedGamePk: null,
  teamStats: new Map(),
  pitcherStats: new Map(),
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
    const [awayStats, homeStats, awayMlbPitcher, homeMlbPitcher] = await Promise.all([
      getTeamStats(away.id),
      getTeamStats(home.id),
      getPitcherStats(game.teams.away.probablePitcher?.id),
      getPitcherStats(game.teams.home.probablePitcher?.id),
    ]);

    const awayPitcher = mergePitcherSources(espnPitchers.away, awayMlbPitcher, game.teams.away.probablePitcher);
    const homePitcher = mergePitcherSources(espnPitchers.home, homeMlbPitcher, game.teams.home.probablePitcher);
    const projection = buildProjection({
      game,
      awayStats,
      homeStats,
      awayPitcher,
      homePitcher,
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

function buildProjection({ game, awayStats, homeStats, awayPitcher, homePitcher, espnEvent }) {
  const awayTeam = game.teams.away.team;
  const homeTeam = game.teams.home.team;
  const awayName = shortName(awayTeam.name);
  const homeName = shortName(homeTeam.name);

  const awayRuns = expectedRuns(awayStats, homeStats, homePitcher);
  const homeRuns = expectedRuns(homeStats, awayStats, awayPitcher);
  const awayHits = expectedHits(awayStats, homeStats, homePitcher);
  const homeHits = expectedHits(homeStats, awayStats, awayPitcher);
  const totalRuns = round1(awayRuns + homeRuns);
  const totalHits = round1(awayHits + homeHits);
  const diff = round1(homeRuns - awayRuns);
  const favorite = diff >= 0 ? homeName : awayName;
  const underdog = diff >= 0 ? awayName : homeName;
  const favoriteRuns = diff >= 0 ? homeRuns : awayRuns;
  const underdogRuns = diff >= 0 ? awayRuns : homeRuns;
  const winProbability = pythagoreanWinProb(favoriteRuns, underdogRuns);
  const odds = extractEspnOdds(espnEvent);
  const totalLean = odds.overUnder
    ? totalRuns >= odds.overUnder + 0.4
      ? `Over ${odds.overUnder}`
      : totalRuns <= odds.overUnder - 0.4
        ? `Under ${odds.overUnder}`
        : `Cerca de ${odds.overUnder}`
    : totalRuns >= 8.9
      ? "Over estimado"
      : totalRuns <= 7.4
        ? "Under estimado"
        : "Total medio";

  const runLinePick = Math.abs(diff) >= 1.35 ? `${favorite} -1.5` : `${underdog} +1.5`;
  const confidence = confidenceFromEdge(Math.abs(diff), winProbability);
  const totalConfidence = odds.overUnder ? confidenceFromTotalEdge(Math.abs(totalRuns - odds.overUnder)) : "Media";

  return {
    game,
    awayName,
    homeName,
    awayRuns: round1(awayRuns),
    homeRuns: round1(homeRuns),
    awayHits: round1(awayHits),
    homeHits: round1(homeHits),
    totalRuns,
    totalHits,
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
    rows: [
      {
        market: "Ganador",
        pick: favorite,
        estimate: `${Math.round(winProbability * 100)}%`,
        confidence,
        base: `Carreras: ${awayName} ${round1(awayRuns)} - ${homeName} ${round1(homeRuns)}`,
      },
      {
        market: "Total carreras",
        pick: totalLean,
        estimate: totalRuns.toFixed(1),
        confidence: totalConfidence,
        base: odds.overUnder
          ? `Línea ESPN: ${odds.overUnder}; modelo usa OPS/OBP/SLG, HR, BB/K, ERA, WHIP, K/9, BB/9 y HR/9`
          : "OPS/OBP/SLG, HR, BB/K, ERA, WHIP, K/9, BB/9 y HR/9",
      },
      {
        market: "Handicap",
        pick: runLinePick,
        estimate: `${favorite} +${round1(Math.abs(diff))}`,
        confidence: Math.abs(diff) >= 1.35 ? confidence : "Baja",
        base: "Diferencia proyectada de carreras",
      },
      {
        market: "Hits totales",
        pick: totalHits >= 16.7 ? "Over hits" : totalHits <= 14.2 ? "Under hits" : "Rango medio",
        estimate: totalHits.toFixed(1),
        confidence: totalHits >= 17.6 || totalHits <= 13.4 ? "Media" : "Baja",
        base: `${awayName} ${round1(awayHits)} H, ${homeName} ${round1(homeHits)} H`,
      },
      {
        market: "Marcador estimado",
        pick: `${awayName} ${Math.max(1, Math.round(awayRuns))} - ${homeName} ${Math.max(1, Math.round(homeRuns))}`,
        estimate: `${totalRuns.toFixed(1)} carreras`,
        confidence: "Referencia",
        base: pitcherBase(game, awayPitcher, homePitcher),
      },
    ],
  };
}

function expectedRuns(team, opponent, opponentStarter) {
  const offense = fallback(team.runsPerGame, LEAGUE.runsPerGame);
  const prevention = fallback(opponent.runsAllowedPerGame, LEAGUE.runsPerGame);
  const offenseAdjustment = teamOffenseAdjustment(team);
  const opponentAdjustment = teamPitchingAdjustment(opponent);
  const starterAdjustment = starterRunAdjustment(opponentStarter);
  const raw =
    offense * 0.44 +
    prevention * 0.24 +
    LEAGUE.runsPerGame * 0.16 +
    offenseAdjustment +
    opponentAdjustment +
    starterAdjustment;
  return clamp(raw, 1.8, 8.8);
}

function expectedHits(team, opponent, opponentStarter) {
  const offense = fallback(team.hitsPerGame, LEAGUE.hitsPerGame);
  const allowed = fallback(opponent.hitsAllowedPerGame, LEAGUE.hitsPerGame);
  const starterWhip = fallback(opponentStarter?.whip, fallback(opponent.whip, LEAGUE.whip));
  const starterHits9 = fallback(opponentStarter?.hitsPerNine, LEAGUE.pitcherHits9);
  const starterK9 = fallback(opponentStarter?.k9, LEAGUE.pitcherK9);
  const contactProfile =
    (fallback(team.battingAverage, 0.245) - 0.245) * 10 +
    (fallback(team.strikeoutsPerGame, LEAGUE.strikeoutsPerGame) - LEAGUE.strikeoutsPerGame) * -0.08;
  const raw =
    offense * 0.46 +
    allowed * 0.24 +
    LEAGUE.hitsPerGame * 0.12 +
    (starterWhip - LEAGUE.whip) * 1.65 +
    (starterHits9 - LEAGUE.pitcherHits9) * 0.16 +
    (starterK9 - LEAGUE.pitcherK9) * -0.11 +
    contactProfile;
  return clamp(raw, 4.8, 12.5);
}

function teamOffenseAdjustment(team) {
  const ops = fallback(team.ops, LEAGUE.ops);
  const obp = fallback(team.obp, LEAGUE.obp);
  const slg = fallback(team.slg, LEAGUE.slg);
  const homeRuns = fallback(team.homeRunsPerGame, LEAGUE.homeRunsPerGame);
  const walks = fallback(team.walksPerGame, LEAGUE.walksPerGame);
  const strikeouts = fallback(team.strikeoutsPerGame, LEAGUE.strikeoutsPerGame);

  return (
    (ops - LEAGUE.ops) * 2.10 +
    (obp - LEAGUE.obp) * 2.40 +
    (slg - LEAGUE.slg) * 1.30 +
    (homeRuns - LEAGUE.homeRunsPerGame) * 0.20 +
    (walks - LEAGUE.walksPerGame) * 0.10 -
    (strikeouts - LEAGUE.strikeoutsPerGame) * 0.055
  );
}

function teamPitchingAdjustment(team) {
  const era = fallback(team.era, LEAGUE.era);
  const whip = fallback(team.whip, LEAGUE.whip);
  const hitsAllowed = fallback(team.hitsAllowedPerGame, LEAGUE.hitsPerGame);
  const walksAllowed = fallback(team.walksAllowedPerGame, LEAGUE.walksPerGame);
  const homersAllowed = fallback(team.homeRunsAllowedPerGame, LEAGUE.homeRunsPerGame);
  const strikeouts = fallback(team.pitchingStrikeoutsPerGame, LEAGUE.strikeoutsPerGame);

  return (
    (era - LEAGUE.era) * 0.08 +
    (whip - LEAGUE.whip) * 0.35 +
    (hitsAllowed - LEAGUE.hitsPerGame) * 0.035 +
    (walksAllowed - LEAGUE.walksPerGame) * 0.055 +
    (homersAllowed - LEAGUE.homeRunsPerGame) * 0.16 -
    (strikeouts - LEAGUE.strikeoutsPerGame) * 0.025
  );
}

function starterRunAdjustment(starter) {
  const era = fallback(starter?.era, LEAGUE.era);
  const whip = fallback(starter?.whip, LEAGUE.whip);
  const k9 = fallback(starter?.k9, LEAGUE.pitcherK9);
  const bb9 = fallback(starter?.bb9, LEAGUE.pitcherBb9);
  const hr9 = fallback(starter?.hr9, LEAGUE.pitcherHr9);
  const hits9 = fallback(starter?.hitsPerNine, LEAGUE.pitcherHits9);
  const startLength = fallback(starter?.inningsPerStart, LEAGUE.starterInnings);
  const starterShare = clamp(startLength / 6, 0.55, 1.05);
  const bullpenExposure = clamp(LEAGUE.starterInnings - startLength, -0.8, 1.4) * 0.06;

  return (
    ((era - LEAGUE.era) * 0.11 +
      (whip - LEAGUE.whip) * 0.78 +
      (bb9 - LEAGUE.pitcherBb9) * 0.055 +
      (hr9 - LEAGUE.pitcherHr9) * 0.20 +
      (hits9 - LEAGUE.pitcherHits9) * 0.035 -
      (k9 - LEAGUE.pitcherK9) * 0.035) *
      starterShare +
    bullpenExposure
  );
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

async function getPitcherStats(playerId) {
  if (!playerId) return null;
  if (state.pitcherStats.has(playerId)) return state.pitcherStats.get(playerId);

  try {
    const data = await fetchJson(`${MLB_BASE}/people/${playerId}/stats?stats=season&group=pitching`);
    const stat = data.stats?.[0]?.splits?.[0]?.stat || {};
    const innings = inningsToNumber(stat.inningsPitched);
    const starts = number(stat.gamesStarted);
    const games = number(stat.gamesPlayed);
    const strikeouts = number(stat.strikeOuts);
    const walks = number(stat.baseOnBalls);
    const hits = number(stat.hits);
    const homeRuns = number(stat.homeRuns);
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
      strikeouts,
      walks,
      homeRuns,
      k9: ratePerNine(strikeouts, innings),
      bb9: ratePerNine(walks, innings),
      hr9: ratePerNine(homeRuns, innings),
      hitsPerNine: ratePerNine(hits, innings),
      inningsPerStart: starts ? innings / starts : innings / Math.max(games, 1),
    };
    state.pitcherStats.set(playerId, normalized);
    return normalized;
  } catch {
    state.pitcherStats.set(playerId, null);
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
      strikeouts: mlbPitcher?.strikeouts || null,
      walks: mlbPitcher?.walks || null,
      homeRuns: mlbPitcher?.homeRuns || null,
      k9: mlbPitcher?.k9 || null,
      bb9: mlbPitcher?.bb9 || null,
      hr9: mlbPitcher?.hr9 || null,
      hitsPerNine: mlbPitcher?.hitsPerNine || null,
      inningsPerStart: mlbPitcher?.inningsPerStart || null,
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
      strikeouts: mlbPitcher?.strikeouts || null,
      walks: mlbPitcher?.walks || null,
      homeRuns: mlbPitcher?.homeRuns || null,
      k9: mlbPitcher?.k9 || null,
      bb9: mlbPitcher?.bb9 || null,
      hr9: mlbPitcher?.hr9 || null,
      hitsPerNine: mlbPitcher?.hitsPerNine || null,
      inningsPerStart: mlbPitcher?.inningsPerStart || null,
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
    return `<img src="${escapeHtml(pitcher.headshot)}" alt="${escapeHtml(pitcher.name)}" class="h-14 w-14 rounded-full border border-slate-300 bg-white object-cover ${align === "left" ? "-mr-1" : "-ml-1"}" />`;
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
    return `<img src="${escapeHtml(pitcher.teamLogo)}" alt="${escapeHtml(teamName)}" class="h-5 w-5 object-contain" />`;
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

function pythagoreanWinProb(favoriteRuns, underdogRuns) {
  const exponent = 1.83;
  const fav = Math.pow(Math.max(favoriteRuns, 0.1), exponent);
  const dog = Math.pow(Math.max(underdogRuns, 0.1), exponent);
  return clamp(fav / (fav + dog), 0.5, 0.72);
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
    return `<img src="${escapeHtml(pitcher.headshot)}" alt="${escapeHtml(pitcher.name)}" class="h-16 w-16 rounded-lg border border-slate-200 bg-white object-cover" />`;
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
