import React, { useState } from "react";
import { Nav } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMapMarkedAlt,
  faChartPie,
  faBoxOpen,
  faTruck,
  faUsers,
  faFileInvoice,
  faCog,
  faChevronRight,
  faBars,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import "./Sidebar.css";
import logo from "../assets/logo2.png";

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleMobileLinkClick = () => {
    if (window.innerWidth < 992) {
      setIsMobileOpen(false);
    }
  };

  return (
    <>
      <div className="tn-mobile-navbar" dir="rtl">
        <div className="tn-mobile-brand">
          <div className="tn-logo-circle">
          <img src={logo} width="40px" alt="TransNetLogo" />
          </div>
          <h3 className="tn-mobile-brand-name m-0">TransNet</h3>
        </div>
        <button
          className="tn-mobile-burger"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
        >
          <FontAwesomeIcon icon={isMobileOpen ? faTimes : faBars} />
        </button>
      </div>

      <aside
        className={`tn-sidebar-bs ${isCollapsed ? "collapsed" : ""} ${
          isMobileOpen ? "mobile-dropdown-open" : ""
        }`}
        dir="rtl"
      >
        <button
          className="tn-collapse-btn d-none d-lg-flex"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <FontAwesomeIcon
            icon={faChevronRight}
            className={`tn-collapse-icon ${isCollapsed ? "rotated" : ""}`}
          />
        </button>

        <div className="tn-brand-section d-none d-lg-flex">
          <div className="tn-logo-circle">
            <img src={logo} width="50px" alt="TransNetLogo" />
          </div>
          <div className="tn-brand-text">
            <h3 className="tn-brand-name">TransNet</h3>
            <span className="tn-brand-sub">نظام إدارة الشحن</span>
          </div>
        </div>

        <Nav className="tn-nav-menu">
          <Nav.Link
            as={NavLink}
            to="/dashboard/tracking"
            className="tn-nav-item"
            onClick={handleMobileLinkClick}
          >
            <FontAwesomeIcon icon={faMapMarkedAlt} className="tn-icon" />
            <span className="tn-nav-text">تتبع الشحنة</span>
          </Nav.Link>

          <Nav.Link
            as={NavLink}
            to="/dashboard/statistics"
            className="tn-nav-item"
            onClick={handleMobileLinkClick}
          >
            <FontAwesomeIcon icon={faChartPie} className="tn-icon" />
            <span className="tn-nav-text">الإحصائيات</span>
          </Nav.Link>

          <Nav.Link
            as={NavLink}
            to="/dashboard/shipments"
            className="tn-nav-item"
            onClick={handleMobileLinkClick}
          >
            <FontAwesomeIcon icon={faBoxOpen} className="tn-icon" />
            <span className="tn-nav-text">الشحنات</span>
          </Nav.Link>

          <Nav.Link
            as={NavLink}
            to="/dashboard/drivers"
            className="tn-nav-item"
            onClick={handleMobileLinkClick}
          >
            <FontAwesomeIcon icon={faTruck} className="tn-icon" />
            <span className="tn-nav-text">السائقين</span>
          </Nav.Link>

          <Nav.Link
            as={NavLink}
            to="/dashboard/users"
            className="tn-nav-item"
            onClick={handleMobileLinkClick}
          >
            <FontAwesomeIcon icon={faUsers} className="tn-icon" />
            <span className="tn-nav-text">المستخدمين</span>
          </Nav.Link>

          <Nav.Link
            as={NavLink}
            to="/dashboard/reports"
            className="tn-nav-item"
            onClick={handleMobileLinkClick}
          >
            <FontAwesomeIcon icon={faFileInvoice} className="tn-icon" />
            <span className="tn-nav-text">التقارير</span>
          </Nav.Link>
        </Nav>

        <div className="tn-sidebar-footer">
          <Nav.Link
            as={NavLink}
            to="/dashboard/settings"
            className="tn-nav-item"
            onClick={handleMobileLinkClick}
          >
            <FontAwesomeIcon icon={faCog} className="tn-icon" />
            <span className="tn-nav-text">الإعدادات</span>
          </Nav.Link>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
