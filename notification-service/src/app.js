const express = require("express");
const cors = require("cors");
require("dotenv").config();

const notificationRoutes = require("./routes/notification.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/notifications", notificationRoutes);

const PORT = process.env.PORT || 3005;

app.listen(PORT, () => {
    console.log(`Notification Service started on port ${PORT}`);
});