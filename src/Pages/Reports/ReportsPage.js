import React, { useEffect, useState } from "react";
import { Row, Col, Card, Table, Spinner } from "react-bootstrap";
import { FaExclamationTriangle, FaCalendarAlt } from "react-icons/fa";
import api from "../../Api/Api";
import { handleAxiosError } from "../../Utils/ErrorHandler";
import { endpoints } from "../../Api/Endpoints";
import { toast } from "react-toastify";
import "./ReportsPage.css";

const ReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await api.get(endpoints.reports.get);
      if (response.status === 200) {
        setReports(response.data);
      }
    } catch (error) {
      toast.error(handleAxiosError(error));
    } finally {
      setTimeout(() => setLoading(false), 400);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const getTypeBadgeClass = (type) => {
    switch (type) {
      case "عدم الالتزام":
        return "tn-report-badge-danger";
      case "تكسر الأغراض":
        return "tn-report-badge-danger";
      case "مالي":
      case "تسعير":
        return "tn-report-badge-warning";
      case "تأخير بالتسليم":
      case "تأخير بالتوصيل":
        return "tn-report-badge-info";
      default:
        return "tn-report-badge-secondary";
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ar-SY", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading)
    return (
      <div className="d-flex flex-column justify-content-center align-items-center vh-100">
        <Spinner animation="grow" className="tn-load-orange" />
        <span className="mt-3 text-muted fw-semibold font-tajawal">
          جاري تحميل قائمة الإبلاغات...
        </span>
      </div>
    );

  return (
    <div className="tn-s-admin-page-container">
      {/* رأس الصفحة */}
      <Row className="align-items-center mb-5 g-3">
        <Col xs={12}>
          <div className="d-flex align-items-center gap-3">
            <div className="tn-s-page-icon-wrapper tn-report-icon-bg">
              <FaExclamationTriangle className="tn-s-page-icon tn-report-icon-color" />
            </div>
            <div>
              <h2 className="tn-s-admin-page-title">إدارة بلاغات وشكاوى المستخدمين</h2>
              <p className="tn-s-admin-page-subtitle">
                متابعة المشاكل التشغيلية، مراقبة سلوك السائقين، وضمان جودة خدمات شحن TransNet
              </p>
            </div>
          </div>
        </Col>
      </Row>

      <Row className="mb-4 g-4">
        <Col xs={12} sm={6} md={4}>
          <Card className="tn-report-mini-card">
            <Card.Body className="d-flex align-items-center justify-content-between p-4">
              <div>
                <span className="tn-report-card-label">إجمالي البلاغات</span>
                <h3 className="tn-report-card-value mt-1">{reports.length}</h3>
              </div>
              <div className="tn-report-mini-icon text-danger bg-light-danger">
                <FaExclamationTriangle />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="tn-report-table-card border-0 shadow-sm">
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table className="tn-custom-table align-middle mb-0">
              <thead>
                <tr>
                  <th>رقم البلاغ</th>
                  <th>المُبلِغ (Reporter)</th>
                  <th>المُبلَغ ضده (Reported)</th>
                  <th>نوع المخالفة</th>
                  <th style={{ width: "35%" }}>تفاصيل الشكوى</th>
                  <th>تاريخ البلاغ</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report.id}>
                    <td className="fw-bold text-secondary">#{report.id}</td>
                    
                    <td>
                      <div className="d-flex flex-column">
                        <span className="tn-user-fullname">
                          {report.reporter.first_name} {report.reporter.last_name}
                        </span>
                        <span className="tn-user-sub-info">
                          رقم: {report.reporter.user_number} | {report.reporter.phone_number}
                        </span>
                      </div>
                    </td>

                    <td>
                      <div className="d-flex flex-column">
                        <span className="tn-user-fullname fw-bold text-dark">
                          {report.reported_user.first_name} {report.reported_user.last_name}
                        </span>
                        <span className="tn-user-sub-info text-danger">
                          رقم: {report.reported_user.user_number} | {report.reported_user.phone_number}
                        </span>
                      </div>
                    </td>

                    <td>
                      <span className={`tn-report-badge ${getTypeBadgeClass(report.type)}`}>
                        {report.type}
                      </span>
                    </td>

                    <td>
                      <p className="tn-report-description-text mb-0" title={report.description}>
                        {report.description}
                      </p>
                    </td>

                    <td>
                      <div className="d-flex align-items-center gap-2 text-muted tn-report-date">
                        <FaCalendarAlt className="small-icon" />
                        <span>{formatDate(report.created_at)}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default ReportsPage;