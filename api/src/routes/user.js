const express = require("express");
const router = express.Router();
const Chat = require("../models/index").chatModel;
const User = require("../models/index").userModel;
const moment = require("moment");
//Obtenemos los chats del usuario actual

// router.get("/:id/chats", async (req, res) => {
//   const { id } = req.params;

//   try {
//     const chats = await Chat.find({ participants: { $in: [id] } }).populate([
//       {
//         path: "participants",
//         model: "User",
//         select: "firstName lastName _id image",
//       },
//     ]);
//     res.json(chats);
//   } catch (error) {
//     console.error("Error al obtener los chats:", error);
//     res.status(500).json({ error: "Error al obtener los chats" });
//   }
// });

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

router.get("/:id/chats", async (req, res) => {
  const { id } = req.params;

  try {
    const chats = await Chat.find({ participants: { $in: [id] } }).populate([
      {
        path: "participants",
        model: "User",
        select: "firstName lastName _id image",
      },
      {
        path: "messages",
        model: "Message",
      },
      {
        path: "lastMessage",
        model: "Message",
      },
    ]);

    const formattedChats = !chats.messages
      ? chats
      : chats.map((chat) => {
          const messages = chat.messages.map((message) => {
            const isCurrentUser = message.sender.toString() === id;

            return {
              ...message.toJSON(),
              origin: isCurrentUser,
            };
          });

          const lastMessage = {
            ...chat.lastMessage.toJSON(),
            time: formatMessageTime(chat.lastMessage),
          };

          return {
            ...chat.toJSON(),
            messages: messages,
            lastMessage: lastMessage,
          };
        });

    res.json(formattedChats);
  } catch (error) {
    console.error("Error al obtener los chats:", error);
    res.status(500).json({ error: "Error al obtener los chats" });
  }
});

//obtenemos un chat del usuario actual
router.get("/:id/chats/:chatId", async (req, res) => {
  const { id, chatId } = req.params;

  try {
    const chats = await Chat.findById(chatId).populate([
      {
        path: "participants",
        model: "User",
        select: "firstName lastName _id image email",
      },
      {
        path: "messages",
        model: "Message",
        populate: {
          path: "sender",
          model: "User",
          select: "firstName lastName _id image email",
        },
      },
      {
        path: "lastMessage",
        model: "Message",
        populate: {
          path: "sender",
          model: "User",
          select: "_id",
        },
      },
    ]);

  

    const formattedChats = !chats.messages || chats.messages.length === 0
    ? chats
    : {
      ...chats.toJSON(),
      messages: chats.messages.map((message) => {
        const isCurrentUser = message.sender._id.toString() === id;

        return {
          ...message.toJSON(),
          origin: isCurrentUser,
        };
      }),
      lastMessage: {
        ...chats.lastMessage.toJSON(),
        time: formatMessageTime(chats.lastMessage),
      },
    };

    res.json(formattedChats);
  } catch (error) {
    console.error("Error al obtener el chat:", error);
    res.status(500).json({ error: "Error al obtener el chat" });
  }
});

//obtenemos los datos del usuario actual

router.get("/:id", async (req, res) => {
  const { id } = req.params;

  //buscamos en mongo

  try {
    const user = await User.findById(id).populate([
      {
        path: "chats",
        model: "Chat",
        populate: [
          {
            path: "participants",
            model: "User",
            select: "firstName lastName _id image email",
          },
          {
            path: "lastMessage",
            model: "Message",
            populate: {
              path: "sender",
              model: "User",
              select: "_id",
            },
          },
        ],
      },
    ]);

    res.json(user);
  } catch (error) {
    console.error("Error al obtener el usuario:", error.message);
    res.status(500).json({ error: "Error al obtener el usuario" });
  }
});

//obtenemos todos los usuarios
router.get("/", async (req, res) => {
  const { email, page = 1, limit = 10 } = req.query;

  try {
    let users;
    if (email) {
      const emailRegex = new RegExp(email, "i"); // "i" para ignorar mayúsculas y minúsculas
      users = await User.find({ email: { $regex: emailRegex } })
        .select("firstName lastName _id image email")
        .limit(limit * 1)
        .skip((page - 1) * limit);
    } else {
      users = await User.find().populate([
        {
          path: "chats",
          model: "Chat",
          populate: {
            path: "participants",
            model: "User",
            select: "firstName lastName _id image email",
          },
        },
      ]);
    }

    res.json(users);
  } catch (error) {
    console.error("Error al obtener los usuarios:", error.message);
    res.status(500).json({ error: "Error al obtener los usuarios" });
  }
});

module.exports = router;
