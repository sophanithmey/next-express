'use client';

import React from 'react';

/**
 * Modern minimalist residential doorstep & entryway (right side of hero scene).
 * Transparent background with subtle architectural depth in navy, slate, and white.
 */
export function DeliverySceneHouse() {
  return (
    <g id="customer-house">
      {/* Subtle Architectural Backdrop Silhouette */}
      <rect
        x="434"
        y="92"
        width="138"
        height="226"
        rx="14"
        fill="url(#houseWallGrad)"
        stroke="#DCE5F2"
        strokeWidth="1.5"
      />

      {/* Side Accent Wall Depth */}
      <path
        d="M554 92 H562 C568 92 572 96 572 102 V318 H554 V92 Z"
        fill="#E2E8F0"
        opacity="0.7"
      />

      {/* Roof Trim Accent */}
      <rect x="428" y="84" width="150" height="12" rx="6" fill="#0B1F44" />
      <rect x="436" y="96" width="134" height="3" fill="#1D5CE0" opacity="0.25" />

      {/* Upper Horizontal Window */}
      <rect
        x="452"
        y="114"
        width="44"
        height="26"
        rx="5"
        fill="#E8F1FD"
        stroke="#CBD5E1"
        strokeWidth="1.2"
      />
      <line x1="474" y1="114" x2="474" y2="140" stroke="#FFFFFF" strokeWidth="1.5" />
      <path d="M456 135 L466 118" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />

      {/* House Number Plaque */}
      <rect x="514" y="118" width="28" height="18" rx="4" fill="#0B1F44" />
      <rect x="520" y="125" width="16" height="4" rx="2" fill="#FF7A1A" />

      {/* Cantilevered Door Awning */}
      <path
        d="M446 168 L546 168 L552 178 C552 181 550 183 547 183 H445 C442 183 440 181 440 178 L446 168 Z"
        fill="#003494"
      />
      <rect x="444" y="179" width="104" height="3" rx="1.5" fill="#FF7A1A" />
      {/* Awning Soft Cast Shadow */}
      <rect x="454" y="183" width="84" height="9" fill="#0B1F44" opacity="0.08" />

      {/* Modern Entry Door */}
      <rect
        x="466"
        y="186"
        width="62"
        height="124"
        rx="6"
        fill="url(#doorNavyGrad)"
      />
      {/* Frosted Vertical Glass Inset */}
      <rect
        x="480"
        y="200"
        width="16"
        height="88"
        rx="3"
        fill="#DBEAFE"
        opacity="0.88"
      />
      <path d="M483 224 L493 208" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
      {/* Sleek Orange/Gold Handle */}
      <rect x="516" y="242" width="4" height="16" rx="2" fill="#FF9A44" />

      {/* Porch Step */}
      <rect x="452" y="308" width="94" height="10" rx="3" fill="#CBD5E1" />
      <rect x="444" y="314" width="110" height="6" rx="3" fill="#94A3B8" opacity="0.45" />

      {/* Stylish Potted Plant by Doorstep */}
      <g transform="translate(534, 266)">
        {/* Foliage */}
        <path
          d="M16 26 C4 18 2 4 14 0 C18 8 18 18 16 26 Z"
          fill="#1D5CE0"
          opacity="0.22"
        />
        <path
          d="M18 28 C10 14 14 2 24 0 C26 10 24 20 18 28 Z"
          fill="#0F766E"
          opacity="0.85"
        />
        <path
          d="M20 28 C28 16 36 12 34 2 C26 4 20 14 20 28 Z"
          fill="#10B77F"
        />
        <path
          d="M15 28 C6 22 0 18 2 10 C10 12 14 20 15 28 Z"
          fill="#14B8A6"
          opacity="0.9"
        />
        {/* Modern Matte Ceramic Pot */}
        <path d="M6 26 H30 L27 48 C26.6 50.5 24.5 52 22 52 H14 C11.5 52 9.4 50.5 9 48 L6 26 Z" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.4" />
        <rect x="5" y="24" width="26" height="5" rx="2.5" fill="#E2E8F0" />
      </g>
    </g>
  );
}
