function calculateRiskScore(data){

let idleRisk = 0
let computeRisk = 0
let storageRisk = 0
let trendRisk = 0

/* Idle Resources */

const idlePercent = data.idleWastePercent || 0

idleRisk = Math.min(100, idlePercent * 1.5)


/* Compute Waste */

const computePercent = data.computeWastePercent || 0

computeRisk = Math.min(100, computePercent * 1.3)


/* Storage Waste */

const storagePercent = data.storageWastePercent || 0

storageRisk = Math.min(100, storagePercent * 1.2)


/* Cost Trend */

const monthly = data.monthlyCosts || []

if(monthly.length > 1){

const first = monthly[0]
const last = monthly[monthly.length - 1]

const increase = ((last - first) / first) * 100

trendRisk = Math.max(0, increase)

}

const score =
idleRisk * 0.30 +
computeRisk * 0.25 +
storageRisk * 0.20 +
trendRisk * 0.25

return Math.round(Math.min(100, score))

}

module.exports = { calculateRiskScore }