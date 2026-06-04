import React, { useState } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import api from "../Api/Api";
import { toast } from "react-toastify";
import { handleAxiosError } from "../Utils/ErrorHandler";
import { endpoints } from "../Api/Endpoints";

const TaxModal = ({ show, handleClose, driverId, onTaxImposed }) => {
  const [taxValue, setTaxValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!taxValue.trim()) {
      setValidationErrors({ value: ["قيمة الضريبة مطلوبة"] });
      return;
    }
    setLoading(true);
    setValidationErrors({});

    try {
      const response = await api.post(endpoints.drivers.tax, {
        driver_id: driverId,
        value: parseInt(taxValue, 10),
      });

      if (
        response.status === 200 &&
        response.data.message === "تم فرض ضريبة على هذا السائق"
      ) {
        setTaxValue("");
        toast.success("تم فرض الضريبة بنجاح!");
        handleClose();
        if (onTaxImposed) onTaxImposed();
      }
    } catch (error) {
      if (error.response && error.response.status === 422) {
        setValidationErrors(error.response.data.errors || {});
      } else {
        toast.error(handleAxiosError(error));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setTaxValue("");
    setValidationErrors({});
    handleClose();
  };

  return (
    <Modal
      show={show}
      onHide={handleModalClose}
      centered
      backdrop="static"
      className="tn-admin-modal"
    >
      <Modal.Header closeButton className="border-bottom-0 pb-0">
        <Modal.Title className="fw-bold fs-5 text-dark">
          فرض ضريبة / غرامة جديدة
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body className="pt-3">
          <Form.Group className="mb-2">
            <Form.Label className="text-muted small fw-bold">
              قيمة الضريبة (ل.س)
            </Form.Label>
            <Form.Control
              type="number"
              placeholder="أدخل قيمة الضريبة الرقمية الصافية..."
              value={taxValue}
              onChange={(e) => {
                setTaxValue(e.target.value);
                if (e.target.value.trim()) setValidationErrors({});
              }}
              disabled={loading}
              isInvalid={!!validationErrors.value}
              className="py-2 px-3 border-admin rounded-3 tax-value"
              style={{ fontSize: "0.95rem" }}
            />
            <Form.Control.Feedback type="invalid" className="fw-bold">
              {validationErrors.value && validationErrors.value[0]}
            </Form.Control.Feedback>
          </Form.Group>
        </Modal.Body>

        <Modal.Footer className="border-top-0 pt-0 gap-2">
          <Button
            variant="light"
            onClick={handleModalClose}
            disabled={loading}
            className="px-4 py-2 text-secondary fw-bold rounded-3"
            style={{ fontSize: "0.9rem" }}
          >
            إلغاء
          </Button>
          <Button
            variant="danger"
            type="submit"
            disabled={loading}
            className="px-4 py-2 fw-bold rounded-3 d-flex align-items-center gap-2"
            style={{ fontSize: "0.9rem" }}
          >
            {loading ? (
              <>
                <Spinner
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                />
                جاري المعالجة...
              </>
            ) : (
              "تأكيد"
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default TaxModal;
