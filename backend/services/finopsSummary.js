const supabase = require('../supabaseClient')

async function generateFinopsSummary(clientId){

const { data: rows, error } = await supabase
.from('cloud_cost_data')
.select('*')
.eq('client_id',clientId)

if(error){
throw error
}

let summary = {}

rows.forEach(row=>{

const month = row.month || "Unknown"

if(!summary[month]){
summary[month] = {
total_cost:0,
aws_cost:0,
azure_cost:0,
gcp_cost:0,
compute_waste:0,
storage_waste:0,
network_waste:0,
idle_waste:0
}
}

const s = summary[month]

const cost = Number(row.cost || 0)

s.total_cost += cost

if(row.cloud === "AWS") s.aws_cost += cost
if(row.cloud === "AZURE") s.azure_cost += cost
if(row.cloud === "GCP") s.gcp_cost += cost

if(row.category === "compute") s.compute_waste += cost
if(row.category === "storage") s.storage_waste += cost
if(row.category === "network") s.network_waste += cost
if(row.category === "idle") s.idle_waste += cost

})

/* SAVE SUMMARY */

for(const month in summary){

const s = summary[month]

await supabase
.from('dynamis_finops_summary')
.upsert({

client_id:clientId,
month,

total_cost:s.total_cost,
aws_cost:s.aws_cost,
azure_cost:s.azure_cost,
gcp_cost:s.gcp_cost,

compute_waste:s.compute_waste,
storage_waste:s.storage_waste,
network_waste:s.network_waste,
idle_waste:s.idle_waste

})

}

}

module.exports = generateFinopsSummary