import React, { ReactNode, useState, useEffect, useRef } from "react";
import {
  SidebarChat,
  SidebarInnerCallArea,
  CircularLoader,
} from "@/components";
import Image from "next/image";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { getSocket } from "@/utils/socket";
import { useRouter } from "next/router";
import { set } from "lodash";

type Props = {
  children: ReactNode;
};

const MasterCallLayout = () => {
  const router = useRouter();
  const { slug: callId, owner } = router.query;
  const calledUser = useAppSelector(
    (state) => state.chats.currentChat.otherUser
  );
  const socket = getSocket();
  const [messages, setMessages] = useState<any[]>([]);
  const [connected, setConnected] = useState<boolean>(false);
  const [Peer, setPeer] = useState<any>(null);
  const [ownedStream, setStream] = useState<any>(null); //MediaStream
  const [otherStream, setOtherStream] = useState<any>(null); //MediaStream
  const [myPeerId, setMyPeerId] = useState<string>("");
  const [otherPeerId, setOtherPeerId] = useState<string>("");
  const [lastHeartbeatTime, setLastHeartbeatTime] = useState<Date | null>(null);
  const [reconnecting, setReconnecting] = useState<boolean>(false);
  const [droppedCall, setDroppedCall] = useState<boolean>(false);
  const localVideoRef = useRef<any>(null);
  const remoteVideoRef = useRef<any>(null);

  const getMedia1 = async () => {
    try {
      const stream = await navigator?.mediaDevices?.getUserMedia({
        audio: true,
        video: true,
      });
      return stream;
    } catch (err) {
      console.error("error local media", err);
    }
  };

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
            if (data === "heartbeat") {
              setLastHeartbeatTime(new Date());
            }
          });
          conn.on("open", () => {
            conn.send("hello!");
            //hacemos un inteervalo heartbeat
            setInterval(() => {
              conn.send("heartbeat");
            }, 1000);
          });
        });
      });
    };

    connectToPeer();
  }, []);

  useEffect(() => {
    if (Peer && owner === "false") {
      const awaitCall = async () => {
        const ownedStream1 = await getMedia1();
        Peer.on("call", async (call: any) => {
          call.answer(ownedStream1);
          call.on("stream", (remoteStream: any) => {
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

  useEffect(() => {
    if (Peer) {
      const makeCall = async () => {
        let conn = Peer.connect(otherPeerId);
        conn.on("data", (data: any) => {
          if (data === "heartbeat") {
            const now = new Date();
            setLastHeartbeatTime(now);
          }
        });
        conn.on("open", () => {
          conn.send("hi!");
          setInterval(() => {
            conn.send("heartbeat");
          }, 1000);
        });
        const ownedStream1 = await getMedia1();
        let call = Peer!.call(otherPeerId, ownedStream1);
        call!.on("stream", (remoteStream: any) => {
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
      setConnected(true);
      localVideoRef.current.srcObject = data.localStream;
      remoteVideoRef.current.srcObject = data.remoteStream;
    } catch (err) {
      console.error("error local media", err);
    }
  };

  useEffect(() => {
    if (!connected) {
      const timeout = setTimeout(() => {
        router.push("/"); // Redirigir al inicio
      }, 60000); // 50 segundos

      return () => clearTimeout(timeout);
    }
  }, [connected, router, ownedStream, otherStream]);

  useEffect(() => {
    const checkConnectionLost = () => {
      if (lastHeartbeatTime) {
        const currentTime = new Date();
        const elapsed = currentTime.getTime() - lastHeartbeatTime.getTime();
        const heartbeatTimeout = 5000; // Tiempo máximo sin recibir latidos en milisegundos (por ejemplo, 5 segundos)
        console.log("elapsed", elapsed);
        if (elapsed > heartbeatTimeout && elapsed < 50000) {
          console.log("Connection lost");
          setReconnecting(true);
        } else if (elapsed > 50000) {
          console.log("Connection dropped");
          setDroppedCall(true);
          setReconnecting(false);
        } else {
          console.log("Connection OK");
          setReconnecting(false);
        }
      }
    };

    const interval = setInterval(checkConnectionLost, 1000); // Verificar cada segundo

    console.log("lastHeartbeatTime", lastHeartbeatTime);

    return () => clearInterval(interval);
  }, [lastHeartbeatTime]);

  useEffect(() => {
    if (droppedCall === true) {
      setTimeout(() => {
        // router.push("/"); // Redirigir al inicio
      }, 10000); // 50 segundos
    }
  }, [droppedCall, router]);

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
        {!connected && (
          <div className="fixed left-0 top-0 z-50 flex h-screen w-screen items-center justify-center gap-4 bg-white">
            <CircularLoader />
            <div className="flex flex-col">
              <p className="font-medium text-violet-800">
                {owner === "true"
                  ? ` Llamando a ${
                      calledUser?.firstName + " " + calledUser?.lastName
                    }`
                  : "Conectando"}
              </p>
              <p className="text-sm text-gray-500">
                {owner === "true"
                  ? "Si no atiende, seras redirigido al inicio"
                  : "Solo unos segundos mas..."}
              </p>
            </div>
          </div>
        )}
        {reconnecting && (
          <div className="fixed left-0 top-0 z-50 flex h-screen w-screen items-center justify-center gap-4 bg-white">
            <CircularLoader />
            <div className="flex flex-col">
              <p className="font-medium text-violet-800">Reconectando</p>
              <p className="text-sm text-gray-500">Se perdio la conexion...</p>
            </div>
          </div>
        )}
        {droppedCall && (
          <div className="fixed left-0 top-0 z-50 flex h-screen w-screen items-center justify-center gap-4 bg-white">
            <div className="flex flex-col">
              <p className="font-medium text-violet-800">
                No fue posible establecer la llamada
              </p>
              <p className="text-sm text-gray-500">
                Seras redirigido al inicio
              </p>
            </div>
          </div>
        )}
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
        <div>
          <button className="rounded-full bg-red-800 px-4 py-2 text-white">
            Finalizar
          </button>
        </div>
      </div>
    </div>
  );
}

export default MasterCallLayout;
