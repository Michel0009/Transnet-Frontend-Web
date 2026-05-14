import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
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
} from "react-icons/fa";
import api from "../../Api/Api";
import "./DriverDetails.css";
import ShipmentSkeleton from "../../Components/ShipmentSkeleton";
import { endpoints } from "../../Api/Endpoints";
import { toast } from "react-toastify";
import { handleAxiosError } from "../../Utils/ErrorHandler";
import BlockModal from "../../Components/BlockModal";
import UnblockModal from "../../Components/UnblockModal";

const DriverDetails = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [driverImage, setDriverImage] = useState("/default-avatar.png");

  const [shipmentsData, setShipmentsData] = useState({
    data: [],
    current_page: 1,
    last_page: 1,
    total: 0,
  });

  const [loading, setLoading] = useState(true);
  const [shipmentsLoading, setShipmentsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isBlocked, setIsBlocked] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showUnblockModal, setShowUnblockModal] = useState(false);
  useEffect(() => {
    if (data?.user?.status === "محظور") {
      setIsBlocked(true);
    } else {
      setIsBlocked(false);
    }
  }, [data]);
  const fetchDriverDetails = useCallback(async () => {
    try {
      const response = await api.get(`/driverDetails/${id}`);
      setData(response.data);
    } catch (err) {
      setError("فشل في جلب بيانات السائق");
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchDriverImage = useCallback(async () => {
    try {
      const response = await api.get(`/driverImage/${id}`, {
        responseType: "blob",
      });
      const imageUrl = URL.createObjectURL(response.data);
      setDriverImage(imageUrl);
    } catch (err) {
      console.error("خطأ في جلب صورة السائق", err);
    }
  }, [id]);

  const fetchShipments = useCallback(
    async (page = 1) => {
      setShipmentsLoading(true);
      try {
        const response = await api.get(`/shipments/driver/${id}?page=${page}`);
        setShipmentsData(response.data);
      } catch (err) {
        console.error("خطأ في جلب الشحنات", err);
      } finally {
        setShipmentsLoading(false);
      }
    },
    [id],
  );

  useEffect(() => {
    fetchDriverDetails();
    fetchDriverImage();
    fetchShipments();
  }, [fetchDriverDetails, fetchDriverImage, fetchShipments]);
  const handleDownload = async (type, fileId) => {
    try {
      const response = await api.get(
        `${endpoints.drivers.donwnloadDocumnet}/${type}/${fileId}`,
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
  const handleUnblockSubmit = async () => {
    try {
      setShowUnblockModal(false);
      setLoading(true);
      const response = await api.get(`/unblockUser/${user.id}`);
      if (response.status === 200) {
        toast.success("تم فك حظر السائق بنجاح");
        await fetchDriverDetails();
      }
    } catch (err) {
      if (err.response) {
        if (
          (err.response.status === 404 || err.response.status === 422) &&
          err.response.data.message
        ) {
          toast.error(err.response.data.message);
        } else {
          toast.error(handleAxiosError(err));
        }
      } else {
        toast.error(handleAxiosError(err));
      }
    }finally{
      setLoading(false)
    }
  };
  const handleBlockSubmit = async (formData) => {
    try {
      setShowBlockModal(false);
      setLoading(true);
      const response = await api.post("/blockUser", {
        id: user.id,
        explaination: formData.explaination,
        days_number: formData.days_number || null,
      });

      if (
        response.status === 200 &&
        response.data.message === "تم حظر المستخدم بنجاح"
      ) {
        toast.success("تم حظر السائق بنجاح");
        await fetchDriverDetails();
      }
    } catch (err) {
      if (err.response) {
        if (err.response.status === 422) {
          const msg = err.response?.data?.message;
          const deadline = err.response?.data?.deadline;
          toast.warning(
            `${msg} ${deadline ? `\nموعد التسليم: ${deadline}` : ""}`,
          );
        } else {
          toast.error(handleAxiosError(err));
        }
      } else {
        toast.error(handleAxiosError(err));
      }
    }finally{
      setLoading(false)
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

  if (error || !data)
    return (
      <Container className="py-5 text-center">
        <h4 className="text-danger">{error || "لا توجد بيانات لهذا السائق"}</h4>
      </Container>
    );

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
      {/* Header */}
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
          <Button className="tn-dd-btn-primary rounded-pill shadow-sm">
            تحديث الحالة
          </Button>
        </div>
      </div>

      <Row className="g-4">
        {/* Sidebar */}
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

              {/* Glassmorphism Badge Card */}
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

              {/* Contact Bento Box */}
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
                <div className="d-flex align-items-center">
                  <div className="tn-dd-icon-box bg-light me-3">
                    <FaEnvelope className="text-muted" />
                  </div>
                  <small className="fw-bold text-break">{user.email}</small>
                </div>
              </div>

              {/* Rating Bento Box */}
              <div className="tn-dd-bento-item p-3 d-flex justify-content-between align-items-center">
                <span className="text-muted fw-bold">التقييم العام</span>
                <span className="fs-4 fw-bold d-flex align-items-center gap-1">
                  {average_rate} <FaStar className="text-warning mb-1" />
                </span>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Main Content */}
        <Col lg={8} xl={9}>
          <Card className="tn-dd-card border-0 h-100">
            <Card.Body className="p-0 d-flex flex-column">
              <Tabs
                defaultActiveKey="personal"
                className="tn-dd-custom-tabs px-4 pt-3"
              >
                {/* 1. Personal Tab (Bento Layout) */}
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
                    {/* Official Info Box */}
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

                    {/* Address Box */}
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

                    {/* Work Areas Box */}
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

                {/* 2. Vehicle Tab */}
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
                    {/* Vehicle Details */}
                    <Col lg={7}>
                      <div className="tn-dd-bento-box h-100 p-4 position-relative overflow-hidden">
                        {/* Decorative Background Icon */}
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

                    {/* Documents List */}
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
                              `مستند ملكية ${index + 1}`,
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

                {/* 3. Shipments Tab */}
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
                          <th className="ps-4">رقم الشحنة</th>
                          <th>المحتوى</th>
                          <th className="text-center">الأبعاد (ط×ع×ا)</th>
                          <th>الوزن</th>
                          <th className="text-center">التأمين</th>
                          <th>المسار</th>
                          <th>التكلفة</th>
                          <th>الحالة</th>
                        </tr>
                      </thead>
                      <tbody>
                        {shipmentsLoading ? (
                          <ShipmentSkeleton rows={10} />
                        ) : shipmentsData.data &&
                          shipmentsData.data.length > 0 ? (
                          shipmentsData.data.map((ship) => (
                            <tr key={ship.id}>
                              <td className="ps-4 fw-bold">
                                #{ship.shipment_number}
                              </td>
                              <td>{ship.object}</td>
                              <td className="text-muted small" dir="ltr">
                                <div className="d-flex justify-content-center align-items-center w-100 h-100 text-nowrap">
                                  {ship.length} × {ship.width} × {ship.height}
                                </div>{" "}
                              </td>
                              <td>{ship.weight} كغ</td>
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
                              <td>
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
                              <td className="fw-bold tn-dd-text-orange">
                                {ship.price.toLocaleString()} ل.س
                              </td>
                              <td className="ts-col-status">
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

                  {/* Pagination */}
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
                    {/* Financial Overviews: Total & Unpaid */}
                    <Col lg={12}>
                      <div className="tn-admin-card tn-admin-summary-row p-4">
                        <Row className="align-items-center">
                          <Col md={3} className="border-end-admin">
                            <label className="tn-admin-label">
                              إجمالي سعر الشحنات
                            </label>
                            <h2 className="tn-admin-value">
                              {Number(
                                statistics?.total_price,
                              ).toLocaleString() || 0}{" "}
                              <small>ل.س</small>
                            </h2>
                            <div className="tn-admin-count">
                              {statistics?.total || 0} شحنة إجمالية
                            </div>
                          </Col>
                          <Col md={3} className="ps-md-4">
                            <label className="tn-admin-label">
                              المبلغ المستحق للدفع
                            </label>
                            <h2 className="tn-admin-value text-slate">
                              {statistics?.amount_to_pay?.toLocaleString() || 0}{" "}
                              <small>ل.س</small>
                            </h2>
                          </Col>
                        </Row>
                      </div>
                    </Col>

                    {/* Bonuses Section */}
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

                    {/* Taxes Section */}
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

                        <BlockModal
                          show={showBlockModal}
                          onHide={() => setShowBlockModal(false)}
                          onSubmit={handleBlockSubmit}
                        />

                        <UnblockModal
                          show={showUnblockModal}
                          onHide={() => setShowUnblockModal(false)}
                          onConfirm={handleUnblockSubmit}
                        />
                      </div>
                    </Col>
                  </Row>
                </Tab>
              </Tabs>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default DriverDetails;
