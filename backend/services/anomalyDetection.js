/**
 * Anomaly Detection – Unusual cost spikes using rolling 6-month average.
 * Compares current month to rolling average of prior 6 months; flags if above threshold.
 */

const supabase = require("../supabaseClient");

const SPIKE_THRESHOLD_PCT = 25; // flag if current > rolling_avg * (1 + threshold/100)
const MIN_MONTHS_FOR_ROLLING = 3;

/**
 * Get monthly totals from cloud_cost_data (fallback when dynamis_finops_summary missing).
 */
async function getMonthlyCostsFromRaw(clientId) {
  const { data, error } = await supabase
    .from("cloud_cost_data")
    .select("cost, usage_date")
    .eq("client_id", clientId);

  if (error) throw error;

  const byMonth = {};
  for (const r of data || []) {
    const d = r.usage_date;
    const month = d ? (typeof d === "string" ? d.slice(0, 7) : (d.toISOString && d.toISOString().slice(0, 7))) : "Unknown";
    byMonth[month] = (byMonth[month] || 0) + Number(r.cost || 0);
  }
  return Object.entries(byMonth)
    .map(([month, cost]) => ({ month, total_cost: cost }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

/**
 * Get monthly series (prefer dynamis_finops_summary if available and has data).
 */
async function getMonthlySeries(clientId) {
  const { data: summary, error } = await supabase
    .from("dynamis_finops_summary")
    .select("month, total_cost")
    .eq("client_id", clientId)
    .order("month", { ascending: true });

  if (error) throw error;
  if (summary && summary.length >= MIN_MONTHS_FOR_ROLLING) return summary;

  return getMonthlyCostsFromRaw(clientId);
}

/**
 * Rolling average of the last 6 months (excluding current).
 */
function rollingAverage(months, currentIndex) {
  const start = Math.max(0, currentIndex - 6);
  const slice = months.slice(start, currentIndex);
  if (slice.length === 0) return null;
  const sum = slice.reduce((s, m) => s + (m.total_cost || 0), 0);
  return sum / slice.length;
}

/**
 * Detect anomalies: compare each month to 6-month rolling average; flag spikes.
 */
async function detectAnomalies(clientId) {
  const months = await getMonthlySeries(clientId);
  const anomalies = [];

  for (let i = MIN_MONTHS_FOR_ROLLING; i < months.length; i++) {
    const curr = months[i];
    const currentCost = Number(curr.total_cost || 0);
    const avg = rollingAverage(months, i);
    if (avg == null || avg <= 0) continue;

    const pctChange = ((currentCost - avg) / avg) * 100;
    if (pctChange > SPIKE_THRESHOLD_PCT) {
      anomalies.push({
        client_id: clientId,
        month: curr.month,
        type: "SPEND_SPIKE",
        description: `Cloud spend ${Math.round(pctChange)}% above 6-month rolling average`,
        impact: Number((currentCost - avg).toFixed(2)),
        current_cost: currentCost,
        rolling_avg: Number(avg.toFixed(2)),
      });
    }
  }

  for (const a of anomalies) {
    await supabase.from("dynamis_anomalies").upsert(a);
  }

  return anomalies;
}

module.exports = detectAnomalies;
module.exports.getMonthlySeries = getMonthlySeries;
module.exports.rollingAverage = rollingAverage;