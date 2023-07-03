import { createSlice } from "@reduxjs/toolkit";
interface IMenu {
  status: boolean;
  reload: number;
  taskId: string;
}
export const menuSlice = createSlice({
  name: "auth",
  initialState: {
    status: false,
    reload: 1,
    taskId: "",
  } as IMenu,
  reducers: {
    changeMenu(state) {
      state.status = !state.status;
    },
    reloadSidebar(state) {
      state.reload += 1;
    },
    setTaskIdCurrent(state, action) {
      state.taskId = action.payload;
    },
  },
});

export const { changeMenu, reloadSidebar, setTaskIdCurrent } =
  menuSlice.actions;
