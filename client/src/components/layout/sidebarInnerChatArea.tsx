import Image from "next/image";
import {
  getCurrentChat,
  setCurrentChatOtherUser,
  resetCurrentChat,
} from "../../redux/slices/chats";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { getSocket } from "@/utils/socket";
import { Modal, SearchUser } from "@/components";
import { useState } from "react";


export default function SidebarInnerChatArea() {
  const dispatch = useAppDispatch();
  const socket = getSocket();
  const { chats: chatsFiltered } = useAppSelector((state) => state.chats);
  const [isOpen, setIsOpen] = useState(false);
  const [isOpen2, setIsOpen2] = useState(false);
  const setSala = (e: any) => {
    dispatch(resetCurrentChat());
    socket!.emit("selectChat", {
      chatId: e.chatId,
      otherUserId: e.otherUserId._id,
    });

    dispatch(setCurrentChatOtherUser(e.otherUserId));
    dispatch(getCurrentChat(e.chatId));
  };

  return (
    <>
      <Search />
      <div className="flex h-full max-h-full  w-full flex-col">
        <Chat chatsFiltered={chatsFiltered} setSala={setSala} />
        <div className="flex gap-4">
          <button
            className="flex items-center justify-start gap-2 text-sm"
            onClick={() => setIsOpen(true)}
          >
            <Image
              src="/icon/plus.svg"
              alt="logo"
              width={20}
              height={20}
              className="aspect-square"
            />
            Nuevo chat
          </button>
          <button
            className="flex items-center justify-start gap-2 text-sm"
            onClick={() => setIsOpen2(true)}
          >
            <Image
              src="/icon/settings.svg"
              alt="logo"
              width={20}
              height={20}
              className="aspect-square"
            />
            Ajustes
          </button>
        </div>
      </div>
      <div className="absolute bg-red-700">
        <Modal isOpen={isOpen} close={() => setIsOpen(false)}>
          <div>
            <SearchUser />
          </div>
        </Modal>
        <Modal isOpen={isOpen2} close={() => setIsOpen2(false)}>
          <div className="flex flex-col">
            <button>Configuracion</button>
            <button>Salir</button>
          </div>
        </Modal>
      </div>
    </>
  );
}

function Search() {
  return (
    <div className=" flex items-center justify-start gap-2 rounded-full bg-violet-200 px-6 py-3">
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
  );
}

type PropsChat = {
  chatsFiltered: any;
  setSala: any;
};

function Chat({ chatsFiltered, setSala }: PropsChat) {
  return (
    <div className="relative h-auto min-w-full flex-grow overflow-y-scroll ">
      <div className="absolute bottom-0 left-0 top-0 flex w-full flex-col gap-4 overflow-y-scroll">
        {chatsFiltered &&
          chatsFiltered.map((chat: any, index: any) => (
            <div
            onContextMenu={(e) => {
              e.preventDefault();
              console.log("click derecho");
            }
            }
              key={index}
              className="flex cursor-pointer items-center  justify-between"
              onClick={(e) =>
                setSala({ chatId: chat._id, otherUserId: chat.participants })
              }
            >
              <div className="flex w-full items-center justify-start gap-2   ">
                <Image
                  src={chat.participants.image}
                  alt="logo"
                  width={65}
                  height={65}
                  className="aspect-square rounded-full border border-violet-800 object-cover p-1"
                />
                <div className="relative flex w-full flex-col gap-0">
                  <p className="text-base font-medium">
                    {chat.participants.firstName +
                      " " +
                      chat.participants.lastName}
                  </p>
                  <p className="text-sm font-light text-violet-800">
                    {chat?.lastMessage?.content}
                  </p>
                  <p className="absolute right-0 top-1 text-sm font-light">
                    {chat?.lastMessage?.time}
                  </p>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
