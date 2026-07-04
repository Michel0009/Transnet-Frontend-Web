import React, { useEffect, useState } from "react";
import api from "../../Api/Api";
import { endpoints } from "../../Api/Endpoints";
import { toast } from "react-toastify";
import { handleAxiosError } from "../../Utils/ErrorHandler";
import { Spinner } from "react-bootstrap";
import AddVehicleTypeModal from "../../Components/AddVehicleTypeModal";
import EditVehicleTypeModal from "../../Components/EditVehicleTypeModal";

import {
  FaCogs,
  FaGasPump,
  FaMoneyBill,
  FaRulerVertical,
  FaRulerHorizontal,
  FaRulerCombined,
  FaWeightHanging,
} from "react-icons/fa";

import "./VehicleTypeDetails.css";

export default function VehicleTypeDetails() {
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showEditModal, setShowEditModal] = useState(false);
  const [vehicleToEdit, setVehicleToEdit] = useState(null);

  const [showAddForm, setShowAddForm] = useState(false);

  const fetchVehicles = async () => {
    setLoading(true);

    try {
      const response = await api.get(endpoints.vehicleTypes.get);

      setVehicles(response.data);
    } catch (error) {
      toast.error(handleAxiosError(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  if (loading)
    return (
      <div className="d-flex flex-column justify-content-center align-items-center vh-100">
        <Spinner animation="grow" className="tn-load-orange" />

        <span className="mt-3 text-muted fw-semibold">
          جاري تحميل المركبات...
        </span>
      </div>
    );

  return (
    <div className="vehicle-page" dir="rtl">
      <div className="vehicle-card p-4 mb-4">
        {selectedVehicle ? (
          <>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h3 className="vehicle-title">{selectedVehicle.type}</h3>

                <p className="vehicle-desc">{selectedVehicle.description}</p>
              </div>

              <button
                className="btn-edit-card"
                onClick={() => {
                  setVehicleToEdit(selectedVehicle);
                  setShowEditModal(true);
                }}
              >
                تعديل
              </button>
            </div>

            <h5 className="section-title">تفاصيل المركبة</h5>

            <div className="row mt-3">
              <div className="col-12 col-md-6 col-lg-4 mb-3">
                <div className="detail-box">
                  <FaCogs className="detail-icon" />

                  <span className="detail-label">معامل المركبة</span>

                  <span className="detail-value">
                    {selectedVehicle.vehicle_coefficient}
                  </span>
                </div>
              </div>

              <div className="col-12 col-md-6 col-lg-4 mb-3">
                <div className="detail-box">
                  <FaGasPump className="detail-icon" />

                  <span className="detail-label">متوسط استهلاك الوقود</span>

                  <span className="detail-value">
                    {selectedVehicle.avg_fuel_consumption}
                  </span>
                </div>
              </div>

              <div className="col-12 col-md-6 col-lg-4 mb-3">
                <div className="detail-box">
                  <FaMoneyBill className="detail-icon" />

                  <span className="detail-label">الأجرة الأساسية</span>

                  <span className="detail-value">
                    {selectedVehicle.base_fare}
                  </span>
                </div>
              </div>

              <div className="col-12 col-md-6 col-lg-4 mb-3">
                <div className="detail-box">
                  <FaWeightHanging className="detail-icon" />

                  <span className="detail-label">الوزن الأدنى</span>

                  <span className="detail-value">
                    {selectedVehicle.min_weight}
                  </span>
                </div>
              </div>

              <div className="col-12 col-md-6 col-lg-4 mb-3">
                <div className="detail-box">
                  <FaWeightHanging className="detail-icon" />

                  <span className="detail-label">الوزن الأقصى</span>

                  <span className="detail-value">
                    {selectedVehicle.max_weight}
                  </span>
                </div>
              </div>

              <div className="col-12 col-md-6 col-lg-4 mb-3">
                <div className="detail-box">
                  <FaRulerVertical className="detail-icon" />

                  <span className="detail-label">الطول الأدنى</span>

                  <span className="detail-value">
                    {selectedVehicle.min_length}
                  </span>
                </div>
              </div>

              <div className="col-12 col-md-6 col-lg-4 mb-3">
                <div className="detail-box">
                  <FaRulerVertical className="detail-icon" />

                  <span className="detail-label">الطول الأقصى</span>

                  <span className="detail-value">
                    {selectedVehicle.max_length}
                  </span>
                </div>
              </div>

              <div className="col-12 col-md-6 col-lg-4 mb-3">
                <div className="detail-box">
                  <FaRulerHorizontal className="detail-icon" />

                  <span className="detail-label">العرض الأدنى</span>

                  <span className="detail-value">
                    {selectedVehicle.min_width}
                  </span>
                </div>
              </div>

              <div className="col-12 col-md-6 col-lg-4 mb-3">
                <div className="detail-box">
                  <FaRulerHorizontal className="detail-icon" />

                  <span className="detail-label">العرض الأقصى</span>

                  <span className="detail-value">
                    {selectedVehicle.max_width}
                  </span>
                </div>
              </div>

              <div className="col-12 col-md-6 col-lg-4 mb-3">
                <div className="detail-box">
                  <FaRulerCombined className="detail-icon" />

                  <span className="detail-label">الارتفاع الأدنى</span>

                  <span className="detail-value">
                    {selectedVehicle.min_height}
                  </span>
                </div>
              </div>

              <div className="col-12 col-md-6 col-lg-4 mb-3">
                <div className="detail-box">
                  <FaRulerCombined className="detail-icon" />

                  <span className="detail-label">الارتفاع الأقصى</span>

                  <span className="detail-value">
                    {selectedVehicle.max_height}
                  </span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <p className="text-muted">اختر مركبة من الجدول لعرض تفاصيلها هنا</p>
        )}
      </div>

      <div className="d-flex justify-content-end mb-3">
        <button className="btn-add" onClick={() => setShowAddForm(true)}>
          إضافة مركبة +
        </button>
      </div>

      {showAddForm && (
        <div className="modal-backdrop-custom">
          <div className="modal-card">
            <AddVehicleTypeModal
              onClose={() => setShowAddForm(false)}
              onSuccess={fetchVehicles}
            />
          </div>
        </div>
      )}

      {showEditModal && (
        <EditVehicleTypeModal
          vehicle={vehicleToEdit}
          onClose={() => setShowEditModal(false)}
          setSelectedVehicle={setSelectedVehicle}
          onSuccess={fetchVehicles}
        />
      )}

      <div className="vehicle-table">
        <h4 className="page-title">قائمة المركبات</h4>

        <table className="table table-hover">
          <thead>
            <tr>
              <th>نوع المركبة</th>
              <th>الوصف</th>
            </tr>
          </thead>

          <tbody>
            {vehicles.map((v) => (
              <tr
                key={v.id}
                onClick={() => setSelectedVehicle(v)}
                style={{ cursor: "pointer" }}
              >
                <td>{v.type}</td>
                <td>{v.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
