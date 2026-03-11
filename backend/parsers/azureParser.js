const csv = require('csv-parser')

function parseAzure(stream){

return new Promise((resolve,reject)=>{

const rows=[]

stream
.pipe(csv())
.on('data',(row)=>{

const cost = Number(row.Cost || 0)

if(cost <= 0) return

let category="compute"

if(row.MeterCategory?.includes("Storage")) category="storage"
if(row.MeterCategory?.includes("Bandwidth")) category="network"

rows.push({

cloud:"AZURE",
service: row.MeterCategory || "Azure Service",
category,
cost,
utilization:50,
month:new Date(row.Date).toLocaleString('default',{month:'short'}),
date:row.Date

})

})
.on('end',()=>resolve(rows))
.on('error',reject)

})

}

module.exports = parseAzure