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

const Drivers = () => {
  const [drivers, setDrivers] = useState([]);
  const [availableCount, setAvailableCount] = useState(0);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const[searchNumber,setSearchNumber]= useState("");
  const [isSearchActive, setIsSearchActive] = useState(false);
  const fetchDrivers = async (page = 1) => {
    setLoading(true);
    try {
      const response = await api.get(`${endpoints.drivers.get}?page=${page}`);
      const { available_drivers, drivers: driversObj } = response.data;
      setDrivers(driversObj.data);
      setAvailableCount(available_drivers);
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
    setSearchNumber(searchTerm)
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
  return (
    <div className="tn-main-content" dir="rtl">
      <header className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold tn-navy">إدارة السائقين</h2>
      </header>

      <Container fluid className="p-0">
        <Row className="mb-5 gx-4">
          {[
            { label: "إجمالي السائقين", value: pagination?.total || 0 },
            { label: "السائقين المتاحين", value: availableCount },
          ].map((kpi, idx) => (
            <Col key={idx} md={3}>
              <Card className="tn-kpi-card border-0 shadow-sm p-4">
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
          <div className="tn-toolbar p-4 d-flex justify-content-between align-items-center border-bottom bg-white">
            <h4 className="fw-bold m-0 tn-navy">قائمة السائقين</h4>
            <div className="d-flex align-items-center gap-3">
              <InputGroup className="tn-search-wrapper w-auto">
                <Form.Control
                  placeholder="ابحث عن سائق..."
                  className="text-start border-0 bg-transparent"
                  style={{ direction: "rtl" }}
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                  }}
                />
                <div
                  style={{
                    width: "25px",
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  {searchTerm && (
                    <Button
                      variant="link"
                      className="text-muted p-0 border-0 shadow-none"
                      style={{ marginRight: "5px", marginLeft: "5px" }}
                      onClick={() => {
                        setSearchTerm("");
                        if (isSearchActive) {
                          fetchDrivers(1);
                        }
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
              <Button className="tn-btn-orange fw-bold ms-auto">
                إضافة سائق جديد +
              </Button>
            </div>
          </div>

          <Table responsive hover className="m-0 tn-table align-middle">
            <thead>
              <tr>
                <th>السائق</th>
                <th>نوع المركبة</th>
                <th>بيانات التواصل</th>
                <th>رقم المستخدم</th>
                <th>التقييم</th>
                <th>الحالة</th>
                <th className="text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <DriverSkeleton />
              ) : drivers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-5">
                    <div className="text-muted">
                      <p className="mb-0">لا يوجد سائقين لعرضهم حالياً</p>
                    </div>
                  </td>
                </tr>
              ) : (
                drivers.map((driver, idx) => (
                  <tr key={idx}>
                    <td>
                      <div className="d-flex align-items-center gap-3">
                        <div className="fw-bold tn-navy">
                          {driver.first_name} {driver.last_name}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="fw-bold text-dark">
                        {driver.vehicle_type}
                      </div>
                    </td>
                    <td>
                      <div className="text-dark small">
                        {driver.phone_number}
                      </div>
                      <div className="tn-link small">{driver.email}</div>
                    </td>
                    <td>
                      <div className="fw-bold text-dark">
                        {driver.user_number}
                      </div>
                    </td>
                    <td>
                      <div className="tn-stars d-flex align-items-center gap-1">
                        <FontAwesomeIcon icon={faStar} />
                        <span className="fw-bold text-dark">
                          {driver.rating}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`tn-status-pill ${driver.availability ? "status-active" : "status-trip"}`}
                      >
                        {driver.availability ? "نشط" : "غير نشط"}
                      </span>
                    </td>
                    <td className="text-center text-muted">
                      <FontAwesomeIcon
                        icon={faEllipsisV}
                        className="cursor-pointer"
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>

          <div className="p-4 d-flex justify-content-between align-items-center border-top bg-white">
            <span className="text-muted small">
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
            <div className="tn-pagination d-flex gap-2 align-items-center">
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
          </div>
        </Card>
      </Container>
    </div>
  );
};

export default Drivers;
