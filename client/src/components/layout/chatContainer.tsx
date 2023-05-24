import Image from "next/image";
import { getSocket } from "@/utils/socket";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { useRouter } from "next/router";
import { TextSender, AlertDialog } from "@/components";
import { useEffect, useState } from "react";

const ChatContainer = () => {
  const router = useRouter();
  const socket = getSocket();
  const [callDialog, setCallDialog] = useState(false);

  const {
    currentChat,
    currentChat: { otherUser },
  } = useAppSelector((state) => ({
    currentChat: state.chats.currentChat,
    chats: state.chats,
  }));

  const currentId = useAppSelector(
    (state) => state.authSession.session.current._id
  );

  function isURL(str: any) {
    try {
      if (str.type === "text") return false;
      new URL(str.content);
      return true;
    } catch (error) {
      return false;
    }
  }

  const handleJoinCall = () => {
    socket!.emit(
      "callUser",
      {
        fromUserID: currentId,
        toUserID: otherUser._id,
      },
      (data: any) => {
        router.push(`/call/${data}?owner=true`);
      }
    );
  };

  console.log("currentChat", currentChat.messages);

  return (
    <>
      <AlertDialog
        question={`¿Quieres llamar a ${
          otherUser.firstName + " " + otherUser.lastName
        }?`}
        trueAction={handleJoinCall}
        falseAction={() => setCallDialog(false)}
        isOpen={callDialog}
      />
      <div className="flex h-full max-h-[100%] w-full grid-cols-1 flex-col items-start  align-middle">
        <header
          id="chatHeader"
          className="flex min-h-[100px] w-full items-center justify-between bg-white"
        >
          {currentChat.id && (
            <>
              <div className="flex w-full items-center justify-start gap-2   ">
                <Image
                  src={currentChat.otherUser.image}
                  alt="logo"
                  width={65}
                  height={65}
                  className="aspect-square rounded-full border border-violet-800 object-cover p-1"
                />
                <div className="relative flex w-full flex-col gap-0">
                  <p className="text-base font-medium">
                    {currentChat.otherUser.firstName +
                      " " +
                      currentChat.otherUser.lastName}
                  </p>
                  <p className="text-sm font-light text-violet-800">
                    {currentChat.chatUserStatus ? "Conectado" : "Desconectado"}
                  </p>
                </div>
              </div>
              <div className="flex min-w-max  gap-3 ">
                <Image
                  src="/icon/phone.svg"
                  alt="logo"
                  width={24}
                  height={24}
                  className="aspect-square cursor-pointer"
                  onClick={() => setCallDialog(true)}
                />
                <Image
                  src="/icon/camera.svg"
                  alt="logo"
                  width={24}
                  height={24}
                  className="aspect-square cursor-pointer"
                  onClick={() => setCallDialog(true)}
                />
              </div>
            </>
          )}
        </header>
        <div className="flex h-full w-full flex-col justify-end overflow-hidden rounded-[20px] bg-violet-50">
          {currentChat.id && (
            <>
              <div
                id="chatBox"
                className="flex w-full flex-col overflow-scroll "
              >
                {currentChat.messages &&
                  currentChat.messages.map((message: any, index: any) => {
                    const isOwned = message.origin === true;
                    const isOwnedClass = isOwned
                      ? "flex-row-reverse justify-start"
                      : "flex-row  justify-start";
                    return (
                      <div
                        key={index}
                        className="flex w-full flex-col gap-1 px-6 py-3 "
                      >
                        <div
                          className={`flex  ${isOwnedClass} h-max w-full items-center gap-2 `}
                        >
                          <Image
                            src={message.sender.image}
                            alt="perfil"
                            width={55}
                            height={55}
                            className="aspect-square rounded-full bg-white object-cover p-[2px]"
                          />
                          {isURL(message) ? (
                            <Image
                              src={message.content}
                              alt="imagen"
                              width={250}
                              height={250}
                              className="aspect-square rounded-[30px] bg-white object-cover p-2"
                            />
                          ) : (
                            <p className="max-w-[75%] rounded-3xl bg-white p-4 text-sm font-normal text-violet-800 ">
                              {message.content}
                            </p>
                          )}
                        </div>
                        <div
                          className={`flex  ${isOwnedClass} h-max w-full items-center px-[70px] `}
                        >
                          <p className="text-xs text-violet-400">
                            {message.time}
                          </p>
                        </div>
                      </div>
                    );
                  })}
              </div>
              <TextSender />
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default ChatContainer;
