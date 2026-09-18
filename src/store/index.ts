import { create } from 'zustand';
import { v4 as uuid } from 'uuid';
import type {
  DesignElement,
  ElementType,
  Tool,
  ViewportMode,
  CanvasTransform,
  HistoryState,
  Page,
  Project,
} from '../types';

interface EditorState {
  // View
  view: 'dashboard' | 'editor' | 'preview';
  setView: (view: 'dashboard' | 'editor' | 'preview') => void;

  // Project
  currentProject: Project | null;
  setCurrentProject: (project: Project | null) => void;
  updateProjectName: (name: string) => void;

  // Current page
  getCurrentPage: () => Page | null;
  updateCurrentPage: (updates: Partial<Page>) => void;

  // Elements
  elements: Record<string, DesignElement>;
  rootIds: string[];
  addElement: (element: DesignElement) => void;
  updateElement: (id: string, updates: Partial<DesignElement>) => void;
  deleteElement: (id: string) => void;
  setElements: (elements: Record<string, DesignElement>, rootIds: string[]) => void;

  // Selection
  selectedIds: string[];
  setSelectedIds: (ids: string[]) => void;
  addToSelection: (id: string) => void;
  clearSelection: () => void;

  // Tool
  activeTool: Tool;
  setActiveTool: (tool: Tool) => void;

  // Canvas
  canvasTransform: CanvasTransform;
  setCanvasTransform: (transform: CanvasTransform) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  zoomToFit: () => void;
  resetZoom: () => void;

  // Viewport
  viewportMode: ViewportMode;
  setViewportMode: (mode: ViewportMode) => void;

  // History
  history: HistoryState[];
  historyIndex: number;
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;

  // Clipboard
  clipboard: DesignElement[];
  copySelection: () => void;
  paste: () => void;
  duplicateSelection: () => void;

  // Panels
  layersOpen: boolean;
  propertiesOpen: boolean;
  toggleLayers: () => void;
  toggleProperties: () => void;

  // Command menu
  commandMenuOpen: boolean;
  setCommandMenuOpen: (open: boolean) => void;

  // Import
  importLoading: boolean;
  setImportLoading: (loading: boolean) => void;
}

const createDefaultElement = (type: ElementType, x: number, y: number): DesignElement => ({
  id: uuid(),
  type,
  name: type.charAt(0).toUpperCase() + type.slice(1),
  parentId: null,
  children: [],
  x,
  y,
  width: type === 'frame' ? 1440 : 200,
  height: type === 'frame' ? 900 : 100,
  rotation: 0,
  opacity: 1,
  visible: true,
  locked: false,
  background: type === 'frame' ? '#ffffff' : 'transparent',
  border: { width: 0, style: 'solid', color: '#000000' },
  borderRadius: 0,
  shadow: null,
  padding: { top: 0, right: 0, bottom: 0, left: 0 },
  margin: { top: 0, right: 0, bottom: 0, left: 0 },
  display: 'block',
  position: 'absolute',
  typography: type === 'text' || type === 'heading' || type === 'paragraph' || type === 'button' ? {
    fontFamily: 'Inter, sans-serif',
    fontSize: type === 'heading' ? 32 : 16,
    fontWeight: type === 'heading' ? 700 : 400,
    lineHeight: 1.5,
    letterSpacing: 0,
    textAlign: 'left',
    textTransform: 'none',
    color: '#000000',
  } : null,
  layout: {
    display: 'block',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    gap: 0,
    gridColumns: '',
    gridRows: '',
  },
  content: type === 'text' ? 'Text' : type === 'heading' ? 'Heading' : '',
  src: '',
  href: '',
  tag: type === 'heading' ? 'h2' : type === 'paragraph' ? 'p' : 'div',
  zIndex: 0,
  overflow: 'visible',
});

