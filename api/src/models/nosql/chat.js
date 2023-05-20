// const mongoose = require("mongoose");

// const ChatSchema = new mongoose.Schema({
//   participants: [
//     {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//     },
//   ],
//   id: {
//     type: mongoose.Types.ObjectId,
//   },
//   messages: [
//     {
//       sender: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "User",
//       },
//       //content se usa para guardar el mensaje
//       content: String,
//       timestamp: {
//         type: Date,
//         default: Date.now,
//       },
//     },
//   ],
// });

// module.exports = mongoose.model("Chat", ChatSchema);
// const mongoose = require("mongoose");

// const MessageSchema = new mongoose.Schema({
//   sender: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User",
//   },
//   content: String,
//   timestamp: {
//     type: Date,
//     default: Date.now,
//   },
//   previousMessage: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Message",
//     default: null,
//   },
//   nextMessage: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Message",
//     default: null,
//   },
// });

// const ChatSchema = new mongoose.Schema({
//   id: {
//     type: mongoose.Types.ObjectId,
//   },
//   participants: [
//     {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//     },
//   ],
//   messages: {
//     //un json con los mensajes
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Message",
//     default: null,
//   },
// });

// module.exports = {
//   Chat: mongoose.model("Chat", ChatSchema),
//   Message: mongoose.model("Message", MessageSchema),
// };

const mongoose = require("mongoose");


const MessageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  chatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Chat",
    required: true,
  },
});

const ChatSchema = new mongoose.Schema({
  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  ],
  messages: [MessageSchema],
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Message",
  },
});


const Chat = mongoose.model("Chat", ChatSchema);
const Message = mongoose.model("Message", MessageSchema);

// En el modelo MessageSchema


module.exports = {
  Chat,
  Message,
};
