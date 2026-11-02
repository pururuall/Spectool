import React, { useState, useEffect } from 'react';
import { LineSegment, ModuleModel } from '../types';

interface DimensionOverlayProps {
  selectedLine: LineSegment | null;
  allLines: LineSegment[];
  module: ModuleModel;
  toSvgX: (x: number) => number;
  toSvgY: (y: number) => number;
  onUpdateLine: (line: LineSegment) => void;
}

export const DimensionOverlay: React.FC<DimensionOverlayProps> = ({
  selectedLine,
  allLines,
  module,
  toSvgX,
  toSvgY,
  onUpdateLine
}) => {
  if (!selectedLine) return null;

  const isHoriz = Math.abs(selectedLine.y1 - selectedLine.y2) <= 2;
  const isVert = Math.abs(selectedLine.x1 - selectedLine.x2) <= 2;

  if (!isHoriz && !isVert) return null;

  if (isHoriz) {
    return (
      <HorizontalLineDimensions
        selectedLine={selectedLine}
        allLines={allLines}
        moduleHeight={module.height}
        toSvgX={toSvgX}
        toSvgY={toSvgY}
        onUpdateLine={onUpdateLine}
      />
    );
  }

  return (
    <VerticalLineDimensions
      selectedLine={selectedLine}
      allLines={allLines}
      moduleWidth={module.width}
      toSvgX={toSvgX}
      toSvgY={toSvgY}
      onUpdateLine={onUpdateLine}
    />
  );
};

// ----------------------------------------------------
// HORIZONTAL LINE (РИГЕЛЬ) OVERLAY INPUTS
// ----------------------------------------------------

interface HorizontalLineDimensionsProps {
  selectedLine: LineSegment;
  allLines: LineSegment[];
  moduleHeight: number;
  toSvgX: (x: number) => number;
  toSvgY: (y: number) => number;
  onUpdateLine: (line: LineSegment) => void;
}

