import React from 'react';
import { ICONS, type IconName } from '../constants';

interface IconProps {
  name: IconName;
  className?: string;
}

const Icon: React.FC<IconProps> = ({ name, className = 'w-6 h-6' }) => {
  const iconJsx = ICONS[name];

  if (!iconJsx) {
    return null;
  }

  const isFilled = ['star', 'play'].includes(name);
  const isBrand = ['visa', 'mastercard'].includes(name);

  if (isBrand) {
    let viewBox = '0 0 24 24';
    if(name === 'visa') viewBox = '0 0 16 12';
    if(name === 'mastercard') viewBox = '0 0 24 14';
    return <svg className={className} viewBox={viewBox} aria-hidden="true">{iconJsx}</svg>;
  }

  const svgProps = isFilled
    ? {
        className,
        viewBox: '0 0 24 24',
      }
    : {
        className,
        fill: 'none',
        viewBox: '0 0 24 24',
        strokeWidth: '1.5',
        stroke: 'currentColor',
      };

  return <svg {...svgProps} aria-hidden="true">{iconJsx}</svg>;
};

export default Icon;