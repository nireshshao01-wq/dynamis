const express = require('express')
const router = express.Router()
const supabase = require('../supabaseClient')

router.get('/dashboard-data', async (req, res) => {

try {

const userId = req.headers.userid

if(!userId){
return res.status(401).json({error:'User not authenticated'})
}

/* STEP 1
GET CLIENT LINKED TO USER
*/

const { data: profile, error: profileError } = await supabase
.from('profiles')
.select('client_id')
.eq('id', userId)
.single()

if(profileError){
return res.status(500).json(profileError)
}

const clientId = profile.client_id

if(!clientId){
return res.status(400).json({error:'User not assigned to client'})
}

/* STEP 2
LOAD CLOUD DATA
*/

const { data: cloudData, error: cloudError } = await supabase
.from('cloud_cost_data')
.select('*')
.eq('client_id', clientId)

if(cloudError){
return res.status(500).json(cloudError)
}

/* STEP 3
INITIALISE METRICS
*/

let totalCost = 0
let potentialSavings = 0

let awsCost = 0
let azureCost = 0
let gcpCost = 0

let computeWaste = 0
let storageWaste = 0
let networkWaste = 0
let idleWaste = 0

let monthlyMap = {}

/* STEP 4
PROCESS DATA
*/

cloudData.forEach(row => {

const cost = Number(row.cost || 0)

totalCost += cost

/* CLOUD SPLIT */

if(row.cloud === "AWS") awsCost += cost
if(row.cloud === "AZURE") azureCost += cost
if(row.cloud === "GCP") gcpCost += cost

/* SAVINGS LOGIC */

if(row.utilization && row.utilization < 40){
potentialSavings += cost * 0.25
}

/* CATEGORY WASTE */

if(row.category === "compute") computeWaste += cost
if(row.category === "storage") storageWaste += cost
if(row.category === "network") networkWaste += cost
if(row.category === "idle") idleWaste += cost

/* MONTHLY TREND */

const month = row.month || "Unknown"

if(!monthlyMap[month]){
monthlyMap[month] = 0
}

monthlyMap[month] += cost

})

/* STEP 5
MONTHLY TREND ARRAYS
*/

const monthLabels = Object.keys(monthlyMap)
const monthlyCosts = Object.values(monthlyMap)

/* STEP 6
RISK SCORE
*/

let riskScore = 0

if(totalCost > 0){
riskScore = Math.min(
100,
Math.round((potentialSavings / totalCost) * 100)
)
}

/* STEP 7
HEATMAP PERCENTAGES
*/

const computeWastePercent = totalCost ? Math.round((computeWaste / totalCost) * 100) : 0
const storageWastePercent = totalCost ? Math.round((storageWaste / totalCost) * 100) : 0
const networkWastePercent = totalCost ? Math.round((networkWaste / totalCost) * 100) : 0
const idleWastePercent = totalCost ? Math.round((idleWaste / totalCost) * 100) : 0

/* STEP 8
AI INSIGHTS
*/

let insights = []

if(computeWastePercent > 40){
insights.push("High compute spend detected. Rightsizing instances could significantly reduce costs.")
}

if(storageWastePercent > 20){
insights.push("Storage optimisation opportunity detected. Review unused or cold storage tiers.")
}

if(networkWastePercent > 15){
insights.push("Network transfer costs appear high. Investigate cross-region data transfers.")
}

if(idleWastePercent > 10){
insights.push("Idle resources detected. Removing unused infrastructure could reduce waste.")
}

/* STEP 9
CONFIDENCE SCORE
*/

let confidence = 80

if(cloudData.length > 200){
confidence = 92
}

if(cloudData.length > 500){
confidence = 96
}

/* STEP 10
RESPONSE
*/

res.json({

totalCost,
potentialSavings,
riskScore,
confidence,

awsCost,
azureCost,
gcpCost,

monthLabels,
monthlyCosts,

computeWastePercent,
storageWastePercent,
networkWastePercent,
idleWastePercent,

insights

})

} catch(err){

console.error("Dashboard error:",err)
res.status(500).json(err)

}

})

module.exports = router