/**
 * FinOps Score Engine
 * Calculates a maturity score (0–100) based on compute waste, idle resources,
 * storage waste, and network inefficiency.
 */

const supabase = require("../supabaseClient");

/** Weights for each waste category (sum = 1). Higher weight = more impact on score. */
const WEIGHTS = {
  computeWaste: 0.30,
  idleResources: 0.25,
  storageWaste: 0.25,
  networkInefficiency: 0.20,
};

/**
 * Derive waste amounts from cloud cost rows (provider-agnostic).
 * Uses service/category heuristics when utilization is missing.
 */
function deriveWasteFromRows(rows) {
  let computeWaste = 0;
  let storageWaste = 0;
  let networkWaste = 0;
  let idleWaste = 0;
  let totalCost = 0;

  for (const r of rows) {
    const cost = Number(r.cost || 0);
    totalCost += cost;
    const service = (r.service || "").toUpperCase();
    const category = (r.category || "").toLowerCase();
    const utilization = r.utilization != null ? Number(r.utilization) : null;

    // Idle: low utilization or serverless/idle patterns
    if (utilization != null && utilization < 20) {
      idleWaste += cost * 0.35;
    } else if (service.includes("LAMBDA") || service.includes("FUNCTION")) {
      idleWaste += cost * 0.05;
    }

    // Compute
    if (service.includes("EC2") || service.includes("VIRTUAL") || service.includes("VM") || category === "compute") {
      const wastePct = utilization != null && utilization < 40 ? 0.25 : 0.20;
      computeWaste += cost * wastePct;
    }

    // Storage
    if (service.includes("S3") || service.includes("BLOB") || service.includes("STORAGE") || category === "storage") {
      storageWaste += cost * 0.15;
    }

    // Network
    if (service.includes("CDN") || service.includes("CLOUDFRONT") || service.includes("DATA") || service.includes("NETWORK") || category === "network") {
      networkWaste += cost * 0.10;
    }
  }

  const totalWaste = computeWaste + storageWaste + networkWaste + idleWaste;
  return {
    totalCost,
    computeWaste,
    storageWaste,
    networkWaste,
    idleWaste,
    totalWaste,
  };
}

/**
 * Compute waste ratio per category (0–1). Higher = worse.
 */
function wasteRatios(totalCost, waste) {
  if (!totalCost || totalCost <= 0) {
    return { compute: 0, idle: 0, storage: 0, network: 0 };
  }
  return {
    compute: Math.min(1, waste.computeWaste / totalCost),
    idle: Math.min(1, waste.idleWaste / totalCost),
    storage: Math.min(1, waste.storageWaste / totalCost),
    network: Math.min(1, waste.networkWaste / totalCost),
  };
}

/**
 * Calculate FinOps score 0–100.
 * Score = 100 - (weighted sum of waste ratios * 100).
 * Higher score = better FinOps maturity (less waste).
 */
function calculateFinOpsScore(waste) {
  const { totalCost, computeWaste, idleWaste, storageWaste, networkWaste } = waste;
  if (!totalCost || totalCost <= 0) return { score: 100, breakdown: {} };

  const ratios = wasteRatios(totalCost, {
    computeWaste,
    idleWaste,
    storageWaste,
    networkWaste,
  });

  const weightedWaste =
    ratios.compute * WEIGHTS.computeWaste +
    ratios.idle * WEIGHTS.idleResources +
    ratios.storage * WEIGHTS.storageWaste +
    ratios.network * WEIGHTS.networkInefficiency;

  const score = Math.max(0, Math.min(100, Math.round(100 - weightedWaste * 100)));

  return {
    score,
    breakdown: {
      computeWastePercent: Math.round(ratios.compute * 100),
      idleWastePercent: Math.round(ratios.idle * 100),
      storageWastePercent: Math.round(ratios.storage * 100),
      networkWastePercent: Math.round(ratios.network * 100),
    },
  };
}

/**
 * Get FinOps score for a client (from cloud_cost_data).
 * @param {string} clientId
 * @returns {Promise<{ score, breakdown, totalCost, totalWaste, potentialSavings }>}
 */
async function getFinOpsScore(clientId) {
  const { data: rows, error } = await supabase
    .from("cloud_cost_data")
    .select("cost, service, category, utilization")
    .eq("client_id", clientId);

  if (error) throw error;

  const waste = deriveWasteFromRows(rows || []);
  const { score, breakdown } = calculateFinOpsScore(waste);

  return {
    score,
    breakdown,
    totalCost: Number(waste.totalCost.toFixed(2)),
    totalWaste: Number(waste.totalWaste.toFixed(2)),
    potentialSavings: Number(waste.totalWaste.toFixed(2)),
  };
}

module.exports = {
  getFinOpsScore,
  calculateFinOpsScore,
  deriveWasteFromRows,
  wasteRatios,
};
