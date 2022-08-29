import { combineReducers, configureStore } from "@reduxjs/toolkit";

import authModal from "./auth";

const reducer = combineReducers({
  authModal,
});

// reset state on logout
const rootReducer = (state, action) => {
  if (action.type === "auth_modal/setLogout") {
    state = undefined;
  }
  return reducer(state, action);
};

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppStateType = ReturnType<typeof reducer>;
export interface SerializedError {
  name?: string;
  message?: string;
  code?: string;
  stack?: string;
}

export default store;
