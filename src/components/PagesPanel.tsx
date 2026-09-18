import React, { useState } from 'react';
import { useEditorStore } from '../store';
import { Icons } from './Icons';

export const PagesPanel: React.FC = () => {
  const { currentProject, setCurrentProject, setElements, updateCurrentPage } = useEditorStore();
  const [renaming, setRenaming] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  if (!currentProject) return null;

  const pages = Object.values(currentProject.pages);
  const currentPage = currentProject.pages[currentProject.currentPageId];

  const handleSwitchPage = (pageId: string) => {
    if (pageId === currentProject.currentPageId) return;
    const page = currentProject.pages[pageId];
    if (!page) return;

    // Save current page state
    const { elements, rootIds } = useEditorStore.getState();
    const updated = {
      ...currentProject,
      currentPageId: pageId,
      pages: {
        ...currentProject.pages,
        [currentProject.currentPageId]: {
          ...currentPage!,
          elements,
          rootIds,
        },
      },
    };
    setCurrentProject(updated);
    setElements(page.elements, page.rootIds);
  };

  const handleAddPage = () => {
    const { elements, rootIds } = useEditorStore.getState();
    const pageId = `page-${Date.now()}`;
    const newPage = {
      id: pageId,
      name: `Page ${pages.length + 1}`,
      elements: {},
      rootIds: [],
      width: 1440,
      height: 900,
      background: '#ffffff',
    };
    const updated = {
      ...currentProject,
      pages: {
        ...currentProject.pages,
        [currentProject.currentPageId]: {
          ...currentPage!,
          elements,
          rootIds,
        },
        [pageId]: newPage,
      },
      currentPageId: pageId,
      updatedAt: Date.now(),
    };
    setCurrentProject(updated);
    setElements({}, []);
  };

  const handleRename = (pageId: string) => {
    setRenaming(pageId);
    setRenameValue(currentProject.pages[pageId].name);
  };

  const handleRenameSubmit = (pageId: string) => {
    if (renameValue.trim()) {
      const page = currentProject.pages[pageId];
      const updated = {
        ...currentProject,
        pages: {
          ...currentProject.pages,
          [pageId]: { ...page, name: renameValue.trim() },
        },
      };
      setCurrentProject(updated);
    }
    setRenaming(null);
  };

  return (
    <div style={{
      width: 200,
      background: '#1a1a1a',
      borderRight: '1px solid #2a2a2a',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        height: 36,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 12px',
        borderBottom: '1px solid #2a2a2a',
        flexShrink: 0,
      }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#aaa' }}>
          Pages
        </span>
        <button
          onClick={handleAddPage}
          title="Add page"
          style={{
            width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: '#252525', border: '1px solid #333', borderRadius: 4, cursor: 'pointer', color: '#888',
          }}
        >
          <Icons.Plus size={12} />
        </button>
      </div>

      {/* Page list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 0' }}>
        {pages.map((page) => {
          const isActive = page.id === currentProject.currentPageId;
          return (
            <div
              key={page.id}
              onClick={() => handleSwitchPage(page.id)}
              onDoubleClick={() => handleRename(page.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                height: 32,
                padding: '0 8px',
                margin: '1px 4px',
                borderRadius: 4,
                background: isActive ? '#2563eb22' : 'transparent',
                borderLeft: isActive ? '2px solid #3b82f6' : '2px solid transparent',
                cursor: 'pointer',
                gap: 8,
              }}
            >
              <Icons.Frame size={12} />
              {renaming === page.id ? (
                <input
                  autoFocus
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onBlur={() => handleRenameSubmit(page.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRenameSubmit(page.id);
                    if (e.key === 'Escape') setRenaming(null);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    flex: 1, background: '#111', border: '1px solid #3b82f6', borderRadius: 2,
                    color: '#fff', fontSize: 11, padding: '2px 4px', outline: 'none',
                  }}
                />
              ) : (
                <span style={{
                  flex: 1, fontSize: 12,
                  color: isActive ? '#fff' : '#aaa',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {page.name}
                </span>
              )}
              <span style={{ fontSize: 10, color: '#444' }}>
                {Object.keys(page.elements).length}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
