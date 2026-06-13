import React from "react";
import "./DriverSkeletonLoading.css";

const SubAdminsSkeleton = () => {
  return (
    <>
      {[1, 2, 3, 4, 5].map((i) => (
        <tr key={i} className="align-middle">
          <td>
            <div className="d-flex justify-content-center">
              <div
                className="tn-skeleton-item"
                style={{
                  width: "90px",
                  height: "15px",
                  borderRadius: "4px",
                }}
              ></div>
            </div>
          </td>

          <td>
            <div
              className="tn-skeleton-item mx-auto"
              style={{
                width: "80px",
                height: "15px",
                borderRadius: "4px",
              }}
            ></div>
          </td>

          <td>
            <div
              className="tn-skeleton-item mx-auto"
              style={{
                width: "80px",
                height: "15px",
                borderRadius: "4px",
              }}
            ></div>
          </td>

          <td>
            <div
              className="tn-skeleton-item mx-auto"
              style={{
                width: "120px",
                height: "15px",
                borderRadius: "4px",
              }}
            ></div>
          </td>

          <td>
            <div className="d-flex justify-content-center">
              <div
                className="tn-skeleton-item"
                style={{
                  width: "50px",
                  height: "28px",
                  borderRadius: "20px",
                }}
              ></div>
            </div>
          </td>

          <td className="text-center">
            <div
              className="tn-skeleton-item mx-auto"
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
              }}
            ></div>
          </td>

        </tr>
      ))}
    </>
  );
};

export default SubAdminsSkeleton;