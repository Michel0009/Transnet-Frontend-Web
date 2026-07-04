import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Spinner,
  Button,
  Form,
} from "react-bootstrap";
import {
  FaChartPie,
  FaFilePdf,
  FaTruck,
  FaDollarSign,
  FaUsers,
  FaUserTie,
  FaClock,
} from "react-icons/fa";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Filler,
} from "chart.js";
import { Pie, Bar, Line } from "react-chartjs-2";
import { toast } from "react-toastify";
import api from "../../Api/Api";
import { endpoints } from "../../Api/Endpoints";
import { handleAxiosError } from "../../Utils/ErrorHandler";
import "./StatisticsPage.css";

// تسجيل مكونات Chart.js المطلوبة للرسوم البيانية
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Filler,
);

const Statistics = () => {
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [generalStats, setGeneralStats] = useState(null);
  const [shipmentStats, setShipmentStats] = useState([]);
  const [earningsStats, setEarningsStats] = useState(null);

  // الحالة الخاصة بالفلترة الزمنية (تم وضع قيمة افتراضية "month")
  const [filterDate, setFilterDate] = useState("months");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  // حالة الاحتفاظ بالمحافظات المحددة للفلترة (ترسل كـ Array للباك إند)
  const [selectedGovernorates, setSelectedGovernorates] = useState([]);

  const fetchStatisticsData = async () => {
    setLoading(true);
    try {
      const payload = {
        filter_date: filterDate,
      };
      if (startDate) payload.start_date = startDate;
      if (endDate) payload.end_date = endDate;

      // إضافة مصفوفة المحافظات المحددة إلى الـ payload إذا كانت تحتوي على عناصر
      if (selectedGovernorates.length > 0) {
        payload.governorate_ids = selectedGovernorates;
      }
      setGeneralStats({
        shipments_count_today: 187,
        this_month_earnings: 8750000,
        clients_count: 342,
        drivers_count: 96,

        user_statistics: {
          clients_count: 342,
          clients_percentage: 63,

          drivers_count: 96,
          drivers_percentage: 18,

          frozen_drivers_count: 34,
          frozen_drivers_percentage: 6,

          blocked_clients_count: 41,
          blocked_clients_percentage: 8,

          blocked_drivers_count: 28,
          blocked_drivers_percentage: 5,
        },
      });

      setShipmentStats([
        { name: "دمشق", shipments_count: 210 },
        { name: "ريف دمشق", shipments_count: 185 },
        { name: "حلب", shipments_count: 170 },
        { name: "حمص", shipments_count: 95 },
        { name: "حماة", shipments_count: 80 },
        { name: "اللاذقية", shipments_count: 75 },
        { name: "طرطوس", shipments_count: 52 },
        { name: "درعا", shipments_count: 45 },
      ]);
      const [generalRes, shipmentRes] = await Promise.all([
        api.get(endpoints.statistics.getGeneralStatistics),
        api.post(endpoints.statistics.getStatistics, payload),
      ]);

      setGeneralStats(generalRes.data);
      setShipmentStats(shipmentRes.data.shipments_count_statistics || []);
      setEarningsStats(shipmentRes.data.shipments_earnings_statistics || null);
    } catch (error) {
      if (error?.response?.status === 422) {
        const validationErrors = error.response.data?.errors;
        if (validationErrors?.filter_date)
          toast.error(validationErrors.filter_date[0]);
        if (validationErrors?.start_date)
          toast.error(validationErrors.start_date[0]);
        if (validationErrors?.end_date)
          toast.error(validationErrors.end_date[0]);
      } else {
        toast.error(
          handleAxiosError(error) || "حدث خطأ أثناء جلب البيانات الإحصائية.",
        );
      }
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchStatisticsData();
  }, [filterDate, selectedGovernorates]);

  // دالة تصدير الـ PDF النظيفة المتوافقة مع تسمية ملف الـ Endpoints لديك
  const handleExportPdf = async () => {
    try {
      setExporting(true);
      const payload = { filter_date: filterDate };
      if (startDate) payload.start_date = startDate;
      if (endDate) payload.end_date = endDate;
      // [تعديل] تضمين المحافظات المحددة في تقرير الـ PDF
      if (selectedGovernorates.length > 0)
        payload.governorate_ids = selectedGovernorates;

      const response = await api.post(
        endpoints.statistics.exportStatisticsPDF,
        payload,
        { responseType: "blob" },
      );

      const blob = new Blob([response.data], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `statistics_report.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("تم تصدير تقرير الإحصائيات بنجاح.");
    } catch (error) {
      if (error?.response?.status === 422) {
        const validationErrors = error.response.data?.errors;
        if (validationErrors?.filter_date)
          toast.error(validationErrors.filter_date[0]);
        if (validationErrors?.start_date)
          toast.error(validationErrors.start_date[0]);
        if (validationErrors?.end_date)
          toast.error(validationErrors.end_date[0]);
      } else {
        toast.error(handleAxiosError(error));
      }
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center vh-100">
        <Spinner animation="grow" className="tn-load-orange" />
        <span className="mt-3 text-muted fw-semibold">
          جاري تحميل الإحصائيات...
        </span>
      </div>
    );
  }

  // إعداد بيانات ومخطط Pie Chart لـ حالة المستخدمين
  const userStats = generalStats?.user_statistics || {};
  const pieChartData = {
    labels: [
      "العملاء",
      "السائقون",
      "السائقون المجمدون",
      "العملاء المحظورون",
      "السائقون المحظورون",
    ],
    datasets: [
      {
        data: [
          userStats.clients_percentage || 0,
          userStats.drivers_percentage || 0,
          userStats.frozen_drivers_percentage || 0,
          userStats.blocked_clients_percentage || 0,
          userStats.blocked_drivers_percentage || 0,
        ],
        backgroundColor: [
          "#0D7FF2",
          "#F28B0D",
          "#ffb04d",
          "#64748b",
          "#475569",
        ],
        borderWidth: 2,
        borderColor: "#ffffff",
      },
    ],
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
        rtl: true,
        labels: {
          font: { family: "Tajawal", size: 12, weight: "600" },
          boxWidth: 12,
          padding: 15,
        },
      },
      tooltip: {
        rtl: true,
        callbacks: {
          label: (context) => ` ${context.label}: ${context.raw}%`,
        },
      },
    },
  };

  // إعداد بيانات ومخطط Bar Chart لـ عدد الشحنات حسب المحافظات
  const barChartData = {
    labels: shipmentStats.map((item) => item.name),
    datasets: [
      {
        label: "عدد الشحنات",
        data: shipmentStats.map((item) => item.shipments_count),
        backgroundColor: "#ff8c00",
        borderRadius: 0,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { rtl: true },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { family: "Tajawal", weight: "600" } },
      },
      y: {
        beginAtZero: true,
        grid: { color: "#f1f5f9" },
        ticks: { font: { family: "Tajawal" } },
      },
    },
  };
  // إعداد بيانات ومخطط الأرباح (Line Chart) - يعكس الصعود والهبوط في الإيرادات عبر الزمن
  const earningsByDate = earningsStats?.earnings_by_date || {};
  const earningsEntries = Object.entries(earningsByDate);

  const formatEarningsLabel = (key) => {
    if (/^\d{4}-\d{2}-\d{2} \d{2}:00$/.test(key)) {
      return key.split(" ")[1];
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(key)) {
      const [, m, d] = key.split("-");
      return `${d}/${m}`;
    }
    if (/^\d{4}-\d{2}$/.test(key)) {
      const [y, m] = key.split("-");
      return `${m}/${y}`;
    }
    return key;
  };

  const lineChartData = {
    labels: earningsEntries.map(([key]) => formatEarningsLabel(key)),
    datasets: [
      {
        label: "الأرباح",
        data: earningsEntries.map(([, value]) => value),
        borderColor: "#ff8c00",
        backgroundColor: (context) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return "rgba(255, 140, 0, 0.15)";
          const gradient = ctx.createLinearGradient(
            0,
            chartArea.top,
            0,
            chartArea.bottom,
          );
          gradient.addColorStop(0, "rgba(255, 140, 0, 0.28)");
          gradient.addColorStop(1, "rgba(255, 140, 0, 0.02)");
          return gradient;
        },
        fill: true,
        tension: 0.35,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: "#ffffff",
        pointBorderColor: "#ff8c00",
        pointBorderWidth: 2,
        borderWidth: 3,
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        rtl: true,
        callbacks: {
          label: (context) =>
            ` ${Number(context.raw).toLocaleString("ar-SY")} ل.س`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { family: "Tajawal", weight: "600" } },
      },
      y: {
        beginAtZero: true,
        grid: { color: "#f1f5f9" },
        ticks: {
          font: { family: "Tajawal" },
          callback: (value) => Number(value).toLocaleString("ar-SY"),
        },
      },
    },
  };
  return (
    <Container fluid className="tn-s-admin-page-container" dir="rtl">
      {/* القسم العلوي: تم تقسيم الفلاتر لتصبح أسفل العنوان وزر التصدير لحل مشكلة التكدس المساحي */}

      {/* السطر الأول: يحتوي على العنوان وأيقونة FaChartPie وزر التصدير البرتقالي فقط */}
      <Row className="align-items-center mb-4 g-3">
        <Col xs={12} md={8}>
          <div className="d-flex align-items-center gap-3">
            <div className="tn-s-page-icon-wrapper">
              {/* الحفاظ على أيقونتك الأصلية تماماً */}
              <FaChartPie className="tn-s-page-icon" />
            </div>
            <div>
              <h2 className="tn-s-admin-page-title">الإحصائيات الشاملة</h2>
              <p className="tn-s-admin-page-subtitle">
                متابعة نشاط النظام والشحنات والعملاء والسائقين لشبكة TransNet
              </p>
            </div>
          </div>
        </Col>

        {/* زر التصدير لوحده في أقصى اليسار ضمن السطر الأول */}
        <Col
          xs={12}
          md={4}
          className="d-flex justify-content-md-end align-items-center"
        >
          <Button
            className="tn-s-export-pdf-btn"
            onClick={handleExportPdf}
            disabled={exporting}
          >
            {exporting ? (
              <Spinner animation="border" size="sm" className="me-2" />
            ) : (
              <FaFilePdf className="ms-2" />
            )}
            تصدير PDF
          </Button>
        </Col>
      </Row>

      {/* السطر الثاني: الفلاتر مجتمعة بكامل راحتها أسفل السطر الأول مباشرة */}
      <Row className="mb-5 g-3">
        <Col xs={12} className="d-flex align-items-center gap-3 flex-wrap">
          {/* 1. القائمة المنسدلة للفلترة السريعة المعتادة */}
          <div className="tn-s-filter-select-wrapper">
            <Form.Select
              className="tn-s-filter-select"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            >
              <option value="days">اليوم</option>
              <option value="months">الأشهر</option>
              <option value="years">السنوات</option>
            </Form.Select>
          </div>

          {/* 2. كبسولة فترات التاريخ المنفصلة مع زر التطبيق الأزرق المدمج بداخله */}
          <div className="tn-s-date-range-container d-flex align-items-center gap-2">
            <div className="tn-s-date-range-picker">
              <div className="tn-s-date-input-group">
                <span className="tn-s-date-label">من</span>
                <Form.Control
                  type="date"
                  className="tn-s-date-control tn-s-mm-dd-yyyy"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div className="tn-s-date-separator"></div>

              <div className="tn-s-date-input-group">
                <span className="tn-s-date-label">إلى</span>
                <Form.Control
                  type="date"
                  className="tn-s-date-control tn-s-mm-dd-yyyy"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />

                {/* الفاصل الخطي قبل الزر */}
                <div className="tn-s-date-separator"></div>

                {/* زر التطبيق المدمج ذكياً باللون الأزرق المعتمد */}
                <Button
                  className="tn-s-apply-filter-btn"
                  onClick={fetchStatisticsData}
                  disabled={loading}
                >
                  تطبيق
                </Button>
              </div>
            </div>
          </div>
        </Col>
      </Row>

      {/* الصف الأول: كروت الـ KPI الأربعة */}
      <Row className="g-4 mb-5">
        <Col xs={12} sm={6} lg={3}>
          <Card className="tn-s-kpi-card border-0">
            <Card.Body className="d-flex align-items-center justify-content-between p-4">
              <div>
                <p className="tn-s-kpi-title mb-1">إجمالي الشحنات اليوم</p>
                <h3 className="tn-s-kpi-value mb-0">
                  {generalStats?.shipments_count_today || 0}
                </h3>
              </div>
              <div className="tn-s-kpi-icon-box tn-s-orange-gradient-bg">
                <FaTruck />
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} sm={6} lg={3}>
          <Card className="tn-s-kpi-card border-0">
            <Card.Body className="d-flex align-items-center justify-content-between p-4">
              <div>
                <p className="tn-s-kpi-title mb-1">إيرادات الشهر الحالي</p>
                <h3 className="tn-s-kpi-value mb-0">
                  {generalStats?.this_month_earnings || 0}
                  <span className="tn-s-currency-label ms-1">ل.س</span>
                </h3>
              </div>
              <div className="tn-s-kpi-icon-box tn-s-green-gradient-bg">
                <FaDollarSign />
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} sm={6} lg={3}>
          <Card className="tn-s-kpi-card border-0">
            <Card.Body className="d-flex align-items-center justify-content-between p-4">
              <div>
                <p className="tn-s-kpi-title mb-1">إجمالي العملاء</p>
                <h3 className="tn-s-kpi-value mb-0">
                  {generalStats?.clients_count || 0}
                </h3>
              </div>
              <div className="tn-s-kpi-icon-box tn-s-blue-gradient-bg">
                <FaUsers />
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} sm={6} lg={3}>
          <Card className="tn-s-kpi-card border-0">
            <Card.Body className="d-flex align-items-center justify-content-between p-4">
              <div>
                <p className="tn-s-kpi-title mb-1">إجمالي السائقين</p>
                <h3 className="tn-s-kpi-value mb-0">
                  {generalStats?.drivers_count || 0}
                </h3>
              </div>
              <div className="tn-s-kpi-icon-box tn-s-slate-gradient-bg">
                <FaUserTie />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* الصف الثاني: الرسوم البيانية */}
      <Row className="g-4 mb-5">
        {/* كارد حالة المستخدمين */}
        <Col xs={12} lg={6}>
          <Card className="tn-s-admin-card border-0 p-4">
            <h5 className="tn-s-chart-title mb-4">حالة المستخدمين</h5>
            <div className="tn-s-chart-wrapper-pie">
              <Pie data={pieChartData} options={pieChartOptions} />
            </div>
            <div className="tn-s-real-counts-container mt-4 pt-3 border-top">
              <Row className="g-2 text-center">
                <Col xs={4}>
                  <div className="tn-s-count-label">العملاء</div>
                  {/* تم تعديل الكلاس ليصبح مخصصاً للعملاء */}
                  <div className="tn-s-count-val tn-s-color-clients">
                    {userStats.clients_count || 0}
                  </div>
                </Col>
                <Col xs={4}>
                  <div className="tn-s-count-label">السائقون</div>
                  {/* تم تعديل الكلاس ليصبح مخصصاً للسائقين */}
                  <div className="tn-s-count-val tn-s-color-drivers">
                    {userStats.drivers_count || 0}
                  </div>
                </Col>
                <Col xs={4}>
                  <div className="tn-s-count-label">السائقون المجمدون</div>
                  {/* تم تعديل الكلاس ليصبح مخصصاً للمجمدين */}
                  <div className="tn-s-count-val tn-s-color-frozen">
                    {userStats.frozen_drivers_count || 0}
                  </div>
                </Col>
                <Col xs={6} className="mt-2">
                  <div className="tn-s-count-label">عملاء محظورون</div>
                  {/* تم تعديل الكلاس ليصبح مخصصاً للعملاء المحظورين */}
                  <div className="tn-s-count-val tn-s-color-blocked-clients">
                    {userStats.blocked_clients_count || 0}
                  </div>
                </Col>
                <Col xs={6} className="mt-2">
                  <div className="tn-s-count-label">سائقون محظورون</div>
                  {/* تم تعديل الكلاس ليصبح مخصصاً للسائقين المحظورين */}
                  <div className="tn-s-count-val tn-s-color-blocked-drivers">
                    {userStats.blocked_drivers_count || 0}
                  </div>
                </Col>
              </Row>
            </div>
          </Card>
        </Col>

        {/* كارد عدد الشحنات حسب المحافظات - اختيار متعدد احترافي */}
        <Col xs={12} lg={6}>
          <Card className="tn-s-admin-card border-0 p-4">
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
              <h5 className="tn-s-chart-title mb-0">
                عدد الشحنات حسب المحافظات
              </h5>

              {/* قائمة منسدلة مخصصة للاختيار المتعدد */}
              <div className="dropdown" style={{ minWidth: "200px" }}>
                <button
                  className="btn btn-outline-secondary btn-sm dropdown-toggle w-100 d-flex justify-content-between align-items-center"
                  type="button"
                  id="governoratesDropdown"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  style={{
                    borderRadius: "8px",
                    padding: "8px 12px",
                    borderColor: "#e2e8f0",
                    color: "#ff8c00",
                  }}
                >
                  {selectedGovernorates.length === 0
                    ? "جميع المحافظات"
                    : `تم تحديد (${selectedGovernorates.length}) محافظات`}
                </button>

                <ul
                  className="dropdown-menu p-2 w-100"
                  aria-labelledby="governoratesDropdown"
                  style={{
                    maxHeight: "250px",
                    overflowY: "auto",
                    borderRadius: "8px",
                    textAlign: "right",
                  }}
                >
                  {/* خيار إلغاء التحديد السريع */}
                  <li>
                    <button
                      className="dropdown-item text-danger fw-bold btn-sm mb-1"
                      type="button"
                      onClick={() => setSelectedGovernorates([])}
                    >
                      تصفير التحديد (الكل)
                    </button>
                  </li>
                  <li>
                    <hr className="dropdown-divider" />
                  </li>

                  {/* المحافظات الـ 14 مع Checkbox */}
                  {[
                    { id: 1, name: "دمشق" },
                    { id: 2, name: "ريف دمشق" },
                    { id: 3, name: "حلب" },
                    { id: 4, name: "اللاذقية" },
                    { id: 5, name: "حماة" },
                    { id: 6, name: "حمص" },
                    { id: 7, name: "درعا" },
                    { id: 8, name: "القنيطرة" },
                    { id: 9, name: "الرقة" },
                    { id: 10, name: "دير الزور" },
                    { id: 11, name: "الحسكة" },
                    { id: 12, name: "إدلب" },
                    { id: 13, name: "السويداء" },
                    { id: 14, name: "طرطوس" },
                  ].map((gov) => (
                    <li key={gov.id} className="p-1">
                      <Form.Check
                        type="checkbox"
                        id={`gov-${gov.id}`}
                        label={gov.name}
                        className="fs-6 custom-gov-checkbox"
                        checked={selectedGovernorates.includes(gov.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            // إضافة الـ ID إلى المصفوفة إذا تم التحديد
                            setSelectedGovernorates([
                              ...selectedGovernorates,
                              gov.id,
                            ]);
                          } else {
                            // إزالة الـ ID من مصفوفة التحديد عند إلغاء الصح
                            setSelectedGovernorates(
                              selectedGovernorates.filter(
                                (id) => id !== gov.id,
                              ),
                            );
                          }
                        }}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="tn-s-chart-wrapper-bar">
              {shipmentStats.length > 0 ? (
                <Bar data={barChartData} options={barChartOptions} />
              ) : (
                <div className="h-100 d-flex align-items-center justify-content-center text-muted">
                  لا توجد شحنات مسجلة للمحافظات المختارة.
                </div>
              )}
            </div>
          </Card>
        </Col>
      </Row>

      {/* الصف الثالث: Placeholder نسبة الأرباح الشهرية */}
      {/* الصف الثالث: مخطط الأرباح عبر الزمن */}
      <Row>
        <Col xs={12}>
          <Card className="tn-s-admin-card border-0 p-4">
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
              <h5 className="tn-s-chart-title mb-0">تطور الأرباح عبر الزمن</h5>

              {earningsStats && (
                <div className="d-flex align-items-center gap-4">
                  <div className="text-center">
                    <div className="tn-s-count-label">شحنات غير مدفوعة</div>
                    <div className="tn-s-count-val tn-s-color-blocked-drivers">
                      {earningsStats.unpaid_shipments_count || 0}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="tn-s-count-label">أرباح غير محصلة</div>
                    <div className="tn-s-count-val tn-s-color-drivers">
                      {Number(
                        earningsStats.unpaid_shipments_earnings || 0,
                      ).toLocaleString("ar-SY")}{" "}
                      <span className="tn-s-currency-label">ل.س</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="tn-s-chart-wrapper-line">
              {earningsEntries.length > 0 ? (
                <Line data={lineChartData} options={lineChartOptions} />
              ) : (
                <div className="h-100 d-flex flex-column align-items-center justify-content-center text-muted">
                  <FaClock
                    className="tn-s-clock-pulse mb-2"
                    style={{ fontSize: "1.8rem" }}
                  />
                  لا توجد بيانات أرباح لعرضها ضمن الفترة المحددة.
                </div>
              )}
            </div>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};;

export default Statistics;
