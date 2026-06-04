import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import api from "../Api/Api";
import { endpoints } from "../Api/Endpoints";
import { handleAxiosError } from "../Utils/ErrorHandler";

const WarningModal = ({ show, onHide, userId, userName, onSuccess }) => {
  const [warningText, setWarningText] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (show) {
      setWarningText("");
      setErrors({});
    }
  }, [show]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const response = await api.post(endpoints.reports.sendWarning, {
        user_id: userId,
        warning_text: warningText,
      });

      if (
        response.status === 200 &&
        response.data.message === "تم إرسال التنبيه للمستخدم بنجاح"
      ) {
        toast.success(response.data.message);
        onHide();

        if (onSuccess) await onSuccess();
      }
    } catch (error) {
      if (error.response && error.response.status === 422) {
        const validationErrors = error.response.data.errors;
        setErrors(validationErrors);

        if (validationErrors.user_id) {
          toast.error(validationErrors.user_id[0]);
        }
      } else {
        toast.error(handleAxiosError(error));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered dir="rtl">
      <Modal.Header className="border-0 pb-0" closeButton>
        <Modal.Title className="fw-bold fs-5 text-danger">
          إرسال إنذار للمستخدم
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <p className="text-muted small mb-3">
            أنت تقوم بإرسال إنذار إلى المستخدم: <strong>{userName}</strong>
          </p>

          <Form.Group controlId="warningText">
            <Form.Label className="small fw-bold">
              نص الإنذار <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              placeholder="اكتب نص الإنذار هنا..."
              value={warningText}
              onChange={(e) => {
                setWarningText(e.target.value);
                if (errors.warning_text) {
                  setErrors({ ...errors, warning_text: null });
                }
              }}
              isInvalid={!!errors.warning_text}
              disabled={loading}
              style={{ resize: "none" }}
            />
            <Form.Control.Feedback type="invalid">
              {errors.warning_text && errors.warning_text[0]}
            </Form.Control.Feedback>
          </Form.Group>
        </Modal.Body>

        <Modal.Footer className="border-0 pt-0">
          <Button
            variant="light"
            onClick={onHide}
            disabled={loading}
            className="fw-bold px-4"
          >
            إلغاء
          </Button>
          <Button
            variant="danger"
            type="submit"
            disabled={loading || !warningText.trim()}
            className="fw-bold px-4 d-flex align-items-center gap-2"
          >
            {loading && <Spinner animation="border" size="sm" />}
            إرسال الإنذار
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default WarningModal;
