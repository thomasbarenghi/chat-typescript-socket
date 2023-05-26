import axios from "axios";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { useSelector, useDispatch } from "react-redux";
import { setGoogleSuccefull, resetReducer } from "@/redux/slices/authSession";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";

import { getUserData } from "@/redux/slices/authSession";
import { RootState } from "@/redux/store/store";
const urlServer = process.env.NEXT_PUBLIC_SERVER_URL;
import React, { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

const HOC: React.FC<Props> = ({ children }) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const {
    loginMethod,
    isAdmin,
    isLogged,
    tokenValid,
    google: { googleSessionID },
  } = useSelector((state: RootState) => state?.authSession.auth);

  const { _id } = useSelector(
    (state: RootState) => state?.authSession.session.current
  );

  const hocIsWorking = false;
  const experimentalIsClient = isLogged;
  const experimentalIsAdmin = isAdmin;

  const GoogleSessionID = googleSessionID
    ? googleSessionID
    : router.query.session;

  const clientId: string = _id
    ? _id
    : typeof router.query.id === "string"
    ? router.query.id
    : "";

  //--------------------
  //HOC GOOGLE AUTH
  const googleAuth = async (headers: string) => {

    try {
      const verify = await axios.get(`${urlServer}api/auth/google/verify`, {
        headers: {
          session: headers,
        },
      });


      if (clientId && clientId !== undefined) {

        await dispatch(getUserData(clientId));
  
        dispatch(setGoogleSuccefull(headers));
      }
    } catch (error: any) {

      dispatch(resetReducer());
      router.push("/");
    }
  };

  useEffect(() => {
    if (loginMethod === "google" && GoogleSessionID) {
      const headers = GoogleSessionID.toString();
  
      googleAuth(headers);
    }
  }, [GoogleSessionID, loginMethod, clientId]);

  if (!hocIsWorking) {
    return <>{children}</>;
  }

  if (router.pathname.startsWith("/chat")) {
    if (experimentalIsClient === false || tokenValid === false) {
      router.push("/");
      return null; // o <></>
    } else {
      return <>{children}</>;
    }
  } else if (router.pathname.startsWith("/admin")) {
    if (experimentalIsAdmin === false || tokenValid === false) {
      router.push("/");
      return null; // o <></>
    } else {
      return <>{children}</>;
    }
  } else if (router.pathname.startsWith("/auth")) {
    if (router.pathname === "/auth/logout") {
      return <>{children}</>;
    }
    if (isLogged === true) {
      router.push("/");
      return null; // o <></>
    } else {
      return <>{children}</>;
    }
  } else {
    return <>{children}</>;
  }
};

export default HOC;
