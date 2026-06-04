import React from "react";
import "./DriverSkeletonLoading.css";

const ClientSkeletonLoading = ({ rows = 5 }) => {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className="align-middle">
          <td>
            <div className="d-flex justify-content-center align-items-center gap-3">
              <div
                className="tn-skeleton-item"
                style={{ width: "120px", height: "18px", borderRadius: "4px" }}
              ></div>
            </div>
          </td>
          <td>
            <div className="d-flex flex-column align-items-center justify-content-center">
              <div
                className="tn-skeleton-item mb-2"
                style={{ width: "100px", height: "12px", borderRadius: "4px" }}
              ></div>
              <div
                className="tn-skeleton-item"
                style={{ width: "140px", height: "12px", borderRadius: "4px" }}
              ></div>
            </div>
          </td>
          <td>
            <div
              className="tn-skeleton-item mx-auto"
              style={{ width: "80px", height: "15px", borderRadius: "4px" }}
            ></div>
          </td>
          <td>
            <div
              className="tn-skeleton-item mx-auto"
              style={{ width: "90px", height: "14px", borderRadius: "4px" }}
            ></div>
          </td>
          <td>
            <div
              className="tn-skeleton-item mx-auto"
              style={{ width: "75px", height: "24px", borderRadius: "20px" }}
            ></div>
          </td>
          <td>
            <div
              className="tn-skeleton-item mx-auto"
              style={{
                width: "4px",
                height: "18px",
                borderRadius: "2px",
              }}
            ></div>
          </td>
        </tr>
      ))}
    </>
  );
};

export default ClientSkeletonLoading;
