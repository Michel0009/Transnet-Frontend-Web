import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button, Spinner } from "react-bootstrap";
import { FaTrash, FaEdit } from "react-icons/fa";
import api from "../../Api/Api";
import { handleAxiosError } from "../../Utils/ErrorHandler";
import { endpoints } from "../../Api/Endpoints";
import { toast } from "react-toastify";
import DeleteContractTermModal from "../../Components/DeleteContractTermModal";
import AddContractTermModal from "../../Components/AddContractTermModal";

import "./ContractTerms.css";
import AddContractModal from "../../Components/AddContractModal";

const ContractTerms = () => {
  const [terms, setTerms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTermId, setSelectedTermId] = useState(null);
  const [showAddContractModal, setShowAddContractModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editedOrder, setEditedOrder] = useState("");

  const fetchTerms = async () => {
    setLoading(true);
    try {
      const response = await api.get(endpoints.terms.get);

      if (response.status === 200) {
        setTerms(response.data);
      }
    } catch (error) {
      toast.error(handleAxiosError(error));
    } finally {
      setTimeout(() => setLoading(false), 400);
    }
  };

  const saveOrder = async (term) => {
    const originalOrder = Number(term.order);
    const newOrder = Number(editedOrder);

    // لا تحفظ إذا لم يتغير الرقم
    if (newOrder === originalOrder) {
      setEditingId(null);
      return;
    }

    try {
      const response = await api.put(endpoints.terms.update(term.id), {
        order: newOrder,
      });

      if (response.status === 200) {
        toast.success("تم تعديل ترتيب البند بنجاح");
        setEditingId(null);
        fetchTerms();
      }
    } catch (error) {
      if (error.response && error.response.status === 422) {
        const backendMessage =
          error.response.data?.errors?.order?.[0] ||
          error.response.data?.message;
        toast.error(backendMessage);
        return;
      }
      toast.error(handleAxiosError(error));
    }
  };

  useEffect(() => {
    fetchTerms();
  }, []);

  if (loading)
    return (
      <div className="d-flex flex-column justify-content-center align-items-center vh-100">
        <Spinner animation="grow" className="tn-load-orange" />
        <span className="mt-3 text-muted fw-semibold">
          جاري تحميل العقود...
        </span>
      </div>
    );

  return (
    <div className="tn-main-content contract-page" dir="rtl">
      <header className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="contract-title mb-2">البنود والشروط</h2>

          <p className="contract-subtitle mb-0">
            قم بمراجعة وتحديث البنود القانونية التي تحكم العلاقة التعاقدية بين
            النظام والشركات لضمان أعلى مستويات الشفافية والأمان.
          </p>
        </div>

        <div className="d-flex gap-2 flex-wrap">
          <Button
            className="contract-add-btn fw-bold"
            onClick={() => setShowAddModal(true)}
          >
            إضافة بند +
          </Button>

          <Button
            className="contract-add-btn fw-bold"
            onClick={() => setShowAddContractModal(true)}
          >
            إضافة عقد +
          </Button>
        </div>
      </header>

      <Container fluid className="p-0">
        <Row className="justify-content-center">
          <Col md={11}>
            <Card className="contract-wrapper border-0 shadow-sm">
              <Card.Body className="p-3">
                <div className="d-flex flex-column gap-3">
                  {terms.map((term) => (
                    <Card key={term.id} className="contract-item border-0">
                      <Card.Body className="p-4">
                        <div className="d-flex align-items-center justify-content-between gap-3">
                          <div className="d-flex align-items-center gap-3 flex-grow-1 min-w-0">
                            <div className="contract-number">
                              {editingId === term.id ? (
                                <input
                                  type="number"
                                  className="contract-order-input"
                                  value={editedOrder}
                                  autoFocus
                                  onChange={(e) =>
                                    setEditedOrder(e.target.value)
                                  }
                                  onBlur={() => setEditingId(null)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") saveOrder(term);
                                  }}
                                />
                              ) : (
                                String(term.order).padStart(2, "0")
                              )}
                            </div>

                            <div className="contract-text">
                              {term.term_text}
                            </div>
                          </div>

                          <button
                            className="contract-delete-btn"
                            onClick={() => {
                              setSelectedTermId(term.id);
                              setShowDeleteModal(true);
                            }}
                          >
                            <FaTrash />
                          </button>
                          <button
                            className="contract-edit-btn"
                            onClick={() => {
                              setEditingId(term.id);
                              setEditedOrder(term.order);
                            }}
                          >
                            <FaEdit />
                          </button>
                        </div>
                      </Card.Body>
                    </Card>
                  ))}
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      <AddContractTermModal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        onSuccess={fetchTerms}
      />
      <DeleteContractTermModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        termId={selectedTermId}
        onSuccess={fetchTerms}
      />

      <AddContractModal
        show={showAddContractModal}
        onHide={() => setShowAddContractModal(false)}
        onSuccess={fetchTerms}
      />
    </div>
  );
};

export default ContractTerms;
