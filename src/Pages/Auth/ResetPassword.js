import React, { useState, useEffect } from "react";
import "./ResetPassword.css";
import logo from "../../assets/logo.png";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../Api/Api";
import { endpoints } from "../../Api/Endpoints";
import { toast } from "react-toastify";
import LoadingScreen from "../../Components/LoadingScreen";
import { HiEye, HiEyeOff } from "react-icons/hi";
import { handleAxiosError } from "../../Utils/ErrorHandler";

const ResetPassword = () => {
  const [passData, setPassData] = useState({ password: "", confirm: "" });
  const [showP, setShowP] = useState(false);
  const [showC, setShowC] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  const resetToken = location.state?.reset_token;
  // الحماية: إذا دخل المستخدم الصفحة بدون إيميل يتم تحويله للوجن
  useEffect(() => {
    if (!email || !resetToken) {
      navigate("/login");
      toast.warn("يرجى التحقق من هويتك أولاً");
    }
  }, [email, resetToken, navigate]);

  const handleInput = (e) => {
    setPassData({ ...passData, [e.target.name]: e.target.value });
  };

  const onFormSubmit = async (e) => {
    e.preventDefault();

    if (passData.password !== passData.confirm) {
      toast.error("كلمات المرور غير متطابقة");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post(endpoints.auth.resetPassword, {
        email: email,
        reset_token: resetToken,
        password: passData.password,
      });

      toast.success(response.data.message);
      navigate("/login");
    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        const backendMessage = error.response.data?.message;
        if (status === 401) {
          if (backendMessage === "رمز إعادة التعيين غير صالح أو منتهي") {
            return toast.error(
              "انتهت صلاحية رابط إعادة تعيين كلمة المرور. يرجى طلب رابط جديد.",
            );
          }

          if (
            backendMessage ===
            "الرجاء تغيير كلمة المرور لكي تكون مختلفة عن كلمة المرور القديمة"
          ) {
            toast.error(backendMessage);
          }
        } else {
          toast.error(handleAxiosError(error));
        }
      } else {
        toast.error(handleAxiosError(error));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="transnet-reset-wrapper" dir="rtl">
      {loading && (
        <div className="transnet-reset-loading-overlay">
          <LoadingScreen />
        </div>
      )}

      <div
        className={`transnet-reset-card ${loading ? "transnet-reset-blur" : ""}`}
      >
        <img className="transnet-reset-logo" src={logo} alt="TransNet" />

        <h2 className="transnet-reset-title">تغيير كلمة المرور</h2>
        <p className="transnet-reset-subtitle">
          يرجى كتابة كلمة مرور جديدة قوية لحسابك.
        </p>

        <form onSubmit={onFormSubmit}>
          {/* حقل كلمة المرور */}
          <div className="transnet-reset-form-group">
            <label className="transnet-reset-label">كلمة المرور الجديدة</label>
            <div className="transnet-reset-input-wrapper" dir="ltr">
              <input
                type={showP ? "text" : "password"}
                name="password"
                className="transnet-reset-input"
                placeholder="********"
                required
                onChange={handleInput}
              />
              <button
                type="button"
                className="transnet-reset-toggle-eye"
                onClick={() => setShowP(!showP)}
              >
                {showP ? <HiEyeOff size={20} /> : <HiEye size={20} />}
              </button>
            </div>
          </div>

          {/* حقل تأكيد كلمة المرور */}
          <div className="transnet-reset-form-group">
            <label className="transnet-reset-label">تأكيد كلمة المرور</label>
            <div className="transnet-reset-input-wrapper" dir="ltr">
              <input
                type={showC ? "text" : "password"}
                name="confirm"
                className="transnet-reset-input"
                placeholder="********"
                required
                onChange={handleInput}
              />
              <button
                type="button"
                className="transnet-reset-toggle-eye"
                onClick={() => setShowC(!showC)}
              >
                {showC ? <HiEyeOff size={20} /> : <HiEye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="transnet-reset-submit-btn"
            disabled={loading}
          >
            {loading ? "جاري المعالجة..." : "حفظ كلمة المرور"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
