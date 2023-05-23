const express = require("express");
const http = require("http");
const { ExpressPeerServer, PeerServer } = require("peer");
const socketConfig = require("./socket");

const app = express();
const server = http.createServer(app);
socketConfig.attach(server);
// make all the files in 'public' available
// https://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

// https://expressjs.com/en/starter/basic-routing.html
app.get("/", (request, response) => {
  response.sendFile(__dirname + "/views/index.html");
});

const listener = server.listen(3001, () => {
  console.log("Your app is listening on port " + listener.address().port);
});

// peerjs server
const peerServer = PeerServer({
    port: 9000,
  path: "/myapp",
});

peerServer.on("connection", (client) => {
  console.log("connection", client);
});
peerServer.on("disconnect", (client) => {
  console.log("disconnect", client);
});
peerServer.on("error", (client) => {
  console.log("error", client);
});

app.use("/peerjs", peerServer);

// listen for requests :)
