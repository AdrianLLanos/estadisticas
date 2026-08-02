/**
 * Módulo Sabermétrico de Predicción MLB (Over/Under & Moneyline)
 * Incorpora: Estabilización Temporal (85/15), Cruce Ofensiva/Defensiva, 
 * Factor de Parque, Impacto de Umpire repartido y Teorema de Pitágoras (exp: 1.83).
 */

// Constantes Globales
const LEAGUE = {
  runsPerGame: 4.45
};

const MLB_PARK_FACTORS = {
  "Coors Field": 1.15,               // Escalado 1.0 (ó 115)
  "Yankee Stadium": 1.03,
  "Fenway Park": 1.05,
  "Dodger Stadium": 0.98,
  "Petco Park": 0.96
};

const MLB_UMPIRES = {
  "Angel Hernandez": { runsImpact: 0.35, zoneType: "Over / Zona Inconsistente" },
  "Lance Barksdale": { runsImpact: 0.40, zoneType: "Over / Zona Estrecha" },
  "Dan Bellino":      { runsImpact: -0.35, zoneType: "Under / Zona Amplia" },
  "Pat Hoberg":       { runsImpact: -0.20, zoneType: "Precisión Elite / Neutro" }
};

/**
 * 1. Estabiliza el promedio de carreras por juego (RPG) aplicando ponderación temporal.
 * @param {number} seasonRPG - Promedio de carreras en la temporada.
 * @param {number} last10RPG - Promedio de carreras en los últimos 10 juegos.
 * @returns {number} RPG Estabilizado.
 */
function getStabilizedRPG(seasonRPG, last10RPG) {
  const WEIGHT_SEASON = 0.85;
  const WEIGHT_L10 = 0.15;
  
  // Validaciones por si falta algún valor
  const season = typeof seasonRPG === 'number' && !isNaN(seasonRPG) ? seasonRPG : LEAGUE.runsPerGame;
  const l10 = typeof last10RPG === 'number' && !isNaN(last10RPG) ? last10RPG : season;

  return (season * WEIGHT_SEASON) + (l10 * WEIGHT_L10);
}

/**
 * Normaliza el factor de parque (acepta formato decimal como 1.05 o entero como 105).
 * @param {number|undefined} factor 
 * @returns {number} Factor normalizado (1.0 = neutro)
 */
function normalizeParkFactor(factor) {
  if (typeof factor !== 'number' || isNaN(factor) || factor <= 0) return 1.0;
  return factor > 50 ? factor / 100 : factor;
}

/**
 * Función Principal de Proyección de Partido MLB
 * 
 * @param {Object} homeTeam - Stats del local: { seasonRS, last10RS, seasonRA, last10RA }
 * @param {Object} awayTeam - Stats del visitante: { seasonRS, last10RS, seasonRA, last10RA }
 * @param {string} stadium - Nombre del estadio
 * @param {string} umpire - Nombre del umpire principal
 * @returns {Object} Resultado con Carreras Proyectadas, Total (Over/Under) y Probabilidades de Victoria
 */
