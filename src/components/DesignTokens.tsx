import React, { useMemo } from 'react';
import { useEditorStore } from '../store';
import { Icons } from './Icons';

export const DesignTokens: React.FC = () => {
  const { elements, updateElement } = useEditorStore();

  const tokens = useMemo(() => {
    const colors = new Map<string, number>();
    const fonts = new Map<string, number>();
    const fontSizes = new Map<number, number>();
    const radii = new Map<number, number>();

    Object.values(elements).forEach((el) => {
      // Colors
      if (el.background && el.background !== 'transparent' && !el.background.includes('gradient')) {
        colors.set(el.background, (colors.get(el.background) || 0) + 1);
      }
      if (el.border.color && el.border.width > 0) {
        colors.set(el.border.color, (colors.get(el.border.color) || 0) + 1);
      }
      if (el.typography?.color) {
        colors.set(el.typography.color, (colors.get(el.typography.color) || 0) + 1);
      }

      // Fonts
      if (el.typography?.fontFamily) {
        fonts.set(el.typography.fontFamily, (fonts.get(el.typography.fontFamily) || 0) + 1);
      }

      // Font sizes
      if (el.typography?.fontSize) {
        fontSizes.set(el.typography.fontSize, (fontSizes.get(el.typography.fontSize) || 0) + 1);
      }

      // Border radius
      if (el.borderRadius > 0) {
        radii.set(el.borderRadius, (radii.get(el.borderRadius) || 0) + 1);
      }
    });

    return {
      colors: Array.from(colors.entries()).sort((a, b) => b[1] - a[1]).slice(0, 12),
      fonts: Array.from(fonts.entries()).sort((a, b) => b[1] - a[1]),
      fontSizes: Array.from(fontSizes.entries()).sort((a, b) => b[1] - a[1]),
      radii: Array.from(radii.entries()).sort((a, b) => b[1] - a[1]),
    };
  }, [elements]);

  const handleColorClick = (color: string) => {
    // Apply color to selected elements
    const { selectedIds } = useEditorStore.getState();
    if (selectedIds.length > 0) {
      selectedIds.forEach((id) => {
        const el = elements[id];
        if (el) {
          if (el.typography) {
            updateElement(id, { typography: { ...el.typography, color } });
          } else {
            updateElement(id, { background: color });
          }
        }
      });
    }
  };

  return (
    <div style={{
      width: 220,
      background: '#1a1a1a',
      borderLeft: '1px solid #2a2a2a',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        height: 32,
        display: 'flex',
        alignItems: 'center',
        padding: '0 12px',
        borderBottom: '1px solid #2a2a2a',
        flexShrink: 0,
      }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Design Tokens
        </span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        {/* Colors */}
        {tokens.colors.length > 0 && (
          <div style={{ padding: '0 12px', marginBottom: 16 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: '#666', marginBottom: 8, textTransform: 'uppercase' }}>
              Colors
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4 }}>
              {tokens.colors.map(([color, count]) => (
                <div
                  key={color}
                  onClick={() => handleColorClick(color)}
                  title={`${color} (${count}x)`}
                  style={{
                    width: '100%',
                    aspectRatio: '1',
                    background: color,
                    borderRadius: 4,
                    border: '1px solid #333',
                    cursor: 'pointer',
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Fonts */}
        {tokens.fonts.length > 0 && (
          <div style={{ padding: '0 12px', marginBottom: 16 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: '#666', marginBottom: 8, textTransform: 'uppercase' }}>
              Typography
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {tokens.fonts.map(([font, count]) => (
                <div key={font} style={{ fontSize: 11, color: '#aaa', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{font}</span>
                  <span style={{ color: '#555', fontSize: 10 }}>{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Font Sizes */}
        {tokens.fontSizes.length > 0 && (
          <div style={{ padding: '0 12px', marginBottom: 16 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: '#666', marginBottom: 8, textTransform: 'uppercase' }}>
              Font Sizes
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {tokens.fontSizes.map(([size, count]) => (
                <div key={size} style={{
                  padding: '2px 8px', background: '#252525', borderRadius: 3,
                  fontSize: 10, color: '#888',
                }}>
                  {size}px <span style={{ color: '#555' }}>({count})</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Border Radii */}
        {tokens.radii.length > 0 && (
          <div style={{ padding: '0 12px', marginBottom: 16 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: '#666', marginBottom: 8, textTransform: 'uppercase' }}>
              Border Radius
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {tokens.radii.map(([radius, count]) => (
                <div key={radius} style={{
                  padding: '2px 8px', background: '#252525', borderRadius: 3,
                  fontSize: 10, color: '#888',
                }}>
                  {radius}px <span style={{ color: '#555' }}>({count})</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {tokens.colors.length === 0 && tokens.fonts.length === 0 && (
          <div style={{ padding: '20px 12px', textAlign: 'center', color: '#555', fontSize: 12 }}>
            No design tokens detected yet.
          </div>
        )}
      </div>
    </div>
  );
};
