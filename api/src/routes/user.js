const express = require("express");
const router = express.Router();
const Chat = require("../models/index").chatModel;
const User = require("../models/index").userModel;
const { populateChatFields } = require("../utils/mongo/populateChatResponse");
const {
  formatMessagesChatsForResponse,
} = require("../utils/mongo/formatMessagesChatsForResponse");

//--------------------OBTENCION--------------------
//CHATS DE UN USUARIO
router.get("/:id/chats", async (req, res) => {
  const { id } = req.params;

  try {
    const chats = await Chat.find({ participants: { $in: [id] } });
    await populateChatFields(chats);

    const formattedChats = formatMessagesChatsForResponse(chats, id);

    res.json(formattedChats);
  } catch (error) {
    console.error("Error al obtener los chats:", error);
    res.status(500).json({ error: "Error al obtener los chats" });
  }
});

//CHAT DE UN USUARIO
router.get("/:id/chats/:chatId", async (req, res) => {
  const { id, chatId } = req.params;

  try {
    const chats = await Chat.findById(chatId);
    await populateChatFields(chats);

    const formattedChats = formatMessagesChatsForResponse(chats, id);

    res.json(formattedChats);
  } catch (error) {
    console.error("Error al obtener el chat:", error);
    res.status(500).json({ error: "Error al obtener el chat" });
  }
});

//USUARIO POR ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id).populate("chats");
    await populateChatFields(user.chats);

    const formattedUser = {
      ...user.toJSON(),
      chats: formatMessagesChatsForResponse(user.chats, id),
    };

    res.json(formattedUser);
  } catch (error) {
    console.error("Error al obtener el usuario:", error.message);
    res.status(500).json({ error: "Error al obtener el usuario" });
  }
});

//USUARIOS
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
