import axios from "src/utils/axios";
import {
  API_USER_LOGIN,
  API_USER_CURRENT,
  API_USER_LOGIN_MAGIC_TOKEN,
} from "src/utils/constants";

const Authentication = {
  getUser: async (token) => {
    return axios.get(API_USER_CURRENT, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
  login: async (email, password) => {
    return axios.post(API_USER_LOGIN, { email: email, password: password });
  },

  logout: async () => {},

  loginWithMagicToken: async (magicToken) => {
    return axios.post(API_USER_LOGIN_MAGIC_TOKEN, { magicToken });
  },

  // resetPassword: async (email) => await auth.sendPasswordResetEmail(email),
};

export default Authentication;
