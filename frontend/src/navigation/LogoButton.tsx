import React from "react";

const LogoButton: React.FC = () => (
  <button
    onClick={() => window.location.reload()}
    style={{
      padding: "0px",
      border: "0",
      height: "50px",
      cursor: "pointer",
    }}
  >
    <img
      src="/latent-dictionary.png"
      alt="Latent Dictionary"
      style={{
        height: "50px",
        margin: "0px",
      }}
    />
  </button>
);

export default LogoButton;
