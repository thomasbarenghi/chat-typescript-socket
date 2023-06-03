import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { RootState } from "@/redux/store/store";
import { toast } from "sonner";
import { toastError, toastWarning, toastSuccess } from "@/utils/toastStyles";
import { chatsFormater } from "@/utils/chats/chatsFormater";
const urlServer = process.env.NEXT_PUBLIC_SERVER_URL;
import { getSocket } from "@/utils/socket";

const initialState = {
  chats: [] as any,
  currentChat: {
    messages: [] as any,
    id: "" as string | null,
    otherUser: {} as any,
    chatUserStatus: false as any,
  },
};

//Actions
export const getCurrentChat = createAsyncThunk(
  "chats/getCurrentChat",
  async (chatId: string, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState;
      const user = state.authSession.session.current;
      const res = await axios.get(
        `${urlServer}api/user/${user._id}/chats/${chatId}`
      );
      // const messages = messageFormater({ messages: res.data.messages, user });

      return { messages: res.data.messages, id: chatId };
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const newChat = createAsyncThunk(
  "chats/newChat",
  async (id: string, { rejectWithValue, getState, dispatch }) => {
    console.log("newChat");
    try {
      const state = getState() as RootState;
      const user = state.authSession.session.current;
      if (id === user._id) {
        return rejectWithValue("No puedes enviarte mensajes a ti mismo");
      }
      const chat = state.chats.chats.some((chat: any) => {
        //comparamos chat.participants._id con id
        return chat.participants._id === id;
      });

      if (chat) {
        return rejectWithValue("Ya existe un chat con este usuario");
      }

      const res = await axios.post(`${urlServer}api/chat/`, {
        _id: user._id,
        otherUserID: id,
      });

      dispatch(getChats());
      const socket = getSocket();

      socket?.emit("newChat", {
        toUserId: id,
        chatId: res.data._id,
      });

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

      const chats = chatsFormater({ chats: res.data, user });
      return chats;
    } catch (error: any) {
      return rejectWithValue(error);
    }
  }
);

export const deleteChat = createAsyncThunk(
  "chats/deleteChat",
  async (chatId: string, { rejectWithValue, getState, dispatch }) => {
    try {
      const state = getState() as RootState;
      const user = state.authSession.session.current;
      const res = await axios.delete(
        `${urlServer}api/chat/${chatId}/${user._id}`
      );
      if (chatId === state.chats.currentChat.id) {
        await dispatch(resetCurrentChat());
      }
      await dispatch(getChats());
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
      state.chats = action.payload;
    },
    setCurrentChat(state, action: PayloadAction<any>) {
      //buscamos el index del chat en el array de chats

      const index: any = state.chats.findIndex((chat: any) => {
        return chat._id === action.payload.chatId;
      });

      //si existe actualizamos el lastMessage

      if (index !== -1) {
        state.chats[index].lastMessage = action.payload.newMessage;
        state.chats[index].lastModified = new Date(Date.now()).toISOString();

        if (action.payload.newMessage.type !== "text") {
          state.chats[index].lastMessage = {
            ...state.chats[index].lastMessage,
            content: "Archivo",
          };
        } else {
          state.chats[index].lastMessage = action.payload.newMessage;
        }

        state.chats = state.chats.sort((a: any, b: any) => {
          const dateA: any = new Date(a.lastModified);
          const dateB: any = new Date(b.lastModified);
          return dateB - dateA;
        });
      }

      state.currentChat.messages = [
        ...state.currentChat.messages,
        action.payload.newMessage,
      ];
    },
    setCurrentChatOtherUser(state, action: PayloadAction<any>) {
      state.currentChat.otherUser = action.payload;
    },
    resetChatId(state) {
      state.currentChat.id = null;
    },
    chatUserStatus(state, action: PayloadAction<any>) {
      state.currentChat.chatUserStatus = action.payload.status;
      toast(
        `Tu amigo ${
          action.payload.status ? "esta conectado" : "esta desconectado"
        }`
      );
    },
    resetCurrentChat(state) {
      state.currentChat = initialState.currentChat;
      // state.currentChat.messages = initialState.currentChat.messages;
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
      .addCase(getChats.rejected, (state, action) => {})
      .addCase(deleteChat.fulfilled, (state, action) => {
        toast.success("Chat eliminado", toastSuccess);
      })
      .addCase(deleteChat.rejected, (state, action) => {
        console.log("deleteChat error");
      });
  },
});

export const {
  setChats,
  setCurrentChat,
  resetChatId,
  chatUserStatus,
  setCurrentChatOtherUser,
  resetCurrentChat,
} = postsSlice.actions;

export default postsSlice.reducer;
