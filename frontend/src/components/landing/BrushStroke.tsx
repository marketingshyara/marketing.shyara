import { useId } from "react";

/**
 * Straight horizontal highlighter: solid flat middle, bristle texture only on both ends.
 */
export function BrushStroke({ className = "" }: { className?: string }) {
  const uid = useId().replace(/:/g, "");
  const featherL = `brush-feather-l-${uid}`;
  const featherR = `brush-feather-r-${uid}`;
  const endL = `brush-end-l-${uid}`;
  const endR = `brush-end-r-${uid}`;

  return (
    <svg
      viewBox="0 0 100 36"
      preserveAspectRatio="none"
      fill="none"
      aria-hidden
      className={className}
    >
      <defs>
        <filter id={featherL} x="-40%" y="-60%" width="70%" height="220%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.95 0.28"
            numOctaves="4"
            seed="2"
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="3"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
        <filter id={featherR} x="-30%" y="-60%" width="70%" height="220%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9 0.26"
            numOctaves="4"
            seed="8"
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="3"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
        <clipPath id={endL}>
          <rect x="0" y="0" width="14" height="36" />
        </clipPath>
        <clipPath id={endR}>
          <rect x="86" y="0" width="14" height="36" />
        </clipPath>
      </defs>

      <path
        fill="#FF3333"
        d="M 3 18
           C 3 12.5 9 9.5 16 9.5
           H 84
           C 91 9.5 97 12.5 97 18
           C 97 23.5 91 26.5 84 26.5
           H 16
           C 9 26.5 3 23.5 3 18
           Z"
      />

      <g clipPath={`url(#${endL})`} filter={`url(#${featherL})`} opacity="0.92">
        <path
          fill="#FF3333"
          d="M 0 18 C 2 14 5 11.5 10 10.5 L 10 25.5 C 5 24.5 2 22 0 18 Z"
        />
        <path
          fill="#FF3333"
          opacity="0.5"
          d="M 0 18 C 4 13.5 8 14 12 15.5 V 20.5 C 8 22 4 21.5 0 18 Z"
        />
      </g>

      <g clipPath={`url(#${endR})`} filter={`url(#${featherR})`} opacity="0.92">
        <path
          fill="#FF3333"
          d="M 100 18 C 98 14 95 11.5 90 10.5 L 90 25.5 C 95 24.5 98 22 100 18 Z"
        />
        <path
          fill="#FF3333"
          opacity="0.5"
          d="M 100 18 C 96 13.5 92 14 88 15.5 V 20.5 C 92 22 96 21.5 100 18 Z"
        />
      </g>
    </svg>
  );
}
