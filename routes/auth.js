const express = require("express");

const authController = require("../controllers/auth");
const { signupUserValidator } = require("../util/validator");

const router = express.Router();

// PUT "auth/signup"
router.put("/signup", signupUserValidator, authController.signup);

// POST "auth/login"
router.post("/login", authController.login);

module.exports = router;
