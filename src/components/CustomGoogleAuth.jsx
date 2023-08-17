import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from 'react-redux'
import cookies from "js-cookies";

import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import jwt_decode from "jwt-decode";

import { ReactComponent as GoogleLogo } from '../assets/google.svg';

import { setAuth } from "../utils/authSlice";
import { setSession, login, register } from "../utils/action";


export default function CustomGoogleAuth({ type, parentCallback }) {

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [googleData, setGoogleData] = useState({});

  const location = useLocation();
  let from = (location.state?.from?.pathname) || '/';

  console.log(">>>>", from);

  const getGoogleUrl = (from) => {
    const rootUrl = `https://accounts.google.com/o/oauth2/v2/auth`;

    const options = {
      redirect_uri: process.env.REACT_APP_GOOGLE_OAUTH_REDIRECT,
      client_id: process.env.REACT_APP_GOOGLE_OAUTH_CLIENT_ID,
      access_type: 'offline',
      response_type: 'code',
      prompt: 'consent',
      type: type,
      scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
      ].join(' '),
      state: from,
    };

    const qs = new URLSearchParams(options);

    return `${rootUrl}?${qs.toString()}`;
  };

  useEffect(() => {
    const token = cookies.getItem("token");
    console.log(token);
    if (token) {
      if (token == 'google_auth_error') {
        console.log('get error in google auth');
        cookies.removeItem('token')
        return;
      }
    }
  }, [])

  useEffect(() => {
    async function setGoogleLogin() {
      const userObject = jwt_decode(googleData.credential);

      switch (type) {
        case "Login": {
          const result = await login({ email: userObject.email, google: true });
          if (result.success) {
            setSession(result.data);
            dispatch(setAuth(result.data));
            navigate('/');
          } else {
            parentCallback(result.msg);
          }
        }; break;
        case "Register": {
          const result = await register({ email: userObject.email, firstname: userObject.given_name, lastname: userObject.family_name, password: 'test' });
          if (result.success) {
            navigate('/');
          } else {
            parentCallback(result.msg);
          }
        }; break;
      }
    }

    if (Object.keys(googleData).length !== 0) {
      setGoogleLogin();
    }
  }, [googleData])

  return (
    <>
      <a
        href={getGoogleUrl(from)}
        className="w-full flex  px-4 py-2 items-center justify-center tracking-wide text-white transition-colors duration-200 transform rounded-md hover:bg-orange-600 focus:outline-none focus:bg-orange-600 bg-orange-700"
      >
        <GoogleLogo className=" pr-1 h-7" />
        {type} with Google
      </a>
    </>
    // <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
    //   <GoogleLogin
    //     onSuccess={credentialResponse => {
    //       setGoogleData(credentialResponse);
    //     }}
    //     onError={() => {
    //       parentCallback(`${type} Failed`); console.log(`${type} Failed`);
    //     }}
    //   />
    // </GoogleOAuthProvider>
  )
}

