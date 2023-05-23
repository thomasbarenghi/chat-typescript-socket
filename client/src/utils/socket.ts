// ../socket.ts

import { io, Socket } from "socket.io-client";

//let socket: Socket;

const urlServer = process.env.NEXT_PUBLIC_SERVER_URL;

// export const initSocket = (id: string) => {

//   socket = io(`${urlServer}`, {
//     query: {
//       userId: id || "",
//     },
//   });

//   socket.on("connect", () => {
//     console.log("Socket conectado");
//     return true;
//   });
// };

// export const getSocket = () => {
//   console.log("getSocket", socket);
//   if (!socket) {
//     console.log("Socket.io no inicializado. Llama a initSocket() primero.");
//     return null;
//   }
//   console.log("getSocket ok", socket);
//   return socket;
// };

let socket: Socket | null = null;

export const initSocket = (id: string) => {
  if (socket) {
    console.log("Socket ya inicializado");
    return;
  }

  socket = io(`${urlServer}`, {
    query: {
      userId: id || "",
    },
  });

  return new Promise<void>((resolve, reject) => {
    socket!.on("connect", () => {
      console.log("Socket conectado");
      resolve();
    });

    socket!.on("connect_error", (error: any) => {
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
