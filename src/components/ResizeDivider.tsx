import React, { useState, useEffect } from 'react';

interface ResizeDividerProps {
  direction: 'vertical' | 'horizontal';
  onResize: (delta: number) => void;
  className?: string;
  title?: string;
}

export const ResizeDivider: React.FC<ResizeDividerProps> = ({
  direction,
  onResize,
  className = '',
  title
}) => {
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!isDragging) return;

    const handlePointerMove = (e: PointerEvent) => {
      e.preventDefault();
      if (direction === 'vertical') {
        onResize(e.movementX);
      } else {
        // For horizontal divider at the bottom of upper workspace:
        // Moving up (negative movementY) increases bottom table height
        onResize(-e.movementY);
      }
    };

    const handlePointerUp = () => {
      setIsDragging(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDragging, direction, onResize]);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    document.body.style.cursor = direction === 'vertical' ? 'col-resize' : 'row-resize';
    document.body.style.userSelect = 'none';
  };

  if (direction === 'vertical') {
    return (
      <div
        onPointerDown={handlePointerDown}
        className={`group relative flex items-center justify-center w-2 -mx-1 z-20 cursor-col-resize select-none shrink-0 transition-colors ${className}`}
        title={title || 'Потяните для изменения ширины колонок'}
      >
        {/* Visual Line */}
        <div
          className={`w-[3px] h-full rounded-full transition-all duration-150 ${
            isDragging
              ? 'bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.6)] w-[4px]'
              : 'bg-transparent group-hover:bg-blue-400 group-hover:w-[3px]'
          }`}
        />
        {/* Center Grab Handle Dots */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 w-3.5 h-6 rounded-sm flex flex-col items-center justify-center gap-0.5 pointer-events-none transition-opacity ${
            isDragging ? 'opacity-100 bg-blue-600 text-white' : 'opacity-0 group-hover:opacity-100 bg-slate-200 text-slate-500'
          }`}
        >
          <div className="w-1 h-1 bg-current rounded-full" />
          <div className="w-1 h-1 bg-current rounded-full" />
          <div className="w-1 h-1 bg-current rounded-full" />
        </div>
      </div>
    );
  }

  // Horizontal divider
  return (
    <div
      onPointerDown={handlePointerDown}
      className={`group relative flex items-center justify-center h-2.5 -my-1 z-20 cursor-row-resize select-none shrink-0 transition-colors ${className}`}
      title={title || 'Потяните для изменения высоты таблицы спецификации'}
    >
      {/* Visual Line */}
      <div
        className={`h-[3px] w-full rounded-full transition-all duration-150 ${
          isDragging
            ? 'bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.6)] h-[4px]'
            : 'bg-transparent group-hover:bg-blue-400 group-hover:h-[3px]'
        }`}
      />
      {/* Center Grab Handle */}
      <div
        className={`absolute left-1/2 -translate-x-1/2 h-3.5 w-10 rounded-full flex items-center justify-center gap-1 pointer-events-none transition-opacity ${
          isDragging ? 'opacity-100 bg-blue-600 text-white' : 'opacity-0 group-hover:opacity-100 bg-slate-300 text-slate-600'
        }`}
      >
        <div className="w-1 h-1 bg-current rounded-full" />
        <div className="w-1 h-1 bg-current rounded-full" />
        <div className="w-1 h-1 bg-current rounded-full" />
      </div>
    </div>
  );
};

