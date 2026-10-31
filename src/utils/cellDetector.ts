import { LineSegment, Cell } from '../types';

/**
 * Clusters nearby numeric values within tolerance (e.g. 20mm) to eliminate near-duplicate coordinates.
 */
function clusterCoordinates(values: number[], tolerance = 25): number[] {
  if (values.length === 0) return [];
  const sorted = [...values].sort((a, b) => a - b);
  const result: number[] = [];

  let currentCluster: number[] = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const val = sorted[i];
    const prev = sorted[i - 1];
    if (val - prev <= tolerance) {
      currentCluster.push(val);
    } else {
      const avg = Math.round(
        currentCluster.reduce((sum, v) => sum + v, 0) / currentCluster.length
      );
      result.push(avg);
      currentCluster = [val];
    }
  }

  if (currentCluster.length > 0) {
    const avg = Math.round(
      currentCluster.reduce((sum, v) => sum + v, 0) / currentCluster.length
    );
    result.push(avg);
  }

  return result;
}

/**
 * Checks if a target 1D interval [targetMin, targetMax] is continuously covered
 * by a set of overlapping or contiguous segments.
 */
function isIntervalCovered(
  intervals: Array<{ min: number; max: number }>,
  targetMin: number,
  targetMax: number,
  tol = 35
): boolean {
  if (intervals.length === 0) return false;
  const sorted = [...intervals].sort((a, b) => a.min - b.min);

  // Merge overlapping / touching intervals
  const merged: Array<{ min: number; max: number }> = [];
  let cur = { min: sorted[0].min, max: sorted[0].max };

  for (let i = 1; i < sorted.length; i++) {
    const next = sorted[i];
    if (next.min <= cur.max + tol) {
      cur.max = Math.max(cur.max, next.max);
    } else {
      merged.push(cur);
      cur = { min: next.min, max: next.max };
    }
  }
  merged.push(cur);

  // Verify that at least one merged interval spans [targetMin + tol, targetMax - tol]
  return merged.some(
    (m) => m.min <= targetMin + tol && m.max >= targetMax - tol
  );
}

/**
 * Automatically detects ALL closed atomic rectangular cells formed by line segments.
 */
