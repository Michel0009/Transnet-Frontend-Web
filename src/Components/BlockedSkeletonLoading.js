import React from "react";
import "./DriverSkeletonLoading.css";

const BlockedSkeletonLoading = () => {
  return (
    <>
      {[1, 2, 3, 4, 5].map((i) => (
        <tr key={i} className="align-middle">

          <td className="fw-bold tn-b-text-navy text-center">
            <div
              className="tn-skeleton-item mx-auto"
              style={{ width: "60px", height: "18px", borderRadius: "4px" }}
            ></div>
          </td>
          <td className="text-center">
            <div className="d-flex flex-column align-items-center justify-content-center">
              <div
                className="tn-skeleton-item mb-2"
                style={{ width: "130px", height: "16px", borderRadius: "4px" }}
              ></div>
              <div
                className="tn-skeleton-item"
                style={{ width: "170px", height: "12px", borderRadius: "4px" }}
              ></div>
            </div>
          </td>
          <td dir="ltr" className="tn-b-text-slate text-center">
            <div className="d-flex flex-column align-items-center justify-content-center">
              <div
                className="tn-skeleton-item mb-2"
                style={{ width: "100px", height: "14px", borderRadius: "4px" }}
              ></div>
              <div
                className="tn-skeleton-item"
                style={{ width: "140px", height: "12px", borderRadius: "4px" }}
              ></div>
            </div>
          </td>
          <td className="text-center">
            <div
              className="tn-skeleton-item mx-auto"
              style={{ width: "85px", height: "26px", borderRadius: "20px" }}
            ></div>
          </td>
          <td className="tn-b-text-slate text-center">
            <div
              className="tn-skeleton-item mx-auto"
              style={{ width: "150px", height: "16px", borderRadius: "4px" }}
            ></div>
          </td>
          <td className="text-center">
            <div
              className="tn-skeleton-item mx-auto"
              style={{ width: "95px", height: "34px", borderRadius: "6px" }}
            ></div>
          </td>
        </tr>
      ))}
    </>
  );
};

export default BlockedSkeletonLoading;
