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

// ==============================
// HTTP requests counter
// ==============================

const httpRequestCounter = new client.Counter({
    name: "http_requests_total",
    help: "Total number of HTTP requests",
    labelNames: ["method", "route", "status_code"]
});

register.registerMetric(httpRequestCounter);

// ==============================
// HTTP request duration
// ==============================

const httpRequestDuration = new client.Histogram({
    name: "http_request_duration_seconds",
    help: "HTTP request duration in seconds",
    labelNames: ["method", "route", "status_code"],
    buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5]
});

register.registerMetric(httpRequestDuration);

// ==============================
// Count requests + measure latency
// ==============================

app.use((req, res, next) => {

    const start = process.hrtime();

    res.on("finish", () => {

        const diff = process.hrtime(start);

        const duration = diff[0] + diff[1] / 1e9;

        const route = req.route?.path || req.path;

        // Count HTTP request
        httpRequestCounter.inc({
            method: req.method,
            route: route,
            status_code: res.statusCode
        });

        // Measure HTTP request duration
        httpRequestDuration.observe(
            {
                method: req.method,
                route: route,
                status_code: res.statusCode
            },
            duration
        );
    });

    next();
});

// ==============================
// Prometheus endpoint
// ==============================

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