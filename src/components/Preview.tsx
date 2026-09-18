import React, { useState } from 'react';
import { useEditorStore } from '../store';
import { Icons } from './Icons';

export const Preview: React.FC = () => {
  const { elements, rootIds, setView, viewportMode, setViewportMode } = useEditorStore();
  const [scale, setScale] = useState(1);

  const viewportWidths = { desktop: 1440, tablet: 768, mobile: 390 };
  const currentWidth = viewportWidths[viewportMode];

  const renderElement = (el: typeof elements[string]): React.ReactNode => {
    if (!el.visible) return null;

    const style: React.CSSProperties = {
      position: el.position === 'absolute' ? 'absolute' : 'relative',
      left: el.position === 'absolute' ? el.x : undefined,
      top: el.position === 'absolute' ? el.y : undefined,
      width: el.width,
      height: el.height || undefined,
      background: el.background || 'transparent',
      border: el.border.width > 0 ? `${el.border.width}px ${el.border.style} ${el.border.color}` : 'none',
      borderRadius: el.borderRadius,
      boxShadow: el.shadow ? `${el.shadow.x}px ${el.shadow.y}px ${el.shadow.blur}px ${el.shadow.spread}px ${el.shadow.color}` : 'none',
      padding: `${el.padding.top}px ${el.padding.right}px ${el.padding.bottom}px ${el.padding.left}px`,
      opacity: el.opacity,
      overflow: el.overflow,
      transform: el.rotation ? `rotate(${el.rotation}deg)` : undefined,
    };

    if (el.layout.display !== 'block') {
      style.display = el.layout.display;
      if (el.layout.display === 'flex') {
        style.flexDirection = el.layout.flexDirection;
        style.justifyContent = el.layout.justifyContent;
        style.alignItems = el.layout.alignItems;
        style.gap = el.layout.gap;
      }
    }

    if (el.typography) {
      style.fontFamily = el.typography.fontFamily;
      style.fontSize = el.typography.fontSize;
      style.fontWeight = el.typography.fontWeight;
      style.lineHeight = el.typography.lineHeight;
      style.letterSpacing = el.typography.letterSpacing;
      style.textAlign = el.typography.textAlign;
      style.textTransform = el.typography.textTransform;
      style.color = el.typography.color;
    }

    const children = el.children.map((cid) => {
      const child = elements[cid];
      if (child) return renderElement(child);
      return null;
    });

    if (el.type === 'image' && el.src) {
      return (
        <div key={el.id} style={style}>
          <img src={el.src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      );
    }

    return (
      <div key={el.id} style={style}>
        {el.content && <span style={{ whiteSpace: 'pre-wrap' }}>{el.content}</span>}
        {children}
      </div>
    );
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: '#0a0a0a',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Preview toolbar */}
      <div style={{
        height: 44,
        background: '#1a1a1a',
        borderBottom: '1px solid #2a2a2a',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        gap: 12,
        flexShrink: 0,
      }}>
        <button
          onClick={() => setView('editor')}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'transparent', border: 'none', cursor: 'pointer', color: '#aaa', fontSize: 13,
          }}
        >
          <Icons.ArrowLeft size={14} /> Back to Editor
        </button>

        <div style={{ flex: 1 }} />

        {/* Viewport switcher */}
        <div style={{ display: 'flex', gap: 1, background: '#252525', borderRadius: 4, padding: 2 }}>
          {(['desktop', 'tablet', 'mobile'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewportMode(mode)}
              style={{
                padding: '3px 10px', fontSize: 11, borderRadius: 3, cursor: 'pointer',
                background: viewportMode === mode ? '#3b82f6' : 'transparent',
                color: viewportMode === mode ? '#fff' : '#888',
                border: 'none', display: 'flex', alignItems: 'center', gap: 4,
              }}
            >
              {mode === 'desktop' && <Icons.Desktop size={12} />}
              {mode === 'tablet' && <Icons.Tablet size={12} />}
              {mode === 'mobile' && <Icons.Mobile size={12} />}
              <span style={{ textTransform: 'capitalize' }}>{mode}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Preview content */}
      <div style={{
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        overflow: 'auto',
        padding: 40,
      }}>
        <div style={{
          width: currentWidth,
          minHeight: 600,
          background: '#ffffff',
          position: 'relative',
          boxShadow: '0 0 40px rgba(0,0,0,0.3)',
          transform: `scale(${scale})`,
          transformOrigin: 'top center',
        }}>
          {rootIds.map((id) => {
            const el = elements[id];
            if (el) return renderElement(el);
            return null;
          })}
        </div>
      </div>
    </div>
  );
};
