const express = require('express')
const router = express.Router()

const supabase = require('../supabaseClient')
const generateReport = require('../services/reportGenerator')

router.get('/', async (req,res)=>{

try{

const userId = req.headers.userid

if(!userId){
return res.status(401).json({error:"User not authenticated"})
}

const { data: profile } = await supabase
.from('profiles')
.select('client_id')
.eq('id',userId)
.single()

const clientId = profile.client_id

await generateReport(clientId,res)

}catch(err){

console.error(err)
res.status(500).json(err)

}

})

module.exports = router
