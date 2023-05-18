import React, { useState, useEffect, useRef } from "react";
import { getSocket, initSocket } from "../utils/socket";

interface IMsg {
  user: string;
  msg: string;
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

  const sendMessage = async () => {
    if (msg) {
      const message: IMsg = {
        user,
        msg,
      };
      const socket = getSocket();
      socket.emit("message", message);
      setCurrentUser(user);
      setChat((prevChat) => [...prevChat, message]);
      setMsg("");
    }
  };

  return (
    <div className="flex h-screen w-full flex-col">
      <div className="sticky top-0  bg-blue-500 py-4 text-white">
        <h1 className="text-center text-2xl font-semibold">
          Realtime Chat App
        </h1>
        <h2 className="mt-2 text-center">in Next.js and Socket.io</h2>
      </div>
      <div className="flex flex-1 flex-col bg-gray-200">
        <div className="flex-1 p-4 font-mono">
          {chat.length ? (
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
                placeholder={connected ? "Type a message..." : "Connecting..."}
                className="h-full w-full rounded border border-gray-400 px-2 text-black shadow"
                disabled={!connected}
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
  );
};

export default Index;
