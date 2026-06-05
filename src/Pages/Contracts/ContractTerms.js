import React from "react";

import {
  Container,
  Row,
  Col,
  Card,
  Button,
} from "react-bootstrap";

import {
  FaPlus,
  FaTrash,
} from "react-icons/fa";

import "./ContractTerms.css";

const contractTerms = [
  {
    id: 1,
    order: "01",
    text: " يلتزم الطرف الثاني بتسليم الشحنة في الموعد المحدد المتفق عليه في وثيقة الشحن مع مراعاة كافة معايير السلامة والجودة العالمية.",
  },
  {
    id: 2,
    order: "02",
    text: "يتحمل الطرف الأول مسؤولية تعويض الطرف الثاني في حال ثبوت تلف البضائع نتيجة سوء التخزين أو الإهمال المتعمد خلال عملية المناولة.",
  },
  {
    id: 3,
    order: "03",
    text: "يتم سداد المستحقات المالية خلال مدة لا تتجاوز 14 يوماً من تاريخ استلام الفاتورة النهائية.",
  },
  {
    id: 4,
    order: "04",
    text: "يقر الطرفان بالسرية التامة لكافة المعلومات التجارية والبيانات اللوجستية المتبادلة طوال فترة سريان العقد.",
  },
];

const ContractTerms = () => {
  return (
    <div className="tn-main-content contract-page" dir="rtl">

      {/* HEADER */}
      <header className="d-flex justify-content-between align-items-center mb-4">

        <div>
          <h2 className="contract-title mb-1">
            البنود والشروط
          </h2>

          <p className="contract-subtitle mb-0">
            قم بمراجعة وتحديث البنود القانونية التي تحكم العلاقة التعاقدية
                بين النظام والشركات لضمان أعلى مستويات الشفافية والأمان.
          </p>
        </div>

        <Button className="tn-btn-orange fw-bold ms-auto">
          <FaPlus />
          إضافة بند
        </Button>

      </header>

      {/* CONTENT */}
      <Container fluid className="p-0">

        <Row className="justify-content-center">

          <Col md={11}>

            <Card className="contract-wrapper border-0 shadow-sm">

              <Card.Body className="p-3">

                <div className="d-flex flex-column gap-3">

                  {contractTerms.map((term) => (

                    <Card
                      key={term.id}
                      className="contract-item border-0"
                    >

                      <Card.Body className="p-4">

                        <div className="d-flex align-items-center justify-content-between gap-3">

                          {/* RIGHT SIDE */}
                          <div className="d-flex align-items-center gap-3 flex-grow-1 min-w-0">

                            {/* NUMBER */}
                            <div className="contract-number">
                              {term.order}
                            </div>

                            {/* TEXT */}
                            <div className="contract-text">
                              {term.text}
                            </div>

                          </div>

                          {/* DELETE */}
                          <button className="contract-delete-btn">
                            <FaTrash />
                          </button>

                        </div>

                      </Card.Body>

                    </Card>

                  ))}

                </div>

              </Card.Body>

            </Card>

          </Col>

        </Row>

      </Container>

    </div>
  );
};

export default ContractTerms;