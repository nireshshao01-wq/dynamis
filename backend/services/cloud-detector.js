function detectCloud(rows){

const headers = Object.keys(rows[0])

if(headers.includes("ResourceGroup") || headers.includes("MeterCategory")){
return "AZURE"
}

if(headers.includes("lineItem/UsageAccountId") || headers.includes("product/ProductName")){
return "AWS"
}

if(headers.includes("project.id") || headers.includes("service.description")){
return "GCP"
}

return "UNKNOWN"

}

module.exports = detectCloud