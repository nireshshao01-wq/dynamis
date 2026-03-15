/**
 * FinOps Score API
 * Returns 0–100 maturity score and breakdown.
 */

const express = require("express");
const router = express.Router();
const finopsScore = require("../services/finopsScore");

router.get("/", async (req, res) => {
  try {
    const clientId = req.query.client;
    if (!clientId) {
      return res.status(400).json({
        success: false,
        error: "Query parameter 'client' is required",
      });
    }

    const result = await finopsScore.getFinOpsScore(clientId);
    res.json({
      success: true,
      clientId,
      ...result,
    });
  } catch (err) {
    console.error("FinOps score error:", err);
    res.status(500).json({
      success: false,
      error: "Failed to compute FinOps score",
      message: err.message,
    });
  }
});

module.exports = router;
