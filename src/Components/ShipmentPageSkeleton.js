import React from "react";
import "./ShipmentPageSkeleton.css";

const ShipmentPageSkeleton = () => {
  const skeletonRows = Array(10).fill(null);

  return (
    <>
      {skeletonRows.map((_, rowIndex) => (
        <tr key={rowIndex} className="align-middle">
          <td className="tn-s-sk-padding">
            <div
              className="tn-s-sk-line tn-s-shimmer mx-auto d-flex justify-content-center align-items-center"
              style={{ width: "65px", height: "14px" }}
            />
          </td>
          <td className="tn-s-sk-padding">
            <div
              className="tn-s-sk-line tn-s-shimmer mx-auto d-flex justify-content-center align-items-center"
              style={{ width: "100px", height: "14px" }}
            />
          </td>
          <td className="tn-s-sk-padding">
            <div className="d-flex justify-content-center align-items-center gap-2">
              <div
                className="tn-s-sk-line tn-s-shimmer"
                style={{ width: "50px", height: "14px" }}
              />
              <div
                className="tn-s-sk-line tn-s-shimmer"
                style={{ width: "12px", height: "12px" }}
              />
              <div
                className="tn-s-sk-line tn-s-shimmer"
                style={{ width: "50px", height: "14px" }}
              />
            </div>
          </td>
          <td className="tn-s-sk-padding" dir="ltr">
            <div className="d-flex justify-content-center align-items-center gap-1">
              <div className="tn-s-sk-box tn-s-shimmer" />
              <span className="tn-s-sk-sep">×</span>
              <div className="tn-s-sk-box tn-s-shimmer" />
              <span className="tn-s-sk-sep">×</span>
              <div className="tn-s-sk-box tn-s-shimmer" />
            </div>
          </td>
          <td className="tn-s-sk-padding">
            <div className="d-flex justify-content-center align-items-center gap-1">
              <div
                className="tn-s-sk-line tn-s-shimmer"
                style={{ width: "35px", height: "14px" }}
              />
            </div>
          </td>
          <td className="tn-s-sk-padding">
            <div className="d-flex justify-content-center align-items-center gap-1">
              <div
                className="tn-s-sk-line tn-s-shimmer"
                style={{ width: "60px", height: "14px" }}
              />
            </div>
          </td>
          <td className="tn-s-sk-padding">
            <div
              className="tn-s-sk-pill tn-s-shimmer mx-auto d-flex justify-content-center align-items-center gap-1"
              style={{ width: "95px" }}
            />
          </td>
        </tr>
      ))}
    </>
  );
};

export default ShipmentPageSkeleton;
