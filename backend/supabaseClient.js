const { createClient } = require("@supabase/supabase-js")

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error("Supabase environment variables missing")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

module.exports = supabase