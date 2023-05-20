const { Server } = require("socket.io");
require("dotenv").config();
const Chat = require("../models/nosql/chat").Chat;
const Message = require("../models/nosql/chat").Message;
const User = require("../models/nosql/user");
const mongoose = require("mongoose");

const { CLIENT_URL } = process.env;

const io = new Server({
  cors: {
    origin: `*`,
  },
});

io.on("connection", async (socket) => {
  socket.on("selectChat", async (chatId2) => {
    const chatId = chatId2.chatId;
    console.log("Chat seleccionado:", chatId);

    try {
      socket.join(chatId);
      console.log("todo bien");
    } catch (error) {
      console.log("Error al seleccionar el chat:", error.message);
    }
  });

  socket.on("message", async (message) => {
    console.log("nuevo mensaje:", message);
    try {
      const chat = await Chat.findById(message.chatId);
      if (!chat) {
        return socket.emit("chatError", "El chat no existe");
      }

      let newMessage = new Message({
        sender: message.user,
        content: message.msg,
        timestamp: Date.now(),
      });

      // Guardar el mensaje en la base de datos
      await newMessage.save();

      // Agregar el mensaje al chat
      chat.messages.push(newMessage);
      await chat.save();

      //obtenemos la info del usuario

      const sender = await User.findById(message.user).select(
        "id email firstName lastName image email "
      );

      newMessage.sender = sender;

      const newMessageJSON = newMessage.toJSON();
      console.log("estamos en una sala y recibimos un mensaje", newMessageJSON);
      io.to(message.chatId).emit("newMessage", newMessageJSON);
    } catch (error) {
      console.log("Error al guardar el mensaje:", error.message);
    }
  });
});

async function getChatFromDatabase(chatId) {
  const chat = await Chat.findById(chatId);
  return chat;
}

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
