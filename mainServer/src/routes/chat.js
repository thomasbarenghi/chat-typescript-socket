const express = require("express");
const router = express.Router();
const Chat = require("../models/nosql/chat").Chat;
const User = require("../models/nosql/user");
const { populateChatFields } = require("../utils/mongo/populateChatResponse");

//--------------------CREACION--------------------
router.post("/", async (req, res) => {
  try {
    const { _id: currentUserID, otherUserID } = req.body;
    const userIds = [currentUserID, otherUserID];
    const updatePromises = [];
    console.log("userIds", userIds);

    if (!currentUserID || !otherUserID) {
      return res.status(400).json({ error: "Faltan datos" });
    }

    const newChat = new Chat({
      participants: [currentUserID, otherUserID],
    });

    await newChat.save();

    for (const userId of userIds) {
      const updatePromise = await User.findByIdAndUpdate(userId, {
        $push: { chats: newChat._id },
      });
      updatePromises.push(updatePromise);
    }

    await Promise.all(updatePromises);

    res.json(newChat);
  } catch (error) {
    console.error("Error al crear el chat:", error.message);
    res.status(500).json({ error: "Error al crear el chat" });
  }
});

//--------------------BORRADO--------------------
router.delete("/:chatId", async (req, res) => {
  try {
    const chatId = req.params.chatId;

    // Elimina el chat de la base de datos
    await Chat.findByIdAndDelete(chatId);
    // Elimina la referencia del chat en los usuarios correspondientes
    await User.updateMany({ chats: chatId }, { $pull: { chats: chatId } });

    res.json({ message: "Chat eliminado exitosamente" });
  } catch (error) {
    console.error("Error al eliminar el chat:", error);
    res.status(500).json({ error: "Error al eliminar el chat" });
  }
});

//--------------------OBTENCION--------------------
router.get("/", async (req, res) => {
  try {
    const chats = await Chat.find();
    res.json(chats);
  } catch (error) {
    console.error("Error al obtener los chats:", error);
    res.status(500).json({ error: "Error al obtener los chats" });
  }
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  // Buscamos por id de chat
  try {
    const chat = await Chat.findById(id);
    if (!chat) {
      return res.status(404).json({ error: "El chat no existe" });
    }

    await populateChatFields(chat);

    res.json(chat);
  } catch (error) {
    console.error("Error al obtener el chat:", error);
    res.status(500).json({ error: "Error al obtener el chat" });
  }
});

module.exports = router;
