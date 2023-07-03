import { useSelector } from "react-redux";
import { Outlet } from "react-router";
import Sidebar from "../sidebar/Sidebar";

const Content = () => {
  const statusMenu = useSelector((state: any) => state.menu?.status);

  return (
    <div className="container">
      <Sidebar />
      <main
        className="container_content"
        style={{ left: statusMenu ? "30px" : "340px" }}
      >
        <Outlet />
      </main>
    </div>
  );
};

export default Content;
