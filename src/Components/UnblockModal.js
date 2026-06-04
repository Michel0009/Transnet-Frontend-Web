import React, { useState } from "react";
import { Modal, Button, Spinner } from "react-bootstrap";
import { FaUnlock } from "react-icons/fa";
import { toast } from "react-toastify";
import api from "../Api/Api";
import { endpoints } from "../Api/Endpoints";
import { handleAxiosError } from "../Utils/ErrorHandler";

const UnblockModal = ({ show, onHide, userId, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const response = await api.get(endpoints.general.unblock(userId));

      if (
        response.status === 200 &&
        response.data.message === "تم فك حظر المستخدم بنجاح"
      ) {
        toast.success(response.data.message);
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
        <Modal.Title className="text-success d-flex align-items-center gap-2">
          <FaUnlock /> تأكيد فك الحظر
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="fs-5 mb-0 text-center py-3">
          هل أنت متأكد أنك تريد فك حظر هذا المستخدم؟ <br />
          <span className="text-muted fs-6">
            سيتمكن من العودة لاستخدام التطبيق وتلقي الطلبات كالمعتاد.
          </span>
        </p>
      </Modal.Body>
      <Modal.Footer className="justify-content-center">
        <Button
          variant="secondary"
          className="px-4"
          onClick={onHide}
          disabled={loading}
        >
          إلغاء
        </Button>
        <Button
          variant="success"
          className="px-4 d-flex align-items-center gap-2"
          onClick={handleConfirm}
          disabled={loading}
        >
          {loading && <Spinner animation="border" size="sm" />}
          نعم، فك الحظر
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default UnblockModal;
