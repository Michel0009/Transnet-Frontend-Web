import React from "react";
import "./ShipmentSkeleton.css";
const ShipmentsSkeleton = ({ rows = 10 }) => {
  return (
    <>
      {[...Array(rows)].map((_, index) => (
        <tr key={`shipment-skeleton-${index}`}>
          {/* رقم الشحنة */}
          <td className="ps-4">
            <div className="tn-skeleton tn-skeleton-text w-50"></div>
          </td>

          {/* المحتوى */}
          <td>
            <div className="tn-skeleton tn-skeleton-text w-75"></div>
          </td>

          {/* الأبعاد */}
          <td className="text-center">
            <div className="tn-skeleton tn-skeleton-text w-100"></div>
          </td>

          {/* الوزن */}
          <td>
            <div className="tn-skeleton tn-skeleton-text w-50"></div>
          </td>

          {/* عمود التأمين (الكبسولة الجديدة) */}
          <td className="text-center">
            <div
              className="tn-skeleton tn-skeleton-pill"
              style={{ width: "70px", height: "22px" }}
            ></div>
          </td>

          {/* المسار */}
          <td>
            <div className="d-flex align-items-center gap-2">
              <div className="tn-skeleton tn-skeleton-badge"></div>
              <div
                className="tn-skeleton tn-skeleton-text"
                style={{ width: "15px" }}
              ></div>
              <div className="tn-skeleton tn-skeleton-badge"></div>
            </div>
          </td>

          {/* التكلفة */}
          <td>
            <div className="tn-skeleton tn-skeleton-text w-75"></div>
          </td>

          {/* عمود النجاح/الحالة (Success Badge Skeleton) */}
          <td>
            <div
              className="tn-skeleton tn-skeleton-pill"
              style={{ width: "85px", height: "24px" }}
            ></div>
          </td>
        </tr>
      ))}
    </>
  );
};

export default ShipmentsSkeleton;
