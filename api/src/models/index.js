const models = {
    //beatsModel: require("./nosql/beats"),
    //genreModel: require("./nosql/genre"),
   // reviewsModel: require("./nosql/reviews"),
    userModel: require("./nosql/user"),
    chatModel: require("./nosql/chat").Chat,
    messageModel: require("./nosql/chat").Message,
    //cartModel: require("./nosql/cart")
  };
  module.exports = models;
  