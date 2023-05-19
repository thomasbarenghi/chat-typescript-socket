import React, { ReactNode } from "react";
import Image from "next/image";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store/store";

const ChatContainer = () => {
  const currentChat = useSelector(
    (state: RootState) => state.chats.currentChat
  );

  console.log("currentChat", currentChat);
  //hay que hacer un map de los mensajes, los mensajes de thomas a la derecha y los de juan a la izquierda
  return (
    <>
      <div className="flex h-full w-full grid-cols-1 flex-col items-start pb-[100px] pt-4 align-middle">
        {currentChat.map((message: any, index) => {
          const isThomas = message.origin === true;
          return (
            <div
              key={index}
              className={`flex  ${
                isThomas
                  ? "flex-row-reverse justify-start"
                  : "flex-row  justify-start"
              } h-max w-full items-center gap-2 px-6 py-3`}
            >
              <Image
                src={message.sender.image}
                alt="logo"
                width={55}
                height={55}
                className="aspect-square rounded-full bg-white object-cover p-[2px]"
              />

              <p
                className={`bg-white p-4 text-sm font-normal text-violet-800 ${
                  isThomas ? "rounded-3xl" : "rounded-3xl"
                } `}
              >
                {message.content}
              </p>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default ChatContainer;
