import React, { ReactNode, useState, useEffect } from "react";
import { SidebarChat, TextSender, ChatContainer } from "@/components";
import Image from "next/image";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store/store";
import { resetChatId } from "@/redux/slices/chats";
import { useAppDispatch } from "@/redux/hooks";

type Props = {
  children: ReactNode;
};

const MasterLayout: React.FC<Props> = ({ children }) => {
  const dispatch = useAppDispatch();
  const session = useSelector(
    (state: RootState) => state?.authSession.session.current
  );
  console.log("session", session);

  useEffect(() => {
    dispatch(resetChatId());
  }, []);

  const chatId = useSelector((state: RootState) => state.chats.currentChat.id);

  return (
    <>
      <main className="max-h-screen min-h-screen  overflow-hidden">
        <header className="flex h-[80px] items-center justify-center  bg-white ">
          <div className="padding-x-estilo2 flex w-full items-center justify-between px-8 ">
            <Image
              src="/icon/logo.svg"
              alt="logo"
              width={80}
              height={50}
              className="object-fill"
            />
            <div className="flex items-center justify-center gap-2 rounded-full bg-violet-200  p-1 pr-4">
              <Image
                src={session.profilePicture || "/image/p4.jpg"}
                alt="logo"
                width={40}
                height={40}
                className=" aspect-square rounded-full bg-white object-cover p-[2px] "
              />
              <p className="text-sm font-medium text-violet-800">Thomas</p>
            </div>
          </div>
        </header>
        <section className="relative grid h-[calc(100vh-104px)] max-h-[calc(100vh-80px)] w-screen grid-cols-[350px,auto] overflow-hidden pb-6 pr-10 ">
          <SidebarChat />
          <div className="relative h-full w-full">
            <div
              id="chatMaster"
              className="absolute h-[calc(100vh-104px)]  w-full overflow-hidden rounded-3xl bg-violet-50 "
            >
              {chatId !== "" && chatId !== null && (
                <>
                  <div className="h-[100%] ">
                    <ChatContainer />
                  </div>
                  <TextSender />
                </>
              )}
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default MasterLayout;
