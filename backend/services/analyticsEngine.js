/**
 * Analytics Engine – Monthly spend analytics
 * Groups costs by cloud provider, service type, and month.
 */

const supabase = require("../supabaseClient");

function getMonth(row) {
  if (row.month) return row.month;
  const d = row.usage_date;
  if (!d) return "Unknown";
  const s = typeof d === "string" ? d : (d.toISOString && d.toISOString()) || String(d);
  return s.slice(0, 7);
}

function getProvider(row) {
  const p = (row.cloud_provider || row.cloud || "").toString().toUpperCase();
  if (["AWS", "AZURE", "GCP"].includes(p)) return p;
  return p || "Unknown";
}

async function getMonthlySpendAnalytics(clientId, options = {}) {
  const { startMonth, endMonth } = options;
  let query = supabase.from("cloud_cost_data").select("cost, usage_date, month, cloud_provider, cloud, service, category").eq("client_id", clientId);
  if (startMonth) query = query.gte("usage_date", `${startMonth}-01`);
  if (endMonth) query = query.lte("usage_date", `${endMonth}-31`);
  const { data: rows, error } = await query;
  if (error) throw error;
  const byMonth = {}, byProvider = {}, byService = {}, byMonthProvider = {}, byMonthService = {};
  for (const r of rows || []) {
    const cost = Number(r.cost || 0);
    const month = getMonth(r);
    const provider = getProvider(r);
    const service = (r.service || r.category || "Other").toString().trim() || "Other";
    byMonth[month] = (byMonth[month] || 0) + cost;
    byProvider[provider] = (byProvider[provider] || 0) + cost;
    byService[service] = (byService[service] || 0) + cost;
    if (!byMonthProvider[month]) byMonthProvider[month] = {};
    byMonthProvider[month][provider] = (byMonthProvider[month][provider] || 0) + cost;
    if (!byMonthService[month]) byMonthService[month] = {};
    byMonthService[month][service] = (byMonthService[month][service] || 0) + cost;
  }
  const monthlySeries = Object.keys(byMonth).sort().map((m) => ({ month: m, cost: Number(byMonth[m].toFixed(2)) }));
  return {
    byMonth: Object.fromEntries(Object.entries(byMonth).map(([k, v]) => [k, Number(v.toFixed(2))])),
    byProvider: Object.fromEntries(Object.entries(byProvider).map(([k, v]) => [k, Number(v.toFixed(2))])),
    byService: Object.fromEntries(Object.entries(byService).map(([k, v]) => [k, Number(v.toFixed(2))])),
    byMonthProvider,
    byMonthService,
    monthlySeries,
  };
}

module.exports = { getMonthlySpendAnalytics, getMonth, getProvider };
