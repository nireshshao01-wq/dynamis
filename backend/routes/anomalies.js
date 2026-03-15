/**
 * Anomalies API
 * Returns detected cost spikes (by client or by user profile). Uses 6-month rolling average.
 */

const express = require("express");
const router = express.Router();
const supabase = require("../supabaseClient");
const detectAnomalies = require("../services/anomalyDetection");

router.get("/", async (req, res) => {
  try {
    const clientId = req.query.client;
    const userId = req.headers.userid;

    let resolvedClientId = clientId;
    if (!resolvedClientId && userId) {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("client_id")
        .eq("id", userId)
        .single();
      if (profileError || !profile) {
        return res.status(401).json({ success: false, error: "User not authenticated or profile not found" });
      }
      resolvedClientId = profile.client_id;
    }

    if (!resolvedClientId) {
      return res.status(400).json({ success: false, error: "Provide query parameter 'client' or header 'userid'" });
    }

    if (req.query.detect === "true") {
      await detectAnomalies(resolvedClientId);
    }

    const { data, error } = await supabase
      .from("dynamis_anomalies")
      .select("*")
      .eq("client_id", resolvedClientId)
      .order("impact", { ascending: false });

    if (error) {
      console.error("Anomalies query error:", error);
      return res.status(500).json({ success: false, error: "Failed to load anomalies", message: error.message });
    }

    const anomalies = data || [];
    res.json({ success: true, clientId: resolvedClientId, anomalies });
  } catch (err) {
    console.error("Anomalies route error:", err);
    res.status(500).json({ success: false, error: "Anomalies processing failed", message: err.message });
  }
});

module.exports = router;
