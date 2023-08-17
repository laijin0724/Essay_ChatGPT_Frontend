import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux'

import { RxHamburgerMenu } from 'react-icons/rx';
import { BiSearch } from "react-icons/bi";
import { GrFormClose } from "react-icons/gr";
import { HiOutlineDocumentPlus, HiOutlineDocument } from "react-icons/hi2";
import { GrLineChart } from "react-icons/gr";
import { MdOutlineShowChart } from "react-icons/md";
// import { MdOutlineLockReset } from "react-icons/md";
import { BsDiscord } from "react-icons/bs"
import { TbLogout } from "react-icons/tb";
import { GiHamburgerMenu } from "react-icons/gi";

import TellEssayModal from '../components/modal/TellEssayModal';
import CreateEssayModal from '../components/modal/CreateEssayModal';

import { getAuth } from '../utils/authSlice';
import { setDoc, getDoc } from '../utils/docSlice';
import { setChat } from '../utils/chatSlice';
import { removeSession, getSession, apiGetDocData, apiGetChat, apiGetEditor, apiGetDocTopics } from '../utils/action';
import { setEditor } from '../utils/editorSlice';
import { makeNodeId } from '../components/CustomWithNodeID';

const MenuSection = (props) => {

  const { isOpen, setOpenHamburger } = props;
  const { _id, email, firstname, lastname } = getSession();

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const doc = useSelector(getDoc);

  const [isOpenNewDoc, setIsOpenNewDoc] = useState(false);
  const [isOpenCreateEssay, setIsOpenCreateEssay] = useState(false);
  const [essayData, setEssayData] = useState([]);
  const [docNameList, setDocNameList] = useState([]);
  const [docNames, setDocNames] = useState([]);
  const [searchValue, setSearchValue] = useState('');

  useEffect(() => {
    getTopic();
  }, [])

  useEffect(() => {
    let temp = docNames.filter((item) => {
      return item.topic.toLowerCase().includes(searchValue.toLowerCase());
    })

    setDocNameList(temp);
  }, [searchValue])

  const getTopic = async() => {
    const result = await apiGetDocTopics({user_id:_id});
    if (result.success) {
      let data = result.data;

      if (data.length == 0) {
        setIsOpenNewDoc(true);
      }
      else {
        handleClickDocName(data[data.length - 1]._id);
      }

      setDocNameList(result.data);
      setDocNames(result.data);
    }
  }

  const handleSignOut = () => {
    removeSession();
    dispatch(setDoc({
      user_id: '',
      topic: '',
      data: []
    }));
    navigate('/signin')
  }

  const handleNewDoc = () => {
    setOpenHamburger(false);
    setIsOpenNewDoc(true);
  }

  const handleClickDocName = async (doc_id) => {
    let result = await apiGetDocData({ id: doc_id });
    if (result.success) {
      dispatch(setDoc(result.data));
      result = await apiGetChat({ user_id: _id, info_id: doc_id });
      if (result.success) {
        dispatch(setChat(result.data));
      }

      result = await apiGetEditor({ info_id: doc_id });
      if (result.success) {
        if (result.data.length > 0) {
          dispatch(setEditor({ info_id: doc_id, data: result.data[0].data }));
        } else {
          dispatch(setEditor({
            info_id: doc_id, data: [
              {
                id: makeNodeId(),
                type: 'paragraph',
                children: [
                  { text: '' },
                ],
              },
            ]
          }));
        }
        setOpenHamburger(false);
      }
    } else {
      console.log('error');
    }
  }

  return (
    <>
      {isOpen &&
        <div className="fixed right-0 top-0 border-l border-gray bg-gray h-screen w-80 z-20">
          <div className="p-5">
            <GiHamburgerMenu
              className="cursor-pointer text-3xl font-bold"
              toggled={isOpen}
              onClick={() => setOpenHamburger(false)}
            />
          </div>
          <div className="mx-3 p-4 flex justify-between flex-col h-[calc(100%_-_76px)]">
            <div className="h-[calc(100%_-_110px)]">
              <div className="relative">
                <span className="absolute pointer-events-none p-3"><BiSearch className="text-xl" /> </span>
                <input type="text" style={{ paddingLeft: '36px' }} className="rounded p-2 border-gray border w-full" placeholder="Search" value={searchValue} onChange={(e) => setSearchValue(e.target.value)} />
                <span className="absolute cursor-pointer p-3 right-0 top-0" onClick={() => setSearchValue('')}><GrFormClose className="text-xl cursor-pointer" /> </span>
              </div>

              <div className="h-[calc(100%_-_25px)] overflow-auto">
                <div className="mt-6 p-2">
                  <div
                    className="text-blur-pink flex flex-row gap-5 items-center cursor-pointer"
                    onClick={() => handleNewDoc()}
                  >
                    <HiOutlineDocumentPlus className="text-xl" />
                    <div>New document</div>
                  </div>
                </div>

                {
                  docNameList.length > 0 && docNameList.map((item, index) => (
                    <div className={`p-2 ${(doc._id == item._id) ? "bg-gray-dark" : ""}`} key={index}>
                      <div className="flex flex-row gap-5 items-center cursor-pointer">
                        <HiOutlineDocument className="text-xl" />
                        <div onClick={() => handleClickDocName(item._id)}>{item.topic}</div>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>

            <div>
              {/* <div className="flex flex-row justify-between items-center">npm
                <div>AI generation limit </div>
                <div className="opacity-70">58/200</div>
              </div> */}

              {/* <div className="w-full bg-gray-200 rounded-full h-1 dark:bg-gray-700 mt-3">
                <div className="bg-yellow-400 h-1 rounded-full" style={{ width: '45%' }}></div>
              </div> */}

              <div className="text-blur-pink flex flex-row gap-5 items-center cursor-pointer font-bold mt-6" onClick={() => navigate('/subscription')}>
                <MdOutlineShowChart className="text-xl text-blur-pink " />
                <div>Upgrade Now</div>
              </div>

              {/* <div className="text-blur-pink flex flex-row gap-5 items-center cursor-pointer font-bold mt-3" onClick={() => navigate('/password_reset')}>
                <MdOutlineLockReset className="text-xl text-blur-pink" />
                <div>Password Reset</div>
              </div> */}

              <div className="flex flex-row justify-between items-center mt-6">
                <div className="flex flex-row items-center gap-3">
                  <div className="rounded-full w-8 h-8 bg-[#1E1E1E] flex justify-center items-center text-white">P</div>
                  <div className="flex flex-col justify-between text-xs text-[#939393]">
                    <div>{firstname} {lastname}</div>
                    <div>{email}</div>
                  </div>
                </div>
                <TbLogout
                  className="text-2xl text-[#939393] cursor-pointer"
                  onClick={handleSignOut}
                />
              </div>
            </div>
          </div>
        </div>
      }
      <TellEssayModal isOpen={isOpenNewDoc} setIsOpen={setIsOpenNewDoc} setIsOpenCreateEssay={setIsOpenCreateEssay} setEssayData={setEssayData} />
      <CreateEssayModal isOpen={isOpenCreateEssay} setIsOpen={setIsOpenCreateEssay} essayData={essayData} getTopic={getTopic}/>
    </>
  )
}

export default MenuSection;