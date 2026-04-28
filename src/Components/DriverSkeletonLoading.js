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
                style={{ width: "45px", height: "45px", borderRadius: "50%" }}
              ></div>
              <div
                className="tn-skeleton-item"
                style={{ width: "100px", height: "15px" }}
              ></div>
            </div>
          </td>
          <td>
            <div
              className="tn-skeleton-item"
              style={{ width: "80px", height: "15px" }}
            ></div>
          </td>
          <td>
            <div
              className="tn-skeleton-item mb-2"
              style={{ width: "120px", height: "12px" }}
            ></div>
            <div
              className="tn-skeleton-item"
              style={{ width: "90px", height: "12px" }}
            ></div>
          </td>
          <td>
            <div
              className="tn-skeleton-item"
              style={{ width: "40px", height: "15px" }}
            ></div>
          </td>
          <td>
            <div
              className="tn-skeleton-item"
              style={{ width: "30px", height: "15px" }}
            ></div>
          </td>
          <td>
            <div
              className="tn-skeleton-item"
              style={{ width: "70px", height: "25px", borderRadius: "20px" }}
            ></div>
          </td>
          <td className="text-center">
            <div
              className="tn-skeleton-item"
              style={{ width: "5px", height: "18px", margin: "auto" }}
            ></div>
          </td>
        </tr>
      ))}
    </>
  );
};

export default DriverSkeleton;
