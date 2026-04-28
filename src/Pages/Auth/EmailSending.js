import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { Form, Button, InputGroup } from "react-bootstrap";
import { HiOutlineMail, HiArrowRight, HiArrowLeft } from "react-icons/hi";
import { MdErrorOutline } from "react-icons/md";
import "./EmailSending.css";
import LoadingScreen from "../../Components/LoadingScreen";
import logo from "../../assets/logo.png";
import api from "../../Api/Api";
import { endpoints } from "../../Api/Endpoints";
import { handleAxiosError } from "../../Utils/ErrorHandler";

const SendEmail = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setError("يرجى إدخال البريد الإلكتروني أولاً");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("صيغة البريد الإلكتروني غير صحيحة");
      return;
    }

    setError("");
    setLoading(true);
    try {
      const response = await api.post(endpoints.auth.sendEmail, { email });
      toast.success(response.data.message);
      navigate("/verify-email", {
        state: {
          email: email,
          purpose: "reset_verify",
        },
      });
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        const backendMessage = error.response.data?.message;
        if (
          status === 401 &&
          backendMessage ===
            "البريد الإلكتروني غير صحيح، يرجى المحاولة مرة أخرى"
        ) {
          toast.error(
            "البريد الإلكتروني غير مسجل لدينا. يرجى التحقق والمحاولة مرة أخرى.",
          );
        } else {
          toast.error(handleAxiosError(error));
        }
      }
      toast.error(handleAxiosError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="es-auth-wrapper" dir="rtl">
      {loading && (
        <div className="es-global-loader">
          <LoadingScreen />
        </div>
      )}

      <main className="es-main-card">
        <div className="es-logo-section">
          <img src={logo} alt="TransNet Logo" className="es-brand-logo" />
        </div>

        <h2 className="es-title-text">التحقق من البريد الإلكتروني</h2>
        <p className="es-subtitle-text">
          سنرسل لك رمزاً لتأكيد هويتك، يرجى إدخال بريدك الإلكتروني.
        </p>

        <Form onSubmit={handleSubmit} className="w-100 " noValidate>
          <Form.Group className="text-right mb-4">
            <Form.Label className="es-field-label">
              البريد الإلكتروني
            </Form.Label>
            <InputGroup
              className={`es-custom-input-group ${error ? "es-input-error" : ""}`}
            >
              <Form.Control
                type="email"
                placeholder="example@domain.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError("");
                }}
                disabled={loading}
                className="es-form-input"
                dir="ltr"
              />
              <InputGroup.Text className="es-input-icon-wrapper">
                <HiOutlineMail size={22} />
              </InputGroup.Text>
            </InputGroup>

            <div className="es-error-container">
              {error && (
                <span className="es-error-message">
                  <MdErrorOutline className="ms-1" />
                  {error}
                </span>
              )}
            </div>
          </Form.Group>

          <Button
            type="submit"
            disabled={loading}
            className="es-submit-btn-premium"
          >
            <span>{loading ? "جاري الإرسال..." : "إرسال الرمز"}</span>
            {!loading && <HiArrowLeft size={20} className="ms-2" />}
          </Button>
        </Form>

        <div className="es-footer-section">
          <div className="es-horizontal-divider"></div>
          <Link to="/login" className="es-back-navigation">
            <HiArrowRight size={20} />
            <span>العودة لتسجيل الدخول</span>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default SendEmail;
