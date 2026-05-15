import React, { useEffect, useState } from "react";
import "./PricingSettings.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMoneyBillWave,
  faGasPump,
  faBolt,
  faShieldAlt,
} from "@fortawesome/free-solid-svg-icons";
import api from "../../Api/Api";
import { endpoints } from "../../Api/Endpoints";
import { handleAxiosError } from "../../Utils/ErrorHandler";
import LoadingScreen from "../../Components/LoadingScreen";
import { toast } from "react-toastify";
import AddCoefficientModal from "../../Components/AddCoefficientModal";

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
      const response = await api.get(endpoints.admin.gitCoefficients);

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

  if (loading) return <LoadingScreen />;

  // تقسيم البيانات حسب النوع
  const pricing = coefficients.filter((item) => item.type === "pricing");

  const fuelPrices = coefficients.filter((item) => item.type === "fuel_price");

  const insurance = coefficients.filter((item) => item.type === "insurance");

  // اختيار الأيقونة حسب النوع
  const getIcon = (type, name) => {
    if (type === "pricing") return faMoneyBillWave;

    if (type === "insurance") return faShieldAlt;

    if (type === "fuel_price") {
      if (name.includes("كهرباء")) return faBolt;

      return faGasPump;
    }
  };

  // بدء التعديل
  const handleEdit = (item) => {
    setEditId(item.id);

    setEditValue(item.value);

    setEditErrors({});
  };

  // حفظ التعديل
  const handleSave = async (item) => {
    try {
      const response = await api.put(endpoints.admin.updateCoefficient, {
        coefficient_id: item.id,
        value: editValue,
      });

      // SUCCESS
      if (response.status === 200) {
        toast.success(response.data.message);

        setEditId(null);

        setEditValue("");

        setEditErrors({});

        fetchCoefficients();

        return;
      }
    } catch (error) {
      // VALIDATION ERRORS
      if (error.response?.status === 422) {
        const backendErrors = error.response.data.errors;

        const formattedErrors = {
          value: backendErrors?.value ? backendErrors.value.join("، ") : null,
        };

        setEditErrors(formattedErrors);

        return;
      }

      // OTHER ERRORS
      toast.error(handleAxiosError(error));
    }
  };

  // إلغاء التعديل
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
    <div className="pricing-page" dir="rtl">
      <div className="page-header">
        <h1>إعدادات معايير الوقود و التسعير</h1>

        <p>إدارة وتعديل أسعار المحروقات ومدخلات النظام الأساسية للنظام</p>
      </div>

      <div className="section pricing-section">
        <h2 className="section-title">التسعير</h2>

        {pricing.map((item) => (
          <div key={item.id} className="col-12 col-md-6 col-lg-3">
            <div className="card custom-card">
              <div className="card-header-custom">
                <h3 className="card-title">{item.name}</h3>

                <div className="card-icon">
                  <FontAwesomeIcon icon={getIcon(item.type, item.name)} />
                </div>
              </div>

              <div className="card-footer-custom">
                {editId === item.id ? (
                  <div className="edit-row">
                    <div className="edit-field">
                      <input
                        type="text"
                        className={`edit-input ${
                          editErrors?.value ? "input-error" : ""
                        }`}
                        value={editValue}
                        onChange={(e) => handleEditChange(e.target.value)}
                      />

                      {editErrors?.value && (
                        <p className="error-text">{editErrors.value}</p>
                      )}
                    </div>

                    <button
                      className="btn-save-card"
                      onClick={() => handleSave(item)}
                    >
                      حفظ
                    </button>

                    <button className="btn-cancel-card" onClick={handleCancel}>
                      إلغاء
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="value">
                      {parseFloat(item.value).toLocaleString()}
                    </p>

                    <button
                      className="btn-edit-card"
                      onClick={() => handleEdit(item)}
                    >
                      تعديل
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Section: Fuel */}
      <div className="section fuel-section">
        <div className="section-header">
          <h2 className="section-title">أسعار الوقود</h2>

          <button className="btn-add" onClick={() => setShowModal(true)}>
            إضافة جديد
          </button>
        </div>

        <div className="row">
          {fuelPrices.map((item) => (
            <div key={item.id} className="col-12 col-md-6 col-lg-3">
              <div className="card custom-card">
                <div className="card-header-custom">
                  <h3 className="card-title">{item.name}</h3>

                  <div className="card-icon">
                    <FontAwesomeIcon icon={getIcon(item.type, item.name)} />
                  </div>
                </div>

                <div className="card-footer-custom">
                  {editId === item.id ? (
                    <div className="edit-row">
                      <div className="edit-field">
                        <input
                          type="text"
                          className={`edit-input ${
                            editErrors?.value ? "input-error" : ""
                          }`}
                          value={editValue}
                          onChange={(e) => handleEditChange(e.target.value)}
                        />

                        {editErrors?.value && (
                          <p className="error-text">{editErrors.value}</p>
                        )}
                      </div>

                      <button
                        className="btn-save-card"
                        onClick={() => handleSave(item)}
                      >
                        حفظ
                      </button>

                      <button
                        className="btn-cancel-card"
                        onClick={handleCancel}
                      >
                        إلغاء
                      </button>
                    </div>
                  ) : (
                    <>
                      <p className="value">
                        {parseFloat(item.value).toLocaleString()}
                      </p>

                      <button
                        className="btn-edit-card"
                        onClick={() => handleEdit(item)}
                      >
                        تعديل
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section: Insurance */}
      <div className="section insurance-section">
        <h2 className="section-title">التأمينات</h2>

        {insurance.map((item) => (
          <div key={item.id} className="col-12 col-md-6 col-lg-3">
            <div className="card custom-card">
              <div className="card-header-custom">
                <h3 className="card-title">{item.name}</h3>

                <div className="card-icon">
                  <FontAwesomeIcon icon={getIcon(item.type, item.name)} />
                </div>
              </div>

              <div className="card-footer-custom">
                {editId === item.id ? (
                  <div className="edit-row">
                    <div className="edit-field">
                      <input
                        type="text"
                        className={`edit-input ${
                          editErrors?.value ? "input-error" : ""
                        }`}
                        value={editValue}
                        onChange={(e) => handleEditChange(e.target.value)}
                      />

                      {editErrors?.value && (
                        <p className="error-text">{editErrors.value}</p>
                      )}
                    </div>

                    <button
                      className="btn-save-card"
                      onClick={() => handleSave(item)}
                    >
                      حفظ
                    </button>

                    <button className="btn-cancel-card" onClick={handleCancel}>
                      إلغاء
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="value">
                      {parseFloat(item.value).toLocaleString()}%
                    </p>

                    <button
                      className="btn-edit-card"
                      onClick={() => handleEdit(item)}
                    >
                      تعديل
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
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
    </div>
  );
};

export default PricingSettings;
