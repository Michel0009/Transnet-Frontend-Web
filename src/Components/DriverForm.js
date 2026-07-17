import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Spinner,
  Alert,
} from "react-bootstrap";
import {
  User,
  IdCard,
  Car,
  FileText,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  UploadCloud,
  Check,
  MapPin,
  Route,
  AlertTriangle,
} from "lucide-react";
import "./DriverForm.css";
import api from "../Api/Api";
import { toast } from "react-toastify";
import { handleAxiosError } from "../Utils/ErrorHandler";
import { endpoints } from "../Api/Endpoints";
import { useParams, useNavigate } from "react-router-dom";
const DriverForm = () => {
  const { id } = useParams();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [governorates, setGovernorates] = useState([]);
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [fuelTypes, setFuelTypes] = useState([]);
  const [errors, setErrors] = useState({});
  const [fetchingData, setFetchingData] = useState(isEditMode);
  const originalDataRef = useRef({});
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    additional_phone_number: "",
    father_name: "",
    mother_name: "",
    mother_last_name: "",
    birth_date: "",
    birth_place: "",
    national_number: "",
    governorate: "",
    city: "",
    neighborhood: "",
    gender: "ذكر",
    nationality: "",
    vehicle_type_id: "",
    license_plate_number: "",
    manufacturer: "",
    model: "",
    year_of_manufacture: "",
    color: "",
    fuel_type: "",
    car_status: "",
    personal_picture: null,
    unconvicted_file: null,
    license_file: null,
    car_papers: [
      { id: 1, type: "ميكانيك", car_file: null, label: "الميكانيك" },
      {
        id: 2,
        type: "ملكية",
        car_file: null,
        label: "الملكية أو الآجار",
      },
    ],
    ...(!isEditMode && { governorate_ids: [] }),
  });
  const fieldStepMap = {
    first_name: 1,
    last_name: 1,
    email: 1,
    phone_number: 1,
    additional_phone_number: 1,
    father_name: 2,
    mother_name: 2,
    mother_last_name: 2,
    birth_date: 2,
    birth_place: 2,
    national_number: 2,
    governorate: 2,
    city: 2,
    neighborhood: 2,
    gender: 2,
    nationality: 2,
    governorate_ids: 3,
    license_plate_number: 4,
    manufacturer: 4,
    model: 4,
    year_of_manufacture: 4,
    color: 4,
    fuel_type: 4,
    car_status: 4,
    personal_picture: 5,
    license_file: 5,
    unconvicted_file: 5,
  };
  const getStepForField = (fieldName) => {
    if (fieldName.startsWith("car_papers")) return 5;
    return fieldStepMap[fieldName] || 1;
  };
  const fetchEditData = useCallback(async () => {
    if (isEditMode) {
      try {
        const response = await api.get(endpoints.drivers.details(id));
        const driverData = response.data.driver || {};
        const userData = response.data.user || {};
        const carData = response.data.car || {};
        const filesData = response.data.files || {};
        const prefilledData = {
          first_name: userData.first_name || "",
          last_name: userData.last_name || "",
          email: userData.email || "",
          phone_number: userData.phone_number || "",
          additional_phone_number: driverData.additional_phone_number || "",
          father_name: driverData.father_name || "",
          mother_name: driverData.mother_name || "",
          mother_last_name: driverData.mother_last_name || "",
          birth_date: driverData.birth_date || "",
          birth_place: driverData.birth_place || "",
          national_number: driverData.national_number || "",
          governorate: driverData.governorate || "",
          city: driverData.city || "",
          neighborhood: driverData.neighborhood || "",
          gender: driverData.gender || "ذكر",
          nationality: driverData.nationality || "",
          vehicle_type_id: carData.vehicle_type_id || "",
          fuel_type: carData.fuel_type || "",
          car_status: carData.car_status || "",
          license_plate_number: carData.license_plate_number || "",
          manufacturer: carData.manufacturer || "",
          model: carData.model || "",
          year_of_manufacture: carData.year_of_manufacture || "",
          color: carData.color || "",
          personal_picture: null,
          unconvicted_file: null,
          license_file: null,
          car_papers: [
            { id: 1, type: "ميكانيك", car_file: null, label: "الميكانيك" },
            {
              id: 2,
              type: filesData.car_files?.[1]?.type || "ملكية",
              car_file: null,
              label: "الملكية أو الآجار",
            },
          ],
          version: driverData.version || 0,
        };

        setFormData(prefilledData);
        originalDataRef.current = prefilledData;
        setFetchingData(false);
      } catch (err) {
        if (
          err.response?.status === 422 &&
          err.response?.data?.message === "السائق المطلوب غير موجود في النظام"
        ) {
          toast.error(err.response.data.message);
          setTimeout(() => {
            navigate(-1);
          }, 1000);
        } else {
          toast.error(handleAxiosError(err));
        }
        setFetchingData(false);
      }
    }
  }, [id, isEditMode,navigate]);
  useEffect(() => {
    fetchEditData();
  }, [fetchEditData]);
  useEffect(() => {
    fetchGovAndVehicle();
  }, []);
  const yesterday = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split("T")[0];
  })();
  const fetchGovAndVehicle = async () => {
    try {
      const govResponse = await api.get(endpoints.drivers.getGovernorates);
      const vehicleResponse = await api.get(endpoints.vehicleTypes.get);
      const fuelResponse = await api.get(endpoints.coefficients.get);
      setGovernorates(govResponse.data);
      setVehicleTypes(vehicleResponse.data);
      const filteredFuels = fuelResponse.data.filter(
        (item) => item.type === "fuel_price",
      );
      setFuelTypes(filteredFuels);
    } catch (error) {
      toast.error(handleAxiosError(error));
    }
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prevErrors) => {
        const updatedErrors = { ...prevErrors };
        delete updatedErrors[name];
        return updatedErrors;
      });
    }
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files.length > 0) {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));

      if (errors[name]) {
        setErrors((prevErrors) => {
          const updatedErrors = { ...prevErrors };
          delete updatedErrors[name];
          return updatedErrors;
        });
      }
    }
  };

  const handleGovernorateToggle = (id) => {
    setFormData((prev) => {
      const currentIds = prev.governorate_ids;
      if (currentIds.includes(id)) {
        return {
          ...prev,
          governorate_ids: currentIds.filter((gId) => gId !== id),
        };
      } else {
        return { ...prev, governorate_ids: [...currentIds, id] };
      }
    });
    if (errors.governorate_ids) {
      setErrors((prevErrors) => {
        const updatedErrors = { ...prevErrors };
        delete updatedErrors.governorate_ids;
        return updatedErrors;
      });
    }
  };

  const handleCarPaperChange = (id, field, value) => {
    setFormData((prev) => ({
      ...prev,
      car_papers: prev.car_papers.map((paper) =>
        paper.id === id ? { ...paper, [field]: value } : paper,
      ),
    }));
    const errorKey = `car_papers.${id - 1}.${field}`;

    if (errors[errorKey]) {
      setErrors((prev) => {
        const newErrs = { ...prev };
        delete newErrs[errorKey];
        return newErrs;
      });
    }
  };

  const validateCurrentStep = (step) => {
    const newErrors = {};
    const currentYear = new Date().getFullYear();

    if (step === 1) {
      if (!formData.first_name)
        newErrors.first_name = ["حقل الاسم الأول مطلوب."];
      if (!formData.last_name) newErrors.last_name = ["حقل الكنية مطلوب."];
      if (!formData.phone_number)
        newErrors.phone_number = ["حقل رقم الهاتف مطلوب."];
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!formData.email?.trim()) {
        newErrors.email = [".حقل البريد الإلكتروني مطلوب"];
      } else if (!emailRegex.test(formData.email)) {
        newErrors.email = [".يرجى إدخال بريد إلكتروني صحيح"];
      }
    }

    if (step === 2) {
      if (!formData.father_name)
        newErrors.father_name = ["حقل اسم الأب مطلوب."];
      if (!formData.mother_name)
        newErrors.mother_name = ["حقل اسم الأم مطلوب."];
      if (!formData.mother_last_name)
        newErrors.mother_last_name = ["حقل اسم العائلة للأم مطلوب."];
      if (!formData.birth_date)
        newErrors.birth_date = ["حقل تاريخ الميلاد مطلوب."];
      if (!formData.birth_place)
        newErrors.birth_place = ["حقل مكان الميلاد مطلوب."];
      if (!formData.national_number)
        newErrors.national_number = ["حقل الرقم الوطني مطلوب."];
      if (!formData.governorate)
        newErrors.governorate = ["حقل المحافظة مطلوب."];
      if (!formData.nationality) newErrors.nationality = ["حقل الجنسية مطلوب."];
      if (!formData.city) newErrors.city = ["حقل المدينة مطلوب."];
      if (!formData.neighborhood) newErrors.neighborhood = ["حقل الحي مطلوب."];
      if (!formData.nationality) newErrors.nationality = ["حقل الجنسية مطلوب."];
    }

    if (step === 3) {
      if (formData.governorate_ids.length === 0) {
        newErrors.governorate_ids = [
          "يجب اختيار محافظة واحدة على الأقل لخط العمل.",
        ];
      }
    }

    if (step === 4) {
      if (!formData.vehicle_type_id)
        newErrors.vehicle_type_id = ["حقل نوع المركبة مطلوب."];
      if (!formData.fuel_type) newErrors.fuel_type = ["حقل نوع الوقود مطلوب."];
      if (!formData.car_status)
        newErrors.car_status = ["حقل حالة المركبة مطلوب."];
      if (!formData.license_plate_number)
        newErrors.license_plate_number = ["حقل رقم اللوحة مطلوب."];
      if (!formData.manufacturer)
        newErrors.manufacturer = ["حقل الشركة المصنعة مطلوب."];
      if (!formData.model) newErrors.model = ["حقل الموديل مطلوب."];
      if (!formData.color) newErrors.color = ["حقل اللون مطلوب."];

      const year = parseInt(formData.year_of_manufacture);
      if (!formData.year_of_manufacture) {
        newErrors.year_of_manufacture = [".حقل سنة الصنع مطلوب"];
      } else if (isNaN(year) || year < 1900) {
        newErrors.year_of_manufacture = [".يجب أن تكون سنة الصنع 1900 أو أحدث"];
      } else if (year > currentYear) {
        newErrors.year_of_manufacture = [
          `.سنة الصنع لا يمكن أن تتجاوز عام ${currentYear}`,
        ];
      }
    }

    if (step === 5) {
      if (!formData.personal_picture)
        newErrors.personal_picture = ["حقل الصورة الشخصية مطلوب."];
      if (!formData.unconvicted_file)
        newErrors.unconvicted_file = ["حقل ورقة غير محكوم مطلوب."];
      if (!formData.license_file)
        newErrors.license_file = ["حقل ملف رخصة القيادة مطلوب."];

      formData.car_papers.forEach((paper, index) => {
        if (!paper.car_file) {
          newErrors[`car_papers.${index}.car_file`] = [
            `وثيقة ${paper.label || paper.type} مطلوبة.`,
          ];
        }
      });
    }
    return newErrors;
  };
  const handleNextStep = () => {
    if (!isEditMode) {
      const currentStepErrors = validateCurrentStep(step);

      if (Object.keys(currentStepErrors).length > 0) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          ...currentStepErrors,
        }));
        return;
      }
    }
    setStep((s) => {
      if (isEditMode && s === 2) return 4;
      return Math.min(s + 1, 5);
    });
  };
  const prevStep = () => {
    setStep((s) => {
      if (isEditMode && s === 4) return 2;
      return Math.max(s - 1, 1);
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const submitData = new FormData();
    if (isEditMode) {
      Object.keys(formData).forEach((key) => {
        if (key !== "car_papers") {
          if (formData[key] instanceof File) {
            submitData.append(key, formData[key]);
          } else if (
            formData[key] !== originalDataRef.current[key] &&
            formData[key] !== null &&
            formData[key] !== undefined &&
            formData[key] !== "" &&
            !(formData[key] instanceof File)
          ) {
            submitData.append(key, formData[key]);
          } else if (key === "version") {
            submitData.append(key, formData[key]);
          }
        }
      });
      formData.car_papers.forEach((paper, index) => {
        if (paper.car_file instanceof File) {
          submitData.append(`car_papers[${index}][car_file]`, paper.car_file);
          submitData.append(`car_papers[${index}][type]`, paper.type);
        }
      });
      submitData.append("_method", "PUT");
    } else {
      Object.keys(formData).forEach((key) => {
        const value = formData[key];

        if (value !== null && value !== undefined) {
          if (Array.isArray(value)) {
            value.forEach((item, index) => {
              if (typeof item === "object" && !(item instanceof File)) {
                Object.keys(item).forEach((subKey) => {
                  submitData.append(
                    `${key}[${index}][${subKey}]`,
                    item[subKey],
                  );
                });
              } else {
                submitData.append(`${key}[]`, item);
              }
            });
          } else {
            submitData.append(key, value);
          }
        }
      });
    }
    if (isEditMode && Array.from(submitData.keys()).length <= 2) {
      toast.info("لم تقم بإجراء أي تعديلات جديدة لحفظها.");
      setLoading(false);
      return;
    }
    const apiUrl = isEditMode
      ? endpoints.drivers.update(id)
      : endpoints.drivers.create;
    if (!isEditMode) {
      const currentStepErrors = validateCurrentStep(step);
      setErrors(currentStepErrors);
      if (Object.keys(currentStepErrors).length > 0) {
        setLoading(false);
        return;
      }
    }
    setLoading(true);
    setErrors({});
    try {
      const response = await api.post(apiUrl, submitData, {
        headers: {
          Accept: "application/json",
          "Content-Type": "multipart/form-data",
        },
      });
      if (
        response.status === 201 &&
        response.data.message === "تم تسجيل السائق بنجاح"
      ) {
        toast.success(response.data.message);
        navigate("/dashboard/drivers");
      } else if (
        response.status === 200 &&
        response.data.message === "تم تعديل السائق بنجاح"
      ) {
        toast.success(response.data.message);
        navigate(`/drivers/${id}`);
      }
    } catch (error) {
      if (error.response && error.response.data) {
        const { message, errors: backendErrs } = error.response.data;
        if (backendErrs && backendErrs.id) {
          toast.error(backendErrs.id[0], { autoClose: 5000 });
          return;
        }
        if (backendErrs && Object.keys(backendErrs).length > 0) {
          setErrors(backendErrs);

          const errorSteps = new Set();
          Object.keys(backendErrs).forEach((field) => {
            errorSteps.add(getStepForField(field));
          });

          const stepsArray = Array.from(errorSteps).sort((a, b) => a - b);

          if (stepsArray.length === 1 && stepsArray[0] === 5) {
            toast.error(
              "يرجى تصحيح الأخطاء المظللة باللون الأحمر في هذه الصفحة.",
              { autoClose: 4000 },
            );
          } else {
            const stepNames = stepsArray.map((step) => `(${step})`).join(" و ");
            toast.error(
              `البيانات غير صالحة! يرجى مراجعة الخطوات: ${stepNames}`,
              { autoClose: 6000 },
            );
          }
        } else if (message) {
          toast.error(message, { autoClose: 5000 });
        }
      } else {
        toast.error(handleAxiosError(error));
      }
    } finally {
      setLoading(false);
    }
  };
  if (fetchingData) {
    return (
      <div className="tn-dd-loader-wrapper d-flex align-items-center justify-content-center vh-100">
        <Spinner animation="grow" className="tn-dd-text-orange" />
        <span className="ms-3 fw-bold text-muted">
          جاري تحميل بيانات السائق...
        </span>
      </div>
    );
  }
  return (
    <Container fluid className="wizard-main-container py-5" dir="rtl">
      <Row className="justify-content-center">
        <Col lg={11} xl={10}>
          <div className="master-stepper mb-5">
            {[
              { id: 1, label: "الحساب", icon: <User /> },
              { id: 2, label: "الهوية", icon: <IdCard /> },
              { id: 3, label: "خط العمل", icon: <Route /> },
              { id: 4, label: "المركبة", icon: <Car /> },
              { id: 5, label: "المرفقات", icon: <FileText /> },
            ]
              .filter((s) => !(isEditMode && s.id === 3))
              .map((s, index, arr) => (
                <React.Fragment key={s.id}>
                  <div
                    className={`stepper-node ${step >= s.id ? "active" : ""} ${
                      step > s.id ? "finished" : ""
                    }`}
                  >
                    <div className="node-circle">
                      {step > s.id ? <CheckCircle size={24} /> : s.icon}
                    </div>
                    <span className="node-label text-center">{s.label}</span>
                  </div>
                  {index !== arr.length - 1 && (
                    <div
                      className={`node-connector ${step > s.id ? "filled" : ""}`}
                    ></div>
                  )}
                </React.Fragment>
              ))}
          </div>

          <Card className="glass-wizard-card border-0 shadow-lg">
            <Card.Body className="p-0">
              <div className="wizard-header-accent"></div>
              <Form className="p-4 p-md-5">
                {step === 1 && (
                  <div className="step-content animate-fade-in">
                    <div className="d-flex align-items-center mb-4 section-head">
                      <div className="icon-box">
                        <User size={28} />
                      </div>
                      <div>
                        <h4 className="fw-bold mb-0">بيانات الحساب والتواصل</h4>
                        <p className="text-muted small mb-0">
                          إدخال البيانات الأساسية وأرقام الهواتف
                        </p>
                      </div>
                    </div>
                    <Row className="g-4">
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className="df-form-label">
                            الاسم الأول <span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Control
                            className="df-form-control"
                            required
                            name="first_name"
                            placeholder="أدخل الاسم الأول"
                            isInvalid={!!errors.first_name}
                            value={formData.first_name}
                            onChange={handleInputChange}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.first_name?.[0]}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className="df-form-label">
                            الكنية <span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Control
                            className="df-form-control"
                            required
                            name="last_name"
                            placeholder="أدخل الكنية"
                            isInvalid={!!errors.last_name}
                            value={formData.last_name}
                            onChange={handleInputChange}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.last_name?.[0]}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      {!isEditMode && (
                        <Col md={6}>
                          <Form.Group>
                            <Form.Label className="df-form-label">
                              البريد الإلكتروني{" "}
                              <span className="text-danger">*</span>
                            </Form.Label>
                            <Form.Control
                              className="df-form-control"
                              required
                              type="email"
                              name="email"
                              placeholder="example@domain.com"
                              isInvalid={!!errors.email}
                              value={formData.email}
                              onChange={handleInputChange}
                            />
                            <Form.Control.Feedback type="invalid">
                              {errors.email?.[0]}
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                      )}
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className="df-form-label">
                            رقم الجوال الأساسي{" "}
                            <span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Control
                            className="df-form-control"
                            required
                            name="phone_number"
                            placeholder="مثال: 09XXXXXXXX"
                            isInvalid={!!errors.phone_number}
                            value={formData.phone_number}
                            onChange={handleInputChange}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.phone_number?.[0]}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className="df-form-label">
                            رقم جوال إضافي
                          </Form.Label>
                          <Form.Control
                            className="df-form-control"
                            name="additional_phone_number"
                            placeholder="رقم إضافي (اختياري)"
                            value={formData.additional_phone_number}
                            onChange={handleInputChange}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </div>
                )}

                {step === 2 && (
                  <div className="step-content animate-fade-in">
                    <div className="d-flex align-items-center mb-4 section-head">
                      <div className="icon-box">
                        <IdCard size={28} />
                      </div>
                      <div>
                        <h4 className="fw-bold mb-0">
                          سجل بيانات السائق الكامل
                        </h4>
                        <p className="text-muted small mb-0">
                          يرجى مطابقة البيانات مع الهوية الشخصية
                        </p>
                      </div>
                    </div>
                    <Row className="g-3">
                      <Col md={4}>
                        <Form.Group>
                          <Form.Label className="df-form-label">
                            اسم الأب <span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Control
                            className="df-form-control"
                            required
                            name="father_name"
                            placeholder="أدخل اسم الأب"
                            isInvalid={!!errors.father_name}
                            value={formData.father_name}
                            onChange={handleInputChange}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.father_name?.[0]}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group>
                          <Form.Label className="df-form-label">
                            اسم الأم <span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Control
                            className="df-form-control"
                            required
                            name="mother_name"
                            placeholder="أدخل اسم الأم"
                            isInvalid={!!errors.mother_name}
                            value={formData.mother_name}
                            onChange={handleInputChange}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.mother_name?.[0]}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group>
                          <Form.Label className="df-form-label">
                            نسبة الأم <span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Control
                            className="df-form-control"
                            required
                            name="mother_last_name"
                            placeholder="أدخل نسبة الأم"
                            isInvalid={!!errors.mother_last_name}
                            value={formData.mother_last_name}
                            onChange={handleInputChange}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.mother_last_name?.[0]}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>

                      <Col md={4}>
                        <Form.Group>
                          <Form.Label className="df-form-label">
                            تاريخ الميلاد <span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Control
                            className="df-form-control"
                            required
                            type="date"
                            name="birth_date"
                            max={yesterday}
                            isInvalid={!!errors.birth_date}
                            value={formData.birth_date}
                            onChange={handleInputChange}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.birth_date?.[0]}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group>
                          <Form.Label className="df-form-label">
                            مكان الميلاد <span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Control
                            className="df-form-control"
                            required
                            name="birth_place"
                            placeholder="مثال: دمشق"
                            isInvalid={!!errors.birth_place}
                            value={formData.birth_place}
                            onChange={handleInputChange}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.birth_place?.[0]}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group>
                          <Form.Label className="df-form-label">
                            الرقم الوطني <span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Control
                            className="df-form-control"
                            required
                            name="national_number"
                            placeholder="أدخل الرقم الوطني (11 خانة)"
                            isInvalid={!!errors.national_number}
                            value={formData.national_number}
                            onChange={handleInputChange}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.national_number?.[0]}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>

                      <Col md={12} className="mt-4 mb-2">
                        <div className="d-flex align-items-center text-primary fw-bold small">
                          <MapPin size={16} className="ms-2" /> تفاصيل العنوان
                          والجنسية
                        </div>
                      </Col>

                      <Col md={4}>
                        <Form.Group>
                          <Form.Label className="df-form-label">
                            المحافظة <span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Control
                            className="df-form-control"
                            required
                            name="governorate"
                            placeholder="مثال: دمشق"
                            isInvalid={!!errors.governorate}
                            value={formData.governorate}
                            onChange={handleInputChange}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.governorate?.[0]}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group>
                          <Form.Label className="df-form-label">
                            المدينة <span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Control
                            className="df-form-control"
                            required
                            name="city"
                            placeholder="أدخل المدينة"
                            isInvalid={!!errors.city}
                            value={formData.city}
                            onChange={handleInputChange}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.city?.[0]}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group>
                          <Form.Label className="df-form-label">
                            الحي / المنطقة{" "}
                            <span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Control
                            className="df-form-control"
                            required
                            name="neighborhood"
                            placeholder="أدخل الحي أو المنطقة"
                            isInvalid={!!errors.neighborhood}
                            value={formData.neighborhood}
                            onChange={handleInputChange}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.neighborhood?.[0]}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>

                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className="df-form-label">
                            الجنسية <span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Control
                            className="df-form-control"
                            required
                            name="nationality"
                            placeholder="مثال: عربي سوري"
                            isInvalid={!!errors.nationality}
                            value={formData.nationality}
                            onChange={handleInputChange}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.nationality?.[0]}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className="df-form-label">
                            الجنس <span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Select
                            className="df-form-select"
                            required
                            name="gender"
                            value={formData.gender}
                            onChange={handleInputChange}
                          >
                            <option value="ذكر">ذكر</option>
                            <option value="أنثى">أنثى</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                    </Row>
                  </div>
                )}

                {!isEditMode && step === 3 && (
                  <div className="step-content animate-fade-in">
                    <div className="d-flex align-items-center mb-4 section-head">
                      <div className="icon-box">
                        <Route size={28} />
                      </div>
                      <div>
                        <h4 className="fw-bold mb-0">خط العمل</h4>
                        <p className="text-muted small mb-0">
                          حدد المحافظات التي سيشملها مسار الشحن للسائق
                        </p>
                      </div>
                    </div>
                    <div className="mb-3">
                      <span className="text-muted small">
                        يرجى اختيار محافظة واحدة على الأقل{" "}
                        <span className="text-danger">*</span>
                      </span>
                    </div>
                    {errors.governorate_ids && (
                      <div className="alert alert-danger py-2 mb-4">
                        {errors.governorate_ids[0]}
                      </div>
                    )}
                    <Row className="g-3">
                      {governorates.map((gov) => (
                        <Col md={3} sm={4} xs={6} key={gov.id}>
                          <Form.Check
                            type="checkbox"
                            id={`gov-${gov.id}`}
                            label={gov.name}
                            checked={formData.governorate_ids.includes(gov.id)}
                            onChange={() => handleGovernorateToggle(gov.id)}
                            className="custom-control"
                          />
                        </Col>
                      ))}
                    </Row>
                  </div>
                )}

                {step === 4 && (
                  <div className="step-content animate-fade-in">
                    <div className="d-flex align-items-center mb-4 section-head">
                      <div className="icon-box">
                        <Car size={28} />
                      </div>
                      <div>
                        <h4 className="fw-bold mb-0">بيانات المركبة الفنية</h4>
                        <p className="text-muted small mb-0">
                          المعلومات المسجلة في أوراق الميكانيك
                        </p>
                      </div>
                    </div>
                    <Row className="g-4">
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className="df-form-label">
                            نوع المركبة <span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Select
                            className="df-form-select"
                            required
                            name="vehicle_type_id"
                            isInvalid={!!errors.vehicle_type_id}
                            value={formData.vehicle_type_id}
                            onChange={handleInputChange}
                          >
                            <option value="">اختر نوع المركبة</option>
                            {vehicleTypes.map((type) => (
                              <option key={type.id} value={type.id}>
                                {type.type}
                              </option>
                            ))}
                          </Form.Select>
                          <Form.Control.Feedback type="invalid">
                            {errors.vehicle_type_id?.[0]}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className="df-form-label">
                            نوع الوقود <span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Select
                            className="df-form-select"
                            required
                            name="fuel_type"
                            isInvalid={!!errors.fuel_type}
                            value={formData.fuel_type}
                            onChange={handleInputChange}
                          >
                            <option value="">اختر الوقود...</option>
                            {fuelTypes.map((fuel) => (
                              <option key={fuel.id} value={fuel.name}>
                                {fuel.name}
                              </option>
                            ))}
                          </Form.Select>
                          <Form.Control.Feedback type="invalid">
                            {errors.fuel_type?.[0]}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className="df-form-label">
                            حالة المركبة <span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Control
                            className="df-form-control"
                            required
                            placeholder="مثال: ممتازة، جيدة..."
                            name="car_status"
                            isInvalid={!!errors.car_status}
                            value={formData.car_status}
                            onChange={handleInputChange}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.car_status?.[0]}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className="df-form-label">
                            رقم اللوحة <span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Control
                            className="df-form-control"
                            required
                            name="license_plate_number"
                            isInvalid={!!errors.license_plate_number}
                            placeholder="أدخل رقم اللوحة"
                            value={formData.license_plate_number}
                            onChange={handleInputChange}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.license_plate_number?.[0]}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className="df-form-label">
                            الشركة المصنعة{" "}
                            <span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Control
                            className="df-form-control"
                            required
                            name="manufacturer"
                            isInvalid={!!errors.manufacturer}
                            placeholder="مثال: Hyundai"
                            value={formData.manufacturer}
                            onChange={handleInputChange}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.manufacturer?.[0]}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className="df-form-label">
                            الموديل <span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Control
                            className="df-form-control"
                            required
                            name="model"
                            placeholder="مثال: Avante"
                            isInvalid={!!errors.model}
                            value={formData.model}
                            onChange={handleInputChange}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.model?.[0]}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className="df-form-label">
                            سنة الصنع <span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Control
                            required
                            type="number"
                            name="year_of_manufacture"
                            placeholder="مثال: 2015"
                            isInvalid={!!errors.year_of_manufacture}
                            min="1900"
                            className="year_of_manufacture_input df-form-control"
                            value={formData.year_of_manufacture}
                            onChange={handleInputChange}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.year_of_manufacture?.[0]}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className="df-form-label">
                            اللون <span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Control
                            className="df-form-control"
                            required
                            name="color"
                            placeholder="لون المركبة"
                            isInvalid={!!errors.color}
                            value={formData.color}
                            onChange={handleInputChange}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.color?.[0]}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                    </Row>
                  </div>
                )}

                {step === 5 && (
                  <div className="step-content animate-fade-in">
                    <div className="text-center mb-5">
                      <h4 className="fw-bold">الوثائق الثبوتية الرقمية</h4>
                      <p className="text-muted">
                        الرجاء التأكد من وضوح الملفات المرفوعة
                      </p>
                    </div>
                    {isEditMode && (
                      <Alert
                        variant="warning"
                        className="d-flex flex-row-reverse align-items-center mb-4 border-0 border-start border-4 border-warning shadow-sm animate-fade-in alert-edit-mode"
                      >
                        <AlertTriangle
                          className="ms-3 text-warning flex-shrink-0"
                          size={24}
                        />
                        <div
                          className="w-100"
                        >
                          <h6
                            className="flex-grow-1 fw-bold mb-1 text-dark"
                            style={{ direction: "rtl", textAlign: "right" }}
                          >
                            ملاحظة وضع التعديل:
                          </h6>
                          <span className="text-muted small">
                            رفع أو اختيار أي ملف جديد هنا سيقوم بـ{" "}
                            <strong className="text-danger">
                              استبدال وحذف الملف القديم
                            </strong>{" "}
                            المرتبط بهذا النوع فور الحفظ. إذا كنت لا ترغب بتغيير
                            وثيقة معينة، فقط اترك حقل الملف الخاص بها فارغاً.
                          </span>
                        </div>
                      </Alert>
                    )}
                    <Row className="g-4 mb-4">
                      <Col lg={4}>
                        <div
                          className={`premium-upload-zone ${
                            formData.personal_picture ? "has-file" : ""
                          }`}
                        >
                          <UploadCloud
                            size={32}
                            className="mb-2 text-primary"
                          />
                          <h6>
                            الصورة الشخصية
                            <span className="text-danger">*</span>
                          </h6>

                          <Form.Control
                            className="df-form-control"
                            required
                            type="file"
                            name="personal_picture"
                            isInvalid={!!errors.personal_picture}
                            onChange={handleFileChange}
                            accept=".jpeg,.jpg,.png,.heic,.heif"
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.personal_picture?.[0]}
                          </Form.Control.Feedback>
                          {formData.personal_picture && (
                            <div className="file-status mt-2">
                              <Check size={14} /> تم الاختيار:{" "}
                              {formData.personal_picture.name}
                            </div>
                          )}
                        </div>
                      </Col>
                      <Col lg={4}>
                        <div
                          className={`premium-upload-zone ${
                            formData.unconvicted_file ? "has-file" : ""
                          }`}
                        >
                          <FileText size={32} className="mb-2 text-primary" />
                          <h6>
                            وثيقة غير محكوم (PDF){" "}
                            <span className="text-danger">*</span>
                          </h6>
                          <Form.Control
                            className="df-form-control"
                            required
                            type="file"
                            accept=".pdf"
                            name="unconvicted_file"
                            isInvalid={!!errors.unconvicted_file}
                            onChange={handleFileChange}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.unconvicted_file?.[0]}
                          </Form.Control.Feedback>
                          {formData.unconvicted_file && (
                            <div className="file-status mt-2">
                              <Check size={14} /> تم الاختيار:{" "}
                              {formData.unconvicted_file.name}
                            </div>
                          )}
                        </div>
                      </Col>
                      <Col lg={4}>
                        <div
                          className={`premium-upload-zone ${formData.license_file ? "has-file" : ""}`}
                        >
                          <IdCard size={32} className="mb-2 text-primary" />
                          <h6>
                            رخصة القيادة (PDF){" "}
                            <span className="text-danger">*</span>
                          </h6>
                          <Form.Control
                            className="df-form-control"
                            required
                            type="file"
                            accept=".pdf"
                            isInvalid={!!errors.license_file}
                            name="license_file"
                            onChange={handleFileChange}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.license_file?.[0]}
                          </Form.Control.Feedback>
                          {formData.license_file && (
                            <div className="file-status mt-2">
                              <Check size={14} /> تم الاختيار:{" "}
                              {formData.license_file.name}
                            </div>
                          )}
                        </div>
                      </Col>
                    </Row>

                    <h5 className="fw-bold mb-3 border-bottom pb-2">
                      أوراق المركبة (مطلوب ورقتين) (PDF)
                    </h5>

                    <Card className="mb-3 border-dashed">
                      <Card.Body>
                        <Row className="align-items-center">
                          <Col md={4}>
                            <strong>
                              وثيقة الميكانيك{" "}
                              <span className="text-danger">*</span>
                            </strong>
                          </Col>
                          <Col md={8}>
                            <Form.Control
                              className="df-form-control"
                              required
                              type="file"
                              accept=".pdf"
                              isInvalid={!!errors["car_papers.0.car_file"]}
                              onChange={(e) =>
                                handleCarPaperChange(
                                  1,
                                  "car_file",
                                  e.target.files[0],
                                )
                              }
                            />
                            <Form.Control.Feedback type="invalid">
                              {errors["car_papers.0.car_file"]?.[0]}
                            </Form.Control.Feedback>
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>

                    <Card className="mb-3 border-dashed">
                      <Card.Body>
                        <Row className="align-items-center">
                          <Col md={4} className="d-flex align-items-center my-2">
                            <Form.Select
                              className="df-form-select"
                              value={formData.car_papers[1].type}
                              onChange={(e) =>
                                handleCarPaperChange(2, "type", e.target.value)
                              }
                            >
                              <option value="ملكية">وثيقة ملكية</option>
                              <option value="اجار">عقد أجار</option>
                            </Form.Select>
                            <span className="text-danger ms-2">*</span>
                          </Col>
                          <Col md={8}>
                            <Form.Control
                              className="df-form-control"
                              required
                              accept=".pdf"
                              type="file"
                              isInvalid={!!errors["car_papers.1.car_file"]}
                              onChange={(e) =>
                                handleCarPaperChange(
                                  2,
                                  "car_file",
                                  e.target.files[0],
                                )
                              }
                            />
                            <Form.Control.Feedback type="invalid">
                              {errors["car_papers.1.car_file"]?.[0]}
                            </Form.Control.Feedback>
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>
                  </div>
                )}

                {/* Footer Actions */}
                <div className="wizard-actions mt-5 pt-4 d-flex justify-content-between">
                  <Button
                    variant="light"
                    className="action-btn prev"
                    onClick={prevStep}
                    disabled={step === 1}
                  >
                    <ChevronRight size={20} className="ms-2" /> السابق
                  </Button>

                  {step < 5 ? (
                    <Button
                      className="action-btn next"
                      onClick={handleNextStep}
                    >
                      التالي <ChevronLeft size={20} className="me-2" />
                    </Button>
                  ) : (
                    <Button
                      className="action-btn submit"
                      onClick={handleSubmit}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                            className="me-2"
                          />
                          جاري الإرسال...
                        </>
                      ) : (
                        <>
                          إتمام عملية التسجيل
                          <CheckCircle size={20} className="ms-2" />{" "}
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default DriverForm;
