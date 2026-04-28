import React from "react";
import { Player } from "@lottiefiles/react-lottie-player";
import animationData from "../assets/loader.json"; 

const LoadingScreen = () => {
  return (
    <div
      style={{
        height: "100vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Player
        autoplay
        loop
        src={animationData}
        style={{ height: "120px", width: "120px" }}
      >
      </Player>

      <h4
        style={{
          color: "#000000",
          marginTop: "20px",
          fontFamily: "Arial",
          fontWeight: "bold",
        }}
      >
        جاري التحميل...
      </h4>
    </div>
  );
};

export default LoadingScreen;
