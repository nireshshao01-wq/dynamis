const express = require('express')
const router = express.Router()
const multer = require('multer')
const fs = require('fs')

const supabase = require('../supabaseClient')

const parseAWS = require('../parsers/awsParser')
const parseAzure = require('../parsers/azureParser')
const parseGCP = require('../parsers/gcpParser')

/* FINOPS SUMMARY ENGINE */

const generateFinopsSummary = require('../services/finopsSummary')

const upload = multer({ dest: 'uploads/' })

router.post('/', upload.single('file'), async (req,res)=>{

try{

const userId = req.headers.userid

if(!userId){
return res.status(401).json({error:'User not authenticated'})
}

/* GET USER CLIENT */

const { data: profile, error: profileError } = await supabase
.from('profiles')
.select('client_id')
.eq('id',userId)
.single()

if(profileError){
console.error(profileError)
return res.status(500).json(profileError)
}

const clientId = profile.client_id

if(!clientId){
return res.status(400).json({error:'User not assigned to client'})
}

if(!req.file){
return res.status(400).json({error:'No file uploaded'})
}

const filePath = req.file.path
const filename = req.file.originalname.toLowerCase()

const stream = fs.createReadStream(filePath)

/* DETECT CLOUD PROVIDER */

let parser

if(filename.includes("aws")){
parser = parseAWS
}
else if(filename.includes("azure")){
parser = parseAzure
}
else if(filename.includes("gcp")){
parser = parseGCP
}
else{
/* default fallback */
parser = parseAWS
}

/* PARSE FILE */

const parsedRows = await parser(stream)

/* ATTACH CLIENT ID */

const rows = parsedRows.map(r => ({
...r,
client_id: clientId
}))

/* INSERT INTO DATABASE */

const { error: insertError } = await supabase
.from('cloud_cost_data')
.insert(rows)

if(insertError){
console.error(insertError)
return res.status(500).json(insertError)
}

/* BUILD FINOPS SUMMARY */

await generateFinopsSummary(clientId)

/* CLEAN UP TEMP FILE */

fs.unlinkSync(filePath)

res.json({
message: "Upload successful",
rowsInserted: rows.length
})

}catch(err){

console.error("Upload route error:", err)
res.status(500).json(err)

}

})

module.exports = router