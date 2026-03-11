const express = require("express")
const router = express.Router()

const { createClient } = require("@supabase/supabase-js")

const supabase = createClient(
process.env.SUPABASE_URL,
process.env.SUPABASE_SERVICE_KEY
)

/*
GET ALL OPPORTUNITIES FOR USER CLIENT
*/

router.get("/", async (req,res)=>{

try{

const userId = req.headers.userid

if(!userId){
return res.status(400).json({error:"Missing user id"})
}

/* GET USER PROFILE */

const { data: profile, error: profileError } = await supabase
.from("profiles")
.select("client_id")
.eq("id", userId)
.single()

if(profileError){
console.error(profileError)
return res.status(500).json({error:"Failed to load profile"})
}

const clientId = profile.client_id

/* LOAD OPPORTUNITIES */

const { data, error } = await supabase
.from("dynamis_opportunities")
.select("*")
.eq("client_id", clientId)
.order("monthly_waste", {ascending:false})

if(error){
console.error(error)
return res.status(500).json({error:"Failed to load opportunities"})
}

res.json(data)

}catch(err){

console.error("Opportunity route error:",err)
res.status(500).json({error:"Server error"})

}

})

module.exports = router