const HorizontalLineDimensions: React.FC<HorizontalLineDimensionsProps> = ({
  selectedLine,
  allLines,
  moduleHeight,
  toSvgX,
  toSvgY,
  onUpdateLine
}) => {
  const currentY = (selectedLine.y1 + selectedLine.y2) / 2;
  const minX = Math.min(selectedLine.x1, selectedLine.x2);
  const maxX = Math.max(selectedLine.x1, selectedLine.x2);
  const midX = (minX + maxX) / 2;

  // Find boundaries above and below
  let topY = moduleHeight;
  let bottomY = 0;

  for (const l of allLines) {
    if (l.id === selectedLine.id) continue;
    const isOtherHoriz = Math.abs(l.y1 - l.y2) <= 2;
    if (!isOtherHoriz) continue;

    // Overlap check on X axis to make sure the transom is between or touching these lines
    const oMinX = Math.min(l.x1, l.x2);
    const oMaxX = Math.max(l.x1, l.x2);
    const hasOverlap = Math.max(minX, oMinX) < Math.min(maxX, oMaxX) + 10;
    if (!hasOverlap) continue;

    const otherY = (l.y1 + l.y2) / 2;
    if (otherY > currentY + 5 && otherY < topY) {
      topY = otherY;
    }
    if (otherY < currentY - 5 && otherY > bottomY) {
      bottomY = otherY;
    }
  }

  const distTop = Math.round(topY - currentY);
  const distBottom = Math.round(currentY - bottomY);

  const [topVal, setTopVal] = useState<string>(distTop.toString());
  const [bottomVal, setBottomVal] = useState<string>(distBottom.toString());

  useEffect(() => {
    setTopVal(distTop.toString());
  }, [distTop]);

  useEffect(() => {
    setBottomVal(distBottom.toString());
  }, [distBottom]);

  const handleApplyTop = (newDist: number) => {
    if (isNaN(newDist) || newDist <= 20) return;
    const targetY = topY - newDist;
    if (targetY <= bottomY + 20) return;
    onUpdateLine({
      ...selectedLine,
      y1: targetY,
      y2: targetY
    });
  };

  const handleApplyBottom = (newDist: number) => {
    if (isNaN(newDist) || newDist <= 20) return;
    const targetY = bottomY + newDist;
    if (targetY >= topY - 20) return;
    onUpdateLine({
      ...selectedLine,
      y1: targetY,
      y2: targetY
    });
  };

  const screenMidX = toSvgX(midX);
  const screenTopMidY = toSvgY((currentY + topY) / 2);
  const screenBottomMidY = toSvgY((currentY + bottomY) / 2);

  return (
    <>
      {/* Top Distance Input */}
      {distTop > 30 && (
        <div
          className="absolute z-20 -translate-x-1/2 -translate-y-1/2 flex items-center bg-white/95 backdrop-blur-xs border border-blue-400 rounded-md shadow-md px-1.5 py-0.5 pointer-events-auto"
          style={{ left: `${screenMidX}px`, top: `${screenTopMidY}px` }}
        >
          <span className="text-[10px] font-semibold text-blue-600 mr-1 select-none">↑ Верх:</span>
          <input
            type="number"
            value={topVal}
            onChange={(e) => setTopVal(e.target.value)}
            onFocus={(e) => e.target.select()}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleApplyTop(parseFloat(topVal));
                e.currentTarget.blur();
              } else if (e.key === 'Escape') {
                setTopVal(distTop.toString());
                e.currentTarget.blur();
              }
            }}
            onBlur={() => handleApplyTop(parseFloat(topVal))}
            className="w-14 text-xs font-mono font-bold text-slate-800 bg-slate-50 border border-slate-300 rounded px-1 py-0.5 text-center focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
          />
          <span className="text-[9px] text-slate-400 ml-1 select-none">мм</span>
        </div>
      )}

      {/* Bottom Distance Input */}
      {distBottom > 30 && (
        <div
          className="absolute z-20 -translate-x-1/2 -translate-y-1/2 flex items-center bg-white/95 backdrop-blur-xs border border-blue-400 rounded-md shadow-md px-1.5 py-0.5 pointer-events-auto"
          style={{ left: `${screenMidX}px`, top: `${screenBottomMidY}px` }}
        >
          <span className="text-[10px] font-semibold text-blue-600 mr-1 select-none">↓ Низ:</span>
          <input
            type="number"
            value={bottomVal}
            onChange={(e) => setBottomVal(e.target.value)}
            onFocus={(e) => e.target.select()}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleApplyBottom(parseFloat(bottomVal));
                e.currentTarget.blur();
              } else if (e.key === 'Escape') {
                setBottomVal(distBottom.toString());
                e.currentTarget.blur();
              }
            }}
            onBlur={() => handleApplyBottom(parseFloat(bottomVal))}
            className="w-14 text-xs font-mono font-bold text-slate-800 bg-slate-50 border border-slate-300 rounded px-1 py-0.5 text-center focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
          />
          <span className="text-[9px] text-slate-400 ml-1 select-none">мм</span>
        </div>
      )}
    </>
  );
};

// ----------------------------------------------------
// VERTICAL LINE (СТОЙКА) OVERLAY INPUTS
// ----------------------------------------------------

interface VerticalLineDimensionsProps {
  selectedLine: LineSegment;
  allLines: LineSegment[];
  moduleWidth: number;
  toSvgX: (x: number) => number;
  toSvgY: (y: number) => number;
  onUpdateLine: (line: LineSegment) => void;
}

