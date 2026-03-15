/**
 * Savings Opportunities Engine
 * Identifies: idle instances, oversized compute, unattached storage, data transfer inefficiencies.
 */

const supabase = require("../supabaseClient");

/** Thresholds and savings estimates */
const RULES = {
  idleCompute: { costMin: 50, utilizationMax: 25, savingsFactor: 0.35 },
  oversizedCompute: { costMin: 100, utilizationMax: 40, savingsFactor: 0.30 },
  unattachedStorage: { costMin: 20, savingsFactor: 0.25 },
  dataTransfer: { costMin: 50, savingsFactor: 0.20 },
};

function normalizeService(s) {
  return (s || "").toString().toLowerCase();
}

/**
 * Fetch cloud cost data for a client (optimized: only needed columns).
 */
async function getCostData(clientId) {
  const { data, error } = await supabase
    .from("cloud_cost_data")
    .select("id, service, category, cost, region, usage_date, utilization")
    .eq("client_id", clientId);

  if (error) throw error;
  return data || [];
}

/**
 * Identify idle instances (compute with low utilization or high cost, likely underused).
 */
function findIdleInstances(rows) {
  const opportunities = [];
  const serviceKeys = ["ec2", "vm", "virtual", "instance", "compute"];

  for (const r of rows) {
    const service = normalizeService(r.service) + normalizeService(r.category);
    if (!serviceKeys.some((k) => service.includes(k))) continue;

    const cost = Number(r.cost || 0);
    if (cost < RULES.idleCompute.costMin) continue;

    const utilization = r.utilization != null ? Number(r.utilization) : null;
    const isIdle = utilization != null ? utilization <= RULES.idleCompute.utilizationMax : cost > 200;

    if (isIdle) {
      const savings = cost * RULES.idleCompute.savingsFactor;
      opportunities.push({
        type: "IDLE_INSTANCE",
        service: r.service || "Compute",
        region: r.region,
        monthlyCost: Number(cost.toFixed(2)),
        potentialSavings: Number(savings.toFixed(2)),
        confidence: 75,
        description: utilization != null
          ? `Instance at ${utilization}% utilization – right-size or schedule`
          : "Likely idle or underutilized compute – review usage",
      });
    }
  }
  return opportunities;
}

/**
 * Identify oversized compute (high cost, low utilization = over-provisioned).
 */
function findOversizedCompute(rows) {
  const opportunities = [];
  const serviceKeys = ["ec2", "vm", "virtual", "instance", "compute"];

  for (const r of rows) {
    const service = normalizeService(r.service) + normalizeService(r.category);
    if (!serviceKeys.some((k) => service.includes(k))) continue;

    const cost = Number(r.cost || 0);
    if (cost < RULES.oversizedCompute.costMin) continue;

    const utilization = r.utilization != null ? Number(r.utilization) : null;
    if (utilization != null && utilization <= RULES.oversizedCompute.utilizationMax) {
      const savings = cost * RULES.oversizedCompute.savingsFactor;
      opportunities.push({
        type: "OVERSIZED_COMPUTE",
        service: r.service || "Compute",
        region: r.region,
        monthlyCost: Number(cost.toFixed(2)),
        potentialSavings: Number(savings.toFixed(2)),
        confidence: 70,
        description: `Compute at ${utilization}% utilization – consider smaller instance type`,
      });
    }
  }
  return opportunities;
}

/**
 * Identify unattached or orphaned storage (S3, Blob, disk).
 */
function findUnattachedStorage(rows) {
  const opportunities = [];
  const serviceKeys = ["s3", "blob", "storage", "disk", "ebs", "volume"];

  for (const r of rows) {
    const service = normalizeService(r.service) + normalizeService(r.category);
    if (!serviceKeys.some((k) => service.includes(k))) continue;

    const cost = Number(r.cost || 0);
    if (cost < RULES.unattachedStorage.costMin) continue;

    const savings = cost * RULES.unattachedStorage.savingsFactor;
    opportunities.push({
      type: "UNATTACHED_STORAGE",
      service: r.service || "Storage",
      region: r.region,
      monthlyCost: Number(cost.toFixed(2)),
      potentialSavings: Number(savings.toFixed(2)),
      confidence: 65,
      description: "Storage with potential for lifecycle policy or deletion of unused data",
    });
  }
  return opportunities;
}

/**
 * Identify data transfer inefficiencies (egress, CDN, network).
 */
function findDataTransferInefficiencies(rows) {
  const opportunities = [];
  const serviceKeys = ["data transfer", "egress", "cdn", "cloudfront", "network", "bandwidth"];

  for (const r of rows) {
    const service = normalizeService(r.service) + normalizeService(r.category);
    if (!serviceKeys.some((k) => service.includes(k))) continue;

    const cost = Number(r.cost || 0);
    if (cost < RULES.dataTransfer.costMin) continue;

    const savings = cost * RULES.dataTransfer.savingsFactor;
    opportunities.push({
      type: "DATA_TRANSFER_INEFFICIENCY",
      service: r.service || "Network",
      region: r.region,
      monthlyCost: Number(cost.toFixed(2)),
      potentialSavings: Number(savings.toFixed(2)),
      confidence: 60,
      description: "Optimize region/availability zone transfer or use committed discounts",
    });
  }
  return opportunities;
}

/**
 * Get all savings opportunities for a client.
 * Deduplicates by (type, service, region) and sorts by potentialSavings desc.
 */
async function getSavingsOpportunities(clientId, options = {}) {
  const { limit = 50 } = options;
  const rows = await getCostData(clientId);

  const idle = findIdleInstances(rows);
  const oversized = findOversizedCompute(rows);
  const storage = findUnattachedStorage(rows);
  const transfer = findDataTransferInefficiencies(rows);

  const all = [...idle, ...oversized, ...storage, ...transfer];
  const byType = {
    idleInstances: idle,
    oversizedCompute: oversized,
    unattachedStorage: storage,
    dataTransferInefficiencies: transfer,
  };

  const totalPotentialSavings = all.reduce((sum, o) => sum + o.potentialSavings, 0);

  const sorted = all
    .sort((a, b) => b.potentialSavings - a.potentialSavings)
    .slice(0, limit);

  return {
    opportunities: sorted,
    byType,
    totalPotentialSavings: Number(totalPotentialSavings.toFixed(2)),
    count: sorted.length,
  };
}

module.exports = {
  getSavingsOpportunities,
  findIdleInstances,
  findOversizedCompute,
  findUnattachedStorage,
  findDataTransferInefficiencies,
};
