import React, { useEffect, useState } from "react";
import "./PricingSettings.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMoneyBillWave,
  faGasPump,
  faBolt,
  faAward,
} from "@fortawesome/free-solid-svg-icons";
import api from "../../Api/Api";
import { endpoints } from "../../Api/Endpoints";
import { handleAxiosError } from "../../Utils/ErrorHandler";

import { toast } from "react-toastify";
import AddCoefficientModal from "../../Components/AddCoefficientModal";
import { Container, Spinner } from "react-bootstrap";

const PricingSettings = () => {
  const [coefficients, setcoefficients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editErrors, setEditErrors] = useState({});

  const fetchCoefficients = async () => {
    setLoading(true);

    try {
      const response = await api.get(endpoints.coefficients.get);

      if (response.status === 200) {
        setcoefficients(response.data);
      }
    } catch (error) {
      toast.error(handleAxiosError(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoefficients();
  }, []);

  if (loading)
    return (
      <div className="d-flex flex-column justify-content-center align-items-center vh-100">
        <Spinner animation="grow" className="tn-load-orange" />

        <span className="mt-3 text-muted fw-semibold">
          جاري تحميل التسعيرات...
        </span>
      </div>
    );

  const pricing = coefficients.filter((item) => item.type === "pricing");

  const fuelPrices = coefficients.filter((item) => item.type === "fuel_price");

  const reward = coefficients.filter((item) => item.type === "reward");

  const getIcon = (type, name) => {
    if (type === "pricing") return faMoneyBillWave;

    if (type === "reward") return faAward;

    if (type === "fuel_price") {
      if (name.includes("كهرباء")) return faBolt;

      return faGasPump;
    }
  };

  const handleEdit = (item) => {
    setEditId(item.id);

    setEditValue(item.value);

    setEditErrors({});
  };

  const handleSave = async (item) => {
    try {
      const response = await api.put(endpoints.coefficients.update, {
        coefficient_id: item.id,
        value: editValue,
      });

      if (response.status === 200) {
        toast.success(response.data.message);

        setEditId(null);

        setEditValue("");

        setEditErrors({});

        fetchCoefficients();

        return;
      }
    } catch (error) {
      if (error.response?.status === 422) {
        const backendErrors = error.response.data.errors;

        const formattedErrors = {
          value: backendErrors?.value ? backendErrors.value.join("، ") : null,
        };

        setEditErrors(formattedErrors);

        return;
      }

      toast.error(handleAxiosError(error));
    }
  };

  const handleCancel = () => {
    setEditId(null);

    setEditValue("");

    setEditErrors({});
  };

  const handleEditChange = (value) => {
    setEditValue(value);

    if (editErrors.value) {
      setEditErrors((prev) => ({
        ...prev,
        value: "",
      }));
    }
  };

  return (
    <div className="tn-main-content" dir="rtl">
      <header className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold tn-navy">إعدادات معايير الوقود و التسعير</h2>
      </header>
      <Container fluid className="p-0">
        <div className="section pricing-section mb-5">
          <h2 className="section-title mb-4">التسعير</h2>

          <div className="row g-4">
            {pricing.map((item) => (
              <div key={item.id} className="col-12 col-md-6 col-lg-3">
                <div className="card custom-card h-100 border-0">
                  <div className="card-header-custom d-flex justify-content-between align-items-center mb-3">
                    <h3 className="card-title mb-0">التسعيرة الأساسية</h3>

                    <div className="card-icon">
                      <FontAwesomeIcon icon={getIcon(item.type, item.name)} />
                    </div>
                  </div>

                  <div className="card-footer-custom mt-auto">
                    {editId === item.id ? (
                      <div className="edit-row d-flex align-items-start gap-2 flex-wrap w-100">
                        <div className="edit-field flex-grow-1">
                          <input
                            type="text"
                            className={`form-control edit-input ${
                              editErrors?.value ? "is-invalid" : ""
                            }`}
                            value={editValue}
                            onChange={(e) => handleEditChange(e.target.value)}
                          />

                          {editErrors?.value && (
                            <div className="invalid-feedback d-block">
                              {editErrors.value}
                            </div>
                          )}
                        </div>

                        <button
                          className="tn-btn-save btn-sm"
                          onClick={() => handleSave(item)}
                        >
                          حفظ
                        </button>

                        <button
                          className="tn-btn-cancel btn-sm"
                          onClick={handleCancel}
                        >
                          إلغاء
                        </button>
                      </div>
                    ) : (
                      <div className="d-flex justify-content-between align-items-center w-100">
                        <p className="value mb-0">
                          {parseFloat(item.value).toLocaleString()}
                        </p>

                        <button
                          className="tn-btn-edit btn-sm"
                          onClick={() => handleEdit(item)}
                        >
                          تعديل
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="section fuel-section mb-5">
          <div className="section-header d-flex justify-content-between align-items-center mb-4">
            <h2 className="section-title mb-0">أسعار الوقود</h2>

            <button
              className="tn-btn-orange fw-bold ms-auto"
              onClick={() => setShowModal(true)}
            >
              إضافة جديد +
            </button>
          </div>

          <div className="row g-4">
            {fuelPrices.map((item) => (
              <div key={item.id} className="col-12 col-md-6 col-lg-3">
                <div className="card custom-card h-100 border-0">
                  {/* HEADER */}
                  <div className="card-header-custom d-flex justify-content-between align-items-center mb-3">
                    <h3 className="card-title mb-0">{item.name}</h3>

                    <div className="card-icon">
                      <FontAwesomeIcon icon={getIcon(item.type, item.name)} />
                    </div>
                  </div>

                  <div className="card-footer-custom mt-auto">
                    {editId === item.id ? (
                      <div className="edit-row d-flex align-items-start gap-2 flex-wrap w-100">
                        <div className="edit-field flex-grow-1">
                          <input
                            type="text"
                            className={`form-control edit-input ${
                              editErrors?.value ? "is-invalid" : ""
                            }`}
                            value={editValue}
                            onChange={(e) => handleEditChange(e.target.value)}
                          />

                          {editErrors?.value && (
                            <div className="invalid-feedback d-block">
                              {editErrors.value}
                            </div>
                          )}
                        </div>

                        <button
                          className="tn-btn-save btn-sm"
                          onClick={() => handleSave(item)}
                        >
                          حفظ
                        </button>

                        <button
                          className="tn-btn-cancel btn-sm"
                          onClick={handleCancel}
                        >
                          إلغاء
                        </button>
                      </div>
                    ) : (
                      <div className="d-flex justify-content-between align-items-center w-100">
                        <p className="value mb-0">
                          {parseFloat(item.value).toLocaleString()}
                        </p>

                        <button
                          className="tn-btn-edit btn-sm"
                          onClick={() => handleEdit(item)}
                        >
                          تعديل
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="section reward-section">
          <h2 className="section-title mb-4">المكافئات</h2>

          <div className="row g-4">
            {reward.map((item) => (
              <div key={item.id} className="col-12 col-md-6 col-lg-3">
                <div className="card custom-card h-100 border-0">
                  {/* HEADER */}
                  <div className="card-header-custom d-flex justify-content-between align-items-center mb-3">
                    <h3 className="card-title mb-0">المكافئات</h3>

                    <div className="card-icon">
                      <FontAwesomeIcon icon={getIcon(item.type, item.name)} />
                    </div>
                  </div>

                  {/* BODY */}
                  <div className="card-footer-custom mt-auto">
                    {editId === item.id ? (
                      <div className="edit-row d-flex align-items-start gap-2 flex-wrap w-100">
                        <div className="edit-field flex-grow-1">
                          <input
                            type="text"
                            className={`form-control edit-input ${
                              editErrors?.value ? "is-invalid" : ""
                            }`}
                            value={editValue}
                            onChange={(e) => handleEditChange(e.target.value)}
                          />

                          {editErrors?.value && (
                            <div className="invalid-feedback d-block">
                              {editErrors.value}
                            </div>
                          )}
                        </div>

                        <button
                          className="tn-btn-save btn-sm"
                          onClick={() => handleSave(item)}
                        >
                          حفظ
                        </button>

                        <button
                          className="tn-btn-edit btn-sm"
                          onClick={handleCancel}
                        >
                          إلغاء
                        </button>
                      </div>
                    ) : (
                      <div className="d-flex justify-content-between align-items-center w-100">
                        <p className="value mb-0">
                          {parseFloat(item.value).toLocaleString()}
                        </p>

                        <button
                          className="tn-btn-edit btn-sm"
                          onClick={() => handleEdit(item)}
                        >
                          تعديل
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {showModal && (
          <div className="modal-backdrop-custom">
            <div className="modal-card">
              <AddCoefficientModal
                onClose={() => setShowModal(false)}
                onSuccess={fetchCoefficients}
              />
            </div>
          </div>
        )}
      </Container>
    </div>
  );
};

export default PricingSettings;
