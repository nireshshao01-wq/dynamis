const express = require("express")
const router = express.Router()
const supabase = require("../supabaseClient")
const finopsScore = require("../services/finopsScore")
const savingsOpportunities = require("../services/savingsOpportunities")

function getMonthFromDate(usageDate) {
  if (!usageDate) return null
  const s = typeof usageDate === "string" ? usageDate : (usageDate.toISOString && usageDate.toISOString()) || String(usageDate)
  return s.slice(0, 7)
}

/* TEST ROUTE */

router.get("/test", (req,res)=>{
  res.json({status:"dashboard router working"})
})

/* CFO METRICS – Executive dashboard metrics only */

router.get("/cfo-metrics", async (req, res) => {
  try {
    const clientId = req.query.client
    if (!clientId) return res.status(400).json({ success: false, error: "Client ID missing" })
    const [scoreResult, savingsResult] = await Promise.all([
      finopsScore.getFinOpsScore(clientId).catch(() => ({ score: 0, totalCost: 0, totalWaste: 0, breakdown: {} })),
      savingsOpportunities.getSavingsOpportunities(clientId, { limit: 5 }).catch(() => ({ totalPotentialSavings: 0 })),
    ])
    res.json({
      success: true,
      totalCloudSpend: scoreResult.totalCost,
      potentialSavings: scoreResult.totalWaste,
      finopsMaturityScore: scoreResult.score,
      wasteBreakdown: scoreResult.breakdown || {},
      topSavingsOpportunity: savingsResult.totalPotentialSavings,
    })
  } catch (err) {
    console.error("CFO metrics error:", err)
    res.status(500).json({ success: false, error: "CFO metrics failed", message: err.message })
  }
})

/* MAIN DASHBOARD ROUTE */

router.get("/dashboard-data", async (req, res) => {

try {

const clientId = req.query.client

if(!clientId){
return res.status(400).json({ success: false, error: "Client ID missing" })
}

const { data: rows, error } = await supabase
.from("cloud_cost_data")
.select("cost, usage_date, cloud_provider, service, category, utilization")
.eq("client_id", clientId)

if(error){
console.error("Supabase error:", error)
return res.status(500).json({ success: false, error: "Failed to load cloud data", message: error.message })
}

const dataRows = rows || []

/* METRICS */

let totalCost = 0
let awsCost = 0
let azureCost = 0
let gcpCost = 0

let computeWaste = 0
let storageWaste = 0
let networkWaste = 0
let idleWaste = 0

let monthlyMap = {}

for(const r of dataRows){
const cost = Number(r.cost || 0)
totalCost += cost
const provider = (r.cloud_provider || r.cloud || "").toString().toUpperCase()
const service = (r.service || "").toString().toUpperCase()
if(provider === "AWS") awsCost += cost
if(provider === "AZURE") azureCost += cost
if(provider === "GCP") gcpCost += cost
if(service.includes("EC2") || service.includes("VIRTUAL") || service.includes("VM")) computeWaste += cost * 0.20
if(service.includes("S3") || service.includes("BLOB")) storageWaste += cost * 0.15
if(service.includes("CDN") || service.includes("CLOUDFRONT") || service.includes("NETWORK")) networkWaste += cost * 0.10
if(service.includes("LAMBDA") || service.includes("FUNCTION")) idleWaste += cost * 0.05
const month = getMonthFromDate(r.usage_date)
if(month){ monthlyMap[month] = (monthlyMap[month] || 0) + cost }
}

/* TOTAL WASTE */

const totalWaste = computeWaste + storageWaste + networkWaste + idleWaste

/* MONTHLY SERIES */

const monthlySeries = Object.keys(monthlyMap)
.sort()
.map(m=>({
month:m,
cost:Number(monthlyMap[m].toFixed(2))
}))

/* WASTE PERCENTAGES */

const computeWastePercent = totalWaste ? Math.round((computeWaste/totalWaste)*100) : 0
const storageWastePercent = totalWaste ? Math.round((storageWaste/totalWaste)*100) : 0
const networkWastePercent = totalWaste ? Math.round((networkWaste/totalWaste)*100) : 0
const idleWastePercent = totalWaste ? Math.round((idleWaste/totalWaste)*100) : 0

/* RISK SCORE */

const riskScore = totalCost
? Math.min(100, Math.round((totalWaste/totalCost)*100))
: 0

/* CFO FINANCIAL IMPACT */

const recoverableValue = totalWaste * 36   // 3 year value

const platformFee = recoverableValue * 0.20   // DYNAMIS fee model

const netClientBenefit = recoverableValue - platformFee

const roi = platformFee > 0 ? Math.round((netClientBenefit / platformFee) * 100) : 0

let finopsScoreResult = { score: Math.max(0, 100 - riskScore), breakdown: {} }
let savingsSummary = { opportunities: [], totalPotentialSavings: 0 }
try {
  finopsScoreResult = await finopsScore.getFinOpsScore(clientId)
  const savings = await savingsOpportunities.getSavingsOpportunities(clientId, { limit: 10 })
  savingsSummary = { opportunities: savings.opportunities, totalPotentialSavings: savings.totalPotentialSavings }
} catch (e) {
  console.warn("FinOps/savings optional load failed:", e.message)
}

res.json({
  success: true,
  totalCost: Number(totalCost.toFixed(2)),
  potentialSavings: Number(totalWaste.toFixed(2)),
  awsCost: Number(awsCost.toFixed(2)),
  azureCost: Number(azureCost.toFixed(2)),
  gcpCost: Number(gcpCost.toFixed(2)),
  providerTotals: {
    AWS: Number(awsCost.toFixed(2)),
    AZURE: Number(azureCost.toFixed(2)),
    GCP: Number(gcpCost.toFixed(2))
  },
  computeWaste: Number(computeWaste.toFixed(2)),
  storageWaste: Number(storageWaste.toFixed(2)),
  networkWaste: Number(networkWaste.toFixed(2)),
  idleWaste: Number(idleWaste.toFixed(2)),
  computeWastePercent,
  storageWastePercent,
  networkWastePercent,
  idleWastePercent,
  monthlySeries,
  riskScore,
  confidence: 80,
  finopsScore: finopsScoreResult.score,
  wasteBreakdown: finopsScoreResult.breakdown || {},
  savingsOpportunities: savingsSummary.opportunities,
  totalPotentialSavingsFromEngine: savingsSummary.totalPotentialSavings,
  cfoImpact: {
    recoverableValue: Number(recoverableValue.toFixed(2)),
    platformFee: Number(platformFee.toFixed(2)),
    netClientBenefit: Number(netClientBenefit.toFixed(2)),
    roi
  }
})

} catch (err) {
  console.error("Dashboard error:", err)
  res.status(500).json({ success: false, error: "Dashboard processing failed", message: err.message })
}

})

module.exports = router