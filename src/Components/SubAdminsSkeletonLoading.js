import React from "react";
import "./DriverSkeletonLoading.css";

const SubAdminsSkeleton = () => {
  return (
    <>
      {[1, 2, 3, 4, 5].map((i) => (
        <tr key={i}>
          <td>
            <div
              className="tn-skeleton-item"
              style={{
                width: "90px",
                height: "15px",
              }}
            ></div>
          </td>

          <td>
            <div
              className="tn-skeleton-item"
              style={{
                width: "80px",
                height: "15px",
              }}
            ></div>
          </td>

          <td>
            <div
              className="tn-skeleton-item"
              style={{
                width: "80px",
                height: "15px",
              }}
            ></div>
          </td>

          <td>
            <div
              className="tn-skeleton-item"
              style={{
                width: "120px",
                height: "15px",
              }}
            ></div>
          </td>

          <td>
            <div
              className="tn-skeleton-item"
              style={{
                width: "90px",
                height: "28px",
                borderRadius: "20px",
              }}
            ></div>
          </td>

          <td className="text-center">
            <div
              className="tn-skeleton-item"
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                margin: "auto",
              }}
            ></div>
          </td>
        </tr>
      ))}
    </>
  );
};

export default SubAdminsSkeleton;
