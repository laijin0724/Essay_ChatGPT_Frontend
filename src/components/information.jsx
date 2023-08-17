import { useState, useEffect } from 'react';
import { TbRefresh } from 'react-icons/tb';
import { IoIosArrowDown } from 'react-icons/io';
import { IoIosArrowUp } from 'react-icons/io';
import OutsideClickHandler from 'react-outside-click-handler';

import CreateParagraphModal from './modal/CreateParagraphModal';
import CustomToast from '../components/CustomToast';

import { apiUpdateUserInfo, getSession } from '../utils/action';

const Information = (props) => {

  const { _id, plan_id } = getSession();
  const { data, index, info_id, accessParagraph, setDeletedIndex, changeTopicCount } = props;

  const [openNewPara, setIsOpenNewPara] = useState(false);
  const [openSection, setOpenSection] = useState(false);
  const [openOption, setOpenOption] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [accessIndex, setAccessIndex] = useState([]);

  useEffect(() => {
    if (index == 0) {
      setOpenSection(true);
    }
  }, [index]);

  useEffect(() => {
    let data = accessParagraph.filter((item) => item.info_id == info_id);
    let tempIndexs = [];
    data.map((item) => {
      tempIndexs.push(item.paragraph);
    })
    setAccessIndex(tempIndexs);
  }, [accessParagraph])

  const handleChangeTopic = () => {
    setOpenSection(false);
    if (process.env.REACT_APP_PAYMENT_PLAN_FEATURE_FLAG && (plan_id == 1 && changeTopicCount > 1)) {
      setToastMessage('Please upgrade membership to change topic over 2 times.')
      return;
    } else {
      setIsOpenNewPara(true);
    }
  }

  const handleOpenSection = async () => {
    if (openSection) {
      setOpenSection(!openSection);
      return;
    }

    if (process.env.REACT_APP_PAYMENT_PLAN_FEATURE_FLAG && plan_id == 1) {

      if (accessIndex.includes(index)) {
        setOpenSection(!openSection);
      } else {
        // console.log('accessParagraph>>', accessParagraph);
        // console.log('accessIndex >>>>>>', accessIndex);
        if (accessParagraph.length > 4) {
          // console.log("should alert >>>.");
          setToastMessage('Please upgrade membership to access over 5 paragraph sections.')
          return;
        }

        setOpenSection(!openSection);
        // console.log("no exist in accessIndex");
        let param = {
          user_id: _id,
          key: 'para_access_data',
          value: {
            info_id: info_id,
            paragraph: index
          }
        }
        const result = await apiUpdateUserInfo(param);
        if (result.success) {
          let temp = [...accessIndex];
          temp.push(index);
          setAccessIndex(temp);

          accessParagraph.push({
            info_id: info_id,
            paragraph: index
          });
        }
      }
    } else {
      setOpenSection(!openSection);
    }
  }

  return (
    <div className="bg-gray px-3 py-1 border-[1px] border-gray my-2 box-border rounded-information-section relative">
      <div className="flex justify-between items-center p-3">
        <div>
          <h4 className="font-mono font-bold text-lg">{data.title}</h4>
        </div>
        <div className="flex items-center">
          <div onClick={() => setOpenOption(!openOption)}>
            <TbRefresh className="mr-2 cursor-pointer text-2xl" />
          </div>
          <div
            onClick={handleOpenSection}
          >
            {
              openSection ?
                <IoIosArrowUp className="font-bold cursor-pointer text-2xl" /> :
                <IoIosArrowDown className="font-bold cursor-pointer text-2xl" />
            }
          </div>
        </div>

      </div>
      {openSection && (
        <div>
          <div>
            <div className="bg-information-subtitle-background rounded-information-subtitle text-base font-bold px-3 py-2">
              Ideas to explore in the paragraph
            </div>
            <div>
              <div className="ml-7 mt-2 px-3">
                {
                  data.ideas.length > 0 ?
                    data.ideas.map((item, index) => (
                      <ul className="list-disc" key={index}>
                        <li>{item}</li>
                      </ul>
                    )) : ""
                }
              </div>
            </div>
          </div>
          <div className="mt-2">
            <div className="bg-information-subtitle-background rounded-information-subtitle text-base font-bold px-3 py-2">
              Arguments example
            </div>
            <div>
              <div className="ml-7 mt-2 px-3">
                {
                  data.arguments.length > 0 ?
                    data.arguments.map((item, index) => (
                      <ul className="list-disc" key={index}>
                        <li>{item}</li>
                      </ul>
                    )) : ""
                }
              </div>
            </div>
          </div>
          <div className="mt-2">
            <div className="bg-information-subtitle-background rounded-information-subtitle text-base font-bold px-3 py-2">
              Paragraph example
            </div>
            <div>
              <div className="ml-7 mt-2 px-3">
                {
                  data.paragraphs.length > 0 ?
                    data.paragraphs.map((item, index) => (
                      <ul className="list-disc" key={index}>
                        <li>{item}</li>
                      </ul>
                    )) : ""
                }
              </div>
            </div>
          </div>
          <div className="mt-2">
            <div className="bg-information-subtitle-background rounded-information-subtitle text-base font-bold px-3 py-2">
              Sources to use for the paragraph
            </div>
            <div>
              <div className="ml-7 mt-2 px-3">
                {
                  data.sources.length > 0 ?
                    data.sources.map((item, index) => (
                      <ul className="list-disc" key={index}>
                        <li>{item}</li>
                      </ul>
                    )) : ""
                }
              </div>
            </div>
          </div>

        </div>
      )}
      {openOption &&
        <OutsideClickHandler
          onOutsideClick={() => {
            setOpenOption(false)
          }}
        >
          <div className="absolute top-[-2px] right-16 z-10 border border-[#7A7A7A] bg-white rounded-information-subtitle px-1 py-1">
            <div
              className="cursor-pointer hover:bg-[#EFEFEF] px-2"
              onClick={handleChangeTopic}
            >
              Change topic
            </div>
            <div className="cursor-pointer hover:bg-[#EFEFEF] px-2 mt-1" onClick={() => setDeletedIndex(index)}>Delete</div>
          </div>
        </OutsideClickHandler>
      }
      <CreateParagraphModal type={"Update"} isOpen={openNewPara} setIsOpen={setIsOpenNewPara} title={data.title} index={index} changeTopicCount={changeTopicCount} />
      <CustomToast value={toastMessage} setToastMessage={setToastMessage} />
    </div>
  )
}

export default Information