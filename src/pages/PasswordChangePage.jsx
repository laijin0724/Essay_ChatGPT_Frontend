import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MdOutlineArrowBack } from "react-icons/md";

import CustomToast from '../components/CustomToast';

import { getSession, resetPassword } from "../utils/action";


const PasswordResetPage = () => {
  const navigate = useNavigate();
  const { _id } = getSession();

  const [input, setInput] = useState({});
  const [errors, setErrors] = useState({});
  const [toastMessage, setToastMessage] = useState('');

  const handleChange = (e) => {
    setInput({
      ...input,
      [e.target.name]: e.target.value
    });
  }

  const validate = () => {
    let tmp_input = input;
    let errors = {};
    let isValid = true;

    if (!tmp_input["c_pwd"]) {
      console.log('empty >>>');
      isValid = false;
      errors["c_pwd"] = "Please enter your Current Password.";
    }

    if (!tmp_input["n_pwd"]) {
      isValid = false;
      errors["n_pwd"] = "Please enter your New Password.";
    }

    if (!tmp_input["cn_pwd"]) {
      isValid = false;
      errors["cn_pwd"] = "Please enter your New Password to confirm.";
    }

    if (typeof tmp_input["n_pwd"] !== "undefined") {
      var pattern = new RegExp(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^#()])[A-Za-z\d@$!%*?&^#()]{8,}$/i
      );
      if (!pattern.test(tmp_input["n_pwd"])) {
        isValid = false;
        errors["n_pwd"] = "Your password must be over 8 characters, and include at least one lowercase letter, one uppercase letter, one special character and a number.";
      }
    }

    if (tmp_input["cn_pwd"] != tmp_input["n_pwd"]) {
      isValid = false;
      errors["cn_pwd"] = "Password is not matched.";
    }

    setErrors(errors);
    return isValid;
  }

  const handleResetPassword = async () => {
    if (validate()) {
      const result = await resetPassword({id: _id, new: input.n_pwd, current: input.c_pwd});
      // console.log(result);
      if (result.success) {
        setToastMessage(result.msg)
      } else {
        setToastMessage(result.msg)
      }
    }
  }

  return (
    <>
      <div
        className="container h-screen w-[600px] m-auto"
      >
        <div
          className="flex flex-col justify-center h-full gap-5"
        >
          <div
            className="cursor-pointer hover:bg-opacity-80 bg-gray-dark px-4 py-1 w-fit rounded flex flex-row items-center gap-2"
            onClick={() => navigate('/')}
          >
            <MdOutlineArrowBack /> Back
          </div>
          <h1 className="text-3xl font-semibold text-center text-blue-700">
            Password Reset
          </h1>
          <div className="mt-6">
            <div className="mb-2">
              <label
                htmlFor="c_pwd"
                className="block text-sm font-semibold text-gray-800"
              >
                Current Password
              </label>
              <input
                type="password"
                name="c_pwd"
                value={input.c_pwd}
                onChange={handleChange}
                className="block w-full px-4 py-2 mt-2 text-blue-700 bg-white border rounded-md focus:border-blue-400 focus:ring-blue-300 focus:outline-none focus:ring focus:ring-opacity-40"
              />
              <div className="text-[#ff0000] text-sm mt-1">{errors.c_pwd}</div>
            </div>
            <div className="mb-2">
              <label
                htmlFor="n_pwd"
                className="block text-sm font-semibold text-gray-800"
              >
                New Password
              </label>
              <input
                type="password"
                name="n_pwd"
                value={input.n_pwd}
                onChange={handleChange}
                className="block w-full px-4 py-2 mt-2 text-blue-700 bg-white border rounded-md focus:border-blue-400 focus:ring-blue-300 focus:outline-none focus:ring focus:ring-opacity-40"
              />
              <div className="text-[#ff0000] text-sm mt-1">{errors.n_pwd}</div>
            </div>
            <div className="mb-2">
              <label
                htmlFor="cn_pwd"
                className="block text-sm font-semibold text-gray-800"
              >
                Confirm New Password
              </label>
              <input
                type="password"
                name="cn_pwd"
                value={input.cn_pwd}
                onChange={handleChange}
                className="block w-full px-4 py-2 mt-2 text-blue-700 bg-white border rounded-md focus:border-blue-400 focus:ring-blue-300 focus:outline-none focus:ring focus:ring-opacity-40"
              />
              <div className="text-[#ff0000] text-sm mt-1">{errors.cn_pwd}</div>
            </div>
            <div className="mt-6">
              <button onClick={() => handleResetPassword()} className="w-full px-4 py-2 tracking-wide text-white transition-colors duration-200 transform bg-blue-700 rounded-md hover:bg-blue-600 focus:outline-none focus:bg-blue-600">
                Sign Up
              </button>
            </div>
          </div>
          <CustomToast value={toastMessage} setToastMessage={setToastMessage} />
        </div>
      </div>
    </>
  )
}

export default PasswordResetPage