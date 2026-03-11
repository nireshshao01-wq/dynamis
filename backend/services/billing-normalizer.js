function normalizeBilling(rows,cloud){

let normalized = []

if(cloud==="AZURE"){

rows.forEach(r=>{
normalized.push({
service:r.MeterCategory,
resource:r.ResourceId,
cost:Number(r.CostInBillingCurrency||0),
region:r.ResourceLocation
})
})

}

if(cloud==="AWS"){

rows.forEach(r=>{
normalized.push({
service:r["product/ProductName"],
resource:r["lineItem/ResourceId"],
cost:Number(r["lineItem/UnblendedCost"]||0),
region:r["product/region"]
})
})

}

if(cloud==="GCP"){

rows.forEach(r=>{
normalized.push({
service:r["service.description"],
resource:r["resource.name"],
cost:Number(r.cost||0),
region:r["location.region"]
})
})

}

return normalized

}

module.exports = normalizeBilling