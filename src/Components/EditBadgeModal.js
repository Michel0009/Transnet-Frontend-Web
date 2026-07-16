import React from "react";
import { Modal, Form, Button } from "react-bootstrap";
import "./EditBadgeModal.css";

const EditBadgeModal = ({
  show,
  onHide,
  onSubmit,
  selectedBadge,
  conditionValue,
  setConditionValue,
  updateLoading,
}) => {
  return (
    <Modal
      show={show}
      onHide={() => !updateLoading && onHide()}
      centered
      className="tn-badge-modal-wrapper"
    >
      <Modal.Header
        closeButtonClassName="ms-0 me-auto tn-modal-close-btn"
        className="border-0 pb-0"
        closeButton
      >
        <Modal.Title className="fw-bold fs-5 text-dark font-tajawal">
          تعديل معايير شارة ({selectedBadge?.name})
        </Modal.Title>
      </Modal.Header>
      
      <Form onSubmit={onSubmit}>
        <Modal.Body className="py-4">
          <Form.Group className="mb-3">
            <Form.Label className="fw-bold text-secondary small mb-2 font-tajawal">
              عدد الشحنات المتتالية الناجحة المطلوبة
            </Form.Label>
            <Form.Control
              type="number"
              min="0"
              className="tn-s-filter-select font-tajawal"
              style={{ height: "46px" }}
              value={conditionValue}
              onChange={(e) => setConditionValue(e.target.value)}
              required
              disabled={updateLoading}
            />
            <Form.Text className="text-muted font-tajawal mt-2 d-block">
              ضع القيمة 0 إذا كانت الشارة تُمنح بمجرد التوثيق دون شروط شحن إضافية.
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        
        <Modal.Footer className="border-0 pt-0">
          <Button
            variant="light"
            onClick={onHide}
            disabled={updateLoading}
            className="fw-semibold px-4 font-tajawal"
            style={{ borderRadius: "10px" }}
          >
            إلغاء
          </Button>
          <Button
            type="submit"
            disabled={updateLoading}
            className="tn-s-apply-filter-btn font-tajawal"
          >
            {updateLoading ? "جاري الحفظ..." : "حفظ التعديلات"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default EditBadgeModal;