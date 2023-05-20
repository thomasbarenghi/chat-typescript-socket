import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { createUserSession } from "@/utils/userSession";
const urlServer = process.env.NEXT_PUBLIC_SERVER_URL;
import { RootState } from "@/redux/store/store";
import { types } from "util";

const initialState = {
  chats: [],
  currentChat: {
    messages: [],
    id: "" as string | null,
  },
};

//Actions
export const getCurrentChat = createAsyncThunk(
  "chats/getCurrentChat",
  async (chatId: string, { rejectWithValue, getState }) => {
    try {
      const res = await axios.get(`${urlServer}api/chat/${chatId}`);

      //hacemos un map y si el id de messages[].sender._id es igual al id de user._id, entonces le agregamos una propiedad de sender: true

      const state = getState() as RootState;
      const user = state.authSession.session.current;

      const messages = messageFormater({ messages: res.data.messages, user });

      console.log("messages", messages);
      return { messages: messages, id: chatId };
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);

//Reducers
const postsSlice = createSlice({
  name: "chats",
  initialState,
  reducers: {
    setChats(state, action: PayloadAction<any>) {
      console.log("action.payload chats", action.payload);
      state.chats = action.payload;
    },
    setCurrentChat(state, action: PayloadAction<any>) {

      const messages = [...state.currentChat.messages, action.payload.message];
      const message = messageFormater({ messages: messages, user: action.payload.user });

      state.currentChat.messages = message;
    },
    resetChatId(state) {
      state.currentChat.id = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getCurrentChat.fulfilled, (state, action) => {
        state.currentChat.messages = action.payload.messages;
        state.currentChat.id = action.payload.id;
      })
      .addCase(getCurrentChat.rejected, (state, action) => {
        console.log("getCurrentChat error");
      });
  },
});

export const { setChats, setCurrentChat, resetChatId } = postsSlice.actions;

export default postsSlice.reducer;

type Props = {
  messages: any;
  user: any;
};

export const messageFormater = ({ messages, user }: Props) => {
  const formated = messages.map((message: any) => {
    if (message.sender._id === user._id) {
      return {
        ...message,
        origin: true,
      };
    } else {
      return {
        ...message,
        origin: false,
      };
    }
  });

  return formated;
};
