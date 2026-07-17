import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import api from "../Api/Api";
import { endpoints } from "../Api/Endpoints";
import { toast } from "react-toastify";
import { handleAxiosError } from "../Utils/ErrorHandler";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileSignature } from "@fortawesome/free-solid-svg-icons";

const AddContractModal = ({ show, onHide, onSuccess }) => {
  const [form, setForm] = useState({
    company_name: "",
    cr_number: "",
    hq: "",
    representative: "",
    name: "",
    father_name: "",
    mother_name: "",
    birth_place_date: "",
    national_id: "",
    amana: "",
    qaid: "",
    address: "",
    grant_date: "",
  });

  const [errors, setErrors] = useState({
    company_name: "",
    cr_number: "",
    hq: "",
    representative: "",
    name: "",
    father_name: "",
    mother_name: "",
    birth_place_date: "",
    national_id: "",
    amana: "",
    qaid: "",
    address: "",
    grant_date: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (show) {
      setForm({
        company_name: "",
        cr_number: "",
        hq: "",
        representative: "",
        name: "",
        father_name: "",
        mother_name: "",
        birth_place_date: "",
        national_id: "",
        amana: "",
        qaid: "",
        address: "",
        grant_date: "",
      });

      setErrors({
        company_name: "",
        cr_number: "",
        hq: "",
        representative: "",
        name: "",
        father_name: "",
        mother_name: "",
        birth_place_date: "",
        national_id: "",
        amana: "",
        qaid: "",
        address: "",
        grant_date: "",
      });
    }
  }, [show]);

  const handleSubmit = async () => {
     const validationErrors = {};

  if (!form.company_name.trim())
    validationErrors.company_name = "اسم الشركة مطلوب";

  if (!form.hq.trim())
    validationErrors.hq = "المقر الرئيسي مطلوب";

  if (!form.representative.trim())
    validationErrors.representative = "المفوض بالتوقيع مطلوب";

  if (!form.name.trim())
    validationErrors.name = "الاسم الكامل مطلوب";

  if (!form.father_name.trim())
    validationErrors.father_name = "اسم الأب مطلوب";

  if (!form.mother_name.trim())
    validationErrors.mother_name = "اسم الأم مطلوب";

  if (!form.birth_place_date.trim())
    validationErrors.birth_place_date = "مكان وتاريخ الولادة مطلوب";

  if (!form.national_id.trim())
    validationErrors.national_id = "الرقم الوطني مطلوب";

  if (!form.amana.trim())
    validationErrors.amana = "الأمانة مطلوبة";

  if (!form.qaid.trim())
    validationErrors.qaid = "القيد مطلوب";

  if (!form.address.trim())
    validationErrors.address = "العنوان السكني مطلوب";

  if (!form.grant_date)
    validationErrors.grant_date = "تاريخ منح البطاقة مطلوب";

  if (Object.keys(validationErrors).length > 0) {
    setErrors((prev) => ({
      ...prev,
      ...validationErrors,
    }));

    toast.error("يرجى تعبئة جميع الحقول المطلوبة");
    return;
  }
    setLoading(true);

    try {
      const response = await api.post(
        endpoints.contracts.create,
        {
          company_name: form.company_name,
          cr_number: form.cr_number,
          hq: form.hq,
          representative: form.representative,
          name: form.name,
          father_name: form.father_name,
          mother_name: form.mother_name,
          birth_place_date: form.birth_place_date,
          national_id: form.national_id,
          amana: form.amana,
          qaid: form.qaid,
          address: form.address,
          grant_date: form.grant_date,
        },
        {
          responseType: "blob",
        },
      );

      const pdfBlob = new Blob([response.data], { type: "application/pdf" });

      const pdfUrl = window.URL.createObjectURL(pdfBlob);

      const link = document.createElement("a");
      link.href = pdfUrl;
      link.download = "driver_contract.pdf";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(pdfUrl);

      onHide();

      if (onSuccess) {
        await onSuccess();
      }

      if (response.status === 200) {
        toast.success("تم إنشاء العقد بنجاح");

        onHide();
        if (onSuccess) await onSuccess();
      }
    } catch (err) {
if (err.response?.status === 422) {

    const errorText = await err.response.data.text();
    const errorData = JSON.parse(errorText);

    const backendErrors = errorData.errors || {};

    if (errorData.message) {
      toast.error(errorData.message);
    }

        setErrors({
          company_name: backendErrors?.company_name?.join("، ") || "",
          cr_number: backendErrors?.cr_number?.join("، ") || "",
          hq: backendErrors?.hq?.join("، ") || "",
          representative: backendErrors?.representative?.join("، ") || "",
          name: backendErrors?.name?.join("، ") || "",
          father_name: backendErrors?.father_name?.join("، ") || "",
          mother_name: backendErrors?.mother_name?.join("، ") || "",
          birth_place_date: backendErrors?.birth_place_date?.join("، ") || "",
          national_id: backendErrors?.national_id?.join("، ") || "",
          amana: backendErrors?.amana?.join("، ") || "",
          qaid: backendErrors?.qaid?.join("، ") || "",
          address: backendErrors?.address?.join("، ") || "",
          grant_date: backendErrors?.grant_date?.join("، ") || "",
        });
      } else {
        toast.error(handleAxiosError(err));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered dir="rtl" size="lg">
      <Modal.Header closeButton>
        <Modal.Title className="text-primary d-flex align-items-center gap-2">
          <FontAwesomeIcon icon={faFileSignature} /> إضافة عقد جديد
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          <div className="row g-4">
            <div className="col-md-6">
              <Form.Label className="fw-bold">
                اسم الشركة <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                disabled={loading}
                placeholder="ادخل اسم الشركة"
                value={form.company_name}
                isInvalid={!!errors.company_name}
                onChange={(e) => {
                  setForm({ ...form, company_name: e.target.value });
                  if (e.target.value.trim()) {
                    setErrors((prev) => ({
                      ...prev,
                      company_name: "",
                    }));
                  }
                }}
              />
              <Form.Control.Feedback type="invalid">
                {errors.company_name}
              </Form.Control.Feedback>
            </div>

            <div className="col-md-6">
              <Form.Label className="fw-bold">
                رقم السجل التجاري 
              </Form.Label>
              <Form.Control
                disabled={loading}
                placeholder="ادخل رقم السجل التجاري(اختياري)"
                value={form.cr_number}
                isInvalid={!!errors.cr_number}
                onChange={(e) => {
                  setForm({ ...form, cr_number: e.target.value });
                  if (e.target.value.trim()) {
                    setErrors((prev) => ({
                      ...prev,
                      cr_number: "",
                    }));
                  }
                }}
              />
              <Form.Control.Feedback type="invalid">
                {errors.cr_number}
              </Form.Control.Feedback>
            </div>

            <div className="col-md-6">
              <Form.Label className="fw-bold">
                المقر الرئيسي <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                disabled={loading}
                placeholder="أدخل المقر الرئيسي"
                value={form.hq}
                isInvalid={!!errors.hq}
                onChange={(e) => {
                  setForm({ ...form, hq: e.target.value });
                  if (e.target.value.trim()) {
                    setErrors((prev) => ({
                      ...prev,
                      hq: "",
                    }));
                  }
                }}
              />
              <Form.Control.Feedback type="invalid">
                {errors.hq}
              </Form.Control.Feedback>
            </div>

            <div className="col-md-6">
              <Form.Label className="fw-bold">
                المفوض بالتوقيع <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                disabled={loading}
                placeholder="ادخل اسم المفوض بالتوقيع"
                value={form.representative}
                isInvalid={!!errors.representative}
                onChange={(e) => {
                  setForm({ ...form, representative: e.target.value });
                  if (e.target.value.trim()) {
                    setErrors((prev) => ({
                      ...prev,
                      representative: "",
                    }));
                  }
                }}
              />
              <Form.Control.Feedback type="invalid">
                {errors.representative}
              </Form.Control.Feedback>
            </div>

            <div className="col-md-6">
              <Form.Label className="fw-bold">
                الاسم الكامل <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                disabled={loading}
                placeholder="ادخل الاسم الكامل"
                value={form.name}
                isInvalid={!!errors.name}
                onChange={(e) => {
                  setForm({ ...form, name: e.target.value });
                  if (e.target.value.trim()) {
                    setErrors((prev) => ({
                      ...prev,
                      name: "",
                    }));
                  }
                }}
              />
              <Form.Control.Feedback type="invalid">
                {errors.name}
              </Form.Control.Feedback>
            </div>

            <div className="col-md-6">
              <Form.Label className="fw-bold">
                اسم الأب <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                disabled={loading}
                placeholder="ادخل اسم الأب"
                value={form.father_name}
                isInvalid={!!errors.father_name}
                onChange={(e) => {
                  setForm({ ...form, father_name: e.target.value });
                  if (e.target.value.trim()) {
                    setErrors((prev) => ({
                      ...prev,
                      father_name: "",
                    }));
                  }
                }}
              />
              <Form.Control.Feedback type="invalid">
                {errors.father_name}
              </Form.Control.Feedback>
            </div>

            <div className="col-md-6">
              <Form.Label className="fw-bold">
                اسم الأم <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                disabled={loading}
                placeholder="ادخل اسم الأم"
                value={form.mother_name}
                isInvalid={!!errors.mother_name}
                onChange={(e) => {
                  setForm({ ...form, mother_name: e.target.value });
                  if (e.target.value.trim()) {
                    setErrors((prev) => ({
                      ...prev,
                      mother_name: "",
                    }));
                  }
                }}
              />
              <Form.Control.Feedback type="invalid">
                {errors.mother_name}
              </Form.Control.Feedback>
            </div>

            <div className="col-md-6">
              <Form.Label className="fw-bold">
                مكان وتاريخ الولادة <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                disabled={loading}
                placeholder="مثال: دمشق 1995/01/01"
                value={form.birth_place_date}
                isInvalid={!!errors.birth_place_date}
                onChange={(e) => {
                  setForm({
                    ...form,
                    birth_place_date: e.target.value,
                  });
                  if (e.target.value.trim()) {
                    setErrors((prev) => ({
                      ...prev,
                      birth_place_date: "",
                    }));
                  }
                }}
              />
              <Form.Control.Feedback type="invalid">
                {errors.birth_place_date}
              </Form.Control.Feedback>
            </div>

            <div className="col-md-6">
              <Form.Label className="fw-bold">
                الرقم الوطني <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                disabled={loading}
                placeholder="ادخل الرقم الوطني"
                value={form.national_id}
                isInvalid={!!errors.national_id}
                onChange={(e) => {
                  setForm({
                    ...form,
                    national_id: e.target.value,
                  });
                  if (e.target.value.trim()) {
                    setErrors((prev) => ({
                      ...prev,
                      national_id: "",
                    }));
                  }
                }}
              />
              <Form.Control.Feedback type="invalid">
                {errors.national_id}
              </Form.Control.Feedback>
            </div>

            <div className="col-md-6">
              <Form.Label className="fw-bold">
                الأمانة <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                disabled={loading}
                placeholder="ادخل الأمانة"
                value={form.amana}
                isInvalid={!!errors.amana}
                onChange={(e) => {
                  setForm({ ...form, amana: e.target.value });
                  if (e.target.value.trim()) {
                    setErrors((prev) => ({
                      ...prev,
                      amana: "",
                    }));
                  }
                }}
              />
              <Form.Control.Feedback type="invalid">
                {errors.amana}
              </Form.Control.Feedback>
            </div>

            <div className="col-md-6">
              <Form.Label className="fw-bold">
                القيد <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                disabled={loading}
                placeholder="ادخل رقم القيد"
                value={form.qaid}
                isInvalid={!!errors.qaid}
                onChange={(e) => {
                  setForm({ ...form, qaid: e.target.value });
                  if (e.target.value.trim()) {
                    setErrors((prev) => ({
                      ...prev,
                      qaid: "",
                    }));
                  }
                }}
              />
              <Form.Control.Feedback type="invalid">
                {errors.qaid}
              </Form.Control.Feedback>
            </div>

            <div className="col-md-6">
              <Form.Label className="fw-bold">
                تاريخ منح البطاقة <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="date"
                disabled={loading}
                value={form.grant_date}
                isInvalid={!!errors.grant_date}
                onChange={(e) => {
                  setForm({
                    ...form,
                    grant_date: e.target.value,
                  });
                  if (e.target.value.trim()) {
                    setErrors((prev) => ({
                      ...prev,
                      grant_date: "",
                    }));
                  }
                }}
              />
              <Form.Control.Feedback type="invalid">
                {errors.grant_date}
              </Form.Control.Feedback>
            </div>

            <div className="col-12">
              <Form.Label className="fw-bold">
                العنوان السكني <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                disabled={loading}
                placeholder="ادخل العنوان السكني"
                value={form.address}
                isInvalid={!!errors.address}
                onChange={(e) => {
                  setForm({
                    ...form,
                    address: e.target.value,
                  });
                  if (e.target.value.trim()) {
                    setErrors((prev) => ({
                      ...prev,
                      address: "",
                    }));
                  }
                }}
              />
              <Form.Control.Feedback type="invalid">
                {errors.address}
              </Form.Control.Feedback>
            </div>
          </div>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onHide} disabled={loading}>
          إلغاء
        </Button>

        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={loading}
          className="px-4 d-flex align-items-center gap-2"
        >
          {loading && <Spinner animation="border" size="sm" />}
          إضافة
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddContractModal;
