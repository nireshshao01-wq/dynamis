function animateCurrency(element, start, end, duration) {
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    const value = Math.floor(progress * (end - start) + start);
    element.innerText = `R ${value.toLocaleString()}`;
    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };
  window.requestAnimationFrame(step);
}

function animateNumber(element, start, end, duration, suffix = "") {
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    const value = (progress * (end - start) + start).toFixed(1);
    element.innerText = `${value}${suffix}`;
    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };
  window.requestAnimationFrame(step);
}

async function loadOutcome() {
  try {
    const response = await fetch("/api/monthly-series");
    const data = await response.json();

    if (!data || data.length === 0) {
      document.getElementById("headline").innerText =
        "Upload monthly data to generate outcome.";
      return;
    }

    const totalSpend = data.reduce((sum, m) => sum + m.total_cost, 0);
    const avgMonthlySpend = totalSpend / data.length;

    const leakageRate = 0.18;
    const recoverableRate = 0.75;

    const annualLeakage = Math.round(avgMonthlySpend * 12 * leakageRate);
    const recoverable = Math.round(annualLeakage * recoverableRate);

    document.getElementById("headline").innerText =
      "Estimated Annual Margin Leakage";

    animateCurrency(
      document.getElementById("recoverableAmount"),
      0,
      recoverable,
      1500
    );

    animateCurrency(
      document.getElementById("leakageValue"),
      0,
      annualLeakage,
      1500
    );

    animateCurrency(
      document.getElementById("recoverableValue"),
      0,
      recoverable,
      1500
    );

    // ================= TIER RECOMMENDATION =================

    let recommendedTier = "";
    let recommendationMessage = "";
    let annualEngagementCost = 0;

    if (annualLeakage < 3000000) {
      recommendedTier = "tier1";
      recommendationMessage =
        "Recommended: Platform Access – Leakage manageable with governance tooling.";
      annualEngagementCost = 45000 * 12;
    } else if (annualLeakage < 15000000) {
      recommendedTier = "tier2";
      recommendationMessage =
        "Recommended: Guided Recovery – Active governance accelerates recovery.";
      annualEngagementCost = 120000 * 12;
    } else {
      recommendedTier = "tier3";
      recommendationMessage =
        "Recommended: Performance-Linked – Margin size justifies aligned recovery model.";
      annualEngagementCost = 60000 * 12;
    }

    document.getElementById(recommendedTier).classList.add("featured");
    document.getElementById("recommendationText").innerText =
      recommendationMessage;

    // ================= ROI CALCULATION =================

    const roiMultiple = recoverable / annualEngagementCost;

    animateNumber(
      document.getElementById("roiValue"),
      0,
      roiMultiple,
      1500,
      "x Return"
    );

  } catch (err) {
    console.error("Outcome error:", err);
  }
}

loadOutcome();