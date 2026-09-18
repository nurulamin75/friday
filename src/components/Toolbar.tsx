import React, { useState } from 'react';
import { useEditorStore } from '../store';
import { Icons } from './Icons';
import { exportToHTML, exportToCSS, exportToJSON, exportToPNG, downloadFile } from '../utils/exporter';
import { showToast } from './Toast';

const ExportButton: React.FC = () => {
  const [open, setOpen] = useState(false);
  const { elements, rootIds } = useEditorStore();

  const handleExport = async (format: string) => {
    try {
      switch (format) {
        case 'html':
          downloadFile(exportToHTML(elements, rootIds), 'export.html', 'text/html');
          break;
        case 'css':
          downloadFile(exportToCSS(elements), 'export.css', 'text/css');
          break;
        case 'json':
          downloadFile(exportToJSON(elements, rootIds), 'export.json', 'application/json');
          break;
        case 'png':
          const blob = await exportToPNG(elements, rootIds);
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'export.png';
          a.click();
          URL.revokeObjectURL(url);
          break;
      }
      setOpen(false);
      showToast(`Exported as ${format.toUpperCase()}`, 'success');
    } catch (error) {
      showToast(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        title="Export"
        style={{
          height: 28, padding: '0 10px', display: 'flex', alignItems: 'center', gap: 4,
          background: '#3b82f6', border: 'none', borderRadius: 4, cursor: 'pointer', color: '#fff', fontSize: 12,
        }}
      >
        <Icons.Download size={12} /> Export
      </button>
      {open && (
        <div style={{
          position: 'absolute',
          top: 32,
          right: 0,
          background: '#1e1e1e',
          border: '1px solid #333',
          borderRadius: 6,
          padding: 4,
          minWidth: 140,
          zIndex: 1000,
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
        }}>
          {['html', 'css', 'json', 'png'].map((fmt) => (
            <button
              key={fmt}
              onClick={() => handleExport(fmt)}
              style={{
                width: '100%', padding: '6px 12px', background: 'transparent', border: 'none',
                color: '#ccc', fontSize: 12, cursor: 'pointer', textAlign: 'left', borderRadius: 4,
                textTransform: 'uppercase',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#252525')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              Export {fmt.toUpperCase()}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export const Toolbar: React.FC = () => {
  const {
    activeTool, setActiveTool, viewportMode, setViewportMode,
    canvasTransform, zoomIn, zoomOut, zoomToFit, resetZoom,
    undo, redo, historyIndex, history,
    setView, setCommandMenuOpen, currentProject, updateProjectName,
  } = useEditorStore();

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return (
    <div className="toolbar" style={{
      height: 44,
      background: '#1e1e1e',
      borderBottom: '1px solid #2a2a2a',
      display: 'flex',
      alignItems: 'center',
      padding: '0 8px',
      gap: 4,
      flexShrink: 0,
    }}>
      {/* Left: Logo & Project name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 12 }}>
        <button
          onClick={() => setView('dashboard')}
          title="Back to Dashboard"
          style={{
            width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'transparent', border: 'none', borderRadius: 4, cursor: 'pointer', color: '#888',
          }}
        >
          <Icons.ArrowLeft size={16} />
        </button>
        <div style={{
          width: 24, height: 24, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 700, color: '#fff',
        }}>DZ</div>
        <input
          value={currentProject?.name || 'Untitled'}
          onChange={(e) => updateProjectName(e.target.value)}
          style={{
            background: 'transparent', border: 'none', color: '#ccc',
            fontSize: 13, fontWeight: 500, outline: 'none', width: 120,
          }}
        />
      </div>

      {/* Divider */}
      <div style={{ width: 1, height: 20, background: '#333', margin: '0 4px' }} />

      {/* Undo/Redo */}
      <button onClick={undo} disabled={!canUndo} title="Undo (Ctrl+Z)" style={{
        width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'transparent', border: 'none', borderRadius: 4, cursor: canUndo ? 'pointer' : 'default',
        color: canUndo ? '#888' : '#444',
      }}>
        <Icons.Undo />
      </button>
      <button onClick={redo} disabled={!canRedo} title="Redo (Ctrl+Shift+Z)" style={{
        width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'transparent', border: 'none', borderRadius: 4, cursor: canRedo ? 'pointer' : 'default',
        color: canRedo ? '#888' : '#444',
      }}>
        <Icons.Redo />
      </button>

      {/* Divider */}
      <div style={{ width: 1, height: 20, background: '#333', margin: '0 4px' }} />

      {/* Zoom */}
      <button onClick={zoomOut} title="Zoom Out" style={{
        width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'transparent', border: 'none', borderRadius: 4, cursor: 'pointer', color: '#888', fontSize: 14,
      }}>-</button>
      <button onClick={resetZoom} title="Reset Zoom" style={{
        background: 'transparent', border: '1px solid #333', borderRadius: 4, cursor: 'pointer',
        color: '#aaa', fontSize: 11, padding: '2px 8px', minWidth: 50,
      }}>
        {Math.round(canvasTransform.scale * 100)}%
      </button>
      <button onClick={zoomIn} title="Zoom In" style={{
        width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'transparent', border: 'none', borderRadius: 4, cursor: 'pointer', color: '#888', fontSize: 14,
      }}>+</button>
      <button onClick={zoomToFit} title="Zoom to Fit" style={{
        background: 'transparent', border: 'none', borderRadius: 4, cursor: 'pointer', color: '#888',
        fontSize: 10, padding: '2px 6px',
      }}>Fit</button>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Viewport mode */}
      <div style={{ display: 'flex', gap: 1, background: '#252525', borderRadius: 4, padding: 2 }}>
        {(['desktop', 'tablet', 'mobile'] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => setViewportMode(mode)}
            style={{
              padding: '3px 8px', fontSize: 11, borderRadius: 3, cursor: 'pointer',
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

      {/* Divider */}
      <div style={{ width: 1, height: 20, background: '#333', margin: '0 8px' }} />

      {/* Right actions */}
      <button onClick={() => setCommandMenuOpen(true)} title="Command Menu (Ctrl+K)" style={{
        width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'transparent', border: 'none', borderRadius: 4, cursor: 'pointer', color: '#888',
      }}>
        <Icons.Command />
      </button>
      <button onClick={() => setView('preview')} title="Preview" style={{
        height: 28, padding: '0 10px', display: 'flex', alignItems: 'center', gap: 4,
        background: 'transparent', border: '1px solid #333', borderRadius: 4, cursor: 'pointer', color: '#aaa', fontSize: 12,
      }}>
        <Icons.Play size={12} /> Preview
      </button>
      <ExportButton />
    </div>
  );
};
