import { useRouter } from "next/router";
import { useEffect, useRef, useState, useMemo, use } from "react";
import { getSocket, initSocket } from "@/utils/socket";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { debounce } from "lodash";
import { Stream } from "stream";

const CallRoom = () => {
  const router = useRouter();
  const { slug: callId, owner } = router.query;
  const socket = getSocket();
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(
    (state) => state.authSession.session.current
  );

  const [messages, setMessages] = useState<any[]>([]);

  //typescript
  const localVideoRef = useRef<any>(null);
  const remoteVideoRef = useRef<any>(null);

  const delayedFetchGenres = useMemo(() => {
    return debounce(async () => {
      await initSocket(currentUser._id);
    }, 300);
  }, [dispatch]);

  useEffect(() => {
    const connectSocket = async () => {
      try {
        const cancelDebounce = () => {
          delayedFetchGenres.cancel();
        };
        delayedFetchGenres();
        return cancelDebounce;
      } catch (error) {
        console.error("Error al conectar el socket:", error);
      }
    };
    connectSocket();
  }, [delayedFetchGenres]);

  const [peerId, setPeerId] = useState<string>("");

  useEffect(() => {
    const initCall = async () => {
      if (socket && process.browser && navigator.mediaDevices) {
        socket.emit("acceptCall", {
          callId,
        });

        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true,
          });
          localVideoRef.current.srcObject = stream;

          if (owner === "true") {
            import("peerjs").then(({ default: Peer }) => {
              const peer = new Peer({
                host: "localhost", // El hostname del servidor backend
                port: 3001, // El puerto del servidor backend
                path: "/peerjs", // Ruta al servidor PeerJS en tu backend
              });

              peer.on("open", (id) => {
                console.log("My peer ID is: " + id);
                setPeerId(id);
              });

              peer.on("connection", (conn) => {
                conn.on("open", () => {
                  conn.on("data", (data) => {
                    console.log("Recibido:", data);
                  });
                  conn.send("¡Hola!");
                });
              });

              socket.on("receivePeerId", (data: any) => {
                var call = peer.call(data.peerID, stream);

                call.on("stream", (stream) => {
                  remoteVideoRef.current.srcObject = stream;
                });
              });
            });
          } else {
            import("peerjs").then(({ default: Peer }) => {
              const peer = new Peer({
                host: "localhost", // El hostname del servidor backend
                port: 3001, // El puerto del servidor backend
                path: "/peerjs", // Ruta al servidor PeerJS en tu backend
              });

              peer.on("open", (id) => {
                console.log("My peer ID is: " + id);
                setPeerId(id);
              });

              if (peerId && callId) {
                socket.emit("sendPeerId", {
                  callId,
                  peerId,
                });
              }

              peer.on("call", (call) => {
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

    initCall();
  }, [socket, process.browser, owner, callId, peerId]);

  useEffect(() => {
    if (socket && process.browser) {
      socket.on("newTempMessage", (message: any) => {
        console.log("newTempMessage", message);
        setMessages((messages) => [...messages, message]);
      });

      return () => {
        socket.off("newTempMessage");
      };
    }
  }, [socket]);

  const sendMessage = (e: any) => {
    e.preventDefault();
    socket.emit("tempMessage", {
      callID: callId,
      message: e.target.msj.value,
      user: currentUser.email,
    });
  };

  return (
    <div className="grid h-screen grid-cols-[60%,auto]">
      <div className="h-full bg-white">
        {/* Elemento de video para mostrar el stream local */}
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

        {/* Elemento de video para mostrar el stream remoto */}
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
