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
import { HOC, Master } from "@/components";
import { Toaster } from "sonner";

const App: NextPage<AppProps> = ({ Component, pageProps }) => {
  return (
    <>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <Toaster
            position="bottom-left"
            toastOptions={{
              className: "max-w-[85vw] xs:max-w-none ",
            }}
          />
          <HOC>
          <Master>
            <Component {...pageProps} />
          </Master>
          </HOC>
        </PersistGate>
      </Provider>
    </>
  );
};

export default App;
