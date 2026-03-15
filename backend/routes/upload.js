const express = require("express")
const router = express.Router()
const multer = require("multer")
const csv = require("csv-parser")
const supabase = require("../supabaseClient")
const stream = require("stream")

/* ----------------------------------
MULTER CONFIG
---------------------------------- */

const storage = multer.memoryStorage()

const upload = multer({
storage: storage,
limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
})

/* ----------------------------------
UPLOAD CLOUD BILLING CSV
---------------------------------- */

router.post("/", upload.single("file"), async (req, res) => {

try {

const clientId = req.body.client_id

console.log("Upload received for client:", clientId)

if (!clientId) {
return res.status(400).json({ error: "Client ID missing" })
}

if (!req.file) {
return res.status(400).json({ error: "No file uploaded" })
}

const results = []

/* ----------------------------------
PARSE CSV
---------------------------------- */

const bufferStream = new stream.PassThrough()
bufferStream.end(req.file.buffer)

bufferStream
.pipe(csv())
.on("data", (row) => {

results.push({

client_id: clientId,

cloud_provider:
row.cloud_provider ||
row.provider ||
row.Provider ||
"",

service:
row.service ||
row.Service ||
"",

region:
row.region ||
row.Region ||
"",

usage_date:
row.usage_date ||
row.date ||
row.Date ||
new Date(),

cost:
Number(row.cost || row.Cost || 0),

waste_cost:
Number(row.waste_cost || row.Waste || 0),

category:
row.category ||
row.Category ||
"Compute"

})

})

.on("end", async () => {

console.log("CSV rows parsed:", results.length)

if (results.length === 0) {
return res.status(400).json({
error: "CSV contained no rows"
})
}

/* ----------------------------------
INSERT INTO SUPABASE (BATCH SAFE)
---------------------------------- */

const batchSize = 500

let inserted = 0

for (let i = 0; i < results.length; i += batchSize) {

const batch = results.slice(i, i + batchSize)

const { error } = await supabase
.from("cloud_cost_data")
.insert(batch)

if (error) {

console.error("Supabase insert error:", error)

return res.status(500).json({
error: "Database insert failed",
details: error.message
})

}

inserted += batch.length

}

console.log("Rows inserted:", inserted)

res.json({
message: "Upload successful",
rowsInserted: inserted
})

})

.on("error", (err) => {

console.error("CSV parsing error:", err)

res.status(500).json({
error: "CSV parsing failed"
})

})

} catch (err) {

console.error("Upload error:", err)

res.status(500).json({
error: "Upload processing failed"
})

}

})

module.exports = router