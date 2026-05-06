import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import React, { useState, useEffect } from "react";
import "../assets/styles/layout.css";

function DashboardLayout() {
  const getIsMobile = () => window.innerWidth < 768;
  const [isMobile, setIsMobile] = useState(getIsMobile);
  const [sidebarOpen, setSidebarOpen] = useState(() => !getIsMobile());

  useEffect(() => {
    const handleResize = () => {
      const mobile = getIsMobile();
      setIsMobile(mobile);

      if (mobile) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isMobile && sidebarOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [isMobile, sidebarOpen]);

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
