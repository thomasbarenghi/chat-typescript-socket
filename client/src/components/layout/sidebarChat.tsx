import Image from "next/image";
import { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

const SidebarChat = ({ children }: Props) => {
  return (
    <>
      <div className="flex h-full max-h-full w-full  flex-col  overflow-y-hidden  pr-8">
        <Logo />
        <div className="flex h-full max-h-full w-full flex-col items-stretch justify-stretch   gap-6  ">
          {children}
        </div>
      </div>
    </>
  );
};

export default SidebarChat;

function Logo() {
  return (
    <div className="flex  min-h-[100px] items-center justify-start ">
      <Image
        src="/icon/logo.svg"
        alt="logo"
        width={90}
        height={50}
        className="object-fill"
      />
    </div>
  );
}
