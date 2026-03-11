const fs = require("fs")
const path = require("path")

const DB_FILE = path.join(__dirname, "data.json")

function loadDB(){

if(!fs.existsSync(DB_FILE)){
fs.writeFileSync(DB_FILE, JSON.stringify({
clients:[],
reports:[]
},null,2))
}

return JSON.parse(fs.readFileSync(DB_FILE))

}

function saveDB(data){
fs.writeFileSync(DB_FILE, JSON.stringify(data,null,2))
}

module.exports = {loadDB,saveDB}