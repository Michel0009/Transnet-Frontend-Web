import Sidebar from "../Components/Sidebar";
import { Outlet } from "react-router-dom"; 

const DashboardLayout = () => {
  return (
    <div style={{ display: "flex", minHeight: "100vh", direction: "rtl" }}>
      <Sidebar />

      <div style={{ flexGrow: 1, backgroundColor: "#f4f7fe" }}>
        <Outlet />
      </div>
    </div>
  );
};
export default DashboardLayout;