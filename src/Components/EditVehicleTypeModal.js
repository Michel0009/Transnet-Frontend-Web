import React, { useState, useEffect } from "react";
import api from "../Api/Api";
import { endpoints } from "../Api/Endpoints";
import { handleAxiosError } from "../Utils/ErrorHandler";

import { toast } from "react-toastify";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWrench } from "@fortawesome/free-solid-svg-icons";

import "./AddVehicleTypeForm.css";

export default function EditVehicleTypeModal({
  vehicle,
  setSelectedVehicle,
  onClose,
  onSuccess,
}) {
  const [formData, setFormData] = useState({});
  const [originalData, setOriginalData] = useState({});
  const [errors, setErrors] = useState({});

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

  const stripHtml = (value) => {
    const div = document.createElement("div");

    div.innerHTML = value;

    return div.textContent || div.innerText || "";
  };

  useEffect(() => {
    if (vehicle) {
      setFormData(vehicle);

      setOriginalData(vehicle);
    }
  }, [vehicle]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const updatedFields = {};

    Object.keys(formData).forEach((key) => {
      if (String(formData[key]) !== String(originalData[key])) {
        updatedFields[key] = formData[key];
      }
    });

    if (Object.keys(updatedFields).length === 0) {
      toast.info("لم تقم بإجراء أي تعديل");

      return;
    }

    setErrors({});

    try {
      const response = await api.put(
        `${endpoints.vehicleTypes.update}/${vehicle.id}`,
        updatedFields,
      );

      if (response.status === 200) {
        toast.success("تم تحديث بيانات المركبة بنجاح");

        setSelectedVehicle((prev) => ({
          ...prev,
          ...updatedFields,
        }));

        onSuccess();

        onClose();
      }
    } catch (error) {
      if (error.response?.status === 422) {
        const backendErrors = error.response.data.errors;

        setErrors({
          type: backendErrors?.type?.join("، "),

          description: backendErrors?.description?.join("، "),

          vehicle_coefficient: backendErrors?.vehicle_coefficient?.join("، "),

          avg_fuel_consumption: backendErrors?.avg_fuel_consumption?.join("، "),

          base_fare: backendErrors?.base_fare?.join("، "),

          min_weight: backendErrors?.min_weight?.join("، "),

          max_weight: backendErrors?.max_weight?.join("، "),

          min_length: backendErrors?.min_length?.join("، "),

          max_length: backendErrors?.max_length?.join("، "),

          min_width: backendErrors?.min_width?.join("، "),

          max_width: backendErrors?.max_width?.join("، "),

          min_height: backendErrors?.min_height?.join("، "),

          max_height: backendErrors?.max_height?.join("، "),
        });

        return;
      }

      toast.error(handleAxiosError(error));
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container" dir="rtl">
        <div className="modal-scroll">
          <h3 className="modal-title">
            <FontAwesomeIcon icon={faWrench} className="modal-tn-icon" />
            تعديل بيانات مركبة
          </h3>

          <form onSubmit={handleSubmit} className="modal-form">
            <div className="form-grid">
              <div className="form-group full">
                <label>نوع المركبة</label>

                <input
                  type="text"
                  className={errors.type ? "input-error" : ""}
                  value={formData.type || ""}
                  onChange={(e) =>
                    handleChange("type", stripHtml(e.target.value))
                  }
                />

                {errors.type && <p className="error-text">{errors.type}</p>}
              </div>

              <div className="form-group full">
                <label>الوصف</label>

                <textarea
                  className={errors.description ? "input-error" : ""}
                  value={formData.description || ""}
                  onChange={(e) =>
                    handleChange("description", stripHtml(e.target.value))
                  }
                />

                {errors.description && (
                  <p className="error-text">{errors.description}</p>
                )}
              </div>

              {[
                ["vehicle_coefficient", "معامل المركبة"],
                ["avg_fuel_consumption", "متوسط استهلاك الوقود"],
                ["base_fare", "الأجرة الأساسية"],
                ["min_weight", "الوزن الأدنى"],
                ["max_weight", "الوزن الأقصى"],
                ["min_length", "الطول الأدنى"],
                ["max_length", "الطول الأقصى"],
                ["min_width", "العرض الأدنى"],
                ["max_width", "العرض الأقصى"],
                ["min_height", "الارتفاع الأدنى"],
                ["max_height", "الارتفاع الأقصى"],
              ].map(([field, label], index) => (
                <div className="form-group" key={index}>
                  <label>{label}</label>

                  <input
                    type="number"
                    step="0.01"
                    className={errors[field] ? "input-error" : ""}
                    value={formData[field] || ""}
                    onChange={(e) => handleChange(field, e.target.value)}
                    onWheel={(e) => e.target.blur()}
                  />

                  {errors[field] && (
                    <p className="error-text">{errors[field]}</p>
                  )}
                </div>
              ))}
            </div>

            <div className="modal-actions">
              <button type="submit" className="btn-save">
                حفظ
              </button>

              <button type="button" className="btn-cancel" onClick={onClose}>
                إلغاء
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
