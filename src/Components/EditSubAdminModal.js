import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";

import api from "../Api/Api";
import { endpoints } from "../Api/Endpoints";
import { handleAxiosError } from "../Utils/ErrorHandler";

const EditAdminModal = ({
  show,
  onHide,
  adminData,
  onSuccess,
}) => {

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    phone_number: "",
  });

  const [originalForm, setOriginalForm] = useState({
    first_name: "",
    last_name: "",
    phone_number: "",
  });

  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({
    first_name: "",
    last_name: "",
    phone_number: "",
  });

  useEffect(() => {

    if (show && adminData) {

      const data = {
        first_name: adminData.first_name || "",
        last_name: adminData.last_name || "",
        phone_number: adminData.phone_number || "",
      };

      setForm(data);

      setOriginalForm(data);

      setErrors({
        first_name: "",
        last_name: "",
        phone_number: "",
      });
    }

  }, [show, adminData]);

  const handleSubmit = async (e) => {

    e.preventDefault();

    const updatedFields = {};

    if (form.first_name !== originalForm.first_name) {
      updatedFields.first_name = form.first_name;
    }

    if (form.last_name !== originalForm.last_name) {
      updatedFields.last_name = form.last_name;
    }

    if (form.phone_number !== originalForm.phone_number) {
      updatedFields.phone_number = form.phone_number;
    }

    if (Object.keys(updatedFields).length === 0) {

      toast.info("لم تقم بإجراء أي تعديل");

      return;
    }

    setLoading(true);

    try {

      const response = await api.put(
        `${endpoints.employees.update}/${adminData.id}`,
        updatedFields
      );

      if (
        response.status === 200 &&
        response.data.message === "تم تعديل الموظف بنجاح"
      ) {

        toast.success(response.data.message);

        onHide();

        if (onSuccess) {
          await onSuccess();
        }
      }

    } catch (error) {

      if (error.response?.status === 422) {

        const backendErrors = error.response.data.errors || {};

        setErrors({
          first_name: backendErrors?.first_name?.join("، ") || "",
          last_name: backendErrors?.last_name?.join("، ") || "",
          phone_number: backendErrors?.phone_number?.join("، ") || "",
        });

        return;
      }

      toast.error(handleAxiosError(error));

    } finally {

      setLoading(false);
    }
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      dir="rtl"
    >

      <Modal.Header closeButton>
        <Modal.Title className="text-primary d-flex align-items-center gap-2">
          تعديل بيانات المسؤول
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>

        <Form onSubmit={handleSubmit}>

          <Form.Group className="mb-3">

            <Form.Label className="fw-bold">
              الاسم الأول
            </Form.Label>

            <Form.Control
              type="text"
              disabled={loading}
              value={form.first_name}
              isInvalid={!!errors.first_name}
              onChange={(e) => {

                setForm({
                  ...form,
                  first_name: e.target.value,
                });

                if (e.target.value.trim()) {

                  setErrors((prev) => ({
                    ...prev,
                    first_name: "",
                  }));
                }
              }}
            />

            <Form.Control.Feedback type="invalid">
              {errors.first_name}
            </Form.Control.Feedback>

          </Form.Group>

          <Form.Group className="mb-3">

            <Form.Label className="fw-bold">
              الاسم الأخير
            </Form.Label>

            <Form.Control
              type="text"
              disabled={loading}
              value={form.last_name}
              isInvalid={!!errors.last_name}
              onChange={(e) => {

                setForm({
                  ...form,
                  last_name: e.target.value,
                });

                if (e.target.value.trim()) {

                  setErrors((prev) => ({
                    ...prev,
                    last_name: "",
                  }));
                }
              }}
            />

            <Form.Control.Feedback type="invalid">
              {errors.last_name}
            </Form.Control.Feedback>

          </Form.Group>

          <Form.Group>

            <Form.Label className="fw-bold">
              رقم الهاتف
            </Form.Label>

            <Form.Control
              type="text"
              disabled={loading}
              value={form.phone_number}
              isInvalid={!!errors.phone_number}
              onChange={(e) => {

                setForm({
                  ...form,
                  phone_number: e.target.value,
                });

                if (e.target.value.trim()) {

                  setErrors((prev) => ({
                    ...prev,
                    phone_number: "",
                  }));
                }
              }}
            />

            <Form.Control.Feedback type="invalid">
              {errors.phone_number}
            </Form.Control.Feedback>

          </Form.Group>

        </Form>

      </Modal.Body>

      <Modal.Footer>

        <Button
          variant="outline-secondary"
          onClick={onHide}
          disabled={loading}
        >
          إلغاء
        </Button>

        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={loading}
          className="d-flex align-items-center gap-2 px-4"
        >

          {loading && (
            <Spinner
              animation="border"
              size="sm"
            />
          )}

          حفظ التعديلات

        </Button>

      </Modal.Footer>

    </Modal>
  );
};

export default EditAdminModal;