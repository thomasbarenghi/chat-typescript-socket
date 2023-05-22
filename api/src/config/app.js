const express = require("express");
const morgan = require("morgan");
const http = require("http");
const cors = require("cors");
const router = require("../routes/index.js");
require("dotenv").config();
const socketSetup = require("../socket/config.js");
const app = express();
const server = http.createServer(app);
const { ExpressPeerServer } = require("peer");

app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

const peerServer = ExpressPeerServer(server, {
  debug: true,
});

socketSetup.attach(server);
app.use("/peerjs", peerServer);
app.use("/api", router);

module.exports = server;
