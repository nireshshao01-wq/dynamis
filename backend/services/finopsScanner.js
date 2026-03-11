const supabase = require("../supabaseClient")

async function runFinopsScan(){

console.log("Running DYNAMIS FinOps scan...")

const { data: clients } = await supabase
.from("clients")
.select("id")

for(const client of clients){

const clientId = client.id

/* LOAD CLOUD DATA */

const { data: rows } = await supabase
.from("cloud_cost_data")
.select("*")
.eq("client_id",clientId)

if(!rows || !rows.length) continue

let totalCost = 0
let potentialSavings = 0

let computeWaste = 0
let storageWaste = 0
let networkWaste = 0
let idleWaste = 0

rows.forEach(r=>{

const cost = Number(r.cost || 0)

totalCost += cost

if(r.utilization < 40){

const waste = cost * 0.25

potentialSavings += waste

if(r.service.includes("EC2") || r.service.includes("VM"))
computeWaste += waste

if(r.service.includes("Storage"))
storageWaste += waste

if(r.service.includes("Network"))
networkWaste += waste

if(r.utilization < 10)
idleWaste += waste

}

})

/* SAVE SUMMARY */

await supabase
.from("dynamis_finops_summary")
.insert({
client_id:clientId,
total_cost:totalCost,
potential_savings:potentialSavings,
scan_date:new Date()
})

/* SAVE OPPORTUNITIES */

rows.forEach(async r=>{

if(r.utilization < 40){

await supabase
.from("dynamis_opportunities")
.insert({
client_id:clientId,
service:r.service,
issue:"Low utilisation resource",
monthly_waste:r.cost*0.25
})

}

})

}

console.log("FinOps scan completed")

}

module.exports = runFinopsScan
