// ../socket.ts

import { io, Socket } from 'socket.io-client';

let socket: Socket;

export const initSocket = () => {
  socket = io('http://localhost:3001'); // Reemplaza la URL con la dirección de tu servidor backend

  socket.on('connect', () => {
    console.log('Socket conectado');
    return true
  });
};


export const getSocket = () => {
  console.log('getSocket', socket);
  if (!socket) {
    throw new Error('Socket.io no inicializado. Llama a initSocket() primero.');
  }
  return socket;
};
