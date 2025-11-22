const HeisenbergLogo = ({ className = "w-20 h-20" }: { className?: string }) => {
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Hat */}
      <rect x="50" y="40" width="100" height="15" rx="2" fill="currentColor" stroke="currentColor" strokeWidth="2" />
      <rect x="65" y="25" width="70" height="20" rx="1" fill="currentColor" stroke="currentColor" strokeWidth="2" />
      
      {/* Face outline */}
      <path
        d="M 70 55 Q 70 90 80 110 L 80 130 Q 100 140 120 130 L 120 110 Q 130 90 130 55 Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="2"
      />
      
      {/* Sunglasses */}
      <rect x="72" y="65" width="25" height="18" rx="2" fill="currentColor" stroke="currentColor" strokeWidth="2.5" />
      <rect x="103" y="65" width="25" height="18" rx="2" fill="currentColor" stroke="currentColor" strokeWidth="2.5" />
      <line x1="97" y1="74" x2="103" y2="74" stroke="currentColor" strokeWidth="2.5" />
      
      {/* Goatee */}
      <path
        d="M 90 115 Q 85 125 90 135 Q 95 138 100 138 Q 105 138 110 135 Q 115 125 110 115"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="2"
      />
      
      {/* Mustache parts */}
      <path
        d="M 82 100 Q 80 105 85 108"
        stroke="currentColor"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M 118 100 Q 120 105 115 108"
        stroke="currentColor"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default HeisenbergLogo;
