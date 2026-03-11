function runFinOpsRules(rows){

let findings = []

rows.forEach(r=>{

const cost = Number(r.cost || 0)

if(cost === 0){
return
}

/* Idle resource rule */

if(cost < 5){

findings.push({
type:"Idle Resource",
resource:r.resource,
service:r.service,
saving:cost * 12
})

}

/* Overprovisioned compute */

if(r.service && r.service.toLowerCase().includes("compute") && cost > 100){

findings.push({
type:"Overprovisioned Compute",
resource:r.resource,
service:r.service,
saving:cost * 0.25
})

}

/* Storage waste */

if(r.service && r.service.toLowerCase().includes("storage") && cost > 50){

findings.push({
type:"Storage Optimization",
resource:r.resource,
service:r.service,
saving:cost * 0.30
})

}

})

return findings

}

module.exports = runFinOpsRules