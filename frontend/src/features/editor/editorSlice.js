import { createSlice } from '@reduxjs/toolkit';
import { getDefaultBlock, generateUUID } from '../../lib/schemaHelpers.js';

function arrayMove(array, fromIndex, toIndex) {
  const result = [...array];
  const [removed] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, removed);
  return result;
}

const initialState = {
  siteId: null,
  siteTitle: 'My Portfolio',
  isPublished: false,
  publishedAt: null,
  past: [],
  present: null, // Site document: { schemaVersion: 1, theme: {}, blocks: [] }
  future: [],
  selectedBlockId: null,
  activeTab: 'props', // 'props' | 'theme' | 'ai'
  deviceView: 'desktop', // 'desktop' | 'tablet' | 'mobile'
  saveStatus: 'saved', // 'saved' | 'saving' | 'unsaved' | 'error'
  lastSavedAt: null
};

function recordHistory(state) {
  if (state.present) {
    state.past.push(JSON.parse(JSON.stringify(state.present)));
    if (state.past.length > 30) {
      state.past.shift();
    }
    state.future = [];
    state.saveStatus = 'unsaved';
  }
}

export const editorSlice = createSlice({
  name: 'editor',
  initialState,
  reducers: {
    initSite: (state, action) => {
      const { siteId, title, draft, isPublished, publishedAt } = action.payload;
      state.siteId = siteId;
      state.siteTitle = title || 'My Portfolio';
      state.isPublished = !!isPublished;
      state.publishedAt = publishedAt || null;
      state.present = draft;
      state.past = [];
      state.future = [];
      state.selectedBlockId = draft?.blocks?.[0]?.id || null;
      state.saveStatus = 'saved';
      state.lastSavedAt = new Date().toISOString();
    },

    undo: (state) => {
      if (state.past.length > 0 && state.present) {
        const previous = state.past.pop();
        state.future.unshift(state.present);
        state.present = previous;
        state.saveStatus = 'unsaved';
      }
    },

    redo: (state) => {
      if (state.future.length > 0 && state.present) {
        const next = state.future.shift();
        state.past.push(state.present);
        state.present = next;
        state.saveStatus = 'unsaved';
      }
    },

    setSiteDocument: (state, action) => {
      recordHistory(state);
      state.present = action.payload;
    },

    updateBlockProps: (state, action) => {
      const { blockId, props } = action.payload;
      if (!state.present || !state.present.blocks) return;

      const index = state.present.blocks.findIndex((b) => b.id === blockId);
      if (index !== -1) {
        recordHistory(state);
        state.present.blocks[index].props = {
          ...state.present.blocks[index].props,
          ...props
        };
      }
    },

    reorderBlocks: (state, action) => {
      const { activeId, overId } = action.payload;
      if (!state.present || !state.present.blocks) return;

      const oldIndex = state.present.blocks.findIndex((b) => b.id === activeId);
      const newIndex = state.present.blocks.findIndex((b) => b.id === overId);

      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        recordHistory(state);
        state.present.blocks = arrayMove(state.present.blocks, oldIndex, newIndex);
      }
    },

    addBlock: (state, action) => {
      const { type, insertIndex } = action.payload;
      if (!state.present) return;

      recordHistory(state);
      const newBlock = getDefaultBlock(type);

      if (typeof insertIndex === 'number' && insertIndex >= 0) {
        state.present.blocks.splice(insertIndex, 0, newBlock);
      } else {
        state.present.blocks.push(newBlock);
      }
      state.selectedBlockId = newBlock.id;
      state.activeTab = 'props';
    },

    removeBlock: (state, action) => {
      const blockId = action.payload;
      if (!state.present || !state.present.blocks) return;

      recordHistory(state);
      state.present.blocks = state.present.blocks.filter((b) => b.id !== blockId);
      if (state.selectedBlockId === blockId) {
        state.selectedBlockId = state.present.blocks[0]?.id || null;
      }
    },

    duplicateBlock: (state, action) => {
      const blockId = action.payload;
      if (!state.present || !state.present.blocks) return;

      const index = state.present.blocks.findIndex((b) => b.id === blockId);
      if (index !== -1) {
        recordHistory(state);
        const original = state.present.blocks[index];
        const copy = JSON.parse(JSON.stringify(original));
        copy.id = generateUUID();
        state.present.blocks.splice(index + 1, 0, copy);
        state.selectedBlockId = copy.id;
      }
    },

    moveBlockStep: (state, action) => {
      const { blockId, direction } = action.payload; // 'up' or 'down'
      if (!state.present || !state.present.blocks) return;

      const index = state.present.blocks.findIndex((b) => b.id === blockId);
      if (index === -1) return;

      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex >= 0 && targetIndex < state.present.blocks.length) {
        recordHistory(state);
        state.present.blocks = arrayMove(state.present.blocks, index, targetIndex);
      }
    },

    updateTheme: (state, action) => {
      if (!state.present) return;
      recordHistory(state);
      state.present.theme = {
        ...state.present.theme,
        ...action.payload
      };
    },

    applyTemplate: (state, action) => {
      const template = action.payload;
      if (!state.present || !template.theme) return;
      recordHistory(state);
      state.present.theme = {
        ...state.present.theme,
        ...template.theme
      };
    },

    setSelectedBlockId: (state, action) => {
      state.selectedBlockId = action.payload;
    },

    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },

    setDeviceView: (state, action) => {
      state.deviceView = action.payload;
    },

    setSaveStatus: (state, action) => {
      state.saveStatus = action.payload;
      if (action.payload === 'saved') {
        state.lastSavedAt = new Date().toISOString();
      }
    },

    setSiteTitle: (state, action) => {
      state.siteTitle = action.payload;
      state.saveStatus = 'unsaved';
    },

    setPublishedState: (state, action) => {
      state.isPublished = action.payload.isPublished;
      state.publishedAt = action.payload.publishedAt || new Date().toISOString();
    }
  }
});

export const {
  initSite,
  undo,
  redo,
  setSiteDocument,
  updateBlockProps,
  reorderBlocks,
  addBlock,
  removeBlock,
  duplicateBlock,
  moveBlockStep,
  updateTheme,
  applyTemplate,
  setSelectedBlockId,
  setActiveTab,
  setDeviceView,
  setSaveStatus,
  setSiteTitle,
  setPublishedState
} = editorSlice.actions;

export default editorSlice.reducer;
