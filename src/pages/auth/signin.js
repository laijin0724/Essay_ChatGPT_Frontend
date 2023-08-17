import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from 'react-redux'
import cookies from "js-cookies";

import CustomToast from '../../components/CustomToast';
import CustomGoogleAuth from '../../components/CustomGoogleAuth';

import { setAuth } from "../../utils/authSlice";
import { setSession, login } from "../../utils/action";

export default function Signin() {

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [input, setInput] = useState({});
    const [errors, setErrors] = useState({});
    const [toastMessage, setToastMessage] = useState('');

    const handleChange = (e) => {
        setInput({
            ...input,
            [e.target.name]: e.target.value
        });
    }

    useEffect(() => {
        const token = cookies.getItem("token");
        if (token && token == 'google_auth_error') {
            cookies.removeItem('token');
            setToastMessage('Network error.');
        }
    }, [])

    const validate = () => {
        let tmp_input = input;
        let errors = {};
        let isValid = true;

        if (!tmp_input["email"]) {
            isValid = false;
            errors["email"] = "Please enter your email Address.";
        }

        if (typeof tmp_input["email"] !== "undefined") {
            var pattern = new RegExp(
                /^(("[\w-\s]+")|([\w-]+(?:\.[\w-]+)*)|("[\w-\s]+")([\w-]+(?:\.[\w-]+)*))(@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\]?$)/i
            );
            if (!pattern.test(tmp_input["email"])) {
                isValid = false;
                errors["email"] = "Please enter valid email address.";
            }
        }

        if (!tmp_input["password"]) {
            isValid = false;
            errors["password"] = "Please enter your password.";
        }

        if (typeof tmp_input["password"] !== "undefined") {
            var pattern = new RegExp(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^#()])[A-Za-z\d@$!%*?&^#()]{8,}$/i
            );
            if (!pattern.test(tmp_input["password"])) {
                isValid = false;
                errors["password"] = "Your password must be over 8 characters, and include at least one lowercase letter, one uppercase letter, one special character and a number.";
            }
        }
        setErrors(errors);
        return isValid;
    }

    const clickLoginBtn = async () => {
        if (validate()) {
            const result = await login(input);
            if (result.success) {

                let data = result.data.data;
                console.log(data);
                cookies.setItem("token", data.token, {
                    expires: 7,
                });

                setSession(data.encryptedData)

                delete data['token'];
                delete data['encryptedData'];

                dispatch(setAuth(data));
                navigate('/');
            } else {
                setToastMessage(result.msg)
            }
        }
    }

    return (
        <div className="relative flex flex-col justify-center min-h-screen overflow-hidden bg-gray">
            <div className="w-full p-6 m-auto bg-white rounded-md shadow-md lg:max-w-xl">
                <h1 className="text-3xl font-semibold text-center text-blue-700 underline">
                    Sign in
                </h1>
                <div className="mt-6">
                    <div className="mb-2">
                        <label htmlFor="email" className="block text-sm font-semibold text-gray-800" >
                            Email
                        </label>
                        <input
                            type="text"
                            name="email"
                            value={input.email}
                            onChange={handleChange}
                            className="block w-full px-4 py-2 mt-2 text-blue-700 bg-white border rounded-md focus:border-blue-400 focus:ring-blue-300 focus:outline-none focus:ring focus:ring-opacity-40"
                        />
                        <div className="text-[#ff0000] text-sm mt-1">{errors.email}</div>
                    </div>
                    <div className="mb-2">
                        <label htmlFor="password" className="block text-sm font-semibold text-gray-800" >
                            Password
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={input.password}
                            onChange={handleChange}
                            className="block w-full px-4 py-2 mt-2 text-blue-700 bg-white border rounded-md focus:border-blue-400 focus:ring-blue-300 focus:outline-none focus:ring focus:ring-opacity-40"
                        />
                        <div className="text-[#ff0000] text-sm mt-1">{errors.password}</div>
                    </div>
                    <button href="#" className="text-xs text-blue-600 hover:underline" onClick={() => navigate('/password_reset')}>
                        Forget Password?
                    </button>
                    <div className="mt-6">
                        <button onClick={() => clickLoginBtn()} className="w-full px-4 py-2 tracking-wide text-white transition-colors duration-200 transform bg-blue-700 rounded-md hover:bg-blue-600 focus:outline-none focus:bg-blue-600">
                            Sign In
                        </button>
                    </div>
                    <div className="relative flex items-center justify-center w-full mt-6 border border-t">
                        <div className="absolute px-5 bg-white">Or</div>
                    </div>
                    <div className="flex mt-4 w-full">
                        <CustomGoogleAuth type='Login' parentCallback={setToastMessage} />
                    </div>
                </div>

                <p className="mt-8 text-xs font-light text-center text-gray-700">
                    {" "}
                    Don't have an account?{" "}
                    <a
                        href="/signup"
                        className="font-medium text-blue-600 hover:underline"
                    >
                        Sign up
                    </a>
                </p>
            </div>
            <CustomToast value={toastMessage} setToastMessage={setToastMessage} />
        </div>
    );
}