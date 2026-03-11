const csv = require('csv-parser')

function parseGCP(stream){

return new Promise((resolve,reject)=>{

const rows=[]

stream
.pipe(csv())
.on('data',(row)=>{

const cost = Number(row.cost || 0)

if(cost <= 0) return

let category="compute"

if(row.service?.includes("Storage")) category="storage"
if(row.service?.includes("Network")) category="network"

rows.push({

cloud:"GCP",
service: row.service || "GCP Service",
category,
cost,
utilization:50,
month:new Date(row.usage_start_time).toLocaleString('default',{month:'short'}),
date:row.usage_start_time

})

})
.on('end',()=>resolve(rows))
.on('error',reject)

})

}

module.exports = parseGCP