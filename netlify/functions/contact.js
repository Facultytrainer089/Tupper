require("dotenv").config();

const { Pool } = require("pg");

// Neon PostgreSQL connection
// DATABASE_URL is added in Netlify Environment Variables
const databaseUrl = process.env.DATABASE_URL;

const pool = new Pool({
    connectionString: databaseUrl,
    ssl: {
        rejectUnauthorized: false
    }
});

// Netlify Function
exports.handler = async (event) => {

    if (!databaseUrl) {
        return {
            statusCode: 500,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                success: false,
                message: "Database connection is not configured"
            })
        };
    }

    // Allow only POST requests
    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                success: false,
                message: "Method Not Allowed"
            })
        };
    }

    try {

        // Check request body
        if (!event.body) {
            return {
                statusCode: 400,
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    success: false,
                    message: "Request body is empty"
                })
            };
        }

        // Read form data
        const {
            name,
            mobile,
            product,
            message
        } = JSON.parse(event.body);

        // Validate required fields
        if (!name || !mobile || !product) {
            return {
                statusCode: 400,
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    success: false,
                    message: "Please fill all required fields"
                })
            };
        }

        // Insert data into Neon PostgreSQL
        const result = await pool.query(
            `
            INSERT INTO contacts
            (name, mobile, product, message)
            VALUES ($1, $2, $3, $4)
            RETURNING *
            `,
            [
                name,
                mobile,
                product,
                message || null
            ]
        );

        // Successful response
        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                success: true,
                message: "Contact saved successfully!",
                data: result.rows[0]
            })
        };

    } catch (error) {

        // Show error in Netlify logs
        console.error("Database error:", error);

        return {
            statusCode: 500,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                success: false,
                message: "Unable to save contact."
            })
        };
    }
};