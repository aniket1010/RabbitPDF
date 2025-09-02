'use client';

import React from 'react';

interface SpinnerProps {
  size?: number; // diameter in px
  className?: string;
  color?: string; // color for the loader
}

// Standardized loader with CSS animation
export default function Spinner({ size = 40, className = '', color = '#000000' }: SpinnerProps) {
  const loaderSize = `${size / 10}px`; // Convert to em equivalent
  
  return (
    <div
      role="status"
      aria-label="Loading"
      className={`loader ${className}`}
      style={{
        fontSize: loaderSize,
        '--loader-color': color,
      } as React.CSSProperties & { '--loader-color': string }}
    />
  );
}


