import React, { useState } from "react";

interface ImageModalProps {
  onClose: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ onClose }) => (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 2000,
    }}
    onClick={onClose}
  >
    <img
      src="/latent-dictionary.png"
      alt="Latent Dictionary"
      style={{
        maxWidth: "90%",
        maxHeight: "90%",
        objectFit: "contain",
      }}
      onClick={(e) => e.stopPropagation()}
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
