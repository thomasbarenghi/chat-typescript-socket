require("dotenv").config();
const { Server } = require("socket.io");

const io = new Server({
  cors: {
    origin: `*`,
  },
  maxHttpBufferSize: 10 * 1024 * 1024, // Tamaño máximo de 10 MB
});

io.on("connection", async (socket) => {

});

module.exports = io;
