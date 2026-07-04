import React, { useState } from "react";
import "./AddCoefficientModal.css";
import api from "../Api/Api";
import { endpoints } from "../Api/Endpoints";
import { toast } from "react-toastify";
import { handleAxiosError } from "../Utils/ErrorHandler";

const AddCoefficientModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    value: "",
  });

  const [errors, setErrors] = useState({});

  // منع إدخال HTML
  const stripHtml = (value) => {
    const div = document.createElement("div");

    div.innerHTML = value;

    return div.textContent || div.innerText || "";
  };

  // تغيير القيم + تصفير الخطأ
  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setErrors({});

    try {
      const response = await api.post(
        endpoints.coefficients.create,
        formData,
      );

      if (response.status === 200) {
        toast.success(response.data.message);

        onSuccess();

        onClose();

        setFormData({
          name: "",
          value: "",
        });
      }
    } catch (error) {

      if (error.response?.status === 422) {

        const backendErrors = error.response.data.errors;

        setErrors({
          name: backendErrors?.name?.join("، "),

          value: backendErrors?.value?.join("، "),
        });

        return;
      }

      toast.error(handleAxiosError(error));
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h3 className="modal-title">إضافة معامل جديد</h3>

        <form onSubmit={handleSubmit}>
          <div className="modal-field">
            <label>الاسم</label>

            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange("name", stripHtml(e.target.value))}
              className={errors?.name ? "input-error" : ""}
            />

            {errors?.name && <p className="error-text">{errors.name}</p>}
          </div>

          <div className="modal-field">
            <label>القيمة</label>

            <input
              type="number"
              value={formData.value}
              onChange={(e) => handleChange("value", e.target.value)}
              className={errors?.value ? "input-error" : ""}
              onWheel={(e) => e.target.blur()}
            />

            {errors?.value && <p className="error-text">{errors.value}</p>}
          </div>

          <div className="modal-actions">
            <button type="submit" className="btn-add">
              إضافة
            </button>

            <button type="button" className="btn-cancel" onClick={onClose}>
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCoefficientModal;
