const express = require("express");
const morgan = require("morgan");
const http = require("http");
const cors = require("cors");
const router = require("../routes/index.js");
require("dotenv").config();
// const { PeerServer, ExpressPeerServer } = require("peer");
const socketSetup = require("../socket/config.js");

const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

// const peerServer = PeerServer({
//   debug: true,
//   path: "/app",
//   port: 9000,
// });

// peerServer.on("connection", (client) => {
//   console.log("Client connected", client.id);
// });

// peerServer.on("disconnect", (client) => {
//   console.log("Client disconnected", client.id);
// });

app.use("/api", router);
//app.use("/peerjs", peerServer);
socketSetup.attach(server);

module.exports = { server };
