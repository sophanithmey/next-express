'use client';

import React from 'react';

function AnimatedScooterWheel({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g transform={`translate(${cx}, ${cy})`}>
      <g className="delivery-seq-wheel">
        <circle cx="0" cy="0" r="24" fill="#0B1F44" />
        <circle
          cx="0"
          cy="0"
          r="21"
          fill="none"
          stroke="#1E3A6D"
          strokeWidth="2.8"
          strokeDasharray="5 7"
        />
        <circle cx="0" cy="0" r="14.5" fill="#E2E8F0" />
        <circle cx="0" cy="0" r="11.5" fill="#FFFFFF" />
        <line x1="-11" y1="0" x2="11" y2="0" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
        <line x1="0" y1="-11" x2="0" y2="11" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
        <line x1="-7.8" y1="-7.8" x2="7.8" y2="7.8" stroke="#94A3B8" strokeWidth="1.6" strokeLinecap="round" />
        <line x1="-7.8" y1="7.8" x2="7.8" y2="-7.8" stroke="#94A3B8" strokeWidth="1.6" strokeLinecap="round" />
        <circle cx="0" cy="0" r="5" fill="#003494" />
        <circle cx="0" cy="0" r="2.2" fill="#FF7A1A" />
      </g>
    </g>
  );
}

/**
 * Animated corporate delivery scooter with rotating wheels, motion speed lines,
 * hinged rear parcel box lid, and mounted driver during arrival/stop phases.
 */
