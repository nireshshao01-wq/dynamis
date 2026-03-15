/**
 * Analytics Engine – Monthly spend analytics
 * Groups costs by cloud provider, service type, and month.
 */

const supabase = require("../supabaseClient");

/**
 * Normalize month from usage_date or month field.
 */
function getMonth(row) {
  if (row.month) return row.month;
  const d = row.usage_date;
  if (!d) return "Unknown";
  const s = typeof d === "string" ? d : (d.toISOString && d.toISOString()) || String(d);
  return s.slice(0, 7); // YYYY-MM
}

/**
 * Normalize cloud provider.
 */
function getProvider(row) {
  const p = (row.cloud_provider || row.cloud || "").toString().toUpperCase();
  if (["AWS", "AZURE", "GCP"].includes(p)) return p;
  if (p) return p;
  return "Unknown";
}

/**
 * Get monthly spend analytics for a client.
 * Returns: { byMonth, byProvider, byService, byMonthProvider, byMonthService }.
 */
async function getMonthlySpendAnalytics(clientId, options = {}) {
  const { startMonth, endMonth } = options;

  let query = supabase
    .from("cloud_cost_data")
    .select("cost, usage_date, month, cloud_provider, cloud, service, category")
    .eq("client_id", clientId);

  if (startMonth) query = query.gte("usage_date", `${startMonth}-01`);
  if (endMonth) query = query.lte("usage_date", `${endMonth}-31`);

  const { data: rows, error } = await query;

  if (error) throw error;

  const byMonth = {};
  const byProvider = {};
  const byService = {};
  const byMonthProvider = {};
  const byMonthService = {};

  for (const r of rows || []) {
    const cost = Number(r.cost || 0);
    const month = getMonth(r);
    const provider = getProvider(r);
    const service = (r.service || r.category || "Other").toString().trim() || "Other";

    if (!byMonth[month]) byMonth[month] = 0;
    byMonth[month] += cost;

    if (!byProvider[provider]) byProvider[provider] = 0;
    byProvider[provider] += cost;

    if (!byService[service]) byService[service] = 0;
    byService[service] += cost;

    const mk = month;
    if (!byMonthProvider[mk]) byMonthProvider[mk] = {};
    if (!byMonthProvider[mk][provider]) byMonthProvider[mk][provider] = 0;
    byMonthProvider[mk][provider] += cost;

    if (!byMonthService[mk]) byMonthService[mk] = {};
    if (!byMonthService[mk][service]) byMonthService[mk][service] = 0;
    byMonthService[mk][service] += cost;
  }

  const monthlySeries = Object.keys(byMonth)
    .sort()
    .map((m) => ({ month: m, cost: Number(byMonth[m].toFixed(2)) }));

  return {
    byMonth: Object.fromEntries(
      Object.entries(byMonth).map(([k, v]) => [k, Number(v.toFixed(2))])
    ),
    byProvider: Object.fromEntries(
      Object.entries(byProvider).map(([k, v]) => [k, Number(v.toFixed(2))])
    ),
    byService: Object.fromEntries(
      Object.entries(byService).map(([k, v]) => [k, Number(v.toFixed(2))])
    ),
    byMonthProvider,
    byMonthService,
    monthlySeries,
  };
}

module.exports = {
  getMonthlySpendAnalytics,
  getMonth,
  getProvider,
};
