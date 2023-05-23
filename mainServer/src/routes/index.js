const express = require("express");
const router = express.Router();

const authRoutes = require("./auth/index.js");
const chatRoutes = require("./chat");
const userRoutes = require("./user");
const callRoutes = require("./call");

router.use("/auth", authRoutes);
router.use("/chat", chatRoutes);
router.use("/user", userRoutes);
router.use("/call", callRoutes);

module.exports = router;