import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { createUserSession } from "@/utils/userSession";
const urlServer = process.env.NEXT_PUBLIC_SERVER_URL;
import { RootState } from "@/redux/store/store";
import { types } from "util";
import { toast } from "sonner";
import { toastError, toastWarning, toastSuccess } from "@/utils/toastStyles";
import { type } from "os";

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

export const newChat = createAsyncThunk(
  "chats/newChat",
  async (id: string, { rejectWithValue, getState, dispatch }) => {
    try {
      const state = getState() as RootState;
      const user = state.authSession.session.current;

      if (id === user._id) {
        return rejectWithValue("No puedes enviarte mensajes a ti mismo");
      }

      const chat = state.chats.chats.some((chat: any) => {
        return chat.participants.some((participant: any) => {
          return participant._id === id;
        });
      });

      if (chat) {
        return rejectWithValue("Ya existe un chat con este usuario");
      }

      const res = await axios.post(`${urlServer}api/chat/`, {
        _id: user._id,
        otherUserID: id,
      });

      console.log("res", res.data);

      dispatch(getChats());

      return res.data;
    } catch (error: any) {
      return rejectWithValue(error);
    }
  }
);

export const getChats = createAsyncThunk(
  "chats/getChats",
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState;
      const user = state.authSession.session.current;

      const res = await axios.get(`${urlServer}api/user/${user._id}/chats`);

      console.log("res get chats", res.data);

      return res.data;
    } catch (error: any) {
      return rejectWithValue(error);
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
      const message = messageFormater({
        messages: messages,
        user: action.payload.user,
      });

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
      })

      .addCase(newChat.fulfilled, (state, action) => {
        toast.success("Chat creado", toastSuccess);
      })
      .addCase(newChat.rejected, (state, action: any) => {
        console.log("newChat error", action.payload);

        if (typeof action.payload === "string") {
          toast.error(action.payload, toastError);
        }
      })

      .addCase(getChats.fulfilled, (state, action) => {
        state.chats = action.payload;
      })
      .addCase(getChats.rejected, (state, action) => {
        console.log("getChats error");
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
