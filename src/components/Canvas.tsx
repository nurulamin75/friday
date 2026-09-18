import React, { useRef, useEffect, useCallback, useState } from 'react';
import { useEditorStore, createDefaultElement } from '../store';
import type { DesignElement } from '../types';
import { AlignmentBar } from './AlignmentBar';
import { SnapGuides, calculateSnapGuides } from './SnapGuides';

export const Canvas: React.FC = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const {
    elements, rootIds, selectedIds, setSelectedIds, clearSelection, addToSelection,
    canvasTransform, setCanvasTransform, activeTool, setActiveTool,
    updateElement, addElement, deleteElement, viewportMode,
    pushHistory, duplicateSelection,
  } = useEditorStore();

  const [isPanning, setIsPanning] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState({ x: 0, y: 0 });
  const [drawCurrent, setDrawCurrent] = useState({ x: 0, y: 0 });
  const [dragState, setDragState] = useState<{ id: string; startX: number; startY: number; elX: number; elY: number } | null>(null);
  const [resizeState, setResizeState] = useState<{ id: string; handle: string; startX: number; startY: number; origX: number; origY: number; origW: number; origH: number } | null>(null);
  const [selectionBox, setSelectionBox] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [spaceHeld, setSpaceHeld] = useState(false);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [snapGuides, setSnapGuides] = useState<any[]>([]);

  const viewportWidths = { desktop: 1440, tablet: 768, mobile: 390 };
  const currentWidth = viewportWidths[viewportMode];

  // Center view on load
  useEffect(() => {
    if (rootIds.length > 0) {
      const container = canvasRef.current;
      if (container) {
        const rect = container.getBoundingClientRect();
        setCanvasTransform({
          x: (rect.width - 1440) / 2,
          y: 40,
          scale: Math.min(rect.width / 1600, 0.8),
        });
      }
    }
  }, [rootIds.length > 0 ? 'loaded' : 'empty']);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (editingTextId) return;
      if (e.code === 'Space') { e.preventDefault(); setSpaceHeld(true); }
      if (e.key === 'v') setActiveTool('select');
      if (e.key === 'f') setActiveTool('frame');
      if (e.key === 'r') setActiveTool('rectangle');
      if (e.key === 'o') setActiveTool('ellipse');
      if (e.key === 'l') setActiveTool('line');
      if (e.key === 't') setActiveTool('text');
      if (e.key === 'h') setActiveTool('hand');
      if (e.key === 'Delete' || e.key === 'Backspace') {
        selectedIds.forEach((id) => deleteElement(id));
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) useEditorStore.getState().redo();
        else useEditorStore.getState().undo();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'c') useEditorStore.getState().copySelection();
      if ((e.metaKey || e.ctrlKey) && e.key === 'v') { e.preventDefault(); useEditorStore.getState().paste(); }
      if ((e.metaKey || e.ctrlKey) && e.key === 'd') { e.preventDefault(); duplicateSelection(); }
      if ((e.metaKey || e.ctrlKey) && e.key === 'g') {
        e.preventDefault();
        if (e.shiftKey) useEditorStore.getState().ungroupSelection();
        else useEditorStore.getState().groupSelection();
      }
      if (e.key === 'Escape') { clearSelection(); setEditingTextId(null); }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') setSpaceHeld(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [selectedIds, editingTextId]);

  // Wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      const { canvasTransform: ct } = useEditorStore.getState();
      const newScale = Math.min(Math.max(ct.scale * delta, 0.1), 5);
      setCanvasTransform({ ...ct, scale: newScale });
    } else {
      const { canvasTransform: ct } = useEditorStore.getState();
      setCanvasTransform({ ...ct, x: ct.x - e.deltaX, y: ct.y - e.deltaY });
    }
  }, []);

  const screenToCanvas = useCallback((sx: number, sy: number) => {
    const { canvasTransform: ct } = useEditorStore.getState();
    return {
      x: (sx - ct.x) / ct.scale,
      y: (sy - ct.y) / ct.scale,
    };
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;

    if (activeTool === 'hand' || spaceHeld) {
      setIsPanning(true);
      setDrawStart({ x: e.clientX, y: e.clientY });
      return;
    }

    if (activeTool === 'frame' || activeTool === 'rectangle' || activeTool === 'ellipse' || activeTool === 'text') {
      const pos = screenToCanvas(sx, sy);
      setIsDrawing(true);
      setDrawStart(pos);
      setDrawCurrent(pos);
      return;
    }

    // Select tool - check if clicking on empty space
    const target = e.target as HTMLElement;
    if (target === canvasRef.current || target.classList.contains('canvas-inner')) {
      if (!e.shiftKey) clearSelection();
      const pos = screenToCanvas(sx, sy);
      setSelectionBox({ x: pos.x, y: pos.y, w: 0, h: 0 });
      setDrawStart(pos);
    }
  }, [activeTool, spaceHeld, screenToCanvas]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    if (isPanning) {
      const dx = e.clientX - drawStart.x;
      const dy = e.clientY - drawStart.y;
      const { canvasTransform: ct } = useEditorStore.getState();
      setCanvasTransform({ ...ct, x: ct.x + dx, y: ct.y + dy });
      setDrawStart({ x: e.clientX, y: e.clientY });
      return;
    }

    if (isDrawing) {
      const pos = screenToCanvas(e.clientX - rect.left, e.clientY - rect.top);
      setDrawCurrent(pos);
      return;
    }

    if (dragState) {
      const pos = screenToCanvas(e.clientX - rect.left, e.clientY - rect.top);
      const dx = pos.x - dragState.startX;
      const dy = pos.y - dragState.startY;
      
      const newX = dragState.elX + dx;
      const newY = dragState.elY + dy;
      const el = elements[dragState.id];
      
      if (el) {
        // Calculate snap guides
        const otherElements = Object.values(elements).filter((e) => e.id !== dragState.id && e.visible);
        const { guides, snappedX, snappedY } = calculateSnapGuides(
          { x: newX, y: newY, width: el.width, height: el.height },
          otherElements
        );
        
        setSnapGuides(guides);
        updateElement(dragState.id, { x: snappedX, y: snappedY });
      } else {
        updateElement(dragState.id, { x: newX, y: newY });
      }
      return;
    }

    if (resizeState) {
      const pos = screenToCanvas(e.clientX - rect.left, e.clientY - rect.top);
      const dx = pos.x - resizeState.startX;
      const dy = pos.y - resizeState.startY;
      let { origX, origY, origW, origH } = resizeState;
      let newX = origX, newY = origY, newW = origW, newH = origH;

      if (resizeState.handle.includes('e')) { newW = Math.max(10, origW + dx); }
      if (resizeState.handle.includes('w')) { newW = Math.max(10, origW - dx); newX = origX + dx; }
      if (resizeState.handle.includes('s')) { newH = Math.max(10, origH + dy); }
      if (resizeState.handle.includes('n')) { newH = Math.max(10, origH - dy); newY = origY + dy; }

      updateElement(resizeState.id, { x: newX, y: newY, width: newW, height: newH });
      return;
    }

    if (selectionBox) {
      const pos = screenToCanvas(e.clientX - rect.left, e.clientY - rect.top);
      setSelectionBox({
        x: Math.min(drawStart.x, pos.x),
        y: Math.min(drawStart.y, pos.y),
        w: Math.abs(pos.x - drawStart.x),
        h: Math.abs(pos.y - drawStart.y),
      });
    }
  }, [isPanning, isDrawing, dragState, resizeState, selectionBox, drawStart, screenToCanvas]);

  const handleMouseUp = useCallback(() => {
    if (isDrawing) {
      const x = Math.min(drawStart.x, drawCurrent.x);
      const y = Math.min(drawStart.y, drawCurrent.y);
      const w = Math.abs(drawCurrent.x - drawStart.x);
      const h = Math.abs(drawCurrent.y - drawStart.y);

      if (w > 5 || h > 5 || activeTool === 'text') {
        const type = activeTool === 'frame' ? 'frame' : activeTool === 'text' ? 'text' : activeTool === 'ellipse' ? 'ellipse' : 'rectangle';
        const el = createDefaultElement(type as any, x || drawStart.x, y || drawStart.y);
        if (w > 5) el.width = w;
        if (h > 5) el.height = h;
        if (type === 'text') { el.content = 'Text'; el.width = 200; el.height = 40; }
        addElement(el);
        setSelectedIds([el.id]);
      }
      setIsDrawing(false);
      setActiveTool('select');
      return;
    }

    if (dragState) {
      pushHistory();
      setDragState(null);
      setSnapGuides([]);
    }
    if (resizeState) {
      pushHistory();
      setResizeState(null);
    }
    if (selectionBox) {
      // Select elements within box
      const box = selectionBox;
      const ids = Object.values(elements).filter((el) => {
        return el.x >= box.x && el.y >= box.y &&
          el.x + el.width <= box.x + box.w &&
          el.y + el.height <= box.y + box.h;
      }).map((el) => el.id);
      if (ids.length > 0) setSelectedIds(ids);
      setSelectionBox(null);
    }
    setIsPanning(false);
  }, [isDrawing, drawStart, drawCurrent, activeTool, dragState, resizeState, selectionBox, elements]);

  const handleElementMouseDown = useCallback((e: React.MouseEvent, id: string) => {
    if (activeTool !== 'select') return;
    e.stopPropagation();
    const el = elements[id];
    if (!el || el.locked) return;

    if (e.shiftKey) {
      if (selectedIds.includes(id)) {
        setSelectedIds(selectedIds.filter((s) => s !== id));
      } else {
        addToSelection(id);
      }
    } else if (!selectedIds.includes(id)) {
      setSelectedIds([id]);
    }

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const pos = screenToCanvas(e.clientX - rect.left, e.clientY - rect.top);
    setDragState({ id, startX: pos.x, startY: pos.y, elX: el.x, elY: el.y });
  }, [activeTool, elements, selectedIds, screenToCanvas]);

  const handleElementDoubleClick = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const el = elements[id];
    if (el && (el.type === 'text' || el.type === 'heading' || el.type === 'paragraph')) {
      setEditingTextId(id);
    }
  }, [elements]);

  const handleResizeMouseDown = useCallback((e: React.MouseEvent, id: string, handle: string) => {
    e.stopPropagation();
    const el = elements[id];
    if (!el) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const pos = screenToCanvas(e.clientX - rect.left, e.clientY - rect.top);
    setResizeState({
      id, handle,
      startX: pos.x, startY: pos.y,
      origX: el.x, origY: el.y,
      origW: el.width, origH: el.height,
    });
  }, [elements, screenToCanvas]);

  const renderElement = (el: DesignElement, depth: number = 0): React.ReactNode => {
    if (!el.visible) return null;

    const isSelected = selectedIds.includes(el.id);
    const isText = el.type === 'text' || el.type === 'heading' || el.type === 'paragraph';
    const isEditing = editingTextId === el.id;

    const isChild = el.parentId !== null;
    const isAbsolute = el.position === 'absolute';

    const style: React.CSSProperties = {
      position: isAbsolute ? 'absolute' : 'relative',
      left: isAbsolute ? el.x : undefined,
      top: isAbsolute ? el.y : undefined,
      width: el.width > 0 ? (isChild && !isAbsolute ? '100%' : el.width) : 'auto',
      height: el.height === 0 ? 'auto' : el.height,
      transform: el.rotation ? `rotate(${el.rotation}deg)` : undefined,
      opacity: el.opacity,
      background: el.background || 'transparent',
      border: el.border.width > 0 ? `${el.border.width}px ${el.border.style} ${el.border.color}` : 'none',
      borderRadius: el.borderRadius,
      boxShadow: el.shadow ? `${el.shadow.x}px ${el.shadow.y}px ${el.shadow.blur}px ${el.shadow.spread}px ${el.shadow.color}` : 'none',
      padding: `${el.padding.top}px ${el.padding.right}px ${el.padding.bottom}px ${el.padding.left}px`,
      margin: `${el.margin.top}px ${el.margin.right}px ${el.margin.bottom}px ${el.margin.left}px`,
      overflow: el.overflow,
      zIndex: el.zIndex + depth,
      cursor: activeTool === 'select' ? (el.locked ? 'not-allowed' : 'move') : 'default',
    };

    // Apply flex layout
    if (el.layout.display === 'flex') {
      style.display = 'flex';
      style.flexDirection = el.layout.flexDirection;
      style.justifyContent = el.layout.justifyContent;
      style.alignItems = el.layout.alignItems;
      if (el.layout.gap > 0) style.gap = el.layout.gap;
    } else if (el.layout.display === 'grid') {
      style.display = 'grid';
      if (el.layout.gridColumns) style.gridTemplateColumns = el.layout.gridColumns;
      if (el.layout.gridRows) style.gridTemplateRows = el.layout.gridRows;
      if (el.layout.gap > 0) style.gap = el.layout.gap;
    } else if (el.layout.display === 'none') {
      style.display = 'none';
    }

    if (isText && el.typography) {
      style.fontFamily = el.typography.fontFamily;
      style.fontSize = el.typography.fontSize;
      style.fontWeight = el.typography.fontWeight;
      style.lineHeight = el.typography.lineHeight;
      style.letterSpacing = el.typography.letterSpacing;
      style.textAlign = el.typography.textAlign;
      style.textTransform = el.typography.textTransform;
      style.color = el.typography.color;
    }

    if (el.type === 'ellipse') {
      style.borderRadius = '50%';
    }

    if (el.type === 'image' && el.src) {
      return (
        <div
          key={el.id}
          data-element-id={el.id}
          style={style}
          onMouseDown={(e) => handleElementMouseDown(e, el.id)}
          onDoubleClick={(e) => handleElementDoubleClick(e, el.id)}
          onMouseEnter={() => setHoveredId(el.id)}
          onMouseLeave={() => setHoveredId(null)}
        >
          <img src={el.src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: el.borderRadius }} />
        </div>
      );
    }

    const children = el.children.map((childId) => {
      const child = elements[childId];
      if (child) return renderElement(child, depth + 1);
      return null;
    }).filter(Boolean);

    return (
      <div
        key={el.id}
        data-element-id={el.id}
        style={style}
        onMouseDown={(e) => handleElementMouseDown(e, el.id)}
        onDoubleClick={(e) => handleElementDoubleClick(e, el.id)}
        onMouseEnter={() => setHoveredId(el.id)}
        onMouseLeave={() => setHoveredId(null)}
      >
        {isEditing ? (
          <textarea
            autoFocus
            value={el.content}
            onChange={(e) => updateElement(el.id, { content: e.target.value })}
            onBlur={() => { setEditingTextId(null); pushHistory(); }}
            onKeyDown={(e) => { if (e.key === 'Escape') { setEditingTextId(null); pushHistory(); } }}
            style={{
              width: '100%', height: '100%', background: 'transparent', border: 'none', outline: 'none',
              resize: 'none', fontFamily: style.fontFamily, fontSize: style.fontSize,
              fontWeight: style.fontWeight, lineHeight: style.lineHeight,
              color: style.color, textAlign: style.textAlign,
            }}
          />
        ) : (
          <>
            {el.content && <span style={{ whiteSpace: 'pre-wrap', pointerEvents: 'none' }}>{el.content}</span>}
            {children}
          </>
        )}
      </div>
    );
  };

  const renderSelectionOverlay = () => {
    // Show hover outline
    const overlays: React.ReactNode[] = [];
    if (hoveredId && !selectedIds.includes(hoveredId)) {
      const el = elements[hoveredId];
      if (el && el.visible) {
        overlays.push(
          <div
            key={`hover-${hoveredId}`}
            style={{
              position: 'absolute',
              left: el.x - 1,
              top: el.y - 1,
              width: el.width + 2,
              height: el.height + 2,
              border: '1px solid rgba(59, 130, 246, 0.5)',
              pointerEvents: 'none',
              zIndex: 99998,
            }}
          />
        );
      }
    }

    // Show selection outlines
    selectedIds.forEach((id) => {
      const el = elements[id];
      if (!el) return;
      overlays.push(
        <div
          key={`sel-${id}`}
          style={{
            position: 'absolute',
            left: el.x - 1,
            top: el.y - 1,
            width: el.width + 2,
            height: el.height + 2,
            border: '1.5px solid #3b82f6',
            pointerEvents: 'none',
            zIndex: 99999,
          }}
        >
          {/* Resize handles */}
          {['nw', 'ne', 'sw', 'se', 'n', 's', 'e', 'w'].map((handle) => {
            const positions: Record<string, React.CSSProperties> = {
              nw: { left: -4, top: -4 },
              ne: { right: -4, top: -4 },
              sw: { left: -4, bottom: -4 },
              se: { right: -4, bottom: -4 },
              n: { left: '50%', top: -4, transform: 'translateX(-50%)' },
              s: { left: '50%', bottom: -4, transform: 'translateX(-50%)' },
              e: { right: -4, top: '50%', transform: 'translateY(-50%)' },
              w: { left: -4, top: '50%', transform: 'translateY(-50%)' },
            };
            const cursors: Record<string, string> = {
              nw: 'nw-resize', ne: 'ne-resize', sw: 'sw-resize', se: 'se-resize',
              n: 'n-resize', s: 's-resize', e: 'e-resize', w: 'w-resize',
            };
            return (
              <div
                key={handle}
                onMouseDown={(e) => { e.stopPropagation(); handleResizeMouseDown(e, id, handle); }}
                style={{
                  position: 'absolute',
                  width: 8,
                  height: 8,
                  background: '#ffffff',
                  border: '1.5px solid #3b82f6',
                  borderRadius: 1,
                  cursor: cursors[handle],
                  pointerEvents: 'all',
                  ...positions[handle],
                }}
              />
            );
          })}
          {/* Dimensions label */}
          <div style={{
            position: 'absolute',
            bottom: -20,
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#3b82f6',
            color: '#fff',
            fontSize: 10,
            padding: '1px 4px',
            borderRadius: 2,
            whiteSpace: 'nowrap',
          }}>
            {Math.round(el.width)} x {Math.round(el.height)}
          </div>
        </div>
      );
    });

    return <>{overlays}</>;
  };

  const cursorStyle = spaceHeld || activeTool === 'hand' ? 'grab' :
    activeTool === 'zoom' ? 'zoom-in' :
    (activeTool === 'frame' || activeTool === 'rectangle' || activeTool === 'ellipse' || activeTool === 'text') ? 'crosshair' : 'default';

  return (
    <div
      ref={canvasRef}
      className="canvas-container"
      style={{
        flex: 1,
        overflow: 'hidden',
        background: '#1a1a1a',
        cursor: cursorStyle,
        position: 'relative',
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      {/* Grid pattern */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'radial-gradient(circle, #333 1px, transparent 1px)',
        backgroundSize: `${20 * canvasTransform.scale}px ${20 * canvasTransform.scale}px`,
        backgroundPosition: `${canvasTransform.x}px ${canvasTransform.y}px`,
        opacity: 0.5,
      }} />

      {/* Canvas content */}
      <div
        className="canvas-inner"
        style={{
          position: 'absolute',
          transformOrigin: '0 0',
          transform: `translate(${canvasTransform.x}px, ${canvasTransform.y}px) scale(${canvasTransform.scale})`,
        }}
      >
        {/* Alignment bar */}
        {selectedIds.length >= 2 && <AlignmentBar />}
        {/* Viewport frame indicator */}
        <div style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: currentWidth,
          height: 2000,
          border: '1px dashed #444',
          pointerEvents: 'none',
          zIndex: 0,
        }}>
          <div style={{
            position: 'absolute',
            top: -20,
            left: 0,
            fontSize: 11,
            color: '#666',
            fontFamily: 'monospace',
          }}>
            {currentWidth}px
          </div>
        </div>

        {/* Rendered elements */}
        {rootIds.length === 0 ? (
          <div style={{
            position: 'absolute',
            left: 200,
            top: 200,
            width: 420,
            padding: 32,
            background: '#1e1e1e',
            border: '1px solid #2a2a2a',
            borderRadius: 8,
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 16, color: '#ccc', marginBottom: 12, fontWeight: 500 }}>Canvas is empty</div>
            <div style={{ fontSize: 12, color: '#666', lineHeight: 1.8, marginBottom: 16 }}>
              Use the tools on the left to create elements:<br />
              <span style={{ color: '#888' }}>R</span> Rectangle &nbsp;
              <span style={{ color: '#888' }}>O</span> Ellipse &nbsp;
              <span style={{ color: '#888' }}>T</span> Text &nbsp;
              <span style={{ color: '#888' }}>F</span> Frame
            </div>
            <div style={{
              padding: '8px 16px',
              background: '#252525',
              borderRadius: 4,
              fontSize: 11,
              color: '#555',
              display: 'inline-block',
            }}>
              <span style={{ color: '#888' }}>Ctrl+K</span> for command menu
            </div>
          </div>
        ) : rootIds.map((id) => {
          const el = elements[id];
          if (el) return renderElement(el);
          return null;
        })}

        {/* Selection overlays */}
        {renderSelectionOverlay()}

        {/* Snap guides */}
        <SnapGuides guides={snapGuides} />

        {/* Drawing preview */}
        {isDrawing && (
          <div style={{
            position: 'absolute',
            left: Math.min(drawStart.x, drawCurrent.x),
            top: Math.min(drawStart.y, drawCurrent.y),
            width: Math.abs(drawCurrent.x - drawStart.x),
            height: Math.abs(drawCurrent.y - drawStart.y),
            border: '1.5px solid #3b82f6',
            background: 'rgba(59, 130, 246, 0.05)',
            pointerEvents: 'none',
            borderRadius: activeTool === 'ellipse' ? '50%' : 0,
          }} />
        )}

        {/* Selection box */}
        {selectionBox && (
          <div style={{
            position: 'absolute',
            left: selectionBox.x,
            top: selectionBox.y,
            width: selectionBox.w,
            height: selectionBox.h,
            border: '1px solid #3b82f6',
            background: 'rgba(59, 130, 246, 0.08)',
            pointerEvents: 'none',
          }} />
        )}
      </div>
    </div>
  );
};
