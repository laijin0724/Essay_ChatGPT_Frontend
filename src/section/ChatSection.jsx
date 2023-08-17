import { useEffect, useRef, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import { IoMdClose } from "react-icons/io";
import { AiOutlineSend } from "react-icons/ai";

import CustomToast from '../components/CustomToast';

import { getChat, updateLastAnswer, updateChat } from '../utils/chatSlice';
import { getDoc } from '../utils/docSlice';
import { apiChatGptForChat, apiSaveChat, apiGetChat, getSession } from "../utils/action";

const ChatSection = (props) => {

  const { isOpenChat, setIsOpenChat } = props;

  const { _id, plan_id } = getSession();
  const chats = useSelector(getChat);
  const docData = useSelector(getDoc);
  const dispatch = useDispatch();

  const [question, setQuestion] = useState('')
  const [isChatAvailable, setIsChatAvailable] = useState(false)
  const [isThinking, setIsThinking] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const bottomEl = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    const lastChildElement = bottomEl.current?.lastElementChild;
    lastChildElement?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    async function temp() {
      if (docData._id) {
        if (plan_id == 1 && process.env.REACT_APP_PAYMENT_PLAN_FEATURE_FLAG) {
          let result = await apiGetChat({ user_id: _id });
          console.log('get last chat >>', result);
          if (result.success) {
            if (result.data.length > 9) {
              setToastMessage('Please update membership to use chat feature.')
              setIsChatAvailable(false);
            } else {
              setIsChatAvailable(true);
              // setChatCount(result.data.length);
            }
          }
        } else {
          setIsChatAvailable(true);
        }
      }
    }
    temp();
  }, [docData])

  // console.log(chats);
  const handleSendQuestion = async () => {
    if (docData._id) {
      if (isThinking) return;
      setIsThinking(true);
      let prompt = question;
      try {
        await dispatch(updateChat([{ info_id: docData._id, question: prompt, answer: '' }]));
        scrollToBottom();
      } catch (error) {
        console.log("call updateChat error", error);
        setIsThinking(false);
      }

      setQuestion('');
      // console.log(chats);
      let previousMsg = getPreviousMessages();
      let data = await apiChatGptForChat({ newMsg: prompt, previousMsg: previousMsg });
      data = data.content;
      if (data) {
        data = data.replace(/["]+/g, '');
        data = data.replace(/[']+/g, '');
      }

      let chatData = {
        user_id: _id,
        info_id: docData._id,
        question: prompt,
        answer: data
      }

      let result = await apiSaveChat({ chatData });
      if (result.success) {
        dispatch(updateLastAnswer(data));
        setIsThinking(false);
        if (process.env.REACT_APP_PAYMENT_PLAN_FEATURE_FLAG && (plan_id == 1 && result.data > 9)) {
          setToastMessage('Please update membership to use chat feature.')
          setIsChatAvailable(false);
        }
      }
    } else {
      setToastMessage('Please select the document.')
    }
  }

  const getPreviousMessages = () => {
    const data = chats;
    let result = '';
    data.map((item, index) => {
      result += item.question + ', ';
    })
    return result;
  }

  const handleKeyDown = async (event) => {
    if (event.key === 'Enter') {
      await handleSendQuestion();
      scrollToBottom();
    }
  }

  const handleSetQuestion = (e) => {
    setQuestion(e.target.value);
    scrollToBottom();
  }

  useEffect(() => {
    scrollToBottom()
  }, [isOpenChat, setIsOpenChat])

  return (
    <div className="h-full">
      {isOpenChat && <div className={`col-span-1 rounded-lg shadow-lg p-4 bg-white border-[1px] border-gray ml-2 relative h-full`}>

        <div
          className="float-right cursor-pointer"
          onClick={() => setIsOpenChat(false)}
        >
          <IoMdClose className="text-3xl" />
        </div>
        <div
          className="absolute bottom-[60px] m-auto mr-4 flex flex-col gap-2 max-h-[calc(100%_-_110px)] w-[calc(100%_-_2rem)] overflow-auto"
          ref={bottomEl}
        >
          {(!isChatAvailable && plan_id == 2) && <h6>You should select the document to chat.</h6>}
          {(!isChatAvailable && plan_id == 1 && (docData._id != '')) && <h6>You should upgrade membership to chat.</h6>}
          {(!isChatAvailable && plan_id == 1 && (docData._id == '')) && <h6>You should select the document to chat.</h6>}
          {
            chats.map((item, index) => (
              item.question != "" && <div key={index} className='flex flex-col gap-2'>
                <div className="p-2 border rounded-sm border-gray">
                  <div className="flex flex-row justify-between">
                    <div className="text-base font-bold">You</div>
                    {/* <div>{new Date().toLocaleString()}</div> */}
                  </div>
                  <div className="text-base leading-[19px]">
                    {item.question}
                  </div>
                </div>
                {item.answer != '' ?
                  <div className="p-2 border rounded-sm border-gray">
                    <div className="flex flex-row justify-between">
                      <div className="text-base font-bold">AI</div>
                    </div>

                    <div className="text-base leading-[19px]">
                      {/* {item.answer} */}
                      {
                        item.answer.split("\n").map(function (item, idx) {
                          return (
                            <span key={idx}>
                              {item}
                              <br />
                            </span>
                          )
                        })
                      }
                    </div>
                  </div>
                  : <div className="flex flex-row gap-6"><div>Thinking</div> <div className="loader"></div> </div>}
              </div>
            ))
          }
        </div>
        <div className="absolute bottom-2 w-[calc(100%_-_32px)]">
          <input
            type="text"
            className="w-full rounded pr-9"
            value={question}
            onChange={(e) => handleSetQuestion(e)}
            onKeyDown={handleKeyDown}
            disabled={!isChatAvailable}
            ref={inputRef}
          />
          <AiOutlineSend className="absolute bottom-2 right-2 text-2xl cursor-pointer" onClick={() => handleSendQuestion()} />
        </div>
        <CustomToast value={toastMessage} setToastMessage={setToastMessage} />

        {/* <div className="absolute bottom-5 bg-gray p-1 border-gray flex items-center rounded-lg shadow-lg">
        <span className="mr-0.5 px-1 border-r border-black">244words</span>
        <RiArrowGoBackFill className="mx-0.5 cursor-pointer" />
        <RiArrowGoForwardFill className="cursor-pointer" />
      </div>
      {!isOpenChat &&
        <div
          className="w-13 h-13 flex justify-center items-center absolute bottom-5 right-0 bg-gray mx-3 border border-gray p-1.5 rounded-full cursor-pointer shadow-lg"
          onClick={() => setIsOpenChat(!isOpenChat)}
        >
          <TbBrandWechat className="text-4xl" />
        </div>
      } */}
      </div>}
    </div>
  )
}

export default ChatSection;