import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Spinner,
  Pagination,
  ButtonGroup,
  Button,
  Form, 
  InputGroup,
} from "react-bootstrap";
import {
  FaBox,
  FaShieldAlt,
  FaTruck,
  FaArrowLeft,
  FaCheck,
  FaTimes,
  FaCube,
  FaBoxes,
  FaSearch,
} from "react-icons/fa";
import "./Shipments.css";
import { endpoints } from "../../Api/Endpoints";
import api from "../../Api/Api";
import ShipmentPageSkeleton from "../../Components/ShipmentPageSkeleton";
import { toast } from "react-toastify";
import { handleAxiosError } from "../../Utils/ErrorHandler";
import { useNavigate } from "react-router-dom";

const Shipments = () => {
  const [filter, setFilter] = useState("all");
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalShipments, setTotalShipments] = useState(0);

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    let isCurrentRequest = true;
    const fetchShipments = async (page = 1, currentFilter) => {
      setLoading(true);
      try {
        let endpoint;
        if (isSearching && searchQuery.trim()) {
          endpoint = endpoints.shipments.search(searchQuery.trim());
        } else {
          endpoint =
            currentFilter === "insured"
              ? endpoints.shipments.insured(page)
              : endpoints.shipments.get(page);
        }
        const response = await api.get(endpoint);

        if (!isCurrentRequest) return;

        if (isSearching) {
          if (response.data && response.data.shipment) {
            setShipments([response.data.shipment]);
            setLastPage(1);
          } else {
            setShipments([]);
            setLastPage(1);
          }
        } else {
          setShipments(response.data.data);
          setCurrentPage(response.data.current_page);
          setLastPage(response.data.last_page);
          setTotalShipments(response.data.total || 0);
        }
      } catch (error) {
        if (isCurrentRequest) {
          if (error?.response?.status === 404) {
            toast.info("لا توجد شحنات تطابق رقم التتبع المدخل.");
          } else {
            toast.error(handleAxiosError(error));
          }
          setShipments([]);
        }
      } finally {
        if (isCurrentRequest) {
          setLoading(false);
        }
      }
    };
    fetchShipments(currentPage, filter);
    return () => {
      isCurrentRequest = false;
    };
    // eslint-disable-next-line
  }, [currentPage, filter, isSearching]);

  const handleFilterChange = (newFilter) => {
    if (newFilter === filter) return;
    setLoading(true);
    setShipments([]);
    setFilter(newFilter);
    setSearchQuery("");
    setIsSearching(false);
    setCurrentPage(1);
  };
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setCurrentPage(1);
  };
  const handleClearSearch = () => {
    setSearchQuery("");
    if (isSearching) {
      setIsSearching(false);
      setCurrentPage(1);
    }
  };
  const renderPaginationItems = () => {
    let items = [];
    for (let number = 1; number <= lastPage; number++) {
      items.push(
        <Pagination.Item
          key={number}
          active={number === currentPage}
          onClick={() => setCurrentPage(number)}
        >
          {number}
        </Pagination.Item>,
      );
    }
    return items;
  };

  const renderStatusBadge = (status) => {
    const statusConfig = {
      مستلمة: { bg: "#e6fcf5", text: "#0ca678", dot: "#20c997" },
      "غير مستلمة": { bg: "#fff5f5", text: "#e03131", dot: "#ff6b6b" },
      "قيد التوصيل": { bg: "#fff9db", text: "#f08c00", dot: "#fab005" },
      جارية: { bg: "#e7f5ff", text: "#1c7ed6", dot: "#339af0" },
    };

    const style = statusConfig[status] || {
      bg: "#f4f7f9",
      text: "#64748b",
      dot: "#94a3b8",
    };

    return (
      <div
        className="tn-s-admin-status-badge"
        style={{ backgroundColor: style.bg, color: style.text }}
      >
        <span
          className="tn-s-status-dot"
          style={{ backgroundColor: style.dot }}
        ></span>
        {status}
      </div>
    );
  };

  return (
    <Container fluid className="tn-s-admin-page-container" dir="rtl">
      <Row className="align-items-center mb-4 gap-3 gap-md-0">
        <Col xs={12} md={6}>
          <div className="d-flex align-items-center gap-3">
            <div className="tn-s-page-icon-wrapper">
              <FaBoxes className="tn-s-page-icon" />
            </div>
            <div>
              <h2 className="tn-s-admin-page-title">إدارة الشحنات</h2>
              <p className="tn-s-admin-page-subtitle">
                النظام المركزي الذكي لتتبع العمليات والمخزون
              </p>
            </div>
          </div>
        </Col>

        <Col xs={12} md={6} className="d-flex justify-content-md-end">
          <div className="tn-s-admin-segmented-control">
            <div
              className={`tn-s-segmented-highlight ${filter === "insured" ? "tn-s-right-aligned" : ""}`}
            ></div>
            <ButtonGroup className="w-100 position-relative z-1">
              <Button
                variant="link"
                className={`tn-s-segmented-btn ${filter === "all" ? "tn-s-active" : ""}`}
                onClick={() => handleFilterChange("all")}
              >
                <FaTruck className="ms-2 tn-s-icon-sm" /> جميع الشحنات
              </Button>
              <Button
                variant="link"
                className={`tn-s-segmented-btn ${filter === "insured" ? "tn-s-active" : ""}`}
                onClick={() => handleFilterChange("insured")}
              >
                <FaShieldAlt className="ms-2 tn-s-icon-sm" /> الشحنات المؤمنة
              </Button>
            </ButtonGroup>
          </div>
        </Col>
      </Row>

      <Row className="mb-4 g-3 align-items-end">
        <Col xs={12} sm={6} lg={4}>
          <Card className="tn-s-kpi-card border-0">
            <Card.Body className="d-flex align-items-center justify-content-between p-4">
              <div>
                <p className="tn-s-kpi-title mb-1">
                  {filter === "insured"
                    ? "إجمالي الشحنات المؤمنة"
                    : "إجمالي الشحنات الحالية"}
                </p>
                <h3 className="tn-s-kpi-value mb-0">
                  {loading ? (
                    <Spinner
                      animation="border"
                      size="sm"
                      className="tn-s-text-orange"
                    />
                  ) : (
                    totalShipments
                  )}
                </h3>
              </div>
              <div className="tn-s-kpi-icon-box tn-s-orange-gradient-bg">
                <FaBox variant="white" />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={8} className="d-flex justify-content-sm-end">
          <div className="tn-s-search-container ">
            <Form onSubmit={handleSearchSubmit}>
              <InputGroup className="tn-s-search-input-group">
                <Form.Control
                  type="text"
                  placeholder="ابحث برقم تتبع الشحنة ..."
                  className="tn-s-search-input"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (e.target.value.trim() === "" && isSearching) {
                      setIsSearching(false);
                      setCurrentPage(1);
                    }
                  }}
                />
                {searchQuery && (
                  <Button
                    variant="link"
                    className="tn-s-search-clear-btn"
                    onClick={handleClearSearch}
                    type="button"
                  >
                    <FaTimes size={14} />
                  </Button>
                )}
                <Button
                  variant="link"
                  type="submit"
                  className="tn-s-search-submit-btn"
                >
                  <FaSearch size={14} />
                </Button>
              </InputGroup>
            </Form>
          </div>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card className="tn-s-admin-card border-0">
            <Card.Body className="p-0">
              <Table responsive hover className="tn-s-admin-table mb-0">
                <thead>
                  <tr>
                    <th className="text-center">رقم التتبع</th>
                    <th className="text-center">
                      المحتوى
                      <FaCube
                        className="tn-s-inline-cube-icon ms-2"
                        size={14}
                      />
                    </th>
                    <th className="text-center">المسار</th>
                    <th className="text-center">
                      الأبعاد
                      <span className="fw-normal opacity-50">
                        (ارتفاع×عرض×طول)
                      </span>
                    </th>
                    <th className="text-center">الوزن</th>
                    <th className="text-center">التكلفة</th>
                    <th className="text-center">التأمين</th>
                    <th className="text-center">الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <ShipmentPageSkeleton />
                  ) : shipments.length > 0 ? (
                    shipments.map((shipment, index) => (
                      <tr
                        key={index}
                        onClick={() => navigate(`/shipments/${shipment.id}`)}
                        style={{ cursor: "pointer" }}
                      >
                        <td className="fw-bold tn-s-text-primary-tracking text-center">
                          #{shipment.shipment_number}
                        </td>
                        <td className="text-center">
                          <div className="gap-2">
                            <span className="fw-semibold text-dark">
                              {shipment.object}
                            </span>
                          </div>
                        </td>
                        <td className="text-center">
                          <div className="gap-2 fw-bold text-dark">
                            <span>{shipment.start_governorate}</span>
                            <FaArrowLeft
                              className="tn-s-text-orange-accent mx-1"
                              size={11}
                            />
                            <span>{shipment.end_governorate}</span>
                          </div>
                        </td>
                        <td dir="ltr" className="tn-s-dimensions-cell text-center">
                          <div className="tn-s-dimension-group justify-content-end">
                            <div
                              className="tn-s-dimension-badge"
                              title="الارتفاع"
                            >
                              <span className="tn-s-dimension-prefix">ا</span>
                              <span className="tn-s-dimension-value">
                                {shipment.height}
                              </span>
                            </div>

                            <span className="tn-s-dimension-separator">×</span>

                            <div className="tn-s-dimension-badge" title="العرض">
                              <span className="tn-s-dimension-prefix">ع</span>
                              <span className="tn-s-dimension-value">
                                {shipment.width}
                              </span>
                            </div>

                            <span className="tn-s-dimension-separator">×</span>

                            <div className="tn-s-dimension-badge" title="الطول">
                              <span className="tn-s-dimension-prefix">ط</span>
                              <span className="tn-s-dimension-value">
                                {shipment.length}
                              </span>
                            </div>

                            <span className="ms-1 text-muted tn-s-text-xs fw-medium">
                              cm
                            </span>
                          </div>
                        </td>
                        <td className="fw-semibold text-dark text-center">
                          {shipment.weight}
                          <span className="text-muted tn-s-text-xs fw-normal">
                            كغ
                          </span>
                        </td>
                        <td className="fw-bold tn-s-text-orange-price text-center">
                          {Number(shipment.price).toLocaleString()}
                          <span className="tn-s-currency-label">ل.س</span>
                        </td>
                        <td className="text-center">
                          {shipment.insurance ? (
                            <span className="tn-s-insurance-badge tn-s-true">
                              <FaCheck size={9} /> مؤمنة
                            </span>
                          ) : (
                            <span className="tn-s-insurance-badge tn-s-false">
                              <FaTimes size={9} /> غير مؤمنة
                            </span>
                          )}
                        </td>
                        <td className="text-center">{renderStatusBadge(shipment.status)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="text-center py-5">
                        <div className="tn-s-empty-state">
                          <FaBox className="tn-s-empty-icon mb-3" />
                          <p className="mb-0 fw-medium">
                            لا توجد شحنات مسجلة تطابق التصفية الحالية.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {!loading && lastPage > 1 && (
        <Row className="mt-4">
          <Col className="d-flex justify-content-center">
            <Pagination className="tn-s-admin-pagination">
              <Pagination.Prev
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
              />
              {renderPaginationItems()}
              <Pagination.Next
                disabled={currentPage === lastPage}
                onClick={() => setCurrentPage((prev) => prev + 1)}
              />
            </Pagination>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default Shipments;
