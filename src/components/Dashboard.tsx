import React, { useState, useEffect } from 'react';
import { useEditorStore } from '../store';
import { Icons } from './Icons';
import { loadProjects, saveProject, deleteProject, type StoredProject } from '../utils/storage';
import { importWebsite, createDemoWebsite } from '../utils/importer';
import { v4 as uuid } from 'uuid';
import { showToast } from './Toast';

export const Dashboard: React.FC = () => {
  const { setView, setCurrentProject, setElements, importLoading, setImportLoading } = useEditorStore();
  const [projects, setProjects] = useState<StoredProject[]>([]);
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadProjects().then(setProjects);
  }, []);

  const handleImport = async () => {
    if (!url.trim()) { setError('Please enter a URL'); return; }
    try {
      new URL(url);
    } catch {
      setError('Please enter a valid URL');
      return;
    }
    setError('');
    setImportLoading(true);
    try {
      const result = await importWebsite(url);
      const projectId = uuid();
      const pageId = uuid();
      const project: StoredProject = {
        id: projectId,
        name: new URL(url).hostname,
        sourceUrl: url,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        currentPageId: pageId,
        pages: {
          [pageId]: {
            id: pageId,
            name: 'Home',
            elements: result.elements,
            rootIds: result.rootIds,
            width: 1440,
            height: 900,
            background: '#ffffff',
          },
        },
        thumbnail: '',
      };
      await saveProject(project);
      setCurrentProject(project);
      setElements(result.elements, result.rootIds);
      setView('editor');
      showToast('Website imported successfully!', 'success');
    } catch (err: any) {
      setError(err.message || 'Failed to import website');
      showToast(err.message || 'Failed to import website', 'error');
    } finally {
      setImportLoading(false);
    }
  };

  const handleBlankCanvas = () => {
    const projectId = uuid();
    const pageId = uuid();
    const project: StoredProject = {
      id: projectId,
      name: 'Untitled',
      sourceUrl: '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      currentPageId: pageId,
      pages: {
        [pageId]: {
          id: pageId,
          name: 'Page 1',
          elements: {},
          rootIds: [],
          width: 1440,
          height: 900,
          background: '#ffffff',
        },
      },
      thumbnail: '',
    };
    saveProject(project);
    setCurrentProject(project);
    setElements({}, []);
    setView('editor');
  };

  const handleOpenProject = async (proj: StoredProject) => {
    setCurrentProject(proj);
    const page = proj.pages[proj.currentPageId];
    if (page) {
      setElements(page.elements, page.rootIds);
    }
    setView('editor');
  };

  const handleDeleteProject = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteProject(id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0f0f0f',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
    }}>
      {/* Loading overlay */}
      {importLoading && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          gap: 16,
        }}>
          <div style={{
            width: 40,
            height: 40,
            border: '3px solid #333',
            borderTop: '3px solid #6366f1',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }} />
          <div style={{ fontSize: 14, color: '#aaa' }}>Importing website...</div>
          <div style={{ fontSize: 12, color: '#555' }}>Fetching and parsing HTML/CSS</div>
        </div>
      )}
      {/* Header */}
      <header style={{
        padding: '20px 40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #1a1a1a',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 700, color: '#fff',
          }}>DZ</div>
          <span style={{ fontSize: 18, fontWeight: 600, letterSpacing: -0.5 }}>DeepZen</span>
        </div>
        <span style={{ fontSize: 12, color: '#555' }}>Browser-based Web Design Editor</span>
      </header>

      {/* Main content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 40px' }}>
        {/* Import section */}
        <div style={{ width: '100%', maxWidth: 640, textAlign: 'center', marginBottom: 60 }}>
          <h1 style={{ fontSize: 32, fontWeight: 600, marginBottom: 8, letterSpacing: -0.5 }}>
            Turn any website into an editable design
          </h1>
          <p style={{ color: '#666', fontSize: 15, marginBottom: 32 }}>
            Import a public website and edit it like a design file
          </p>

          {/* URL Input */}
          <div style={{
            display: 'flex',
            gap: 8,
            background: '#1a1a1a',
            border: '1px solid #2a2a2a',
            borderRadius: 8,
            padding: 6,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, padding: '0 12px' }}>
              <Icons.Globe size={16} />
              <input
                value={url}
                onChange={(e) => { setUrl(e.target.value); setError(''); }}
                onKeyDown={(e) => { if (e.key === 'Enter') handleImport(); }}
                placeholder="https://example.com"
                style={{
                  flex: 1, background: 'transparent', border: 'none', outline: 'none',
                  color: '#fff', fontSize: 14, padding: '10px 0',
                }}
                disabled={importLoading}
              />
            </div>
            <button
              onClick={handleImport}
              disabled={importLoading}
              style={{
                padding: '10px 20px',
                background: importLoading ? '#333' : '#6366f1',
                border: 'none',
                borderRadius: 6,
                color: '#fff',
                fontSize: 13,
                fontWeight: 500,
                cursor: importLoading ? 'wait' : 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {importLoading ? 'Importing...' : 'Import Website'}
            </button>
          </div>

          {error && (
            <p style={{ color: '#ef4444', fontSize: 12, marginTop: 8 }}>{error}</p>
          )}

          <div style={{ marginTop: 16, display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button
              onClick={handleBlankCanvas}
              style={{
                padding: '8px 16px',
                background: 'transparent',
                border: '1px solid #2a2a2a',
                borderRadius: 6,
                color: '#888',
                fontSize: 12,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Icons.Plus size={12} /> Blank Canvas
            </button>
            <button
              onClick={() => {
                const result = createDemoWebsite();
                const projectId = uuid();
                const pageId = uuid();
                const project: StoredProject = {
                  id: projectId,
                  name: 'Demo Website',
                  sourceUrl: '',
                  createdAt: Date.now(),
                  updatedAt: Date.now(),
                  currentPageId: pageId,
                  pages: {
                    [pageId]: {
                      id: pageId,
                      name: 'Home',
                      elements: result.elements,
                      rootIds: result.rootIds,
                      width: 1440,
                      height: 2400,
                      background: '#ffffff',
                    },
                  },
                  thumbnail: '',
                };
                saveProject(project);
                setCurrentProject(project);
                setElements(result.elements, result.rootIds);
                setView('editor');
              }}
              style={{
                padding: '8px 16px',
                background: '#252525',
                border: '1px solid #333',
                borderRadius: 6,
                color: '#aaa',
                fontSize: 12,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Icons.Frame size={12} /> Load Demo
            </button>
          </div>
        </div>

        {/* Recent Projects */}
        {projects.length > 0 && (
          <div style={{ width: '100%', maxWidth: 900 }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, color: '#888', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Recent Projects
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260, 1fr))', gap: 12 }}>
              {projects.map((proj) => (
                <div
                  key={proj.id}
                  onClick={() => handleOpenProject(proj)}
                  style={{
                    background: '#1a1a1a',
                    border: '1px solid #2a2a2a',
                    borderRadius: 8,
                    padding: 16,
                    cursor: 'pointer',
                    position: 'relative',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#3b82f6')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#2a2a2a')}
                >
                  <div style={{
                    height: 100,
                    background: '#252525',
                    borderRadius: 4,
                    marginBottom: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                  }}>
                    {proj.thumbnail ? (
                      <img src={proj.thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <Icons.Globe size={24} />
                    )}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>{proj.name}</div>
                  {proj.sourceUrl && (
                    <div style={{ fontSize: 11, color: '#555', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {proj.sourceUrl}
                    </div>
                  )}
                  <div style={{ fontSize: 10, color: '#444' }}>
                    {new Date(proj.updatedAt).toLocaleDateString()}
                  </div>
                  <button
                    onClick={(e) => handleDeleteProject(proj.id, e)}
                    style={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      width: 24, height: 24,
                      background: '#1a1a1a',
                      border: '1px solid #333',
                      borderRadius: 4,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      color: '#666',
                      opacity: 0,
                    }}
                    className="delete-btn"
                  >
                    <Icons.Trash size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
