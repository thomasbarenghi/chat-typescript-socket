require("dotenv").config();
const { Server } = require("socket.io");
const { selectChat } = require("./handlers/selectChat.handler");
const { sendMessage } = require("./handlers/message.handler");

const io = new Server({
  cors: {
    origin: `*`,
  },
  maxHttpBufferSize: 10 * 1024 * 1024, // Tamaño máximo de 10 MB
});

io.on("connection", async (socket) => {
  const userId = socket.handshake.query.userId;
  socket.clientIdMaster = userId;

  if (userId && typeof userId === "string") {
    socket.join(userId);
  }

  socket.on("selectChat", async (data) => {
    selectChat({
      data,
      socket,
      io: io.sockets,
    });
  });

  socket.on("message", async (message) => {
    sendMessage({
      message,
      socket,
      io: io.sockets,
    });
  });

  socket.on("newChat", (data) => {
    const toUserId = data.toUserId;
    console.log("Nuevo chat para el usuario", toUserId);
    io.to(toUserId).emit("newChat");
  });
});

module.exports = io;
