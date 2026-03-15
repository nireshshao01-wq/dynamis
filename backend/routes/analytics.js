/**
 * Monthly spend analytics API
 * Groups costs by cloud provider, service type, and month.
 */

const express = require("express");
const router = express.Router();
const analyticsEngine = require("../services/analyticsEngine");

router.get("/monthly", async (req, res) => {
  try {
    const clientId = req.query.client;
    if (!clientId) {
      return res.status(400).json({
        success: false,
        error: "Query parameter 'client' is required",
      });
    }

    const { startMonth, endMonth } = req.query;
    const result = await analyticsEngine.getMonthlySpendAnalytics(clientId, {
      startMonth: startMonth || undefined,
      endMonth: endMonth || undefined,
    });

    res.json({
      success: true,
      clientId,
      ...result,
    });
  } catch (err) {
    console.error("Analytics monthly error:", err);
    res.status(500).json({
      success: false,
      error: "Failed to load monthly spend analytics",
      message: err.message,
    });
  }
});

module.exports = router;
