import { IProject } from "../../components/sidebar/Sidebar";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ProjectState {
  listProject: {
    projects: any;
  };
  isFetching: boolean;
  error: boolean;
}
export const projectSlice = createSlice({
  name: "project",
  initialState: {
    listProject: {
      projects: [],
    },
    isFetching: false,
    error: false,
  } as ProjectState,
  reducers: {
    getAllProjectStart: (state) => {
      state.isFetching = true;
    },
    getAllProjectSuccess: (
      state,
      action: PayloadAction<{ projects: IProject }>
    ) => {
      state.listProject = action.payload;

      state.isFetching = false;
      state.error = false;
    },
    getAllProjectError: (state) => {
      state.isFetching = false;
      state.error = true;
    },
  },
});

export const { getAllProjectStart, getAllProjectSuccess, getAllProjectError } =
  projectSlice.actions;
