import { create } from "zustand";
import type { DesignElement, InvitationDesign } from "@/types";

// ==================== HISTORY MANAGEMENT ====================
interface HistoryState {
  elements: DesignElement[];
  design: Partial<InvitationDesign>;
}

interface EditorStore {
  // State
  elements: DesignElement[];
  selectedElementId: string | null;
  selectedElementIds: string[];
  design: Partial<InvitationDesign>;
  isLoading: boolean;
  error: string | null;

  // History for undo/redo
  history: HistoryState[];
  historyIndex: number;
  maxHistorySize: number;

  // Clipboard
  clipboard: DesignElement | null;

  // Zoom & Pan
  zoom: number;
  panOffset: { x: number; y: number };

  // UI State
  showGrid: boolean;
  snapToGrid: boolean;
  gridSize: number;

  // Element Actions
  addElement: (element: DesignElement) => void;
  updateElement: (id: string, updates: Partial<DesignElement>) => void;
  deleteElement: (id: string) => void;
  duplicateElement: (id: string) => void;

  // Selection
  selectElement: (id: string | null) => void;
  selectMultipleElements: (ids: string[]) => void;
  clearSelection: () => void;

  // Layer Management
  moveElementUp: (id: string) => void;
  moveElementDown: (id: string) => void;
  moveElementToTop: (id: string) => void;
  moveElementToBottom: (id: string) => void;
  lockElement: (id: string) => void;
  unlockElement: (id: string) => void;
  hideElement: (id: string) => void;
  showElement: (id: string) => void;

  // History Actions
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  saveToHistory: () => void;

  // Clipboard Actions
  copyElement: (id: string) => void;
  cutElement: (id: string) => void;
  pasteElement: () => void;

  // Design Actions
  updateDesign: (updates: Partial<InvitationDesign>) => void;
  setElements: (elements: DesignElement[]) => void;

  // Zoom & Pan
  setZoom: (zoom: number) => void;
  setPanOffset: (offset: { x: number; y: number }) => void;
  resetView: () => void;

  // UI Actions
  toggleGrid: () => void;
  toggleSnapToGrid: () => void;
  setGridSize: (size: number) => void;

  // Utility
  getElementById: (id: string) => DesignElement | undefined;
  getSelectedElement: () => DesignElement | undefined;
  clearError: () => void;
  reset: () => void;
}

