import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import api from "../Api/Api";
import { endpoints } from "../Api/Endpoints";
import { handleAxiosError } from "../Utils/ErrorHandler";

const AddAdminModal = ({ show, onHide, onSuccess }) => {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
  });

  const [errors, setErrors] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (show) {
      setForm({
        first_name: "",
        last_name: "",
        email: "",
        phone_number: "",
      });

      setErrors({
        first_name: "",
        last_name: "",
        email: "",
        phone_number: "",
      });
    }
  }, [show]);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    // تحقق بسيط قبل الإرسال
    const newErrors = {
      first_name: !form.first_name.trim() ? "الاسم الأول مطلوب" : "",
      last_name: !form.last_name.trim() ? "الاسم الأخير مطلوب" : "",
      email: !form.email.trim() ? "البريد الإلكتروني مطلوب" : "",
      phone_number: !form.phone_number.trim() ? "رقم الهاتف مطلوب" : "",
    };

    if (
      newErrors.first_name ||
      newErrors.last_name ||
      newErrors.email ||
      newErrors.phone_number
    ) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      const response = await api.post(endpoints.employees.create, {
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        phone_number: form.phone_number,
      });

      if (response.status === 200) {
        toast.success(response.data.message || "تمت إضافة الموظف بنجاح");

        onHide();
        if (onSuccess) await onSuccess();
      }
    } catch (err) {
      if (err.response?.status === 422) {
        const backendErrors = err.response.data.errors || {};

        setErrors({
          first_name: backendErrors?.first_name?.join("، ") || "",
          last_name: backendErrors?.last_name?.join("، ") || "",
          email: backendErrors?.email?.join("، ") || "",
          phone_number: backendErrors?.phone_number?.join("، ") || "",
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
        <Modal.Title className="fw-bold text-primary">
          إضافة موظف جديد
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          {/* First Name */}
          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">
              الاسم الأول <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              disabled={loading}
              isInvalid={!!errors.first_name}
              value={form.first_name}
              onChange={(e) => {
                setForm({ ...form, first_name: e.target.value });
                if (e.target.value.trim())
                  setErrors((prev) => ({ ...prev, first_name: "" }));
              }}
              placeholder=" الاسم الأول..."
            />
            <Form.Control.Feedback type="invalid">
              {errors.first_name}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">
              الاسم الأخير <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              disabled={loading}
              isInvalid={!!errors.last_name}
              value={form.last_name}
              onChange={(e) => {
                setForm({ ...form, last_name: e.target.value });
                if (e.target.value.trim())
                  setErrors((prev) => ({ ...prev, last_name: "" }));
              }}
              placeholder=" الاسم الأخير..."
            />
            <Form.Control.Feedback type="invalid">
              {errors.last_name}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">
              البريد الإلكتروني <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="email"
              disabled={loading}
              isInvalid={!!errors.email}
              value={form.email}
              onChange={(e) => {
                setForm({ ...form, email: e.target.value });
                if (e.target.value.trim())
                  setErrors((prev) => ({ ...prev, email: "" }));
              }}
              placeholder="example@email.com"
            />
            <Form.Control.Feedback type="invalid">
              {errors.email}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">
              رقم الهاتف <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              disabled={loading}
              isInvalid={!!errors.phone_number}
              value={form.phone_number}
              onChange={(e) => {
                setForm({ ...form, phone_number: e.target.value });
                if (e.target.value.trim())
                  setErrors((prev) => ({ ...prev, phone_number: "" }));
              }}
              placeholder="09xxxxxxxx"
              style={{ direction: "rtl", textAlign: "right" }}
            />
            <Form.Control.Feedback type="invalid">
              {errors.phone_number}
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

export default AddAdminModal;
