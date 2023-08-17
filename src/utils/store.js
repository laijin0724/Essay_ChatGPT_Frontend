import { configureStore } from '@reduxjs/toolkit'
import authSlice from './authSlice'
import docSlice from './docSlice'
import chatSlice from './chatSlice'
import editorSlice from './editorSlice'

export default configureStore({
  reducer: {
    auth: authSlice,
    doc: docSlice,
    chat: chatSlice,
    editor: editorSlice
  },
})