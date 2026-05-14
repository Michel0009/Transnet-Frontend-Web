import React from "react";
import Sidebar from "../Components/Sidebar";
import { Outlet } from "react-router-dom";
import "./DashboardLayout.css";

const DashboardLayout = () => {
  return (
    <div className="tn-dashboard-layout" style={{ direction: "rtl" }}>
      <Sidebar />

      <div className="tn-dashboard-content">
        <Outlet />
      </div>
    </div>
  );
};

export default DashboardLayout;
