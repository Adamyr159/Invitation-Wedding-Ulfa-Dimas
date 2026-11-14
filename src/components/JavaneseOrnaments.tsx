import React from 'react';

export const GununganCrest: React.FC<{ className?: string }> = ({ className = 'w-24 h-32' }) => (
  <svg
    viewBox="0 0 120 160"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="kratonGold" x1="60" y1="0" x2="60" y2="160" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#F3E5AB" />
        <stop offset="50%" stopColor="#D4AF37" />
        <stop offset="100%" stopColor="#8C6D1F" />
      </linearGradient>
    </defs>
    {/* Outer Gunungan Kayon Silhouette */}
    <path
      d="M60 4C60 4 44 28 30 52C16 76 10 98 18 122C24 138 36 146 38 152H82C84 146 96 138 102 122C110 98 104 76 90 52C76 28 60 4 60 4Z"
      stroke="url(#kratonGold)"
      strokeWidth="1.75"
      fill="rgba(212, 175, 55, 0.06)"
    />
    {/* Inner Filigree Frame */}
    <path
      d="M60 14C60 14 47 35 35 56C23 77 18 96 25 117C30 131 40 139 42 146H78C80 139 90 131 95 117C102 96 97 77 85 56C73 35 60 14 60 14Z"
      stroke="url(#kratonGold)"
      strokeWidth="0.9"
      strokeDasharray="3 2"
    />
    {/* Central Tree of Life (Kalpataru) Trunk */}
    <path d="M60 22V146" stroke="url(#kratonGold)" strokeWidth="1.5" />
    {/* Symmetrical Branches & Lotus Motifs */}
    <path
      d="M60 46C50 46 42 52 42 60C42 68 52 70 60 64C68 70 78 68 78 60C78 52 70 46 60 46Z"
      stroke="url(#kratonGold)"
      strokeWidth="1.1"
    />
    <path
      d="M60 72C45 72 32 80 32 92C32 104 46 106 60 98C74 106 88 104 88 92C88 80 75 72 60 72Z"
      stroke="url(#kratonGold)"
      strokeWidth="1.2"
    />
    {/* Temple Gate Base (Candi Laras) */}
    <path
      d="M44 146V124C44 115 51 108 60 108C69 108 76 115 76 124V146"
      stroke="url(#kratonGold)"
      strokeWidth="1.3"
      fill="rgba(212, 175, 55, 0.1)"
    />
    <circle cx="60" cy="34" r="3.5" fill="#D4AF37" />
    <circle cx="60" cy="126" r="4" stroke="url(#kratonGold)" strokeWidth="1.2" />
  </svg>
);

export const JavaneseSectionDivider: React.FC<{ label?: string }> = ({ label }) => (
  <div className="flex items-center justify-center gap-4 my-6 select-none" aria-hidden="true">
    <div className="h-px w-16 sm:w-28 bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-[#D4AF37]" />
    <div className="flex items-center gap-2 text-[#D4AF37]">
      <span className="w-1.5 h-1.5 rotate-45 bg-[#D4AF37]/80 inline-block" />
      {label ? (
        <span className="text-xs tracking-[0.22em] uppercase text-[#D4AF37] font-medium px-1">
          {label}
        </span>
      ) : (
        <span className="w-2.5 h-2.5 rotate-45 border border-[#D4AF37] inline-block" />
      )}
      <span className="w-1.5 h-1.5 rotate-45 bg-[#D4AF37]/80 inline-block" />
    </div>
    <div className="h-px w-16 sm:w-28 bg-gradient-to-l from-transparent via-[#D4AF37]/50 to-[#D4AF37]" />
  </div>
);
