const express = require("express");
const morgan = require("morgan");
const { Server } = require("socket.io");
const http = require("http");
const cors = require("cors");
require("dotenv").config();

const {CLIENT_URL} = process.env;

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: CLIENT_URL,
  },
});

app.use(cors());
app.use(morgan("dev"));

io.on("connection", (socket) => {
  socket.on("message", (message) => {
    console.log("nuevo mensaje:", message);
    socket.broadcast.emit("message", {
      message,
    });
  });
});

module.exports = server;
