const { Server } = require("socket.io");
require("dotenv").config();
const Chat = require("../models/nosql/chat").Chat;
const Message = require("../models/nosql/chat").Message;
const User = require("../models/nosql/user");
const mongoose = require("mongoose");
const moment = require("moment");
const { CLIENT_URL } = process.env;
const fs = require("fs");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const uuid = require("uuid").v4;
const { exec } = require("child_process");
const { CLOUD_NAME, CLOUD_API_KEY, CLOUD_API_SECRET } = process.env;
const path = require("path");

cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: CLOUD_API_KEY,
  api_secret: CLOUD_API_SECRET,
});

const io = new Server({
  cors: {
    origin: `*`,
  },
});

io.on("connection", async (socket) => {
  const userId = socket.handshake.query.userId;
  socket.clientIdMaster = userId;
  // socket.onlineStatus = {
  //   status: true,
  //   lastModified: new Date(Date.now()).toISOString(),
  // };

  if (userId && typeof userId === "string") {
    socket.join(userId);
  }
  //console.log("OBJETO SOCKET:", io.sockets.sockets.values());

  socket.on("selectChat", async (chatId2) => {
    const chatId = chatId2.chatId;
    const otherUserId = chatId2.otherUserId;

    const socketToCheck = findAllSocketsByClientIdMaster(otherUserId);
    console.log("socketToCheck", typeof socketToCheck);

    try {
      socket.join(chatId);
      console.log("todo bien, emitimos el chatConfig a", userId);
      io.to(userId).emit("otherUserStatus", {
        chatId: chatId,
        status: Object.keys(socketToCheck).length > 0 ? true : false,
      });
    } catch (error) {
      console.log("Error al seleccionar el chat:", error.message);
    }
  });

  socket.on("message", async (message) => {
    try {

      const imageUrl = await uploadImage(message);
console.log("imageUrl", imageUrl)
      const chat = await Chat.findById(message.chatId);
      if (!chat) {
        return socket.emit("chatError", "El chat no existe");
      }

      let newMessage = new Message({
        sender: message.user,
        content: message.msg || imageUrl,
        timestamp: Date.now(),
        chatId: message.chatId,
        type: imageUrl ? "image" : "text",
      });

      // Guardar el mensaje en la base de datos
      await newMessage.save();

      // Agregar el mensaje al chat
      chat.messages.push(newMessage);

      chat.lastMessage = newMessage._id;
      chat.lastModified = Date.now();

      await chat.save();

      //obtenemos la info del usuario

      const sender = await User.findById(message.user).select(
        "id email firstName lastName image email "
      );

      newMessage.sender = sender;

      const newMessageJSON = newMessage.toJSON();

      const isCurrentUser = newMessage.sender._id.toString() === message.user;

      const toFront = {
        newMessage: {
          ...newMessageJSON,
          origin: isCurrentUser,
          time: formatMessageTime(newMessage),
        },
        chatId: message.chatId,
        lastMessage: chat.lastMessage,
      };

      io.to(message.chatId).emit("newMessage", toFront);
    } catch (error) {
      console.log("Error al guardar el mensaje:", error.message);
    }
  });

  socket.on("newChat", (data) => {
    const toUserId = data.toUserId;
    console.log("Nuevo chat para el usuario", toUserId);

    // Buscar todos los sockets que coinciden con el clientIdMaster
    const socketsToNotify = findAllSocketsByClientIdMaster(toUserId);
    io.to(toUserId).emit("newChat");
    // socketsToNotify.forEach((socketTo) => {
    //   console.log("Notificando a socket:", socketTo.client.id);
    //   //socket.to(socketTo.client.id).emit("newChat");
    //   //io.to(socketTo.client.id).emit("newChat");
    //   //  io.sockets.sockets[socketTo.client.id].emit("newChat");
    //   io.to(userId).emit("newChat");
    // });
  });

  socket.on("onlineStatus", (data) => {
    const status = data.status;

    // socket.onlineStatus = {
    //   status: status,
    //   lastModified: new Date(Date.now()).toISOString(),
    // };
    // console.log("onlineStatus", socket.onlineStatus, socket.clientIdMaster);
  });
});

