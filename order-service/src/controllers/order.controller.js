const orderModel = require("../models/order.model");
const axios = require("axios");

// Créer une commande
exports.createOrder = async (req, res) => {
    try {
        const { user_id, total_price } = req.body;

        if (!user_id || total_price === undefined) {
            return res.status(400).json({
                message: "user_id and total_price are required"
            });
        }

        const order = await orderModel.createOrder(
            user_id,
            total_price
        );

        try {

            const response = await axios.post(
                `${process.env.NOTIFICATION_SERVICE}/api/notifications`,
                {
                    userId: user_id,
                    orderId: order.id,
                    message: "Your order has been created successfully."
                }
            );

            console.log("✅", response.data.message);

        } catch (error) {

            console.error("Notification Service Error:");

            if (error.response) {
                console.error(error.response.data);
            } else {
                console.error(error.message);
            }

        }

        res.status(201).json(order);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Order creation failed"
        });
    }
};

// Récupérer toutes les commandes
exports.getOrders = async (req, res) => {
    try {
        const orders = await orderModel.getAllOrders();

        res.status(200).json(orders);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to fetch orders"
        });
    }
};

// Récupérer une commande par ID
exports.getOrderById = async (req, res) => {
    try {
        const order = await orderModel.getOrderById(req.params.id);

        if (!order) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        res.status(200).json(order);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to fetch order"
        });
    }
};