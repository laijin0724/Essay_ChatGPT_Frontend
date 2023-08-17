import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { AiOutlinePlus } from "react-icons/ai";

import Information from "../components/information";
import TellEssayModal from "../components/modal/TellEssayModal";
import CreateEssayModal from "../components/modal/CreateEssayModal";
import CreateParagraphModal from "../components/modal/CreateParagraphModal";

import { getDoc, setDoc } from "../utils/docSlice";
import { apiUpdateDocData, apiGetUserInfo, getSession } from '../utils/action';

const InformationSection = () => {

  const { _id, plan_id } = getSession();
  const dispatch = useDispatch();
  const docData = useSelector(getDoc);
  // console.log(">>> docData", docData, docData.length);

  const [openNewPara, setIsOpenNewPara] = useState(false);
  const [deletedIndex, setDeletedIndex] = useState(null);
  const [accessParagraph, setAccessParagraph] = useState([]);
  const [changeTopicCount, setChangeTopicCount] = useState(0);

  useEffect(() => {
    async function temp() {
      let result = await apiGetUserInfo({ user_id: _id });
      if (result.success) {
        if (result.data.para_access_data.length > 0) {
          setAccessParagraph(result.data.para_access_data);
        }
        setChangeTopicCount(Number(result.data.change_topic_data));
        // console.log('changeTopicCount >> ', changeTopicCount)
      }
    }

    if (docData._id && plan_id == 1) {
      temp();
    }
  }, [docData])

  useEffect(() => {
    const deletePara = async () => {

      let temp = { ...docData };
      let arrData = temp.data.filter((item, i) => {
        if (deletedIndex === i) {
          return false;
        }

        return true;
      });

      temp.data = arrData;
      const result = await apiUpdateDocData({ _id: temp._id, data: temp });
      if (result.success) {
        dispatch(setDoc(temp));
      }
    }

    if (deletedIndex != null) {
      deletePara();
    }
  }, [deletedIndex])

  return (

    <div className="col-span-2 rounded-lg shadow-lg p-4 bg-white border-[1px] border-gray mr-2 max-h-full overflow-auto">
      {docData.data.length !== 0 && docData.data.map((item, index) => (
        <div key={index}>
          <Information
            data={item}
            index={index}
            info_id={docData._id}
            accessParagraph={accessParagraph}
            setDeletedIndex={setDeletedIndex}
            changeTopicCount={changeTopicCount}
          />
        </div>
      ))}
      {docData.topic && <div
        className="p-2 border border-gray rounded-information-section w-fit cursor-pointer"
        onClick={() => setIsOpenNewPara(true)}
      >
        <AiOutlinePlus className="text-2xl" />
      </div>}
      <CreateParagraphModal type={"Add"} isOpen={openNewPara} setIsOpen={setIsOpenNewPara} title='' index='' changeTopicCount={changeTopicCount} />
      {/* <TellEssayModal isOpen={isOpenNewDoc} setIsOpen={setIsOpenNewDoc} setIsOpenCreateEssay={setIsOpenCreateEssay} />
      <CreateEssayModal isOpen={isOpenCreateEssay} setIsOpen={setIsOpenCreateEssay} /> */}
    </div>
  )
}

export default InformationSection;