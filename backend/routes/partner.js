const express = require("express")
const router = express.Router()

const supabase = require("../supabaseClient")

router.get("/", async (req,res)=>{

try{

const { data: clients, error } = await supabase
.from("clients")
.select("id,name")

if(error){
return res.status(500).json(error)
}

const results = []

for(const client of clients){

const { data: summary } = await supabase
.from("dynamis_finops_summary")
.select("*")
.eq("client_id",client.id)
.order("scan_date",{ascending:false})
.limit(1)

if(summary && summary.length){

results.push({
clientId:client.id,
clientName:client.name,
spend:summary[0].total_cost,
savings:summary[0].potential_savings,
riskScore:Math.round((summary[0].potential_savings / summary[0].total_cost) * 100)
})

}

}

res.json(results)

}catch(err){

console.error(err)
res.status(500).json(err)

}

})

module.exports = router
