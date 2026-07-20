import React from "react";
import "./SubAdminsPage.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisV } from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect } from "react";
import "../../Components/AddCoefficientModal";
import { toast } from "react-toastify";
import api from "../../Api/Api";
import { handleAxiosError } from "../../Utils/ErrorHandler";
import { endpoints } from "../../Api/Endpoints";
import EditSubAdminModal from "../../Components/EditSubAdminModal";

import AddUserModal from "../../Components/AddUserModal";
import SubAdminsSkeleton from "../../Components/SubAdminsSkeletonLoading";
import { FaEdit, FaBan, FaUnlock } from "react-icons/fa";
import BlockModal from "../../Components/BlockModal";
import UnblockModal from "../../Components/UnblockModal";

const SubAdminsPage = () => {
  const [subAdmins, setSubAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showUnblockModal, setShowUnblockModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedAdmin, setSelectedAdmin] = useState(null);

  const fetchSubAdmins = async () => {
    setLoading(true);

    try {
      const response = await api.get(endpoints.employees.get);

      console.log("SubAdmins Response:", response.data);

      if (response.status === 200) {
        setSubAdmins(response.data);
      }
    } catch (error) {
      toast.error(handleAxiosError(error));
    } finally {
      setTimeout(() => setLoading(false), 400);
    }
  };

  useEffect(() => {
    fetchSubAdmins();
  }, []);

  return (
    <div className="subadmins-page" dir="rtl">
      <div className="row align-items-center mb-4 flex-wrap g-3">
        <div className="col">
          <h2 className="page-title mb-2">إدارة المديرين المساعدين</h2>

          <p className="page-description mb-0">
            إدارة الصلاحيات و حسابات المديرين المساعدين في النظام لضمان تدفق
            العمليات اللوجستية بكفاءة.
          </p>
        </div>

        <div className="col-auto">
          <button className="btn-add-new" onClick={() => setShowModal(true)}>
            إضافة مسؤول جديد +
          </button>
        </div>
      </div>

      <div className="card border-0 shadow-sm table-card">
        <div className="table-responsive">
        <table className="table table-hover align-middle mb-0 subadmins-table">
          <thead>
            <tr>
              <th className="text-center">رقم المستخدم</th>
              <th className="text-center">الاسم الأول</th>
              <th className="text-center">الاسم الأخير</th>
              <th className="text-center">رقم الهاتف</th>
              <th className="text-center">الحالة</th>
              <th className="text-center">الإجراءات</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <SubAdminsSkeleton />
            ) : subAdmins.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-5">
                  <div className="text-muted">
                    لا يوجد مديرين مساعدين لعرضهم حالياً
                  </div>
                </td>
              </tr>
            ) : (
              subAdmins.map((admin) => (
                <tr key={admin.id}>
                  <td className="text-center">
                    <div className="fw-semibold text-dark">
                      {admin.user_number}
                    </div>
                  </td>
                  <td className="text-center">{admin.first_name}</td>
                  <td className="text-center">{admin.last_name}</td>

                  <td className="text-center">
                    <span className="text-muted">{admin.phone_number}</span>
                  </td>

                  <td className="text-center">
                    <span
                      className={`status-pill ${
                        admin.status === "محظور" ? "blocked" : "active"
                      }`}
                    >
                      {admin.status}
                    </span>
                  </td>

                  <td className="text-center">
                    <div className="dropdown">
                      <button
                        className="btn btn-sm tn-sa-action-btn"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                      >
                        <FontAwesomeIcon icon={faEllipsisV} />
                      </button>

                      <ul className="dropdown-menu dropdown-menu-end shadow border-0 text-end">
                        <li>
                          <button
                            className="dropdown-item d-flex align-items-center gap-2"
                            onClick={() => {
                              setSelectedAdmin(admin);
                              setShowEditModal(true);
                            }}
                          >
                            <FaEdit className="ms-2 text-primary" />
                            تعديل
                          </button>
                        </li>

                        <li>
                          <button
                            className="dropdown-item d-flex align-items-center gap-2"
                            onClick={() => {
                              setSelectedUserId(admin.id);
                              setShowBlockModal(true);
                            }}
                          >
                            <FaBan className="ms-2 text-danger" />
                            حظر
                          </button>
                        </li>

                        <li>
                          <button
                            className="dropdown-item d-flex align-items-center gap-2"
                            onClick={() => {
                              setSelectedUserId(admin.id);
                              setShowUnblockModal(true);
                            }}
                          >
                            <FaUnlock className="ms-2 text-success" />
                            إلغاء حظر
                          </button>
                        </li>
                      </ul>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </div>
      <AddUserModal
        show={showModal}
        onHide={() => setShowModal(false)}
        onSuccess={fetchSubAdmins}
      />
      <EditSubAdminModal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        adminData={selectedAdmin}
        onSuccess={fetchSubAdmins}
      />
      <BlockModal
        show={showBlockModal}
        onHide={() => {
          setShowBlockModal(false);
          setSelectedUserId(null);
        }}
        userId={selectedUserId}
        onSuccess={fetchSubAdmins}
      />
      <UnblockModal
        show={showUnblockModal}
        onHide={() => {
          setShowUnblockModal(false);
          setSelectedUserId(null);
        }}
        userId={selectedUserId}
        onSuccess={fetchSubAdmins}
      />
    </div>
  );
};

export default SubAdminsPage;
