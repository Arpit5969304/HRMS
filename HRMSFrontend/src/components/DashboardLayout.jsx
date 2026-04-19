import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import React, { useState, useEffect } from "react";
import "../assets/styles/layout.css";

function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);

      // auto close on mobile
      if (mobile) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} isMobile={isMobile} />

      {/* Overlay (only mobile) */}
      {isMobile && sidebarOpen && (
        <div className="overlay" onClick={toggleSidebar}></div>
      )}

      {/* Main */}
      <div
        className={`main ${
          sidebarOpen && !isMobile ? "" : "sidebar-closed"
        }`}
      >
        <Topbar toggleSidebar={toggleSidebar} />

        <div className="content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default DashboardLayout;