import { useReducer } from "./useReducer";
import { useAppSelector } from "../redux/hook";
import axios from "axios";
import { useEffect } from "react";

function axiosReducer(state: any, action: any) {
  switch (action.type) {
    case "axiosAPI/request":
      return { ...state, isLoading: action.isLoading };
    case "axiosAPI/success":
    case "axiosAPI/error":
      return {
        ...state,
        isLoading: action.isLoading,
        error: action.error,
        responseData: action.responseData,
      };
    default:
      return state;
  }
}

export const useAxios = (
  method: string,
  url: string,
  devDependencies: any = [],
  body?: any
) => {
  const token: string = useAppSelector(
    (state: any) => state.auth.userInfo.token
  );
  const [state, dispatch] = useReducer(axiosReducer, {
    responseData: [],
    isLoading: false,
    error: null,
  });

  useEffect(() => {
    (async () => {
      dispatch({
        type: "axiosAPI/request",
        isLoading: true,
      });
      try {
        const response = await axios({
          method: method,
          url: `${process.env.REACT_APP_BACKEND_URL}${url}`,
          headers: { Authorization: `Bearer ${token}` },
          ...(body ? { data: body } : {}),
        });
        console.log("rerender");
        dispatch({
          type: "axiosAPI/success",
          isLoading: false,
          error: null,
          responseData: response.data,
        });
      } catch (err) {
        dispatch({
          type: "axiosAPI/error",
          isLoading: false,
          error: err,
          responseData: [],
        });
      }
    })();
  }, [...devDependencies]);

  return {
    responseData: state.responseData,
    isLoading: state.isLoading,
    error: state.error,
  };
};
