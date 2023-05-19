import React, { ReactNode } from "react";
import Image from "next/image";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../redux/store/store";
import { getCurrentChat } from "../../redux/slices/chats";
import { useAppDispatch } from "@/redux/hooks";
const SidebarChat = () => {
  const chats = useSelector((state: RootState) => state.chats.chats);
  const user = useSelector(
    (state: RootState) => state.authSession.session.current
  );

  const dispatch = useAppDispatch();

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

    //dejamos solo el ultimo mensaje, considerando que messages es un array de objetos
    const messages = chat.messages;
    const lastMessage = messages[messages.length - 1];
    updatedChat.messages = lastMessage;

    //de messages.date obtenemos la hora

    const date = new Date(lastMessage.date);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const time = hours + ":" + minutes;

    console.log("time", hours, minutes, time);
    //creamos una propiedad hora
    const updatedChat2 = {
      ...updatedChat,
      messages: updatedChat.messages,
      participants: updatedChat.participants,
      time: time,
    };

    return updatedChat2;
  });

  console.log("chats", chatsFiltered, chats);
  return (
    <>
      <div className="flex h-full w-full  flex-col bg-white px-8">
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
          {chatsFiltered.map((chat: any, index) => (
            <div
              key={index}
              className="flex items-center justify-between  cursor-pointer"
              onClick={() => dispatch(getCurrentChat(chat._id))}
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
