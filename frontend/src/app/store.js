import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice.js';
import editorReducer from '../features/editor/editorSlice.js';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    editor: editorReducer
  }
});
