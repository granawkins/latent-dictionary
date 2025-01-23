import React, { useEffect, useState } from 'react';
import './SwipeIndicator.css';

interface SwipeIndicatorProps {
  show: boolean;
}

const SwipeIndicator: React.FC<SwipeIndicatorProps> = ({ show }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
      }, 3000); // Total animation duration
      return () => clearTimeout(timer);
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
        <path d="M14 8L10 12L14 16" />
        <path d="M10 8L6 12L10 16" />
      </svg>
    </div>
  );
};

export default SwipeIndicator;