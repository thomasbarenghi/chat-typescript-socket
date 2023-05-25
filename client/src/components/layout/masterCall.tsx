import React, { useState, useEffect, useRef } from "react";
import {
  SidebarChat,
  SidebarInnerCallArea,
  CircularLoader,
} from "@/components";
import Image from "next/image";
import { useAppSelector } from "@/redux/hooks";
import { getSocket } from "@/utils/socket";
import { useRouter } from "next/router";

const MasterCallLayout = () => {
  const router = useRouter();
  const { slug: callId, owner } = router.query;
  const calledUser = useAppSelector(
    (state) => state.chats.currentChat.otherUser
  );
  const socket = getSocket();
  const [connected, setConnected] = useState<boolean>(false);
  const [Peer, setPeer] = useState<any>(null);
  const [myPeerId, setMyPeerId] = useState<string>("");
  const [otherPeerId, setOtherPeerId] = useState<string>("");
  const [lastHeartbeatTime, setLastHeartbeatTime] = useState<Date | null>(null);
  const [reconnecting, setReconnecting] = useState<boolean>(false);
  const [droppedCall, setDroppedCall] = useState<boolean>(false);
  const localVideoRef = useRef<any>(null);
  const remoteVideoRef = useRef<any>(null);

  //--------------------------------------------------------------------------------
  //Hooks

  //Escuchamos si el usuario acepta la llamada y enviamos el peerId
  useEffect(() => {
    const listenSocket = async () => {
      socket?.emit("acceptCall", {
        callID: callId,
      });

      if (owner === "true") {
        socket!.on("receivePeerId", (data) => {
          setOtherPeerId(data.peerId);
        });
      }
    };

    if (socket?.connected) {
      listenSocket();
    }

    return () => {
      socket?.off("acceptCall");
      socket?.off("receivePeerId");
    };
  }, [socket, callId, owner]);

  //Conectamos con el servidor de PeerJS
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
          console.error("Error PeerJS:", error);
        });

        peer.on("connection", (conn) => {
          handleDataConnection(conn);
        });
      });
    };

    connectToPeer();
  }, []);

  //Si no atienden la llamada
  useEffect(() => {
    if (!connected) {
      const timeout = setTimeout(() => {
        router.push("/");
      }, 50000);
      return () => clearTimeout(timeout);
    }
  }, [connected, router]);

  //Si se interrumpe la llamada
  useEffect(() => {
    const interval = setInterval(checkConnectionLost, 1000); // Verificar cada segundo
    return () => clearInterval(interval);
  }, [lastHeartbeatTime]);

  //Si se cae la llamada
  useEffect(() => {
    if (droppedCall === true) {
      setTimeout(() => {
        // router.push("/");
      }, 10000);
    }
  }, [droppedCall, router]);

  //Esperamos una llamada
  useEffect(() => {
    if (Peer && owner === "false") {
      const awaitCall = async () => {
        const ownedStream1 = await getMedia();
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

  //Hacemos una llamada
  useEffect(() => {
    if (Peer && owner === "true" && otherPeerId !== "") {
      makeCall();
    }
  }, [Peer, otherPeerId]);

  //--------------------------------------------------------------------------------
  //Funciones modulares
  const getMedia = async () => {
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

  const setMedia = async (data: any) => {
    try {
      setConnected(true);
      localVideoRef.current.srcObject = data.localStream;
      remoteVideoRef.current.srcObject = data.remoteStream;
    } catch (err) {
      console.error("error local media", err);
    }
  };

  const handleDataConnection = (conn: any) => {
    conn.on("data", (data: any) => {
      if (data === "heartbeat") {
        setLastHeartbeatTime(new Date());
      }
    });
    conn.on("open", () => {
      setInterval(() => {
        conn.send("heartbeat");
      }, 1000);
    });
  };

  const makeCall = async () => {
    let conn = Peer.connect(otherPeerId);
    handleDataConnection(conn);
    const ownedStream1 = await getMedia();
    let call = Peer!.call(otherPeerId, ownedStream1);
    call!.on("stream", (remoteStream: any) => {
      setMedia({ remoteStream: remoteStream, localStream: ownedStream1 });
    });
  };

  const checkConnectionLost = () => {
    if (lastHeartbeatTime) {
      const currentTime = new Date();
      const elapsed = currentTime.getTime() - lastHeartbeatTime.getTime();
      const heartbeatTimeout = 5000; // Tiempo máximo sin recibir latidos en milisegundos (por ejemplo, 5 segundos)

      if (elapsed > heartbeatTimeout && elapsed < 50000) {
        setReconnecting(true);
      } else if (elapsed > 50000) {
        setDroppedCall(true);
        setReconnecting(false);
      } else {
        setReconnecting(false);
      }
    }
  };

  //--------------------------------------------------------------------------------

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
          <DynamicDialog
            title={
              owner === "true"
                ? ` Llamando a ${
                    calledUser?.firstName + " " + calledUser?.lastName
                  }`
                : "Conectando"
            }
            description={
              owner === "true"
                ? "Si no atiende, seras redirigido al inicio"
                : "Solo unos segundos mas..."
            }
          />
        )}
        {reconnecting && (
          <DynamicDialog
            title="Reconectando"
            description="Se perdio la conexion..."
          />
        )}
        {droppedCall && (
          <DynamicDialog
            title="Llamada perdida"
            description="No fue posible establecer la llamada"
            loader={false}
          />
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

  const callControlButtons = [
    {
      icon: isCameraOn ? "/icon/call/cam-on.svg" : "/icon/call/cam-off.svg",
      onClick: () => setIsCameraOn(!isCameraOn),
    },
    {
      icon: isMuted ? "/icon/call/mic-off.svg" : "/icon/call/mic-on.svg",
      onClick: () => setIsMuted(!isMuted),
    },
  ];

  return (
    <div className="flex w-full items-center justify-center">
      <div className="flex w-max items-center justify-center py-6">
        <div className="flex gap-2">
          {callControlButtons.map((button, index) => (
            <DynamicCallControl
              key={index}
              icon={button.icon}
              onClick={button.onClick}
            />
          ))}
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

function DynamicDialog({ title, description, loader = true }: any) {
  return (
    <div className="fixed left-0 top-0 z-50 flex h-screen w-screen items-center justify-center gap-4 bg-white">
      {loader && <CircularLoader />}
      <div className="flex flex-col">
        <p className="font-medium text-violet-800">{title}</p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </div>
  );
}

function DynamicCallControl({ icon, onClick, key }: any) {
  return (
    <Image
      key={key}
      src={icon}
      alt="logo"
      width={60}
      height={60}
      className="aspect-square cursor-pointer"
      onClick={onClick}
    />
  );
}
