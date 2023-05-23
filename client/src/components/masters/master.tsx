import React, { ReactNode, useState, useEffect, useMemo } from "react";
import { debounce } from "lodash";
import { getSocket, initSocket } from "@/utils/socket";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
type Props = {
  children: ReactNode;
};

const Master: React.FC<Props> = ({ children }) => {
  const session = useAppSelector((state) => state.authSession.session.current);
  const [socketAvailable, setSocketAvailable] = useState(false);

  useEffect(() => {
    const connectSocket = async () => {
      try {
        await initSocket(session._id);
      } catch (error) {
        console.error("Error al conectar el socket:", error);
      }
    };

    connectSocket();

    const socket = getSocket();
    if (socket) {
      socket.on("connect", () => {
        setSocketAvailable(true);
      });
    }

    return () => {
      if (socket) {
        socket.off("connect");
      }
    };
  }, [session]);

  if (!socketAvailable) {
    return <div>Cargando...</div>;
  }

  return <div>{children}</div>;
};

export default Master;
