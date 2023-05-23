const Chat = require("../../models/nosql/chat").Chat;
const Message = require("../../models/nosql/chat").Message;
const User = require("../../models/nosql/user");
const { uploadImage } = require("../../utils/cloudinary/uploadImage");
const { MessageToFront } = require("../../utils/message/messageContructor");

const sendMessage = async ({ message, socket, io }) => {
  try {
    console.log("Mensaje recibido:", message);
    const imageUrl = await uploadImage(message);
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

    await newMessage.save();
    chat.messages.push(newMessage);
    chat.lastMessage = newMessage._id;
    chat.lastModified = Date.now();
    await chat.save();

    const sender = await User.findById(message.user).select(
      "id email firstName lastName image email "
    );

    newMessage.sender = sender;

    const toFront = new MessageToFront(
      newMessage,
      message.chatId,
      chat.lastMessage
    );

    io.to(message.chatId).emit("newMessage", toFront);
 
const otherUserId = chat.participants.filter((user) => user != message.user)[0].toString();
console.log("Mensaje enviado:", otherUserId);
    io.to(otherUserId).emit("newChat");
  } catch (error) {
    console.log("Error al guardar el mensaje:", error.message);
  }
};

module.exports = { sendMessage };
