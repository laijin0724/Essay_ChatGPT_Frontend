import cookies from "js-cookies";
const API_BASE_URL = process.env.REACT_APP_SERVER_URL;
import { getSession, updateSessionPlan } from "./action";


export const callAPI = (
    method = 'GET',
    endpoint,
    data = {},
) => {

    method = method ? method : 'GET';
    let fullUrl = API_BASE_URL + endpoint;
    console.log('********* FULL URL ************\n' + fullUrl);

    const { _id } = getSession();
    const token = cookies.getItem("token");
    data.userId = _id;

    let options = {
        headers: {
            'Content-Type': 'application/json',
            // 'X-My-Custom-Header': 'value-v',
            'Access-Control-Allow-Methods': 'GET, HEAD, POST, PUT, DELETE, OPTIONS',
            'Cookie': 'token=' + token,
        },
        crossDomain: true,
        method: method,
        credentials: 'include',
        withCredential: true,
    };
    if (['POST', 'PUT'].indexOf(method) > -1) options.body = JSON.stringify(data);

    return fetch(fullUrl, options)
        .then(async (response) => {
            if (!response.ok) {
                const error = Object.assign({}, response, {
                    status: response.status,
                    statusText: response.statusText,
                });
                return Promise.reject(error);
            }

            cookies.removeItem('token');
            cookies.setItem("token", token, {
                expires: 7,
            });
            
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.indexOf('application/json') > -1) {
                return response
                    .json()
                    .then((json) => {
                        if ([200, 403].indexOf(response.status) === -1)
                            throw new Error(response.status);
                        if ([304, 403].indexOf(response.status) > -1)
                            throw new Error(response.status);
                        if (Array.isArray(json))
                            return [...json];
                        else
                            return { ...json };
                    })
                    .catch(() => {
                        throw new Error(response.status);
                    });
            } else {
                return {};
            }
        })
        .catch((error) => {
            switch (error.status) {
                case 401:
                    {
                        console.log('401 issue');
                        window.location.href = `${process.env.REACT_APP_BASE_URL}/signin`
                    }
                    break;
                case 400:
                    {
                        console.log('400 issue');
                    }
                    break;
                case 402:
                    {
                        console.log('402 issue');
                        console.log('subscription issue');
                        updateSessionPlan(1);
                    }
                    break;
                default:
                    break;
            }
            return error
        });
};
