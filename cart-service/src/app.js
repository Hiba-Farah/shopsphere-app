const express = require("express");
const cors = require("cors");
require("dotenv").config();

const redisClient = require("./config/redis");

const cartRoutes = require("./routes/cart.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/cart", cartRoutes);


const PORT = process.env.PORT || 3004;


redisClient.connect()
    .then(() => {
        console.log("✅ Redis connection established");

        app.listen(PORT, () => {
            console.log(`Cart Service started on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error("Redis connection failed:", error);
    });