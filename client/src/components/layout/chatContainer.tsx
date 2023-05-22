import React, { useEffect } from "react";
import Image from "next/image";
import { getSocket } from "@/utils/socket";
import { setCurrentChat } from "@/redux/slices/chats";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";

const ChatContainer = () => {
  const dispatch = useAppDispatch();
  const currentChat = useAppSelector(
    (state) => state.chats.currentChat.messages
  );

  const chats = useAppSelector((state) => state.chats);
console.log("chats", chats);
  const chatId = useAppSelector((state) => state.chats.currentChat.id);
  const socket = getSocket();
  useEffect(() => {
    if(socket) {
    socket.on("newMessage", (message: any) => {
      console.log("newMessage", message);
      dispatch(setCurrentChat(message)); //chatId
    });
  
    // console.log("newChat estamos escuchando");
    // socket.on("newChat", () => {
    //   console.log("newChat");
    // });

    return () => {
      socket.off("newMessage");
      // socket.off("newChat");
    };
  }
  }, [socket]);

  useEffect(() => {
    console.log("test");
  }, []);

  function isURL(str: string) {
    try {
      new URL(str);
      return true;
    } catch (error) {
      return false;
    }
  }

  console.log("currentChat", currentChat);

  return (
    <>
      <div className="flex h-full max-h-[100%] w-full grid-cols-1 flex-col items-start overflow-y-scroll pb-[100px] pt-4 align-middle">
        {currentChat &&
          chatId !== "" &&
          chatId !== null &&
          currentChat.map((message: any, index: any) => {
            const isThomas = message.origin === true;
            return (
              <div key={index} className="flex w-full flex-col gap-1 px-6 py-3">
                <div
                  className={`flex  ${
                    isThomas
                      ? "flex-row-reverse justify-start"
                      : "flex-row  justify-start"
                  } h-max w-full items-center gap-2 `}
                >
                  <Image
                    src={message.sender.image}
                    alt="perfil"
                    width={55}
                    height={55}
                    className="aspect-square rounded-full bg-white object-cover p-[2px]"
                  />
                  {
                    //verificamos si es una url
                    isURL(message.content) ? (
                      <Image
                        src={message.content}
                        alt="imagen"
                        width={250}
                        height={250}
                        className="aspect-square rounded-[30px] bg-white object-cover p-2"
                      />
                    ) : (
                      <p
                        className={`bg-white p-4 text-sm font-normal text-violet-800 ${
                          isThomas ? "rounded-3xl" : "rounded-3xl"
                        } max-w-[75%] `}
                      >
                        {message.content}
                      </p>
                    )
                  }
                </div>
                <div
                  className={`flex  ${
                    isThomas
                      ? "flex-row-reverse justify-start"
                      : "flex-row  justify-start"
                  } h-max w-full items-center px-[70px] `}
                >
                  <p className="text-xs text-violet-400">{message.time}</p>
                </div>
              </div>
            );
          })}
      </div>
    </>
  );
};

export default ChatContainer;
