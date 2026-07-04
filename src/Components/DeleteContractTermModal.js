import React, { useState } from "react";
import { Modal, Button, Spinner } from "react-bootstrap";
import { FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";
import api from "../Api/Api";
import { endpoints } from "../Api/Endpoints";
import { handleAxiosError } from "../Utils/ErrorHandler";

const DeleteContractTermModal = ({ show, onHide, termId, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);

    try {
      const response = await api.delete(endpoints.terms.delete(termId));

      if (
        response.status === 200 &&
        response.data.message === "تم حذف هذا البند من العقد"
      ) {
        toast.success("تم حذف البند بنجاح");
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
        <Modal.Title className="text-danger d-flex align-items-center gap-2">
          <FaTrash /> تأكيد حذف البند
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <p className="fs-5 mb-0 text-center py-3">
          هل أنت متأكد أنك تريد حذف هذا البند؟ <br />
          <span className="text-muted fs-6">
            سيتم إزالة البند نهائيًا ولن يكون متاحًا في قائمة البنود.
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
          variant="danger"
          className="px-4 d-flex align-items-center gap-2"
          onClick={handleConfirm}
          disabled={loading}
        >
          {loading && <Spinner animation="border" size="sm" />}
          نعم، احذف البند
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteContractTermModal;
