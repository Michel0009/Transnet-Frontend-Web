import React from "react";
import "./ShipmentSkeleton.css";

const ShipmentsSkeleton = ({ rows = 10 }) => {
  return (
    <>
      {[...Array(rows)].map((_, index) => (
        <tr key={`shipment-skeleton-${index}`} className="align-middle">
          <td className="ps-4 text-center">
            <div className="tn-skeleton tn-skeleton-text w-50 mx-auto"></div>
          </td>
          <td className="text-center">
            <div className="tn-skeleton tn-skeleton-text w-75 mx-auto"></div>
          </td>
          <td dir="ltr" className="tn-dd-dimensions-cell text-center">
            <div className="tn-dd-dimension-group justify-content-center d-flex align-items-center gap-1">
              <div
                className="tn-skeleton tn-skeleton-badge"
                style={{ width: "35px", height: "18px" }}
              ></div>
              <span className="tn-dd-dimension-separator">×</span>
              <div
                className="tn-skeleton tn-skeleton-badge"
                style={{ width: "35px", height: "18px" }}
              ></div>
              <span className="tn-dd-dimension-separator">×</span>
              <div
                className="tn-skeleton tn-skeleton-badge"
                style={{ width: "35px", height: "18px" }}
              ></div>
            </div>
          </td>
          <td className="text-center">
            <div className="tn-skeleton tn-skeleton-text w-50 mx-auto"></div>
          </td>
          <td className="text-center">
            <div className="d-flex align-items-center justify-content-center gap-2 small">
              <div
                className="tn-skeleton tn-skeleton-badge"
                style={{ width: "50px", height: "18px" }}
              ></div>
              <span className="text-muted">←</span>
              <div
                className="tn-skeleton tn-skeleton-badge"
                style={{ width: "50px", height: "18px" }}
              ></div>
            </div>
          </td>
          <td className="text-center">
            <div className="tn-skeleton tn-skeleton-text w-75 mx-auto"></div>
          </td>
          <td className="ts-col-status text-center">
            <div
              className="tn-skeleton tn-skeleton-pill mx-auto"
              style={{ width: "85px", height: "24px" }}
            ></div>
          </td>
        </tr>
      ))}
    </>
  );
};

export default ShipmentsSkeleton;
