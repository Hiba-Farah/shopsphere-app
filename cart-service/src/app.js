const express = require("express");
const cors = require("cors");
const client = require("prom-client");
require("dotenv").config();

const redisClient = require("./config/redis");

const cartRoutes = require("./routes/cart.routes");

const app = express();

app.use(cors());
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
// Application routes
// ==============================

app.use("/api/cart", cartRoutes);

const PORT = process.env.PORT || 3004;

// ==============================
// Redis
// ==============================

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