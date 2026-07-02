import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  MapPin,
  Truck,
  User,
  CreditCard,
  ShieldCheck,
  Box,
  Map,
  ArrowRight,
  ArrowUpRight,
  Copy,
  Check,
  Clock,
  Activity,
  Layers,
  ArrowLeft,
} from "lucide-react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Badge,
} from "react-bootstrap";
import "./ShipmentDetails.css";
import { endpoints } from "../../Api/Endpoints";
import { toast } from "react-toastify";
import { handleAxiosError } from "../../Utils/ErrorHandler";
import api from "../../Api/Api";
import { formatBentoDate } from "../../Utils/dateFormatter";

const ShipmentDetails = () => {
  const { id } = useParams();
  const [shipmentData, setShipmentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchShipment = async () => {
      try {
        setLoading(true);
        const response = await api.get(endpoints.shipments.details(id));
        setShipmentData(response.data);
      } catch (err) {
        if (err?.response?.status === 404) {
          navigate("not-found", { replace: true });
        } else {
          toast.error(handleAxiosError(err));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchShipment();
  }, [id, navigate]);

  const handleCopyNumber = (e, num) => {
    e.stopPropagation();
    navigator.clipboard.writeText(num);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const getStatusConfig = (status) => {
    switch (status) {
      case "جارية":
        return { width: "0%", className: "" };

      case "قيد التوصيل":
        return { width: "50%", className: "" };

      case "مستلمة":
        return { width: "100%", className: "is-success" };

      case "غير مستلمة":
        return { width: "100%", className: "is-failed" };

      default:
        return { width: "0%", className: "" };
    }
  };
  const statusStateMap = {
    جارية: "state-current",
    "قيد التوصيل": "state-transit",
    مستلمة: "state-delivered",
    "غير مستلمة": "state-failed",
  };
  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center vh-100">
        <Spinner animation="grow" className="tn-sd-text-orange" />
        <span className="ms-3 fw-bold text-muted">
          جاري تحميل ملف الشحنة...
        </span>
      </div>
    );
  }

  const { shipment, driver, client, live_tracking } = shipmentData;
  const pipelineConfig = getStatusConfig(shipment.status);
  const currentStatusClass = statusStateMap[shipment.status] || "state-idle";
  return (
    <div className="tn-gt-dashboard-wrapper" dir="rtl">
      <div className="tn-gt-grid-backdrop"></div>

      <Container fluid className="px-0 position-relative z-1">
        <header className="tn-gt-main-header d-flex flex-column flex-md-row justify-content-between align-items-start gap-3">
          <div className="tn-gt-header-right d-flex align-items-start gap-3">
            <Button
              className="tn-gt-action-back-btn variant-premium-blur"
              onClick={() => navigate(-1)}
            >
              <ArrowRight size={16} />
              <span>تراجع</span>
            </Button>

            <div className="tn-gt-headline-group">
              <div className="tn-gt-title-wrapper d-flex align-items-center gap-2">
                <h1 className="tn-gt-page-title">بيانات الشحنة رقم</h1>
                <Badge
                  bg="none"
                  className="tn-gt-copy-badge"
                  onClick={(e) => handleCopyNumber(e, shipment.shipment_number)}
                >
                  <span>#{shipment.shipment_number}</span>
                  {copied ? (
                    <Check size={12} className="text-success ms-1" />
                  ) : (
                    <Copy size={12} className="ms-1" />
                  )}
                </Badge>
              </div>
              <p className="tn-gt-page-subtitle">
                تاريخ انشاء الشحنة:
                <span className="ms-1 text-indigo-accent" dir="ltr">
                  {formatBentoDate(shipment.created_at, true)}
                </span>
              </p>
            </div>
          </div>

          <div className={`tn-gt-status-pill ${currentStatusClass}`}>
            <div className="tn-gt-pulse-ring">
              <span className="tn-gt-pulse-dot"></span>{" "}
            </div>
            <span className="tn-gt-status-text">{shipment.status}</span>
          </div>
        </header>

        <Row className="g-4 tn-gt-bento-layout">
          <Col lg={4} md={6} className="d-flex">
            <Card className="tn-gt-bento-item tn-gt-clickable-card w-100 border-0">
              <Card.Body
                className="tn-gt-card-internal"
                onClick={() => navigate(`/clients/${client.id}`)}
                role="button"
                tabIndex={0}
              >
                <div className="tn-gt-item-header d-flex align-items-center gap-3">
                  <div className="tn-gt-badge-icon variant-cyber-blue">
                    <User size={18} />
                  </div>
                  <div className="tn-gt-header-meta">
                    <h2>حساب العميل</h2>
                  </div>
                  <div className="tn-gt-card-arrow ms-auto">
                    <ArrowLeft size={16} />
                  </div>
                </div>

                <div className="tn-gt-profile-body mt-3">
                  <div className="tn-gt-data-row">
                    <span className="tn-gt-label">الاسم الكامل</span>
                    <span className="tn-gt-value text-indigo-solid">
                      {client.first_name} {client.last_name}
                    </span>
                  </div>
                  <div className="tn-gt-data-row">
                    <span className="tn-gt-label">رقم الهاتف</span>
                    <span className="tn-gt-value" dir="ltr">
                      {client.phone_number}
                    </span>
                  </div>
                  <div
                    className="tn-gt-data-row no-border"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span className="tn-gt-label">رقم العميل</span>
                    <Badge
                      bg="none"
                      className="tn-gt-copy-badge"
                      onClick={(e) => handleCopyNumber(e, client.user_number)}
                    >
                      <span>#{client.user_number}</span>
                      {copied ? (
                        <Check size={12} className="text-success ms-1" />
                      ) : (
                        <Copy size={12} className="ms-1" />
                      )}
                    </Badge>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4} md={6} className="d-flex">
            <Card className="tn-gt-bento-item tn-gt-clickable-card w-100 border-0">
              <Card.Body
                className="tn-gt-card-internal"
                onClick={() => navigate(`/drivers/${driver.id}`)}
                role="button"
                tabIndex={0}
              >
                <div className="tn-gt-item-header d-flex align-items-center gap-3">
                  <div className="tn-gt-badge-icon variant-cyber-emerald">
                    <Truck size={18} />
                  </div>
                  <div className="tn-gt-header-meta">
                    <h2>السائق المكلف بالشحنة</h2>
                  </div>
                  <div className="tn-gt-card-arrow ms-auto">
                    <ArrowLeft size={16} />
                  </div>
                </div>

                <div className="tn-gt-profile-body mt-3">
                  <div className="tn-gt-data-row">
                    <span className="tn-gt-label">الاسم الكامل</span>
                    <span className="tn-gt-value text-indigo-solid">
                      {driver.first_name} {driver.last_name}
                    </span>
                  </div>
                  <div className="tn-gt-data-row">
                    <span className="tn-gt-label">رقم الهاتف</span>
                    <span className="tn-gt-value" dir="ltr">
                      {driver.phone_number}
                    </span>
                  </div>
                  <div
                    className="tn-gt-data-row no-border"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span className="tn-gt-label">رقم السائق</span>
                    <Badge
                      bg="none"
                      className="tn-gt-copy-badge"
                      onClick={(e) => handleCopyNumber(e, driver.user_number)}
                    >
                      <span>#{driver.user_number}</span>
                      {copied ? (
                        <Check size={12} className="text-success ms-1" />
                      ) : (
                        <Copy size={12} className="ms-1" />
                      )}
                    </Badge>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4} md={12} className="d-flex">
            <Card className="tn-gt-bento-item w-100 border-0 variant-aurora-card d-flex flex-column">
              <Card.Body className="tn-gt-card-internal d-flex flex-column flex-grow-1">
                <div className="tn-gt-item-header d-flex align-items-center gap-3">
                  <div className="tn-gt-badge-icon variant-cyber-royal">
                    <CreditCard size={18} />
                  </div>
                  <div className="tn-gt-header-meta">
                    <h2>الوضع المالي والمحددات الزمنية</h2>
                  </div>
                </div>

                <div className="tn-gt-financial-body d-flex flex-column justify-content-between flex-grow-1">
                  <div className="tn-gt-price-hero">
                    <div className="tn-gt-currency-label">
                      تكلفة الشحن الكلية
                    </div>
                    <div className="tn-gt-big-numeric">
                      <span className="tn-gt-num-format">
                        {shipment.price.toLocaleString()}
                      </span>
                      <span className="tn-gt-curr-tag">ل.س</span>
                    </div>
                  </div>

                  <div className="tn-gt-status-row my-3">
                    <span
                      className={`tn-gt-finance-tag ${shipment.paid ? "is-cleared" : "is-pending"}`}
                    >
                      {shipment.paid
                        ? "تم تصفية القيمة النقدية"
                        : "قيد المراجعة المالية والتحصيل"}
                    </span>
                  </div>
                  <div className="tn-gt-sla-deadline">
                    <Clock size={14} />
                    <span>الحد الأقصى للتسليم:</span>
                    <strong dir="ltr" className="ms-auto text-deep-luxury">
                      {shipment.delivery_deadline}
                    </strong>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={7} md={12} className="d-flex">
            <Card className="tn-gt-bento-item w-100 border-0">
              <Card.Body className="tn-gt-card-internal">
                <div className="tn-gt-item-header d-flex align-items-center gap-3">
                  <div className="tn-gt-badge-icon variant-cyber-iris">
                    <Activity size={18} />
                  </div>
                  <div className="tn-gt-header-meta">
                    <h2>المسار الجغرافي للتتبع</h2>
                  </div>
                </div>

                <div className="tn-gt-route-visualizer d-flex align-items-center justify-content-between gap-3">
                  <div className="tn-gt-station-block d-flex align-items-center gap-2">
                    <div className="tn-gt-station-node origin">
                      <MapPin size={14} />
                    </div>
                    <div className="tn-gt-station-info">
                      <span className="tn-gt-node-caption">نقطة الانطلاق</span>
                      <h3>محافظة {shipment.start_governorate}</h3>
                    </div>
                  </div>
                  <div className="tn-gt-vector-pipeline flex-grow-1 position-relative">
                    <div
                      className={`tn-gt-pipeline-fill animated-flow ${pipelineConfig.className}`}
                      style={{ width: pipelineConfig.width }}
                    ></div>
                  </div>

                  <div className="tn-gt-station-block d-flex align-items-center gap-2">
                    <div className="tn-gt-station-node destination">
                      <MapPin size={14} />
                    </div>
                    <div className="tn-gt-station-info">
                      <span className="tn-gt-node-caption">منطقة التوصيل</span>
                      <h3>محافظة {shipment.end_governorate}</h3>
                    </div>
                  </div>
                </div>

                {shipment.status === "قيد التوصيل" &&
                  live_tracking &&
                  (live_tracking.error ? (
                    <div className="tn-gt-telemetry-cell text-center mb-4 p-3 d-flex align-items-center justify-content-center gap-2 border border-dashed border-danger rounded">
                      <span className="tn-gt-pulse-dot bg-danger m-0"></span>
                      <span className="text-danger fw-medium small">
                        {live_tracking.error}
                      </span>
                    </div>
                  ) : (
                    <Row className="g-3 tn-gt-telemetry-grid mb-4">
                      <Col xs={6}>
                        <div className="tn-gt-telemetry-cell">
                          <span className="tn-gt-cell-label">
                            المسافة المتبقية
                          </span>
                          <div className="tn-gt-cell-value">
                            <strong>
                              {live_tracking.remaining_distance_km}
                            </strong>
                            <small>كيلومتر</small>
                          </div>
                        </div>
                      </Col>
                      <Col xs={6}>
                        <div className="tn-gt-telemetry-cell">
                          <span className="tn-gt-cell-label">
                            زمن الوصول المتوقع
                          </span>
                          <div className="tn-gt-cell-value">
                            <strong>
                              {live_tracking.remaining_duration_mins}
                            </strong>{" "}
                            <small>دقيقة</small>
                          </div>
                        </div>
                      </Col>
                    </Row>
                  ))}

                <Button
                  className="tn-gt-trigger-map-action variant-action-neon-luxury border-0 w-100"
                  onClick={() =>
                    navigate(`/dashboard/tracking/${shipment.shipment_number}`)
                  }
                >
                  <Map size={16} />
                  <span>ولوج فوري للنظام الخرائطي المباشر والتتبع الحي</span>
                  <ArrowUpRight size={14} className="tn-gt-arrow-link" />
                </Button>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={5} md={12} className="d-flex">
            <Card className="tn-gt-bento-item w-100 border-0">
              <Card.Body className="tn-gt-card-internal d-flex flex-column justify-content-between">
                <div className="tn-gt-item-header d-flex align-items-center gap-3">
                  <div className="tn-gt-badge-icon variant-cyber-orchid">
                    <Layers size={18} />
                  </div>
                  <div className="tn-gt-header-meta">
                    <h2>تفاصيل وأبعاد الشحنة</h2>
                  </div>
                </div>

                <Row className="g-3 tn-gt-volumetric-grid mb-4">
                  <Col xs={4}>
                    <div className="tn-gt-spec-brick text-center">
                      <div className="tn-gt-brick-top justify-content-center">
                        <Box size={14} />
                        <span>نوع الشحنة</span>
                      </div>
                      <h4>{shipment.object}</h4>
                    </div>
                  </Col>
                  <Col xs={4}>
                    <div className="tn-gt-spec-brick text-center">
                      <div className="tn-gt-brick-top justify-content-center">
                        <span>الوزن</span>
                      </div>
                      <h4>
                        {shipment.weight} <small>كغ</small>
                      </h4>
                    </div>
                  </Col>
                  <Col xs={4}>
                    <div className="tn-gt-spec-brick text-center">
                      <div className="tn-gt-brick-top justify-content-center">
                        <span>الأبعاد (طول×عرض×ارتفاع)</span>
                      </div>
                      <div
                        dir="ltr"
                        className="d-flex align-items-center justify-content-center gap-1 font-monospace tn-gt-dims"
                        title={`الطول: ${Number(shipment.length)} | العرض: ${Number(shipment.width)} | الارتفاع: ${Number(shipment.height)}`}
                      >
                        {/* الطول */}
                        <div className="d-flex flex-column align-items-center">
                          <h4 className="m-0 fw-bold">
                            {Number(shipment.length)}
                          </h4>
                          <small
                            className="text-muted"
                            style={{ fontSize: "0.7rem", marginTop: "2px" }}
                          >
                            ط
                          </small>
                        </div>

                        {/* فاصل */}
                        <span
                          className="text-muted px-1 align-self-start"
                          style={{ transform: "translateY(2px)" }}
                        >
                          ×
                        </span>

                        {/* العرض */}
                        <div className="d-flex flex-column align-items-center">
                          <h4 className="m-0 fw-bold">
                            {Number(shipment.width)}
                          </h4>
                          <small
                            className="text-muted"
                            style={{ fontSize: "0.7rem", marginTop: "2px" }}
                          >
                            ع
                          </small>
                        </div>

                        {/* فاصل */}
                        <span
                          className="text-muted px-1 align-self-start"
                          style={{ transform: "translateY(2px)" }}
                        >
                          ×
                        </span>

                        {/* الارتفاع */}
                        <div className="d-flex flex-column align-items-center">
                          <h4 className="m-0 fw-bold">
                            {Number(shipment.height)}
                          </h4>
                          <small
                            className="text-muted"
                            style={{ fontSize: "0.7rem", marginTop: "2px" }}
                          >
                            ا
                          </small>
                        </div>
                      </div>
                    </div>
                  </Col>
                </Row>

                <div className="tn-gt-insurance-compliance-banner mt-auto">
                  {shipment.insurance ? (
                    <div className="tn-gt-insurance-status is-protected">
                      <ShieldCheck size={20} className="flex-shrink-0" />
                      <div className="tn-gt-ins-text">
                        <h5>التأمين: مفعل</h5>
                        <p>
                          هذه الشحنة مغطاة بالكامل ضد مخاطر الشحن أو الفقدان
                          والضرر.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="tn-gt-insurance-status is-exposed">
                      <div className="tn-gt-ins-text">
                        <h5>التأمين: غير مدرج</h5>
                        <p>لم يتم تفعيل خيار التأمين المالي على هذه الشحنة.</p>
                      </div>
                    </div>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ShipmentDetails;
