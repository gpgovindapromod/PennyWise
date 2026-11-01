import React from 'react';

export function NordicPageContainer({ children, className = '' }) {
  return (
    <div className={`stitch-container nordic-page-enter ${className}`}>
      {children}
    </div>
  );
}

export function NordicCard({ children, className = '', hero = false, onClick }) {
  return (
    <div 
      onClick={onClick}
      className={`${hero ? 'nordic-card-hero' : 'nordic-card'} ${className}`}
    >
      {children}
    </div>
  );
}

export function ProtocolBadge({ label = 'PORTFOLIO PROTOCOL V4.8', activeTag = 'LIVE POSITIONS' }) {
  return (
    <div className="proto-status-bar">
      <div className="proto-status-left">
        <span className="proto-pulse-dot" />
        <span className="proto-protocol-pill">{label}</span>
      </div>
      {activeTag && (
        <div className="proto-status-right">
          <span className="proto-badge-base">{activeTag}</span>
        </div>
      )}
    </div>
  );
}
