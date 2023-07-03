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
    addNewProject: (state, action: PayloadAction<{ projects: IProject }>) => {
      state.listProject.projects.unshift(action.payload);
    },
    editProject: (state, action) => {
      const index = state.listProject.projects.findIndex(
        (project: IProject) => project._id === action.payload._id
      );
      state.listProject.projects.splice(index, 1, action.payload);
    },
    deleteProject: (state, action) => {
      const index = state.listProject.projects.findIndex(
        (project: IProject) => project._id === action.payload.key
      );
      state.listProject.projects.splice(index, 1);
    },
  },
});

export const {
  getAllProjectStart,
  getAllProjectSuccess,
  getAllProjectError,
  addNewProject,
  editProject,
  deleteProject,
} = projectSlice.actions;
