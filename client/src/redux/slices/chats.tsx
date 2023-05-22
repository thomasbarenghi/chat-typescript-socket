import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { RootState } from "@/redux/store/store";
import { toast } from "sonner";
import { toastError, toastWarning, toastSuccess } from "@/utils/toastStyles";
const urlServer = process.env.NEXT_PUBLIC_SERVER_URL;
import { getSocket, initSocket } from "@/utils/socket";

const initialState = {
  chats: [] as any,
  currentChat: {
    messages: [] as any,
    id: "" as string | null,
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
      console.log("res.data.messages", res.data.messages);
      return { messages: res.data.messages, id: chatId };
    } catch (error: any) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const newChat = createAsyncThunk(
  "chats/newChat",
  async (id: string, { rejectWithValue, getState, dispatch }) => {
    try {
      console.log("id rec", id);
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
        //  return rejectWithValue("Ya existe un chat con este usuario");
      }

      const res = await axios.post(`${urlServer}api/chat/`, {
        _id: user._id,
        otherUserID: id,
      });

      dispatch(getChats());
      const socket = getSocket();
      console.log("socket:", id);
      socket.emit("newChat", {
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
      console.log("res.data", res.data);
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
      console.log("action.payload.newMessage", action.payload.newMessage);
      
      const index: any = state.chats.findIndex((chat: any) => {
        return chat._id === action.payload.chatId;
      });

      //si existe actualizamos el lastMessage
      console.log("index", index);
      
      if (index !== -1) {
        console.log("index act", index);
        state.chats[index].lastMessage = action.payload.newMessage;
        state.chats[index].lastModified = new Date(Date.now()).toISOString();

        if (action.payload.newMessage.type !== "text") {
          console.log("es archivo");
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

export const { setChats, setCurrentChat, resetChatId, chatUserStatus } =
  postsSlice.actions;

export default postsSlice.reducer;

// type Props = {
//   messages: any;
//   user: any;
// };

// export const messageFormater = ({ messages, user }: Props) => {
//   console.log("messages", messages);
//   const formated = messages.map((message: any) => {
//     if (message.sender._id === user._id) {
//       return {
//         ...message,
//         origin: true,
//       };
//     } else {
//       return {
//         ...message,
//         origin: false,
//       };
//     }
//   });

//   return formated;
// };
