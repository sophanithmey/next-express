'use client';

import React from 'react';

/**
 * Standing/walking delivery driver, happy customer at doorstep,
 * animated parcel handover, floating celebration particles, and success checkmark.
 */
export function DeliverySceneCharacters() {
  return (
    <g id="delivery-characters-layer">
      {/* === HAPPY CUSTOMER STANDING AT DOORSTEP === */}
      <g id="happy-customer" transform="translate(414, 178)">
        {/* Ground Shadow */}
        <ellipse cx="14" cy="140" rx="22" ry="5.5" fill="#0B1F44" opacity="0.12" />

        <g className="delivery-seq-customer-idle">
          {/* Legs & Clean Sneakers */}
          <rect x="4" y="84" width="9" height="48" rx="4.5" fill="#0B1F44" />
          <rect x="17" y="84" width="9" height="48" rx="4.5" fill="#102A5C" />
          <rect x="-1" y="128" width="16" height="8" rx="4" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.2" />
          <rect x="14" y="128" width="16" height="8" rx="4" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.2" />

          {/* Smart-Casual White Knit Sweater + Navy Collar Detail */}
          <path
            d="M0 44 C2 34 26 34 28 44 L31 86 C31 90 27 92 23 92 H5 C1 92 -3 90 -3 86 L0 44 Z"
            fill="#FFFFFF"
            stroke="#CBD5E1"
            strokeWidth="1.4"
          />
          <path d="M8 37 Q14 43 20 37" stroke="#003494" strokeWidth="2.5" strokeLinecap="round" fill="none" />

          {/* Head & Modern Hair */}
          <rect x="10" y="24" width="8" height="12" rx="4" fill="#F2C6A0" />
          <circle cx="13" cy="18" r="13.5" fill="#F2C6A0" />
          {/* Stylish Navy Hair */}
          <path
            d="M0 16 C0 4 12 -1 22 4 C28 7 29 18 25 26 C22 24 21 16 18 13 C12 12 6 15 0 16 Z"
            fill="#0B1F44"
          />
          {/* Friendly Eyes & Happy Smile (facing left toward driver) */}
          <circle cx="7.5" cy="17.5" r="1.4" fill="#0B1F44" />
          <path
            d="M4.5 22 Q7.5 25.5 11.5 23"
            stroke="#8C4A27"
            strokeWidth="1.8"
            strokeLinecap="round"
            fill="none"
          />

          {/* Customer Receiving Arms (lift forward smoothly at handover) */}
          <g transform="translate(8, 48)">
            <g className="delivery-seq-customer-arm">
              <path
                d="M0 0 L-18 14 L-32 10"
                stroke="#FFFFFF"
                strokeWidth="10"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M0 0 L-18 14 L-32 10"
                stroke="#CBD5E1"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <circle cx="-34" cy="10" r="4.5" fill="#F2C6A0" />
            </g>
          </g>
        </g>
      </g>

      {/* === WALKING DELIVERY DRIVER (dismounts, walks to customer, hands parcel) === */}
      <g id="walking-driver" className="delivery-seq-driver-walk">
        {/* Ground Shadow */}
        <ellipse cx="222" cy="318" rx="22" ry="5.5" fill="#0B1F44" opacity="0.12" />

        <g className="delivery-seq-driver-bob">
          {/* Striding Legs */}
          <g transform="translate(216, 260)">
            <rect x="0" y="0" width="9" height="48" rx="4.5" fill="#0B1F44" className="delivery-seq-leg-left" />
            <rect x="11" y="0" width="9" height="48" rx="4.5" fill="#102A5C" className="delivery-seq-leg-right" />
          </g>
          <rect x="213" y="306" width="16" height="8" rx="4" fill="#0B1F44" />
          <rect x="226" y="306" width="16" height="8" rx="4" fill="#1E293B" />

          {/* Branded Wing Primary Gold Uniform Jacket */}
          <path
            d="M208 214 C210 204 234 204 236 214 L239 260 C239 265 235 268 230 268 H214 C209 268 205 265 205 260 L208 214 Z"
            fill="url(#boxPrimaryGrad)"
            stroke="#D9A300"
            strokeWidth="1.2"
          />
          {/* Navy Collar & Bottom Trim */}
          <path d="M218 206 L228 214 L220 220 Z" fill="#0B1F44" />
          <rect x="208" y="254" width="28" height="4" rx="2" fill="#003494" />

          {/* Head + Branded Delivery Cap */}
          <rect x="218" y="196" width="8" height="12" rx="4" fill="#F1C29B" />
          <circle cx="223" cy="188" r="13.5" fill="#F1C29B" />
          {/* Friendly Eye & Warm Smile (facing right toward customer) */}
          <circle cx="229" cy="187.5" r="1.4" fill="#0B1F44" />
          <path
            d="M225.5 192.5 Q229 195.5 232.5 192.5"
            stroke="#8C4A27"
            strokeWidth="1.7"
            strokeLinecap="round"
            fill="none"
          />
          {/* Sleek Corporate Cap */}
          <path
            d="M209 185 C209 175 219 171 230 174 C236 176 239 180 241 183 H210 C209 183 209 184 209 185 Z"
            fill="#0B1F44"
          />
          <rect x="214" y="177" width="14" height="3" rx="1.5" fill="#FFCC00" />

          {/* Driver Handover Arm (Primary Gold Sleeve + Navy Cuff) */}
          <g transform="translate(226, 222)">
            <g className="delivery-seq-driver-arm">
              <path
                d="M0 0 L18 14 L34 10"
                stroke="#E6B800"
                strokeWidth="10"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M26 12 L34 10"
                stroke="#003494"
                strokeWidth="10"
                strokeLinecap="round"
              />
              <circle cx="36" cy="10" r="4.5" fill="#F1C29B" />
            </g>
          </g>
        </g>
      </g>

      {/* === REALISTIC PARCEL (lifts from box -> carried -> bounces into customer hands) === */}
      <g id="animated-parcel" className="delivery-seq-parcel-journey">
        <g className="delivery-seq-parcel-bounce">
          {/* Parcel Shadow */}
          <rect x="2" y="34" width="38" height="5" rx="2.5" fill="#0B1F44" opacity="0.14" />
          {/* Front Face */}
          <rect x="0" y="6" width="34" height="30" rx="4" fill="url(#parcelFrontGrad)" stroke="#B47632" strokeWidth="1.3" />
          {/* Isometric Top Lid & Side Depth */}
          <path d="M0 10 L8 2 H42 L34 10 Z" fill="#F7D9AC" stroke="#B47632" strokeWidth="1.2" strokeLinejoin="round" />
          <path d="M34 10 L42 2 V30 L34 36 Z" fill="#C98A42" stroke="#B47632" strokeWidth="1.2" strokeLinejoin="round" />
          {/* Branded Orange Packing Tape */}
          <path d="M13 10 L21 2 H27 L19 10 V36 H13 V10 Z" fill="#FF7A1A" opacity="0.9" />
          {/* Realistic Shipping Label */}
          <rect x="4" y="20" width="12" height="10" rx="1.8" fill="#FFFFFF" opacity="0.95" />
          <rect x="6" y="22.5" width="8" height="1.8" rx="0.9" fill="#0B1F44" />
          <rect x="6" y="25.5" width="6" height="1.5" rx="0.75" fill="#94A3B8" />
        </g>
      </g>

      {/* === SUCCESS CHECKMARK BADGE + FLOATING CELEBRATION PARTICLES === */}
      <g id="delivery-success-badge" transform="translate(362, 128)">
        {/* Expanding Success Halo */}
        <circle cx="24" cy="24" r="22" fill="#10B77F" className="delivery-seq-success-halo" />

        {/* Crisp Animated Badge */}
        <g className="delivery-seq-success-pop">
          <circle cx="24" cy="24" r="22" fill="#FFFFFF" stroke="#D1FAE5" strokeWidth="2" />
          <circle cx="24" cy="24" r="17" fill="#10B77F" />
          <path
            d="M16.5 24.5 L21.5 29.5 L32 19"
            stroke="#FFFFFF"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            className="delivery-seq-check-draw"
          />
        </g>

        {/* Floating Decorative Particles Around Delivery Moment */}
        <circle cx="-12" cy="14" r="4" fill="#FF7A1A" className="delivery-seq-particle-1" />
        <circle cx="58" cy="10" r="3.5" fill="#1D5CE0" className="delivery-seq-particle-2" />
        <circle cx="54" cy="42" r="3" fill="#FF9A44" className="delivery-seq-particle-3" />
        <circle cx="-6" cy="44" r="2.8" fill="#10B77F" className="delivery-seq-particle-2" />
        <path
          d="M24 -12 L26 -6 L32 -4 L26 -2 L24 4 L22 -2 L16 -4 L22 -6 Z"
          fill="#FF7A1A"
          className="delivery-seq-particle-1"
        />
      </g>
    </g>
  );
}
