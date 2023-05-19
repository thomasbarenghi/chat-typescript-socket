const mongoose = require("mongoose");
require("dotenv").config();
const { DB_URI, } = process.env;

const dbConnect = async () => {
  try {
    mongoose.set("strictQuery", false);

    await mongoose.connect(DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("**** CONEXION CORRECTA ****");
  } catch (err) {
    console.log("**** ERROR DE CONEXION ****");
    console.error(err);
  }
};
process.on('unhandledRejection', error => {
  console.log('unhandledRejection', error.message);
});
module.exports = {dbConnect};
