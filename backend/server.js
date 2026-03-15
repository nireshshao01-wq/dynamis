/* -----------------------------
LOAD ENVIRONMENT VARIABLES
----------------------------- */

require("dotenv").config({ path: __dirname + "/.env" })

console.log("SUPABASE_URL:", process.env.SUPABASE_URL)

/* -----------------------------
IMPORTS
----------------------------- */

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
FRONTEND STATIC FILES
----------------------------- */

const frontendPath = path.join(__dirname, "..", "frontend")

app.use(express.static(frontendPath))

console.log("Frontend served from:", frontendPath)

/* -----------------------------
ROOT HEALTH ROUTE (IMPORTANT FOR RENDER)
----------------------------- */

app.get("/", (req, res) => {
  res.send("DYNAMIS backend running")
})

/* -----------------------------
API HEALTH CHECK
----------------------------- */

app.get("/api/health", (req, res) => {
  res.json({
    status: "DYNAMIS API running",
    time: new Date()
  })
})

/* -----------------------------
ROUTES
----------------------------- */

const uploadRoute = require("./routes/upload")
const clientsRoute = require("./routes/clients")
const dashboardRoute = require("./routes/dashboard")
const opportunitiesRoute = require("./routes/opportunities")
const anomaliesRoute = require("./routes/anomalies")
const reportRoute = require("./routes/report")
const analyticsRoute = require("./routes/analytics")
const finopsScoreRoute = require("./routes/finopsScore")
const savingsRoute = require("./routes/savings")

app.use("/api/upload", uploadRoute)
app.use("/api/clients", clientsRoute)
app.use("/api", dashboardRoute)
app.use("/api/opportunities", opportunitiesRoute)
app.use("/api/anomalies", anomaliesRoute)
app.use("/api/report", reportRoute)
app.use("/api/analytics", analyticsRoute)
app.use("/api/finops-score", finopsScoreRoute)
app.use("/api/savings", savingsRoute)

/* -----------------------------
FINOPS AUTOMATION
----------------------------- */

const startFinopsScheduler = require("./scheduler/scanJob")

startFinopsScheduler()

console.log("DYNAMIS FinOps scheduler started")

/* -----------------------------
START SERVER
----------------------------- */

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log("DYNAMIS backend running on port " + PORT)
})