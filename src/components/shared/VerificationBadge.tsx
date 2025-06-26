import { Tooltip } from "@mui/material";
import React, { useMemo } from "react";
import "@/styles/components/verification-badge-components-styles.css";
import { DEFAULT_LOOMER_DATA } from "@/config/constants/navigation-header";

// Badge types and their properties
export const VBadge = {
  Supreme: {
    aura: 15,
    styles: "SupremeStyles",
    logo: "Supreme",
  },
  Eminent: {
    aura: 12,
    styles: "EminentStyles",
    logo: "Eminent",
  },
  Majestic: {
    aura: 9,
    styles: "MajesticStyles",
    logo: "Majestic",
  },
  Virtuous: {
    aura: 6,
    styles: "VirtuousStyles",
    logo: "Virtuous",
  },
  Aurora: {
    aura: 3,
    styles: "AuroraStyles",
    logo: "Aurora",
  },
};

interface VerificationBadgeProps {
  loomer: typeof DEFAULT_LOOMER_DATA | null;
  size: string | number;
  tooltip: boolean;
  sizeOfLogo?: number;
}

function VerificationBadge({
  loomer=DEFAULT_LOOMER_DATA,
  size,
  tooltip,
  sizeOfLogo,
}: VerificationBadgeProps) {
  const loomerAura = loomer?.aura || 0;

  // Calculate the appropriate badge based on aura - memoized for performance
  const loomerBadge = useMemo(() => {
    return Object.values(VBadge)
      .sort((a, b) => b.aura - a.aura)
      .find((badge) => loomerAura >= badge.aura);
  }, [loomerAura]);

  // Calculate logo size - memoized for performance
  const calculatedLogoSize = useMemo(() => {
    if (sizeOfLogo) return sizeOfLogo;

    const numSize = Number(size);
    if (numSize >= 24) return numSize * 0.5;
    if (numSize >= 20) return numSize * 0.7;
    if (numSize >= 15) return numSize * 0.8;
    return numSize * 0.6;
  }, [size, sizeOfLogo]);

  // If no badge is applicable, don't render
  if (!loomerBadge) {
    return (
      <span style={{ fontSize: size }}>{loomer?.loomerName}</span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1">
      <span className={loomerBadge.styles} style={{ fontSize: size }}>
        <Tooltip
          className={tooltip ? "" : "cursor-default"}
          title={tooltip ? loomer?.loomerName : ""}
          placement="top"
        >
          <span className="inline-flex items-center">
            {loomer?.loomerName}
          </span>
        </Tooltip>
      </span>

      <Tooltip
        className={tooltip ? "" : "cursor-default"}
        title={tooltip ? loomerBadge.logo : ""}
        placement="top"
      >
        <span className="inline-flex items-center translate-y-[0.05em]">
          <Badge
            className={loomerBadge.styles}
            praise={loomerBadge.logo}
            logoSize={calculatedLogoSize}
          />
        </span>
      </Tooltip>
    </span>
  );
}

interface BadgeProps {
  className: string;
  praise: string;
  logoSize: number;
}

export const Badge = ({ className, praise, logoSize }: BadgeProps) => {
  return (
    <svg
      aria-label={praise}
      className={`${className}`}
      height={logoSize}
      width={logoSize}
      role="img"
      viewBox="0 0 40 40"
      fill="currentColor"
    >
      <path
        d="M19.998 3.094 14.638 0l-2.972 5.15H5.432v6.354L0 14.64 3.094 20 0 25.359l5.432 3.137v5.905h5.975L14.638 40l5.36-3.094L25.358 40l3.232-5.6h6.162v-6.01L40 25.359 36.905 20 40 14.641l-5.248-3.03v-6.46h-6.419L25.358 0l-5.36 3.094Zm7.415 11.225 2.254 2.287-11.43 11.5-6.835-6.93 2.244-2.258 4.587 4.581 9.18-9.18Z"
        fillRule="evenodd"
        className="fill-current"
      ></path>
    </svg>
  );
};

export default VerificationBadge;
