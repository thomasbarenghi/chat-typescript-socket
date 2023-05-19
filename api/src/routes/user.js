const express = require("express");
const router = express.Router();
const Chat = require("../models/index").chatModel;
const User = require("../models/index").userModel;

//Obtenemos los chats del usuario actual

router.get("/:id/chats", async (req, res) => {
  const { id } = req.params;

  try {
    const chats = await Chat.find({ participants: { $in: [id] } }).populate([
      {
        path: "participants",
        model: "User",
        select: "firstName lastName _id image",
      },
    ]);
    res.json(chats);
  } catch (error) {
    console.error("Error al obtener los chats:", error);
    res.status(500).json({ error: "Error al obtener los chats" });
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
        populate: {
          path: "participants",
          model: "User",
          select: "firstName lastName _id image email",
        },
      },
    ]);

    res.json(user);
  } catch (error) {
    console.error("Error al obtener el usuario:", error.message);
    res.status(500).json({ error: "Error al obtener el usuario" });
  }
});

module.exports = router;
