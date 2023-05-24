import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { createUserSession } from "@/utils/userSession";
import { setChats } from "./chats";
const urlServer = process.env.NEXT_PUBLIC_SERVER_URL;
import { Dispatch } from "redux";
import { RootState } from "../../redux/store/store"; // Importa el tipo de tu estado raíz (RootState)
import { chatsFormater } from "@/utils/chats/chatsFormater";
const initialState = {
  auth: {
    isLogged: false,
    loginMethod: "",
    isSeller: false,
    isAdmin: false,
    tokenValid: false,
    google: {
      googleSessionID: "",
    },
    json: {
      token: "",
    },
  },
  session: {
    current: {
      firstName: "",
      lastName: "",
      bio: "",
      profilePicture: "",
      _id: "",
      email: "",
      userName: "",
      backImage: "",
    },
  },
  actionStatus: {
    getUserDataLoading: false,
  },
};

//tipo para chat:
// {
//   "_id": "6465d7eedb6efe0dc933b1d4",
//   "participants": [
//     {
//       "_id": "6465afd4b6152b1152872ac0",
//       "firstName": "Thomas",
//       "lastName": "Barenghi",
//       "email": "spacestudio.ar@gmail.com",
//       "image": "https://lh3.googleusercontent.com/a/AGNmyxYvABrepY_VHH5ZCo9n_C0H57h7expOWS04qcay=s96-c"
//     },
//     {
//       "_id": "6465b3ca55346bd2e59f3495",
//       "firstName": "Thomas",
//       "lastName": "Barenghi",
//       "email": "thomasbarenghi@gmail.com",
//       "image": "https://lh3.googleusercontent.com/a/AGNmyxaQOu2gjj2fFQui6UAEsh69ViNYxcdRC9bYUMwUZw=s96-c"
//     }
//   ],
//   "messages": [
//     {
//       "sender": "6465afd4b6152b1152872ac0",
//       "content": "cxcxc",
//       "date": "2023-05-18T07:48:27.624Z",
//       "_id": "6465d84bdb6efe0dc933b1dd",
//       "__v": 0
//     },
//     {
//       "sender": "6465afd4b6152b1152872ac0",
//       "content": "testeamos",
//       "date": "2023-05-18T07:48:55.828Z",
//       "_id": "6465d867db6efe0dc933b1e3",
//       "__v": 0
//     },
//   ],
//   "__v": 32
// }

type Participant = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  image: string;
};

type Message = {
  sender: string;
  content: string;
  date: string;
  _id: string;
  __v: number;
};

type Chat = {
  _id: string;
  participants: Participant[];
  messages: Message[];
  lastMessage: Message;
  __v: number;
};

//Actions
export const getUserData = createAsyncThunk(
  "auth/getUserData",
  async (data: string, { dispatch, getState }) => {
    try {
      const { data: response } = await axios.get(
        `${urlServer}api/user/${data}`
      );

      const auth = {
        isSeller: response.isSeller,
        isAdmin: response.superAdmin,
      };
      const state = getState() as RootState;
      const user = state.authSession.session.current;
      const chats = chatsFormater({ chats: response.chats, user });
      console.log(chats);
      await dispatch(setChats(chats));

      const session = createUserSession(response);

      return { auth, session };
    } catch (error: any) {
      console.log(error);
      throw error; // Re-throw the error to propagate it to the calling code
    }
  }
);

//Reducers
const postsSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setLoginMethod: (state, action: PayloadAction<string>) => {
      state.auth.loginMethod = action.payload;
    },
    setGoogleSuccefull: (state, action: PayloadAction<string>) => {
      console.log("setGoogleSuccefull");
      state.auth.isLogged = true;
      state.auth.tokenValid = true;
      state.auth.google.googleSessionID = action.payload;
    },

    resetReducer: (state) => {
      state.auth = initialState.auth;
      state.session = initialState.session;
      state.actionStatus = initialState.actionStatus;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getUserData.pending, (state) => {
        console.log("pending");
      })
      .addCase(getUserData.fulfilled, (state, action: any) => {
        state.auth = { ...state.auth, ...action.payload.auth };
        state.session.current = {
          ...state.session.current,
          ...action.payload.session,
        };
      })
      .addCase(getUserData.rejected, (state, action) => {
        console.log("rejected");
        state.auth.isLogged = false;
        state.auth.tokenValid = false;
      });
  },
});

export const { setLoginMethod, setGoogleSuccefull, resetReducer } =
  postsSlice.actions;

export default postsSlice.reducer;
