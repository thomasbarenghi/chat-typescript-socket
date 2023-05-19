import React, { ReactNode } from "react";
import { SidebarChat, TextSender, ChatContainer } from "@/components";
import Image from "next/image";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store/store";

type Props = {
  children: ReactNode;
};

const MasterLayout: React.FC<Props> = ({ children }) => {
  const session = useSelector(
    (state: RootState) => state?.authSession.session.current
  );
  console.log("session", session);

  return (
    <>
      <main className="max-h-screen min-h-screen overflow-hidden">
        <header className="flex h-[80px] items-center justify-center  bg-white ">
          <div className="padding-x-estilo2 flex w-full items-center justify-between px-8 ">
            <Image
              src="/icon/logo.svg"
              alt="logo"
              width={80}
              height={50}
              className="object-fill"
            />
            <div className="flex items-center justify-center gap-2 bg-violet-200 rounded-full  p-1 pr-4">
              <Image
                src={session.profilePicture || "/image/p4.jpg"}
                alt="logo"
                width={40}
                height={40}
                className=" aspect-square rounded-full object-cover bg-white p-[2px] "
              />
              <p className="text-sm font-medium text-violet-800">Thomas</p>
            </div>
          </div>
        </header>
        <section className="grid  h-[calc(100vh-80px)] w-screen grid-cols-[350px,auto] overflow-hidden ">
          <div className=" overflow-y-scroll">
            <SidebarChat />
          </div>
          <div className="pb-5 pr-10" >
          <div className="relative h-full w-full overflow-hidden rounded-3xl">
            <div className="sticky top-0  h-full bg-violet-50 ">
                <ChatContainer />
              <TextSender />
            </div>
          </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default MasterLayout;
