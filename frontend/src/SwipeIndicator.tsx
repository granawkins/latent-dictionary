import React, { useEffect, useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHandPointRight } from "@fortawesome/free-solid-svg-icons";
import "./SwipeIndicator.css";

interface SwipeIndicatorProps {
  hasData: boolean;
}

const SwipeIndicator: React.FC<SwipeIndicatorProps> = ({ hasData }) => {
  const [visible, setVisible] = useState(false);
  const shownOnce = useRef(false);

  useEffect(() => {
    if (hasData && !shownOnce.current) {
      // Wait 1s before showing
      const showTimer = setTimeout(() => {
        shownOnce.current = true;
        setVisible(true);
        // Hide after animation completes
        const hideTimer = setTimeout(() => {
          setVisible(false);
        }, 3000); // Animation duration
        return () => clearTimeout(hideTimer);
      }, 1000);
      return () => clearTimeout(showTimer);
    }
  }, [hasData]);

  if (!visible) return null;

  return (
    <div className="swipe-indicator">
      <FontAwesomeIcon
        icon={faHandPointRight}
        style={{ fontSize: "3em", transform: "rotate(-90deg)" }}
      />
    </div>
  );
};

export default SwipeIndicator;
