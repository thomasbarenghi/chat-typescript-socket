import React, { ReactNode } from "react";
import Image from "next/image";
import { getCurrentChat } from "../../redux/slices/chats";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { useState, useEffect } from "react";
import { getSocket, initSocket } from "@/utils/socket";

const SidebarChat = () => {
  const dispatch = useAppDispatch();
  const chats = useAppSelector((state) => state.chats.chats);
  const user = useAppSelector((state) => state.authSession.session.current);
  const chatsFiltered = chatFormater({ chats, user });
  console.log("chatsFiltered", chats);
  const setSala = (e: any) => {
    const socket = getSocket();
    console.log("e.chatId", e.chatId);
    socket.emit("selectChat", {
      chatId: e.chatId,
    });
    dispatch(getCurrentChat(e.chatId));
  };

  return (
    <>
      <div className="flex h-full max-h-full w-full  flex-col  overflow-y-scroll  px-8">
        <div className="mb-4 flex items-center justify-start gap-2 rounded-full bg-violet-200 px-6 py-3">
          <Image
            src="/icon/search.svg"
            alt="logo"
            width={20}
            height={20}
            className="aspect-square"
          />
          <input
            type="text"
            placeholder="Buscar un chat"
            className="min-w-[0px] bg-violet-200 text-sm font-normal text-violet-800 placeholder:text-violet-800"
          />
        </div>
        <div>
          {chatsFiltered.map((chat: any, index: any) => (
            <div
              key={index}
              className="flex cursor-pointer items-center  justify-between"
              onClick={(e) => setSala({ chatId: chat._id })}
            >
              <div className="flex w-full items-center justify-start gap-2   py-2">
                <Image
                  src={chat.participants.image}
                  alt="logo"
                  width={60}
                  height={60}
                  className=" aspect-square rounded-full object-cover"
                />
                <div className="relative flex w-full flex-col gap-0">
                  <p className="text-base font-medium">
                    {chat.participants.firstName +
                      " " +
                      chat.participants.lastName}
                  </p>
                  <p className="text-sm font-light">{chat.messages.content}</p>
                  <p className="absolute right-0 top-1 text-sm font-light">
                    {chat.time}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default SidebarChat;

type Props = {
  chats: any;
  user: any;
};

const chatFormater = ({ chats, user }: Props) => {
  const chatsFiltered = chats.map((chat: any) => {
    const filteredParticipants = chat.participants.filter(
      (participant: any) => participant._id !== user._id
    );
    const updatedChat = Object.assign({}, chat);
    if (filteredParticipants.length > 0) {
      updatedChat.participants = filteredParticipants[0];
    } else {
      updatedChat.participants = null;
    }

    const messages = chat.messages;
    const lastMessage = messages[messages.length - 1] ?? { content: "" };
    updatedChat.messages = lastMessage;

    const date = new Date(lastMessage.date);
    const hours = date.getHours();
    const minutes = date.getMinutes();

    const time =
      !Number.isNaN(hours) && !Number.isNaN(minutes)
        ? hours + ":" + minutes
        : "";

    const updatedChat2 = {
      ...updatedChat,
      messages: updatedChat.messages,
      participants: updatedChat.participants,
      time: time,
    };

    return updatedChat2;
  });

  return chatsFiltered;
};
