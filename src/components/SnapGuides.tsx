import React from 'react';

interface SnapGuide {
  type: 'horizontal' | 'vertical';
  position: number;
  start: number;
  end: number;
}

export const SnapGuides: React.FC<{ guides: SnapGuide[] }> = ({ guides }) => {
  if (guides.length === 0) return null;

  return (
    <>
      {guides.map((guide, i) => {
        if (guide.type === 'vertical') {
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: guide.position,
                top: guide.start,
                width: 1,
                height: guide.end - guide.start,
                background: '#ff00ff',
                pointerEvents: 'none',
                zIndex: 999999,
              }}
            />
          );
        } else {
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: guide.start,
                top: guide.position,
                width: guide.end - guide.start,
                height: 1,
                background: '#ff00ff',
                pointerEvents: 'none',
                zIndex: 999999,
              }}
            />
          );
        }
      })}
    </>
  );
};

export function calculateSnapGuides(
  movingElement: { x: number; y: number; width: number; height: number },
  otherElements: { x: number; y: number; width: number; height: number }[],
  threshold: number = 5
): { guides: SnapGuide[]; snappedX: number; snappedY: number } {
  const guides: SnapGuide[] = [];
  let snappedX = movingElement.x;
  let snappedY = movingElement.y;

  const movingCenterX = movingElement.x + movingElement.width / 2;
  const movingCenterY = movingElement.y + movingElement.height / 2;
  const movingRight = movingElement.x + movingElement.width;
  const movingBottom = movingElement.y + movingElement.height;

  otherElements.forEach((el) => {
    const elCenterX = el.x + el.width / 2;
    const elCenterY = el.y + el.height / 2;
    const elRight = el.x + el.width;
    const elBottom = el.y + el.height;

    // Vertical guides (X-axis alignment)
    const xAlignments = [
      { moving: movingElement.x, other: el.x }, // Left to left
      { moving: movingElement.x, other: elRight }, // Left to right
      { moving: movingRight, other: el.x }, // Right to left
      { moving: movingRight, other: elRight }, // Right to right
      { moving: movingCenterX, other: elCenterX }, // Center to center
    ];

    xAlignments.forEach(({ moving, other }) => {
      if (Math.abs(moving - other) < threshold) {
        snappedX = movingElement.x + (other - moving);
        guides.push({
          type: 'vertical',
          position: other,
          start: Math.min(movingElement.y, el.y),
          end: Math.max(movingBottom, elBottom),
        });
      }
    });

    // Horizontal guides (Y-axis alignment)
    const yAlignments = [
      { moving: movingElement.y, other: el.y }, // Top to top
      { moving: movingElement.y, other: elBottom }, // Top to bottom
      { moving: movingBottom, other: el.y }, // Bottom to top
      { moving: movingBottom, other: elBottom }, // Bottom to bottom
      { moving: movingCenterY, other: elCenterY }, // Center to center
    ];

    yAlignments.forEach(({ moving, other }) => {
      if (Math.abs(moving - other) < threshold) {
        snappedY = movingElement.y + (other - moving);
        guides.push({
          type: 'horizontal',
          position: other,
          start: Math.min(movingElement.x, el.x),
          end: Math.max(movingRight, elRight),
        });
      }
    });
  });

  return { guides, snappedX, snappedY };
}
