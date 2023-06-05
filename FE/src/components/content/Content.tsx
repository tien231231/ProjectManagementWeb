import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { Route, Routes } from "react-router";

import {
  ListProject,
  NotFoundPage,
  ProjectDetail,
  TaskDetail,
  TasksPage,
  UserDetails,
} from "../../pages";

const Content = () => {
  const statusMenu = useSelector((state: any) => state.menu?.status);

  return (
    <main
      className="container_content"
      style={{ left: statusMenu ? "30px" : "340px" }}
    >
      <Routes>
        <Route path="/" element={<ListProject />} />
        <Route path="/:projectId" element={<ProjectDetail />} />
        <Route path="/:projectId/:stagesId" element={<TasksPage />} />
        <Route path="/:projectId/:stagesId/:taskId" element={<TaskDetail />} />
        <Route path="/user/info" element={<UserDetails />} />
        <Route path="/notFoundPage" element={<NotFoundPage />} />
      </Routes>
    </main>
  );
};

export default Content;
