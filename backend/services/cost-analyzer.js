function analyzeCosts(rows) {

  let totalCost = 0;

  rows.forEach(r => {
    totalCost += r.cost;
  });

  const estimatedExposure = totalCost * 0.30;
  const projectedSavings = totalCost * 0.18;

  const riskScore = Math.min(
    100,
    Math.round((estimatedExposure / totalCost) * 100)
  );

  const confidence = 90;

  return {
    totalCost: Math.round(totalCost),
    estimatedExposure: Math.round(estimatedExposure),
    projectedSavings: Math.round(projectedSavings),
    riskScore,
    confidence
  };

}

module.exports = analyzeCosts;