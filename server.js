const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Neon PostgreSQL connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// Test database connection
pool.connect()
    .then(client => {
        console.log("Connected to Neon PostgreSQL");
        client.release();
    })
    .catch(error => {
        console.error("Database connection error:", error.message);
    });

// Home page / API test
app.get("/", (req, res) => {
    res.send("Tupperware server is running successfully!");
});

// Insert contact
app.post("/api/contacts", async (req, res) => {

    try {
        const { name, mobile, product, message } = req.body;

        // Check required fields
        if (!name || !mobile) {
            return res.status(400).json({
                success: false,
                message: "Name and mobile are required."
            });
        }

        const query = `
            INSERT INTO contacts
            (name, mobile, product, message)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;

        const values = [
            name,
            mobile,
            product || null,
            message || null
        ];

        const result = await pool.query(query, values);

        res.status(201).json({
            success: true,
            message: "Contact saved successfully!",
            data: result.rows[0]
        });

    } catch (error) {

        console.error("Insert error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to save contact."
        });
    }
});

// Get all contacts
app.get("/api/contacts", async (req, res) => {

    try {

        const result = await pool.query(`
            SELECT *
            FROM contacts
            ORDER BY created_at DESC
        `);

        res.json({
            success: true,
            data: result.rows
        });

    } catch (error) {

        console.error("Fetch error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to fetch contacts."
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});