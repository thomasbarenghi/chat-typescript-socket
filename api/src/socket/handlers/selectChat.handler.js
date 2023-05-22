const {
  findAllSocketsByClientIdMaster,
} = require("../../utils/socket/findAllSocketsByClientIdMaster");

const selectChat = async ({ data, socket, io }) => {
  const { chatId, otherUserId } = data;
  const userId = socket.handshake.query.userId;
  const sockets = io.sockets.values();
  const socketToCheck = findAllSocketsByClientIdMaster({
    clientIdMaster: otherUserId,
    sockets,
  });

  try {
    socket.join(chatId);
    io.to(userId).emit("otherUserStatus", {
      chatId: chatId,
      status: Object.keys(socketToCheck).length > 0 ? true : false,
    });
    console.log("El usuario", userId, "se ha unido al chat", chatId);
  } catch (error) {
    console.log("Error al seleccionar el chat:", error.message);
  }
};

module.exports = { selectChat };
