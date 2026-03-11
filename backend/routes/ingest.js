// routes/ingest.js
// Cloud cost ingestion routes for DYNAMIS

const express = require("express");
const router = express.Router();

const {
  fetchAwsCosts,
  fetchAzureCosts,
  fetchGcpCosts
} = require("../services/cloud-ingestion");

/* AWS */

router.get("/ingest/aws", async (req, res) => {

  try {

    const data = await fetchAwsCosts();

    res.json({
      provider: "AWS",
      records: data.length,
      data
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: "AWS ingestion failed"
    });

  }

});

/* AZURE */

router.get("/ingest/azure", async (req, res) => {

  try {

    const data = await fetchAzureCosts();

    res.json({
      provider: "Azure",
      records: data.length,
      data
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: "Azure ingestion failed"
    });

  }

});

/* GCP */

router.get("/ingest/gcp", async (req, res) => {

  try {

    const data = await fetchGcpCosts();

    res.json({
      provider: "GCP",
      records: data.length,
      data
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: "GCP ingestion failed"
    });

  }

});

module.exports = router;