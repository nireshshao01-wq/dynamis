// supabase.js
// DYNAMIS Cloud Margin Recovery Engine
// Supabase client connection

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

/* SUPABASE PROJECT CONFIG */

const SUPABASE_URL = "https://icbeutxlymybhvwauezk.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_SqGgkU6wkea_-VkOSHnm_g_HqlL7p2W";

/* CREATE CLIENT */

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);

/* OPTIONAL: CONNECTION TEST */

async function testConnection() {

  try {

    const { data, error } = await supabase
      .from("dynamis_monthly_series")
      .select("*")
      .limit(1);

    if (error) {
      console.warn("Supabase connected but table not ready:", error.message);
    } else {
      console.log("✅ Supabase connected to DYNAMIS database");
    }

  } catch (err) {
    console.warn("Supabase connection test skipped.");
  }

}

/* Run connection test silently */

testConnection();