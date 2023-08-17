import { createSlice } from '@reduxjs/toolkit'

export const authSlice = createSlice({
  name: 'auth',
  initialState: {
    auth: {
      firstname: '',
      lastname: '',
      plan_id: '',
      email: '',
      _id: ''
    }
  },
  reducers: {
    updateAuth: (state, action) => {
      state.auth = {...state.auth, ...action.payload};
    },
    setAuth: (state, action) => {
      state.auth = {...action.payload};
    }
  },
})

export const { updateAuth, setAuth } = authSlice.actions

export const getAuth = (state) => state.auth.auth;

export default authSlice.reducer