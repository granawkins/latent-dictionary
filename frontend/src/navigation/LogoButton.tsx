import React, { useState } from "react";

interface ImageModalProps {
  onClose: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ onClose }) => (
  <div
    style={{
      position: "absolute",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      backgroundColor: "rgba(0, 0, 0, 1)",
      zIndex: 2000,
    }}
    onClick={onClose}
  >
    <img
      src="/latent-dictionary.png"
      alt="Latent Dictionary"
      style={{
        width: "300px",
        height: "300px",
        marginLeft: "calc(50% - 150px)",
        marginTop: "calc(50% - 150px)",
        objectFit: "contain",
      }}
    />
  </div>
);

const LogoButton: React.FC = () => {
  const [showModal, setShowModal] = useState<boolean>(false);

  return (
    <>
      {showModal && <ImageModal onClose={() => setShowModal(false)} />}
      <button
        onClick={() => setShowModal(true)}
        style={{
          padding: "0px",
          border: "0",
          height: "50px",
          cursor: "pointer",
          backgroundColor: "transparent",
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
    </>
  );
};

export default LogoButton;