function projectMLBGame(homeTeam, awayTeam, stadium = "", umpire = "") {
  // Manejo de errores en parámetros de entrada
  if (!homeTeam || !awayTeam) {
    throw new Error("Error: Debes proporcionar los datos estadísticos de ambos equipos (homeTeam y awayTeam).");
  }

  const leagueRPG = LEAGUE?.runsPerGame || 4.45;

  // 1. Estabilización de Carreras Anotadas (RS) y Permitidas (RA)
  const homeRS = getStabilizedRPG(homeTeam.seasonRS, homeTeam.last10RS);
  const homeRA = getStabilizedRPG(homeTeam.seasonRA, homeTeam.last10RA);

  const awayRS = getStabilizedRPG(awayTeam.seasonRS, awayTeam.last10RS);
  const awayRA = getStabilizedRPG(awayTeam.seasonRA, awayTeam.last10RA);

  // 2. Cruce Sabermétrico: Ofensiva Equipo A vs. Defensiva Equipo B normalizado por la liga
  let homeBaseRuns = (homeRS * awayRA) / leagueRPG;
  let awayBaseRuns = (awayRS * homeRA) / leagueRPG;

  // 3. Ajuste por Factor de Parque (con fallback si el estadio no existe)
  const rawParkFactor = MLB_PARK_FACTORS[stadium];
  const parkFactor = normalizeParkFactor(rawParkFactor);

  homeBaseRuns *= parkFactor;
  awayBaseRuns *= parkFactor;

  // 4. Ajuste por Impacto de Umpire (repartido al 50% entre ambos equipos para evitar duplicar el efecto total)
  const umpireObj = MLB_UMPIRES[umpire];
  const runsImpact = typeof umpireObj === 'number' ? umpireObj : (umpireObj?.runsImpact ?? 0.0);
  const umpireImpactPerTeam = runsImpact / 2;

  // Carreras Proyectadas Finales (asegurando no tener valores negativos)
  const homeProjectedRuns = Math.max(0.5, homeBaseRuns + umpireImpactPerTeam);
  const awayProjectedRuns = Math.max(0.5, awayBaseRuns + umpireImpactPerTeam);
  const totalProjectedRuns = homeProjectedRuns + awayProjectedRuns;

  // 5. Probabilidad de Victoria (Teorema de Pitágoras con exponente 1.83)
  const EXPONENT = 1.83;
  const homePow = Math.pow(homeProjectedRuns, EXPONENT);
  const awayPow = Math.pow(awayProjectedRuns, EXPONENT);

  const homeWinProb = homePow / (homePow + awayPow);
  const awayWinProb = awayPow / (homePow + awayPow);

  return {
    matchup: {
      stadium: stadium || "Estadio Neutro / No especificado",
      parkFactor: parkFactor,
      umpire: umpire || "No especificado / Zona neutra",
      umpireRunsImpact: runsImpact
    },
    stabilizedRPG: {
      home: { RS: Number(homeRS.toFixed(2)), RA: Number(homeRA.toFixed(2)) },
      away: { RS: Number(awayRS.toFixed(2)), RA: Number(awayRA.toFixed(2)) }
    },
    projections: {
      homeRuns: Number(homeProjectedRuns.toFixed(2)),
      awayRuns: Number(awayProjectedRuns.toFixed(2)),
      totalRuns: Number(totalProjectedRuns.toFixed(2))
    },
    probabilities: {
      homeWinProb: Number((homeWinProb * 100).toFixed(2)),
      awayWinProb: Number((awayWinProb * 100).toFixed(2)),
      favorite: homeWinProb > awayWinProb ? "Home" : "Away"
    }
  };
}

// ==========================================
// CASOS DE PRUEBA Y DEMOSTRACIÓN DE CÁLCULO
// ==========================================

console.log("\n=======================================================");
console.log("   DEMOSTRACIÓN DE CÁLCULOS PREDICCIÓN MLB AJUSTADA   ");
console.log("=======================================================\n");

// Caso 1: Los Angeles Dodgers (Home) vs Colorado Rockies (Away) en Coors Field con Umpire Over
const homeDodgers = {
  seasonRS: 5.10, // 5.1 carreras anotadas/juego en temporada
  last10RS: 6.20, // Racha caliente en L10
  seasonRA: 3.80, // Pitching fuerte
  last10RA: 3.50
};

const awayRockies = {
  seasonRS: 4.10,
  last10RS: 3.80,
  seasonRA: 5.40, // Defensiva/pitcheo débil
  last10RA: 6.10
};

console.log("--> CASO 1: Dodgers vs Rockies en Coors Field (Umpire: Angel Hernandez)");
const test1 = projectMLBGame(homeDodgers, awayRockies, "Coors Field", "Angel Hernandez");
console.log(JSON.stringify(test1, null, 2));

console.log("\n-------------------------------------------------------\n");

// Caso 2: Prueba con Estadio o Umpire inexistente (para verificar resiliencia y fallbacks)
console.log("--> CASO 2: Prueba de Robustez (Estadio y Umpire no existentes)");
const test2 = projectMLBGame(homeDodgers, awayRockies, "Estadio Desconocido", "Umpire Desconocido");
console.log(JSON.stringify(test2, null, 2));

console.log("\n=======================================================");
