import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";

const BlockModal = ({ show, onHide, onSubmit }) => {
  const [form, setForm] = useState({
    explaination: "",
    days_number: "",
  });

  const [error, setError] = useState("");

  useEffect(() => {
    if (show) {
      setForm({ explaination: "", days_number: "" });
      setError("");
    }
  }, [show]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.explaination.trim()) {
      setError("سبب الحظر مطلوب");
      return;
    }

    setError(""); 
    onSubmit(form);
  };

  return (
    <Modal show={show} onHide={onHide} centered>
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
            <Form.Text className="text-muted">
              في حال ترك الحقل فارغاً، سيتم حظر الحساب بشكل دائم.
            </Form.Text>
          </Form.Group>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onHide}>
          إلغاء
        </Button>
        <Button variant="danger" onClick={handleSubmit} className="px-4">
          تأكيد الحظر
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default BlockModal;
