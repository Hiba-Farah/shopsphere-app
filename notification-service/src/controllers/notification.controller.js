exports.sendNotification = async (req, res) => {

    try {

        const { userId, orderId, message } = req.body;

        if (!userId || !orderId || !message) {
            return res.status(400).json({
                message: "userId, orderId and message are required"
            });
        }

        console.log("\n📧 ===== Notification =====");
        console.log(`User ID : ${userId}`);
        console.log(`Order ID: ${orderId}`);
        console.log(`Message : ${message}`);
        console.log("==========================\n");

        res.status(200).json({
            message: "Notification sent successfully"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to send notification"
        });
    }
};