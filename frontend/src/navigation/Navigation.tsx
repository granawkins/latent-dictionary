import React from "react";
import LogoButton from "./LogoButton";

interface NavigationProps {
  inputText: string;
  setInputText: (text: string) => void;
  disabled?: boolean;
}

const Navigation: React.FC<NavigationProps> = ({
  inputText,
  setInputText,
  disabled = false,
}) => (
  <div
    style={{
      position: "absolute",
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: 1000,
      width: "100%",
      display: "flex",
      flexDirection: "row",
      padding: "10px",
      boxSizing: "border-box",
    }}
  >
    <LogoButton />
    <div style={{ flexGrow: 1 }}>
      <div style={{ position: "relative", width: "100%" }}>
        <input
          type="text"
          value={inputText}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setInputText(e.target.value)
          }
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
            }
          }}
          style={{
            width: "100%",
            padding: "15px 15px",
            paddingRight: "40px", // Make room for the clear button
            fontSize: "16px",
            border: "1px solid #ccc",
            backgroundColor: "black",
            color: "white",
            boxSizing: "border-box",
          }}
          placeholder="Search..."
          disabled={disabled}
        />
        {inputText && (
          <button
            onClick={() => setInputText("")}
            onTouchEnd={(e) => {
              e.preventDefault();
              setInputText("");
            }}
            style={{
              position: "absolute",
              right: "8px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              color: "#999",
              cursor: "pointer",
              fontSize: "24px",
              fontWeight: "bold",
              padding: "8px 12px",
              margin: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minWidth: "44px", // Minimum touch target size
              minHeight: "44px", // Minimum touch target size
              touchAction: "manipulation", // Optimize for touch
              WebkitTapHighlightColor: "transparent", // Remove tap highlight on iOS
            }}
            aria-label="Clear search"
          >
            ×
          </button>
        )}
      </div>
    </div>
  </div>
);

export default Navigation;
