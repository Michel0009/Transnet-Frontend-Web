import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import api from "../Api/Api";
import { endpoints } from "../Api/Endpoints";
import { handleAxiosError } from "../Utils/ErrorHandler";

const NotificationAllModal = ({ show, onHide }) => {
  const [notificationText, setNotificationText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (show) {
      setNotificationText("");
      setError("");
    }
  }, [show]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!notificationText.trim()) {
      setError("نص الإشعار مطلوب");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await api.post(endpoints.reports.sendNotificationAll, {
        notification_text: notificationText,
      });

      if (
        response.status === 200 &&
        response.data.message ===
          "تم إرسال هذا الإشعار لجميع مستخدمين التطبيق بنجاح"
      ) {
        toast.success(response.data.message);
        onHide();
      }
    } catch (err) {
      if (err.response && err.response.status === 422) {
        const backendErrors = err.response.data.errors;
        if (backendErrors && backendErrors.notification_text) {
          setError(backendErrors.notification_text[0]);
        }
      } else {
        toast.error(handleAxiosError(err));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered dir="rtl">
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="fw-bold fs-5 text-dark">
          إرسال إشعار عام لجميع المستخدمين 📢
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <p className="text-muted small mb-4">
            تنبيه: سيتم إرسال هذا النص كإشعار مباشر لجميع الحسابات
            النشطة في النظام (السائقين والمستخدمين).
          </p>

          {/* حقل نص الإشعار الوحيد */}
          <Form.Group controlId="notificationTextField">
            <Form.Label className="small fw-bold">
              نص الإشعار <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={5}
              placeholder="اكتب رسالتك العامة هنا..."
              value={notificationText}
              disabled={loading}
              isInvalid={!!error}
              style={{ resize: "none" }}
              onChange={(e) => {
                setNotificationText(e.target.value);
                if (error) setError("");
              }}
            />
            <Form.Control.Feedback type="invalid">
              {error}
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
            variant="primary"
            type="submit"
            disabled={loading || !notificationText.trim()}
            className="fw-bold px-4 d-flex align-items-center gap-2"
          >
            {loading && <Spinner animation="border" size="sm" />}
            إرسال الآن
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default NotificationAllModal;
