const pool = require("../config/db");

// Création de la table users
async function createUsersTable() {
    const query = `
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            fullname VARCHAR(100) NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;

    await pool.query(query);

    console.log("✅ Users table is ready");
}

// Création d'un utilisateur
async function createUser(fullname, email, password) {
    const query = `
        INSERT INTO users (fullname, email, password)
        VALUES ($1, $2, $3)
        RETURNING *;
    `;

    const values = [fullname, email, password];

    const result = await pool.query(query, values);

    return result.rows[0];
}

// Récupérer tous les utilisateurs
async function getAllUsers() {
    const query = `
        SELECT id, fullname, email, created_at
        FROM users
        ORDER BY id;
    `;

    const result = await pool.query(query);

    return result.rows;
}

// Rechercher un utilisateur par email
async function getUserByEmail(email) {
    const query = `
        SELECT *
        FROM users
        WHERE email = $1;
    `;

    const result = await pool.query(query, [email]);

    return result.rows[0];
}

module.exports = {
    createUsersTable,
    createUser,
    getAllUsers,
    getUserByEmail
};