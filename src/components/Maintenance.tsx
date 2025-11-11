import React from 'react';

export const Maintenance: React.FC = () => {
  return (
    <div className="maintenance-container">
      <div className="maintenance-content">
        <div className="maintenance-icon">🛠️</div>
        <h1 className="maintenance-title">Under Maintenance</h1>
        <p className="maintenance-subtitle">
          We're currently performing scheduled maintenance to improve your experience.
        </p>
        <p className="maintenance-text">
          We'll be back online shortly. Thank you for your patience.
        </p>
        <div className="maintenance-loader">
          <div className="loader-dot"></div>
          <div className="loader-dot"></div>
          <div className="loader-dot"></div>
        </div>
      </div>
    </div>
  );
};
