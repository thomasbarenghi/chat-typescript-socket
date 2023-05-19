import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { createUserSession } from "@/utils/userSession";
const urlServer = process.env.NEXT_PUBLIC_SERVER_URL;
import { RootState } from "@/redux/store/store";

const initialState = {
  chats: [],
  currentChat: [],
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

      const messages = res.data.messages.map((message: any) => {
        if (message.sender._id === user._id) {
          return {
            ...message,
            origin: true,
          };
        } else {
          return {
            ...message,
            sender: false,
          };
        }
      });
      console.log("messages", messages);
      return messages;
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
      state.currentChat = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getCurrentChat.fulfilled, (state, action) => {
        state.currentChat = action.payload;
      })
      .addCase(getCurrentChat.rejected, (state, action) => {
        console.log("getCurrentChat error");
      });
  },
});

export const { setChats, setCurrentChat } = postsSlice.actions;

export default postsSlice.reducer;
