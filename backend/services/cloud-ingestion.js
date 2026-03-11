const fs = require("fs")
const parseCSV = require("./parser")
const { analyzeCosts } = require("./cost-analyzer")

async function ingestCloudData(filePath, clientId) {

  try {

    // read uploaded file
    const fileContent = fs.readFileSync(filePath, "utf8")

    // parse CSV rows
    const rows = parseCSV(fileContent)

    if (!rows || rows.length === 0) {
      return {
        error: "CSV contained no records"
      }
    }

    // run Dynamis cost analysis engine
    const analysis = analyzeCosts(rows)

    return {
      clientId,
      records: rows.length,
      ...analysis
    }

  } catch (err) {

    console.error("Cloud ingestion error:", err)

    return {
      error: "Failed to process file"
    }

  }

}

module.exports = {
  ingestCloudData
}