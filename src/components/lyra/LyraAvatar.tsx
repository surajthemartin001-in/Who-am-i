/**
 * WHO AM I? — LYRA Avatar Component
 * Small futuristic fairy avatar with glowing wand, starlight sparkles,
 * delicate fluttering wings, and reactive state animations.
 */

import React from 'react';
import { LyraAvatarState } from '../../types';

interface LyraAvatarProps {
  state?: LyraAvatarState;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showLabel?: boolean;
  onClick?: () => void;
  className?: string;
}

export const LyraAvatar: React.FC<LyraAvatarProps> = ({
  state = 'idle',
  size = 'md',
  showLabel = false,
  onClick,
  className = '',
}) => {
  const sizeMap = {
    sm: { container: 'w-10 h-10', svg: 36, text: 'text-xs' },
    md: { container: 'w-16 h-16', svg: 56, text: 'text-sm' },
    lg: { container: 'w-24 h-24', svg: 84, text: 'text-base' },
    xl: { container: 'w-36 h-36', svg: 120, text: 'text-lg' },
  };

  const currentSize = sizeMap[size];

  // Wand animation based on state
  const isWandActive = state === 'thinking' || state === 'typing' || state === 'speaking';
  const isListening = state === 'listening';
  const isSpeaking = state === 'speaking';

  return (
    <div
      onClick={onClick}
      className={`inline-flex flex-col items-center justify-center cursor-pointer select-none transition-transform duration-200 hover:scale-105 active:scale-95 ${className}`}
      title={`LYRA (${state})`}
    >
      <div className={`relative ${currentSize.container} flex items-center justify-center`}>
        {/* Ambient Fairy Glow Ring */}
        <div
          className={`absolute inset-0 rounded-full transition-all duration-500 ${
            isListening
              ? 'animate-ping opacity-60 scale-125'
              : isSpeaking
              ? 'animate-pulse opacity-50 scale-115'
              : 'opacity-30'
          }`}
          style={{
            background: `radial-gradient(circle, var(--lyra-glow, #38BDF8) 0%, transparent 70%)`,
          }}
        />

        {/* Small Futuristic Fairy SVG */}
        <svg
          width={currentSize.svg}
          height={currentSize.svg}
          viewBox="0 0 100 100"
          className={`relative z-10 transition-all duration-300 ${
            state === 'thinking' ? 'animate-fairy-float' : ''
          }`}
        >
          <defs>
            {/* Wing Gradient */}
            <linearGradient id="wingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--lyra-glow, #38BDF8)" stopOpacity="0.8" />
              <stop offset="100%" stopColor="var(--lyra-wand, #818CF8)" stopOpacity="0.2" />
            </linearGradient>

            {/* Core Body Gradient */}
            <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="60%" stopColor="var(--lyra-glow, #38BDF8)" />
              <stop offset="100%" stopColor="var(--lyra-wand, #818CF8)" />
            </linearGradient>

            {/* Wand Sparkle Filter */}
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Left Translucent Fairy Wing */}
          <path
            d="M 50 48 C 25 20, 10 35, 20 60 C 25 72, 45 62, 50 54 Z"
            fill="url(#wingGrad)"
            className="animate-wing-left"
            style={{ transformOrigin: '50px 52px' }}
          />

          {/* Right Translucent Fairy Wing */}
          <path
            d="M 50 48 C 75 20, 90 35, 80 60 C 75 72, 55 62, 50 54 Z"
            fill="url(#wingGrad)"
            className="animate-wing-right"
            style={{ transformOrigin: '50px 52px' }}
          />

          {/* Fairy Halo/Aura */}
          <ellipse
            cx="50"
            cy="26"
            rx="14"
            ry="4"
            fill="none"
            stroke="var(--lyra-glow, #38BDF8)"
            strokeWidth="1.5"
            strokeDasharray={isListening ? '4 2' : 'none'}
            opacity="0.8"
          />

          {/* Fairy Head */}
          <circle cx="50" cy="36" r="10" fill="#FFFDF8" filter="url(#glow)" />

          {/* Fairy Eyes (Playful/Attentive) */}
          <circle cx="47" cy="35" r="1.5" fill="var(--text-main, #0F172A)" />
          <circle cx="53" cy="35" r="1.5" fill="var(--text-main, #0F172A)" />

          {/* Mouth (animated if speaking) */}
          {isSpeaking ? (
            <ellipse
              cx="50"
              cy="40"
              rx="2.5"
              ry="2"
              fill="var(--lyra-glow, #38BDF8)"
              className="animate-pulse"
            />
          ) : (
            <path
              d="M 48 39 Q 50 42 52 39"
              fill="none"
              stroke="var(--text-muted, #64748B)"
              strokeWidth="1"
              strokeLinecap="round"
            />
          )}

          {/* Fairy Body & Futuristic Tunic */}
          <path
            d="M 44 46 L 56 46 L 60 70 L 40 70 Z"
            fill="url(#bodyGrad)"
            rx="2"
            opacity="0.95"
          />

          {/* Floating Energy Feet */}
          <circle cx="47" cy="74" r="2" fill="var(--lyra-glow, #38BDF8)" opacity="0.8" />
          <circle cx="53" cy="74" r="2" fill="var(--lyra-glow, #38BDF8)" opacity="0.8" />

          {/* Glowing Wand */}
          <g
            className={`transition-transform duration-300 ${
              isWandActive ? 'animate-wand' : ''
            }`}
            style={{ transformOrigin: '58px 52px' }}
          >
            {/* Wand shaft */}
            <line
              x1="58"
              y1="56"
              x2="78"
              y2="32"
              stroke="var(--lyra-wand, #818CF8)"
              strokeWidth="2"
              strokeLinecap="round"
            />
            {/* Wand Tip Star Starburst */}
            <polygon
              points="78,28 80,31 84,32 80,33 78,36 76,33 72,32 76,31"
              fill="#FFFFFF"
              filter="url(#glow)"
            />
            <circle
              cx="78"
              cy="32"
              r="3"
              fill="var(--lyra-glow, #38BDF8)"
              opacity="0.9"
              filter="url(#glow)"
            />
          </g>

          {/* Orbiting Starlight Sparkles */}
          <circle cx="28" cy="28" r="1.5" fill="#FFF" className="animate-sparkle" />
          <circle cx="74" cy="68" r="1.2" fill="var(--lyra-glow, #38BDF8)" className="animate-sparkle" />
          <circle cx="22" cy="62" r="1.5" fill="var(--lyra-wand, #818CF8)" className="animate-sparkle" />
        </svg>

        {/* State Badge for small preview */}
        {state !== 'idle' && (
          <span
            className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-[var(--bg-card)] ${
              state === 'listening'
                ? 'bg-emerald-500 animate-pulse'
                : state === 'thinking'
                ? 'bg-amber-400 animate-spin'
                : state === 'speaking'
                ? 'bg-sky-400 animate-bounce'
                : state === 'error'
                ? 'bg-rose-500'
                : 'bg-indigo-500'
            }`}
          />
        )}
      </div>

      {showLabel && (
        <div className="mt-1 flex flex-col items-center">
          <span className={`font-semibold tracking-wide ${currentSize.text} text-[var(--text-main)]`}>
            LYRA
          </span>
          <span className="text-[10px] uppercase font-mono tracking-widest text-[var(--lyra-glow)]">
            {state}
          </span>
        </div>
      )}
    </div>
  );
};
