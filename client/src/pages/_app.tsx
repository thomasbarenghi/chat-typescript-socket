import "@/styles/globals.scss";
// import type { AppProps } from 'next/app'

// export default function App({ Component, pageProps }: AppProps) {
//   return <Component {...pageProps} />
// }

import { NextPage } from "next";
import type { AppProps } from "next/app";
import { Provider } from "react-redux";
import store, { persistor } from "@/redux/store/store";
import { PersistGate } from "redux-persist/integration/react";
import { HOC } from "@/components";
import { useEffect } from "react";
import { getSocket, initSocket } from "../utils/socket";
import { Toaster } from "sonner";

const App: NextPage<AppProps> = ({ Component, pageProps }) => {
  useEffect(() => {
    const connectSocket = async () => {
      try {
        await initSocket();
      } catch (error) {
        console.error("Error al conectar el socket:", error);
      }
    };
    connectSocket();
  }, []);

  return (
    <>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <HOC>
            <Toaster
              position="bottom-left"
              toastOptions={{
                className: "max-w-[85vw] xs:max-w-none ",
              }}
            />
            <Component {...pageProps} />
          </HOC>
        </PersistGate>
      </Provider>
    </>
  );
};

export default App;