export const useEditorStore = create<EditorState>((set, get) => ({
  view: 'dashboard',
  setView: (view) => set({ view }),

  currentProject: null,
  setCurrentProject: (project) => set({ currentProject: project }),
  updateProjectName: (name) => {
    const { currentProject } = get();
    if (currentProject) {
      set({ currentProject: { ...currentProject, name, updatedAt: Date.now() } });
    }
  },

  getCurrentPage: () => {
    const { currentProject } = get();
    if (!currentProject) return null;
    return currentProject.pages[currentProject.currentPageId] || null;
  },

  updateCurrentPage: (updates) => {
    const { currentProject } = get();
    if (!currentProject) return;
    const page = currentProject.pages[currentProject.currentPageId];
    if (!page) return;
    const newPage = { ...page, ...updates };
    set({
      currentProject: {
        ...currentProject,
        pages: { ...currentProject.pages, [currentProject.currentPageId]: newPage },
        updatedAt: Date.now(),
      },
    });
  },

  elements: {},
  rootIds: [],
  addElement: (element) => {
    const { elements, rootIds } = get();
    const newElements = { ...elements, [element.id]: element };
    const newRootIds = element.parentId ? rootIds : [...rootIds, element.id];
    set({ elements: newElements, rootIds: newRootIds });
    get().pushHistory();
  },
  updateElement: (id, updates) => {
    const { elements } = get();
    const el = elements[id];
    if (!el) return;
    set({ elements: { ...elements, [id]: { ...el, ...updates } } });
  },
  deleteElement: (id) => {
    const { elements, rootIds, selectedIds } = get();
    const el = elements[id];
    if (!el) return;
    // Delete children recursively
    const toDelete = new Set<string>();
    const collectChildren = (eid: string) => {
      toDelete.add(eid);
      const e = elements[eid];
      if (e) e.children.forEach(collectChildren);
    };
    collectChildren(id);
    const newElements = { ...elements };
    toDelete.forEach((did) => delete newElements[did]);
    // Remove from parent
    if (el.parentId && newElements[el.parentId]) {
      newElements[el.parentId] = {
        ...newElements[el.parentId],
        children: newElements[el.parentId].children.filter((c) => c !== id),
      };
    }
    const newRootIds = rootIds.filter((r) => !toDelete.has(r));
    set({
      elements: newElements,
      rootIds: newRootIds,
      selectedIds: selectedIds.filter((s) => !toDelete.has(s)),
    });
    get().pushHistory();
  },
  setElements: (elements, rootIds) => set({ elements, rootIds }),

  selectedIds: [],
  setSelectedIds: (ids) => set({ selectedIds: ids }),
  addToSelection: (id) => set((s) => ({ selectedIds: [...s.selectedIds, id] })),
  clearSelection: () => set({ selectedIds: [] }),

  activeTool: 'select',
  setActiveTool: (tool) => set({ activeTool: tool }),

  canvasTransform: { x: 0, y: 0, scale: 1 },
  setCanvasTransform: (transform) => set({ canvasTransform: transform }),
  zoomIn: () => {
    const { canvasTransform } = get();
    const newScale = Math.min(canvasTransform.scale * 1.2, 5);
    set({ canvasTransform: { ...canvasTransform, scale: newScale } });
  },
  zoomOut: () => {
    const { canvasTransform } = get();
    const newScale = Math.max(canvasTransform.scale / 1.2, 0.1);
    set({ canvasTransform: { ...canvasTransform, scale: newScale } });
  },
  zoomToFit: () => set({ canvasTransform: { x: 0, y: 0, scale: 0.7 } }),
  resetZoom: () => set({ canvasTransform: { x: 0, y: 0, scale: 1 } }),

  viewportMode: 'desktop',
  setViewportMode: (mode) => set({ viewportMode: mode }),

  history: [],
  historyIndex: -1,
  pushHistory: () => {
    const { elements, rootIds, history, historyIndex } = get();
    const state: HistoryState = {
      elements: JSON.parse(JSON.stringify(elements)),
      rootIds: [...rootIds],
    };
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(state);
    if (newHistory.length > 50) newHistory.shift();
    set({ history: newHistory, historyIndex: newHistory.length - 1 });
  },
  undo: () => {
    const { historyIndex, history } = get();
    if (historyIndex <= 0) return;
    const newIndex = historyIndex - 1;
    const state = history[newIndex];
    set({
      elements: JSON.parse(JSON.stringify(state.elements)),
      rootIds: [...state.rootIds],
      historyIndex: newIndex,
      selectedIds: [],
    });
  },
  redo: () => {
    const { historyIndex, history } = get();
    if (historyIndex >= history.length - 1) return;
    const newIndex = historyIndex + 1;
    const state = history[newIndex];
    set({
      elements: JSON.parse(JSON.stringify(state.elements)),
      rootIds: [...state.rootIds],
      historyIndex: newIndex,
      selectedIds: [],
    });
  },

  clipboard: [],
  copySelection: () => {
    const { selectedIds, elements } = get();
    const copied = selectedIds.map((id) => JSON.parse(JSON.stringify(elements[id]))).filter(Boolean);
    set({ clipboard: copied });
  },
  paste: () => {
    const { clipboard, elements } = get();
    if (clipboard.length === 0) return;
    const newIds: string[] = [];
    const newElements = { ...elements };
    clipboard.forEach((el) => {
      const newId = uuid();
      const newEl = { ...JSON.parse(JSON.stringify(el)), id: newId, x: el.x + 20, y: el.y + 20 };
      newElements[newId] = newEl;
      newIds.push(newId);
    });
    set({ elements: newElements, selectedIds: newIds });
    get().pushHistory();
  },
  duplicateSelection: () => {
    get().copySelection();
    get().paste();
  },

  layersOpen: true,
  propertiesOpen: true,
  toggleLayers: () => set((s) => ({ layersOpen: !s.layersOpen })),
  toggleProperties: () => set((s) => ({ propertiesOpen: !s.propertiesOpen })),

  commandMenuOpen: false,
  setCommandMenuOpen: (open) => set({ commandMenuOpen: open }),

  importLoading: false,
  setImportLoading: (loading) => set({ importLoading: loading }),
}));

export { createDefaultElement };
