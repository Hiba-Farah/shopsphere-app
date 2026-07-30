const pool = require("../config/db");

// Création de la table orders
async function createOrdersTable() {
    const query = `
        CREATE TABLE IF NOT EXISTS orders (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL,
            total_price DECIMAL(10,2) NOT NULL,
            status VARCHAR(30) NOT NULL DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;

    await pool.query(query);

    console.log("✅ Orders table is ready");
}

// Créer une commande
async function createOrder(user_id, total_price) {
    const query = `
        INSERT INTO orders (user_id, total_price)
        VALUES ($1, $2)
        RETURNING *;
    `;

    const values = [user_id, total_price];

    const result = await pool.query(query, values);

    return result.rows[0];
}

// Récupérer toutes les commandes
async function getAllOrders() {
    const query = `
        SELECT *
        FROM orders
        ORDER BY id DESC;
    `;

    const result = await pool.query(query);

    return result.rows;
}

// Récupérer une commande par son ID
async function getOrderById(id) {
    const query = `
        SELECT *
        FROM orders
        WHERE id = $1;
    `;

    const result = await pool.query(query, [id]);

    return result.rows[0];
}

module.exports = {
    createOrdersTable,
    createOrder,
    getAllOrders,
    getOrderById
};