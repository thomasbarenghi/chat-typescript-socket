const express = require("express");
const router = express.Router();
const Chat = require("../models/nosql/chat").Chat;
const User = require("../models/nosql/user");

router.post("/", async (req, res) => {
  try {
    // Obtén los IDs de los usuarios involucrados en el chat

    const currentUserID = req.body._id; // Suponiendo que utilizas autenticación y obtienes el ID del usuario actual
    const otherUserID = req.body.otherUserID; // El ID del otro usuario con el que se quiere iniciar el chat

    if (!currentUserID || !otherUserID) {
      return res.status(400).json({ error: "Faltan datos" });
    }

    console.log("currentUserID:", currentUserID, otherUserID);

    // Crea una instancia del modelo Chat
    const newChat = new Chat({
      participants: [currentUserID, otherUserID],
    });

    // Guarda el chat en la base de datos
    await newChat.save();

    // Agrega el chat a los usuarios correspondientes
    await User.findByIdAndUpdate(currentUserID, {
      $push: { chats: newChat._id },
    });
    await User.findByIdAndUpdate(otherUserID, {
      $push: { chats: newChat._id },
    });

    // Retorna la información del nuevo chat creado
    res.json(newChat);
  } catch (error) {
    console.error("Error al crear el chat:", error.message);
    res.status(500).json({ error: "Error al crear el chat" });
  }
});

router.get("/", async (req, res) => {
  try {
    // Obtener todo
    const chats = await Chat.find();
    res.json(chats);
  } catch (error) {
    console.error("Error al obtener los chats:", error);
    res.status(500).json({ error: "Error al obtener los chats" });
  }
});

//debemos borar el chat de los usuarios involucrados, tambien las referencias del chat en los usuarios

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

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  //buscmaos por id de chat
  try {
    //hacemos un populate de los participantes trayendo nombre, apellido, id y foto
    //tambien populamos el sender de los mensajes
    const chat = await Chat.findById(id)
      .populate([
        {
          path: "participants",
          model: "User",
          select: "firstName lastName _id image email",
        },
      ])
      .populate({
        path: "messages",
        model: "Message",
        populate: {
          path: "sender",
          model: "User",
          select: "firstName lastName _id image email",
        },
      })
      .populate({
        path: "lastMessage",
        model: "Message",
        populate: {
          path: "sender",
          model: "User",
          select: "_id",
        },
      });

    res.json(chat);
  } catch (error) {
    console.error("Error al obtener el chat:", error);
    res.status(500).json({ error: "Error al obtener el chat" });
  }
});

module.exports = router;
