const express = require("express");

const router = express.Router();

const authController = require("../controllers/authController");

const authenticateToken = require("../middleware/authMiddleware");

router.post("/signup", authController.signup);

router.post("/login", authController.login);

router.get("/profile", authenticateToken, authController.getProfile);

router.post("/refresh", authController.refreshToken);

router.post("/logout", authController.logout);

console.log(authController);

module.exports = router;
