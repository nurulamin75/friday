import React, { useState, useCallback } from 'react';
import { useEditorStore } from '../store';
import { Icons } from './Icons';
import type { DesignElement } from '../types';

const LayerItem: React.FC<{
  id: string;
  depth: number;
}> = ({ id, depth }) => {
  const { elements, selectedIds, setSelectedIds, updateElement, deleteElement } = useEditorStore();
  const [expanded, setExpanded] = useState(true);
  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState('');

  const el = elements[id];
  if (!el) return null;

  const isSelected = selectedIds.includes(id);
  const hasChildren = el.children.length > 0;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (e.shiftKey) {
      if (isSelected) setSelectedIds(selectedIds.filter((s) => s !== id));
      else setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds([id]);
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRenaming(true);
    setRenameValue(el.name);
  };

  const handleRenameSubmit = () => {
    if (renameValue.trim()) {
      updateElement(id, { name: renameValue.trim() });
    }
    setRenaming(false);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'frame': return <Icons.Frame size={12} />;
      case 'image': return <Icons.Image size={12} />;
      case 'text': case 'heading': case 'paragraph': return <Icons.Text size={12} />;
      case 'group': return <Icons.Group size={12} />;
      case 'section': case 'header': case 'nav': case 'main': case 'footer': return <Icons.Layers size={12} />;
      default: return <Icons.Rectangle size={12} />;
    }
  };

  return (
    <div>
      <div
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        style={{
          display: 'flex',
          alignItems: 'center',
          height: 26,
          paddingLeft: depth * 16 + 4,
          paddingRight: 4,
          background: isSelected ? '#2563eb22' : 'transparent',
          borderLeft: isSelected ? '2px solid #3b82f6' : '2px solid transparent',
          cursor: 'pointer',
          gap: 4,
          fontSize: 12,
          color: isSelected ? '#fff' : '#aaa',
        }}
      >
        {/* Expand/collapse */}
        <button
          onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
          style={{
            width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'transparent', border: 'none', cursor: 'pointer', color: '#666',
            visibility: hasChildren ? 'visible' : 'hidden',
          }}
        >
          {expanded ? <Icons.ChevronDown size={10} /> : <Icons.ChevronRight size={10} />}
        </button>

        {/* Type icon */}
        <span style={{ color: '#666', display: 'flex' }}>{getTypeIcon(el.type)}</span>

        {/* Name */}
        {renaming ? (
          <input
            autoFocus
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onBlur={handleRenameSubmit}
            onKeyDown={(e) => { if (e.key === 'Enter') handleRenameSubmit(); if (e.key === 'Escape') setRenaming(false); }}
            onClick={(e) => e.stopPropagation()}
            style={{
              flex: 1, background: '#111', border: '1px solid #3b82f6', borderRadius: 2,
              color: '#fff', fontSize: 11, padding: '1px 4px', outline: 'none',
            }}
          />
        ) : (
          <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {el.name}
          </span>
        )}

        {/* Visibility toggle */}
        <button
          onClick={(e) => { e.stopPropagation(); updateElement(id, { visible: !el.visible }); }}
          style={{
            width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: el.visible ? '#666' : '#444', opacity: el.visible ? 1 : 0.5,
          }}
          title={el.visible ? 'Hide' : 'Show'}
        >
          {el.visible ? <Icons.Eye size={11} /> : <Icons.EyeOff size={11} />}
        </button>

        {/* Lock toggle */}
        <button
          onClick={(e) => { e.stopPropagation(); updateElement(id, { locked: !el.locked }); }}
          style={{
            width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: el.locked ? '#f59e0b' : '#666',
          }}
          title={el.locked ? 'Unlock' : 'Lock'}
        >
          {el.locked ? <Icons.Lock size={11} /> : <Icons.Unlock size={11} />}
        </button>
      </div>

      {/* Children */}
      {expanded && hasChildren && el.children.map((childId) => (
        <LayerItem key={childId} id={childId} depth={depth + 1} />
      ))}
    </div>
  );
};

export const LayersPanel: React.FC = () => {
  const { rootIds, elements, selectedIds, deleteElement } = useEditorStore();

  const handleDeleteSelected = () => {
    selectedIds.forEach((id) => deleteElement(id));
  };

  return (
    <div style={{
      width: 220,
      background: '#1a1a1a',
      borderRight: '1px solid #2a2a2a',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        height: 32,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 8px',
        borderBottom: '1px solid #2a2a2a',
        flexShrink: 0,
      }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Layers
        </span>
        <div style={{ display: 'flex', gap: 2 }}>
          <button
            onClick={handleDeleteSelected}
            disabled={selectedIds.length === 0}
            title="Delete selected"
            style={{
              width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'transparent', border: 'none', borderRadius: 3, cursor: selectedIds.length > 0 ? 'pointer' : 'default',
              color: selectedIds.length > 0 ? '#888' : '#444',
            }}
          >
            <Icons.Trash size={12} />
          </button>
        </div>
      </div>

      {/* Layer list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 0' }}>
        {rootIds.length === 0 ? (
          <div style={{ padding: '20px 12px', textAlign: 'center', color: '#555', fontSize: 12 }}>
            No layers yet. Use tools to create elements or import a website.
          </div>
        ) : (
          rootIds.map((id) => (
            <LayerItem key={id} id={id} depth={0} />
          ))
        )}
      </div>
    </div>
  );
};
