const express = require("express");
const dotenv = require("dotenv");
const pool = require("./config/db");
const orderModel = require("./models/order.model");

dotenv.config();

const app = express();

app.use(express.json());

const orderRoutes = require("./routes/order.routes");

app.use("/api/orders", orderRoutes);

const PORT = process.env.PORT || 3003;

pool.connect()
    .then(async () => {
        console.log("✅ Connected to PostgreSQL");

        await orderModel.createOrdersTable();
    })
    .catch((err) => {
        console.error(err);
    });

app.listen(PORT, () => {
    console.log(`Order Service started on port ${PORT}`);
});