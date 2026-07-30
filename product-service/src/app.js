const express = require("express");
const dotenv = require("dotenv");
const pool = require("./config/db");
const productModel = require("./models/product.model");

dotenv.config();

const app = express();

app.use(express.json());

const productRoutes = require("./routes/product.routes");

const PORT = process.env.PORT || 3002;

app.use("/api/products", productRoutes);

pool.connect()
    .then(async () => {

        console.log("✅ Connected to PostgreSQL");

        await productModel.createProductsTable();

    })
    .catch((err) => {

        console.error(err);

    });

app.listen(PORT, () => {
    console.log(`Product Service started on port ${PORT}`);
});