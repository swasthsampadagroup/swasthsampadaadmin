import React from 'react';
import logoImage from './04.png';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon-only' | 'horizontal';
  theme?: 'light' | 'dark';
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  variant = 'full',
  theme = 'dark',
}) => {
  const iconSizes = {
    sm: 28,
    md: 38,
    lg: 48,
    xl: 64,
  };

  const currentSize = iconSizes[size];

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
    xl: 'text-2xl',
  };

  const taglineSizes = {
    sm: 'text-[9px]',
    md: 'text-[11px]',
    lg: 'text-[11px]',
    xl: 'text-[12px]',
  };

  return (
    <div
      id="swasth-sampada-brand-logo"
      className={`flex items-center gap-3 select-none ${className}`}
    >
      {/* =========================================================
          SWASTH SAMPADA ORIGINAL LOGO IMAGE
          Source:
          src/components/common/04.png
         ========================================================= */}
      <img
        src={logoImage}
        alt="Swasth Sampada"
        width={currentSize}
        height={currentSize}
        className="shrink-0 object-contain transition-transform duration-200 hover:scale-105"
        draggable={false}
      />

      {/* =========================================================
          BRAND TEXT
         ========================================================= */}
      {variant !== 'icon-only' && (
        <div className="flex flex-col justify-center">
          <div className="flex items-center leading-none">
            <span
              className={`
                font-black
                uppercase
                ${textSizes[size]}
                ${
                  theme === 'dark'
                    ? 'text-white'
                    : 'text-[#005B96]'
                }
              `}
              style={{
                letterSpacing: '0.08em',
                whiteSpace: 'nowrap',
              }}
            >
              SWASTH SAMPADA
            </span>
          </div>

          <span
            className={`
              font-semibold
              uppercase
              ${taglineSizes[size]}
              ${
                theme === 'dark'
                  ? 'text-cyan-300'
                  : 'text-cyan-600'
              }
            `}
            style={{
              letterSpacing: '0.18em',
              whiteSpace: 'nowrap',
            }}
          >
            Smart Business
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;