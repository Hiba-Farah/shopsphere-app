const express = require("express");
const dotenv = require("dotenv");
const client = require("prom-client");
const pool = require("./config/db");
const productModel = require("./models/product.model");

dotenv.config();

const app = express();

app.use(express.json());

// ==============================
// Prometheus metrics
// ==============================

const register = new client.Registry();

client.collectDefaultMetrics({
    register
});

const httpRequestCounter = new client.Counter({
    name: "http_requests_total",
    help: "Total number of HTTP requests",
    labelNames: ["method", "route", "status_code"]
});

register.registerMetric(httpRequestCounter);

// Count HTTP requests
app.use((req, res, next) => {
    res.on("finish", () => {
        httpRequestCounter.inc({
            method: req.method,
            route: req.route?.path || req.path,
            status_code: res.statusCode
        });
    });

    next();
});

// Prometheus endpoint
app.get("/metrics", async (req, res) => {
    res.set("Content-Type", register.contentType);
    res.end(await register.metrics());
});

// ==============================
// Routes
// ==============================

const productRoutes = require("./routes/product.routes");

const PORT = process.env.PORT || 3002;

app.use("/api/products", productRoutes);

// ==============================
// PostgreSQL
// ==============================

pool.connect()
    .then(async () => {
        console.log("✅ Connected to PostgreSQL");

        await productModel.createProductsTable();
    })
    .catch((err) => {
        console.error(err);
    });

// ==============================
// Start server
// ==============================

app.listen(PORT, () => {
    console.log(`Product Service started on port ${PORT}`);
});