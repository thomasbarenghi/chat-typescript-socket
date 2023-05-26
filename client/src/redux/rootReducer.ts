import { combineReducers } from "@reduxjs/toolkit";
import authSession from "./slices/authSession";
import chats from "./slices/chats";
import call from "./slices/call";

const rootReducer = combineReducers({
  authSession: authSession,
  chats: chats,
  call: call,
});

export default rootReducer;
