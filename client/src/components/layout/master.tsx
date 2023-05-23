import React, { ReactNode, useState, useEffect, useMemo } from "react";
import { SidebarChat, TextSender, ChatContainer } from "@/components";
import Image from "next/image";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store/store";
import {
  resetChatId,
  newChat,
  getChats,
  chatUserStatus,
} from "@/redux/slices/chats";
import { useAppDispatch } from "@/redux/hooks";
import axios from "axios";
import { getSocket, initSocket } from "@/utils/socket";
import { debounce } from "lodash";
import { useRouter } from "next/router";

type Props = {
  children: ReactNode;
};

const MasterLayout: React.FC<Props> = ({ children }) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const socket = getSocket();
  const chatId = useSelector((state: RootState) => state.chats.currentChat.id);
  const session = useSelector(
    (state: RootState) => state?.authSession.session.current
  );

  useEffect(() => {
    if (socket) {
      console.log("new chat escuchando");
      socket.on("newChat", () => {
        console.log("newChat entro");
        dispatch(getChats());
      });
      console.log("otherUserStatus escuchando");
      socket.on("otherUserStatus", (data: any) => {
        dispatch(chatUserStatus(data));
      });

      socket.on("comingCall", (data: any) => {
        console.log("comingCall", data);
        //hacemos un alert preguntando si quiere aceptar la llamada
        const acceptCall = confirm(`¿Quieres aceptar la llamada?`);
        if (acceptCall) {
          socket.emit(
            "acceptCall",
            {
              callID: data.callID,
            },
            (data: any) => {
              console.log("callback", data);
            }
          );
          router.push(`/call/${data.callID}?owner=false`);
        }
      });
      return () => {
        socket.off("newChat");
        socket.off("otherUserStatus");
      };
    }
  }, [socket]);

  useEffect(() => {
    dispatch(resetChatId());
  }, []);

  return (
    <>
      <main className="max-h-screen min-h-screen  overflow-hidden">
        <Header session={session} />
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

const Header = (session: any) => {
  console.log("session head", session);
  return (
    <header className="flex h-[80px] items-center justify-center  bg-white ">
      <div className="padding-x-estilo2 flex w-full items-center justify-between px-8 ">
        <Image
          src="/icon/logo.svg"
          alt="logo"
          width={80}
          height={50}
          className="object-fill"
        />
        <div className="flex items-center gap-4">
          <div className="relative">
            <button className="text-sm font-semibold text-violet-800">
              Nuevo chat
            </button>
            <SearchUser />
          </div>
          <div className="flex items-center justify-center gap-2 rounded-full bg-violet-200  p-1 pr-4">
            <Image
              src={session.session.profilePicture}
              alt="logo"
              width={40}
              height={40}
              className=" aspect-square rounded-full bg-white object-cover p-[2px] "
            />
            <p className="text-sm font-medium text-violet-800">
              {session.session.email}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

const SearchUser = () => {
  const [users, setUsers] = useState([]);
  const dispatch = useAppDispatch();
  const searchUser = async (e: any) => {
    try {
      const usersGetted = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URL}api/user/?email=${e.target.value}`
      );
      console.log("usersGetted", usersGetted.data);
      setUsers(usersGetted.data);
      console.log("users", users);
    } catch (error) {
      console.log(error);
    }
  };

  const createChat = async (id: string) => {
    console.log("id user", id);
    dispatch(newChat(id));
  };

  return (
    <>
      <div className="absolute left-1/2 top-6 z-10 w-max max-w-[300px] -translate-x-1/2 transform rounded-3xl bg-white p-5 shadow-xl">
        <div>
          <input
            type="text"
            onChange={searchUser}
            className="mb-3 w-full  min-w-[0] rounded-full border border-violet-200 px-3 py-2 text-sm text-violet-800 placeholder:text-violet-800 "
            placeholder="Buscar usuario"
          />
        </div>
        <div className="flex flex-col gap-2">
          {users.map((user: any) => (
            <div
              className="flex cursor-pointer items-center gap-2 rounded-full bg-violet-200  p-1 pr-4"
              onClick={() => createChat(user._id)}
            >
              <Image
                src={user.image || "/image/p4.jpg"}
                alt="logo"
                width={40}
                height={40}
                className=" aspect-square rounded-full bg-white object-cover p-[2px] "
              />
              <p className="text-sm font-normal text-violet-800">
                {user.email}
              </p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default MasterLayout;
