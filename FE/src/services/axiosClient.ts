import { useAppDispatch } from "../redux/hook";
import { setLogout } from "../redux/slice/authSlice";
import { store } from "../redux/store";
import axios, { AxiosResponse } from "axios";
import jwt_decode from "jwt-decode";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";

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

const logoutUser = async () => {
  const state = store.getState();
  state.auth.userInfo = {};
  window.location.href = "/";
  return {};
};

axiosClient.interceptors.request.use(async (config) => {
  const token = getAccessToken();

  let date = new Date();
  const decodedToken: any = jwt_decode(token);

  if (decodedToken.exp < date.getTime() / 1000) {
    // cái này anh sửa nha. hiện tại thì vẫn logout được mà làm này chống cháy thôi. anh coi có cách nào hay hơn thì làm
    await logoutUser();
    console.log("log out");
  }
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
