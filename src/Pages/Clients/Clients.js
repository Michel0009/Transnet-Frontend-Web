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
  Dropdown,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faEllipsisV,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import "../Drivers/Drivers.css";
import api from "../../Api/Api";
import ClientSkeletonLoading from "../../Components/ClientSkeletonLoading";
import { toast } from "react-toastify";
import { handleAxiosError } from "../../Utils/ErrorHandler";
import BlockModal from "../../Components/BlockModal";
import UnblockModal from "../../Components/UnblockModal";
import WarningModal from "../../Components/WarningModal";
import NotificationAllModal from "../../Components/NotificationAllModal";
import { useNavigate } from "react-router-dom";
import { formatBentoDate } from "../../Utils/dateFormatter";

const Clients = () => {
  const [clients, setClients] = useState([]);
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
  const [clientName, setClientName] = useState("");
  const [showNotificationAllModal, setShowNotificationAllModal] =
    useState(false);
  const [totalClients, setTotalClients] = useState(0);
  const navigate = useNavigate();

  const fetchClients = async (page = 1) => {
    setLoading(true);
    try {
      const response = await api.get(`${endpoints.clients.get(page)}`);
      const { users: clientsObj } = response.data;

      setClients(clientsObj.data);
      setTotalClients(clientsObj.total || 0);
      setPagination({
        total: clientsObj.total || 0,
        from: clientsObj.from || 0,
        to: clientsObj.to || 0,
        last_page: clientsObj.last_page || 1,
      });
      setCurrentPage(page);
    } catch (error) {
      toast.error(handleAxiosError(error));
    } finally {
      setTimeout(() => setLoading(false), 400);
    }
  };

  useEffect(() => {
    fetchClients();
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
            onClick={() => fetchClients(i)}
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
      fetchClients(1);
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
      const response = await api.post(endpoints.clients.search, {
        user_number: searchTerm,
      });
      setClients([response.data]);
      setPagination(null);
      setIsSearchActive(true);
    } catch (error) {
      if (error.response?.status === 404 || error.response?.status === 422) {
        setIsSearchActive(true);
        setClients([]);
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
    <div className="tn-main-content" dir="rtl">
      <header className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold tn-navy fs-4 fs-md-2">إدارة العملاء</h2>
        <Button
          className="btn-collective-notification"
          onClick={() => setShowNotificationAllModal(true)}
        >
          إشعار جماعي 📢
        </Button>
      </header>

      <Container fluid className="p-0">
        <Row className="mb-4 mb-md-5 gx-3 gy-3">
          <Col xs={12} sm={6} lg={3}>
            <Card className="tn-kpi-card border-0 shadow-sm p-3 p-md-4">
              <div className="tn-kpi-label">إجمالي العملاء</div>
              <div className="d-flex justify-content-between align-items-center">
                <h2 className="tn-kpi-value mb-0">
                  {loading ? "..." : totalClients}
                </h2>
              </div>
            </Card>
          </Col>
        </Row>

        <Card className="tn-main-card border-0 shadow-sm">
          <div className="tn-toolbar p-3 p-md-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 border-bottom bg-white">
            <h4 className="fw-bold m-0 tn-navy fs-5">قائمة العملاء</h4>
            <div className="d-flex flex-column flex-sm-row align-items-stretch align-items-sm-center gap-3">
              <InputGroup className="tn-search-wrapper w-100">
                <Form.Control
                  placeholder="ابحث عن عميل..."
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
                        if (isSearchActive) fetchClients(1);
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
            </div>
          </div>
          <Table responsive hover className="m-0 tn-table align-middle">
            <thead>
              <tr>
                <th className="text-center">العميل</th>
                <th className="text-center">بيانات التواصل</th>
                <th className="text-center">رقم المستخدم</th>
                <th className="text-center">تاريخ الانضمام</th>
                <th className="text-center">حالة الحساب</th>
                <th className="text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <ClientSkeletonLoading rows={5} />
              ) : clients.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-5">
                    <div className="text-muted">
                      <p className="mb-0">لا يوجد عملاء لعرضهم حالياً</p>
                    </div>
                  </td>
                </tr>
              ) : (
                clients.map((client, idx) => (
                  <tr
                    key={idx}
                    onClick={() => navigate(`/clients/${client.id}`)}
                    style={{ cursor: "pointer" }}
                  >
                    <td className="text-center">
                      <div className="gap-3">
                        <div className="fw-bold tn-navy ">
                          {client.first_name} {client.last_name}
                        </div>
                      </div>
                    </td>

                    <td className="text-center">
                      <div className="text-dark small" dir="ltr">
                        {client.phone_number}
                      </div>
                      <div className="tn-link small">{client.email}</div>
                    </td>

                    <td className="text-center">
                      <div className="fw-bold text-dark">
                        {client.user_number}
                      </div>
                    </td>
                    <td className="text-center">
                      <div dir="ltr" className="text-center">
                        {formatBentoDate(client.created_at, true)}
                      </div>
                    </td>
                    <td className="text-center">
                      <span
                        className={`tn-d-status-pill ${getStatusClass(
                          client.status,
                        )}`}
                      >
                        {client.status}
                      </span>
                    </td>

                    <td className="text-center text-muted">
                      <Dropdown onClick={(e) => e.stopPropagation()}>
                        <Dropdown.Toggle
                          variant="link"
                          className="text-muted p-0 shadow-none border-0 tn-no-caret"
                          id={`dropdown-${client.id}`}
                        >
                          <FontAwesomeIcon
                            icon={faEllipsisV}
                            className="tn-d-operations-cursor-pointer"
                          />
                        </Dropdown.Toggle>

                        <Dropdown.Menu>
                          <Dropdown.Item
                            onClick={() => {
                              setSelectedUserId(client.id);
                            }}
                          >
                            عرض سجل الإنذارات
                          </Dropdown.Item>
                          <Dropdown.Divider />

                          <Dropdown.Item
                            onClick={() => {
                              setShowWarningModal(true);
                              setSelectedUserId(client.id);
                              setClientName(
                                `${client.first_name} ${client.last_name}`,
                              );
                            }}
                          >
                            إرسال إنذار
                          </Dropdown.Item>
                          <Dropdown.Divider />

                          {client.status === "محظور" ? (
                            <Dropdown.Item
                              onClick={() => {
                                setShowUnblockModal(true);
                                setSelectedUserId(client.id);
                              }}
                              className="text-success fw-bold"
                            >
                              فك الحظر
                            </Dropdown.Item>
                          ) : (
                            <Dropdown.Item
                              onClick={() => {
                                setShowBlockModal(true);
                                setSelectedUserId(client.id);
                              }}
                              className="text-danger fw-bold"
                            >
                              حظر العميل
                            </Dropdown.Item>
                          )}
                        </Dropdown.Menu>
                      </Dropdown>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>

          <div className="p-3 p-md-4 d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 border-top bg-white">
            <span className="text-muted small text-center text-md-start">
              {isSearchActive ? (
                clients.length > 0 ? (
                  <>
                    تم العثور على العميل رقم: <strong>{searchNumber}</strong>
                  </>
                ) : (
                  <>
                    لا توجد نتائج مطابقة للرقم: <strong>{searchNumber}</strong>
                  </>
                )
              ) : clients.length > 0 ? (
                <>
                  عرض {pagination?.from || 0} إلى {pagination?.to || 0} من أصل{" "}
                  {pagination?.total || 0} عميل
                </>
              ) : (
                "لا توجد نتائج للعرض"
              )}
            </span>
            <div className="tn-pagination d-flex gap-2 align-items-center flex-wrap justify-content-center">
              <Button
                className="tn-page-nav"
                disabled={currentPage === 1 || loading || isSearchActive}
                onClick={() => fetchClients(currentPage - 1)}
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
                onClick={() => fetchClients(currentPage + 1)}
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
              onSuccess={() => fetchClients(currentPage)}
            />

            <UnblockModal
              show={showUnblockModal}
              onHide={() => {
                setShowUnblockModal(false);
                setSelectedUserId(null);
              }}
              userId={selectedUserId}
              onSuccess={() => fetchClients(currentPage)}
            />

            <WarningModal
              show={showWarningModal}
              onHide={() => {
                setShowWarningModal(false);
                setSelectedUserId(null);
                setClientName("");
              }}
              userId={selectedUserId}
              driverName={clientName}
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

export default Clients;
