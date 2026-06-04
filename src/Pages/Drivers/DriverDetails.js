import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  Table,
  Spinner,
  Button,
  Pagination,
  ProgressBar,
  Tabs,
  Tab,
  OverlayTrigger,
  Popover,
  Tooltip,
  Alert,
} from "react-bootstrap";
import {
  FaUser,
  FaCar,
  FaMapMarkerAlt,
  FaFileAlt,
  FaStar,
  FaPhone,
  FaEnvelope,
  FaBoxOpen,
  FaIdCard,
  FaFilePdf,
  FaImage,
  FaMedal,
  FaInfoCircle,
  FaCalendarAlt,
  FaRoute,
  FaChartLine,
  FaDownload,
  FaUnlock,
  FaBan,
  FaSync,
  FaArrowRight,
  FaExclamationTriangle,
  FaExclamationCircle,
  FaRegClock,
  FaRegCheckCircle,
} from "react-icons/fa";
import api from "../../Api/Api";
import "./DriverDetails.css";
import ShipmentSkeleton from "../../Components/ShipmentSkeleton";
import { endpoints } from "../../Api/Endpoints";
import { toast } from "react-toastify";
import { handleAxiosError } from "../../Utils/ErrorHandler";
import BlockModal from "../../Components/BlockModal";
import UnblockModal from "../../Components/UnblockModal";
import ActivateModal from "../../Components/ActivateModal";
import TaxModal from "../../Components/TaxModal";
import WarningModal from "../../Components/WarningModal";
import { AlertTriangle } from "lucide-react";
import { formatBentoDate } from "../../Utils/dateFormatter";

const DriverDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [driverImage, setDriverImage] = useState("/default-avatar.jpg");
  const [driverExists, setDriverExists] = useState(false);
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [showTaxModal, setShowTaxModal] = useState(false);
  const [warnings, setWarnings] = useState([]);
  const [loadingWarnings, setLoadingWarnings] = useState(false);
  const [shipmentsData, setShipmentsData] = useState({
    data: [],
    current_page: 1,
    last_page: 1,
    total: 0,
  });

  const [loading, setLoading] = useState(true);
  const [shipmentsLoading, setShipmentsLoading] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showUnblockModal, setShowUnblockModal] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  useEffect(() => {
    if (data?.user?.status === "محظور") {
      setIsBlocked(true);
    } else {
      setIsBlocked(false);
    }
  }, [data]);
  const isSubscriptionDisabled =
    data?.user?.status === "محظور" || data?.user?.status === "فعال";
  const getTooltipMessage = () => {
    if (!user) return "جاري تحميل بيانات السائق...";
    if (user.status === "فعال")
      return "الحساب نشط بالفعل، لا حاجة لتجديد الاشتراك حالياً.";
    if (user.status === "محظور")
      return "الحساب محظور حالياً، يجب فك الحظر أولاً لتتمكن من تجديد الاشتراك.";
    return "تجديد اشتراك السائق";
  };
  const fetchDriverDetails = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(endpoints.drivers.details(id));
      setData(response.data);
      setDriverExists(true);
    } catch (err) {
      if (
        err.response?.status === 422 &&
        err.response?.data?.message === "السائق المطلوب غير موجود في النظام"
      ) {
        navigate("/not-found", { replace: true });
      } else {
        toast.error(handleAxiosError(err));
      }
      setDriverExists(false);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line
  }, [id]);

  const fetchDriverImage = useCallback(async () => {
    if (!driverExists) return;
    try {
      const response = await api.get(endpoints.drivers.driverImage(id), {
        responseType: "blob",
      });
      const imageUrl = URL.createObjectURL(response.data);
      setDriverImage(imageUrl);
    } catch (err) {
      toast.error(handleAxiosError(err));
    }
  }, [id, driverExists]);

  const fetchShipments = useCallback(
    async (page = 1) => {
      if (!driverExists) return;
      setShipmentsLoading(true);
      try {
        const response = await api.get(
          endpoints.drivers.driverShipments(id, page),
        );
        setShipmentsData(response.data);
      } catch (err) {
        toast.error(handleAxiosError(err));
      } finally {
        setShipmentsLoading(false);
      }
    },
    [id, driverExists],
  );
  const fetchWarnings = useCallback(async () => {
    if (!driverExists) return;
    try {
      setLoadingWarnings(true);
      const response = await api.get(
        endpoints.reports.getWarnings(data.user.id),
      );
      setWarnings(response.data);
    } catch (error) {
      toast.error(handleAxiosError(error));
    } finally {
      setLoadingWarnings(false);
    }
  }, [data, driverExists]);
  useEffect(() => {
    fetchDriverDetails();
    return () => {
      setDriverImage((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      setDriverExists(false);
    };
  }, [fetchDriverDetails]);
  useEffect(() => {
    if (driverExists) {
      fetchDriverImage();
      fetchShipments();
      fetchWarnings();
    }
  }, [driverExists, fetchDriverImage, fetchShipments, fetchWarnings]);
  const handleDownload = async (type, fileId) => {
    try {
      const response = await api.get(
        endpoints.drivers.donwnloadDocumnet(type, fileId),
        {
          responseType: "blob",
        },
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));

      const link = document.createElement("a");
      link.href = url;

      link.setAttribute("download", `${type}_document_${fileId}.pdf`);

      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(handleAxiosError(err));
    }
  };
  if (loading) {
    return (
      <div className="tn-dd-loader-wrapper d-flex align-items-center justify-content-center vh-100">
        <Spinner animation="grow" className="tn-dd-text-orange" />
        <span className="ms-3 fw-bold text-muted">
          جاري تحميل ملف السائق...
        </span>
      </div>
    );
  }
  const {
    driver,
    user,
    car,
    files,
    driver_governorates,
    average_rate,
    badge,
    statistics,
  } = data;

  const renderFileIcon = (fileName) => {
    if (!fileName) return <FaFileAlt />;
    const lowerName = fileName.toLowerCase();
    if (lowerName.endsWith(".pdf"))
      return <FaFilePdf className="text-danger" />;
    if (lowerName.match(/\.(jpeg|jpg|gif|png)$/))
      return <FaImage className="text-primary" />;
    return <FaFileAlt className="text-secondary" />;
  };

  const renderFileRow = (title, filePath, rowkey, type, targetId) => {
    if (!filePath) return null;
    return (
      <div
        className="d-flex align-items-center justify-content-between p-3 mb-3 tn-dd-bento-item tn-dd-file-hover"
        key={rowkey}
      >
        <h6 className="mb-1 fw-bold">{title}</h6>
        <div className="d-flex flex-end gap-3">
          <div className="d-flex align-items-center gap-3">
            <div className="tn-dd-icon-box">{renderFileIcon(filePath)}</div>
          </div>
          <Button
            variant="link"
            className="tn-dd-text-orange p-0"
            onClick={() => handleDownload(type, targetId)}
          >
            <FaDownload size={18} />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Container fluid className="tn-dd-main-container py-4 px-xl-5">
      <div className="d-flex flex-wrap justify-content-between align-items-end mb-4 tn-dd-header-flex gap-3">
        <div>
          <h2 className="fw-bold mb-2 tn-dd-page-title">
            ملف السائق{" "}
            <span className="tn-dd-text-orange">#{user.user_number}</span>
          </h2>
          <p className="text-muted mb-0">
            إدارة تفاصيل الحساب، المركبة، وسجل الرحلات
          </p>
        </div>
        <div className="d-flex gap-2">
          <Button
            variant="outline-secondary"
            className="d-flex align-items-center gap-2 fw-bold rounded-pill px-4 shadow-sm"
            onClick={() => navigate(-1)}
          >
            <FaArrowRight /> تراجع
          </Button>
          {!user || isSubscriptionDisabled ? (
            <OverlayTrigger
              placement="bottom"
              overlay={
                <Tooltip id="subscription-tooltip" className="fw-bold">
                  {getTooltipMessage()}
                </Tooltip>
              }
            >
              <span
                className="btn btn-warning d-flex align-items-center justify-content-center gap-2 fw-bold rounded-pill px-4 shadow-sm text-white opacity-50"
                style={{ pointerEvents: "auto", cursor: "not-allowed" }}
              >
                <Button
                  variant="warning"
                  className="p-0 border-0 bg-transparent text-black fw-bold"
                  disabled
                  style={{ pointerEvents: "none" }}
                >
                  <FaSync /> تجديد الاشتراك
                </Button>
              </span>
            </OverlayTrigger>
          ) : (
            <Button
              variant="warning"
              className="d-flex align-items-center gap-2 fw-bold rounded-pill px-4 shadow-sm text-white"
              onClick={() => setShowRenewModal(true)}
            >
              <FaSync className="animate-spin-hover" /> تجديد الاشتراك
            </Button>
          )}
          {isBlocked ? (
            <Button
              variant="success"
              className="d-flex align-items-center gap-2 fw-bold rounded-pill px-4 shadow-sm"
              onClick={() => setShowUnblockModal(true)}
            >
              <FaUnlock /> فك الحظر
            </Button>
          ) : (
            <Button
              variant="danger"
              className="d-flex align-items-center gap-2 fw-bold rounded-pill px-4 shadow-sm"
              onClick={() => setShowBlockModal(true)}
            >
              <FaBan /> حظر الحساب
            </Button>
          )}
          <Button
            className="tn-dd-btn-primary rounded-pill shadow-sm"
            onClick={() => navigate(`/drivers/edit/${id}`)}
          >
            تحديث الحالة
          </Button>
        </div>
      </div>

      <Row className="g-4">
        <Col lg={4} xl={3}>
          <Card className="tn-dd-card text-center mb-4 border-0">
            <div className="tn-dd-profile-cover"></div>
            <Card.Body className="position-relative pt-0 px-4 pb-4">
              <div className="tn-dd-avatar-wrapper">
                <img
                  src={driverImage}
                  alt="Driver"
                  className="tn-dd-driver-img"
                />
              </div>
              <h4 className="fw-bold mt-3 mb-1 text-capitalize">
                {user.first_name} {user.last_name}
              </h4>
              <p className="text-muted small mb-3">
                {driver.nationality} • {driver.gender}
              </p>

              <div className="d-flex justify-content-center gap-2 mb-4">
                <Badge
                  bg={user.status === "محظور" ? "danger" : "success"}
                  className="tn-dd-badge-pill"
                >
                  {user.status}
                </Badge>
                <Badge
                  bg={driver.availability === 1 ? "primary" : "secondary"}
                  className="tn-dd-badge-pill"
                >
                  {driver.availability === 1 ? "متاح للعمل" : "غير متاح"}
                </Badge>
              </div>

              <div className="tn-dd-glass-card p-3 rounded-4 mb-4 text-start">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="fw-bold text-dark d-flex align-items-center gap-2">
                    <FaMedal className="tn-dd-text-orange fs-5" /> {badge.name}
                  </span>
                  <span className="badge bg-dark rounded-pill px-3">
                    Lvl {badge.level}
                  </span>
                </div>
                <p className="text-muted small text-start mb-3">{badge.text}</p>
                <div className="d-flex justify-content-between small text-dark fw-bold mb-2">
                  <span>شحنات متتالية ناجحة</span>
                  <span>{driver.continuous_successful_shipments} / 15</span>
                </div>
                <ProgressBar
                  now={driver.continuous_successful_shipments}
                  max={15}
                  variant="orange"
                  className="tn-dd-progress-thin"
                />
              </div>

              <div className="tn-dd-bento-item p-3 text-start mb-3">
                <div className="d-flex align-items-center mb-3">
                  <div className="tn-dd-icon-box bg-light me-3">
                    <FaPhone className="text-muted" />
                  </div>
                  <span dir="ltr" className="fw-bold">
                    {user.phone_number}
                  </span>
                </div>
                {driver.additional_phone_number && (
                  <div className="d-flex align-items-center mb-2 text-muted">
                    <div className="tn-dd-icon-box bg-light me-3">
                      <FaPhone opacity={0.5} />
                    </div>
                    <span dir="ltr" className="fw-bold">
                      {driver.additional_phone_number}
                    </span>
                    <Badge
                      bg="light"
                      text="dark"
                      className="border ms-2"
                      style={{ fontSize: "10px" }}
                    >
                      إضافي
                    </Badge>
                  </div>
                )}
                <div className="d-flex align-items-center w-100">
                  <div className="tn-dd-icon-box bg-light me-3 flex-shrink-0">
                    <FaEnvelope className="text-muted" />
                  </div>
                  <OverlayTrigger
                    trigger="click"
                    rootClose
                    placement="top"
                    overlay={
                      <Popover
                        id={`email-popover-${user.id}`}
                        className="shadow-sm border-0"
                      >
                        <Popover.Body
                          className="d-flex align-items-center p-2"
                          style={{ direction: "ltr" }}
                        >
                          <span className="me-2 fw-semibold text-dark select-all">
                            {user.email}
                          </span>
                        </Popover.Body>
                      </Popover>
                    }
                  >
                    <small
                      className="fw-bold text-truncate text-muted flex-grow-1 text-start"
                      dir="ltr"
                      title="Click for full email"
                      style={{ minWidth: 0, cursor: "pointer" }}
                    >
                      {user.email}
                    </small>
                  </OverlayTrigger>
                </div>
              </div>

              <div className="tn-dd-bento-item p-3 d-flex justify-content-between align-items-center mb-3">
                <span className="text-muted fw-bold">التقييم العام</span>
                <span className="fs-4 fw-bold d-flex align-items-center gap-1">
                  {average_rate} <FaStar className="text-warning mb-1" />
                </span>
              </div>
              <div className="tn-dd-bento-item p-3 d-flex justify-content-between align-items-center">
                <span className="text-muted fw-bold">تاريخ الانضمام</span>
                <span className="small fw-bold text-dark" dir="ltr">
                  {formatBentoDate(user.created_at, true)}
                </span>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={8} xl={9}>
          <Card className="tn-dd-card border-0 h-100">
            <Card.Body className="p-0 d-flex flex-column">
              <Tabs
                defaultActiveKey="personal"
                className="tn-dd-custom-tabs px-4 pt-3"
              >
                <Tab
                  eventKey="personal"
                  title={
                    <>
                      <FaUser className="me-2" /> الهوية والنطاق
                    </>
                  }
                  className="p-4 bg-light flex-grow-1"
                >
                  <Row className="g-4">
                    <Col xl={7}>
                      <div className="tn-dd-bento-box h-100 p-4">
                        <h6 className="fw-bold tn-dd-text-orange mb-4 d-flex align-items-center gap-2">
                          <FaIdCard /> البيانات الرسمية
                        </h6>
                        <Row className="g-4">
                          <Col sm={6}>
                            <span className="text-muted small d-block mb-1">
                              الاسم الكامل
                            </span>
                            <strong className="fs-6">
                              {user.first_name} {driver.father_name}{" "}
                              {user.last_name}
                            </strong>
                          </Col>
                          <Col sm={6}>
                            <span className="text-muted small d-block mb-1">
                              اسم الأم
                            </span>
                            <strong className="fs-6">
                              {driver.mother_name} {driver.mother_last_name}
                            </strong>
                          </Col>
                          <Col sm={6}>
                            <span className="text-muted small d-block mb-1">
                              الرقم الوطني
                            </span>
                            <strong
                              className="fs-6"
                              style={{ letterSpacing: "1px" }}
                            >
                              {driver.national_number}
                            </strong>
                          </Col>
                          <Col sm={6}>
                            <span className="text-muted small d-block mb-1">
                              تاريخ ومكان الميلاد
                            </span>
                            <strong className="fs-6">
                              {driver.birth_date}{" "}
                              <span className="text-muted fw-normal">
                                ({driver.birth_place})
                              </span>
                            </strong>
                          </Col>
                        </Row>
                      </div>
                    </Col>

                    <Col xl={5}>
                      <div className="tn-dd-bento-box h-100 p-4">
                        <h6 className="fw-bold tn-dd-text-orange mb-4 d-flex align-items-center gap-2">
                          <FaMapMarkerAlt /> العنوان السكني
                        </h6>
                        <div className="d-flex align-items-start gap-3 mb-4">
                          <div className="tn-dd-icon-box bg-light">
                            <FaMapMarkerAlt className="text-muted" />
                          </div>
                          <div>
                            <strong className="d-block mb-1">
                              {driver.governorate} - {driver.city}
                            </strong>
                            <span className="text-muted small">
                              حي {driver.neighborhood}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Col>

                    <Col xs={12}>
                      <div className="tn-dd-bento-box p-4">
                        <h6 className="fw-bold tn-dd-text-orange mb-3 d-flex align-items-center gap-2">
                          <FaRoute /> نطاق العمل (المحافظات المدعومة)
                        </h6>
                        <div className="d-flex flex-wrap gap-2 mt-3">
                          {driver_governorates.map((gov) => (
                            <Badge
                              key={gov.id}
                              bg="white"
                              text="dark"
                              className="tn-dd-gov-badge"
                            >
                              {gov.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </Col>
                  </Row>
                </Tab>

                <Tab
                  eventKey="vehicle"
                  title={
                    <>
                      <FaCar className="me-2" /> المركبة والوثائق
                    </>
                  }
                  className="p-4 bg-light flex-grow-1"
                >
                  <Row className="g-4">
                    <Col lg={7}>
                      <div className="tn-dd-bento-box h-100 p-4 position-relative overflow-hidden">
                        <FaCar
                          className="tn-dd-bg-icon position-absolute opacity-25"
                          style={{
                            fontSize: "150px",
                            left: "-20px",
                            bottom: "-20px",
                            color: "#e2e8f0",
                          }}
                        />

                        <h6 className="fw-bold tn-dd-text-orange mb-4 position-relative z-index-1 d-flex align-items-center gap-2">
                          <FaInfoCircle /> تفاصيل المركبة المسجلة
                        </h6>

                        {car ? (
                          <div className="position-relative z-index-1">
                            <div className="d-flex align-items-start gap-5 mb-4 pb-4 border-bottom">
                              <div>
                                <span className="text-muted small d-block mb-1">
                                  الشركة والموديل
                                </span>
                                <h4 className="fw-bold mb-0 text-dark">
                                  {car.manufacturer} {car.model}
                                </h4>
                                <Badge bg="dark" className="mt-2 fw-normal">
                                  {car.vehicle_type.type}
                                </Badge>
                              </div>
                              <div className="align-items-center d-flex flex-column">
                                <span className="text-muted small d-block mb-1">
                                  اللوحة
                                </span>
                                <div className="tn-dd-plate-style px-3 py-2 rounded-3 shadow-sm d-inline-block text-center bg-white border">
                                  <small
                                    className="d-block border-bottom mb-1 text-dark fw-bold"
                                    style={{ fontSize: "10px" }}
                                  >
                                    SYRIA
                                  </small>
                                  <span
                                    className="fw-bold fs-5 text-dark"
                                    style={{ letterSpacing: "2px" }}
                                  >
                                    {car.license_plate_number}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <Row className="g-3">
                              <Col xs={4}>
                                <div className="d-flex align-items-center gap-3">
                                  <div className="tn-dd-icon-box bg-light">
                                    <FaCalendarAlt className="text-muted" />
                                  </div>
                                  <div>
                                    <span className="text-muted small d-block">
                                      سنة الصنع
                                    </span>
                                    <span className="fw-bold">
                                      {car.year_of_manufacture}
                                    </span>
                                  </div>
                                </div>
                              </Col>
                              <Col xs={4}>
                                <div className="d-flex justify-content-center align-items-center gap-3">
                                  <div>
                                    <span className="text-muted small d-block">
                                      اللون
                                    </span>
                                    <span className="fw-bold">{car.color}</span>
                                  </div>
                                </div>
                              </Col>
                              <Col xs={4}>
                                <div className="d-flex align-items-center gap-3">
                                  <div className="tn-dd-icon-box bg-light">
                                    <FaInfoCircle className="text-muted" />
                                  </div>
                                  <div>
                                    <span className="text-muted small d-block">
                                      حالة السيارة
                                    </span>
                                    <span className="fw-bold">
                                      {car.car_status || "—"}
                                    </span>
                                  </div>
                                </div>
                              </Col>
                            </Row>
                            <div className="mt-4 p-3 bg-light rounded-3 small text-muted border border-dashed">
                              {car.vehicle_type.description}
                            </div>
                          </div>
                        ) : (
                          <p className="text-muted text-center py-5">
                            لا توجد بيانات مركبة مسجلة حالياً.
                          </p>
                        )}
                      </div>
                    </Col>

                    <Col lg={5}>
                      <div className="tn-dd-bento-box h-100 p-4">
                        <h6 className="fw-bold tn-dd-text-orange mb-4 d-flex align-items-center gap-2">
                          <FaFileAlt /> المستندات المرفوعة
                        </h6>
                        <div className="tn-dd-files-scroll pe-2">
                          {renderFileRow(
                            "رخصة القيادة",
                            files.driver_files?.license?.license_file,
                            "license_key",
                            "license",
                            files.driver_files?.license?.id,
                          )}
                          {renderFileRow(
                            "لا حكم عليه",
                            files.driver_files?.unconvicted_paper
                              ?.unconvicted_file,
                            "unconvicted-key",
                            "unconvicted",
                            files.driver_files?.unconvicted_paper?.id,
                          )}
                          {files.car_files?.map((file, index) =>
                            renderFileRow(
                              `وثيقة ${file.type}`,
                              file.car_file,
                              `car-file-${index}`,
                              "car",
                              file.id,
                            ),
                          )}
                        </div>
                      </div>
                    </Col>
                  </Row>
                </Tab>

                <Tab
                  eventKey="shipments"
                  title={
                    <div className="d-flex align-items-center">
                      <FaBoxOpen className="me-2" />
                      <span>سجل الرحلات</span>
                      {shipmentsData.total !== undefined && (
                        <Badge
                          bg="secondary"
                          pill
                          className="ms-2 opacity-75 fw-normal"
                          style={{ fontSize: "0.7rem" }}
                        >
                          {shipmentsData.total}
                        </Badge>
                      )}
                    </div>
                  }
                  className="p-0 flex-grow-1 bg-white"
                >
                  <div className="table-responsive">
                    <Table hover className="mb-0 tn-dd-table align-middle">
                      <thead className="bg-light">
                        <tr>
                          <th className="ps-4 text-center">رقم الشحنة</th>
                          <th className="text-center">المحتوى</th>
                          <th className="text-center">
                            الأبعاد (ارتفاع×عرض×طول)
                          </th>
                          <th className="text-center">الوزن</th>
                          <th className="text-center">التأمين</th>
                          <th className="text-center">المسار</th>
                          <th className="text-center">التكلفة</th>
                          <th className="text-center">الحالة</th>
                        </tr>
                      </thead>
                      <tbody>
                        {shipmentsLoading ? (
                          <ShipmentSkeleton rows={10} />
                        ) : shipmentsData.data &&
                          shipmentsData.data.length > 0 ? (
                          shipmentsData.data.map((ship,index) => (
                            <tr
                              key={index}
                              onClick={() => navigate(`/shipments/${ship.id}`)}
                              style={{ cursor: "pointer" }}
                            >
                              <td className="ps-4 fw-bold text-center">
                                #{ship.shipment_number}
                              </td>
                              <td className="text-center">{ship.object}</td>
                              <td
                                dir="ltr"
                                className="tn-dd-dimensions-cell text-center"
                              >
                                <div className="tn-dd-dimension-group justify-content-end">
                                  <div
                                    className="tn-dd-dimension-badge"
                                    title="الارتفاع"
                                  >
                                    <span className="tn-dd-dimension-prefix">
                                      ا
                                    </span>
                                    <span className="tn-dd-dimension-value">
                                      {ship.height}
                                    </span>
                                  </div>

                                  <span className="tn-dd-dimension-separator">
                                    ×
                                  </span>

                                  <div
                                    className="tn-dd-dimension-badge"
                                    title="العرض"
                                  >
                                    <span className="tn-dd-dimension-prefix">
                                      ع
                                    </span>
                                    <span className="tn-dd-dimension-value">
                                      {ship.width}
                                    </span>
                                  </div>

                                  <span className="tn-dd-dimension-separator">
                                    ×
                                  </span>

                                  <div
                                    className="tn-dd-dimension-badge"
                                    title="الطول"
                                  >
                                    <span className="tn-dd-dimension-prefix">
                                      ط
                                    </span>
                                    <span className="tn-dd-dimension-value">
                                      {ship.length}
                                    </span>
                                  </div>

                                  <span className="ms-1 text-muted fw-medium">
                                    cm
                                  </span>
                                </div>
                              </td>
                              <td className="text-center text-nowrap">
                                {ship.weight} كغ
                              </td>
                              <td className="text-center">
                                {ship.insurance ? (
                                  <span className="tn-insurance-badge insured">
                                    <span className="dot"></span>
                                    مؤمنة
                                  </span>
                                ) : (
                                  <span className="tn-insurance-badge not-insured">
                                    <span className="dot"></span>
                                    غير مؤمنة
                                  </span>
                                )}
                              </td>
                              <td className="text-center">
                                <div className="d-flex align-items-center gap-2 small">
                                  <Badge
                                    bg="light"
                                    text="dark"
                                    className="border fw-normal"
                                  >
                                    {ship.start_governorate || "---"}
                                  </Badge>
                                  <span className="text-muted">←</span>
                                  <Badge
                                    bg="light"
                                    text="dark"
                                    className="border fw-normal"
                                  >
                                    {ship.end_governorate || "---"}
                                  </Badge>
                                </div>
                              </td>
                              <td className="fw-bold tn-dd-text-orange text-center">
                                {ship.price.toLocaleString()} ل.س
                              </td>
                              <td className="ts-col-status text-center">
                                {(() => {
                                  const statusMap = {
                                    مستلمة: "ts-status--delivered",
                                    "غير مستلمة": "ts-status--failed",
                                    "قيد التوصيل": "ts-status--transit",
                                    جارية: "ts-status--pending",
                                  };
                                  const currentClass =
                                    statusMap[ship.status] ||
                                    "bg-secondary text-white";
                                  return (
                                    <span
                                      className={`ts-status-badge ${currentClass}`}
                                    >
                                      {ship.status}
                                    </span>
                                  );
                                })()}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan="8"
                              className="text-center py-5 text-muted bg-light"
                            >
                              <FaBoxOpen className="fs-1 text-secondary mb-3 opacity-25" />
                              <p className="mb-0">
                                لا يوجد سجل رحلات حالياً لهذا السائق
                              </p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  </div>

                  {shipmentsData.last_page > 1 && (
                    <div className="d-flex justify-content-center p-4 border-top bg-white">
                      <Pagination className="tn-dd-pagination mb-0">
                        <Pagination.First
                          disabled={shipmentsData.current_page === 1}
                          onClick={() => fetchShipments(1)}
                        />
                        <Pagination.Prev
                          disabled={shipmentsData.current_page === 1}
                          onClick={() =>
                            fetchShipments(shipmentsData.current_page - 1)
                          }
                        />
                        {[...Array(shipmentsData.last_page).keys()].map((p) => {
                          const pageNum = p + 1;
                          if (
                            pageNum === 1 ||
                            pageNum === shipmentsData.last_page ||
                            (pageNum >= shipmentsData.current_page - 1 &&
                              pageNum <= shipmentsData.current_page + 1)
                          ) {
                            return (
                              <Pagination.Item
                                key={pageNum}
                                active={pageNum === shipmentsData.current_page}
                                onClick={() => fetchShipments(pageNum)}
                              >
                                {pageNum}
                              </Pagination.Item>
                            );
                          }
                          return null;
                        })}
                        <Pagination.Next
                          disabled={
                            shipmentsData.current_page ===
                            shipmentsData.last_page
                          }
                          onClick={() =>
                            fetchShipments(shipmentsData.current_page + 1)
                          }
                        />
                        <Pagination.Last
                          disabled={
                            shipmentsData.current_page ===
                            shipmentsData.last_page
                          }
                          onClick={() =>
                            fetchShipments(shipmentsData.last_page)
                          }
                        />
                      </Pagination>
                    </div>
                  )}
                </Tab>
                <Tab
                  eventKey="statistics"
                  title={
                    <>
                      <FaChartLine className="me-2" /> التقارير المالية
                    </>
                  }
                  className="tn-admin-stats-container p-4"
                >
                  <Row className="g-4">
                    <Col lg={12}>
                      <div className="tn-admin-card tn-admin-summary-row p-4">
                        <Row className="align-items-stretch gap-y-3">
                          <Col md={3} className="border-end-admin">
                            <label className="tn-admin-label">
                              إجمالي سعر كافة الشحنات (المدفوعة وغير المدفوعة)
                            </label>
                            <h2 className="tn-admin-value text-dark">
                              {Number(
                                statistics?.total_price,
                              ).toLocaleString() || 0}{" "}
                              <small>ل.س</small>
                            </h2>
                            <div className="tn-admin-count">
                              {statistics?.total || 0} شحنة إجمالية بالنظام
                            </div>
                          </Col>

                          <Col md={3} className="border-end-admin ps-md-4">
                            <label className="tn-admin-label">
                              إجمالي سعر الشحنات الغير مدفوعة
                            </label>
                            <h2 className="tn-admin-value text-dark">
                              {Number(
                                statistics?.unpaid_amount,
                              ).toLocaleString() || 0}{" "}
                              <small>ل.س</small>
                            </h2>
                            <div className="tn-admin-count">
                              {statistics?.unpaid_count || 0} شحنة إجمالية غير
                              مدفوعة
                            </div>
                          </Col>

                          <Col md={3} className="border-end-admin ps-md-4">
                            <label className="tn-admin-label">
                              المبلغ المستحق للدفع بدون حساب الضرائب والمكافآت
                            </label>
                            <h2 className="tn-admin-value text-dark">
                              {Number(
                                statistics?.amount_to_pay,
                              ).toLocaleString() || 0}{" "}
                              <small>ل.س</small>
                            </h2>
                          </Col>

                          <Col md={3} className="ps-md-4">
                            <label className="tn-admin-label text-primary fw-bold">
                              الصافي النهائي للمبلغ المستحق للدفع
                            </label>
                            <h2 className="tn-admin-value text-primary">
                              {Number(
                                statistics?.total_amount_to_pay,
                              ).toLocaleString() || 0}{" "}
                              <small>ل.س</small>
                            </h2>
                            <div className="tn-admin-count text-muted">
                              شامل الخصومات والإضافات المستحقة
                            </div>
                          </Col>
                        </Row>
                      </div>
                    </Col>

                    <Col md={6}>
                      <div className="tn-admin-card p-4 h-100">
                        <div className="d-flex justify-content-between mb-3">
                          <h6 className="tn-admin-title">المكافآت (Bonuses)</h6>
                          <span className="tn-admin-badge">
                            {statistics?.all_bonuses?.length || 0} مكافأة
                          </span>
                        </div>
                        <div className="mb-4">
                          <label className="tn-admin-label">
                            إجمالي المكافآت غير المستلمة
                          </label>
                          <h3 className="tn-admin-value-md">
                            {statistics?.unreceived_bonuses_sum?.toLocaleString() ||
                              0}{" "}
                            <small>ل.س</small>
                          </h3>
                        </div>

                        <div className="tn-admin-scroll-area">
                          {statistics?.all_bonuses?.map((bonus) => (
                            <div
                              key={bonus.id}
                              className="tn-admin-detail-item py-2 border-bottom-admin"
                            >
                              <div className="d-flex justify-content-between">
                                <span className="fw-bold">
                                  {bonus.value?.toLocaleString()} ل.س
                                </span>
                                <span
                                  className={`tn-status-pill ${bonus.received ? "success" : "warning"}`}
                                >
                                  {bonus.received
                                    ? "تم الاستلام"
                                    : "غير مستلمة"}
                                </span>
                              </div>
                              <div className="d-flex justify-content-between mt-1">
                                <small className="text-muted">
                                  شحنات ناجحة:{" "}
                                  {bonus.successful_shipments_number}
                                </small>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </Col>

                    <Col md={6}>
                      <div className="tn-admin-card p-4 h-100">
                        <div className="d-flex justify-content-between mb-3">
                          <h6 className="tn-admin-title">الضرائب (Taxes)</h6>
                          <span className="tn-admin-badge">
                            {statistics?.all_taxes?.length || 0} ضريبة
                          </span>
                        </div>
                        <div className="mb-4">
                          <label className="tn-admin-label">
                            إجمالي الضرائب غير المحصلة
                          </label>
                          <h3 className="tn-admin-value-md">
                            {statistics?.unreceived_taxes_sum?.toLocaleString() ||
                              0}{" "}
                            <small>ل.س</small>
                          </h3>
                        </div>

                        <div className="tn-admin-scroll-area">
                          {statistics?.all_taxes?.map((tax) => (
                            <div
                              key={tax.id}
                              className="tn-admin-detail-item py-2 border-bottom-admin"
                            >
                              <div className="d-flex justify-content-between">
                                <span className="fw-bold">
                                  {tax.value?.toLocaleString()} ل.س
                                </span>
                                <span
                                  className={`tn-status-pill ${tax.received ? "success" : "warning"}`}
                                >
                                  {tax.received ? "تم التحصيل" : "لم تحصل"}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div
                          className="mt-4 pt-3 border-top"
                          style={{ borderColor: "#e2e8f0" }}
                        >
                          <button
                            type="button"
                            className="btn btn-outline-danger w-100 py-2.5 d-flex align-items-center justify-content-center gap-2 fw-bold rounded-3 transition-all"
                            style={{
                              letterSpacing: "0.3px",
                              borderWidth: "1.5px",
                              fontSize: "0.9rem",
                            }}
                            onClick={() => setShowTaxModal(true)}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth="2.5"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 4.5v15m7.5-7.5h-15"
                              />
                            </svg>
                            فرض ضريبة / غرامة جديدة
                          </button>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </Tab>
                <Tab
                  eventKey="warnings"
                  title={
                    <span className="fw-bold d-flex align-items-center">
                      <FaExclamationTriangle className="me-2" />
                      الإنذارات
                    </span>
                  }
                >
                  <Row className="g-4 tn-admin-row mt-2">
                    <Col md={12}>
                      <div className="tn-admin-box p-4 h-100 shadow-sm rounded-4 bg-white">
                        {/* الترويسة */}
                        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4 pb-3 border-bottom">
                          <h5 className="tn-admin-title text-danger mb-0 d-flex align-items-center gap-2">
                            <FaExclamationCircle />
                            سجل الإنذارات والمخالفات
                          </h5>

                          <div className="d-flex align-items-center gap-3 flex-wrap">
                            <span className="badge bg-danger-subtle text-danger rounded-pill px-3 py-2 border border-danger-subtle">
                              إجمالي الإنذارات: {warnings.length}
                            </span>

                            <Button
                              variant="danger"
                              className="d-flex align-items-center gap-2 fw-bold rounded-pill px-4 shadow-sm"
                              onClick={() => setShowWarningModal(true)}
                            >
                              <AlertTriangle />
                              إرسال إنذار جديد
                            </Button>
                          </div>
                        </div>

                        {loadingWarnings ? (
                          <div className="text-center p-5 text-muted">
                            <div
                              className="spinner-border text-danger mb-2"
                              role="status"
                            ></div>
                            <p>جاري تحميل الإنذارات...</p>
                          </div>
                        ) : warnings.length > 0 ? (
                          <div className="warnings-list">
                            {warnings.map((warning, index) => (
                              <Alert
                                key={index}
                                variant="light"
                                className="d-flex flex-column flex-lg-row justify-content-lg-between align-items-start gap-2 gap-lg-3 mb-3 rounded-3 border-0 border-start border-danger border-4 shadow-sm"
                              >
                                <p className="mb-0 text-dark lh-lg flex-grow-1">
                                  {warning.warning_text}
                                </p>

                                <small className="text-muted d-flex align-items-center flex-shrink-0 mt-1 align-self-end align-self-lg-start ">
                                  <FaRegClock className="me-1" />
                                  {new Date(
                                    warning.created_at,
                                  ).toLocaleDateString("ar-EG", {
                                    year: "numeric",
                                    month: "numeric",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </small>
                              </Alert>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center text-muted p-5 bg-light rounded-4 border-dashed">
                            <FaRegCheckCircle className="fs-1 text-success mb-3" />
                            <h6 className="fw-bold">سجل نظيف!</h6>
                            <p className="mb-0">
                              لا يوجد أي إنذارات مسجلة على هذا السائق حتى الآن.
                            </p>
                          </div>
                        )}
                      </div>
                    </Col>
                  </Row>
                </Tab>
              </Tabs>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <BlockModal
        show={showBlockModal}
        onHide={() => {
          setShowBlockModal(false);
        }}
        userId={user.id}
        onSuccess={fetchDriverDetails}
      />

      <UnblockModal
        show={showUnblockModal}
        onHide={() => {
          setShowUnblockModal(false);
        }}
        userId={user.id}
        onSuccess={fetchDriverDetails}
      />
      <ActivateModal
        show={showRenewModal}
        onHide={() => setShowRenewModal(false)}
        userId={user.id}
        onSuccess={fetchDriverDetails}
      />
      <TaxModal
        show={showTaxModal}
        handleClose={() => setShowTaxModal(false)}
        driverId={driver.id}
        onTaxImposed={fetchDriverDetails}
      />
      <WarningModal
        show={showWarningModal}
        onHide={() => setShowWarningModal(false)}
        userId={user.id}
        userName={`${driver.first_name} ${driver.last_name}`}
        onSuccess={fetchWarnings}
      />
    </Container>
  );
};

export default DriverDetails;
