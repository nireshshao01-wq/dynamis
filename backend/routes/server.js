const express = require("express")
const cors = require("cors")
const path = require("path")

const app = express()

/* -----------------------------
MIDDLEWARE
----------------------------- */

app.use(cors())
app.use(express.json())

/* -----------------------------
SERVE FRONTEND
----------------------------- */

const frontendPath = path.join(__dirname, "..", "frontend")

app.use(express.static(frontendPath))

console.log("Frontend served from:", frontendPath)

/* -----------------------------
API ROUTES
----------------------------- */

const uploadRoute = require("./routes/upload")
const clientsRoute = require("./routes/clients")
const dashboardRoute = require("./routes/dashboard")
const opportunitiesRoute = require("./routes/opportunities")
const anomaliesRoute = require("./routes/anomalies")
const reportRoute = require("./routes/report")
const aiRoute = require("./routes/ai")
const partnerRoute = require("./routes/partner")   // NEW ROUTE

app.use("/api/upload", uploadRoute)
app.use("/api/clients", clientsRoute)
app.use("/api/dashboard", dashboardRoute)
app.use("/api/opportunities", opportunitiesRoute)
app.use("/api/anomalies", anomaliesRoute)
app.use("/api/report", reportRoute)
app.use("/api/ai", aiRoute)
app.use("/api/partner", partnerRoute)              // REGISTER PARTNER API

/* -----------------------------
FINOPS AUTOMATION
Nightly optimisation scans
----------------------------- */

const startFinopsScheduler = require("./scheduler/scanJob")

startFinopsScheduler()

/* -----------------------------
HEALTH CHECK
Useful for testing server status
----------------------------- */

app.get("/api/health", (req, res) => {
res.json({
status: "DYNAMIS API running",
time: new Date()
})
})

/* -----------------------------
DEFAULT ROUTE
Loads frontend index
----------------------------- */

app.get("*", (req, res) => {
res.sendFile(path.join(frontendPath, "index.html"))
})

/* -----------------------------
START SERVER
----------------------------- */

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
console.log("DYNAMIS running on http://localhost:" + PORT)
})
