const express = require("express")
const router = express.Router()
const supabase = require("../supabaseClient")

/** GET top margin recovery opportunities (from dynamis_opportunities or inline engine). */
router.get("/", async (req, res) => {
  try {
    const clientId = req.query.client
    if (!clientId) {
      return res.status(400).json({ success: false, error: "Query parameter 'client' is required", opportunities: [] })
    }
    const limit = Math.min(parseInt(req.query.limit, 10) || 5, 50)
    const { data, error } = await supabase
      .from("dynamis_opportunities")
      .select("*")
      .eq("client_id", clientId)
      .order("potential_savings", { ascending: false })
      .limit(limit)
    if (error) {
      console.error("Opportunities query error:", error)
      return res.status(500).json({ success: false, error: "Failed to load opportunities", message: error.message, opportunities: [] })
    }
    const opportunities = data || []
    res.json({ success: true, clientId, opportunities })
  } catch (err) {
    console.error("Opportunities route error:", err)
    res.status(500).json({ success: false, error: "Server error", opportunities: [] })
  }
})

module.exports = router