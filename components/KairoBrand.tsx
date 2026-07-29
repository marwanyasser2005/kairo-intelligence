import React, { useState } from 'react';
import { BRAND_ASSETS } from '../config/branding';

interface BrandProps {
  className?: string;
  imageClassName?: string;
  decorative?: boolean;
}

const BrandImage: React.FC<BrandProps & { alt: string }> = ({
  className = 'h-[clamp(3.5rem,5vw,5.5rem)] aspect-[822/938]',
  imageClassName = '',
  decorative = false,
  alt,
}) => {
  const [logoSource, setLogoSource] = useState<string>(BRAND_ASSETS.logo);
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
            if (logoSource !== BRAND_ASSETS.logoPng) {
              setLogoSource(BRAND_ASSETS.logoPng);
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

export default KairoBrandMark;
