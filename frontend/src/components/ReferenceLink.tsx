'use client';

import { useState } from 'react';
import { ExternalLink, MapPin } from 'lucide-react';

interface ReferenceLinkProps {
  pageNumber: number;
  pagePosition?: number;
  children: React.ReactNode;
  onReferenceClick?: (pageNumber: number, pagePosition?: number) => void;
  className?: string;
}

export default function ReferenceLink({ 
  pageNumber, 
  pagePosition = 0, 
  children, 
  onReferenceClick,
  className = ""
}: ReferenceLinkProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onReferenceClick) {
      onReferenceClick(pageNumber, pagePosition);
    }
  };

  return (
    <span className="relative inline-block">
      <button
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          inline-flex items-center gap-1 
          text-blue-600 hover:text-blue-800 
          underline decoration-dotted hover:decoration-solid
          transition-all duration-200
          ${className}
        `}
        title={`Go to page ${pageNumber}${pagePosition ? `, position ${pagePosition}` : ''}`}
      >
        {children}
        <ExternalLink className="h-3 w-3" />
      </button>
      
      {isHovered && (
        <div className="absolute bottom-full left-0 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded shadow-lg whitespace-nowrap z-10">
          <MapPin className="h-3 w-3 inline mr-1" />
          Page {pageNumber}
          <div className="absolute top-full left-2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-800"></div>
        </div>
      )}
    </span>
  );
} 