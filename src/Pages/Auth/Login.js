import React, { useState } from "react";
import { Container, Row, Col, Form, Button, Spinner } from "react-bootstrap";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "./Login.css";
import api from "../../Api/Api";
import { endpoints } from "../../Api/Endpoints";
import { useAuth } from "../../Context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { handleAxiosError } from "../../Utils/ErrorHandler";
const Login = () => {
  const { setAccessToken, setRole } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const handleLogin = async (e) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let validationErrors = {};
    if (!email) validationErrors.email = "يرجى إدخال البريد الإلكتروني";
    if (!password) validationErrors.password = "يرجى إدخال كلمة المرور";
    if (email && !emailRegex.test(email)) {
      validationErrors.email = "البريد الإلكتروني غير صالح";
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setDataLoading(true);
    setErrors({});

    try {
      const response = await api.post(
        endpoints.auth.login,
        {
          email: email,
          password: password,
        },
        {
          headers: { "X-Remember-Me": `${rememberMe}` },
          withCredentials: true,
        },
      );

      if (response.status === 202) {
        try {
          await api.post(endpoints.auth.sendEmail, { email: email });

          toast.warning(
            "يجب عليك تأكيد بريدك الإلكتروني أولاً. تم إرسال رمز التحقق لبريدك.",
          );
          navigate("/verify-email", {
            state: { email: email, purpose: "login_verify" },
            replace: true,
          });
        } catch (Error) {
          toast.error(handleAxiosError(Error));
        }
      } else {
        toast.success("تم تسجيل الدخول بنجاح");
        const userRole = response.data.role;
        setAccessToken(response.data.token);
        setRole(userRole);

        navigate("/dashboard/drivers", { replace: true });
      }
    } catch (err) {
      toast.error(handleAxiosError(err));
    } finally {
      setDataLoading(false);
    }
  };
  return (
    <div className="login-page-wrapper">
      <Container>
        <Row className="justify-content-center align-items-center">
          <Col lg={9} xl={8}>
            <div className="glass-main-card">
              <Row className="g-0 h-100 position-relative">
                <Col
                  md={6}
                  className="text-side p-4 p-md-5 d-flex flex-column justify-content-center"
                >
                  <div>
                    <h1 className="fw-bold text-white mb-1 title-text">
                      أهلاً بك، كمدير
                    </h1>
                    <h1 className="fw-bold text-white mb-3 title-text">
                      لوحة التحكم
                    </h1>
                    <p className="text-white opacity-75 lh-lg paragraph-text">
                      نوفر الأدوات لإدارة الخدمات اللوجستية والشحنات بكفاءة.
                      <br />
                      هذه المنصة مصممة لمسؤولياتكم لضمان التميز.
                    </p>
                  </div>

                  <div className="vertical-divider d-none d-md-block"></div>
                </Col>

                <Col
                  md={6}
                  className="form-side p-4 p-md-5 d-flex flex-column justify-content-center"
                >
                  <Form onSubmit={handleLogin} noValidate>
                    <Form.Group className="mb-2">
                      <Form.Label className="text-white fw-bold mb-2 small">
                        البريد الإلكتروني
                      </Form.Label>
                      <Form.Control
                        type="email"
                        className={`custom-input ${errors?.email ? "is-invalid" : ""}`}
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (errors.email) setErrors({ ...errors, email: "" });
                        }}
                        placeholder="admin@example.com"
                      />
                      <div className="error-container">
                        {errors?.email && (
                          <span className="custom-error-msg">
                            {errors.email}
                          </span>
                        )}
                      </div>
                    </Form.Group>

                    <Form.Group className="mb-2">
                      <Form.Label className="text-white fw-bold mb-2 small">
                        كلمة المرور
                      </Form.Label>
                      <div className="password-wrapper">
                        <Form.Control
                          type={showPassword ? "text" : "password"}
                          className={`custom-input ${errors?.password ? "is-invalid" : ""}`}
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            if (errors.password)
                              setErrors({ ...errors, password: "" });
                          }}
                          placeholder="********"
                        />
                        <div
                          className="password-icon-toggle"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </div>
                      </div>
                      <div className="error-container">
                        {errors?.password && (
                          <span className="custom-error-msg">
                            {errors.password}
                          </span>
                        )}
                      </div>
                    </Form.Group>

                    <div className="d-flex justify-content-start align-items-center mb-4">
                      <Form.Check
                        type="checkbox"
                        label="تذكرني"
                        id="remember-me"
                        className="custom-checkbox text-white small fw-bold"
                        onClick={() => setRememberMe(!rememberMe)}
                      />
                    </div>

                    <Button
                      className="btn-submit-orange w-100 mb-3"
                      type="submit"
                      disabled={dataLoading}
                    >
                      {dataLoading ? (
                        <Spinner animation="border" size="sm" />
                      ) : (
                        "تسجيل الدخول"
                      )}
                    </Button>

                    <div className="text-center">
                      <Link to="/send-email" className="forgot-password-link">
                        نسيت كلمة المرور؟
                      </Link>
                    </div>
                  </Form>
                </Col>
              </Row>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Login;
