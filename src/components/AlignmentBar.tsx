import React from 'react';
import { useEditorStore } from '../store';

export const AlignmentBar: React.FC = () => {
  const { selectedIds, elements, updateElement, pushHistory } = useEditorStore();

  if (selectedIds.length < 2) return null;

  const selectedElements = selectedIds.map((id) => elements[id]).filter(Boolean);
  if (selectedElements.length < 2) return null;

  // Calculate bounds
  const minX = Math.min(...selectedElements.map((e) => e.x));
  const minY = Math.min(...selectedElements.map((e) => e.y));
  const maxX = Math.max(...selectedElements.map((e) => e.x + e.width));
  const maxY = Math.max(...selectedElements.map((e) => e.y + e.height));
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;

  const align = (direction: string) => {
    selectedIds.forEach((id) => {
      const el = elements[id];
      if (!el) return;
      switch (direction) {
        case 'left': updateElement(id, { x: minX }); break;
        case 'right': updateElement(id, { x: maxX - el.width }); break;
        case 'top': updateElement(id, { y: minY }); break;
        case 'bottom': updateElement(id, { y: maxY - el.height }); break;
        case 'centerH': updateElement(id, { x: centerX - el.width / 2 }); break;
        case 'centerV': updateElement(id, { y: centerY - el.height / 2 }); break;
      }
    });
    pushHistory();
  };

  const distribute = (direction: 'h' | 'v') => {
    if (selectedElements.length < 3) return;
    const sorted = [...selectedElements].sort((a, b) => direction === 'h' ? a.x - b.x : a.y - b.y);
    
    if (direction === 'h') {
      const totalWidth = sorted.reduce((sum, e) => sum + e.width, 0);
      const availableSpace = maxX - minX - totalWidth;
      const gap = availableSpace / (sorted.length - 1);
      let currentX = minX;
      sorted.forEach((el) => {
        updateElement(el.id, { x: currentX });
        currentX += el.width + gap;
      });
    } else {
      const totalHeight = sorted.reduce((sum, e) => sum + e.height, 0);
      const availableSpace = maxY - minY - totalHeight;
      const gap = availableSpace / (sorted.length - 1);
      let currentY = minY;
      sorted.forEach((el) => {
        updateElement(el.id, { y: currentY });
        currentY += el.height + gap;
      });
    }
    pushHistory();
  };

  const btnStyle: React.CSSProperties = {
    width: 26,
    height: 26,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'transparent',
    border: '1px solid #333',
    borderRadius: 4,
    cursor: 'pointer',
    color: '#888',
    fontSize: 10,
  };

  return (
    <div style={{
      position: 'absolute',
      bottom: 36,
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      gap: 4,
      background: '#1e1e1e',
      border: '1px solid #333',
      borderRadius: 6,
      padding: '4px 8px',
      zIndex: 100,
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
    }}>
      <button onClick={() => align('left')} style={btnStyle} title="Align Left">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
          <line x1="1" y1="1" x2="1" y2="11" />
          <rect x="3" y="3" width="8" height="2" />
          <rect x="3" y="7" width="5" height="2" />
        </svg>
      </button>
      <button onClick={() => align('centerH')} style={btnStyle} title="Align Center Horizontal">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
          <line x1="6" y1="1" x2="6" y2="11" />
          <rect x="2" y="3" width="8" height="2" />
          <rect x="3.5" y="7" width="5" height="2" />
        </svg>
      </button>
      <button onClick={() => align('right')} style={btnStyle} title="Align Right">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
          <line x1="11" y1="1" x2="11" y2="11" />
          <rect x="1" y="3" width="8" height="2" />
          <rect x="4" y="7" width="5" height="2" />
        </svg>
      </button>
      <div style={{ width: 1, background: '#333', margin: '2px 4px' }} />
      <button onClick={() => align('top')} style={btnStyle} title="Align Top">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
          <line x1="1" y1="1" x2="11" y2="1" />
          <rect x="3" y="3" width="2" height="8" />
          <rect x="7" y="3" width="2" height="5" />
        </svg>
      </button>
      <button onClick={() => align('centerV')} style={btnStyle} title="Align Center Vertical">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
          <line x1="1" y1="6" x2="11" y2="6" />
          <rect x="3" y="2" width="2" height="8" />
          <rect x="7" y="3.5" width="2" height="5" />
        </svg>
      </button>
      <button onClick={() => align('bottom')} style={btnStyle} title="Align Bottom">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
          <line x1="1" y1="11" x2="11" y2="11" />
          <rect x="3" y="1" width="2" height="8" />
          <rect x="7" y="4" width="2" height="5" />
        </svg>
      </button>
      <div style={{ width: 1, background: '#333', margin: '2px 4px' }} />
      <button onClick={() => distribute('h')} style={btnStyle} title="Distribute Horizontally">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="1" y="3" width="2" height="6" />
          <rect x="5" y="3" width="2" height="6" />
          <rect x="9" y="3" width="2" height="6" />
        </svg>
      </button>
      <button onClick={() => distribute('v')} style={btnStyle} title="Distribute Vertically">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="1" width="6" height="2" />
          <rect x="3" y="5" width="6" height="2" />
          <rect x="3" y="9" width="6" height="2" />
        </svg>
      </button>
    </div>
  );
};
