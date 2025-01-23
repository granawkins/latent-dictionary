import React, { useEffect, useState } from "react";
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
      <svg
        width="64"
        height="64"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Hand with finger */}
        <path d="M9 11.5V5a2 2 0 0 1 4 0v6.5" />
        <path d="M9 13.5V12h4v1.5" />
        <path d="M7 13.5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2V16a6 6 0 0 1-6 6h0a6 6 0 0 1-6-6v-2.5z" />
        {/* Motion arrows */}
        <path d="M17 10l2 2-2 2" />
        <path d="M19 12H9" />
      </svg>
    </div>
  );
};

export default SwipeIndicator;
