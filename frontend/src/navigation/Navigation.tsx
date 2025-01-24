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
          fontSize: "16px",
          border: "1px solid #ccc",
          backgroundColor: "black",
          color: "white",
          boxSizing: "border-box",
        }}
        placeholder="Search..."
        disabled={disabled}
      />
    </div>
  </div>
);

export default Navigation;
