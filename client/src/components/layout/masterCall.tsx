import React, { ReactNode, useState, useEffect, useRef } from "react";
import { SidebarChat, ChatContainer, SidebarInnerCallArea } from "@/components";
import Image from "next/image";

import {
  resetChatId,
  getChats,
  chatUserStatus,
  setCurrentChat,
} from "@/redux/slices/chats";
import { useAppDispatch } from "@/redux/hooks";
import { getSocket } from "@/utils/socket";
import { useRouter } from "next/router";

type Props = {
  children: ReactNode;
};

const MasterCallLayout = () => {
  const router = useRouter();
  const { slug: callId, owner } = router.query;
  const dispatch = useAppDispatch();
  const socket = getSocket();
  const [messages, setMessages] = useState<any[]>([]);
  const [connected, setConnected] = useState<boolean>(false);
  const [Peer, setPeer] = useState<any>(null);
  const [myPeerId, setMyPeerId] = useState<string>("");
  const [otherPeerId, setOtherPeerId] = useState<string>("");

  const localVideoRef = useRef<any>(null);
  const remoteVideoRef = useRef<any>(null);

  //Inicializar app
  useEffect(() => {
    const getMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true,
        });

        localVideoRef.current.srcObject = stream;
      } catch (err) {
        console.error("error local media", err);
      }
    };

    if (owner === "true" && socket) {
      socket!.on("receivePeerId", (data) => {
        console.log("receivePeerId", data);
        setOtherPeerId(data.peerId);
      });
    }

    getMedia();

    return () => {
      socket!.off("receivePeerId");
    };
  }, [socket]);

  //Conectar a socket y quedar a la escucha de llamadas
  useEffect(() => {
    const listenSocket = async () => {
      console.log("escuchando", socket, callId);
      socket?.emit(
        "acceptCall",
        {
          callID: callId,
        },
        (data: any) => {
          console.log("callback", data);
          setConnected(true);
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

  //Conectar a peerjs y quedar a la escucha de llamadas
  useEffect(() => {
    const connectToPeer = async () => {
      import("peerjs").then(({ default: Peer }) => {
        const peer = new Peer({
          host: "localhost",
          port: 3002,
          path: "/peerjs/myapp",
        });

        peer.on("open", (id) => {
          console.log("My peer ID is: " + id);
          setMyPeerId(id);
          setPeer(peer);

          if (owner === "false") {
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
          console.log("connection", conn);
          conn.on("data", (data) => {
            console.log("received", data);
          });
          conn.on("open", () => {
            conn.send("hello!");
          });
        });

        peer.on("call", (call) => {
          call.answer(localVideoRef.current.srcObject);
          call.on("stream", (remoteStream) => {
            remoteVideoRef.current.srcObject = remoteStream;
          });
        });
      });
    };
    connectToPeer();
  }, []);

  //Llamar a otro peer
  useEffect(() => {
    if (Peer) {
      const makeCall = async () => {
        let conn = Peer.connect(otherPeerId);
        conn.on("data", (data: any) => {
          console.log("received", data);
        });
        conn.on("open", () => {
          conn.send("hi!");
        });

        let call = Peer.call(otherPeerId, localVideoRef.current.srcObject);
        call.on("stream", (remoteStream: any) => {
          remoteVideoRef.current.srcObject = remoteStream;
        });
      };

      if (owner === "true" && otherPeerId !== "") {
        makeCall();
      }
    }
  }, [Peer, otherPeerId]);

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
