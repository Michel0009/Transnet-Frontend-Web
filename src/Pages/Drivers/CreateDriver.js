import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Spinner,
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
  Route, // Imported Route icon for the new step
} from "lucide-react";
import "./CreateDriver.css";
import api from "../../Api/Api";
import { toast } from "react-toastify";
import { handleAxiosError } from "../../Utils/ErrorHandler";
import { endpoints } from "../../Api/Endpoints";
import { useNavigate } from "react-router-dom";

const CreateDriver = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [governorates, setGovernorates] = useState([]);
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [fuelTypes, setFuelTypes] = useState([]);
  const [errors, setErrors] = useState({});
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
    governorate_ids: [],
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
      { id: 1, type: "ميكانيك", car_file: null, label: "وثيقة الميكانيك" },
      {
        id: 2,
        type: "ملكية",
        car_file: null,
        label: "وثيقة الملكية أو الآجار",
      },
    ],
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
    const currentStepErrors = validateCurrentStep(step);

    if (Object.keys(currentStepErrors).length > 0) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        ...currentStepErrors,
      }));
      return;
    }

    setStep((s) => Math.min(s + 1, 5));
  };
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));
  const handleCreateDriver = async () => {
    const data = new FormData();

    Object.keys(formData).forEach((key) => {
      const value = formData[key];

      if (value !== null && value !== undefined) {
        if (Array.isArray(value)) {
          value.forEach((item, index) => {
            if (typeof item === "object" && !(item instanceof File)) {
              Object.keys(item).forEach((subKey) => {
                data.append(`${key}[${index}][${subKey}]`, item[subKey]);
              });
            } else {
              data.append(`${key}[]`, item);
            }
          });
        } else {
          data.append(key, value);
        }
      }
    });

    if (!validateCurrentStep(step)) return;
    setLoading(true);
    setErrors({});
    try {
      const response = await api.post(endpoints.drivers.create, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (
        response.status === 201 &&
        response.data.message === "تم تسجيل السائق بنجاح"
      ) {
        toast.success(response.data.message);
        navigate("/dashboard/drivers");
      }
    } catch (error) {
      if (error.response && error.response.data) {
        const { message, errors: backendErrs } = error.response.data;

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
            ].map((s, index, arr) => (
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
                          <Form.Label>
                            الاسم الأول <span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Control
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
                          <Form.Label>
                            الكنية <span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Control
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
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>
                            البريد الإلكتروني{" "}
                            <span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Control
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
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>
                            رقم الجوال الأساسي{" "}
                            <span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Control
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
                          <Form.Label>رقم جوال إضافي</Form.Label>
                          <Form.Control
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
                          <Form.Label>
                            اسم الأب <span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Control
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
                          <Form.Label>
                            اسم الأم <span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Control
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
                          <Form.Label>
                            نسبة الأم <span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Control
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
                          <Form.Label>
                            تاريخ الميلاد <span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Control
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
                          <Form.Label>
                            مكان الميلاد <span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Control
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
                          <Form.Label>
                            الرقم الوطني <span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Control
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
                          <Form.Label>
                            المحافظة <span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Control
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
                          <Form.Label>
                            المدينة <span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Control
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
                          <Form.Label>
                            الحي / المنطقة{" "}
                            <span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Control
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
                          <Form.Label>
                            الجنسية <span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Control
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
                          <Form.Label>
                            الجنس <span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Select
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

                {step === 3 && (
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
                          <Form.Label>
                            نوع المركبة <span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Select
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
                          <Form.Label>
                            نوع الوقود <span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Select
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
                          <Form.Label>
                            حالة المركبة <span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Control
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
                          <Form.Label>
                            رقم اللوحة <span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Control
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
                          <Form.Label>
                            الشركة المصنعة{" "}
                            <span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Control
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
                          <Form.Label>
                            الموديل <span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Control
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
                          <Form.Label>
                            سنة الصنع <span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Control
                            required
                            type="number"
                            name="year_of_manufacture"
                            placeholder="مثال: 2015"
                            isInvalid={!!errors.year_of_manufacture}
                            min="1900"
                            className="year_of_manufacture_input"
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
                          <Form.Label>
                            اللون <span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Control
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

                    {/* Basic Files */}
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

                    {/* Dynamic Car Papers Array */}
                    <h5 className="fw-bold mb-3 border-bottom pb-2">
                      أوراق المركبة (مطلوب ورقتين) (PDF)
                    </h5>

                    {/* الورقة الأولى: ميكانيك فقط ومثبتة */}
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

                    {/* الورقة الثانية: خيار بين ملكية أو آجار */}
                    <Card className="mb-3 border-dashed">
                      <Card.Body>
                        <Row className="align-items-center">
                          <Col md={4} className="d-flex align-items-center">
                            <Form.Select
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
                      onClick={handleCreateDriver}
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

export default CreateDriver;
