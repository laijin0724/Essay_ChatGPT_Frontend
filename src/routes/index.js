import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import cookies from "js-cookies";
import CryptoJS from 'crypto-js';

import Home from '../pages/home';
import Signin from '../pages/auth/signin';
import Signup from '../pages/auth/signup';
import { useSelector, useDispatch } from 'react-redux'

import SubScriptionPage from '../pages/SubScriptionPage';
import PasswordResetPage from '../pages/PasswordResetPage';
import { getAuth, setAuth } from '../utils/authSlice';
import { getSession, setSession } from '../utils/action';

const PrivateRoute = ({ children }) => {
  const dispatch = useDispatch()
  const auth = useSelector(getAuth)

  const token = cookies.getItem("token");
  const encryptedData = cookies.getItem("encryptedData");
  if (encryptedData && (token && token != 'google_auth_error')) {
    setSession(encryptedData);

    var bytes = CryptoJS.AES.decrypt(encryptedData, process.env.REACT_APP_JWT_SECRET);
    var data = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    dispatch(setAuth(data));
    cookies.removeItem('encryptedData')

    return (
        children)

  } else {
    // PRIVATE ROUTE --------------
    const { email} = getSession()
    console.log(email)
    if (email && !auth.email) {
      dispatch(setAuth({
        email: email,
      }))
    }
    // console.log("private route", email, firstname, lastname, plan_id, _id);
    // console.log(">>>>>>", children);
    return (
      !email ?
        <Navigate to="/signin" replace /> : children)
  }

};

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/signin' element={<Signin />} />
        <Route path='/signup' element={<Signup />} />
        <Route path='/password_reset' element={<PasswordResetPage />} />
        <Route path='/' >
          <Route path='/' element={<PrivateRoute><Home /></PrivateRoute>} />
          <Route path='/subscription' element={<PrivateRoute><SubScriptionPage /></PrivateRoute>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;