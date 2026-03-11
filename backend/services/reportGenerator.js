const PDFDocument = require('pdfkit')
const supabase = require('../supabaseClient')

async function generateReport(clientId,res){

const { data: summary } = await supabase
.from('dynamis_finops_summary')
.select('*')
.eq('client_id',clientId)

const { data: opportunities } = await supabase
.from('dynamis_opportunities')
.select('*')
.eq('client_id',clientId)
.order('monthly_waste',{ascending:false})
.limit(5)

const doc = new PDFDocument()

res.setHeader('Content-Type','application/pdf')
res.setHeader('Content-Disposition','attachment; filename=dynamis-report.pdf')

doc.pipe(res)

/* HEADER */

doc.fontSize(20).text("DYNAMIS Cloud Financial Optimization Report")

doc.moveDown()

doc.fontSize(12).text(`Generated: ${new Date().toDateString()}`)

doc.moveDown()

/* SUMMARY */

let totalSpend = 0

summary.forEach(m=>{
totalSpend += Number(m.total_cost || 0)
})

doc.fontSize(16).text("Executive Summary")

doc.moveDown()

doc.fontSize(12).text(`Total Cloud Spend: R ${totalSpend.toLocaleString()}`)

/* OPPORTUNITIES */

doc.moveDown()
doc.fontSize(16).text("Top Optimization Opportunities")

doc.moveDown()

opportunities.forEach(o=>{

doc.fontSize(12).text(
`${o.service} — ${o.issue} — R ${Number(o.monthly_waste).toLocaleString()}`
)

})

doc.moveDown()

doc.fontSize(16).text("Recommendations")

doc.moveDown()

doc.fontSize(12).text("• Rightsize over-provisioned compute resources")
doc.text("• Remove idle infrastructure")
doc.text("• Optimize storage tiers")
doc.text("• Review network transfer architecture")

doc.end()

}

module.exports = generateReport
