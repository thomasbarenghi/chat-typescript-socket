import { useRouter } from "next/router";
import { useEffect, useRef, useState, useMemo, use } from "react";
import { getSocket } from "@/utils/socket";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { debounce } from "lodash";

const CallRoom = () => {
  const router = useRouter();
  const socket = getSocket();
  const dispatch = useAppDispatch();
  const { slug: callId, owner } = router.query;
  const currentUser = useAppSelector(
    (state) => state.authSession.session.current
  );

  const [peerId, setPeerId] = useState<string>("");
  const [messages, setMessages] = useState<any[]>([]);
  const localVideoRef = useRef<any>(null);
  const remoteVideoRef = useRef<any>(null);

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

      socket?.on("newTempMessage", (message: any) => {
        console.log("newTempMessage", message);
        setMessages((prev) => [...prev, message]);
      });

      return () => {
        socket?.off("acceptCall");
        socket?.off("newTempMessage");
      };
    };

    if (socket && socket.connected && socket !== null) {
      listenSocket();
    }

    console.log("useEffect", socket);
  }, [socket]);

  useEffect(() => {
    console.log("useffect");
    const initCall = async () => {
      console.log("initCall xxx");
      if (socket && process.browser && navigator.mediaDevices) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true,
          });
          localVideoRef.current.srcObject = stream;

          if (owner === "true") {
            console.log("owner");
            import("peerjs").then(({ default: Peer }) => {
              const peer = new Peer({
                host: "127.0.0.1", // El hostname del servidor backend
                port: 9000, // El puerto del servidor backend
                path: "/app", // Ruta al servidor PeerJS en tu backend
              });

              if (peer) {
                console.log("peer ok", peer);
                peer.on("open", (id) => {
                  console.log("My peer ID is: " + id);
                });

                peer.on("connection", (conn) => {
                  conn.on("open", () => {
                    socket.on("receivePeerId", (data) => {
                      var call = peer.call(data.peerId, stream);
                      console.log("call out", peer, peer.id, data.peerId);
                      call?.on("stream", (stream) => {
                        console.log("call stream", stream);
                        remoteVideoRef.current.srcObject = stream;
                      });
                    });
                  });
                });

                return () => {
                  socket.off("receivePeerId");
                };
              }
            });
          } else {
            import("peerjs").then(({ default: Peer }) => {
              const peer = new Peer({
                host: "127.0.0.1", // El hostname del servidor backend
                port: 9000, // El puerto del servidor backend
                path: "/app", // Ruta al servidor PeerJS en tu backend
              });

              console.log("peer out", peer);

              peer.on("open", (id) => {
                console.log("sendPeerId", id);

                socket.emit("sendPeerId", {
                  callId,
                  peerId: id,
                });
              });

              peer.on("call", (call) => {
                console.log("nowCalling", call);
                call.answer(stream);
                call.on("stream", (stream) => {
                  remoteVideoRef.current.srcObject = stream;
                });
              });
            });
          }
        } catch (error) {
          console.log(error);
        }
      }
    };
    console.log("initCall");

    if (socket) {
      initCall();
    }
  }, []);

  const sendMessage = (e: any) => {
    e.preventDefault();

    if (!socket) {
      return;
    }

    socket?.emit("tempMessage", {
      callID: callId,
      message: e.target.msj.value,
      user: currentUser._id,
    });
  };

  return (
    <div className="grid h-screen grid-cols-[60%,auto]">
      <div className="h-full bg-white">
        <video
          id="local-video"
          ref={localVideoRef}
          autoPlay
          playsInline
          className="h-[200px] w-[200px] bg-red-400 "
        ></video>
        <p>Local</p>
        <div>
          Control de llamada
          <button>Colgar</button>
          <button
            onClick={() => {
              const videoTrack =
                localVideoRef.current.srcObject.getVideoTracks()[0];
              videoTrack.enabled = !videoTrack.enabled;
            }}
          >
            Activar/Desactivar video
          </button>
          <button
            onClick={() => {
              const audioTrack =
                localVideoRef.current.srcObject.getAudioTracks()[0];
              audioTrack.enabled = !audioTrack.enabled;
            }}
          >
            Activar/Desactivar audio
          </button>
        </div>
        <video
          id="remote-video"
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="h-[200px] w-[200px] bg-gray-400 "
        ></video>
        <p>Remoto</p>
      </div>
      <div className="flex flex-col bg-gray-300">
        <div className="h-full">
          {messages.map((message) => (
            <div>
              <p>{message.message}</p>
              <p>{message.user}</p>
            </div>
          ))}
        </div>
        <form
          onSubmit={sendMessage}
          className="flex h-max flex-col bg-red-300 px-4 py-4"
        >
          <input type="text" name="msj" />
          <button type="submit">Enviar</button>
        </form>
      </div>
    </div>
  );
};

export default CallRoom;
