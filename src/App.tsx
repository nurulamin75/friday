import React, { useEffect, useState } from 'react';
import { useEditorStore } from './store';
import { Canvas } from './components/Canvas';
import { Toolbar } from './components/Toolbar';
import { LeftToolbar } from './components/LeftToolbar';
import { LayersPanel } from './components/LayersPanel';
import { PropertiesPanel } from './components/PropertiesPanel';
import { DesignTokens } from './components/DesignTokens';
import { CommandMenu } from './components/CommandMenu';
import { FindReplace } from './components/FindReplace';
import { ContextMenu } from './components/ContextMenu';
import { ToastContainer } from './components/Toast';
import { Dashboard } from './components/Dashboard';
import { Preview } from './components/Preview';
import { saveProject } from './utils/storage';

const Editor: React.FC = () => {
  const { currentProject, elements, rootIds } = useEditorStore();
  const [rightPanel, setRightPanel] = useState<'properties' | 'tokens'>('properties');

  // Auto-save
  useEffect(() => {
    if (!currentProject) return;
    const timer = setTimeout(() => {
      const page = currentProject.pages[currentProject.currentPageId];
      if (page) {
        const updated = {
          ...currentProject,
          updatedAt: Date.now(),
          pages: {
            ...currentProject.pages,
            [currentProject.currentPageId]: {
              ...page,
              elements,
              rootIds,
            },
          },
        };
        saveProject(updated);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [elements, rootIds, currentProject]);

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      background: '#0f0f0f',
    }}>
      <Toolbar />
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <LeftToolbar />
        <LayersPanel />
        <Canvas />
        <div style={{ display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
          {/* Right panel tabs */}
          <div style={{
            height: 32,
            display: 'flex',
            borderBottom: '1px solid #2a2a2a',
            background: '#1a1a1a',
          }}>
            <button
              onClick={() => setRightPanel('properties')}
              style={{
                flex: 1,
                background: rightPanel === 'properties' ? '#252525' : 'transparent',
                border: 'none',
                borderBottom: rightPanel === 'properties' ? '2px solid #3b82f6' : '2px solid transparent',
                color: rightPanel === 'properties' ? '#fff' : '#666',
                fontSize: 11,
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Properties
            </button>
            <button
              onClick={() => setRightPanel('tokens')}
              style={{
                flex: 1,
                background: rightPanel === 'tokens' ? '#252525' : 'transparent',
                border: 'none',
                borderBottom: rightPanel === 'tokens' ? '2px solid #3b82f6' : '2px solid transparent',
                color: rightPanel === 'tokens' ? '#fff' : '#666',
                fontSize: 11,
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Tokens
            </button>
          </div>
          {rightPanel === 'properties' ? <PropertiesPanel /> : <DesignTokens />}
        </div>
      </div>
      {/* Bottom bar */}
      <div style={{
        height: 28,
        background: '#1a1a1a',
        borderTop: '1px solid #2a2a2a',
        display: 'flex',
        alignItems: 'center',
        padding: '0 12px',
        gap: 12,
        fontSize: 11,
        color: '#555',
        flexShrink: 0,
      }}>
        <span>{Object.keys(elements).length} elements</span>
        <span>{rootIds.length} root layers</span>
        <div style={{ width: 1, height: 14, background: '#333' }} />
        <span>{currentProject?.sourceUrl ? new URL(currentProject.sourceUrl).hostname : 'Blank Canvas'}</span>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => useEditorStore.getState().zoomOut()}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#666', fontSize: 14, padding: '0 4px' }}
          >
            −
          </button>
          <button
            onClick={() => useEditorStore.getState().resetZoom()}
            style={{ background: '#252525', border: '1px solid #333', borderRadius: 3, cursor: 'pointer', color: '#aaa', fontSize: 10, padding: '2px 8px', minWidth: 45 }}
          >
            {Math.round(useEditorStore.getState().canvasTransform.scale * 100)}%
          </button>
          <button
            onClick={() => useEditorStore.getState().zoomIn()}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#666', fontSize: 14, padding: '0 4px' }}
          >
            +
          </button>
        </div>
        <div style={{ width: 1, height: 14, background: '#333' }} />
        <span>DeepZen v0.1</span>
      </div>
      <CommandMenu />
      <FindReplace />
      <ContextMenu />
    </div>
  );
};

function App() {
  const { view } = useEditorStore();

  return (
    <>
      {view === 'dashboard' && <Dashboard />}
      {view === 'editor' && <Editor />}
      {view === 'preview' && <Preview />}
      <ToastContainer />
    </>
  );
}

export default App;
