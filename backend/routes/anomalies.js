const express = require('express')
const router = express.Router()

const supabase = require('../supabaseClient')

router.get('/', async (req,res)=>{

try{

const userId = req.headers.userid

if(!userId){
return res.status(401).json({error:"User not authenticated"})
}

/* GET USER CLIENT */

const { data: profile } = await supabase
.from('profiles')
.select('client_id')
.eq('id',userId)
.single()

const clientId = profile.client_id

/* LOAD ANOMALIES */

const { data, error } = await supabase
.from('dynamis_anomalies')
.select('*')
.eq('client_id',clientId)
.order('impact',{ascending:false})

if(error){
return res.status(500).json(error)
}

res.json(data)

}catch(err){

console.error(err)
res.status(500).json(err)

}

})

module.exports = router