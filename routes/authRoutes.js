const express = require("express");
const { body } = require("express-validator");

const router = express.Router();

const authController = require("../controllers/authController");

const authenticateToken = require("../middleware/authMiddleware");

router.post("/signup", 
    [
    body("email")
      .trim()
      .isEmail()
      .withMessage("Valid email required"),

    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters")
      .matches(/\d/)
      .withMessage("Password must contain a number")
  ], 
  authController.signup);

router.post("/login", 
    [
    body("email")
      .trim()
      .isEmail()
      .withMessage("Valid email required"),

    body("password")
      .notEmpty()
      .withMessage("Password required")
  ],
  authController.login);

router.get("/profile", authenticateToken, authController.getProfile);

router.post("/refresh", authController.refreshToken);

router.post("/logout", authController.logout);

console.log(authController);

module.exports = router;
