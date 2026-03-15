async function loadAnomalies(user){

try{

const res = await fetch("/api/anomalies",{
headers:{userid:user.id}
})

const data = await res.json()
const anomalies = Array.isArray(data) ? data : (data.anomalies || [])

const container = document.getElementById("anomalyList")

container.innerHTML=""

if(!anomalies.length){

container.innerHTML = "<li>No spend anomalies detected.</li>"
return

}

anomalies.forEach(a=>{

const li = document.createElement("li")

li.innerHTML = `
<strong>${a.month}</strong> – ${a.description} 
(Impact: R ${Number(a.impact).toLocaleString()})
`

container.appendChild(li)

})

}catch(err){

console.error("Failed to load anomalies",err)

}

}