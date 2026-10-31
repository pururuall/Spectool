import React, { useRef, useState, useEffect } from 'react';
import { ModuleModel, LineSegment } from '../types';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  PenTool,
  MousePointer,
  Magnet,
  Trash2,
  Check,
  X,
  PlusSquare,
  LayoutGrid
} from 'lucide-react';

function distToSegmentMm(px: number, py: number, x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.hypot(px - x1, py - y1);
  let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

interface CanvasProps {
  module: ModuleModel;
  selectedLineId: string | null;
  selectedCellId: string | null;
  width?: number;
  onSelectLine: (id: string | null) => void;
  onSelectCell: (id: string | null) => void;
  onAddLine: (line: LineSegment) => void;
  onUpdateLine: (line: LineSegment) => void;
  onDeleteLine: (lineId: string) => void;
  onClearCanvas: () => void;
  onAddBoxContour: (w: number, h: number) => void;
  onDetectCells?: () => void;
}

export const Canvas: React.FC<CanvasProps> = ({
  module,
  selectedLineId,
  selectedCellId,
  width = 490,
  onSelectLine,
  onSelectCell,
  onAddLine,
  onUpdateLine,
  onDeleteLine,
  onClearCanvas,
  onAddBoxContour,
  onDetectCells
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const linesRef = useRef<LineSegment[]>(module.lines);
  linesRef.current = module.lines;

  const [zoom, setZoom] = useState(1);
  const [tool, setTool] = useState<'line' | 'select'>('select');
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [orthoMode, setOrthoMode] = useState(false);
  const [hoveredLineId, setHoveredLineId] = useState<string | null>(null);
  const [hoveredCellId, setHoveredCellId] = useState<string | null>(null);

  // Drawing state (Point 1 -> Mouse Point 2)
  const [drawingStart, setDrawingStart] = useState<{ x: number; y: number } | null>(null);
  const [currentMouse, setCurrentMouse] = useState<{ x: number; y: number } | null>(null);
  const [snapInfo, setSnapInfo] = useState<string | null>(null);

  // Keyboard dimension entry while drawing (SolidWorks / CAD style)
  const [typedDistance, setTypedDistance] = useState<string>('');

  // Dragging an endpoint handle of an existing line
  const [draggingHandle, setDraggingHandle] = useState<{
    lineId: string;
    endpoint: 1 | 2;
  } | null>(null);

  // Inline editing of a line's length directly on canvas
  const [inlineEditingLineId, setInlineEditingLineId] = useState<string | null>(null);
  const [inlineEditValue, setInlineEditValue] = useState<string>('');

  // Scale & bounds
  const maxDim = Math.max(module.width, module.height, 1200);
  const baseScale = 380 / maxDim;
  const scale = baseScale * zoom;

  const svgWidth = Math.max(module.width * scale + 140, 480);
  const svgHeight = Math.max(module.height * scale + 140, 420);

  const toSvgX = (mmX: number) => 60 + mmX * scale;
  const toSvgY = (mmY: number) => svgHeight - 60 - mmY * scale;

  const fromSvgX = (svgX: number) => (svgX - 60) / scale;
  const fromSvgY = (svgY: number) => (svgHeight - 60 - svgY) / scale;

  // Active selected elements
  const selectedLine = module.lines.find((l) => l.id === selectedLineId) || null;
  const selectedCell = module.cells.find((c) => c.id === selectedCellId) || null;

  // Snapping logic: Magnetic Endpoint Snap + Magnetic Line Body Snap (Vertical & Horizontal lines)
  const snapCoords = (
    xMm: number,
    yMm: number
  ): { pt: { x: number; y: number }; label: string | null } => {
    let finalX = xMm;
    let finalY = yMm;
    let label: string | null = null;

    // 1. Magnetic ENDPOINT snap to existing lines (within 22px)
    for (const l of linesRef.current) {
      if (draggingHandle && draggingHandle.lineId === l.id) continue;
      const d1 = Math.hypot(xMm - l.x1, yMm - l.y1);
      if (d1 * scale < 22) {
        return { pt: { x: l.x1, y: l.y1 }, label: `Точка (${l.x1}, ${l.y1})` };
      }
      const d2 = Math.hypot(xMm - l.x2, yMm - l.y2);
      if (d2 * scale < 22) {
        return { pt: { x: l.x2, y: l.y2 }, label: `Точка (${l.x2}, ${l.y2})` };
      }
    }

    // 2. Magnetic LINE BODY snap (Vertical & Horizontal lines)
    for (const l of linesRef.current) {
      if (draggingHandle && draggingHandle.lineId === l.id) continue;
      const isVert = Math.abs(l.x1 - l.x2) <= 2;
      const isHoriz = Math.abs(l.y1 - l.y2) <= 2;
      const minY = Math.min(l.y1, l.y2);
      const maxY = Math.max(l.y1, l.y2);
      const minX = Math.min(l.x1, l.x2);
      const maxX = Math.max(l.x1, l.x2);

      if (isVert && yMm >= minY - 20 && yMm <= maxY + 20) {
        if (Math.abs(xMm - l.x1) * scale < 20) {
          finalX = l.x1;
          label = `Стойка X=${l.x1}`;
        }
      } else if (isHoriz && xMm >= minX - 20 && xMm <= maxX + 20) {
        if (Math.abs(yMm - l.y1) * scale < 20) {
          finalY = l.y1;
          label = `Ригель Y=${l.y1}`;
        }
      }
    }

    // 3. Grid Snap (25mm steps) if not snapped to line
    if (snapToGrid) {
      if (finalX === xMm) finalX = Math.round(xMm / 25) * 25;
      if (finalY === yMm) finalY = Math.round(yMm / 25) * 25;
    }

    return { pt: { x: finalX, y: finalY }, label };
  };

  // Convert raw mouse coordinates to snapped MM coordinates
  const getMouseMm = (
    clientX: number,
    clientY: number
  ): { pt: { x: number; y: number }; label: string | null } => {
    if (!svgRef.current) return { pt: { x: 0, y: 0 }, label: null };
    const rect = svgRef.current.getBoundingClientRect();
    const rawSvgX = clientX - rect.left;
    const rawSvgY = clientY - rect.top;
    let mmX = fromSvgX(rawSvgX);
    let mmY = fromSvgY(rawSvgY);

    if (orthoMode && drawingStart) {
      const dx = Math.abs(mmX - drawingStart.x);
      const dy = Math.abs(mmY - drawingStart.y);
      if (dx > dy) mmY = drawingStart.y;
      else mmX = drawingStart.x;
    }

    return snapCoords(mmX, mmY);
  };

  // 1. KEYBOARD LISTENERS: ESCAPE to cancel, and NUMERIC INPUT while drawing line (SolidWorks style)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ESCAPE: cancel current line drawing or deselect
      if (e.key === 'Escape') {
        if (drawingStart) {
          setDrawingStart(null);
          setCurrentMouse(null);
          setTypedDistance('');
          setSnapInfo(null);
        } else if (selectedLineId) {
          onSelectLine(null);
        } else if (selectedCellId) {
          onSelectCell(null);
        }
        return;
      }

      // Hotkey L: Line Tool, Hotkey V: Select Tool
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === 'l' || e.key === 'L' || e.key === 'д' || e.key === 'Д') {
        setTool('line');
        setDrawingStart(null);
        return;
      }
      if (e.key === 'v' || e.key === 'V' || e.key === 'м' || e.key === 'М') {
        setTool('select');
        setDrawingStart(null);
        return;
      }

      // If user is actively drawing (1st point set) and types numbers
      if (drawingStart && currentMouse) {
        if (/^[0-9]$/.test(e.key)) {
          setTypedDistance((prev) => prev + e.key);
        } else if (e.key === 'Backspace') {
          setTypedDistance((prev) => prev.slice(0, -1));
        } else if (e.key === 'Enter') {
          const reqDist = parseFloat(typedDistance);
          if (reqDist > 0) {
            // Build line with exact distance in direction of cursor
            const dx = currentMouse.x - drawingStart.x;
            const dy = currentMouse.y - drawingStart.y;
            const curDist = Math.hypot(dx, dy);

            let endX = drawingStart.x + reqDist;
            let endY = drawingStart.y;

            if (curDist > 0) {
              endX = Math.round(drawingStart.x + (dx / curDist) * reqDist);
              endY = Math.round(drawingStart.y + (dy / curDist) * reqDist);
            }

            const newLineId = `line-${Date.now()}`;
            const isHoriz = Math.abs(endY - drawingStart.y) <= 15;
            const newLine: LineSegment = {
              id: newLineId,
              name: isHoriz ? `Ригель (L=${reqDist})` : `Стойка (L=${reqDist})`,
              x1: drawingStart.x,
              y1: drawingStart.y,
              x2: endX,
              y2: endY,
              length: reqDist,
              profileBindings: []
            };

            onAddLine(newLine);
            onSelectLine(newLineId);
            setDrawingStart(null);
            setCurrentMouse(null);
            setTypedDistance('');
            setSnapInfo(null);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [drawingStart, currentMouse, typedDistance, selectedLineId, selectedCellId]);

  // 2. WINDOW LISTENERS FOR DRAGGING ENDPOINTS
  useEffect(() => {
    if (!draggingHandle) return;

    const handleWindowMouseMove = (e: MouseEvent) => {
      const { pt } = getMouseMm(e.clientX, e.clientY);
      const targetLine = linesRef.current.find((l) => l.id === draggingHandle.lineId);
      if (targetLine) {
        let newX1 = targetLine.x1;
        let newY1 = targetLine.y1;
        let newX2 = targetLine.x2;
        let newY2 = targetLine.y2;

        if (draggingHandle.endpoint === 1) {
          newX1 = pt.x;
          newY1 = pt.y;
          if (orthoMode) {
            if (Math.abs(newX1 - newX2) < Math.abs(newY1 - newY2)) newX1 = newX2;
            else newY1 = newY2;
          }
        } else {
          newX2 = pt.x;
          newY2 = pt.y;
          if (orthoMode) {
            if (Math.abs(newX2 - newX1) < Math.abs(newY2 - newY1)) newX2 = newX1;
            else newY2 = newY1;
          }
        }

        const newLen = Math.round(Math.hypot(newX2 - newX1, newY2 - newY1));
        onUpdateLine({
          ...targetLine,
          x1: newX1,
          y1: newY1,
          x2: newX2,
          y2: newY2,
          length: newLen
        });
      }
    };

    const handleWindowMouseUp = () => {
      setDraggingHandle(null);
    };

    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
    };
  }, [draggingHandle, orthoMode]);

  // Canvas Mouse Down (Start or Finish Line, or Direct Selection)
  const handleSvgMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (draggingHandle) return;

    if (tool === 'line') {
      const { pt } = getMouseMm(e.clientX, e.clientY);
      if (!drawingStart) {
        // Point 1
        setDrawingStart(pt);
        setCurrentMouse(pt);
        setTypedDistance('');
      } else {
        // Point 2
        let endX = pt.x;
        let endY = pt.y;
        if (orthoMode) {
          const dx = Math.abs(endX - drawingStart.x);
          const dy = Math.abs(endY - drawingStart.y);
          if (dx > dy) {
            endY = drawingStart.y;
          } else {
            endX = drawingStart.x;
          }
        } else {
          if (Math.abs(endY - drawingStart.y) <= 15) {
            endY = drawingStart.y;
          } else if (Math.abs(endX - drawingStart.x) <= 15) {
            endX = drawingStart.x;
          }
        }

        const len = Math.round(Math.hypot(endX - drawingStart.x, endY - drawingStart.y));
        if (len >= 20) {
          const newLineId = `line-${Date.now()}`;
          const isHoriz = Math.abs(endY - drawingStart.y) <= 10;
          const newLine: LineSegment = {
            id: newLineId,
            name: isHoriz ? `Ригель (L=${len})` : `Стойка (L=${len})`,
            x1: drawingStart.x,
            y1: drawingStart.y,
            x2: endX,
            y2: endY,
            length: len,
            profileBindings: []
          };
          onAddLine(newLine);
          onSelectLine(newLineId);
        }
        setDrawingStart(null);
        setCurrentMouse(null);
        setTypedDistance('');
        setSnapInfo(null);
      }
    } else {
      // In Select mode: Precise mathematical proximity check
      if (svgRef.current) {
        const rect = svgRef.current.getBoundingClientRect();
        const mouseMmX = fromSvgX(e.clientX - rect.left);
        const mouseMmY = fromSvgY(e.clientY - rect.top);

        let closestLine: LineSegment | null = null;
        let minDistanceMm = Infinity;

        for (const line of linesRef.current) {
          const d = distToSegmentMm(mouseMmX, mouseMmY, line.x1, line.y1, line.x2, line.y2);
          if (d < minDistanceMm) {
            minDistanceMm = d;
            closestLine = line;
          }
        }

        // 18px proximity: click within 18px of the line selects it
        if (closestLine && minDistanceMm * scale < 18) {
          onSelectLine(closestLine.id);
          onSelectCell(null);
          return;
        }

        // Check cells (glass fields / spandrels)
        for (const cell of module.cells) {
          if (
            mouseMmX >= cell.x &&
            mouseMmX <= cell.x + cell.width &&
            mouseMmY >= cell.y &&
            mouseMmY <= cell.y + cell.height
          ) {
            onSelectCell(cell.id);
            onSelectLine(null);
            return;
          }
        }

        // Clicking empty space cleanly deselects without forcing closest line
        onSelectLine(null);
        onSelectCell(null);
      }
    }
  };

  const handleSvgMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const { pt, label } = getMouseMm(e.clientX, e.clientY);
    setCurrentMouse(pt);
    setSnapInfo(label);
  };

  // Change length of line inline
  const commitInlineLength = (line: LineSegment) => {
    const val = parseFloat(inlineEditValue);
    if (val > 0) {
      const dx = line.x2 - line.x1;
      const dy = line.y2 - line.y1;
      const cur = Math.hypot(dx, dy);
      const ratio = cur > 0 ? val / cur : 1;
      onUpdateLine({
        ...line,
        x2: Math.round(line.x1 + dx * ratio),
        y2: Math.round(line.y1 + dy * ratio),
        length: val
      });
    }
    setInlineEditingLineId(null);
  };

  return (
    <div
      style={{ width: `${width}px` }}
      className="bg-white border border-slate-200 rounded-xl flex flex-col shadow-xs overflow-hidden select-none shrink-0"
    >
      {/* CAD Toolbar */}
      <div className="h-10 border-b border-slate-200 px-3 flex items-center justify-between bg-slate-50/90">
        <div className="flex items-center gap-1.5">
          {/* Tool: Draw Line */}
          <button
            onClick={() => {
              setTool('line');
              setDrawingStart(null);
            }}
            className={`px-2.5 py-1 text-xs rounded font-medium transition flex items-center gap-1.5 ${
              tool === 'line'
                ? 'bg-blue-600 text-white shadow-xs font-bold'
                : 'text-slate-700 hover:bg-slate-200'
            }`}
            title="Чертить линию по точкам (L). Нажмите ESC для отмены."
          >
            <PenTool className="w-3.5 h-3.5" />
            Чертить (L)
          </button>

          {/* Tool: Select */}
          <button
            onClick={() => {
              setTool('select');
              setDrawingStart(null);
            }}
            className={`px-2.5 py-1 text-xs rounded font-medium transition flex items-center gap-1.5 ${
              tool === 'select'
                ? 'bg-blue-600 text-white shadow-xs font-bold'
                : 'text-slate-700 hover:bg-slate-200'
            }`}
            title="Выбор линий и перетаскивание точек (V)"
          >
            <MousePointer className="w-3.5 h-3.5" />
            Выбор (V)
          </button>

          <div className="h-4 w-px bg-slate-300 mx-1"></div>

          {/* Snap toggle */}
          <button
            onClick={() => setSnapToGrid(!snapToGrid)}
            className={`p-1 rounded text-xs transition ${
              snapToGrid ? 'bg-blue-100 text-blue-700 font-bold' : 'text-slate-400 hover:text-slate-700'
            }`}
            title="Привязка к сетке (25 мм) и линиям"
          >
            <Magnet className="w-3.5 h-3.5" />
          </button>

          {/* Ortho toggle */}
          <button
            onClick={() => setOrthoMode(!orthoMode)}
            className={`px-1.5 py-0.5 rounded text-[11px] font-mono transition ${
              orthoMode ? 'bg-amber-100 text-amber-800 font-bold' : 'text-slate-400 hover:text-slate-700'
            }`}
            title="Орто режим (строго горизонтально / вертикально)"
          >
            ORTHO
          </button>
        </div>

        {/* Clear & Contour & Cells detection */}
        <div className="flex items-center gap-1">
          {onDetectCells && (
            <button
              onClick={onDetectCells}
              className="px-2 py-0.5 text-[11px] text-emerald-700 hover:bg-emerald-50 rounded border border-emerald-300 font-semibold transition flex items-center gap-1 shadow-2xs"
              title="Найти замкнутые контуры между линиями и создать области для заполнений"
            >
              <LayoutGrid className="w-3 h-3 text-emerald-600" />
              Найти области
            </button>
          )}

          <button
            onClick={() => onAddBoxContour(module.width, module.height)}
            className="px-2 py-0.5 text-[11px] text-blue-700 hover:bg-blue-50 rounded border border-blue-200 font-medium transition flex items-center gap-1"
            title="Быстро начертить наружный контур модуля"
          >
            <PlusSquare className="w-3 h-3" />
            + Контур
          </button>

          <button
            onClick={onClearCanvas}
            className="px-2 py-0.5 text-[11px] text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded border border-rose-200 font-medium transition flex items-center gap-1"
            title="Очистить холст полностью (удалить все линии)"
          >
            <Trash2 className="w-3 h-3" />
            Очистить
          </button>

          <div className="h-4 w-px bg-slate-300 mx-0.5"></div>

          <button
            onClick={() => setZoom((z) => Math.min(2.5, z + 0.15))}
            className="p-1 text-slate-500 hover:text-slate-900 rounded hover:bg-slate-200"
            title="Приблизить"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(0.4, z - 0.15))}
            className="p-1 text-slate-500 hover:text-slate-900 rounded hover:bg-slate-200"
            title="Отдалить"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoom(1)}
            className="p-1 text-slate-500 hover:text-slate-900 rounded hover:bg-slate-200"
            title="Сброс масштаба"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Main CAD Viewport */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto flex items-center justify-center p-3 relative bg-slate-100/70"
        style={{
          backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}
      >
        <svg
          ref={svgRef}
          width={svgWidth}
          height={svgHeight}
          className={`overflow-visible bg-white shadow-sm border border-slate-300 rounded ${
            tool === 'line' ? 'cursor-crosshair' : 'cursor-default'
          }`}
          onMouseDown={handleSvgMouseDown}
          onMouseMove={handleSvgMouseMove}
        >
          {/* 1. CELLS / FIELDS (GLASS / SPANDRELS) */}
          {module.cells.map((cell) => {
            const x = toSvgX(cell.x);
            const y = toSvgY(cell.y + cell.height);
            const w = cell.width * scale;
            const h = cell.height * scale;
            const isSelected = selectedCellId === cell.id;
            const isHovered = hoveredCellId === cell.id;

            const handleCellInteraction = (e: React.MouseEvent) => {
              if (tool === 'select') {
                e.stopPropagation();
                onSelectCell(cell.id);
                onSelectLine(null);
              }
            };

            return (
              <g
                key={cell.id}
                onMouseEnter={() => setHoveredCellId(cell.id)}
                onMouseLeave={() => setHoveredCellId((cur) => (cur === cell.id ? null : cur))}
                onMouseDown={handleCellInteraction}
                onClick={handleCellInteraction}
                className={tool === 'select' ? 'cursor-pointer' : 'cursor-crosshair'}
              >
                <rect
                  x={x}
                  y={y}
                  width={Math.max(5, w)}
                  height={Math.max(5, h)}
                  fill={cell.fillType === 'glass' ? '#e0f2fe' : '#fef3c7'}
                  fillOpacity={isSelected ? 0.75 : isHovered ? 0.6 : 0.45}
                  stroke={isSelected ? '#0284c7' : isHovered ? '#38bdf8' : '#94a3b8'}
                  strokeWidth={isSelected ? 2.5 : isHovered ? 1.5 : 1}
                />
                <g transform={`translate(${x + w / 2}, ${y + h / 2})`} style={{ pointerEvents: 'none' }}>
                  <rect
                    x="-40"
                    y="-12"
                    width="80"
                    height="24"
                    rx="4"
                    fill="white"
                    stroke={isSelected ? '#0284c7' : '#cbd5e1'}
                    strokeWidth={isSelected ? 2 : 1}
                  />
                  <text
                    textAnchor="middle"
                    dy="4"
                    fill={isSelected ? '#0369a1' : '#334155'}
                    fontSize="9"
                    fontFamily="JetBrains Mono"
                    fontWeight="bold"
                    style={{ pointerEvents: 'none' }}
                  >
                    {cell.mark || cell.name}
                  </text>
                </g>
              </g>
            );
          })}

          {/* 2. DRAWN LINE SEGMENTS */}
          {module.lines.map((line) => {
            const x1 = toSvgX(line.x1);
            const y1 = toSvgY(line.y1);
            const x2 = toSvgX(line.x2);
            const y2 = toSvgY(line.y2);
            const isSelected = selectedLineId === line.id;
            const isHovered = hoveredLineId === line.id;
            const midX = (x1 + x2) / 2;
            const midY = (y1 + y2) / 2;

            const handleSelectThisLine = (e: React.MouseEvent) => {
              if (tool !== 'select') return;
              e.stopPropagation();
              onSelectLine(line.id);
              onSelectCell(null);
            };

            return (
              <g
                key={line.id}
                onMouseEnter={() => setHoveredLineId(line.id)}
                onMouseLeave={() => setHoveredLineId((cur) => (cur === line.id ? null : cur))}
                onMouseDown={tool === 'select' ? handleSelectThisLine : undefined}
                onClick={tool === 'select' ? handleSelectThisLine : undefined}
                style={{ cursor: tool === 'select' ? 'pointer' : 'crosshair', pointerEvents: tool === 'select' ? 'auto' : 'none' }}
                className="group"
              >
                {/* 16px wide clean hit-target (TRANSPARENT, no halo bleeding into other lines, butt cap) */}
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="transparent"
                  strokeWidth="16"
                  strokeLinecap="butt"
                  style={{ cursor: tool === 'select' ? 'pointer' : 'crosshair', pointerEvents: tool === 'select' ? 'auto' : 'none' }}
                  onMouseDown={tool === 'select' ? handleSelectThisLine : undefined}
                  onClick={tool === 'select' ? handleSelectThisLine : undefined}
                />

                {/* Hover Aura (Instant visual confirmation when hovering over any line) */}
                {isHovered && !isSelected && (
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="#3b82f6"
                    strokeWidth="8"
                    strokeOpacity="0.35"
                    strokeLinecap="round"
                    style={{ pointerEvents: 'none' }}
                  />
                )}

                {/* Selection Glow */}
                {isSelected && (
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="#2563eb"
                    strokeWidth="9"
                    strokeOpacity="0.4"
                    strokeLinecap="round"
                    style={{ pointerEvents: 'none' }}
                  />
                )}

                {/* Visible Line - Clickable */}
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={isSelected ? '#2563eb' : isHovered ? '#3b82f6' : '#0f172a'}
                  strokeWidth={isSelected ? 4 : isHovered ? 3.5 : 2.5}
                  className="transition-colors"
                  style={{ cursor: tool === 'select' ? 'pointer' : 'crosshair', pointerEvents: tool === 'select' ? 'stroke' : 'none' }}
                  onMouseDown={tool === 'select' ? handleSelectThisLine : undefined}
                  onClick={tool === 'select' ? handleSelectThisLine : undefined}
                />

                {/* Dimension Tag on the line (Click to select, double click to edit!) */}
                <g
                  transform={`translate(${midX}, ${midY})`}
                  cursor={tool === 'select' ? 'pointer' : 'crosshair'}
                  onMouseDown={tool === 'select' ? handleSelectThisLine : undefined}
                  onClick={tool === 'select' ? handleSelectThisLine : undefined}
                  onDoubleClick={(e) => {
                    if (tool !== 'select') return;
                    e.stopPropagation();
                    setInlineEditingLineId(line.id);
                    setInlineEditValue(line.length.toString());
                  }}
                  className="cursor-pointer"
                  style={{ pointerEvents: tool === 'select' ? 'auto' : 'none' }}
                >
                  <rect
                    x="-28"
                    y="-10"
                    width="56"
                    height="20"
                    rx="4"
                    fill={isSelected ? '#2563eb' : isHovered ? '#eff6ff' : '#ffffff'}
                    stroke={isSelected ? '#1d4ed8' : isHovered ? '#3b82f6' : '#94a3b8'}
                    strokeWidth={isSelected || isHovered ? 2 : 1.5}
                    style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))' }}
                  />
                  <text
                    textAnchor="middle"
                    dy="4"
                    fill={isSelected ? '#ffffff' : isHovered ? '#1d4ed8' : '#0f172a'}
                    fontSize="9.5"
                    fontFamily="JetBrains Mono"
                    fontWeight="bold"
                    style={{ pointerEvents: 'none' }}
                  >
                    {line.length}
                  </text>
                </g>

                {/* Endpoint Draggable Handles (only in select mode) */}
                {isSelected && tool === 'select' && (
                  <>
                    {/* Point 1 handle */}
                    <circle
                      cx={x1}
                      cy={y1}
                      r="7"
                      fill="#2563eb"
                      stroke="#ffffff"
                      strokeWidth="2.5"
                      style={{ cursor: 'move', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onSelectLine(line.id);
                        setDraggingHandle({ lineId: line.id, endpoint: 1 });
                      }}
                    />
                    {/* Point 2 handle */}
                    <circle
                      cx={x2}
                      cy={y2}
                      r="7"
                      fill="#2563eb"
                      stroke="#ffffff"
                      strokeWidth="2.5"
                      style={{ cursor: 'move', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onSelectLine(line.id);
                        setDraggingHandle({ lineId: line.id, endpoint: 2 });
                      }}
                    />
                  </>
                )}
              </g>
            );
          })}

          {/* 3. DYNAMIC RUBBER-BAND LINE WHILE DRAWING */}
          {drawingStart && currentMouse && (
            <g style={{ pointerEvents: 'none' }}>
              <line
                x1={toSvgX(drawingStart.x)}
                y1={toSvgY(drawingStart.y)}
                x2={toSvgX(currentMouse.x)}
                y2={toSvgY(currentMouse.y)}
                stroke="#2563eb"
                strokeWidth="2.5"
                strokeDasharray="6 3"
                style={{ pointerEvents: 'none' }}
              />
              <circle cx={toSvgX(drawingStart.x)} cy={toSvgY(drawingStart.y)} r="6" fill="#2563eb" style={{ pointerEvents: 'none' }} />
              <circle cx={toSvgX(currentMouse.x)} cy={toSvgY(currentMouse.y)} r="6" fill="#2563eb" style={{ pointerEvents: 'none' }} />

              {/* SolidWorks style dynamic dimension readout + typed input badge */}
              <g
                transform={`translate(${
                  (toSvgX(drawingStart.x) + toSvgX(currentMouse.x)) / 2
                }, ${
                  (toSvgY(drawingStart.y) + toSvgY(currentMouse.y)) / 2 - 18
                })`}
                style={{ pointerEvents: 'none' }}
              >
                <rect
                  x="-46"
                  y="-11"
                  width="92"
                  height="22"
                  rx="4"
                  fill="#0f172a"
                  stroke={typedDistance ? '#38bdf8' : '#334155'}
                  strokeWidth="1.5"
                  style={{ pointerEvents: 'none' }}
                />
                <text
                  textAnchor="middle"
                  dy="4.5"
                  fill="#ffffff"
                  fontSize="10"
                  fontFamily="JetBrains Mono"
                  fontWeight="bold"
                  style={{ pointerEvents: 'none' }}
                >
                  {typedDistance
                    ? `${typedDistance} мм ↵`
                    : `${Math.round(
                        Math.hypot(currentMouse.x - drawingStart.x, currentMouse.y - drawingStart.y)
                      )} мм`}
                </text>
              </g>
            </g>
          )}

          {/* Magnetic snap indicator */}
          {currentMouse && (
            <g style={{ pointerEvents: 'none' }}>
              <circle
                cx={toSvgX(currentMouse.x)}
                cy={toSvgY(currentMouse.y)}
                r="6"
                fill="none"
                stroke="#0284c7"
                strokeWidth="2.5"
                style={{ pointerEvents: 'none' }}
              />
              {snapInfo && (
                <g
                  transform={`translate(${toSvgX(currentMouse.x) + 12}, ${toSvgY(currentMouse.y) - 10})`}
                  style={{ pointerEvents: 'none' }}
                >
                  <rect
                    x="0"
                    y="-12"
                    width={snapInfo.length * 6.5 + 12}
                    height="18"
                    rx="3"
                    fill="#0284c7"
                    style={{ pointerEvents: 'none' }}
                  />
                  <text
                    x="6"
                    dy="1"
                    fill="#ffffff"
                    fontSize="9"
                    fontFamily="JetBrains Mono"
                    fontWeight="bold"
                    style={{ pointerEvents: 'none' }}
                  >
                    {snapInfo}
                  </text>
                </g>
              )}
            </g>
          )}
        </svg>
      </div>

      {/* Bottom CAD Info Bar */}
      <div className="p-2 border-t border-slate-200 bg-white flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          {selectedLine ? (
            <span className="text-[11px] font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-bold flex items-center gap-1.5 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
              Выбрана: {selectedLine.name} ({selectedLine.length} мм) | Точки: ({selectedLine.x1}, {selectedLine.y1}) → ({selectedLine.x2}, {selectedLine.y2})
            </span>
          ) : selectedCell ? (
            <span className="text-[11px] font-mono text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200 font-bold">
              Выбрано: {selectedCell.mark || selectedCell.name} ({selectedCell.glassWidth || selectedCell.width}×{selectedCell.glassHeight || selectedCell.height} мм)
            </span>
          ) : (
            <span className="text-[11px] text-slate-500 font-mono">
              {tool === 'line'
                ? drawingStart
                  ? 'Кликните точку 2 или наберите длину + Enter (ESC для отмены)'
                  : 'Кликните в любом месте или на линии, чтобы начать чертить'
                : 'Кликните на любую нарисованную линию слева, чтобы выбрать её и открыть параметры'}
            </span>
          )}
        </div>

        {currentMouse && (
          <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
            X: {Math.round(currentMouse.x)} Y: {Math.round(currentMouse.y)}
          </span>
        )}
      </div>
    </div>
  );
};
