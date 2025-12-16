
import React from 'react';

const ShoppingCartIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className || 'w-6 h-6'}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c.51 0 .962-.328 1.102-.816l4.418-8.49a.875.875 0 0 0-.42-1.164l-11.5-6.052a.875.875 0 0 0-1.164.42L5.25 6H3.75"
    />
  </svg>
);

export default ShoppingCartIcon;
