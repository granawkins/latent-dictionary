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
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.4)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
    }}
    onClick={onClose}
  >
    <div
      style={{
        backgroundColor: "white",
        padding: "20px",
        borderRadius: "4px",
        margin: "10%",
        minWidth: "300px",
        maxHeight: "80vh",
        overflowY: "auto",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div style={{ width: "100%", textAlign: "center" }}>
        <img
          src="/latent-dictionary.png"
          alt="Latent Dictionary"
          style={{
            maxWidth: "100%",
            height: "auto",
          }}
        />
      </div>
      <p
        style={{
          color: "black",
          marginTop: "20px",
          textAlign: "center",
          fontSize: "16px",
          lineHeight: "1.5",
        }}
      >
        made by{" "}
        <a
          href="https://x.com/granawkins"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#0066cc", textDecoration: "none" }}
        >
          @granawkins
        </a>{" "}
        using{" "}
        <a
          href="https://www.wiktionary.org/"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#0066cc", textDecoration: "none" }}
        >
          Wiktionary
        </a>{" "}
        data and{" "}
        <a
          href="https://openai.com/"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#0066cc", textDecoration: "none" }}
        >
          OpenAI
        </a>{" "}
        embeddings
      </p>
    </div>
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
