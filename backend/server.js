const express = require("express")
const cors = require("cors")
const path = require("path")

const app = express()

app.use(cors())
app.use(express.json())

/* FRONTEND */

const frontendPath = path.join(__dirname, "..", "frontend")

app.use(express.static(frontendPath))

console.log("Frontend served from:", frontendPath)

/* ROUTES */

const uploadRoute = require("./routes/upload")
const clientsRoute = require("./routes/clients")
const dashboardRoute = require("./routes/dashboard")
const opportunitiesRoute = require("./routes/opportunities")
const anomaliesRoute = require("./routes/anomalies")
const reportRoute = require("./routes/report")

app.use("/api/upload", uploadRoute)
app.use("/api/clients", clientsRoute)
app.use("/api/dashboard", dashboardRoute)
app.use("/api/opportunities", opportunitiesRoute)
app.use("/api/anomalies", anomaliesRoute)
app.use("/api/report", reportRoute)

/* FINOPS SCHEDULER */

const startFinopsScheduler = require("./scheduler/scanJob")

startFinopsScheduler()

/* SERVER */

const PORT = 3001

app.listen(PORT, () => {

console.log("DYNAMIS backend running on http://localhost:" + PORT)

})
