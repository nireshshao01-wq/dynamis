const cron = require("node-cron")
const runFinopsScan = require("../services/finopsScanner")

function startFinopsScheduler(){

console.log("DYNAMIS FinOps scheduler started")

cron.schedule("0 2 * * *", async ()=>{

console.log("Nightly FinOps scan running...")

await runFinopsScan()

})

}

module.exports = startFinopsScheduler
