const express = require("express");
const dotenv = require("dotenv");
const pool = require("./config/db");
const userModel = require("./models/user.model");

dotenv.config();

const app = express();

app.use(express.json());

const userRoutes = require("./routes/user.routes");

const PORT = process.env.PORT || 3001;

app.use("/api/users", userRoutes);

// Test de connexion à PostgreSQL
pool.connect()
    .then(async () => {
        console.log("✅ Connected to PostgreSQL");

        await userModel.createUsersTable();
    })
    .catch((err) => {
        console.error(err);
    });

app.listen(PORT, () => {
    console.log(`User Service started on port ${PORT}`);
});