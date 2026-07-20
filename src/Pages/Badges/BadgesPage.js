import React, { useEffect, useState } from "react";
import { Row, Col, Card, Spinner } from "react-bootstrap";
import { FaAward, FaEdit } from "react-icons/fa";
import api from "../../Api/Api";
import { handleAxiosError } from "../../Utils/ErrorHandler";
import { endpoints } from "../../Api/Endpoints";
import { toast } from "react-toastify";
import معتمد from "../../assets/معتمد.png";
import منتظم from "../../assets/منتظم.png";
import مضمون from "../../assets/مضمون.png";
import خبير from "../../assets/خبير.png";
import "./BadgesPage.css";
import EditBadgeModal from "../../Components/EditBadgeModal";
import { useAuth } from "../../Context/AuthContext";

const BadgesPage = () => {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [conditionValue, setConditionValue] = useState("");
  const [updateLoading, setUpdateLoading] = useState(false);
  const { role } = useAuth();

  const fetchBadges = async () => {
    setLoading(true);
    try {
      const response = await api.get(endpoints.badges.get);

      if (response.status === 200) {
        setBadges(response.data);
      }
    } catch (error) {
      toast.error(handleAxiosError(error));
    } finally {
      setTimeout(() => setLoading(false), 400);
    }
  };

  const openEditModal = (badge) => {
    if (role !== "admin") return;
    setSelectedBadge(badge);
    setConditionValue(badge.continuous_successful_shipments_condition);
    setShowModal(true);
  };

  const handleUpdateBadge = async (e) => {
    e.preventDefault();

    if (role !== "admin") {
      toast.error("ليس لديك صلاحية لتعديل الشارات");
      return;
    }

    const originalCondition = Number(
      selectedBadge.continuous_successful_shipments_condition,
    );
    const newCondition = Number(conditionValue);

    if (newCondition === originalCondition) {
      setShowModal(false);
      return;
    }

    setUpdateLoading(true);
    try {
      const response = await api.put(
        endpoints.badges.update(selectedBadge.id),
        {
          continuous_successful_shipments_condition: newCondition,
        },
      );

      if (response.status === 200) {
        toast.success(
          response.data?.message || "تم تعديل نظام إعطاء هذه الشارة بنجاح",
        );
        setShowModal(false);
        fetchBadges();
      }
    } catch (error) {
      if (error.response && error.response.status === 422) {
        const backendMessage =
          error.response.data?.errors
            ?.continuous_successful_shipments_condition?.[0] ||
          error.response.data?.message;
        toast.error(backendMessage);
        return;
      }
      toast.error(handleAxiosError(error));
    } finally {
      setUpdateLoading(false);
    }
  };

  useEffect(() => {
    fetchBadges();
  }, []);

  const getBadgeMeta = (level) => {
    switch (level) {
      case 0:
        return {
          icon: <img src={معتمد} alt="معتمد" className="tn-badge-custom-img" />,
          class: "tn-badge-level-0",
        };
      case 1:
        return {
          icon: <img src={منتظم} alt="منتظم" className="tn-badge-custom-img" />,
          class: "tn-badge-level-1",
        };
      case 2:
        return {
          icon: <img src={خبير} alt="خبير" className="tn-badge-custom-img" />,
          class: "tn-badge-level-2",
        };
      case 3:
        return {
          icon: <img src={مضمون} alt="مضمون" className="tn-badge-custom-img" />,
          class: "tn-badge-level-3",
        };
      default:
        return {
          icon: (
            <img
              src="/assets/images/badges/default-badge.svg"
              alt="شارة"
              className="tn-badge-custom-img"
            />
          ),
          class: "tn-badge-level-default",
        };
    }
  };

  if (loading)
    return (
      <div className="d-flex flex-column justify-content-center align-items-center vh-100">
        <Spinner animation="grow" className="tn-load-orange" />
        <span className="mt-3 text-muted fw-semibold">
          جاري تحميل نظام الشارات...
        </span>
      </div>
    );

  return (
    <div className="tn-b-admin-page-container">
      <Row className="align-items-center mb-5 g-3">
        <Col xs={12}>
          <div className="d-flex align-items-center gap-3">
            <div className="tn-b-page-icon-wrapper">
              <FaAward className="tn-b-page-icon" />
            </div>
            <div>
              <h2 className="tn-b-admin-page-title">
                نظام شارات ومستويات السائقين
              </h2>
              <p className="tn-b-admin-page-subtitle">
                إدارة معايير ترقية السائقين، شروط المكافآت، وضمانات شحن TransNet
              </p>
            </div>
          </div>
        </Col>
      </Row>

      <Row className="g-4">
        {badges.map((badge) => {
          const meta = getBadgeMeta(badge.level);
          return (
            <Col xs={12} md={6} xl={3} key={badge.id}>
              <Card
                className={`tn-s-admin-card border-0 p-4 h-100 tn-badge-card ${meta.class}`}
              >
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div className="tn-badge-icon-box">{meta.icon}</div>
                  <div className="d-flex align-items-center gap-2">
                    {role === "admin" && badge.level !== 0 && (
                      <button
                        className="tn-badge-edit-btn"
                        onClick={() => openEditModal(badge)}
                        title="تعديل شرط الشارة"
                      >
                        <FaEdit />
                      </button>
                    )}
                    <span className="tn-badge-level-pill">
                      مستوى {badge.level}
                    </span>
                  </div>
                </div>

                <div className="flex-grow-1">
                  <h4 className="tn-badge-name mb-2">{badge.name}</h4>
                  <p className="tn-badge-text text-muted">{badge.text}</p>
                </div>

                <div className="tn-badge-condition-container mt-3 pt-3 border-top">
                  <span className="tn-badge-condition-label">
                    الشرط الإلزامي:
                  </span>
                  <div className="tn-badge-condition-value">
                    <>
                      إنجاز{" "}
                      <strong className="tn-condition-num">
                        {badge.continuous_successful_shipments_condition}
                      </strong>{" "}
                      شحنة متتالية بنجاح
                    </>
                  </div>
                </div>
              </Card>
            </Col>
          );
        })}
      </Row>

      <EditBadgeModal
        show={role === "admin" && showModal}
        onHide={() => setShowModal(false)}
        onSubmit={handleUpdateBadge}
        selectedBadge={selectedBadge}
        conditionValue={conditionValue}
        setConditionValue={setConditionValue}
        updateLoading={updateLoading}
      />
    </div>
  );
};

export default BadgesPage;
