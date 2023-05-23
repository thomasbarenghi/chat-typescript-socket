const moment = require("moment");

const formatMessageTime = (message) => {
  const today = moment().startOf("day");
  const messageDate = moment(message.date);
  const diffInDays = today.diff(messageDate, "days");

  if (diffInDays === 0) {
    return messageDate.format("HH:mm");
  } else if (diffInDays === 1) {
    return "Ayer";
  } else {
    return messageDate.format("DD/MM/YYYY");
  }
};

module.exports = { formatMessageTime };
