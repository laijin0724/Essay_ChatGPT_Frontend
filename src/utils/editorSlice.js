import { createSlice } from '@reduxjs/toolkit'
import { makeNodeId } from '../components/CustomWithNodeID';

export const editorSlice = createSlice({
  name: 'editor',
  initialState: {
    editor: {
      info_id: '',
      data: [
        {
          id: makeNodeId(),
          type: 'paragraph',
          children: [
            { text: '' },
          ],
        },
      ]
    }
  },
  reducers: {
    updateEditor: (state, action) => {
      state.editor = { ...state.editor, ...action.payload };
    },
    setEditor: (state, action) => {
      state.editor = action.payload
    },
  },
})

export const { updateEditor, setEditor } = editorSlice.actions

export const getEditor = (state) => state.editor.editor;

export default editorSlice.reducer