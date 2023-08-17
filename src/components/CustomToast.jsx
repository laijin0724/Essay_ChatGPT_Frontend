import React, { useEffect } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function CustomToast(props) {
    const { value, setToastMessage } = props;

    useEffect(() => {
        if (value != '') {
            toast(value);
            setToastMessage('');
        }
    }, [value])

    return (
        <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
        />
    )
}