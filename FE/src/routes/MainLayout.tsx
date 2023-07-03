import Content from "../components/content/Content";
import Header from "../components/header/Header";
import Sidebar from "../components/sidebar/Sidebar";
import Dashboard from "../pages/dashboardPage/Dashboard";
import React from "react";
import { Route, Routes } from "react-router";
import {
  ListProject,
  NotFoundPage,
  ProjectDetail,
  TaskDetail,
  TasksPage,
  UserDetails,
} from "../pages";

const MainLayout: React.FC = () => {
  return (
    <div className="main-layout">
      <Header />
      <div className="container">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/project" element={<Content />}>
            <Route path="user/info" element={<UserDetails />} />
            <Route path=":projectId" element={<ProjectDetail />} />
            <Route path=":projectId/:stagesId" element={<TasksPage />} />
            <Route
              path=":projectId/:stagesId/:taskId"
              element={<TaskDetail />}
            />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </div>
  );
};

export default MainLayout;
