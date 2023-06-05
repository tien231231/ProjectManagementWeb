import { createSlice } from "@reduxjs/toolkit";
import _ from "lodash";

const initialState: any = {};

export const queryParamsSlice = createSlice({
  name: "queryParams",
  initialState,
  reducers: {
    setQuery: (state, action) => {
      return action.payload;
    },
    deleteQuery: (state, action) => {
      delete state[action.payload];
    },
  },
});

export const { setQuery, deleteQuery } = queryParamsSlice.actions;

export default queryParamsSlice.reducer;
