const supabase = require("../supabaseClient")

async function generateAIAdvice(clientId){

const { data: rows } = await supabase
.from("cloud_cost_data")
.select("*")
.eq("client_id", clientId)

if(!rows || !rows.length){
return "No cloud billing data available."
}

let totalCost = 0
let totalWaste = 0

let computeWaste = 0
let storageWaste = 0
let networkWaste = 0

rows.forEach(r => {

const cost = Number(r.cost || 0)

totalCost += cost

if(r.utilization < 40){

const waste = cost * 0.25

totalWaste += waste

if(r.service.includes("EC2") || r.service.includes("VM"))
computeWaste += waste

if(r.service.includes("Storage"))
storageWaste += waste

if(r.service.includes("Network"))
networkWaste += waste

}

})

let topWaste = "Compute"

if(storageWaste > computeWaste) topWaste = "Storage"
if(networkWaste > computeWaste) topWaste = "Network"

return `
Your organisation is currently spending approximately R ${Math.round(totalCost).toLocaleString()} on cloud infrastructure.

DYNAMIS has identified roughly R ${Math.round(totalWaste).toLocaleString()} in potential savings.

The largest optimisation opportunity appears in ${topWaste} services.

Recommended actions:

• Rightsize compute instances
• Remove idle infrastructure
• Optimise storage tiers
• Review network transfer architecture
`

}

module.exports = generateAIAdvice
