import React, { useEffect } from 'react';
import { useEditorStore } from './store';
import { Canvas } from './components/Canvas';
import { Toolbar } from './components/Toolbar';
import { LeftToolbar } from './components/LeftToolbar';
import { LayersPanel } from './components/LayersPanel';
import { PropertiesPanel } from './components/PropertiesPanel';
import { CommandMenu } from './components/CommandMenu';
import { Dashboard } from './components/Dashboard';
import { Preview } from './components/Preview';
import { saveProject } from './utils/storage';

const Editor: React.FC = () => {
  const { currentProject, elements, rootIds } = useEditorStore();

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
        <PropertiesPanel />
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
        <div style={{ flex: 1 }} />
        <span>DeepZen v0.1</span>
      </div>
      <CommandMenu />
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
    </>
  );
}

export default App;
