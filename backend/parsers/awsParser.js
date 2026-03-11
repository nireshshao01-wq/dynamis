const csv = require('csv-parser')

function parseAWS(stream){

return new Promise((resolve,reject)=>{

const rows = []

stream
.pipe(csv())
.on('data',(row)=>{

const cost = Number(row.BlendedCost || row.UnblendedCost || 0)

if(cost <= 0) return

let category = "compute"

if(row.ProductName?.includes("S3")) category="storage"
if(row.ProductName?.includes("Data Transfer")) category="network"

rows.push({

cloud:"AWS",
service: row.ProductName || "AWS Service",
category,
cost,
utilization: 50,
month: new Date(row.UsageStartDate).toLocaleString('default',{month:'short'}),
date: row.UsageStartDate

})

})
.on('end',()=>resolve(rows))
.on('error',reject)

})

}

module.exports = parseAWS