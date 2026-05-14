import React from "react";
import "./DriverSkeletonLoading.css";

const DriverSkeleton = () => {
  return (
    <>
      {[1, 2, 3, 4, 5].map((i) => (
        <tr key={i}>
          <td>
            <div className="d-flex align-items-center gap-3">
              <div
                className="tn-skeleton-item"
                style={{ width: "120px", height: "18px", borderRadius: "4px" }}
              ></div>
            </div>
          </td>

          <td>
            <div
              className="tn-skeleton-item"
              style={{ width: "80px", height: "15px", borderRadius: "4px" }}
            ></div>
          </td>

          <td>
            <div
              className="tn-skeleton-item mb-2"
              style={{ width: "100px", height: "12px", borderRadius: "4px" }}
            ></div>
            <div
              className="tn-skeleton-item"
              style={{ width: "130px", height: "12px", borderRadius: "4px" }}
            ></div>
          </td>

          <td>
            <div
              className="tn-skeleton-item"
              style={{ width: "60px", height: "15px", borderRadius: "4px" }}
            ></div>
          </td>

          <td>
            <div className="d-flex align-items-center gap-2">
              <div
                className="tn-skeleton-item"
                style={{ width: "15px", height: "15px", borderRadius: "2px" }}
              ></div>
              <div
                className="tn-skeleton-item"
                style={{ width: "25px", height: "15px", borderRadius: "4px" }}
              ></div>
            </div>
          </td>

          <td>
            <div
              className="tn-skeleton-item"
              style={{ width: "65px", height: "24px", borderRadius: "20px" }}
            ></div>
          </td>

          <td>
            <div
              className="tn-skeleton-item"
              style={{ width: "85px", height: "24px", borderRadius: "20px" }}
            ></div>
          </td>

          <td className="text-center">
            <div
              className="tn-skeleton-item"
              style={{
                width: "4px",
                height: "18px",
                margin: "auto",
                borderRadius: "2px",
              }}
            ></div>
          </td>
        </tr>
      ))}
    </>
  );
};

export default DriverSkeleton;
