import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import api from "../Api/Api";
import { endpoints } from "../Api/Endpoints";
import { handleAxiosError } from "../Utils/ErrorHandler";

const BlockModal = ({ show, onHide, userId, onSuccess }) => {
  const [form, setForm] = useState({
    explaination: "",
    days_number: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (show) {
      setForm({ explaination: "", days_number: "" });
      setError("");
    }
  }, [show]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.explaination.trim()) {
      setError("سبب الحظر مطلوب");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post(endpoints.general.block, {
        id: userId,
        explaination: form.explaination,
        days_number: form.days_number || null,
      });

      if (
        response.status === 200 &&
        response.data.message === "تم حظر المستخدم بنجاح"
      ) {
        toast.success(response.data.message);
        onHide();
        if (onSuccess) await onSuccess();
      }
    } catch (err) {
      if (err.response?.status === 422) {
        const msg = err.response?.data?.message;
        const deadline = err.response?.data?.deadline;
        toast.warning(
          `${msg} ${deadline ? `\nموعد التسليم: ${deadline}` : ""}`,
        );
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
        <Modal.Title className="text-danger fw-bold">حظر المستخدم</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">
              سبب الحظر <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              isInvalid={!!error}
              disabled={loading}
              placeholder="اكتب سبب الحظر هنا..."
              value={form.explaination}
              onChange={(e) => {
                setForm({ ...form, explaination: e.target.value });
                if (e.target.value.trim()) setError("");
              }}
            />
            <Form.Control.Feedback type="invalid">
              {error}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">
              مدة الحظر بالأيام (اختياري)
            </Form.Label>
            <Form.Control
              type="number"
              disabled={loading}
              placeholder="مثال: 7 (اتركه فارغاً للحظر الدائم)"
              value={form.days_number}
              onChange={(e) =>
                setForm({ ...form, days_number: e.target.value })
              }
              style={{
                direction: "rtl",
                textAlign: "right",
                appearance: "auto",
              }}
            />
            <Form.Text className="text-muted small">
              في حال ترك الحقل فارغاً، سيتم حظر الحساب بشكل دائم.
            </Form.Text>
          </Form.Group>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onHide} disabled={loading}>
          إلغاء
        </Button>
        <Button
          variant="danger"
          onClick={handleSubmit}
          className="px-4 d-flex align-items-center gap-2"
          disabled={loading}
        >
          {loading && <Spinner animation="border" size="sm" />}
          تأكيد الحظر
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default BlockModal;
