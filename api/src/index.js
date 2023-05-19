const server = require("./config/app.js");
const {dbConnect} = require("./config/mongo");

server.listen(3001, () => {
  console.log(`Servidor iniciado en el puerto 3001`);
});

dbConnect();

