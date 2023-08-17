import { createSlice } from '@reduxjs/toolkit'

export const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    data: [{
      info_id: '',
      question: '',
      answer: '',  
    }]
  },
  reducers: {
    updateChat: (state, action) => {
      state.data = [...state.data, ...action.payload ];
    },
    setChat: (state, action) => {
      state.data = [ ...action.payload ];
    },
    updateLastAnswer: (state, action) => {
      let tmp = [...state.data];
      tmp[tmp.length - 1].answer = action.payload
      state.data = tmp;
    },
  },
})

export const { updateLastAnswer, updateChat, setChat } = chatSlice.actions
export const getChat = (state) => state.chat.data;

export default chatSlice.reducer