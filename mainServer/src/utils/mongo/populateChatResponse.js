const Chat = require("../../models/nosql/chat").Chat;
const User = require("../../models/nosql/user");

const populateFields = (model, path, select) => {
  return {
    path,
    model,
    select,
  };
};

const populateChatFields = (chat) => {
  const populateParticipants = populateFields(
    "User",
    "participants",
    "firstName lastName _id image email"
  );
  const populateSender = populateFields(
    "User",
    "sender",
    "firstName lastName _id image email"
  );

  if (Array.isArray(chat)) {
    // Caso de array de chats
    return Chat.populate(chat, [
      populateParticipants,
      {
        path: "messages",
        model: "Message",
        populate: populateSender,
      },
      {
        path: "lastMessage",
        model: "Message",
        populate: populateSender,
      },
    ]);
  } else {
    // Caso de un solo chat
    return chat.populate([
      populateParticipants,
      {
        path: "messages",
        model: "Message",
        populate: populateSender,
      },
      {
        path: "lastMessage",
        model: "Message",
        populate: populateSender,
      },
    ]);
  }
};

module.exports = { populateChatFields };
