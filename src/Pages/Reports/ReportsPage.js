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


  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
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
    <div className="tn-r-admin-page-container">
      <Row className="align-items-start mb-4 g-3">
        <Col xs={12}>
          <div className="d-flex align-items-center gap-3">
            <div>
              <h2 className="tn-r-admin-page-title">
                إدارة بلاغات وشكاوى المستخدمين
              </h2>
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
      <Card className="tn-r-table-card border-0">
        <Card.Body className="p-0">
          {reports.length === 0 ? (
            <div className="tn-r-empty-state">
              <div className="tn-r-empty-icon">
                <FaExclamationTriangle />
              </div>
              <h5 className="tn-r-empty-title">لا توجد بلاغات حالياً</h5>
              <p className="tn-r-empty-subtitle">
                ستظهر هنا أي بلاغات أو شكاوى يقدمها المستخدمون فور ورودها.
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table className="tn-r-table align-middle mb-0">
                <thead>
                  <tr>
                    <th>المُبلِغ</th>
                    <th>المُبلَغ ضده</th>
                    <th>نوع المخالفة</th>
                    <th>تفاصيل الشكوى</th>
                    <th>تاريخ البلاغ</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report) => {
                    return (
                      <tr key={report.id} className="tn-r-row">
                        <td>
                          <div className="tn-r-user-cell">
                        
                            <div className="tn-r-user-text">
                              <span className="tn-r-user-name">
                                {report.reporter.first_name}{" "}
                                {report.reporter.last_name}
                              </span>
                              <span className="tn-r-user-meta">
                                #{report.reporter.user_number} ·{" "}
                                {report.reporter.phone_number}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td>
                          <div className="tn-r-user-cell">
                  
                            <div className="tn-r-user-text">
                              <span className="tn-r-user-name tn-r-user-name-flagged">
                                {report.reported_user.first_name}{" "}
                                {report.reported_user.last_name}
                              </span>
                              <span className="tn-r-user-meta tn-r-user-meta-flagged">
                                #{report.reported_user.user_number} ·{" "}
                                {report.reported_user.phone_number}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td>
                          <span className="tn-r-badge">{report.type}</span>
                        </td>

                        <td>
                          <p
                            className="tn-r-description"
                            title={report.description}
                          >
                            {report.description}
                          </p>
                        </td>

                        <td>
                          <div className="tn-r-date-cell">
                            <FaCalendarAlt className="tn-r-date-icon" />
                            <span>{formatDate(report.created_at)}</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default ReportsPage;
