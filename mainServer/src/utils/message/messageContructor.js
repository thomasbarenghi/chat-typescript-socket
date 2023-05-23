const { formatMessageTime } = require("./formatMessageTime");

class MessageToFront {
  constructor(newMessage, chatId, lastMessage) {
    const { sender } = newMessage;
    this.newMessage = {
      ...newMessage.toJSON(),
      origin: sender._id.toString() === newMessage.sender._id.toString(),
      time: formatMessageTime(newMessage),
    };
    this.chatId = chatId;
    this.lastMessage = lastMessage;
  }
}

module.exports = { MessageToFront };
