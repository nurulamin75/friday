import React, { useState, useEffect } from 'react';
import { useEditorStore } from '../store';
import { Icons } from './Icons';

interface ContextMenuState {
  x: number;
  y: number;
  elementId: string | null;
}

export const ContextMenu: React.FC = () => {
  const {
    selectedIds, elements, deleteElement, duplicateSelection,
    copySelection, paste, groupSelection, ungroupSelection,
    updateElement, pushHistory,
  } = useEditorStore();

  const [menu, setMenu] = useState<ContextMenuState | null>(null);

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      const target = e.target as HTMLElement;
      const elementId = target.closest('[data-element-id]')?.getAttribute('data-element-id');

      if (elementId && !selectedIds.includes(elementId)) {
        useEditorStore.getState().setSelectedIds([elementId]);
      }

      setMenu({ x: e.clientX, y: e.clientY, elementId: elementId || null });
    };

    const handleClick = () => setMenu(null);

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('click', handleClick);
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('click', handleClick);
    };
  }, [selectedIds]);

  if (!menu) return null;

  const hasSelection = selectedIds.length > 0;
  const isGroup = selectedIds.length === 1 && elements[selectedIds[0]]?.type === 'group';
  const canGroup = selectedIds.length >= 2;

  const items = [
    { label: 'Copy', shortcut: 'Ctrl+C', action: copySelection, disabled: !hasSelection },
    { label: 'Paste', shortcut: 'Ctrl+V', action: paste, disabled: false },
    { label: 'Duplicate', shortcut: 'Ctrl+D', action: duplicateSelection, disabled: !hasSelection },
    { divider: true },
    { label: 'Group', shortcut: 'Ctrl+G', action: groupSelection, disabled: !canGroup },
    { label: 'Ungroup', shortcut: 'Ctrl+Shift+G', action: ungroupSelection, disabled: !isGroup },
    { divider: true },
    { label: 'Bring to Front', action: () => {
      selectedIds.forEach((id) => updateElement(id, { zIndex: 999 }));
      pushHistory();
    }, disabled: !hasSelection },
    { label: 'Send to Back', action: () => {
      selectedIds.forEach((id) => updateElement(id, { zIndex: -999 }));
      pushHistory();
    }, disabled: !hasSelection },
    { divider: true },
    { label: 'Delete', shortcut: 'Del', action: () => {
      selectedIds.forEach((id) => deleteElement(id));
    }, disabled: !hasSelection, danger: true },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        left: menu.x,
        top: menu.y,
        background: '#1e1e1e',
        border: '1px solid #333',
        borderRadius: 6,
        padding: 4,
        minWidth: 180,
        zIndex: 10000,
        boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {items.map((item, i) => {
        if ('divider' in item) {
          return <div key={i} style={{ height: 1, background: '#2a2a2a', margin: '4px 0' }} />;
        }
        return (
          <button
            key={i}
            onClick={() => { item.action(); setMenu(null); }}
            disabled={item.disabled}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '6px 12px',
              background: 'transparent',
              border: 'none',
              cursor: item.disabled ? 'default' : 'pointer',
              color: item.disabled ? '#444' : (item as any).danger ? '#ef4444' : '#ccc',
              fontSize: 12,
              textAlign: 'left',
              borderRadius: 4,
            }}
            onMouseEnter={(e) => { if (!item.disabled) e.currentTarget.style.background = '#252525'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            <span>{item.label}</span>
            {item.shortcut && (
              <span style={{ fontSize: 10, color: '#555', marginLeft: 16 }}>{item.shortcut}</span>
            )}
          </button>
        );
      })}
    </div>
  );
};
