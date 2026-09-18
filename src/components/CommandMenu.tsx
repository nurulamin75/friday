import React, { useState, useEffect, useRef } from 'react';
import { useEditorStore, createDefaultElement } from '../store';
import { Icons } from './Icons';

interface Command {
  id: string;
  label: string;
  shortcut?: string;
  action: () => void;
}

export const CommandMenu: React.FC = () => {
  const { commandMenuOpen, setCommandMenuOpen, setActiveTool, zoomToFit, resetZoom, setView, selectedIds, deleteElement } = useEditorStore();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (commandMenuOpen) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [commandMenuOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandMenuOpen(!commandMenuOpen);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commandMenuOpen]);

  const commands: Command[] = [
    { id: 'import', label: 'Import Website', action: () => { setCommandMenuOpen(false); setView('dashboard'); } },
    { id: 'frame', label: 'Create Frame', shortcut: 'F', action: () => { setActiveTool('frame'); setCommandMenuOpen(false); } },
    { id: 'rect', label: 'Create Rectangle', shortcut: 'R', action: () => { setActiveTool('rectangle'); setCommandMenuOpen(false); } },
    { id: 'ellipse', label: 'Create Ellipse', shortcut: 'O', action: () => { setActiveTool('ellipse'); setCommandMenuOpen(false); } },
    { id: 'text', label: 'Create Text', shortcut: 'T', action: () => { setActiveTool('text'); setCommandMenuOpen(false); } },
    { id: 'zoom-fit', label: 'Zoom to Fit', action: () => { zoomToFit(); setCommandMenuOpen(false); } },
    { id: 'zoom-reset', label: 'Reset Zoom', action: () => { resetZoom(); setCommandMenuOpen(false); } },
    { id: 'preview', label: 'Toggle Preview', action: () => { setView('preview'); setCommandMenuOpen(false); } },
    { id: 'delete', label: 'Delete Selection', shortcut: 'Del', action: () => { selectedIds.forEach((id) => deleteElement(id)); setCommandMenuOpen(false); } },
    { id: 'undo', label: 'Undo', shortcut: 'Ctrl+Z', action: () => { useEditorStore.getState().undo(); setCommandMenuOpen(false); } },
    { id: 'redo', label: 'Redo', shortcut: 'Ctrl+Shift+Z', action: () => { useEditorStore.getState().redo(); setCommandMenuOpen(false); } },
    { id: 'copy', label: 'Copy', shortcut: 'Ctrl+C', action: () => { useEditorStore.getState().copySelection(); setCommandMenuOpen(false); } },
    { id: 'paste', label: 'Paste', shortcut: 'Ctrl+V', action: () => { useEditorStore.getState().paste(); setCommandMenuOpen(false); } },
    { id: 'duplicate', label: 'Duplicate', shortcut: 'Ctrl+D', action: () => { useEditorStore.getState().duplicateSelection(); setCommandMenuOpen(false); } },
    { id: 'select-tool', label: 'Select Tool', shortcut: 'V', action: () => { setActiveTool('select'); setCommandMenuOpen(false); } },
    { id: 'hand-tool', label: 'Hand Tool', shortcut: 'H', action: () => { setActiveTool('hand'); setCommandMenuOpen(false); } },
  ];

  const filtered = commands.filter((c) => c.label.toLowerCase().includes(query.toLowerCase()));

  if (!commandMenuOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: 120,
        background: 'rgba(0,0,0,0.5)',
      }}
      onClick={() => setCommandMenuOpen(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 480,
          background: '#1e1e1e',
          borderRadius: 8,
          border: '1px solid #333',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          overflow: 'hidden',
        }}
      >
        {/* Search input */}
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #2a2a2a', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icons.Search size={14} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command..."
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              color: '#fff', fontSize: 14,
            }}
          />
          <kbd style={{ fontSize: 10, color: '#555', background: '#252525', padding: '2px 6px', borderRadius: 3 }}>ESC</kbd>
        </div>

        {/* Commands list */}
        <div style={{ maxHeight: 320, overflowY: 'auto', padding: '4px 0' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '20px 16px', textAlign: 'center', color: '#555', fontSize: 13 }}>
              No commands found
            </div>
          ) : (
            filtered.map((cmd) => (
              <button
                key={cmd.id}
                onClick={cmd.action}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 16px',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#ccc',
                  fontSize: 13,
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#252525')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <span>{cmd.label}</span>
                {cmd.shortcut && (
                  <kbd style={{ fontSize: 10, color: '#555', background: '#252525', padding: '2px 6px', borderRadius: 3 }}>
                    {cmd.shortcut}
                  </kbd>
                )}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