const VerticalLineDimensions: React.FC<VerticalLineDimensionsProps> = ({
  selectedLine,
  allLines,
  moduleWidth,
  toSvgX,
  toSvgY,
  onUpdateLine
}) => {
  const currentX = (selectedLine.x1 + selectedLine.x2) / 2;
  const minY = Math.min(selectedLine.y1, selectedLine.y2);
  const maxY = Math.max(selectedLine.y1, selectedLine.y2);
  const midY = (minY + maxY) / 2;

  // Find boundaries to the left and right
  let leftX = 0;
  let rightX = moduleWidth;

  for (const l of allLines) {
    if (l.id === selectedLine.id) continue;
    const isOtherVert = Math.abs(l.x1 - l.x2) <= 2;
    if (!isOtherVert) continue;

    const oMinY = Math.min(l.y1, l.y2);
    const oMaxY = Math.max(l.y1, l.y2);
    const hasOverlap = Math.max(minY, oMinY) < Math.min(maxY, oMaxY) + 10;
    if (!hasOverlap) continue;

    const otherX = (l.x1 + l.x2) / 2;
    if (otherX < currentX - 5 && otherX > leftX) {
      leftX = otherX;
    }
    if (otherX > currentX + 5 && otherX < rightX) {
      rightX = otherX;
    }
  }

  const distLeft = Math.round(currentX - leftX);
  const distRight = Math.round(rightX - currentX);

  const [leftVal, setLeftVal] = useState<string>(distLeft.toString());
  const [rightVal, setRightVal] = useState<string>(distRight.toString());

  useEffect(() => {
    setLeftVal(distLeft.toString());
  }, [distLeft]);

  useEffect(() => {
    setRightVal(distRight.toString());
  }, [distRight]);

  const handleApplyLeft = (newDist: number) => {
    if (isNaN(newDist) || newDist <= 20) return;
    const targetX = leftX + newDist;
    if (targetX >= rightX - 20) return;
    onUpdateLine({
      ...selectedLine,
      x1: targetX,
      x2: targetX
    });
  };

  const handleApplyRight = (newDist: number) => {
    if (isNaN(newDist) || newDist <= 20) return;
    const targetX = rightX - newDist;
    if (targetX <= leftX + 20) return;
    onUpdateLine({
      ...selectedLine,
      x1: targetX,
      x2: targetX
    });
  };

  const screenMidY = toSvgY(midY);
  const screenLeftMidX = toSvgX((leftX + currentX) / 2);
  const screenRightMidX = toSvgX((currentX + rightX) / 2);

  return (
    <>
      {/* Left Distance Input */}
      {distLeft > 30 && (
        <div
          className="absolute z-20 -translate-x-1/2 -translate-y-1/2 flex items-center bg-white/95 backdrop-blur-xs border border-blue-400 rounded-md shadow-md px-1.5 py-0.5 pointer-events-auto"
          style={{ left: `${screenLeftMidX}px`, top: `${screenMidY}px` }}
        >
          <span className="text-[10px] font-semibold text-blue-600 mr-1 select-none">← Лево:</span>
          <input
            type="number"
            value={leftVal}
            onChange={(e) => setLeftVal(e.target.value)}
            onFocus={(e) => e.target.select()}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleApplyLeft(parseFloat(leftVal));
                e.currentTarget.blur();
              } else if (e.key === 'Escape') {
                setLeftVal(distLeft.toString());
                e.currentTarget.blur();
              }
            }}
            onBlur={() => handleApplyLeft(parseFloat(leftVal))}
            className="w-14 text-xs font-mono font-bold text-slate-800 bg-slate-50 border border-slate-300 rounded px-1 py-0.5 text-center focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
          />
          <span className="text-[9px] text-slate-400 ml-1 select-none">мм</span>
        </div>
      )}

      {/* Right Distance Input */}
      {distRight > 30 && (
        <div
          className="absolute z-20 -translate-x-1/2 -translate-y-1/2 flex items-center bg-white/95 backdrop-blur-xs border border-blue-400 rounded-md shadow-md px-1.5 py-0.5 pointer-events-auto"
          style={{ left: `${screenRightMidX}px`, top: `${screenMidY}px` }}
        >
          <span className="text-[10px] font-semibold text-blue-600 mr-1 select-none">→ Право:</span>
          <input
            type="number"
            value={rightVal}
            onChange={(e) => setRightVal(e.target.value)}
            onFocus={(e) => e.target.select()}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleApplyRight(parseFloat(rightVal));
                e.currentTarget.blur();
              } else if (e.key === 'Escape') {
                setRightVal(distRight.toString());
                e.currentTarget.blur();
              }
            }}
            onBlur={() => handleApplyRight(parseFloat(rightVal))}
            className="w-14 text-xs font-mono font-bold text-slate-800 bg-slate-50 border border-slate-300 rounded px-1 py-0.5 text-center focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white"
          />
          <span className="text-[9px] text-slate-400 ml-1 select-none">мм</span>
        </div>
      )}
    </>
  );
};

