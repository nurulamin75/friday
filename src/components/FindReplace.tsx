import React, { useState, useEffect, useRef } from 'react';
import { useEditorStore } from '../store';
import { Icons } from './Icons';

export const FindReplace: React.FC = () => {
  const { elements, updateElement, pushHistory } = useEditorStore();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [replace, setReplace] = useState('');
  const [matchCount, setMatchCount] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  useEffect(() => {
    if (!search) { setMatchCount(0); return; }
    let count = 0;
    Object.values(elements).forEach((el) => {
      if (el.content && el.content.toLowerCase().includes(search.toLowerCase())) {
        count++;
      }
    });
    setMatchCount(count);
  }, [search, elements]);

  const handleReplaceAll = () => {
    if (!search) return;
    const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    Object.values(elements).forEach((el) => {
      if (el.content && regex.test(el.content)) {
        updateElement(el.id, { content: el.content.replace(regex, replace) });
      }
    });
    pushHistory();
  };

  if (!open) return null;

  return (
    <div style={{
      position: 'absolute',
      top: 8,
      right: 280,
      width: 340,
      background: '#1e1e1e',
      border: '1px solid #333',
      borderRadius: 8,
      padding: 12,
      zIndex: 1000,
      boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase' }}>Find & Replace</span>
        <button onClick={() => setOpen(false)} style={{
          background: 'transparent', border: 'none', cursor: 'pointer', color: '#666', display: 'flex',
        }}>
          <Icons.X size={14} />
        </button>
      </div>
      <div style={{ marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Icons.Search size={12} />
          <input
            ref={inputRef}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search text..."
            style={{
              flex: 1, background: '#252525', border: '1px solid #333', borderRadius: 4,
              color: '#ccc', fontSize: 12, padding: '6px 8px', outline: 'none',
            }}
          />
          {matchCount > 0 && (
            <span style={{ fontSize: 10, color: '#666', whiteSpace: 'nowrap' }}>{matchCount} found</span>
          )}
        </div>
      </div>
      <div style={{ marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Icons.Copy size={12} />
          <input
            value={replace}
            onChange={(e) => setReplace(e.target.value)}
            placeholder="Replace with..."
            onKeyDown={(e) => { if (e.key === 'Enter') handleReplaceAll(); }}
            style={{
              flex: 1, background: '#252525', border: '1px solid #333', borderRadius: 4,
              color: '#ccc', fontSize: 12, padding: '6px 8px', outline: 'none',
            }}
          />
        </div>
      </div>
      <button
        onClick={handleReplaceAll}
        disabled={!search || matchCount === 0}
        style={{
          width: '100%', padding: '6px 12px', background: matchCount > 0 ? '#3b82f6' : '#333',
          border: 'none', borderRadius: 4, color: '#fff', fontSize: 12, cursor: matchCount > 0 ? 'pointer' : 'default',
        }}
      >
        Replace All
      </button>
    </div>
  );
};