async function uploadImage(message) {

  if (message.image) {
    try {
      console.log(CLOUD_API_SECRET, CLOUD_API_KEY, CLOUD_NAME)
      const image = Buffer.from(message.image, "base64");

      const filename =
        "nombres_graciosos_para_perros_pequenos_23298_3_600.jpg"; // Nombre del archivo
      const filePath = path.join(__dirname, "..", "uploads", filename);

      fs.writeFile(filePath, image, (err) => {
        if (err) {
          throw err;
        }
        console.log("¡El archivo se ha guardado en:", filePath, "!");
      });

      const result = await cloudinary.uploader.upload(filePath, {
        folder: "uploads",
      });

      const imageUrl = result.url;

      fs.unlink(filePath, (err) => {
        if (err) {
          console.error(err);
          return;
        }
        console.log("Archivo borrado");

        
      });

      return imageUrl;
    } catch (error) {
      console.log("error cloud", error.message);
    }
  }
  else {
    return null;
  }
}

function findAllSocketsByClientIdMaster(clientIdMaster) {
  const sockets = io.sockets.sockets.values();
  const matchingSockets = [];

  for (const socket of sockets) {
    if (socket.clientIdMaster === clientIdMaster) {
      matchingSockets.push(socket);
    }
  }

  return matchingSockets;
}

const formatMessageTime = (message) => {
  const today = moment().startOf("day");
  const messageDate = moment(message.date);
  const diffInDays = today.diff(messageDate, "days");

  if (diffInDays === 0) {
    return messageDate.format("HH:mm");
  } else if (diffInDays === 1) {
    return "Ayer";
  } else {
    return messageDate.format("DD/MM/YYYY");
  }
};

module.exports = io;

// const { Server } = require("socket.io");
// require("dotenv").config();
// const Chat = require("../models/nosql/chat");
// const User = require("../models/nosql/user");
// const mongoose = require("mongoose");

// const { CLIENT_URL } = process.env;

// const io = new Server({
//   cors: {
//     origin: `*`,
//   },
// });

// io.on("connection", (socket) => {
//   socket.on("selectChat", async (chatId) => {
//     console.log("Chat seleccionado:", chatId.chatId);

//     try {
//       // Buscar el chat en la base de datos por su chatId
//       const chat = await Chat.findById(chatId.chatId);

//       if (!chat) {
//         console.log("Chat no encontrado");
//         return;
//       }

//       // Unirse a la sala del chat correspondiente
//       socket.join(chatId);
//       console.log("todo bien");
//       // Emitir la configuración del chat a los clientes conectados a la sala
//       io.to(chatId).emit("chatConfig", chat);
//     } catch (error) {
//       console.log("Error al seleccionar el chat:", error.message);
//     }
//   });

//   socket.on("message", async (data) => {
//     try {
//       const { chatId, user, msg } = data;

//       // Guardar el mensaje en la base de datos
//       const chat = await Chat.findById(chatId);

//       if (!chat) {
//         console.log("Chat no encontrado");
//         return;
//       }
//       console.log("estamos en una sala y recibimos un mensaje", user, msg);
//       chat.messages.push({ sender: user, content: msg });
//       await chat.save();
//       console.log("mensaje guardado");
//       // Emitir el mensaje a la sala del chat correspondiente
//       io.to(chatId).emit("message", { user, msg });
//     } catch (error) {
//       console.log("Error al guardar el mensaje:", error);
//     }
//   });
// });

// module.exports = io;

// io.on("connection", (socket) => {
//   socket.on("message", (message) => {
//     console.log("nuevo mensaje:", message);
//     socket.broadcast.emit("message", {
//       message,
//     });
//   });
// });
