import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import api from "../Api/Api";
import { endpoints } from "../Api/Endpoints";
import { toast } from "react-toastify";
import { handleAxiosError } from "../Utils/ErrorHandler";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faFileSignature} from "@fortawesome/free-solid-svg-icons";


const AddContractTermModal = ({ show, onHide, onSuccess }) => {
  const [form, setForm] = useState({
    order: "",
    term_text: "",
  });

  const [errors, setErrors] = useState({
    order: "",
    term_text: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (show) {
      setForm({
        order: "",
        term_text: "",
      });

      setErrors({
        order: "",
        term_text: "",
      });
    }
  }, [show]);

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const response = await api.post(endpoints.terms.create, {
        order: form.order,
        term_text: form.term_text,
      });

      if (
        response.status === 200 &&
        response.data.message === "تم إضافة بند جديد للعقد"
      ) {
        toast.success("تمت إضافة البند بنجاح");

        onHide();
        if (onSuccess) await onSuccess();
      }
    } catch (err) {
      if (err.response?.status === 422) {
        const backendErrors = err.response.data.errors || {};
        const backendMessage = err.response.data.message;

        if (backendMessage) {
          toast.error(backendMessage);
        }

        setErrors({
          order: backendErrors?.order?.join("، ") || "",
          term_text: backendErrors?.term_text?.join("، ") || "",
        });
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
        <Modal.Title className="text-primary d-flex align-items-center gap-2">
         <FontAwesomeIcon icon={faFileSignature} /> إضافة بند جديد</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">
              ترتيب البند <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="number"
              disabled={loading}
              isInvalid={!!errors.order}
              value={form.order}
              onChange={(e) => {
                setForm({ ...form, order: e.target.value });
                if (e.target.value.trim())
                  setErrors((prev) => ({ ...prev, order: "" }));
              }}
              placeholder="مثال: 1"
            />
            <Form.Control.Feedback type="invalid">
              {errors.order}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">
              نص البند <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              disabled={loading}
              isInvalid={!!errors.term_text}
              value={form.term_text}
              onChange={(e) => {
                setForm({ ...form, term_text: e.target.value });
                if (e.target.value.trim())
                  setErrors((prev) => ({ ...prev, term_text: "" }));
              }}
              placeholder="اكتب نص البند هنا..."
            />
            <Form.Control.Feedback type="invalid">
              {errors.term_text}
            </Form.Control.Feedback>
          </Form.Group>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onHide} disabled={loading}>
          إلغاء
        </Button>

        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={loading}
          className="px-4 d-flex align-items-center gap-2"
        >
          {loading && <Spinner animation="border" size="sm" />}
          إضافة
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddContractTermModal;
