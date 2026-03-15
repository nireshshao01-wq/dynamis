const supabase = require("../supabaseClient")

async function generateOpportunities(clientId){

try{

/* GET CLOUD COST DATA */

const { data: costs, error } = await supabase
.from("cloud_cost_data")
.select("*")
.eq("client_id", clientId)

if(error){
console.error("Cost fetch error:",error)
return
}

if(!costs || costs.length===0){
return
}

let opportunities=[]

costs.forEach(row=>{

const service=(row.service || "").toLowerCase()
const cost=row.cost || 0

/* RULE 1 — Idle Compute */

if(service.includes("ec2") || service.includes("vm")){

if(cost>200){

opportunities.push({
client_id: clientId,
service: row.service,
opportunity_type: "Idle Compute Resources",
potential_savings: cost*0.35,
confidence_score: 75
})

}

}

/* RULE 2 — Over-Provisioned Machines */

if(service.includes("compute")){

if(cost>300){

opportunities.push({
client_id: clientId,
service: row.service,
opportunity_type: "Over-Provisioned Instances",
potential_savings: cost*0.30,
confidence_score: 70
})

}

}

/* RULE 3 — Storage Waste */

if(service.includes("storage") || service.includes("s3")){

if(cost>100){

opportunities.push({
client_id: clientId,
service: row.service,
opportunity_type: "Storage Waste",
potential_savings: cost*0.25,
confidence_score: 65
})

}

}

/* RULE 4 — Network Waste */

if(service.includes("data") || service.includes("network")){

if(cost>150){

opportunities.push({
client_id: clientId,
service: row.service,
opportunity_type: "Network Waste",
potential_savings: cost*0.20,
confidence_score: 60
})

}

}

})

/* SAVE OPPORTUNITIES */

if(opportunities.length>0){

await supabase
.from("dynamis_opportunities")
.insert(opportunities)

}

console.log("Opportunities generated:", opportunities.length)

}catch(err){

console.error("Opportunity engine error:",err)

}

}

module.exports = generateOpportunities