import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Container,
  Table,
  Button,
  Nav,
  Badge,
  Pagination,
} from "react-bootstrap";
import {
  FaUnlock,
  FaCar,
  FaUsers,
  FaUserShield,
  FaCalendarAlt,
} from "react-icons/fa";
import { toast } from "react-toastify";
import api from "../../Api/Api";
import UnblockModal from "../../Components/UnblockModal";
import "./BlockedUsers.css";
import BlockedSkeletonLoading from "../../Components/BlockedSkeletonLoading";
import { endpoints } from "../../Api/Endpoints";
import { handleAxiosError } from "../../Utils/ErrorHandler";
import { formatBentoDate } from "../../Utils/dateFormatter";

const BlockedUsers = () => {
  const [activeTab, setActiveTab] = useState("drivers");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [showUnblockModal, setShowUnblockModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const requestVersionRef = useRef(0);
  const fetchBlockedList = useCallback(async () => {
    requestVersionRef.current += 1;
    const thisRequestVersion = requestVersionRef.current;
    setLoading(true);
    try {
      const endpoint =
        activeTab === "drivers"
          ? endpoints.drivers.blocked(currentPage)
          : activeTab === "subAdmins"
            ? endpoints.employees.blocked(currentPage)
            : endpoints.clients.blocked(currentPage);

      const response = await api.get(endpoint);

      if (thisRequestVersion !== requestVersionRef.current) return;

      setData(response.data.data);
      setTotalPages(response.data.last_page);
      setTotalItems(response.data.total);
    } catch (error) {
      if (thisRequestVersion === requestVersionRef.current) {
        toast.error(handleAxiosError(error));
      }
    } finally {
      if (thisRequestVersion === requestVersionRef.current) {
        setLoading(false);
      }
    }
  }, [activeTab, currentPage]);

  const handleTabChange = (newTab) => {
    if (newTab === activeTab) return;
    setLoading(true);
    setData([]);
    setActiveTab(newTab);
    setCurrentPage(1);
  };
  useEffect(() => {
    fetchBlockedList();
  }, [fetchBlockedList]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  const getEmptyMessage = () => {
    switch (activeTab) {
      case "drivers":
        return "سائقين محظورين";
      case "clients":
        return "عملاء محظورين";
      case "subAdmins":
        return "موظفين محظورين";
      default:
        return "مستخدمين محظورين";
    }
  };
  return (
    <Container fluid className="tn-b-page py-4 px-xl-5">
      <div className="d-flex justify-content-between align-items-end mb-4">
        <h3 className="fw-bold tn-b-text-navy">الحسابات المحظورة</h3>
        <Badge className="tn-b-bg-brand fs-6 px-4 py-2 rounded-pill">
          الإجمالي: {totalItems}
        </Badge>
      </div>

      <div className="tn-b-card p-4">
        <Nav variant="pills" className="tn-b-tabs mb-4 gap-2">
          <Nav.Link
            active={activeTab === "drivers"}
            onClick={() => handleTabChange("drivers")}
          >
            <FaCar className="me-2" /> السائقين
          </Nav.Link>
          <Nav.Link
            active={activeTab === "clients"}
            onClick={() => handleTabChange("clients")}
          >
            <FaUsers className="me-2" /> العملاء
          </Nav.Link>
          <Nav.Link
            active={activeTab === "subAdmins"}
            onClick={() => handleTabChange("subAdmins")}
          >
            <FaUserShield className="me-2" /> الموظفين
          </Nav.Link>
        </Nav>

        <div className="table-responsive">
          <Table className="tn-b-table text-center align-middle">
            <thead>
              <tr>
                <th className="text-center">رقم الحساب</th>
                <th className="text-center">المستخدم</th>
                <th className="text-center">بيانات التواصل</th>
                <th className="text-center">انتهاء الحظر</th>
                <th className="text-center">سبب الإيقاف</th>
                <th className="text-center">الإجراء</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <BlockedSkeletonLoading />
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-5 text-center text-muted">
                    <div className="fs-5 mb-2">
                      لا يوجد {getEmptyMessage()} حالياً
                    </div>
                    <small>القائمة فارغة في الوقت الحالي.</small>
                  </td>
                </tr>
              ) : (
                data.map((item,index) => (
                  <tr key={index}>
                    <td className="fw-bold tn-b-text-navy text-center">
                      #{item.user_number}
                    </td>
                    <td className="text-center">
                      <div className="fw-bold tn-b-text-navy">
                        {item.first_name} {item.last_name}
                      </div>
                      <div
                        className="tn-b-text-slate align-items-center gap-2"
                        style={{ fontSize: "0.9rem" }}
                      >
                        <FaCalendarAlt className="text-muted" />
                        <span className="ms-1">انضم في:</span>
                        <span dir="ltr" className="fw-medium d-block">
                          {formatBentoDate(item.created_at, true)}
                        </span>
                      </div>
                    </td>
                    <td dir="ltr" className="tn-b-text-slate text-center">
                      <div>{item.phone_number}</div>
                      <small>{item.email}</small>
                    </td>
                    <td className="text-center">
                      {item.ban_end_date ? (
                        <Badge className="tn-b-badge-temp rounded-pill" dir="ltr">
                          {formatBentoDate(item.ban_end_date, true)}
                        </Badge>
                      ) : (
                        <Badge className="tn-b-badge-perm rounded-pill">
                          حظر دائم
                        </Badge>
                      )}
                    </td>
                    <td className="tn-b-text-slate text-center">
                      {item.ban_explanation || "---"}
                    </td>
                    <td className="text-center">
                      <Button
                        className="tn-b-btn-unblock"
                        onClick={() => {
                          setSelectedUser(item);
                          setShowUnblockModal(true);
                        }}
                      >
                        <FaUnlock className="me-1" /> فك الحظر
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="d-flex justify-content-center mt-4">
            <Pagination className="tn-b-pagination" dir="ltr">
              <Pagination.Prev
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
              />
              {[...Array(totalPages)].map((_, index) => (
                <Pagination.Item
                  key={index + 1}
                  active={index + 1 === currentPage}
                  onClick={() => handlePageChange(index + 1)}
                >
                  {index + 1}
                </Pagination.Item>
              ))}
              <Pagination.Next
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
              />
            </Pagination>
          </div>
        )}
      </div>

      <UnblockModal
        show={showUnblockModal}
        onHide={() => setShowUnblockModal(false)}
        userId={selectedUser?.id || selectedUser?.user_id}
        onSuccess={fetchBlockedList}
      />
    </Container>
  );
};

export default BlockedUsers;
