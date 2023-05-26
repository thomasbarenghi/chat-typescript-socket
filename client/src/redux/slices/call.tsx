import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { RootState } from "@/redux/store/store";
import { toast } from "sonner";
import { toastError, toastWarning, toastSuccess } from "@/utils/toastStyles";
import { chatsFormater } from "@/utils/chats/chatsFormater";
const urlServer = process.env.NEXT_PUBLIC_SERVER_URL;
import { getSocket } from "@/utils/socket";

const initialState = {
  myPeerId: "",
  otherPeerId: "",
  firstConnection: false,
  callAccepted: false,
  callEnded: false,
  roomId: "",
  droppedCall: false,
};

//usamos el room id para decidir si borrar el estado de la llamada

//Reducers
const postsSlice = createSlice({
  name: "chats",
  initialState,
  reducers: {
    setMyPeerId: (state, action: PayloadAction<string>) => {
      state.myPeerId = action.payload;
    },
    setOtherPeerId: (state, action: PayloadAction<string>) => {
      state.otherPeerId = action.payload;
    },
    setCallAccepted: (state, action: PayloadAction<boolean>) => {
      state.callAccepted = action.payload;
    },
    setCallEnded: (state, action: PayloadAction<boolean>) => {
      state.callEnded = true;
      state = initialState;

    },
    setRoomId: (state, action: PayloadAction<string>) => {
      state.roomId = action.payload;
    },
    setFirstConnection: (state, action: PayloadAction<boolean>) => {
      state.firstConnection = action.payload;
    },
    setDroppedCall: (state, action: PayloadAction<boolean>) => {
      state.droppedCall = true;
      state = initialState;
    },
    reset: () => {
      return initialState;
    }
  },
  extraReducers: (builder) => {
    builder;
  },
});

export const {
  setMyPeerId,
  setOtherPeerId,
  setCallAccepted,
  setCallEnded,
  setRoomId,
  setFirstConnection,
  setDroppedCall,
  reset,
} = postsSlice.actions;

export default postsSlice.reducer;
