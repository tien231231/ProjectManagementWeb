import { requestLogin } from "../store";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserInfo {
  token: null | string;
  fullName: string;
  username: string;
  gender: string;
  phone: string;
  email: string;
  avatar: string;
  dob: null | Date;
}

interface UserState {
  userInfo: any;
  isLoading: boolean;
  error: any;
}

const initialState: UserState = {
  userInfo: {},
  isLoading: false,
  error: null,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setLogout: (state, action) => {
      for (let key in state.userInfo) {
        delete state.userInfo[key];
      }
    },
    updateUserInfo: (state, action) => {
      state.userInfo = { ...state.userInfo, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder.addCase(requestLogin.pending, (state, action) => {
      state.isLoading = true;
    });
    builder.addCase(requestLogin.fulfilled, (state, action) => {
      state.isLoading = false;
      state.userInfo = action.payload;
    });
    builder.addCase(requestLogin.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error;
    });
  },
});

export const { setLogout, updateUserInfo } = authSlice.actions;

export default authSlice.reducer;
