import React, { useState, useEffect, useRef } from "react";
import "./EmailVerification.css";
import logo from "../../assets/logo.png";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../Api/Api";
import { endpoints } from "../../Api/Endpoints";
import { useAuth } from "../../Context/AuthContext";
import { toast } from "react-toastify";
import LoadingScreen from "../../Components/LoadingScreen";
import { handleAxiosError } from "../../Utils/ErrorHandler";
const EmailVerification = () => {
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [timer, setTimer] = useState(60);
  const [expiryTimer, setExpiryTimer] = useState(180);
  const inputRefs = useRef([]);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { setAccessToken } = useAuth();
  const userEmail = location.state?.email;
  const purpose = location.state?.purpose;
  const [namePart, domainPart] = userEmail ? userEmail.split("@") : ["", ""];

  const maskedName =
    namePart.slice(0, 2) + "*".repeat(Math.max(0, namePart.length - 2));
  const maskedEmail = `${maskedName}@${domainPart}`;

  useEffect(() => {
    if (!userEmail) {
      navigate("/login");
      toast.error("يرجى إدخال البريد الالكتروني اولا", {
        toastId: "no-email-error",
      });
    }
  }, [userEmail, navigate]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer(timer - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  useEffect(() => {
    if (expiryTimer > 0) {
      const interval = setInterval(
        () => setExpiryTimer((prev) => prev - 1),
        1000,
      );
      return () => clearInterval(interval);
    }
  }, [expiryTimer]);

  const formatExpiryTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };
  const handleConfirm = async () => {
    const code = otp.join("");
    if (code.length < 6) {
      toast.error("يرجى إدخال الرمز كاملاً");
      return;
    }

    setIsConfirming(true);
    try {
      const endpoint =
        purpose === "reset_verify"
          ? endpoints.auth.verifyResetPassword
          : endpoints.auth.verify;

      const response = await api.post(endpoint, {
        email: userEmail,
        verification_code: code,
      });

      toast.success(response.data.message);

      if (purpose === "reset_verify") {
        navigate("/reset-password", {
          state: {
            email: userEmail,
            reset_token: response.data.reset_token,
          },
        });
      } else {
        if (response.data.token) {
          setAccessToken(response.data.token);
          navigate("/dashboard");
        }
      }
    } catch (error) {
      if (error.response) {
        if (error.response.status === 400) {
          toast.error("رمز التحقق غير صحيح، يرجى المحاولة مرة أخرى");
        } else{
        toast.error(handleAxiosError(error));
        }
      } else {
        toast.error(handleAxiosError(error));
      }
    } finally {
      setIsConfirming(false);
    }
  };
  const handleResend = async () => {
    setIsResending(true);
    try {
      const response = await api.post(endpoints.auth.sendEmail, {
        email: userEmail,
      });
      toast.success(response.data.message);
      setTimer(60);
      setExpiryTimer(180);
    } catch (error) {
      toast.error(handleAxiosError(error));
    } finally {
      setIsResending(false);
    }
  };
  const handleChange = (element, index) => {
    if (isNaN(element.value)) return false;
    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    if (element.value !== "" && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);

    const focusIndex = pastedData.length < 6 ? pastedData.length : 5;
    inputRefs.current[focusIndex].focus();
  };

  return (
    <div className="auth-wrapper" dir="rtl">
      {isConfirming && (
        <div className="my-custom-full-page-loading">
          <LoadingScreen />
        </div>
      )}
      <div className={`auth-card ${isConfirming ? "blur-effect" : ""}`}>
        <img className="logo-img" src={logo} alt="Logo" />

        <h2 className="auth-title">التحقق من البريد الإلكتروني</h2>
        <p className="auth-subtitle">
          يرجى تأكيد حسابك عن طريق إدخال الرمز المكون من 6 أرقام المرسل إلى
          بريدك الإلكتروني.
        </p>

        <div className="email-display-box">
          <span className="email-text">{maskedEmail}</span>
          <span className="status-label">الرمز قيد الانتظار...</span>
        </div>

        <div className="otp-group" dir="ltr">
          {otp.map((data, index) => (
            <input
              key={index}
              type="text"
              className="otp-input"
              maxLength="1"
              ref={(el) => (inputRefs.current[index] = el)}
              value={data}
              onChange={(e) => handleChange(e.target, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onPaste={handlePaste}
            />
          ))}
        </div>
        <div
          className={`ev-expiry-note ${expiryTimer < 30 ? "ev-expiry-critical" : ""}`}
        >
          <span className="ev-info-icon">i</span>
          {expiryTimer > 0 ? (
            <span>
              تنتهي صلاحية الرمز خلال:
              <strong dir="ltr">{formatExpiryTime(expiryTimer)}</strong>
            </span>
          ) : (
            <span className="ev-expired-text">انتهت صلاحية الرمز الحالي</span>
          )}
        </div>
        <button
          className="ev-btn-primary mb-2"
          onClick={handleConfirm}
          disabled={isConfirming || isResending || expiryTimer === 0}
        >
          {isConfirming ? "انتظر قليلًا..." : "تأكيد الرمز"}
        </button>

        <button
          className="ev-btn-secondary btn-secondary"
          disabled={timer > 0 || isResending || isConfirming}
          onClick={handleResend}
        >
          {isResending ? (
            <span className="loader-inline">جاري الإرسال...</span>
          ) : timer > 0 ? (
            `إعادة إرسال الرمز بعد ${timer} ثانية`
          ) : (
            "إعادة إرسال الرمز"
          )}
        </button>
      </div>
    </div>
  );
};

export default EmailVerification;
