import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux'
import { GiHamburgerMenu } from "react-icons/gi";

import InformationSection from "../../section/InformationSection";
import EditorSection from "../../section/EditorSection";
import MenuSection from "../../section/MenuSection";
import ChatSection from "../../section/ChatSection";
import CustomToast from '../../components/CustomToast';

import { getAuth } from "../../utils/authSlice";
import { getDoc } from '../../utils/docSlice';
import { apiGetDocTopics, getSession } from "../../utils/action";
import { getEditor } from "../../utils/editorSlice";

export default function Home() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(getAuth);
  const docData = useSelector(getDoc);
  const { _id } = getSession();

  const [isOpenHamburger, setIsOpenHamburger] = useState(false)
  const [isOpenChat, setIsOpenChat] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [docNames, setDocName] = useState([]);
  const editorData = useSelector(getEditor);

  const showSettings = (e) => {
    e.preventDefault();
  }

  // useEffect(() => {
  //   async function temp(params) {
  //     const result = await apiGetDocTopics(params);
  //     if (result.success) {
  //       setDocName(result.data);
  //     }
  //   }
  //   temp({ user_id: _id });
  //   // setToastMessage("Successfully login");
  // }, [docData])

  return (
    <div className='h-screen w-full bg-gray'>
      <div className="mx-5 py-2 flex justify-between pt-3">
        <div className="font-mono text-2xl font-bold">Logo</div>
        <div className="flex">
          {
            process.env.REACT_APP_PAYMENT_PLAN_FEATURE_FLAG && 
            <button
              // className="bg-upgradeBtn hover:bg-upgradeBtn-hover text-white font-bold py-1 px-2 rounded mr-5"
              className="p-2 border border-gray w-fit cursor-pointer py-1 px-2 rounded-sm mr-5"
              onClick={() => navigate('/subscription')}
            >
              {/* UPGRADE */}
              + SUBSCRIPTION
            </button>
          }
          <GiHamburgerMenu
            className="cursor-pointer text-3xl font-bold"
            toggled={isOpenHamburger}
            onClick={() => setIsOpenHamburger(true)}
          />
        </div>
      </div>
      <div className="grid grid-cols-5 grid-rows-1 grid-flow-col gap-1 mx-5 py-2 h-[calc(100%_-_56px)]">
        <InformationSection />
        <EditorSection isOpenChat={isOpenChat} setIsOpenChat={setIsOpenChat} initialData={editorData.data} />
        <ChatSection isOpenChat={isOpenChat} setIsOpenChat={setIsOpenChat} />
      </div>
      <MenuSection isOpen={isOpenHamburger} setOpenHamburger={setIsOpenHamburger}/>
      {/* <MenuSection isOpen={isOpenHamburger} setOpenHamburger={setIsOpenHamburger} docNames={docNames} /> */}

      <CustomToast value={toastMessage} />
    </div>
  )
}