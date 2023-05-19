// import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
// import { useDispatch } from 'react-redux';
// import { persistStore, persistReducer } from 'redux-persist';
// import storage from 'redux-persist/lib/storage';
// import rootReducer from '../rootReducer';

// const persistConfig = {
//   key: 'root',
//   storage,
//   whitelist: ['authSession', 'chats'],
//   debug: true,
// };

// const persistedReducer = persistReducer(persistConfig, rootReducer);

// const persistMiddleware = getDefaultMiddleware({
//   serializableCheck: false,
// });

// const store = configureStore({
//   reducer: persistedReducer,
//   //debe ir el middleware de persistencia y el de los thunk
//  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(persistMiddleware),
// });



// // export type RootState = ReturnType<typeof store.getState>;
// // export type AppDispatch = typeof store.dispatch;
// // export const useAppDispatch = () => useDispatch<AppDispatch>();

// export type RootState = ReturnType<typeof store.getState>
// // Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
// export type AppDispatch = typeof store.dispatch

// export const persistor = persistStore(store);

// export default store;

import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import rootReducer from '../rootReducer';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['authSession', 'chats'],
  debug: true,
};
const persistMiddleware = getDefaultMiddleware({
  serializableCheck: false,
});
const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(persistMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const persistor = persistStore(store);

export default store;
