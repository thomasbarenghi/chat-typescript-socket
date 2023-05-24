import { useRouter } from "next/router";
import { useEffect, useRef, useState, useMemo, use } from "react";
import { getSocket } from "@/utils/socket";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { debounce } from "lodash";
import { MasterCallLayout } from "@/components";

const CallRoom = () => {
  return <MasterCallLayout />;
};

export default CallRoom;

// const CallRoom = () => {
//   const router = useRouter();
//   const socket = getSocket();
//   const dispatch = useAppDispatch();
//   const { slug: callId, owner } = router.query;
//   const currentUser = useAppSelector(
//     (state) => state.authSession.session.current
//   );

//   const [Peer, setPeer] = useState<any>(null);
//   const [myPeerId, setMyPeerId] = useState<string>("");
//   const [otherPeerId, setOtherPeerId] = useState<string>("");

//   const [peerId, setPeerId] = useState<string>("");
//   const [messages, setMessages] = useState<any[]>([]);
//   const localVideoRef = useRef<any>(null);
//   const remoteVideoRef = useRef<any>(null);

//   useEffect(() => {
//     const listenSocket = async () => {
//       socket?.emit(
//         "acceptCall",
//         {
//           callID: callId,
//         },
//         (data: any) => {
//           console.log("callback", data);
//         }
//       );

//       socket?.on("newTempMessage", (message: any) => {
//         console.log("newTempMessage", message);
//         setMessages((prev) => [...prev, message]);
//       });

//       return () => {
//         socket?.off("acceptCall");
//         socket?.off("newTempMessage");
//       };
//     };

//     if (socket && socket.connected && socket !== null) {
//       listenSocket();
//     }

//     console.log("useEffect", socket);
//   }, [socket]);

//   //Inicializar app
//   useEffect(() => {
//     //Obtenemos medios
//     const getMedia = async () => {
//       try {
//         const stream = await navigator.mediaDevices.getUserMedia({
//           audio: true,
//           video: true,
//         });

//         localVideoRef.current.srcObject = stream;
//       } catch (err) {
//         console.error("error local media", err);
//       }
//     };

//     if (owner === "true" && socket) {
//       socket!.on("receivePeerId", (data) => {
//         console.log("receivePeerId", data);
//         setOtherPeerId(data.peerId);
//       });
//     }

//     getMedia();

//     return () => {
//       socket!.off("receivePeerId");
//     };
//   }, [socket]);

//   //Conectar a peerjs y quedar a la escucha de llamadas
//   useEffect(() => {
//     const connectToPeer = async () => {
//       import("peerjs").then(({ default: Peer }) => {
//         const peer = new Peer({
//           host: "localhost",
//           port: 3002,
//           path: "/peerjs/myapp",
//         });

//         peer.on("open", (id) => {
//           console.log("My peer ID is: " + id);
//           setMyPeerId(id);
//           setPeer(peer);

//           if (owner === "false") {
//             socket!.emit("sendPeerId", {
//               callId,
//               peerId: id,
//             });
//           }
//         });

//         peer.on("error", (error) => {
//           console.error(error);
//         });

//         peer.on("connection", (conn) => {
//           console.log("connection", conn);
//           conn.on("data", (data) => {
//             console.log("received", data);
//           });
//           conn.on("open", () => {
//             conn.send("hello!");
//           });
//         });

//         peer.on("call", (call) => {
//           call.answer(localVideoRef.current.srcObject);
//           call.on("stream", (remoteStream) => {
//             remoteVideoRef.current.srcObject = remoteStream;
//           });
//         });
//       });
//     };
//     connectToPeer();
//   }, []);

//   //Llamar a otro peer
//   useEffect(() => {
//     if (Peer) {
//       const makeCall = async () => {
//         let conn = Peer.connect(otherPeerId);
//         conn.on("data", (data: any) => {
//           console.log("received", data);
//         });
//         conn.on("open", () => {
//           conn.send("hi!");
//         });

//         let call = Peer.call(otherPeerId, localVideoRef.current.srcObject);
//         call.on("stream", (remoteStream: any) => {
//           remoteVideoRef.current.srcObject = remoteStream;
//         });
//       };

//       if (owner === "true" && otherPeerId !== "") {
//         makeCall();
//       }
//     }
//   }, [Peer, otherPeerId]);

//   const sendMessage = (e: any) => {
//     e.preventDefault();
//     if (socket) {
//       socket?.emit("tempMessage", {
//         callID: callId,
//         message: e.target.msj.value,
//         user: currentUser._id,
//       });
//     }
//   };

//   return (
//     <div className="grid h-screen grid-cols-[60%,auto]">
//       <div className="h-full bg-white">
//         <video
//           id="local-video"
//           ref={localVideoRef}
//           autoPlay
//           playsInline
//           className="h-[200px] w-[200px] bg-red-400 "
//         ></video>
//         <p>Local</p>
//         <div>
//           Control de llamada
//           <button>Colgar</button>
//           <button
//             onClick={() => {
//               const videoTrack =
//                 localVideoRef.current.srcObject.getVideoTracks()[0];
//               videoTrack.enabled = !videoTrack.enabled;
//             }}
//           >
//             Activar/Desactivar video
//           </button>
//           <button
//             onClick={() => {
//               const audioTrack =
//                 localVideoRef.current.srcObject.getAudioTracks()[0];
//               audioTrack.enabled = !audioTrack.enabled;
//             }}
//           >
//             Activar/Desactivar audio
//           </button>
//         </div>
//         <video
//           id="remote-video"
//           ref={remoteVideoRef}
//           autoPlay
//           playsInline
//           className="h-[200px] w-[200px] bg-gray-400 "
//         ></video>
//         <p>Remoto</p>
//       </div>
//       <div className="flex flex-col bg-gray-300">
//         <div className="h-full">
//           {messages.map((message) => (
//             <div>
//               <p>{message.message}</p>
//               <p>{message.user}</p>
//             </div>
//           ))}
//         </div>
//         <form
//           onSubmit={sendMessage}
//           className="flex h-max flex-col bg-red-300 px-4 py-4"
//         >
//           <input type="text" name="msj" />
//           <button type="submit">Enviar</button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default CallRoom;
