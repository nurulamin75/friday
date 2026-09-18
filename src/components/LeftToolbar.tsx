import React from 'react';
import { useEditorStore } from '../store';
import { Icons } from './Icons';

export const LeftToolbar: React.FC = () => {
  const { activeTool, setActiveTool } = useEditorStore();

  const tools: { id: string; icon: React.ReactNode; label: string; shortcut: string }[] = [
    { id: 'select', icon: <Icons.Cursor size={18} />, label: 'Select', shortcut: 'V' },
    { id: 'frame', icon: <Icons.Frame size={18} />, label: 'Frame', shortcut: 'F' },
    { id: 'rectangle', icon: <Icons.Rectangle size={18} />, label: 'Rectangle', shortcut: 'R' },
    { id: 'ellipse', icon: <Icons.Ellipse size={18} />, label: 'Ellipse', shortcut: 'O' },
    { id: 'line', icon: <Icons.Line size={18} />, label: 'Line', shortcut: 'L' },
    { id: 'text', icon: <Icons.Text size={18} />, label: 'Text', shortcut: 'T' },
    { id: 'hand', icon: <Icons.Hand size={18} />, label: 'Hand', shortcut: 'H' },
  ];

  return (
    <div style={{
      width: 44,
      background: '#1a1a1a',
      borderRight: '1px solid #2a2a2a',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      paddingTop: 8,
      gap: 2,
      flexShrink: 0,
    }}>
      {tools.map((tool) => (
        <button
          key={tool.id}
          onClick={() => setActiveTool(tool.id as any)}
          title={`${tool.label} (${tool.shortcut})`}
          style={{
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: activeTool === tool.id ? '#333' : 'transparent',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
            color: activeTool === tool.id ? '#fff' : '#777',
          }}
        >
          {tool.icon}
        </button>
      ))}
    </div>
  );
};
