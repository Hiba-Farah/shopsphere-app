const express = require("express");
const router = express.Router();

const userController = require("../controllers/user.controller");
const authenticateToken = require("../middlewares/auth.middleware");

router.post("/register", userController.register);

router.post("/login", userController.login);

// Route protégée
router.get("/", authenticateToken, userController.getUsers);

module.exports = router;