import { supabase } from "./supabase.js";

/* ================================
   GET CLIENT ID
================================ */

async function getClientId() {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("client_id")
    .eq("id", userData.user.id)
    .single();

  if (error || !data?.client_id) return null;

  return data.client_id;
}

/* ================================
   SAVE MONTHLY TOTAL
================================ */

export async function saveMonthly(month, totalCost) {
  const clientId = await getClientId();

  if (!clientId) {
    return { success: false, error: "Client ID not found" };
  }

  const { error } = await supabase
    .from("monthly_series")
    .insert([
      {
        client_id: clientId,
        month: month,
        total_cost: totalCost
      }
    ]);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

/* ================================
   GET MONTHLY SERIES
================================ */

export async function getMonthlySeries() {
  const clientId = await getClientId();
  if (!clientId) return [];

  const { data, error } = await supabase
    .from("monthly_series")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: true });

  if (error) return [];

  return data;
}

/* ================================
   EXECUTIVE SUMMARY
================================ */

export async function getExecutiveSummary() {
  const series = await getMonthlySeries();
  if (!series.length) return null;

  const totalSpend = series.reduce((sum, r) => sum + r.total_cost, 0);
  const estimatedRecoverable = totalSpend * 0.12;

  return {
    totalSpend,
    estimatedRecoverable
  };
}