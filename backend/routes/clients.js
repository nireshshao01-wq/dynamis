const express = require("express");
const router = express.Router();
const supabase = require("../supabaseClient");


// GET ALL CLIENTS
router.get("/", async (req, res) => {

try {

const { data, error } = await supabase
.from("clients")
.select("*")
.order("created_at", { ascending: false });

if (error) {
console.error("Error loading clients:", error);
return res.status(500).json({ error: "Failed to load clients" });
}

res.json(data);

} catch (err) {

console.error(err);
res.status(500).json({ error: "Server error" });

}

});



// CREATE NEW CLIENT
router.post("/", async (req, res) => {

try {

const { name, cloud, industry } = req.body;

if (!name) {
return res.status(400).json({ error: "Client name required" });
}

const { data, error } = await supabase
.from("clients")
.insert([
{
name,
cloud,
industry,
created_at: new Date()
}
])
.select();

if (error) {
console.error("Error creating client:", error);
return res.status(500).json({ error: "Failed to create client" });
}

res.json(data[0]);

} catch (err) {

console.error(err);
res.status(500).json({ error: "Server error" });

}

});


module.exports = router;