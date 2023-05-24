import { useAppSelector } from "@/redux/hooks";
import { getSocket } from "@/utils/socket";
import { useEffect, useRef, useState, useMemo, use } from "react";
import { useRouter } from "next/router";

export default function SidebarInnerChatArea() {
  const router = useRouter();
  const socket = getSocket();
  const [messages, setMessages] = useState<any[]>([]);
  const { slug: callId } = router.query;
  const currentUser = useAppSelector(
    (state) => state.authSession.session.current
  );

  useEffect(() => {
    const listenSocket = async () => {
      console.log("sendMessage", socket);
      socket?.on("newTempMessage", (message: any) => {
        console.log("newTempMessage", message);
        setMessages((prev) => [...prev, message]);
      });
    };

    if (socket && socket.connected && socket !== null) {
      listenSocket();
    }
    console.log("useEffect", socket);
    return () => {
      socket?.off("newTempMessage");
    };
  }, [socket]);

  const sendMessage = (e: any) => {
    e.preventDefault();
    if (socket) {
      console.log("sendMessage", socket);
      socket?.emit("tempMessage", {
        callID: callId,
        message: e.target.msj.value,
        user: currentUser._id,
      });
    }
  };

  return (
    <>
      <Chat sendMessage={sendMessage} messages={messages} />
    </>
  );
}

type PropsChat = {
  sendMessage: any;
  messages: any;
};

function Chat({ sendMessage, messages }: PropsChat) {
  return (
    <div className="relative grid h-full min-w-full grid-rows-[auto,max-content] overflow-y-hidden ">
      <div className="relative h-full min-w-full overflow-y-scroll ">
        <div className="absolute bottom-0 left-0 top-0 flex w-full flex-col gap-4 overflow-y-scroll">
          {messages.map((message: any) => (
            <div>
              <p>{message.message}</p>
              <p>{message.user}</p>
            </div>
          ))}
        </div>
      </div>
      <form
        onSubmit={sendMessage}
        className="flex h-max flex-col bg-red-300 px-4 py-4"
      >
        <input type="text" name="msj" />
        <button type="submit">Enviar</button>
      </form>
    </div>
  );
}
