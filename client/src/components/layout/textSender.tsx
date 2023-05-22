import React, { ReactNode, useState, useEffect } from "react";
import { getSocket, initSocket } from "@/utils/socket";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store/store";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";

interface IMsg {
  user: string;
  msg: string | null;
  chatId: string;
  image: any;
}

const TextSender = () => {
  const reader = new FileReader();
  const currentUser = useAppSelector(
    (state) => state.authSession.session.current._id
  );
  const chatId: any = useAppSelector((state) => state.chats.currentChat.id);

  const sendMessage = async (e: any) => {
    e.preventDefault();
    const image = e.target.image.files[0];
    if (image) {
      console.log("Hay imagen seleccionada");

        const socket = getSocket();

        const message: IMsg = {
          user: currentUser,
          msg: null,
          chatId: chatId,
          image: {
            file: image,
            fileName: image.name,
          },
        };
        console.log("message ok", message);
        socket.emit("message", message);

      // Resto del código de envío del mensaje...
    } else {
      console.log("No hay imagen seleccionada");
      const msg = e.target.msg.value;
      const socket = getSocket();

      const message: IMsg = {
        user: currentUser,
        msg: msg,
        chatId: chatId,
        image: null,
      };

      socket.emit("message", message);
    }
    //reseteamos el formulario
    e.target.reset();
  };

  return (
    <>
      <div className="absolute   bottom-0 left-0 right-0 flex bg-violet-50 px-6  pb-6 ">
        <div className=" flex h-[60px] w-full rounded-full border border-violet-200 bg-white">
          <form
            className="flex w-full items-center justify-between gap-2 px-6 py-3"
            onSubmit={sendMessage}
          >
            <input
              className="flex-grow rounded-full  py-2 text-sm font-normal text-violet-800 outline-none placeholder:text-violet-800"
              placeholder="Escribe un mensaje"
              name="msg"
            />
            {/* Opcion para subir una imagen */}
            <input
              className="flex-grow rounded-full  py-2 text-sm font-normal text-violet-800 outline-none placeholder:text-violet-800"
              type="file"
              name="image"
            />
            <button className=" text-sm font-semibold text-violet-800">
              Enviar
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default TextSender;
