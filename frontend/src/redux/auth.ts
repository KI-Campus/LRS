import { createSlice } from "@reduxjs/toolkit";
import Authentication from "src/services/auth";
import { setHeader } from "src/utils/axios";
import notification from "antd/lib/notification";

// interfaces
interface initialStateInterface {
  isLoggedIn: undefined | null | boolean;
  loading: boolean;
  globalLoading: boolean;
  user: any;
}

const initialState: initialStateInterface = {
  isLoggedIn: undefined,
  loading: false,
  globalLoading: false,
  user: null,
};

const auth_modal = createSlice({
  name: "auth_modal",
  initialState,
  reducers: {
    setIsLoggedIn: (state, action) => {
      state.isLoggedIn = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setGlobalLoading: (state, action) => {
      state.globalLoading = action.payload;
    },
  },
});

export default auth_modal.reducer;

export const { setIsLoggedIn, setLoading, setGlobalLoading, setUser } =
  auth_modal.actions;

export function login({ email, password }) {
  return async (dispatch) => {
    dispatch(setLoading(true));

    try {
      // login logic
      let result = await Authentication.login(email, password);
      setHeader(result.data?.token);
      console.log("Login result", result);

      dispatch(setUser(result));
      dispatch(setIsLoggedIn(true));
      localStorage.setItem("token", result.data?.token);

      // Set token to axios

      dispatch(setLoading(false));
    } catch (error: any) {
      console.log("Error while logging in", error);
      dispatch(setLoading(false));
    }
  };
}

export function logout() {
  return async (dispatch) => {
    dispatch(setGlobalLoading(true));

    try {
      // logout logic
      await Authentication.logout();

      dispatch(setIsLoggedIn(null));
      dispatch(setUser(null));
      localStorage.clear();
      dispatch(setGlobalLoading(false));
    } catch (error: any) {
      notification.error({
        message: error.message,
      });
      dispatch(setGlobalLoading(false));
    }
  };
}

export function checkLoginStatus() {
  return async (dispatch) => {
    try {
      let t = localStorage.getItem("token");
      if (t) {
        setHeader(t);
        let result = await Authentication.getUser(t);
        dispatch(setIsLoggedIn(true));
        dispatch(setUser(result));
      } else {
        dispatch(setIsLoggedIn(null));
      }
    } catch (error: any) {
      notification.error({
        message: error.message,
      });
    }
  };
}
