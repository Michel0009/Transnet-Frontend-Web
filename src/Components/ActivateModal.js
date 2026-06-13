import React, { useState } from "react";
import { Modal, Button, Spinner } from "react-bootstrap";
import { FaUserCheck } from "react-icons/fa";
import { toast } from "react-toastify";
import api from "../Api/Api";
import { endpoints } from "../Api/Endpoints";
import { handleAxiosError } from "../Utils/ErrorHandler";

const ActivateModal = ({ show, onHide, userId, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {        
      const response = await api.get(endpoints.drivers.activate(userId));

      if (
        response.status === 200 &&
        response.data.message === "تم تفعيل حساب المستخدم بنجاح"
      ) {
        toast.success("تم تفعيل حساب المستخدم بنجاح");
        onHide();

        if (onSuccess) await onSuccess();
      }
    } catch (err) {
      if (
        err.response &&
        (err.response.status === 404 || err.response.status === 422) &&
        err.response.data.message
      ) {
        toast.error(err.response.data.message);
      } else {
        toast.error(handleAxiosError(err));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered dir="rtl">
      <Modal.Header closeButton>
        <Modal.Title className="text-primary d-flex align-items-center gap-2 fs-5 fw-bold">
          <FaUserCheck /> تأكيد تفعيل الحساب
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="text-center py-3">
          <p className="fs-5 mb-1 text-dark fw-semibold">
            هل أنت متأكد أنك تريد تفعيل حساب هذا السائق؟
          </p>
          <span className="text-muted small d-block px-3">
            سيتمكن من تسجيل الدخول، استقبال شحنات Transnet والعمل فوراً في
            النظام.
          </span>
        </div>
      </Modal.Body>
      <Modal.Footer className="justify-content-center border-0 pt-0">
        <Button
          variant="secondary"
          className="px-4"
          onClick={onHide}
          disabled={loading}
        >
          إلغاء
        </Button>
        <Button
          variant="primary"
          className="px-4 d-flex align-items-center gap-2 fw-bold"
          onClick={handleConfirm}
          disabled={loading}
        >
          {loading && <Spinner animation="border" size="sm" />}
          نعم، تفعيل الحساب
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ActivateModal;
