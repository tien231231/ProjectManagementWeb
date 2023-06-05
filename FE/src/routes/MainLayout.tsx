import Content from "../components/content/Content";
import Header from "../components/header/Header";
import Sidebar from "../components/sidebar/Sidebar";
import React from "react";

const MainLayout: React.FC = () => {
  return (
    <div className="main-layout">
      <Header />
      <div className="container">
        <Sidebar />
        <Content />
      </div>
    </div>
  );
};

export default MainLayout;
