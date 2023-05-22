const { formatMessageTime } = require("../message/formatMessageTime");

const formatMessagesChatsForResponse = (messages, id) => {
  if (!messages) {
    return [];
  }

  const formatMessage = (message) => {
    const isCurrentUser = message.sender._id.toString() === id;

    return {
      ...message.toJSON(),
      origin: isCurrentUser,
      time: formatMessageTime(message),
    };
  };

  let formattedChats;

  if (Array.isArray(messages)) {
    formattedChats = messages.map((chat) => {
      const formattedMessages = chat.messages.map(formatMessage);

      const lastMessage = {
        ...chat.lastMessage.toJSON(),
        time: formatMessageTime(chat.lastMessage),
      };

      return {
        ...chat.toJSON(),
        messages: formattedMessages,
        lastMessage: lastMessage,
      };
    });

    formattedChats.sort((a, b) => b.lastModified - a.lastModified);
  } else {
    const formattedMessages = messages.messages.map(formatMessage);

    const lastMessage = {
      ...messages.lastMessage.toJSON(),
      time: formatMessageTime(messages.lastMessage),
    };

    formattedChats = {
      ...messages.toJSON(),
      messages: formattedMessages,
      lastMessage: lastMessage,
    };
  }

  return formattedChats;
};

module.exports = { formatMessagesChatsForResponse };