const generateId = () => `el_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const useEditorStore = create<EditorStore>((set, get) => ({
  // Initial State
  elements: [],
  selectedElementId: null,
  selectedElementIds: [],
  design: {},
  isLoading: false,
  error: null,

  // History
  history: [],
  historyIndex: -1,
  maxHistorySize: 50,

  // Clipboard
  clipboard: null,

  // Zoom & Pan
  zoom: 1,
  panOffset: { x: 0, y: 0 },

  // UI State
  showGrid: true,
  snapToGrid: true,
  gridSize: 10,

  // ==================== ELEMENT ACTIONS ====================
  addElement: (element) => {
    const state = get();
    state.saveToHistory();

    const newElement = {
      ...element,
      id: element.id || generateId(),
      zIndex: state.elements.length,
    };

    set((state) => ({
      elements: [...state.elements, newElement],
      selectedElementId: newElement.id,
    }));
  },

  updateElement: (id, updates) => {
    const state = get();
    state.saveToHistory();

    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, ...updates } : el
      ),
    }));
  },

  deleteElement: (id) => {
    const state = get();
    state.saveToHistory();

    set((state) => ({
      elements: state.elements.filter((el) => el.id !== id),
      selectedElementId: state.selectedElementId === id ? null : state.selectedElementId,
      selectedElementIds: state.selectedElementIds.filter((elId) => elId !== id),
    }));
  },

  duplicateElement: (id) => {
    const state = get();
    const element = state.elements.find((el) => el.id === id);

    if (!element) return;

    state.saveToHistory();

    const newElement: DesignElement = {
      ...element,
      id: generateId(),
      position: {
        x: element.position.x + 20,
        y: element.position.y + 20,
      },
      zIndex: state.elements.length,
    };

    set((state) => ({
      elements: [...state.elements, newElement],
      selectedElementId: newElement.id,
    }));
  },

  // ==================== SELECTION ====================
  selectElement: (id) => {
    set({ selectedElementId: id, selectedElementIds: id ? [id] : [] });
  },

  selectMultipleElements: (ids) => {
    set({ selectedElementIds: ids, selectedElementId: ids[0] || null });
  },

  clearSelection: () => {
    set({ selectedElementId: null, selectedElementIds: [] });
  },

  // ==================== LAYER MANAGEMENT ====================
  moveElementUp: (id) => {
    const state = get();
    const element = state.elements.find((el) => el.id === id);
    if (!element) return;

    state.saveToHistory();

    const sortedElements = [...state.elements].sort((a, b) => a.zIndex - b.zIndex);
    const currentIndex = sortedElements.findIndex((el) => el.id === id);

    if (currentIndex < sortedElements.length - 1) {
      const nextElement = sortedElements[currentIndex + 1];
      set((state) => ({
        elements: state.elements.map((el) => {
          if (el.id === id) return { ...el, zIndex: nextElement.zIndex };
          if (el.id === nextElement.id) return { ...el, zIndex: element.zIndex };
          return el;
        }),
      }));
    }
  },

  moveElementDown: (id) => {
    const state = get();
    const element = state.elements.find((el) => el.id === id);
    if (!element) return;

    state.saveToHistory();

    const sortedElements = [...state.elements].sort((a, b) => a.zIndex - b.zIndex);
    const currentIndex = sortedElements.findIndex((el) => el.id === id);

    if (currentIndex > 0) {
      const prevElement = sortedElements[currentIndex - 1];
      set((state) => ({
        elements: state.elements.map((el) => {
          if (el.id === id) return { ...el, zIndex: prevElement.zIndex };
          if (el.id === prevElement.id) return { ...el, zIndex: element.zIndex };
          return el;
        }),
      }));
    }
  },

  moveElementToTop: (id) => {
    const state = get();
    state.saveToHistory();

    const maxZIndex = Math.max(...state.elements.map((el) => el.zIndex), 0);
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, zIndex: maxZIndex + 1 } : el
      ),
    }));
  },

  moveElementToBottom: (id) => {
    const state = get();
    state.saveToHistory();

    const minZIndex = Math.min(...state.elements.map((el) => el.zIndex), 0);
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, zIndex: minZIndex - 1 } : el
      ),
    }));
  },

  lockElement: (id) => {
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, locked: true } : el
      ),
    }));
  },

  unlockElement: (id) => {
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, locked: false } : el
      ),
    }));
  },

  hideElement: (id) => {
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, hidden: true } : el
      ),
    }));
  },

  showElement: (id) => {
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, hidden: false } : el
      ),
    }));
  },

  // ==================== HISTORY (UNDO/REDO) ====================
  saveToHistory: () => {
    const state = get();
    const currentState: HistoryState = {
      elements: JSON.parse(JSON.stringify(state.elements)),
      design: JSON.parse(JSON.stringify(state.design)),
    };

    // Remove any future history if we're not at the end
    const newHistory = state.history.slice(0, state.historyIndex + 1);
    newHistory.push(currentState);

    // Limit history size
    if (newHistory.length > state.maxHistorySize) {
      newHistory.shift();
    }

    set({
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  undo: () => {
    const state = get();
    if (!state.canUndo()) return;

    const newIndex = state.historyIndex - 1;
    const previousState = state.history[newIndex];

    if (previousState) {
      set({
        elements: JSON.parse(JSON.stringify(previousState.elements)),
        design: JSON.parse(JSON.stringify(previousState.design)),
        historyIndex: newIndex,
      });
    }
  },

  redo: () => {
    const state = get();
    if (!state.canRedo()) return;

    const newIndex = state.historyIndex + 1;
    const nextState = state.history[newIndex];

    if (nextState) {
      set({
        elements: JSON.parse(JSON.stringify(nextState.elements)),
        design: JSON.parse(JSON.stringify(nextState.design)),
        historyIndex: newIndex,
      });
    }
  },

  canUndo: () => {
    const state = get();
    return state.historyIndex > 0;
  },

  canRedo: () => {
    const state = get();
    return state.historyIndex < state.history.length - 1;
  },

  // ==================== CLIPBOARD ====================
  copyElement: (id) => {
    const state = get();
    const element = state.elements.find((el) => el.id === id);
    if (element) {
      set({ clipboard: JSON.parse(JSON.stringify(element)) });
    }
  },

  cutElement: (id) => {
    const state = get();
    state.copyElement(id);
    state.deleteElement(id);
  },

  pasteElement: () => {
    const state = get();
    if (!state.clipboard) return;

    const newElement: DesignElement = {
      ...state.clipboard,
      id: generateId(),
      position: {
        x: state.clipboard.position.x + 20,
        y: state.clipboard.position.y + 20,
      },
      zIndex: state.elements.length,
    };

    state.addElement(newElement);
  },

  // ==================== DESIGN ACTIONS ====================
  updateDesign: (updates) => {
    const state = get();
    state.saveToHistory();

    set((state) => ({
      design: { ...state.design, ...updates },
    }));
  },

  setElements: (elements) => {
    set({ elements });
  },

  // ==================== ZOOM & PAN ====================
  setZoom: (zoom) => {
    set({ zoom: Math.max(0.1, Math.min(3, zoom)) });
  },

  setPanOffset: (offset) => {
    set({ panOffset: offset });
  },

  resetView: () => {
    set({ zoom: 1, panOffset: { x: 0, y: 0 } });
  },

  // ==================== UI ACTIONS ====================
  toggleGrid: () => {
    set((state) => ({ showGrid: !state.showGrid }));
  },

  toggleSnapToGrid: () => {
    set((state) => ({ snapToGrid: !state.snapToGrid }));
  },

  setGridSize: (size) => {
    set({ gridSize: size });
  },

  // ==================== UTILITY ====================
  getElementById: (id) => {
    return get().elements.find((el) => el.id === id);
  },

  getSelectedElement: () => {
    const state = get();
    return state.elements.find((el) => el.id === state.selectedElementId);
  },

  clearError: () => set({ error: null }),

  reset: () => {
    set({
      elements: [],
      selectedElementId: null,
      selectedElementIds: [],
      design: {},
      history: [],
      historyIndex: -1,
      clipboard: null,
      zoom: 1,
      panOffset: { x: 0, y: 0 },
      error: null,
    });
  },
}));

// Keyboard shortcuts hook helper
export const EDITOR_SHORTCUTS = {
  undo: ["ctrl+z", "meta+z"],
  redo: ["ctrl+y", "meta+y", "ctrl+shift+z", "meta+shift+z"],
  copy: ["ctrl+c", "meta+c"],
  cut: ["ctrl+x", "meta+x"],
  paste: ["ctrl+v", "meta+v"],
  delete: ["delete", "backspace"],
  selectAll: ["ctrl+a", "meta+a"],
  deselect: ["escape"],
  moveUp: ["ctrl+]", "meta+]"],
  moveDown: ["ctrl+[", "meta+["],
  moveToTop: ["ctrl+shift+]", "meta+shift+]"],
  moveToBottom: ["ctrl+shift+[", "meta+shift+["],
  duplicate: ["ctrl+d", "meta+d"],
  zoomIn: ["ctrl+=", "meta+="],
  zoomOut: ["ctrl+-", "meta+-"],
  resetZoom: ["ctrl+0", "meta+0"],
  toggleGrid: ["ctrl+'", "meta+'"],
};
