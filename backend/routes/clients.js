const express = require("express")
const { createClient } = require("@supabase/supabase-js")

const router = express.Router()

// Supabase connection
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
)


// GET ALL CLIENTS
router.get("/", async (req, res) => {

    try {

        const { data, error } = await supabase
            .from("dynamis_clients")
            .select("*")
            .order("created_at", { ascending: true })

        if (error) {
            console.error(error)
            return res.status(500).json({ error: "Failed to fetch clients" })
        }

        res.json(data)

    } catch (err) {

        console.error(err)
        res.status(500).json({ error: "Server error" })

    }

})


// CREATE CLIENT
router.post("/", async (req, res) => {

    try {

        const { name, industry } = req.body

        if (!name) {
            return res.status(400).json({ error: "Client name required" })
        }

        const { data, error } = await supabase
            .from("dynamis_clients")
            .insert([
                {
                    name: name,
                    industry: industry || "Unknown"
                }
            ])
            .select()

        if (error) {
            console.error(error)
            return res.status(500).json({ error: "Failed to create client" })
        }

        res.json(data[0])

    } catch (err) {

        console.error(err)
        res.status(500).json({ error: "Server error" })

    }

})


// DELETE CLIENT
router.delete("/:id", async (req, res) => {

    try {

        const { id } = req.params

        const { error } = await supabase
            .from("dynamis_clients")
            .delete()
            .eq("id", id)

        if (error) {
            console.error(error)
            return res.status(500).json({ error: "Failed to delete client" })
        }

        res.json({ success: true })

    } catch (err) {

        console.error(err)
        res.status(500).json({ error: "Server error" })

    }

})

module.exports = router