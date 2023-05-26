import React, { useState, useEffect, useRef } from "react";
import {
  SidebarChat,
  SidebarInnerCallArea,
  CircularLoader,
} from "@/components";
import Image from "next/image";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { getSocket } from "@/utils/socket";
import { useRouter } from "next/router";
import {
  setCallAccepted,
  setMyPeerId,
  setOtherPeerId,
  setRoomId,
  setFirstConnection,
  reset,
} from "@/redux/slices/call";

const peerServer:any = process.env.NEXT_PUBLIC_PEER_URL;
const peerPort:any = process.env.NEXT_PUBLIC_PEER_PORT;

const MasterCallLayout = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { slug: callId, owner } = router.query;
  const calledUser = useAppSelector(
    (state) => state.chats.currentChat.otherUser
  );

  const {
    callAccepted,
    callEnded,
    roomId,
    myPeerId,
    otherPeerId,
    droppedCall,
    firstConnection: connected,
  } = useAppSelector((state) => state.call);

  const currentUserId = useAppSelector(
    (state) => state.authSession.session.current._id
  );

  const socket = getSocket();
  const [Peer, setPeer] = useState<any>(null);
  const [lastHeartbeatTime, setLastHeartbeatTime] = useState<Date | null>(null);
  const [reconnecting, setReconnecting] = useState<boolean>(false);
  const [dataConnection, setDataConnection] = useState<any>(null);
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

      socket!.on("receivePeerId", (data) => {
        if (data.otherUserId !== currentUserId) {
          console.log("UserXY: Recibe peerId", data.peerId);
          dispatch(setOtherPeerId(data.peerId));
          if (connected && otherPeerId !== data.peerId) {
            console.log("UserXY: Reconnect");
            reconnectCall({
              peer: Peer,
              peerId: data.peerId,
            });
          }
        }
      });

      socket!.on("callEnded", () => {
        console.log("callEnded");
       // otherDisconnectCall();
      });
    };

    if (socket?.connected) {
      listenSocket();
    }

    return () => {
      socket?.off("acceptCall");
      socket?.off("receivePeerId");
      socket?.off("callEnded");
    };
  }, [socket, callId, owner]);

  //Conectamos con el servidor de PeerJS
  useEffect(() => {
    const connectToPeer = async () => {
      import("peerjs").then(({ default: Peer }) => {
        const peer = new Peer({
          host: peerServer,
          port: peerPort,
          path: "/peerjs/myapp",
        });
        setPeer(peer);
        peer.on("open", async (id) => {
          const myId = id;
          dispatch(setMyPeerId(myId));
          setPeer(peer);
          console.log("UserXY: Envia peerId", id);
          socket!.emit("sendPeerId", {
            callId,
            peerId: id,
            currentUserId: currentUserId,
          });
        });

        peer.on("error", (error) => {
          // console.error("Error PeerJS:", error);
          //  reconnectCall(peer);
        });

        peer.on("connection", (conn) => {
          handleDataConnection(conn);
          console.log("UserXY: Conectado", conn);
        });
      });
    };

    connectToPeer();
  }, []);

  //Si no atienden la llamada
  useEffect(() => {
    if (!connected) {
      const timeout = setTimeout(() => {
        router.push("/chat");
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
        router.push("/chat");
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
      makeCall({
        peer: Peer,
      });
    } else if (Peer && otherPeerId !== "" && connected) {
      makeCall({
        peer: Peer,
      });
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
      dispatch(setFirstConnection(true));
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

  const makeCall = async ({ peer }: any) => {
    try {
      let conn = peer.connect(otherPeerId);
      handleDataConnection(conn);
      const ownedStream1 = await getMedia();
      let call = peer!.call(otherPeerId, ownedStream1);
      call!.on("stream", (remoteStream: any) => {
        setMedia({ remoteStream: remoteStream, localStream: ownedStream1 });
      });
    } catch (err) {
      console.error("error makecall", err);
    }
  };

  const checkConnectionLost = () => {
    if (lastHeartbeatTime) {
      const currentTime = new Date();
      const elapsed = currentTime.getTime() - lastHeartbeatTime.getTime();
      const heartbeatTimeout = 5000; // Tiempo máximo sin recibir latidos en milisegundos (por ejemplo, 5 segundos)

      if (elapsed > heartbeatTimeout && elapsed < 50000) {
        setReconnecting(true);
      } else if (elapsed > 50000) {
        disconnectCall();
        setReconnecting(false);
      } else {
        setReconnecting(false);
      }
    }
  };

  const reconnectCall = async (data: any) => {
    try {
      const { peer, peerId } = data;
      console.log("Reconectando llamada con", peerId, peer);
      const ownedStream1 = await getMedia();
      let call = peer!.call(peerId, ownedStream1);
      call!.on("stream", (remoteStream: any) => {
        setMedia({ remoteStream: remoteStream, localStream: ownedStream1 });
      });
    } catch (err) {
      console.error("error Reconectando", err);
    }
  };

  const disconnectCall = async () => {
    // console.log("Desconectando llamada xxx", dataConnection);
    // if (dataConnection) {
    //   socket!.emit("endCall", { callId: router.query.slug });
    //   console.log("Desconectando llamada");
    //   dataConnection!.close();

    //   await dispatch(reset());
    //   router.push("/chat");
    // }
  };

  // const otherDisconnectCall = async () => {
  //   console.log("Desconectando llamada1", Peer);
  //   if (dataConnection) {
  //     console.log("Desconectando llamada2");
  //     dataConnection!.close();
  //     await dispatch(reset());
  //     router.push("/chat");
  //   }
  // };

  //--------------------------------------------------------------------------------

  return (
    <>
      <main className="max-h-screen min-h-screen  overflow-hidden">
        <section className="relative h-screen w-screen pl-8 ">
          <div className="relative h-full ">
            <div className="absolute bottom-0 right-0 top-0 grid h-full  w-full grid-cols-[350px,auto] overflow-hidden ">
              <div className="h-full max-h-screen overflow-y-auto">
                my peer id: {myPeerId}
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
                    disconnectCall={disconnectCall}
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

function CallControl({ localVideoRef, remoteVideoRef, disconnectCall }: any) {
  const socket = getSocket();
  const dispatch = useAppDispatch();
  const router = useRouter();
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

  const endCall = async () => {
    disconnectCall();
  };

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
          <button
            className="rounded-full bg-red-800 px-4 py-2 text-white"
            onClick={endCall}
          >
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
