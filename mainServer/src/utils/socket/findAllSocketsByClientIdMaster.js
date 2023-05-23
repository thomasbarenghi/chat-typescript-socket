function findAllSocketsByClientIdMaster({ clientIdMaster, sockets }) {
  const matchingSockets = [];
  for (const socket of sockets) {
    if (socket.clientIdMaster === clientIdMaster) {
      matchingSockets.push(socket);
    }
  }
  return matchingSockets;
}

module.exports = {
  findAllSocketsByClientIdMaster,
};
