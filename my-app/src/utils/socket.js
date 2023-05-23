// ../socket.ts

import { io, Socket } from "socket.io-client";

//let socket: Socket;

const urlServer = "http://localhost:3001/"

let socket= null;

export const initSocket = (id) => {
  if (socket) {
    console.log("Socket ya inicializado");
    return;
  }

  socket = io(`${urlServer}`, {
    query: {
      userId: id || "",
    },
  });

  return new Promise((resolve, reject) => {
    socket.on("connect", () => {
      console.log("Socket conectado");
      resolve();
    });

    socket.on("connect_error", (error) => {
      console.error("Error al conectar el socket:", error);
      reject(error);
    });
  });
};

export const getSocket = () => {
  if (!socket) {
    console.log("Socket.io no inicializado. Llama a initSocket() primero.");
    return null;
  }

  return socket;
};
