import { store } from "../redux/store";
import axios, { AxiosResponse } from "axios";

const axiosClient = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL,
  headers: {
    "content-type": "application/json",
  },
  //   paramsSerializer: params => queryString.stringify(params),
});
const getAccessToken = () => {
  const state = store.getState();
  return state.auth.userInfo.token;
};

axiosClient.interceptors.request.use(async (config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

axiosClient.interceptors.response.use(
  (response: AxiosResponse<any>) => {
    if (response && response.data) {
      return response.data;
    }

    return response;
  },
  (error) => {
    // Handle errors
    throw error;
  }
);

export default axiosClient;
