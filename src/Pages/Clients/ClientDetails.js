import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Row, Col, Button, Spinner } from "react-bootstrap";
import {
  ArrowRight,
  AlertTriangle,
  Phone,
  History,
  Clock,
  ShieldCheck,
  Ban,
  Mail,
  Info,
  Hash,
  Calendar,
} from "lucide-react";
import { endpoints } from "../../Api/Endpoints";
import api from "../../Api/Api";
import { toast } from "react-toastify";
import { handleAxiosError } from "../../Utils/ErrorHandler";
import WarningModal from "../../Components/WarningModal";
import "./ClientDetails.css";
import BlockModal from "../../Components/BlockModal";
import UnblockModal from "../../Components/UnblockModal";
import { FaUnlock } from "react-icons/fa";
import { formatBentoDate } from "../../Utils/dateFormatter";
import { useAuth } from "../../Context/AuthContext";
const ClientDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role } = useAuth();
  const [client, setClient] = useState(null);
  const [warnings, setWarnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showUnblockModal, setShowUnblockModal] = useState(false);
  const fetchClientDetails = async () => {
    try {
      const Res = await api.get(endpoints.clients.details(id));
      setClient(Res.data);
      return true;
    } catch (error) {
      if (
        error.response?.status === 404 &&
        error.response.data.message === "العميل غير موجود"
      ) {
        navigate("/not-found", { replace: true });
      } else {
        toast.error(handleAxiosError(error));
      }
      return false;
    }
  };

  const fetchClientWarnings = async () => {
    try {
      const warningsRes = await api.get(endpoints.reports.getWarnings(id));
      setWarnings(warningsRes.data || []);
    } catch (error) {
      toast.error(handleAxiosError(error));
    }
  };
  const loadAllData = async () => {
    setLoading(true);
    const hasClientDetails = await fetchClientDetails();

    if (hasClientDetails) {
      await fetchClientWarnings();
    }
    setLoading(false);
  };

  useEffect(() => {
    if (id) {
      loadAllData();
    }
    // eslint-disable-next-line
  }, [id]);

  if (loading) {
    return (
      <div className="tn-dd-loader-wrapper d-flex align-items-center justify-content-center vh-100">
        <Spinner animation="grow" className="tn-cd-text-orange" />
        <span className="ms-3 fw-bold text-muted">
          جاري تحميل ملف العميل...
        </span>
      </div>
    );
  }
  return (
    <div className="tn-cd-page pt-5" dir="rtl">
      <Container fluid="lg" className="tn-cd-content px-md-4">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-5">
          <div>
            <h1 className="tn-cd-title mb-0 display-5">
              {client.first_name} {client.last_name}
            </h1>
            <p className="tn-cd-text-muted mt-2 mb-0">تفاصيل العميل</p>
          </div>

          <div className="d-flex flex-wrap gap-3">
            <Button
              className="tn-cd-btn-glass px-4 py-2 d-flex align-items-center gap-2"
              onClick={() => navigate(-1)}
            >
              <ArrowRight size={18} /> تراجع
            </Button>
            <Button
              className="tn-cd-btn-primary px-4 py-2 d-flex align-items-center gap-2"
              onClick={() => setShowWarningModal(true)}
            >
              <AlertTriangle size={18} /> إرسال إنذار
            </Button>
            {role === "admin" &&
              (client.status === "محظور" ? (
                <Button
                  className="tn-cd-btn-success px-4 py-2 d-flex align-items-center gap-2"
                  onClick={() => setShowUnblockModal(true)}
                >
                  <FaUnlock /> فك الحظر
                </Button>
              ) : (
                <Button
                  className="tn-cd-btn-danger px-4 py-2 d-flex align-items-center gap-2"
                  onClick={() => setShowBlockModal(true)}
                >
                  <Ban size={18} /> حظر العميل
                </Button>
              ))}
          </div>
        </div>

        {/* Bento Grid Stats */}
        <Row className="g-4 mb-5">
          <Col xs={12} lg={4}>
            <div className="tn-cd-bento-card">
              <div className="d-flex align-items-center gap-2 mb-4">
                <div
                  className="tn-cd-icon-glow tn-cd-icon-light"
                  style={{ width: "40px", height: "40px" }}
                >
                  <Phone size={18} />
                </div>
                <span className="tn-cd-text-muted fw-bold text-uppercase tracking-wider">
                  بيانات الاتصال
                </span>
              </div>
              <div className="d-flex flex-column gap-3">
                <div className="d-flex align-items-center gap-2">
                  <Mail size={16} className="tn-cd-text-muted" />
                  <span className="tn-cd-title fw-bold">{client.email}</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <Phone size={16} className="tn-cd-text-muted" />
                  <span className="tn-cd-title fw-bold" dir="ltr">
                    {client.phone_number}
                  </span>
                </div>
              </div>
            </div>
          </Col>

          <Col xs={12} lg={4}>
            <div className="tn-cd-bento-card">
              <div className="d-flex align-items-center gap-2 mb-4">
                <div
                  className="tn-cd-icon-glow tn-cd-icon-light"
                  style={{ width: "40px", height: "40px" }}
                >
                  <Info size={18} />
                </div>
                <span className="tn-cd-text-muted fw-bold text-uppercase tracking-wider">
                  بيانات الحساب
                </span>
              </div>
              <div className="d-flex flex-column gap-3">
                {/* الحالة */}
                <div className="d-flex align-items-center justify-content-between">
                  <span className="tn-cd-text-muted fw-medium">الحالة:</span>
                  <span
                    className={`tn-cd-status-badge ${client.status === "محظور" ? "tn-cd-status-blocked" : "tn-cd-status-active"}`}
                  >
                    {client.status || "نشط"}
                  </span>
                </div>
                {/* رقم المعرف */}
                <div className="d-flex align-items-center justify-content-between">
                  <span className="tn-cd-text-muted fw-medium">
                    رقم المعرف:
                  </span>
                  <div
                    className="d-flex align-items-center gap-1 tn-cd-title fw-bold"
                    dir="ltr"
                  >
                    <Hash size={14} /> {client.user_number}
                  </div>
                </div>
                {/* تاريخ الانضمام - المضاف حديثاً */}
                <div className="d-flex align-items-center justify-content-between">
                  <span className="tn-cd-text-muted fw-medium">
                    تاريخ الانضمام:
                  </span>
                  <div
                    className="d-flex align-items-center gap-2 tn-cd-title fw-bold"
                    dir="ltr"
                  >
                    <Calendar size={14} className="tn-cd-text-muted" />
                    {formatBentoDate(client.created_at, true)}
                  </div>
                </div>
              </div>
            </div>
          </Col>

          <Col xs={12} lg={4}>
            <div className="tn-cd-bento-card">
              <div className="d-flex align-items-center gap-2 mb-4">
                <div
                  className="tn-cd-icon-glow tn-cd-icon-orange"
                  style={{ width: "40px", height: "40px" }}
                >
                  <AlertTriangle size={18} />
                </div>
                <span className="tn-cd-text-muted fw-bold text-uppercase tracking-wider">
                  سجل الإنذارات
                </span>
              </div>
              <div className="d-flex align-items-center gap-3">
                <div className="tn-cd-stat-number">{warnings.length}</div>
                <span className="tn-cd-text-muted fw-medium">مخالفة مسجلة</span>
              </div>
            </div>
          </Col>
        </Row>

        {/* Timeline Section */}
        <div className="mt-5">
          <div className="d-flex align-items-center gap-3 mb-4">
            <div
              className="tn-cd-icon-glow tn-cd-icon-orange"
              style={{ width: "45px", height: "45px" }}
            >
              <History size={22} />
            </div>
            <h3 className="tn-cd-title mb-0">المسار الزمني للإنذارات</h3>
          </div>

          {warnings.length > 0 ? (
            <div className="tn-cd-timeline ms-2">
              {warnings.map((warning, index) => (
                <div key={warning.id || index} className="tn-cd-timeline-item">
                  <div className="d-flex flex-column gap-3">
                    <div
                      className="tn-cd-timeline-date align-self-start"
                      dir="ltr"
                    >
                      <Clock size={14} />
                      {formatBentoDate(warning.created_at, true)}
                    </div>
                    <p className="mb-0 tn-cd-title fw-medium lh-lg fs-6">
                      {warning.warning_text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              className="tn-cd-bento-card p-5 text-center mt-4 border-dashed"
              style={{ borderStyle: "dashed", borderColor: "#cbd5e1" }}
            >
              <div
                className="tn-cd-icon-glow mx-auto mb-4"
                style={{
                  background: "rgba(16, 185, 129, 0.1)",
                  color: "#059669",
                  width: "70px",
                  height: "70px",
                }}
              >
                <ShieldCheck size={36} />
              </div>
              <h4 className="tn-cd-title mb-2">السجل نظيف</h4>
              <p className="tn-cd-text-muted mb-0 fs-6">
                لم يتم رصد أي إنذارات مسجلة لهذا العميل.
              </p>
            </div>
          )}
        </div>
      </Container>
      <WarningModal
        show={showWarningModal}
        onHide={() => setShowWarningModal(false)}
        userId={id}
        userName={`${client.first_name} ${client.last_name}`}
        onSuccess={fetchClientWarnings}
      />
      <BlockModal
        show={showBlockModal}
        onHide={() => setShowBlockModal(false)}
        userId={id}
        onSuccess={loadAllData}
      />
      <UnblockModal
        show={showUnblockModal}
        onHide={() => {
          setShowUnblockModal(false);
        }}
        userId={id}
        onSuccess={loadAllData}
      />
    </div>
  );
};
export default ClientDetails;
