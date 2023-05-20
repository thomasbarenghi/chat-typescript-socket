import React, { ReactNode, useState, useEffect } from "react";
import { getSocket, initSocket } from "@/utils/socket";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store/store";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";

interface IMsg {
  user: string;
  msg: string;
  chatId: string;
}

const TextSender = () => {
  const currentUser = useAppSelector(
    (state) => state.authSession.session.current._id
  );
  const chatId: any = useAppSelector((state) => state.chats.currentChat.id);

  const sendMessage = async (e: any) => {
    e.preventDefault();
    console.log("chatId", chatId);
   const msg = e.target.msg.value;

    if (msg) {
      const message: IMsg = {
        user: currentUser,
        msg,
        chatId: chatId,
      };
      console.log("message", message);
      const socket = getSocket();
      socket.emit("message", message);


    
      //hacemos reset
      e.target.msg.value = "";
    } else {
      console.log("No hay mensaje");
    }
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
