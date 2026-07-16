import React, { useState, useEffect } from "react";
import { endpoints } from "../../Api/Endpoints";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  InputGroup,
  Form,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faStar,
  faEllipsisV,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import "./Drivers.css";
import api from "../../Api/Api";
import DriverSkeleton from "../../Components/DriverSkeletonLoading";
import { toast } from "react-toastify";
import { handleAxiosError } from "../../Utils/ErrorHandler";
import { useNavigate } from "react-router-dom";
import BlockModal from "../../Components/BlockModal";
import UnblockModal from "../../Components/UnblockModal";
import WarningModal from "../../Components/WarningModal";
import NotificationAllModal from "../../Components/NotificationAllModal";
import { FaBan, FaExclamationTriangle, FaUnlock } from "react-icons/fa";
import { useAuth } from "../../Context/AuthContext";
const Drivers = () => {
  const { role } = useAuth();
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState([]);
  const [availableCount, setAvailableCount] = useState(0);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchNumber, setSearchNumber] = useState("");
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showUnblockModal, setShowUnblockModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [driverName, setDriverName] = useState("");
  const [showNotificationAllModal, setShowNotificationAllModal] =
    useState(false);
  const [totalDrivers, setTotalDrivers] = useState(0);
  const fetchDrivers = async (page = 1) => {
    setLoading(true);
    try {
      const response = await api.get(`${endpoints.drivers.get(page)}`);
      const { available_drivers, drivers: driversObj } = response.data;
      setDrivers(driversObj.data);
      setAvailableCount(available_drivers);
      setTotalDrivers(driversObj.total || 0);
      setPagination({
        total: driversObj.total || 0,
        from: driversObj.from || 0,
        to: driversObj.to || 0,
        last_page: driversObj.last_page || 1,
      });
      setCurrentPage(page);
    } catch (error) {
      toast.error(handleAxiosError(error));
    } finally {
      setTimeout(() => setLoading(false), 400);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);
  const renderPaginationItems = () => {
    const totalPages = pagination?.last_page || 0;
    const items = [];
    const siblings = 1;

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - siblings && i <= currentPage + siblings)
      ) {
        items.push(
          <Button
            key={i}
            disabled={loading}
            className={`tn-page-num ${currentPage === i ? "is-active" : ""}`}
            onClick={() => fetchDrivers(i)}
          >
            {i}
          </Button>,
        );
      } else if (
        i === currentPage - siblings - 1 ||
        i === currentPage + siblings + 1
      ) {
        items.push(
          <span key={`ellipsis-${i}`} className="px-2 text-muted">
            ...
          </span>,
        );
      }
    }
    return items;
  };
  useEffect(() => {
    if (searchTerm === "" && isSearchActive) {
      fetchDrivers(1);
      setIsSearchActive(false);
    }
  }, [searchTerm, isSearchActive]);
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setIsSearchActive(false);
      return;
    }
    setSearchNumber(searchTerm);
    setLoading(true);
    try {
      const response = await api.post(endpoints.drivers.search, {
        driver_number: searchTerm,
      });
      setDrivers([response.data]);
      setPagination(null);
      setIsSearchActive(true);
    } catch (error) {
      if (error.response?.status === 404 || error.response?.status === 422) {
        setIsSearchActive(true);
        setDrivers([]);
      } else {
        toast.error(handleAxiosError(error));
      }
    } finally {
      setLoading(false);
    }
  };
  const getStatusClass = (status) => {
    switch (status) {
      case "فعال":
        return "account-status-active";
      case "فعال ويجب عليه الدفع":
        return "account-status-warning";
      case "مجمد":
        return "account-status-frozen";
      case "محظور":
        return "account-status-blocked";
      default:
        return "account-status-default";
    }
  };
  return (
    <div className="tn-d-main-content" dir="rtl">
      <header className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold tn-navy fs-4 fs-md-2">إدارة السائقين</h2>
        <Button
          className="btn-collective-notification"
          onClick={() => setShowNotificationAllModal(true)}
        >
          إشعار جماعي 📢
        </Button>
      </header>

      <Container fluid className="p-0">
        <Row className="mb-4 mb-md-5 gx-3 gy-3">
          {[
            { label: "إجمالي السائقين", value: totalDrivers },
            { label: "السائقين المتاحين", value: availableCount },
          ].map((kpi, idx) => (
            <Col key={idx} xs={12} sm={6} lg={3}>
              <Card className="tn-kpi-card border-0 shadow-sm p-3 p-md-4">
                <div className="tn-kpi-label">{kpi.label}</div>
                <div className="d-flex justify-content-between align-items-center">
                  <h2 className="tn-kpi-value mb-0">
                    {loading ? "..." : kpi.value}
                  </h2>
                </div>
              </Card>
            </Col>
          ))}
        </Row>

        <Card className="tn-main-card border-0 shadow-sm">
          <div className="tn-toolbar p-3 p-md-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 border-bottom bg-white">
            <h4 className="fw-bold m-0 tn-navy fs-5">قائمة السائقين</h4>
            <div className="d-flex flex-column flex-sm-row align-items-stretch align-items-sm-center gap-3">
              <InputGroup className="tn-search-wrapper w-100">
                <Form.Control
                  placeholder="ابحث عن سائق..."
                  className="text-start border-0 bg-transparent"
                  style={{ direction: "rtl" }}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="tn-search-actions align-items-center d-flex">
                  {searchTerm && (
                    <Button
                      variant="link"
                      className="text-muted p-0 border-0 shadow-none mx-2"
                      onClick={() => {
                        setSearchTerm("");
                        if (isSearchActive) fetchDrivers(1);
                        setIsSearchActive(false);
                      }}
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </Button>
                  )}
                </div>
                <InputGroup.Text className="bg-transparent border-0">
                  <FontAwesomeIcon
                    icon={faSearch}
                    className="text-muted tn-search-icon"
                    onClick={handleSearch}
                  />
                </InputGroup.Text>
              </InputGroup>
              <Button
                className="tn-btn-orange fw-bold whitespace-nowrap"
                onClick={() => navigate("/drivers/create")}
              >
                إضافة جديد +
              </Button>
            </div>
          </div>
          <Table responsive hover className="m-0 tn-table align-middle">
            <thead>
              <tr>
                <th className="text-center">السائق</th>
                <th className="text-center">نوع المركبة</th>
                <th className="text-center">بيانات التواصل</th>
                <th className="text-center">رقم المستخدم</th>
                <th className="text-center">التقييم</th>
                <th className="text-center">حالة الاتصال</th>
                <th className="text-center">حالة الحساب</th>
                <th className="text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <DriverSkeleton />
              ) : drivers.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-5">
                    <div className="text-muted">
                      <p className="mb-0">لا يوجد سائقين لعرضهم حالياً</p>
                    </div>
                  </td>
                </tr>
              ) : (
                drivers.map((driver, idx) => (
                  <tr
                    key={idx}
                    onClick={() => navigate(`/drivers/${driver.id}`)}
                    className="tn-d-record-cursor-pointer"
                  >
                    <td className="text-center">
                      <div className="gap-3">
                        <div className="fw-bold tn-navy">
                          {driver.first_name} {driver.last_name}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="fw-bold text-dark text-center">
                        {driver.vehicle_type}
                      </div>
                    </td>
                    <td className="text-center">
                      <div className="text-dark small" dir="ltr">
                        {driver.phone_number}
                      </div>
                      <div className="tn-link small">{driver.email}</div>
                    </td>
                    <td className="text-center">
                      <div className="fw-bold text-dark">
                        {driver.user_number}
                      </div>
                    </td>
                    <td className="text-center">
                      <div className="tn-stars d-flex align-items-center gap-1">
                        <FontAwesomeIcon icon={faStar} />
                        <span className="fw-bold text-dark">
                          {driver.rating}
                        </span>
                      </div>
                    </td>
                    <td className="text-center">
                      <span
                        className={`tn-d-status-pill ${driver.availability ? "status-active" : "status-trip"}`}
                      >
                        {driver.availability ? "متاح" : "غير متاح"}
                      </span>
                    </td>
                    <td className="text-center">
                      <span
                        className={`tn-d-status-pill ${getStatusClass(driver.status)}`}
                      >
                        {driver.status}
                      </span>
                    </td>
                    <td
                      className="text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="dropdown">
                        <button
                          className="btn btn-sm action-btn"
                          data-bs-toggle="dropdown"
                          aria-expanded="false"
                        >
                          <FontAwesomeIcon icon={faEllipsisV} />
                        </button>

                        <ul className="dropdown-menu dropdown-menu-end shadow border-0 text-end">
                          <li>
                            <button
                              className="dropdown-item d-flex align-items-center gap-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowWarningModal(true);
                                setSelectedUserId(driver.user_id);
                                setDriverName(
                                  `${driver.first_name} ${driver.last_name}`,
                                );
                              }}
                            >
                              <FaExclamationTriangle className="ms-2 text-warning" />
                              إرسال إنذار
                            </button>
                          </li>
                          {role === "admin" &&
                            (driver.status === "محظور" ? (
                              <li>
                                <button
                                  className="dropdown-item d-flex align-items-center gap-2 text-success fw-bold"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setShowUnblockModal(true);
                                    setSelectedUserId(driver.user_id);
                                  }}
                                >
                                  <FaUnlock className="ms-2 text-success" />
                                  فك الحظر
                                </button>
                              </li>
                            ) : (
                              <li>
                                <button
                                  className="dropdown-item d-flex align-items-center gap-2 text-danger fw-bold"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setShowBlockModal(true);
                                    setSelectedUserId(driver.user_id);
                                  }}
                                >
                                  <FaBan className="ms-2 text-danger" />
                                  حظر السائق
                                </button>
                              </li>
                            ))}
                        </ul>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>

          <div className="p-3 p-md-4 d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 border-top bg-white">
            <span className="text-muted small text-center text-md-start">
              {isSearchActive ? (
                drivers.length > 0 ? (
                  <>
                    تم العثور على السائق رقم: <strong>{searchNumber}</strong>
                  </>
                ) : (
                  <>
                    لا توجد نتائج مطابقة للرقم: <strong>{searchNumber}</strong>
                  </>
                )
              ) : drivers.length > 0 ? (
                <>
                  عرض {pagination?.from || 0} إلى {pagination?.to || 0} من أصل{" "}
                  {pagination?.total || 0} سائق
                </>
              ) : (
                "لا توجد نتائج للعرض"
              )}
            </span>
            <div className="tn-pagination d-flex gap-2 align-items-center flex-wrap justify-content-center">
              <Button
                className="tn-page-nav"
                disabled={currentPage === 1 || loading || isSearchActive}
                onClick={() => fetchDrivers(currentPage - 1)}
              >
                السابق
              </Button>
              {!isSearchActive && renderPaginationItems()}
              <Button
                className="tn-page-nav"
                disabled={
                  currentPage === pagination?.last_page ||
                  loading ||
                  isSearchActive
                }
                onClick={() => fetchDrivers(currentPage + 1)}
              >
                التالي
              </Button>
            </div>
            <BlockModal
              show={showBlockModal}
              onHide={() => {
                setShowBlockModal(false);
                setSelectedUserId(null);
              }}
              userId={selectedUserId}
              onSuccess={() => fetchDrivers(currentPage)}
            />

            <UnblockModal
              show={showUnblockModal}
              onHide={() => {
                setShowUnblockModal(false);
                setSelectedUserId(null);
              }}
              userId={selectedUserId}
              onSuccess={() => fetchDrivers(currentPage)}
            />
            <WarningModal
              show={showWarningModal}
              onHide={() => {
                setShowWarningModal(false);
                setSelectedUserId(null);
                setDriverName("");
              }}
              userId={selectedUserId}
              userName={driverName}
            />
            <NotificationAllModal
              show={showNotificationAllModal}
              onHide={() => setShowNotificationAllModal(false)}
            />
          </div>
        </Card>
      </Container>
    </div>
  );
};

export default Drivers;
