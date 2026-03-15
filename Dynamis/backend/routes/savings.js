/**
 * Savings opportunities API
 * Returns idle instances, oversized compute, unattached storage, data transfer inefficiencies.
 */

const express = require("express");
const router = express.Router();
const savingsEngine = require("../services/savingsEngine");

router.get("/", async (req, res) => {
  try {
    const clientId = req.query.client;
    if (!clientId) {
      return res.status(400).json({
        success: false,
        error: "Query parameter 'client' is required",
      });
    }

    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);
    const result = await savingsEngine.getSavingsOpportunities(clientId, { limit });

    res.json({
      success: true,
      clientId,
      opportunities: result.opportunities,
      byType: result.byType,
      totalPotentialSavings: result.totalPotentialSavings,
      count: result.count,
    });
  } catch (err) {
    console.error("Savings opportunities error:", err);
    res.status(500).json({
      success: false,
      error: "Failed to load savings opportunities",
      message: err.message,
    });
  }
});

module.exports = router;
