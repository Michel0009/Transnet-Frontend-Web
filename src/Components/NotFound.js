import React from "react";
import { useNavigate } from "react-router-dom";
import { Container, Button } from "react-bootstrap";
import { HiArrowRight, HiHome, HiRefresh } from "react-icons/hi";
import "./NotFound.css";
import logo from "../assets/logo.png";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="nf-wrapper" dir="rtl">
      <div className="nf-blob nf-blob-blue"></div>
      <div className="nf-blob nf-blob-orange"></div>

      <Container className="nf-content-card">
        <div className="nf-glass-effect">
          <img src={logo} alt="TransNet Logo" className="nf-logo" />

          <h1 className="nf-error-code">404</h1>

          <div className="nf-divider"></div>

          <h2 className="nf-title">عذراً، الصفحة غير موجودة!</h2>
          <p className="nf-description">
            يبدو أن الرابط الذي تحاول الوصول إليه غير موجود أو تم نقله إلى مكان
            آخر. لا تقلق، يمكنك العودة دائماً إلى المسار الصحيح.
          </p>

          <div className="nf-actions">
            <Button
              className="nf-btn-primary"
              onClick={() => navigate("/dashboard")}
            >
              <HiHome className="ms-2" size={20} />
              العودة للرئيسية
            </Button>

            <Button
              className="nf-btn-outline"
              onClick={() => window.location.reload()}
            >
              <HiRefresh className="ms-2" size={20} />
              تحديث الصفحة
            </Button>
          </div>

          <button className="nf-back-link" onClick={() => navigate(-1)}>
            <HiArrowRight className="ms-1" />
            العودة للصفحة السابقة
          </button>
        </div>
      </Container>
    </div>
  );
};

export default NotFound;
