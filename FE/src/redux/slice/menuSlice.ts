import { createSlice } from "@reduxjs/toolkit";
interface IMenu {
  status: boolean;
  reload: number;
}
export const menuSlice = createSlice({
  name: "auth",
  initialState: {
    status: false,
    reload: 1,
  } as IMenu,
  reducers: {
    changeMenu(state) {
      state.status = !state.status;
    },
    reloadSidebar(state) {
      state.reload++;
    },
  },
});

export const { changeMenu, reloadSidebar } = menuSlice.actions;
