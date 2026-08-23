const express = require("express");
const dotenv = require("dotenv");
const client = require("prom-client");
const pool = require("./config/db");
const orderModel = require("./models/order.model");

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

// Total HTTP requests
const httpRequestCounter = new client.Counter({
    name: "http_requests_total",
    help: "Total number of HTTP requests",
    labelNames: ["method", "route", "status_code"]
});

register.registerMetric(httpRequestCounter);

// HTTP request duration
const httpRequestDuration = new client.Histogram({
    name: "http_request_duration_seconds",
    help: "HTTP request duration in seconds",
    labelNames: ["method", "route", "status_code"],
    buckets: [
        0.005,
        0.01,
        0.025,
        0.05,
        0.1,
        0.25,
        0.5,
        1,
        2,
        5
    ]
});

register.registerMetric(httpRequestDuration);

// Measure HTTP requests
app.use((req, res, next) => {
    const start = process.hrtime();

    res.on("finish", () => {
        const diff = process.hrtime(start);
        const duration = diff[0] + diff[1] / 1e9;

        const route = req.route?.path || req.path;

        httpRequestCounter.inc({
            method: req.method,
            route,
            status_code: res.statusCode
        });

        httpRequestDuration.observe(
            {
                method: req.method,
                route,
                status_code: res.statusCode
            },
            duration
        );
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

const orderRoutes = require("./routes/order.routes");

app.use("/api/orders", orderRoutes);

// ==============================
// PostgreSQL
// ==============================

const PORT = process.env.PORT || 3003;

pool.connect()
    .then(async () => {
        console.log("✅ Connected to PostgreSQL");

        await orderModel.createOrdersTable();
    })
    .catch((err) => {
        console.error(err);
    });

// ==============================
// Start server
// ==============================

app.listen(PORT, () => {
    console.log(`Order Service started on port ${PORT}`);
});