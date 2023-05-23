require("dotenv").config();
const { Server } = require("socket.io");
const { selectChat } = require("./handlers/selectChat.handler");
const { sendMessage } = require("./handlers/message.handler");
const uuid = require("uuid").v4;
const { peerServer } = require("../config/app.js");

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

  socket.on("callUser", (data, callback) => {
    const { fromUserID, toUserID } = data;
  const callId = uuid();
    socket.join(callId);
    callback(callId);
    io.to(toUserID).emit("comingCall", {
      callID: callId,
      fromUserID,
    });
  });

  socket.on("acceptCall", (data) => {
    const { callID } = data;
    socket.join(callID);
    console.log("Llamada aceptada");
  });

  socket.on("sendPeerId", (data) => {
    const { callID, peerID } = data;
    
    io.to(callID).emit("receivePeerId", {
      peerID,
    });
  });
    

  socket.on("tempMessage", (data) => {
    const { callID, message, user } = data;
    console.log("Mensaje temporal", message, callID);
    const newMessage = {
      message,
      user,
    };
    io.to(callID).emit("newTempMessage", newMessage);
  });
});

module.exports = io;
