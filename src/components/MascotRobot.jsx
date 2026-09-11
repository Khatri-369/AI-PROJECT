import React from 'react';

export default function MascotRobot({ className = "w-44 h-44" }) {
  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      {/* Speech bubble */}
      <div className="absolute -top-4 -right-12 z-20 bg-white/95 backdrop-blur-sm px-3.5 py-1.5 rounded-2xl shadow-lg border border-indigo-100/80 text-xs font-semibold text-indigo-900 rotate-3 animate-bounce shadow-indigo-100 hidden sm:block">
        <span className="text-indigo-600 font-bold">✨</span> Be so good they can't say no.
        <div className="absolute -bottom-1.5 left-4 w-3 h-3 bg-white border-b border-r border-indigo-100 transform rotate-45"></div>
      </div>

      <svg
        viewBox="0 0 240 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-xl"
      >
        {/* Soft back aura */}
        <circle cx="120" cy="125" r="90" fill="url(#bot_glow)" opacity="0.4" />

        {/* Robot Body */}
        <path
          d="M75 145 C75 130, 165 130, 165 145 L170 195 C170 205, 155 212, 120 212 C85 212, 70 205, 70 195 Z"
          fill="url(#body_grad)"
          stroke="#cbd5e1"
          strokeWidth="2"
        />

        {/* Robot Belly Screen */}
        <rect
          x="88"
          y="152"
          width="64"
          height="38"
          rx="12"
          fill="url(#belly_screen)"
          stroke="#93c5fd"
          strokeWidth="1.5"
        />
        {/* Heart / Core Icon on Belly */}
        <circle cx="120" cy="171" r="9" fill="#3b82f6" opacity="0.3" />
        <path
          d="M120 167 L122.5 171 L127 171.5 L123.5 174.5 L124.5 179 L120 176.5 L115.5 179 L116.5 174.5 L113 171.5 L117.5 171 Z"
          fill="#3b82f6"
        />

        {/* Left Arm (holding book) */}
        <path
          d="M72 150 C55 160, 52 185, 70 195"
          stroke="url(#arm_grad)"
          strokeWidth="14"
          strokeLinecap="round"
        />
        {/* Blue Study Book */}
        <g transform="translate(48, 170) rotate(-15)">
          <rect x="0" y="0" width="30" height="38" rx="4" fill="#2563eb" />
          <rect x="3" y="2" width="24" height="34" rx="2" fill="#3b82f6" />
          <line x1="8" y1="10" x2="22" y2="10" stroke="white" strokeWidth="2" strokeLinecap="round" />
          <line x1="8" y1="16" x2="20" y2="16" stroke="white" strokeWidth="2" strokeLinecap="round" />
          <line x1="8" y1="22" x2="16" y2="22" stroke="white" strokeWidth="2" strokeLinecap="round" />
          {/* Bookmark ribbon */}
          <path d="M14 0 L14 14 L17 11 L20 14 L20 0 Z" fill="#fbbf24" />
        </g>

        {/* Right Arm (Waving friendly hello) */}
        <path
          d="M168 152 C185 145, 198 128, 192 110"
          stroke="url(#arm_grad)"
          strokeWidth="14"
          strokeLinecap="round"
        />
        {/* Hand with cute curved fingers */}
        <circle cx="190" cy="106" r="9" fill="#93c5fd" />
        <circle cx="183" cy="100" r="5" fill="#60a5fa" />
        <circle cx="192" cy="97" r="5" fill="#60a5fa" />
        <circle cx="199" cy="102" r="4.5" fill="#60a5fa" />

        {/* Robot Head Base */}
        <rect
          x="62"
          y="58"
          width="116"
          height="82"
          rx="32"
          fill="url(#head_grad)"
          stroke="#cbd5e1"
          strokeWidth="2.5"
        />
        {/* Ear Antennas */}
        <rect x="52" y="85" width="10" height="28" rx="5" fill="#94a3b8" />
        <rect x="178" y="85" width="10" height="28" rx="5" fill="#94a3b8" />
        <circle cx="57" cy="99" r="2.5" fill="#3b82f6" />
        <circle cx="183" cy="99" r="2.5" fill="#3b82f6" />

        {/* Digital Face Screen */}
        <rect
          x="72"
          y="68"
          width="96"
          height="62"
          rx="22"
          fill="#0f172a"
        />

        {/* Glowing Cheerful Blue Eyes */}
        <ellipse cx="98" cy="96" rx="10" ry="14" fill="#38bdf8" />
        <ellipse cx="142" cy="96" rx="10" ry="14" fill="#38bdf8" />
        {/* Eye highlights */}
        <circle cx="95" cy="91" r="4" fill="#ffffff" />
        <circle cx="139" cy="91" r="4" fill="#ffffff" />
        <circle cx="102" cy="102" r="2" fill="#ffffff" />
        <circle cx="146" cy="102" r="2" fill="#ffffff" />

        {/* Cheerful Smile */}
        <path
          d="M112 110 Q120 117 128 110"
          stroke="#38bdf8"
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        {/* Graduation Cap (Mortarboard) */}
        <g transform="translate(120, 48)">
          {/* Cap Skullcap base */}
          <path d="M-28 0 C-28 10, 28 10, 28 0 Z" fill="#1e293b" />
          {/* Diamond top */}
          <polygon
            points="0,-24 58,-4 0,16 -58,-4"
            fill="#0f172a"
            stroke="#334155"
            strokeWidth="1.5"
          />
          {/* Cap Button */}
          <circle cx="0" cy="-4" r="4.5" fill="#fbbf24" />
          {/* Golden Tassel hanging down */}
          <path
            d="M0 -4 C22 -3, 38 12, 38 32"
            stroke="#f59e0b"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <rect x="34" y="32" width="8" height="12" rx="2" fill="#f59e0b" />
        </g>

        {/* Gradients */}
        <defs>
          <radialGradient id="bot_glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="body_grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="60%" stopColor="#f1f5f9" />
            <stop offset="100%" stopColor="#e2e8f0" />
          </linearGradient>
          <linearGradient id="head_grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#e2e8f0" />
          </linearGradient>
          <linearGradient id="belly_screen" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#eff6ff" />
            <stop offset="100%" stopColor="#dbeafe" />
          </linearGradient>
          <linearGradient id="arm_grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
