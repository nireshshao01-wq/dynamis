const { createClient } = require("@supabase/supabase-js")

/* --------------------------------
ENVIRONMENT VARIABLES
-------------------------------- */

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY

/* --------------------------------
VALIDATION
-------------------------------- */

if (!supabaseUrl) {
  console.error("❌ SUPABASE_URL environment variable is missing")
  process.exit(1)
}

if (!supabaseKey) {
  console.error("❌ SUPABASE_KEY environment variable is missing")
  process.exit(1)
}

/* --------------------------------
SUPABASE CLIENT
-------------------------------- */

const supabase = createClient(supabaseUrl, supabaseKey)

console.log("✅ Supabase connected")

module.exports = supabase