import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHandPointRight } from "@fortawesome/free-solid-svg-icons";
import "./SwipeIndicator.css";

interface SwipeIndicatorProps {
  show: boolean;
}

const SwipeIndicator: React.FC<SwipeIndicatorProps> = ({ show }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      // Wait 1s before showing
      const showTimer = setTimeout(() => {
        setVisible(true);
        // Hide after animation completes
        const hideTimer = setTimeout(() => {
          setVisible(false);
        }, 3000); // Animation duration
        return () => clearTimeout(hideTimer);
      }, 1000);
      return () => clearTimeout(showTimer);
    }
  }, [show]);

  if (!visible) return null;

  return (
    <div className="swipe-indicator">
      <FontAwesomeIcon
        icon={faHandPointRight}
        style={{ fontSize: "3em" }}
      />
    </div>
  );
};

export default SwipeIndicator;
