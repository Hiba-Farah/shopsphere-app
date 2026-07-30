const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const httpProxy = require("http-proxy");

dotenv.config();

const app = express();
const proxy = httpProxy.createProxyServer({});

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "ShopSphere API Gateway is running"
    });
});

function forward(target, prefix) {
    return (req, res) => {

        // remettre le préfixe supprimé par Express
        req.url = prefix + req.url;

        proxy.once("proxyReq", (proxyReq) => {

            if (
                req.body &&
                Object.keys(req.body).length > 0
            ) {

                const bodyData = JSON.stringify(req.body);

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

        });

        proxy.web(req, res, { target }, (err) => {

            console.error(err);

            res.status(502).json({
                message: "Bad Gateway"
            });

        });

    };
}

app.use("/api/users", forward(process.env.USER_SERVICE, "/api/users"));

app.use("/api/products", forward(process.env.PRODUCT_SERVICE, "/api/products"));

app.use("/api/orders", forward(process.env.ORDER_SERVICE, "/api/orders"));

app.use("/api/cart", forward(process.env.CART_SERVICE, "/api/cart"));

app.use("/api/notifications", forward(process.env.NOTIFICATION_SERVICE, "/api/notifications"));

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`API Gateway started on port ${PORT}`);
});