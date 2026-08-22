const { Pool } = require("pg");

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

exports.handler = async (event) => {

    // Only allow POST
    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            body: JSON.stringify({
                message: "Method Not Allowed"
            })
        };
    }

    try {

        const { name, mobile, product } = JSON.parse(event.body);

        // Validate
        if (!name || !mobile || !product) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: "Please fill all fields"
                })
            };
        }

        // Save to Neon PostgreSQL
        await pool.query(
            `INSERT INTO contacts (name, mobile, product)
             VALUES ($1, $2, $3)`,
            [name, mobile, product]
        );

        return {
            statusCode: 200,
            body: JSON.stringify({
                success: true,
                message: "Contact saved successfully"
            })
        };

    } catch (error) {

        console.error("Database error:", error);

        return {
            statusCode: 500,
            body: JSON.stringify({
                success: false,
                message: "Database error"
            })
        };
    }
};