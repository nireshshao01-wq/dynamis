function generateInsights(metrics, findings){

const insights = []

// cost growth insight
if(metrics.monthlyCosts){

const costs = metrics.monthlyCosts
const last = costs[costs.length-1]
const prev = costs[costs.length-2]

if(prev && last){

const growth = Math.round(((last-prev)/prev)*100)

if(growth > 10){

insights.push(
`Cloud spend increased ${growth}% compared to the previous period.`
)

}

}

}

// savings insight
if(metrics.projectedSavings && metrics.totalCost){

const percent = Math.round(
(metrics.projectedSavings/metrics.totalCost)*100
)

if(percent > 10){

insights.push(
`Optimization opportunities could reduce cloud spend by approximately ${percent}%.`
)

}

}

// findings insight
if(findings && findings.length){

insights.push(
`${findings.length} cost optimization opportunities were detected across compute, storage or networking resources.`
)

}

return insights

}

module.exports = generateInsights