import React from 'react';

export default function LogoutButton({ onLogout, className = '' }) {
  return (
    <button
      type="button"
      className={`trustvision-logout-btn ${className}`.trim()}
      aria-label="Sign out"
      onClick={onLogout}
      title="Sign Out"
    >
      <div className="trustvision-logout-sign" aria-hidden="true">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M15 3H6C5.44772 3 5 3.44772 5 4V20C5 20.5523 5.44772 21 6 21H15"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <path
            d="M13 12H21M21 12L18 9M21 12L18 15"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </div>
      <div className="trustvision-logout-text">Logout</div>
    </button>
  );
}
