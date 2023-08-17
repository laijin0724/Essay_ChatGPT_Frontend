import axios from "axios";
import { callAPI } from "./fetch.utils";
import CryptoJS from 'crypto-js';

export const setSession = (ciphertext) => {
  localStorage.setItem("token", ciphertext);
}

export const updateSessionPlan = (plan_id) => {
  var ciphertext = localStorage.getItem("token");
  if (ciphertext != null && ciphertext != 'undefined') {
    var bytes = CryptoJS.AES.decrypt(ciphertext, process.env.REACT_APP_JWT_SECRET);
    var decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));

    let returnData = {};
    returnData.userId = decryptedData.userId;
    returnData.email = decryptedData.email;
    returnData.firstName = decryptedData.firstName;
    returnData.lastName = decryptedData.lastName;
    returnData.planId = plan_id;

    var ciphertext = CryptoJS.AES.encrypt(JSON.stringify(returnData), process.env.JWT_SECRET).toString();
    localStorage.setItem("token", ciphertext);
  }
}

export const getSession = () => {
  var ciphertext = localStorage.getItem("token");
  if (ciphertext != null && ciphertext != 'undefined') {
    var bytes = CryptoJS.AES.decrypt(ciphertext, process.env.REACT_APP_JWT_SECRET);
    var decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));

    return {
      _id: decryptedData.userId,
      email: decryptedData.email,
      firstname: decryptedData.firstName,
      lastname: decryptedData.lastName,
      plan_id: decryptedData.planId,
    }
  } else {
    return {
      _id: '',
      email: '',
      firstname: '',
      lastname: '',
      plan_id: '',
    }
  }
}

export const removeSession = () => {
  localStorage.removeItem("token");
}

export const login = async (userdata) => {
  try {
    const data = await axios.post(process.env.REACT_APP_SERVER_URL + "/api/users/signin", {
      userdata
    });
    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      msg: error.response.data
    }
  }
}

export const register = async (userdata) => {
  try {
    const data = await axios.post(process.env.REACT_APP_SERVER_URL + "/api/users/signup", {
      userdata
    });
    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      msg: error.response.data
    }
  }
}

export const resetPassword = async (userdata) => {
  try {
    const data = await axios.post(process.env.REACT_APP_SERVER_URL + "/api/users/resetPassword", {
      userdata
    });

    return {
      success: true,
      msg: data
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      msg: error.response.data
    }
  }
}


export const apiChatGptForTopic = async ({ docName, count, existTitles = '' }) => {
  try {
    let prompt = `Generate ${count} topics that should be explored in the essay with theme "${docName}".  Each topic is one sentence and should not exceed 7 words. ${existTitles}. Don’t add topics enumeration or quotes around topics`;

    let data = await callAPI('POST', '/api/chatGPT', { prompt: prompt });

    return data;
  } catch (error) {
    console.log(error);
  }
}

export const apiChatGptForContent = async ({ topic, type = 'Essay', tone = 'Professional' }) => {
  const prompt = `You're trying to help a student to write a ${type} using ${tone} tone. The topic of the paragraph that you're writing about is "${topic}".  You need to generate 4 pieces of information: 
  1)  5 ideas to explore in the paragraph. Each idea should be at least 10 words. 
  2)  Example paragraph. It should be more than 250 words, but no more than 300.
  3) Arguments that can be used in the paragraph. 
  4) Sources that can be used in the paragraph.
  Format that data as json with numbers as keys and your generated data as value`;

  try {
    let data = await callAPI('POST', '/api/chatGPT', { prompt: prompt });

    return data;
  } catch (error) {
    console.log(error);
  }
}

export const apiChatGptForChat = async ({ newMsg, previousMsg }) => {

  let prompt = `You are chatting with the person. Here are there previous conversation <${previousMsg}>. Knowing the context of the past conversion, answer to the following reply from user <${newMsg}>. Don’t add topics enumeration or quotes around answer`;

  try {
    let data = await callAPI('POST', '/api/chatGPT', { prompt: prompt, featureEnabled: process.env.REACT_APP_PAYMENT_PLAN_FEATURE_FLAG });

    return data;
  } catch (error) {
    console.log(error);
  }
}

export const apiChatGptForEditor = async ({ keyword, text }) => {
  try {
    let prompt = `${keyword} this text "${text}". Don’t add topics enumeration or quotes around response text`;
    let data = await callAPI('POST', '/api/chatGPT', { prompt: prompt });

    return data;
  } catch (error) {
    console.log(error);
  }
}

export const apiGetUserInfo = async (userdata) => {
  try {
    let data = await callAPI('POST', '/api/users/getUserInfo', { userdata });

    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      msg: error.response.data
    }
  }
}
export const apiUpdateUserInfo = async (userdata) => {
  try {
    let data = await callAPI('POST', '/api/users/updateUserInfo', { userdata });
    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      msg: error.response.data
    }
  }
}

export const apiSaveDocData = async (userdata) => {
  try {
    let data = await callAPI('POST', '/api/infomations/save', { userdata });
    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      msg: error.response.data
    }
  }
}

export const apiGetDocData = async (userdata) => {
  try {
    let data = await callAPI('POST', '/api/infomations/get', { userdata });
    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      data: error.response.data
    }
  }
}

export const apiUpdateDocData = async (userdata) => {
  try {
    let data = await callAPI('POST', '/api/infomations/update', { userdata });
    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      data: error.response.data
    }
  }
}

export const apiGetDocTopics = async (userdata) => {
  try {
    let data = await callAPI('POST', '/api/infomations/getTopics', { userdata });
    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      data: error.response.data
    }
  }
}

export const apiSaveChat = async (userdata) => {
  try {
    let data = await callAPI('POST', '/api/chats/save', { userdata });
    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      msg: error.response.data
    }
  }
}

export const apiGetChat = async (userdata) => {
  try {
    let data = await callAPI('POST', '/api/chats/get', { userdata });
    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      msg: error.response.data
    }
  }
}

export const apiSetPayment = async (userdata) => {
  try {
    let data = await callAPI('POST', '/api/subscriptions/makePayment', { userdata });
    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.log(error)
    return {
      success: false,
      msg: error.response.data
    }
  }
}

export const apiSaveMembership = async (userdata) => {
  try {
    let data = await callAPI('POST', '/api/subscriptions/save', { userdata });
    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.log(error)
    return {
      success: false,
      msg: error.response.data
    }
  }
}

export const apiSaveEditor = async (userdata) => {
  try {
    let data = await callAPI('POST', '/api/editors/save', { userdata });
    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      msg: error.response.data
    }
  }
}

export const apiGetEditor = async (userdata) => {
  try {
    let data = await callAPI('POST', '/api/editors/get', { userdata });
    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      msg: error.response.data
    }
  }
}