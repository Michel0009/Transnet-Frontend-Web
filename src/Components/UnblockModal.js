import React from "react";
import { Modal, Button } from "react-bootstrap";
import { FaUnlock } from "react-icons/fa";

const UnblockModal = ({ show, onHide, onConfirm }) => {
  return (
    <Modal show={show} onHide={onHide} centered>
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
        <Button variant="secondary" className="px-4" onClick={onHide}>
          إلغاء
        </Button>
        <Button variant="success" className="px-4" onClick={onConfirm}>
          نعم، فك الحظر
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default UnblockModal;
