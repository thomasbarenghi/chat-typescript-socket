const express = require("express");
const router = express.Router();

const authRoutes = require("./auth/index.js");
const chatRoutes = require("./chat");
const userRoutes = require("./user");

router.use("/auth", authRoutes);
router.use("/chat", chatRoutes);
router.use("/user", userRoutes);

module.exports = router;