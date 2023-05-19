import React, { useState, useEffect, useRef } from "react";
import { getSocket, initSocket } from "../utils/socket";
import { MasterLayout } from "@/components";

interface IMsg {
  user: string;
  msg: string;
  chatId: string;
}

const Index = () => {
  const [connected, setConnected] = useState<boolean>(false);
  const [chat, setChat] = useState<IMsg[]>([]);
  const [msg, setMsg] = useState<string>("");
  const [currentUser, setCurrentUser] = useState<string>("");
  const user = "User_" + String(new Date().getTime()).substr(-3);

  useEffect(() => {
    const connectSocket = async () => {
      try {
        await initSocket();
        setConnected(true);
      } catch (error) {
        console.error("Error al conectar el socket:", error);
      }
    };
    connectSocket();
  }, []);

  useEffect(() => {
    const socket = getSocket();

    const receiveMessage = (message: any) => {
      console.log("message", message);
      setChat((prevChat) => [...prevChat, message.message]);
    };

    socket.on("message", receiveMessage);

    return () => {
      socket.off("message");
    };
  }, []);

  // const sendMessage = async () => {
  //   if (msg) {
  //     const message: IMsg = {
  //       user,
  //       msg,
  //     };
  //     const socket = getSocket();
  //     socket.emit("message", message);
  //     setCurrentUser(user);
  //     setChat((prevChat) => [...prevChat, message]);
  //     setMsg("");
  //   }
  // };

  const [chatId, setChatId] = useState<string>("");

  const setSala = (e: any) => {
    e.preventDefault();
    const socket = getSocket();
    setChatId(e.target.sala.value);
    setCurrentUser(e.target.currentUser.value);
    socket.emit("selectChat", {
      chatId: e.target.sala.value,
    });
  };

  const sendMessage = async () => {
    if (msg) {
      const message: IMsg = {
        user: currentUser,
        msg,
        chatId,
      };
      const socket = getSocket();
      socket.emit("message", message);

      setChat((prevChat) => [...prevChat, message]);
      setMsg("");
    }
  };

  return (
    <MasterLayout>
      <div className="flex h-screen w-full flex-col">
        <div className="flex flex-1 flex-col bg-gray-200">
          <div className="flex-1 p-4 font-mono">
            {chatId === "" || chat.length || !chatId ? (
              chat.map((chat, i) => (
                <div key={"msg_" + i} className="mt-1">
                  <span className="text-black">
                    {chat.user === currentUser ? "You" : chat.user}
                  </span>
                  : <span className="text-black">{chat.msg}</span>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-sm text-gray-400">
                No chat messages
              </div>
            )}
          </div>
          <div className="sticky bottom-0 h-20 bg-gray-400 p-4">
            <div className="flex h-full flex-1 flex-row divide-x divide-gray-200">
              <div className="flex-1 pr-2">
                <input
                  type="text"
                  value={msg}
                  placeholder={
                    connected ? "Type a message..." : "Connecting..."
                  }
                  className="h-full w-full rounded border border-gray-400 px-2 text-black shadow"
                  disabled={!connected || !chatId || chatId === ""}
                  onChange={(e) => {
                    setMsg(e.target.value);
                  }}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      sendMessage();
                    }
                  }}
                />
              </div>
              <div className="flex flex-col items-stretch justify-center pl-2">
                <button
                  className="h-full rounded bg-blue-500 px-2 text-sm text-white shadow"
                  onClick={sendMessage}
                  disabled={!connected}
                >
                  SEND
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MasterLayout>
  );
};

export default Index;
