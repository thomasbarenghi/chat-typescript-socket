const express = require("express");
const morgan = require("morgan");
const { Server } = require("socket.io");
const http = require("http");
const cors = require("cors");
const router = require("../routes/index.js");
require("dotenv").config();
const socketSetup = require("./socket.js");

const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

socketSetup.attach(server);

app.use("/api", router);

module.exports = server;
