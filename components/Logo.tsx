
import React from 'react';

const Logo: React.FC<{ className?: string; iconOnly?: boolean }> = ({ className = 'w-auto h-12', iconOnly = false }) => (
  <div className={`flex items-center gap-4 ${className}`}>
    <div className="relative h-full aspect-square animate-pulse-glow">
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_15px_rgba(210,180,140,0.3)]">
        {/* Circle Background */}
        <circle cx="50" cy="50" r="48" fill="#1A2536" stroke="#D2B48C" strokeWidth="2" />

        {/* Map Lines */}
        <g stroke="#D2B48C" strokeWidth="0.5" strokeOpacity="0.3">
          <line x1="20" y1="10" x2="80" y2="90" />
          <line x1="80" y1="10" x2="20" y2="90" />
          <line x1="10" y1="50" x2="90" y2="50" />
          <line x1="50" y1="10" x2="50" y2="90" />
        </g>

        {/* Camera Body */}
        <rect x="25" y="40" width="50" height="35" rx="4" fill="#0D1625" stroke="#D2B48C" strokeWidth="2" />
        <path d="M40 40 L42 33 H58 L60 40" fill="#0D1625" stroke="#D2B48C" strokeWidth="2" />
        <circle cx="50" cy="57" r="14" fill="#0D1625" stroke="#D2B48C" strokeWidth="2" />
        <circle cx="50" cy="57" r="8" fill="#1A2536" stroke="#D2B48C" strokeWidth="1" />
        <circle cx="32" cy="46" r="2" fill="#D2B48C" />

        {/* Location Pin */}
        <g transform="translate(62, 15) scale(0.6)">
          <path d="M20 0C8.954 0 0 8.954 0 20C0 35 20 50 20 50C20 50 40 35 40 20C40 8.954 31.046 0 20 0Z" fill="#D2B48C" />
          <circle cx="20" cy="20" r="8" fill="#0D1625" />
        </g>
      </svg>
    </div>
    {!iconOnly && (
      <div className="flex flex-col">
        <span className="text-white font-black text-xl tracking-tighter uppercase leading-none">
          Find <span className="text-[#D2B48C]">Photographer</span>
        </span>
        <span className="text-[9px] tracking-[0.55em] text-[#D2B48C] font-bold uppercase mt-1 opacity-80">
          Elite Edition
        </span>
      </div>
    )}
  </div>
);

export default Logo;
