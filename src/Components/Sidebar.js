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
  faShippingFast,
  faTags,
  faChevronRight, // نستخدم سهم واحد وندوره بالـ CSS
} from "@fortawesome/free-solid-svg-icons";
import "./Sidebar.css";
import logo from "../assets/logo2.png";

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside
      className={`tn-sidebar-bs ${isCollapsed ? "collapsed" : ""}`}
      dir="rtl"
    >
      {/* زر الطي / الفتح */}
      <button
        className="tn-collapse-btn"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <FontAwesomeIcon
          icon={faChevronRight}
          className={`tn-collapse-icon ${isCollapsed ? "rotated" : ""}`}
        />
      </button>

      <div className="tn-brand-section">
        <div className="tn-logo-circle">
          <img src={logo} width="50px" alt="TransNetLogo" />
        </div>
        <div className="tn-brand-text">
          <h3 className="tn-brand-name">TransNet</h3>
          <span className="tn-brand-sub">نظام إدارة الشحن</span>
        </div>
      </div>

      <Nav className="flex-column tn-nav-menu">
        <Nav.Link as={NavLink} to="/dashboard/tracking" className="tn-nav-item">
          <FontAwesomeIcon icon={faMapMarkedAlt} className="tn-icon" />
          <span className="tn-nav-text">تتبع الشحنة</span>
        </Nav.Link>

        <Nav.Link
          as={NavLink}
          to="/dashboard/statistics"
          className="tn-nav-item"
        >
          <FontAwesomeIcon icon={faChartPie} className="tn-icon" />
          <span className="tn-nav-text">الإحصائيات</span>
        </Nav.Link>

        <Nav.Link
          as={NavLink}
          to="/dashboard/shipments"
          className="tn-nav-item"
        >
          <FontAwesomeIcon icon={faBoxOpen} className="tn-icon" />
          <span className="tn-nav-text">الشحنات</span>
        </Nav.Link>

        <Nav.Link as={NavLink} to="/dashboard/drivers" className="tn-nav-item">
          <FontAwesomeIcon icon={faTruck} className="tn-icon" />
          <span className="tn-nav-text">السائقين</span>
        </Nav.Link>

        <Nav.Link as={NavLink} to="/dashboard/vehicles" className="tn-nav-item">
          <FontAwesomeIcon icon={faShippingFast} className="tn-icon" />
          <span className="tn-nav-text">المركبات</span>
        </Nav.Link>

          <Nav.Link as={NavLink} to="/dashboard/pricing" className="tn-nav-item">
          <FontAwesomeIcon icon={faTags} className="tn-icon" />
          <span className="tn-nav-text">التسعيرات</span>
        </Nav.Link>

        <Nav.Link as={NavLink} to="/dashboard/users" className="tn-nav-item">
          <FontAwesomeIcon icon={faUsers} className="tn-icon" />
          <span className="tn-nav-text">المستخدمين</span>
        </Nav.Link>

        <Nav.Link as={NavLink} to="/dashboard/reports" className="tn-nav-item">
          <FontAwesomeIcon icon={faFileInvoice} className="tn-icon" />
          <span className="tn-nav-text">التقارير</span>
        </Nav.Link>
      </Nav>

      <div className="tn-sidebar-footer">
        <Nav.Link as={NavLink} to="/dashboard/settings" className="tn-nav-item">
          <FontAwesomeIcon icon={faCog} className="tn-icon" />
          <span className="tn-nav-text">الإعدادات</span>
        </Nav.Link>
      </div>
    </aside>
  );
};

export default Sidebar;
