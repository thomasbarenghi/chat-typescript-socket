const moment = require("moment");

const formatMessageTime = (message) => {
  //comparamos con zona horaria de 2023-05-24T00:02:38.112+00:00
  moment().utcOffset("-03:00");
  const today = moment().startOf("day");

  const messageDate = moment(message.date);
  const diffInDays = messageDate.diff(today, "days");


  if (diffInDays < 24) {
    return messageDate.format("HH:mm");
  } else if (diffInDays < 48) {
    return `Ayer a las ${messageDate.format("HH:mm")}`
  } else {
    return messageDate.format("DD/MM/YYYY");
  }
};

module.exports = { formatMessageTime };
// const { DateTime } = require("luxon");

// const formatMessageTime = (message) => {
//   const today = DateTime.local().startOf("day");
//   console.log("today", today);

//   const messageDate = DateTime.fromISO(message.date);
//   const diffInDays = today.diff(messageDate, "days").toObject().days;
//   console.log("diffInDays", diffInDays);

//   if (diffInDays === 0) {
//     return messageDate.toFormat("HH:mm");
//   } else if (diffInDays === 1) {
//     return `Ayer a las ${messageDate.toFormat("HH:mm")}`;
//   } else {
//     return messageDate.toFormat("dd/MM/yyyy");
//   }
// };

// module.exports = { formatMessageTime };
