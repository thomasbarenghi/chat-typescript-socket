import Head from "next/head";
import Image from "next/image";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { initSocket, getSocket } from "@/utils/socket";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [myId, setMyId] = useState(null);
  const [myPeerId, setMyPeerId] = useState(null);
  const [Peer, setPeer] = useState(null);
  const remoteVideoRef = useRef(null);
  const localVideoRef = useRef(null);

  useEffect(() => {
    const connectSocket = async () => {
      try {
        await initSocket("test");
      } catch (error) {
        console.error("Error al conectar el socket:", error);
      }
    };

    connectSocket();

    const socket = getSocket();
    if (socket) {
      socket.on("connect", () => {
        // setSocketAvailable(true);
        console.log("Socket conectado");
      });
    }

    return () => {
      if (socket) {
        socket.off("connect");
      }
    };
  }, []);

  useEffect(() => {
    const initLocalVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true,
        });

        localVideoRef.current.srcObject = stream;

        //finalizamos
      } catch (err) {
        console.error("error local media", err);
      }
    };

    initLocalVideo();
  }, []);

  useEffect(() => {
    const connectToPeer = async () => {
      import("peerjs").then(({ default: Peer }) => {
        const peer = new Peer(myId, {
          host: "localhost",
          port: 9000,
          path: "/myapp",
        });

        peer.on("open", (id) => {
          console.log("My peer ID is: " + id);
          setMyPeerId(id);
          setPeer(peer);
        });

        peer.on("error", (error) => {
          console.error(error);
        });

        // Handle incoming data connection
        peer.on("connection", (conn) => {
          console.log("connection", conn);
          conn.on("data", (data) => {
            console.log("received", data);
          });
          conn.on("open", () => {
            conn.send("hello!");
          });
        });

        // Handle incoming voice/video connection
        peer.on("call", (call) => {
          navigator.mediaDevices
            .getUserMedia({ video: true, audio: true })
            .then((stream) => {
              call.answer(stream); // Answer the call with an A/V stream.
              call.on("stream", (remoteStream) => {
                console.log("stream", remoteStream);
                remoteVideoRef.current.srcObject = remoteStream;
                localVideoRef.current.srcObject = stream;
              });
            })
            .catch((err) => {
              console.error("Failed to get local stream", err);
            });
        });
      });
    };

    if (myId) {
      connectToPeer();
    }
  }, [myId]);

  const callPeer = async (e) => {
    console.log(Peer);
    e.preventDefault();
    let peerId = e.target.id.value;
    console.log("calling peer", peerId);

    let conn = Peer.connect(peerId);
    conn.on("data", (data) => {
      console.log("received", data);
    });
    conn.on("open", () => {
      conn.send("hi!");
    });

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });

      let call = Peer.call(peerId, stream);
      call.on("stream", (remoteStream) => {
        console.log("stream", remoteStream);
        remoteVideoRef.current.srcObject = remoteStream;
      });
    } catch (err) {
      console.error("error local media", err);
    }
  };

  return (
    <>
      <>
        <video
          className="remote-video"
          autoPlay
          playsInline
          ref={remoteVideoRef}
        />
        <video
          className="local-video"
          autoPlay
          playsInline
          ref={localVideoRef}
        />
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setMyId(e.target.id.value);
          }}
        >
          <input
            type="text"
            name="id"
            id="peer-id"
            placeholder="ingresa tu id"
          />
          <button type="submit">set id</button>
        </form>
        <form onSubmit={callPeer}>
          <input
            type="text"
            name="id"
            id="connect-to-peer"
            placeholder="ingresa un peer id"
          />
          <button type="submit">Connect</button>
        </form>
        <div className="your peer">
          <p>your peer id: {myPeerId}</p>
        </div>
      </>
    </>
  );
}
