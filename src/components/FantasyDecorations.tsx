import React from 'react';
import { ART_ASSETS } from '../utils/artAssets';

interface OrnateCornerProps {
  position: 'tl' | 'tr' | 'bl' | 'br';
  className?: string;
}

export const OrnateCorner: React.FC<OrnateCornerProps> = ({ 
  position, 
  className = "w-5 h-5 text-amber-500" 
}) => {
  const transform = {
    tl: '',
    tr: 'scale-x-[-1]',
    bl: 'scale-y-[-1]',
    br: 'scale-x-[-1] scale-y-[-1]',
  }[position];

  return (
    <svg 
      viewBox="0 0 28 28" 
      className={`absolute ${className} ${transform} pointer-events-none fill-current select-none`}
      style={{
        top: position.startsWith('t') ? '2px' : undefined,
        bottom: position.startsWith('b') ? '2px' : undefined,
        left: position.endsWith('l') ? '2px' : undefined,
        right: position.endsWith('r') ? '2px' : undefined,
      }}
    >
      <path d="M 2 2 L 18 2 C 16 4 14 6 12 9 C 9 12 7 15 6 18 L 2 18 Z" opacity="0.85" />
      <circle cx="4" cy="4" r="2" fill="#fef08a" />
      <path d="M 2 2 L 26 2 M 2 2 L 2 26" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
      <circle cx="26" cy="2" r="1.5" fill="#f59e0b" />
      <circle cx="2" cy="26" r="1.5" fill="#f59e0b" />
    </svg>
  );
};

export const FantasyCornerBrackets: React.FC<{ className?: string }> = ({ className = "w-5 h-5 text-amber-400/90" }) => (
  <>
    <OrnateCorner position="tl" className={className} />
    <OrnateCorner position="tr" className={className} />
    <OrnateCorner position="bl" className={className} />
    <OrnateCorner position="br" className={className} />
  </>
);

export const ScrollRod: React.FC<{ position: 'top' | 'bottom' }> = ({ position }) => (
  <div className={`w-full h-3.5 flex items-center justify-between px-1 select-none ${position === 'top' ? 'mb-1' : 'mt-1'}`}>
    {/* Left Brass Finial */}
    <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-r from-amber-600 to-amber-300 border border-amber-800 shadow-md shrink-0" />
    {/* Wooden Roller Rod */}
    <div 
      className="flex-1 h-2.5 mx-0.5 rounded-full border border-amber-900/80 shadow-inner"
      style={{
        backgroundImage: `linear-gradient(180deg, #92400e 0%, #451a03 50%, #78350f 100%)`
      }}
    />
    {/* Right Brass Finial */}
    <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-r from-amber-300 to-amber-600 border border-amber-800 shadow-md shrink-0" />
  </div>
);

export const WaxSealBadge: React.FC<{ 
  text: string; 
  color?: 'red' | 'blue' | 'green' | 'amber';
  size?: 'sm' | 'md';
}> = ({ 
  text, 
  color = 'red',
  size = 'sm' 
}) => {
  const colorStyles = {
    red: 'from-rose-700 via-rose-900 to-rose-950 border-rose-500 text-rose-100 shadow-rose-950/80',
    blue: 'from-indigo-700 via-indigo-900 to-indigo-950 border-indigo-400 text-indigo-100 shadow-indigo-950/80',
    green: 'from-emerald-700 via-emerald-900 to-emerald-950 border-emerald-400 text-emerald-100 shadow-emerald-950/80',
    amber: 'from-amber-700 via-amber-900 to-amber-950 border-amber-400 text-amber-100 shadow-amber-950/80',
  }[color];

  const sizeStyles = size === 'sm' ? 'px-2 py-0.5 text-[9px]' : 'px-3 py-1 text-xs';

  return (
    <span className={`inline-flex items-center gap-1 font-fantasy font-black uppercase tracking-wider rounded-full bg-gradient-to-br border shadow-md ${colorStyles} ${sizeStyles}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-amber-300 inline-block shadow-sm" />
      {text}
    </span>
  );
};