export function DeliverySceneScooter() {
  return (
    <g id="delivery-scooter-group" className="delivery-seq-scooter-move">
      {/* Subtle Arrival Speed Lines */}
      <g className="delivery-seq-speed-lines" strokeLinecap="round">
        <line x1="16" y1="214" x2="74" y2="214" stroke="#FF7A1A" strokeWidth="3" />
        <line x1="2" y1="232" x2="66" y2="232" stroke="#1D5CE0" strokeWidth="2.5" opacity="0.6" />
        <line x1="26" y1="250" x2="72" y2="250" stroke="#94A3B8" strokeWidth="2" opacity="0.55" />
      </g>

      {/* Scooter Ground Shadow */}
      <ellipse cx="184" cy="319" rx="92" ry="8" fill="#0B1F44" opacity="0.12" />

      {/* Spinning Wheels (decelerate cleanly on stop) */}
      <AnimatedScooterWheel cx={124} cy={294} />
      <AnimatedScooterWheel cx={246} cy={294} />

      {/* Suspension / Brake-Dip Chassis Group */}
      <g className="delivery-seq-scooter-suspension">
        {/* Soft Headlight Glow */}
        <polygon points="256,232 326,216 326,262 256,246" fill="url(#headlightGlow)" opacity="0.55" />

        {/* Rear Delivery Box & Hinged Lid */}
        <g id="scooter-delivery-box">
          {/* Rack */}
          <rect x="92" y="252" width="58" height="7" rx="3.5" fill="#0B1F44" />
          {/* Box Body (Wing Primary Gold) */}
          <rect
            x="78"
            y="196"
            width="68"
            height="58"
            rx="10"
            fill="url(#boxPrimaryGrad)"
            stroke="#0B1F44"
            strokeWidth="2"
          />
          {/* White Branded Plate with Wingexpress Wordmark */}
          <rect x="82" y="215" width="60" height="22" rx="6" fill="#FFFFFF" />
          <text
            x="112"
            y="229"
            textAnchor="middle"
            fontSize="8.2"
            fontWeight="800"
            letterSpacing="-0.2"
            fontFamily="Poppins, Inter, system-ui, sans-serif"
          >
            <tspan fill="#0B1F44">Wing</tspan>
            <tspan fill="#003494">express</tspan>
          </text>

          {/* Hinged Top Lid (opens during parcel pickup) */}
          <g transform="translate(78, 196)">
            <g className="delivery-seq-box-lid">
              <path
                d="M0 0 C0 -7 5 -11 12 -11 H56 C63 -11 68 -7 68 0 V5 H0 V0 Z"
                fill="#0B1F44"
              />
              <rect x="14" y="-5" width="40" height="3" rx="1.5" fill="#FFCC00" />
            </g>
          </g>
        </g>

        {/* Mounted Rider (visible during arrival & stop, transitions to walking driver) */}
        <g id="mounted-driver" className="delivery-seq-mounted-driver">
          {/* Leg & Shoe */}
          <path
            d="M168 238 C180 246 190 258 194 276 L198 290 H184 L176 264 L156 250 Z"
            fill="#0B1F44"
          />
          <rect x="182" y="286" width="24" height="8" rx="4" fill="#1E293B" />

          {/* Wing Primary Gold Uniform Jacket */}
          <path
            d="M158 186 C168 180 186 182 194 196 L202 232 C202 240 196 246 188 246 H162 C154 246 148 238 150 230 L158 186 Z"
            fill="url(#boxPrimaryGrad)"
            stroke="#D9A300"
            strokeWidth="1.2"
          />
          {/* Navy Collar & Bottom Trim */}
          <path d="M174 184 L184 192 L176 198 Z" fill="#0B1F44" />
          <rect x="154" y="232" width="44" height="4" rx="2" fill="#003494" />

          {/* Arm Holding Handlebar (Primary Gold Sleeve + Navy Cuff) */}
          <path
            d="M184 196 L210 216 L234 212"
            stroke="#E6B800"
            strokeWidth="12"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M225 213.5 L234 212"
            stroke="#003494"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <circle cx="236" cy="212" r="5.5" fill="#0B1F44" />

          {/* Head & Stylish Navy/Primary Helmet */}
          <rect x="174" y="170" width="10" height="14" rx="5" fill="#F1C29B" />
          <circle cx="185" cy="164" r="14" fill="#F1C29B" />
          <path d="M192 169 Q195 170.5 197 168.5" stroke="#8C4A27" strokeWidth="1.6" strokeLinecap="round" />
          <path
            d="M168 164 C168 149 180 142 192 145 C202 148 205 157 204 164 H191 C188 159 182 158 178 161 L175 170 C170 170 168 167 168 164 Z"
            fill="#0B1F44"
          />
          {/* Primary Gold Helmet Racing Stripe */}
          <path d="M174 151 C182 146 192 147 198 152" stroke="#FFCC00" strokeWidth="3" strokeLinecap="round" />
          {/* Visor */}
          <path d="M190 153 H204 C205 157 205 161 203 163 H190 Z" fill="#1E3A6D" />
        </g>

        {/* Modern Scooter Body */}
        <path
          d="M100 278 C104 256 126 248 160 250 L178 264 H210 L226 218 C228 212 232 210 238 212 L252 234 C258 244 258 260 250 270 L232 272 L214 294 H154 C148 276 124 272 110 282 Z"
          fill="url(#uniformBlueGrad)"
        />
        {/* Crisp White Side Panel */}
        <path
          d="M114 270 C122 258 144 256 164 262 L170 274 H142 C132 268 122 268 114 270 Z"
          fill="#FFFFFF"
        />
        <line x1="124" y1="266" x2="158" y2="266" stroke="#FF7A1A" strokeWidth="3" strokeLinecap="round" />

        {/* Contoured Navy Seat */}
        <path
          d="M148 246 C148 240 158 238 174 240 L190 244 C194 246 193 252 186 252 H152 C148 252 148 249 148 246 Z"
          fill="#0B1F44"
        />

        {/* Front Fork, Mudguard & Handlebars */}
        <line x1="234" y1="242" x2="246" y2="294" stroke="#94A3B8" strokeWidth="4.5" strokeLinecap="round" />
        <path d="M230 270 C242 262 258 264 266 276" stroke="#003494" strokeWidth="6" strokeLinecap="round" />
        <line x1="226" y1="214" x2="240" y2="209" stroke="#0B1F44" strokeWidth="5.5" strokeLinecap="round" />
        <line x1="234" y1="210" x2="232" y2="198" stroke="#64748B" strokeWidth="2.4" strokeLinecap="round" />
        <ellipse cx="229" cy="197" rx="6" ry="3.8" fill="#0B1F44" />
        <ellipse cx="255" cy="238" rx="5.5" ry="8.5" fill="#FF9A44" stroke="#0B1F44" strokeWidth="2" />
      </g>
    </g>
  );
}
