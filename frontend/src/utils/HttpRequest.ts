import localStorageService from "../helpers/localStorageService";
import axiosRequest from "./axios";

const baseURL = process.env.REACT_APP_API_URL;

const getHeader = <T>(header: T) => {
  const defaultHeaders = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    Authorization: "",
  };
  const token = localStorageService.get("jwt");

  if (token) defaultHeaders.Authorization = `${token}`;
  if (header) return { ...defaultHeaders, ...header };

  return defaultHeaders;
};

type Request<P, D, H> = {
  method: "POST" | "PUT" | "GET";
  url: string;
  params?: P;
  data?: D;
  header?: H;
};

const request = <P, D, H>({
  method,
  url,
  params,
  data,
  header,
}: Request<P, D, H>) => {
  return axiosRequest({
    baseURL,
    method,
    url,
    params,
    data,
    headers: getHeader(header),
  });
};

const httpRequest = {
  request,
};

export default httpRequest;
