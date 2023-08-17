import { createSlice } from '@reduxjs/toolkit'

export const editorSlice = createSlice({
  name: 'doc',
  initialState: {
    doc: {
      _id: '',
      user_id: '',
      topic: '',
      data: []
    }
  },
  reducers: {
    updateDoc: (state, action) => {
      state.doc = {...state.doc, ...action.payload};
    },
    setDoc: (state, action) => {
      state.doc = action.payload
    },
  },
})

export const { updateDoc, setDoc} = editorSlice.actions

export const getDoc = (state) => state.doc.doc;

export default editorSlice.reducer