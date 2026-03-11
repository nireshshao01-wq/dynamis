const supabase = require('../supabaseClient')

async function detectAnomalies(clientId){

const { data: months, error } = await supabase
.from('dynamis_finops_summary')
.select('*')
.eq('client_id', clientId)
.order('month')

if(error) throw error

let anomalies = []

for(let i=1;i<months.length;i++){

const prev = months[i-1]
const curr = months[i]

if(!prev.total_cost || !curr.total_cost) continue

const diff = curr.total_cost - prev.total_cost
const percent = (diff / prev.total_cost) * 100

/* detect spike */

if(percent > 15){

anomalies.push({

client_id: clientId,
month: curr.month,
type: "SPEND_SPIKE",
description: `Cloud spend increased by ${Math.round(percent)}% compared to previous month`,
impact: diff

})

}

}

/* save anomalies */

for(const a of anomalies){

await supabase
.from('dynamis_anomalies')
.upsert(a)

}

return anomalies

}

module.exports = detectAnomalies