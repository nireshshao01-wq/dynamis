/**
 * FinOps Score Engine
 * Calculates a maturity score (0–100) based on compute waste, idle resources,
 * storage waste, and network inefficiency.
 */

const supabase = require("../supabaseClient");

const WEIGHTS = {
  computeWaste: 0.30,
  idleResources: 0.25,
  storageWaste: 0.25,
  networkInefficiency: 0.20,
};

function deriveWasteFromRows(rows) {
  let computeWaste = 0, storageWaste = 0, networkWaste = 0, idleWaste = 0, totalCost = 0;
  for (const r of rows) {
    const cost = Number(r.cost || 0);
    totalCost += cost;
    const service = (r.service || "").toUpperCase();
    const category = (r.category || "").toLowerCase();
    const utilization = r.utilization != null ? Number(r.utilization) : null;
    if (utilization != null && utilization < 20) idleWaste += cost * 0.35;
    else if (service.includes("LAMBDA") || service.includes("FUNCTION")) idleWaste += cost * 0.05;
    if (service.includes("EC2") || service.includes("VIRTUAL") || service.includes("VM") || category === "compute") {
      computeWaste += cost * (utilization != null && utilization < 40 ? 0.25 : 0.20);
    }
    if (service.includes("S3") || service.includes("BLOB") || service.includes("STORAGE") || category === "storage") storageWaste += cost * 0.15;
    if (service.includes("CDN") || service.includes("CLOUDFRONT") || service.includes("DATA") || service.includes("NETWORK") || category === "network") networkWaste += cost * 0.10;
  }
  return { totalCost, computeWaste, storageWaste, networkWaste, idleWaste, totalWaste: computeWaste + storageWaste + networkWaste + idleWaste };
}

function wasteRatios(totalCost, waste) {
  if (!totalCost || totalCost <= 0) return { compute: 0, idle: 0, storage: 0, network: 0 };
  return {
    compute: Math.min(1, waste.computeWaste / totalCost),
    idle: Math.min(1, waste.idleWaste / totalCost),
    storage: Math.min(1, waste.storageWaste / totalCost),
    network: Math.min(1, waste.networkWaste / totalCost),
  };
}

function calculateFinOpsScore(waste) {
  const { totalCost, computeWaste, idleWaste, storageWaste, networkWaste } = waste;
  if (!totalCost || totalCost <= 0) return { score: 100, breakdown: {} };
  const ratios = wasteRatios(totalCost, { computeWaste, idleWaste, storageWaste, networkWaste });
  const weightedWaste = ratios.compute * WEIGHTS.computeWaste + ratios.idle * WEIGHTS.idleResources + ratios.storage * WEIGHTS.storageWaste + ratios.network * WEIGHTS.networkInefficiency;
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

async function getFinOpsScore(clientId) {
  const { data: rows, error } = await supabase.from("cloud_cost_data").select("cost, service, category, utilization").eq("client_id", clientId);
  if (error) throw error;
  const waste = deriveWasteFromRows(rows || []);
  const { score, breakdown } = calculateFinOpsScore(waste);
  return { score, breakdown, totalCost: Number(waste.totalCost.toFixed(2)), totalWaste: Number(waste.totalWaste.toFixed(2)), potentialSavings: Number(waste.totalWaste.toFixed(2)) };
}

module.exports = { getFinOpsScore, calculateFinOpsScore, deriveWasteFromRows, wasteRatios };
