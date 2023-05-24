import Axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import notification from "antd/lib/notification";

import { API_ENDPOINT } from "./constants";

export class APIError extends Error {
  public status: number;

  constructor(message: string, status: number) {
    super(message);

    this.status = status;

    notification.error({ message, duration: 5 });
  }
}

const axiosApi: AxiosInstance = Axios.create({
  baseURL: API_ENDPOINT,
  timeout: 10000,
});

axiosApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!error.response) {
      return Promise.reject(new APIError("Unable to reach server", 0));
    }

    if (error.response.data.message) {
      if (error?.response?.data?.statusCode === 403) {
        notification.error({
          message: "Session Ended! Please Login",
          duration: 5,
        });
        window.localStorage.clear();

        return Promise.reject(
          new APIError(error.response.data.message, error.response.status)
        );
      }

      return Promise.reject(
        new APIError(error.response.data.message, error.response.status)
      );
    }

    return Promise.reject(
      new APIError(
        `Request failed with ${error.response.status}`,
        error.response.status
      )
    );
  }
);

export const setHeader = (token: string) => {
  axiosApi.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  axiosApi.defaults.headers.common["Accept"] = "application/json";
};

export default axiosApi;
