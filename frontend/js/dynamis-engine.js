// =====================================
// DYNAMIS ENGINE (PRO+ PERFORMANCE)
// =====================================

const DYNAMIS_CACHE_KEY = "dynamis_kpi_cache";

// -------------------------------
// CACHE HELPERS
// -------------------------------
function getCache() {
  const raw = localStorage.getItem(DYNAMIS_CACHE_KEY);
  return raw ? JSON.parse(raw) : {};
}

function setCache(cache) {
  localStorage.setItem(
    DYNAMIS_CACHE_KEY,
    JSON.stringify(cache)
  );
}

// -------------------------------
// MONTHS (cached)
// -------------------------------
async function getMonths() {

  const cache = getCache();

  if (cache.months) {
    // background refresh
    refreshMonths();
    return cache.months;
  }

  return await refreshMonths();
}

async function refreshMonths() {

  const res = await fetch("/api/months");
  const data = await res.json();

  if (!data.ok) return [];

  const cache = getCache();
  cache.months = data.months;
  setCache(cache);

  return data.months;
}

// -------------------------------
// KPI (cached)
// -------------------------------
async function getKPI(month) {

  const cache = getCache();

  if (cache[month]) {
    // background refresh
    refreshKPI(month);
    return cache[month];
  }

  return await refreshKPI(month);
}

async function refreshKPI(month) {

  const res = await fetch("/api/kpis?month=" + month);
  const data = await res.json();

  if (!data.ok) return { totalCost: 0 };

  const cache = getCache();
  cache[month] = data.kpis;
  setCache(cache);

  return data.kpis;
}

// -------------------------------
// GLOBAL MONTH
// -------------------------------
function getGlobalMonth() {
  return localStorage.getItem("dynamis_selected_month");
}

function setGlobalMonth(m) {
  localStorage.setItem("dynamis_selected_month", m);
}