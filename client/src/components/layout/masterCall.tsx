import React, { ReactNode, useState, useEffect, useRef } from "react";
import {
  SidebarChat,
  ChatContainer,
  SidebarInnerCallArea,
  CircularLoader,
} from "@/components";
import Image from "next/image";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  resetChatId,
  getChats,
  chatUserStatus,
  setCurrentChat,
} from "@/redux/slices/chats";
import { getSocket } from "@/utils/socket";
import { useRouter } from "next/router";

type Props = {
  children: ReactNode;
};

const MasterCallLayout = () => {
  const router = useRouter();
  const { slug: callId, owner } = router.query;
  const calledUser = useAppSelector(
    (state) => state.chats.currentChat.otherUser
  );
  const dispatch = useAppDispatch();
  const socket = getSocket();
  const [messages, setMessages] = useState<any[]>([]);
  const [connected, setConnected] = useState<boolean>(false);
  const [Peer, setPeer] = useState<any>(null);
  const [ownedStream, setStream] = useState<any>(null); //MediaStream
  const [otherStream, setOtherStream] = useState<any>(null); //MediaStream
  const [myPeerId, setMyPeerId] = useState<string>("");
  const [otherPeerId, setOtherPeerId] = useState<string>("");

  const localVideoRef = useRef<any>(null);
  const remoteVideoRef = useRef<any>(null);

  const getMedia1 = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      return stream;
    } catch (err) {
      console.error("error local media", err);
    }
  };

  //Inicializar app
  useEffect(() => {
    if (owner === "true" && socket) {
      socket!.on("receivePeerId", (data) => {
        console.log("1. UserX: Recibe peerId", data.peerId);
        setOtherPeerId(data.peerId);
      });
    }
    return () => {
      socket!.off("receivePeerId");
    };
  }, [socket]);

  //Conectar a socket y aceptar llamada
  useEffect(() => {
    const listenSocket = async () => {
      socket?.emit(
        "acceptCall",
        {
          callID: callId,
        },
        (data: any) => {
          console.log("callback", data);
        }
      );

      return () => {
        socket?.off("acceptCall");
      };
    };

    if (socket && socket.connected) {
      listenSocket();
    }
  }, [socket, callId]);

  //1. Conectar a peerjs
  useEffect(() => {
    const connectToPeer = async () => {
      import("peerjs").then(({ default: Peer }) => {
        const peer = new Peer({
          host: "localhost",
          port: 3002,
          path: "/peerjs/myapp",
        });

        peer.on("open", async (id) => {
          setMyPeerId(id);
          setPeer(peer);
          if (owner === "false") {
            console.log("UserY: Envia peerId", id);
            socket!.emit("sendPeerId", {
              callId,
              peerId: id,
            });
          }
        });

        peer.on("error", (error) => {
          console.error(error);
        });

        peer.on("connection", (conn) => {
          conn.on("data", (data) => {
            console.log("received", data);
          });
          conn.on("open", () => {
            conn.send("hello!");
          });
        });
      });
    };

    connectToPeer();
  }, []);

  //2. El que solicita la llamada, espera a que lo llamen
  useEffect(() => {
    if (Peer && owner === "false") {
      const awaitCall = async () => {
        console.log("3. UserY: Espera llamada");
        const ownedStream1 = await getMedia1();
        console.log("4. UserY: Obtiene medios locales", ownedStream1);
        Peer.on("call", async (call: any) => {
          console.log("5. UserY: Recibe llamada", call);
          call.answer(ownedStream1);
          call.on("stream", (remoteStream: any) => {
            console.log("6. UserY: Recibe stream", remoteStream);
            setMedia({ remoteStream: remoteStream, localStream: ownedStream1 });
          });
        });
      };
      awaitCall();
    }

    return () => {
      Peer?.off("call");
    };
  }, [Peer]);

  //3. Al que le solicitan la llamada, llama
  useEffect(() => {
    if (Peer) {
      const makeCall = async () => {
        let conn = Peer.connect(otherPeerId);
        conn.on("data", (data: any) => {
          setConnected(true);
        });
        conn.on("open", () => {
          conn.send("hi!");
        });
        const ownedStream1 = await getMedia1();
        console.log("2. UserX: Obtiene medios locales", ownedStream1);
        let call = Peer.call(otherPeerId, ownedStream1);
        console.log("3. UserX: Llama a UserY", call);
        call.on("stream", (remoteStream: any) => {
          setMedia({ remoteStream: remoteStream, localStream: ownedStream1 });
        });
      };

      if (owner === "true" && otherPeerId !== "") {
        makeCall();
      }
      console.log("Owned false", owner, otherPeerId);
    }
  }, [Peer, otherPeerId]);

  const setMedia = async (data: any) => {
    try {
      console.log("UserX y UserY: Setea medios", data);
      localVideoRef.current.srcObject = data.localStream;
      remoteVideoRef.current.srcObject = data.remoteStream;
    } catch (err) {
      console.error("error local media", err);
    }
  };

  //Si no atienden la llamada, redirigir al inicio
  // useEffect(() => {
  //   if (!connected && owner === "true") {
  //     const timeout = setTimeout(() => {
  //       router.push("/"); // Redirigir al inicio
  //     }, 50000); // 50 segundos

  //     return () => clearTimeout(timeout); // Limpiar el temporizador si el componente se desmonta antes de que expire
  //   } else {
  //     //   localVideoRef.current.srcObject = ownedStream;
  //     // remoteVideoRef.current.srcObject = otherStream;
  //   }
  // }, [connected, router, ownedStream, otherStream]);

  // if (!connected && owner === "true")
  //   return (
  //     <>
  //       <div className="flex h-screen w-full items-center justify-center gap-4">
  //         <CircularLoader />
  //         <div className="flex flex-col">
  //           <p className="font-medium text-violet-800">
  //             Llamando a {calledUser?.firstName + " " + calledUser?.lastName}
  //           </p>
  //           <p className="text-sm text-gray-500">
  //             Si no atiende, seras redirigido al inicio
  //           </p>
  //         </div>
  //       </div>
  //     </>
  //   );

  return (
    <>
      <main className="max-h-screen min-h-screen  overflow-hidden">
        <section className="relative h-screen w-screen pl-8 ">
          <div className="relative h-full ">
            <div className="absolute bottom-0 right-0 top-0 grid h-full  w-full grid-cols-[350px,auto] overflow-hidden ">
              <div className="h-full max-h-screen overflow-y-auto">
                <SidebarChat>
                  <SidebarInnerCallArea />
                </SidebarChat>
              </div>

              {/* <div className="flex h-full w-full flex-shrink-0 flex-grow flex-col overflow-y-hidden bg-violet-50 px-10 pb-[60px] pt-[40px]"> */}
              <div className="grid-auto-rows:auto grid grid-rows-[1fr,max-content] overflow-y-hidden bg-violet-50 px-10 pb-[30px] pt-[40px]">
                <CallContainer
                  localVideoRef={localVideoRef}
                  remoteVideoRef={remoteVideoRef}
                />
                <div className="h-max">
                  <CallControl
                    localVideoRef={localVideoRef}
                    remoteVideoRef={remoteVideoRef}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

function CallContainer({ localVideoRef, remoteVideoRef }: any) {
  return (
    <div
      id="camerasBox"
      className="relative flex  h-auto max-h-full min-h-0 w-auto   "
    >
      <video
        id="remote-video"
        ref={remoteVideoRef}
        autoPlay
        playsInline
        className="h-auto max-h-full min-h-0 w-full max-w-full rounded-[20px] bg-gray-300 object-cover"
      ></video>
      <div
        id="camera2"
        className="absolute bottom-3 right-3 z-30 flex aspect-[3/2] flex-col rounded-[20px] bg-white p-1 "
      >
        <video
          id="local-video"
          ref={localVideoRef}
          autoPlay
          playsInline
          className="h-[150px] min-h-[100px] w-auto rounded-[20px] bg-gray-400  "
        ></video>
      </div>
    </div>
  );
}

function CallControl({ localVideoRef, remoteVideoRef }: any) {
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isCameraOn, setIsCameraOn] = useState<boolean>(false);

  useEffect(() => {
    if (localVideoRef?.current.srcObject) {
      localVideoRef.current.srcObject.getAudioTracks()[0].enabled = isMuted;
    }
  }, [isMuted]);

  useEffect(() => {
    if (localVideoRef.current.srcObject) {
      localVideoRef.current.srcObject.getVideoTracks()[0].enabled = isCameraOn;
    }
  }, [isCameraOn]);

  return (
    <div className="flex w-full items-center justify-center">
      <div className="flex w-max items-center justify-center py-6">
        <div className="flex gap-2">
          <Image
            src={
              isCameraOn ? "/icon/call/cam-on.svg" : "/icon/call/cam-off.svg"
            }
            alt="logo"
            width={60}
            height={60}
            className="aspect-square cursor-pointer"
            onClick={() => setIsCameraOn(!isCameraOn)}
          />
          <Image
            src={isMuted ? "/icon/call/mic-off.svg" : "/icon/call/mic-on.svg"}
            alt="logo"
            width={60}
            height={60}
            className="aspect-square cursor-pointer"
            onClick={() => setIsMuted(!isMuted)}
          />
        </div>
        <div></div>
      </div>
    </div>
  );
}

export default MasterCallLayout;
