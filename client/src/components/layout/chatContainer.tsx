import React, { useEffect, useState } from "react";
import Image from "next/image";
import { getSocket } from "@/utils/socket";
import { setCurrentChat } from "@/redux/slices/chats";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { useRouter } from "next/router";
import { set } from "lodash";

const ChatContainer = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const currentChat = useAppSelector(
    (state) => state.chats.currentChat.messages
  );

  const otherUser = useAppSelector(
    (state) => state.chats.currentChat.otherUser
  );

  const chats = useAppSelector((state) => state.chats);
  console.log("chats", chats);
  const chatId = useAppSelector((state) => state.chats.currentChat.id);
  const currentId = useAppSelector(
    (state) => state.authSession.session.current._id
  );
  const socket = getSocket();
  useEffect(() => {
    if (socket) {
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

  function isURL(str: any) {
    try {
      if (str.type === "text") return false;
      new URL(str.content);
      return true;
    } catch (error) {
      return false;
    }
  }

  console.log("currentChat", currentChat);
  const [peerId, setPeer] = useState<any>(null);

  const handleJoinCall = () => {
    console.log("join call");
    const otherUserID = otherUser._id;
    const currentUserID = currentId;
    socket.emit(
      "callUser",
      {
        fromUserID: currentUserID,
        toUserID: otherUserID,
      },
      (data: any) => {
        console.log("UUID de la llamada:", data);
        router.push(`/call/${data}?owner=true`);
      }
    );
  };

  return (
    <>
      <div className="flex h-full max-h-[100%] w-full grid-cols-1 flex-col items-start overflow-y-scroll pb-[100px] pt-4 align-middle">
        <button
          className="absolute bottom-0 right-0 mb-[100px] mr-4 rounded-full bg-violet-800 p-2 "
          onClick={handleJoinCall}
        >
          llamar
        </button>
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
                    isURL(message) ? (
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
