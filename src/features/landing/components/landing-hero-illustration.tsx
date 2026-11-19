import React from 'react';
import { DeliverySceneHouse } from './hero-delivery-scene/delivery-scene-house';
import { DeliverySceneScooter } from './hero-delivery-scene/delivery-scene-scooter';
import { DeliverySceneCharacters } from './hero-delivery-scene/delivery-scene-characters';

interface LandingHeroIllustrationProps {
  ariaLabel?: string;
}

/**
 * Premium, transparent-background animated SVG illustration depicting a full
 * parcel delivery loop: motorcycle arrival, smooth stop, package pickup,
 * doorstep handover to a happy customer, and animated success confirmation.
 */
export function LandingHeroIllustration({
  ariaLabel = 'Delivery driver arriving on motorcycle and handing a parcel to a happy customer',
}: LandingHeroIllustrationProps) {
  return (
    <div className="relative mx-auto w-full max-w-xl select-none">
      <svg
        viewBox="0 0 600 380"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label={ariaLabel}
        className="w-full h-auto overflow-visible"
      >
        <defs>
          <clipPath id="deliveryStageClip">
            <rect x="0" y="0" width="600" height="380" />
          </clipPath>

          <linearGradient id="houseWallGrad" x1="434" y1="92" x2="572" y2="318" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#F1F5F9" />
          </linearGradient>

          <linearGradient id="doorNavyGrad" x1="466" y1="186" x2="528" y2="310" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#102A5C" />
            <stop offset="100%" stopColor="#0B1F44" />
          </linearGradient>

          <linearGradient id="uniformBlueGrad" x1="150" y1="180" x2="256" y2="294" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1D5CE0" />
            <stop offset="100%" stopColor="#003494" />
          </linearGradient>

          <linearGradient id="boxPrimaryGrad" x1="78" y1="196" x2="146" y2="254" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFE066" />
            <stop offset="50%" stopColor="#FFCC00" />
            <stop offset="100%" stopColor="#E6B800" />
          </linearGradient>

          <linearGradient id="parcelFrontGrad" x1="0" y1="6" x2="34" y2="36" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#F1C588" />
            <stop offset="100%" stopColor="#D99B4E" />
          </linearGradient>

          <linearGradient id="headlightGlow" x1="256" y1="238" x2="326" y2="238" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FF9A44" stopOpacity="0.48" />
            <stop offset="100%" stopColor="#FF9A44" stopOpacity="0" />
          </linearGradient>
        </defs>

        <g clipPath="url(#deliveryStageClip)">
          {/* Subtle Floating Ambient Decorative Elements (Transparent Backdrop) */}
          <g className="delivery-seq-ambient-slow" opacity="0.75">
            <circle cx="84" cy="96" r="6" fill="#DBEAFE" />
            <circle cx="104" cy="74" r="3.5" fill="#FF7A1A" opacity="0.65" />
            <circle cx="316" cy="70" r="8" stroke="#BFDBFE" strokeWidth="2" />
            <rect x="242" y="96" width="8" height="8" rx="2" transform="rotate(24 242 96)" fill="#FFF3E8" stroke="#FF9A44" strokeWidth="1.4" />
          </g>

          <g className="delivery-seq-ambient-alt" opacity="0.65">
            <circle cx="392" cy="76" r="4" fill="#1D5CE0" opacity="0.35" />
            <circle cx="54" cy="156" r="10" stroke="#E2E8F0" strokeWidth="2" />
            <path d="M180 68 L183 74 L189 77 L183 80 L180 86 L177 80 L171 77 L177 74 Z" fill="#BFDBFE" />
          </g>

          {/* Subtle Minimal Horizon Line & Soft Ground Plane */}
          <ellipse cx="300" cy="322" rx="262" ry="12" fill="#0B1F44" opacity="0.045" />
          <line x1="28" y1="318" x2="574" y2="318" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
          <line x1="56" y1="330" x2="108" y2="330" stroke="#E2E8F0" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="132" y1="330" x2="162" y2="330" stroke="#E2E8F0" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="292" y1="330" x2="348" y2="330" stroke="#E2E8F0" strokeWidth="2.5" strokeLinecap="round" />

          {/* Layer 1: Customer's Modern Doorstep */}
          <DeliverySceneHouse />

          {/* Layer 2: Delivery Scooter & Mounted Driver Arrival */}
          <DeliverySceneScooter />

          {/* Layer 3: Walking Driver, Happy Customer, Parcel Handover & Success Checkmark */}
          <DeliverySceneCharacters />
        </g>
      </svg>
    </div>
  );
}
