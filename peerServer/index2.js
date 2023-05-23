const express = require("express");

const { ExpressPeerServer } = require("peer");

const app = express();

// make all the files in 'public' available
// https://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

// https://expressjs.com/en/starter/basic-routing.html
app.get("/", (request, response) => {
  response.sendFile(__dirname + "/views/index.html");
});

// listen for requests :)
const listener = app.listen(3001, () => {
  console.log("Your app is listening on port " + listener.address().port);
});

// peerjs server
const peerServer = ExpressPeerServer(listener, {
  debug: true,
  path: '/myapp'
});

peerServer.on('connection', (client) => { console.log('connection', client) })
peerServer.on('disconnect', (client) => { console.log('disconnect', client) })
peerServer.on('error', (client) => { console.log('error', client) })

app.use('/peerjs', peerServer)