export function detectCellsFromLines(lines: LineSegment[], currentCells: Cell[] = []): Cell[] {
  if (lines.length < 4) return [];

  const tol = 35; // mm tolerance

  interface Segment {
    coord: number; // x for vert, y for horiz
    min: number;   // y min for vert, x min for horiz
    max: number;   // y max for vert, x max for horiz
  }

  const vertSegments: Segment[] = [];
  const horizSegments: Segment[] = [];
  const rawX: number[] = [];
  const rawY: number[] = [];

  for (const l of lines) {
    const dx = Math.abs(l.x2 - l.x1);
    const dy = Math.abs(l.y2 - l.y1);

    if (dy >= dx) {
      // Predominantly Vertical line ( стойка / рама боковая )
      const x = Math.round((l.x1 + l.x2) / 2);
      const minY = Math.min(l.y1, l.y2);
      const maxY = Math.max(l.y1, l.y2);
      if (maxY - minY >= 40) {
        vertSegments.push({ coord: x, min: minY, max: maxY });
        rawX.push(x);
        rawY.push(minY, maxY);
      }
    } else {
      // Predominantly Horizontal line ( ригель / рама горизонтальная )
      const y = Math.round((l.y1 + l.y2) / 2);
      const minX = Math.min(l.x1, l.x2);
      const maxX = Math.max(l.x1, l.x2);
      if (maxX - minX >= 40) {
        horizSegments.push({ coord: y, min: minX, max: maxX });
        rawY.push(y);
        rawX.push(minX, maxX);
      }
    }
  }

  const distinctX = clusterCoordinates(rawX, 25);
  const distinctY = clusterCoordinates(rawY, 25);

  if (distinctX.length < 2 || distinctY.length < 2) {
    return [];
  }

  interface CandidateBox {
    x: number;
    y: number;
    width: number;
    height: number;
  }

  const validBoxes: CandidateBox[] = [];

  // Check all possible rectangle bounds [x1, x2] x [y1, y2]
  for (let i = 0; i < distinctX.length; i++) {
    for (let j = i + 1; j < distinctX.length; j++) {
      const x1 = distinctX[i];
      const x2 = distinctX[j];
      const width = x2 - x1;
      if (width < 60) continue;

      for (let k = 0; k < distinctY.length; k++) {
        for (let m = k + 1; m < distinctY.length; m++) {
          const y1 = distinctY[k];
          const y2 = distinctY[m];
          const height = y2 - y1;
          if (height < 60) continue;

          // 1. Bottom edge: horizontal segments at y ≈ y1 covering [x1, x2]
          const bottomSegs = horizSegments
            .filter((h) => Math.abs(h.coord - y1) <= tol)
            .map((h) => ({ min: h.min, max: h.max }));
          if (!isIntervalCovered(bottomSegs, x1, x2, tol)) continue;

          // 2. Top edge: horizontal segments at y ≈ y2 covering [x1, x2]
          const topSegs = horizSegments
            .filter((h) => Math.abs(h.coord - y2) <= tol)
            .map((h) => ({ min: h.min, max: h.max }));
          if (!isIntervalCovered(topSegs, x1, x2, tol)) continue;

          // 3. Left edge: vertical segments at x ≈ x1 covering [y1, y2]
          const leftSegs = vertSegments
            .filter((v) => Math.abs(v.coord - x1) <= tol)
            .map((v) => ({ min: v.min, max: v.max }));
          if (!isIntervalCovered(leftSegs, y1, y2, tol)) continue;

          // 4. Right edge: vertical segments at x ≈ x2 covering [y1, y2]
          const rightSegs = vertSegments
            .filter((v) => Math.abs(v.coord - x2) <= tol)
            .map((v) => ({ min: v.min, max: v.max }));
          if (!isIntervalCovered(rightSegs, y1, y2, tol)) continue;

          // 5. INTERNAL LINES CHECK: no horizontal or vertical line cuts across the interior!
          const hasInternalVert = vertSegments.some(
            (v) =>
              v.coord > x1 + tol &&
              v.coord < x2 - tol &&
              v.max > y1 + tol &&
              v.min < y2 - tol
          );
          if (hasInternalVert) continue;

          const hasInternalHoriz = horizSegments.some(
            (h) =>
              h.coord > y1 + tol &&
              h.coord < y2 - tol &&
              h.max > x1 + tol &&
              h.min < x2 - tol
          );
          if (hasInternalHoriz) continue;

          // Found a valid atomic rectangular cell!
          validBoxes.push({ x: x1, y: y1, width, height });
        }
      }
    }
  }

  // Sort boxes from top to bottom, left to right
  validBoxes.sort((a, b) => {
    if (Math.abs(b.y - a.y) > 30) return b.y - a.y; // top first
    return a.x - b.x; // left to right
  });

  const detectedCells: Cell[] = [];
  let cellIdx = 1;

  for (const box of validBoxes) {
    const { x, y, width, height } = box;

    // Find if this cell matches an existing cell
    const existing = currentCells.find(
      (c) =>
        Math.abs(c.x - x) <= 40 &&
        Math.abs(c.y - y) <= 40 &&
        Math.abs(c.width - width) <= 50 &&
        Math.abs(c.height - height) <= 50
    );

    if (existing) {
      detectedCells.push({
        ...existing,
        x,
        y,
        width,
        height
      });
    } else {
      detectedCells.push({
        id: `cell-${Date.now()}-${cellIdx}`,
        x,
        y,
        width,
        height,
        fillType: 'glass',
        name: 'Стеклопакет СПО 32мм',
        mark: `СП-${cellIdx}`,
        linkType: 'комплектующие',
        hasMaterial: false,
        material: '',
        materialName: '',
        processTemplate: '',
        planGroup: 'Комплектующие',
        glassWidth: Math.max(0, width - 50),
        glassHeight: Math.max(0, height - 50),
        thickness: 32,
        color: '#e0f2fe',
        dependencies: []
      });
      cellIdx++;
    }
  }

  return detectedCells;
}
