import { combineReducers } from "@reduxjs/toolkit";
import authSession from "./slices/authSession";
import chats from "./slices/chats";
const rootReducer = combineReducers({
 authSession: authSession,
  chats: chats,
});

export default rootReducer;
