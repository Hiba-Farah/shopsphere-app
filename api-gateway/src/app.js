const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const httpProxy = require("http-proxy");
const CircuitBreaker = require("opossum");
const client = require("prom-client");

dotenv.config();

const app = express();
const proxy = httpProxy.createProxyServer({});

// ======================================================
// Prometheus metrics
// ======================================================

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

// ======================================================
// Middlewares
// ======================================================

app.use(cors());
app.use(express.json());

// Measure HTTP requests
app.use((req, res, next) => {
    const start = process.hrtime();

    res.on("finish", () => {
        const diff = process.hrtime(start);
        const duration = diff[0] + diff[1] / 1e9;

        const route = req.path;

        httpRequestCounter.inc({
            method: req.method,
            route: route,
            status_code: res.statusCode
        });

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

// ======================================================
// Prometheus endpoint
// ======================================================

app.get("/metrics", async (req, res) => {
    res.set("Content-Type", register.contentType);
    res.end(await register.metrics());
});

// ======================================================
// Gateway health endpoint
// ======================================================

app.get("/", (req, res) => {
    res.json({
        message: "ShopSphere API Gateway is running"
    });
});

// ======================================================
// Forward requests to microservices
// with:
// - Timeout
// - Retry
// - Circuit Breaker
// ======================================================

function forward(target, prefix) {

    /*
     * Circuit Breaker function.
     *
     * One execution = one attempt to contact
     * the microservice.
     */
    const makeRequest = (req, res) => {

        return new Promise((resolve, reject) => {

            const originalUrl = req.url;

            /*
             * Express removes /api/products before
             * calling this middleware.
             *
             * We restore the prefix before forwarding.
             */
            req.url = prefix + originalUrl;

            let finished = false;

            function cleanup() {

                proxy.removeListener(
                    "proxyRes",
                    onProxyRes
                );

                proxy.removeListener(
                    "error",
                    onProxyError
                );

                proxy.removeListener(
                    "proxyReq",
                    onProxyReq
                );

                req.url = originalUrl;
            }

            function onProxyRes(proxyRes) {

                if (finished) return;

                finished = true;

                cleanup();

                console.log(
                    `Proxy response (${target}): ${proxyRes.statusCode}`
                );

                resolve();
            }

            function onProxyError(err) {

                if (finished) return;

                finished = true;

                cleanup();

                console.error(
                    `Proxy error (${target}): ${err.message}`
                );

                reject(err);
            }

            function onProxyReq(proxyReq) {

                /*
                 * Forward JSON body for POST / PUT / PATCH.
                 */
                if (
                    req.body &&
                    Object.keys(req.body).length > 0 &&
                    ["POST", "PUT", "PATCH"].includes(req.method)
                ) {

                    const bodyData =
                        JSON.stringify(req.body);

                    proxyReq.setHeader(
                        "Content-Type",
                        "application/json"
                    );

                    proxyReq.setHeader(
                        "Content-Length",
                        Buffer.byteLength(bodyData)
                    );

                    proxyReq.write(bodyData);
                }
            }

            proxy.once(
                "proxyRes",
                onProxyRes
            );

            proxy.once(
                "error",
                onProxyError
            );

            proxy.once(
                "proxyReq",
                onProxyReq
            );

            /*
             * Proxy timeout = 5 seconds.
             */
            proxy.web(
                req,
                res,
                {
                    target: target,
                    timeout: 5000
                },
                onProxyError
            );
        });
    };

    /*
     * Circuit Breaker
     */
    const breaker = new CircuitBreaker(
        makeRequest,
        {
            timeout: 6000,

            /*
             * Circuit opens when 50% of requests
             * fail.
             */
            errorThresholdPercentage: 50,

            /*
             * After 10 seconds, try again.
             */
            resetTimeout: 10000,

            /*
             * At least 5 requests are required
             * before calculating the error percentage.
             */
            volumeThreshold: 5
        }
    );

    /*
     * Circuit Breaker events
     */

    breaker.on("open", () => {

        console.error(
            `Circuit OPEN for ${target}`
        );
    });

    breaker.on("halfOpen", () => {

        console.log(
            `Circuit HALF-OPEN for ${target}`
        );
    });

    breaker.on("close", () => {

        console.log(
            `Circuit CLOSED for ${target}`
        );
    });

    /*
     * Express middleware
     */
    return async (req, res) => {

        /*
         * Retry only GET requests.
         *
         * maxRetries = 2 means:
         *
         * Attempt 1
         * Attempt 2
         * Attempt 3
         *
         * So there are 3 total attempts.
         */
        const maxRetries =
            req.method === "GET" ? 2 : 0;

        let attempt = 0;

        while (attempt <= maxRetries) {

            try {

                attempt++;

                console.log(
                    `${req.method} ${req.originalUrl} -> ${target} | Attempt ${attempt}`
                );

                await breaker.fire(req, res);

                /*
                 * Request succeeded.
                 */
                return;

            } catch (error) {

                console.error(
                    `Attempt ${attempt} failed for ${target}: ${error.message}`
                );

                /*
                 * All attempts exhausted.
                 */
                if (attempt > maxRetries) {

                    if (!res.headersSent) {

                        res.status(502).json({
                            message:
                                "Service temporarily unavailable"
                        });
                    }

                    return;
                }

                /*
                 * Wait 200 ms before retry.
                 */
                await new Promise(
                    resolve =>
                        setTimeout(resolve, 200)
                );
            }
        }
    };
}

// ======================================================
// Microservices routes
// ======================================================

app.use(
    "/api/users",
    forward(
        process.env.USER_SERVICE,
        "/api/users"
    )
);

app.use(
    "/api/products",
    forward(
        process.env.PRODUCT_SERVICE,
        "/api/products"
    )
);

app.use(
    "/api/orders",
    forward(
        process.env.ORDER_SERVICE,
        "/api/orders"
    )
);

app.use(
    "/api/cart",
    forward(
        process.env.CART_SERVICE,
        "/api/cart"
    )
);

app.use(
    "/api/notifications",
    forward(
        process.env.NOTIFICATION_SERVICE,
        "/api/notifications"
    )
);

// ======================================================
// Start server
// ======================================================

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {

    console.log(
        `API Gateway started on port ${PORT}`
    );
});