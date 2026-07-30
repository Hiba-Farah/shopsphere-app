const pool = require("../config/db");

// Création de la table products
async function createProductsTable() {
    const query = `
        CREATE TABLE IF NOT EXISTS products (
            id SERIAL PRIMARY KEY,
            name VARCHAR(150) NOT NULL,
            description TEXT,
            price DECIMAL(10,2) NOT NULL,
            stock INTEGER NOT NULL DEFAULT 0,
            image_url TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;

    await pool.query(query);

    console.log("✅ Products table is ready");
}

// Ajouter un produit
async function createProduct(name, description, price, stock, image_url) {
    const query = `
        INSERT INTO products (name, description, price, stock, image_url)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
    `;

    const values = [name, description, price, stock, image_url];

    const result = await pool.query(query, values);

    return result.rows[0];
}

// Récupérer tous les produits
async function getAllProducts() {
    const result = await pool.query(
        "SELECT * FROM products ORDER BY id;"
    );

    return result.rows;
}

// Récupérer un produit par son ID
async function getProductById(id) {
    const query = `
        SELECT *
        FROM products
        WHERE id = $1;
    `;

    const result = await pool.query(query, [id]);

    return result.rows[0];
}

// Modifier un produit
async function updateProduct(id, name, description, price, stock, image_url) {
    const query = `
        UPDATE products
        SET
            name = $1,
            description = $2,
            price = $3,
            stock = $4,
            image_url = $5
        WHERE id = $6
        RETURNING *;
    `;

    const values = [name, description, price, stock, image_url, id];

    const result = await pool.query(query, values);

    return result.rows[0];
}

// Supprimer un produit
async function deleteProduct(id) {
    const query = `
        DELETE FROM products
        WHERE id = $1
        RETURNING *;
    `;

    const result = await pool.query(query, [id]);

    return result.rows[0];
}

module.exports = {
    createProductsTable,
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct
};