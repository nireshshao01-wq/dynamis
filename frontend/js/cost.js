let CURRENT_SECTION = 1;

async function init(){

  const res = await fetch("http://localhost:3001/api/monthly-series");
  const data = await res.json();

  if(!data?.length) return;

  loadDemo(data[0]);
}

function nextSection(){

  if(CURRENT_SECTION < 6){
    CURRENT_SECTION++;
    document.getElementById("sec"+CURRENT_SECTION)
      .classList.add("active");
  }
}

function loadDemo(m){

  const total = Number(m.total_cost||0);
  const savings = Number(m.savings||0);

  const compute = Number(m.compute_cost||0);
  const storage = Number(m.storage_cost||0);
  const network = Number(m.network_cost||0);

  let driver="Compute", val=compute;
  if(storage>val){driver="Storage";val=storage;}
  if(network>val){driver="Network";val=network;}

  const pct = total ? ((val/total)*100).toFixed(1) : 0;

  const annualSpend = total*12;
  const annualRecovery = annualSpend*(savings/total);

  document.getElementById("impactBanner").innerText =
    `💰 DYNAMIS identified R ${savings.toLocaleString()} recoverable margin`;

  document.getElementById("impactText").innerText =
    `Immediate margin recovery opportunity identified at R ${savings.toLocaleString()}.`;

  document.getElementById("riskText").innerText =
    `${driver} represents ${pct}% of spend, indicating elevated financial exposure.`;

  document.getElementById("driverText").innerText =
    `${driver} is the primary optimization target based on spend concentration.`;

  document.getElementById("annualOpportunity").innerText =
    `R ${annualRecovery.toLocaleString()}`;

  document.getElementById("salesNarrative").innerText =
    `Projected annual recoverable margin opportunity based on current cloud consumption patterns.`;

  document.getElementById("execNarrative").innerText =
    `DYNAMIS recommends initiating a structured margin recovery program targeting ${driver}, with annual recovery potential exceeding R ${annualRecovery.toLocaleString()}.`;
}

init();