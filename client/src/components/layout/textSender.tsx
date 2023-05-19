import React, { ReactNode } from "react";
import Image from "next/image";

const arrChats = [
  {
    name: "Maria Gomez",
    message: "Hola, como estas?",
    time: "20:21",
    profilePicture: "/image/placeholder.png",
  },
  {
    name: "Juan Zelmer",
    message: "Que era un array?",
    time: "17:00",
    profilePicture: "/image/placeholder.png",
  },
  {
    name: "Sofia Perez",
    message: "Socket io es genial!",
    time: "17:00",
    profilePicture: "/image/placeholder.png",
  },
];

const TextSender = () => {
  return (
    <>
    <div className="flex   bg-white border border-violet-200 absolute bottom-6 left-6 right-6 h-[60px] rounded-full">
     <input className="flex-grow font-normal text-sm px-5 py-2 rounded-full outline-none text-violet-800 placeholder:text-violet-800" placeholder="Escribe un mensaje" />
    </div>
    </>
  );
};

export default TextSender;
