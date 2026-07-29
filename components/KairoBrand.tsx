import React, { useState } from 'react';
import { BRAND_ASSETS } from '../config/branding';

interface BrandProps {
  className?: string;
  imageClassName?: string;
  decorative?: boolean;
}

const BrandImage: React.FC<BrandProps & { alt: string; source?: string; fallback?: string }> = ({
  className = 'h-[clamp(3.5rem,5vw,5.5rem)] aspect-[822/938]',
  imageClassName = '',
  decorative = false,
  alt,
  source = BRAND_ASSETS.logo,
  fallback = BRAND_ASSETS.logoPng,
}) => {
  const [logoSource, setLogoSource] = useState<string>(source);
  const [failed, setFailed] = useState(false);

  return (
    <span
      className={`kairo-logo-wrapper ${className}`}
      aria-label={!decorative && failed ? alt : undefined}
      aria-hidden={decorative || undefined}
    >
      {failed ? (
        <span className="whitespace-nowrap text-xl font-black tracking-[0.18em] text-kairo-green">
          KAIRO
        </span>
      ) : (
        <img
          src={logoSource}
          alt={decorative ? '' : alt}
          aria-hidden={decorative}
          className={`kairo-logo ${imageClassName}`}
          draggable={false}
          onError={() => {
            if (logoSource !== fallback) {
              setLogoSource(fallback);
            } else {
              setFailed(true);
            }
          }}
        />
      )}
    </span>
  );
};

export const KairoBrandMark: React.FC<BrandProps> = ({
  className = 'h-[clamp(3.5rem,5vw,5.5rem)] aspect-[822/938]',
  imageClassName = '',
  decorative = false,
}) => (
  <BrandImage
    alt="KAIRO"
    className={className}
    imageClassName={imageClassName}
    decorative={decorative}
  />
);

export const KairoBrandLockup: React.FC<BrandProps> = ({
  className = 'h-[clamp(7rem,11vw,10.5rem)] aspect-[822/938]',
  imageClassName = '',
  decorative = false,
}) => (
  <BrandImage
    alt="KAIRO Intelligence"
    className={className}
    imageClassName={imageClassName}
    decorative={decorative}
  />
);

export const KairoBrandSymbol: React.FC<BrandProps> = ({
  className = 'h-[clamp(3rem,5vw,5rem)] aspect-square',
  imageClassName = '',
  decorative = false,
}) => (
  <BrandImage
    alt="KAIRO"
    source={BRAND_ASSETS.symbol}
    fallback={BRAND_ASSETS.favicon}
    className={className}
    imageClassName={imageClassName}
    decorative={decorative}
  />
);

export default KairoBrandMark;
