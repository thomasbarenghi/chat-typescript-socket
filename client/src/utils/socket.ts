// ../socket.ts

import { io, Socket } from "socket.io-client";

let socket: Socket;

const urlServer = process.env.NEXT_PUBLIC_SERVER_URL;

export const initSocket = (id: string) => {

  socket = io(`${urlServer}`, {
    query: {
      userId: id || "",
    },
  });

  socket.on("connect", () => {
    console.log("Socket conectado");
    return true;
  });
};

export const getSocket = () => {
  console.log("getSocket", socket);
  if (!socket) {
    console.log("Socket.io no inicializado. Llama a initSocket() primero.");
  }
  console.log("getSocket ok", socket);
  return socket;
};
