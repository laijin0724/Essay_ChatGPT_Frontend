import { Fragment, useEffect, useState } from 'react'
import { useDispatch } from 'react-redux';
import { Dialog, Transition } from '@headlessui/react'

import { AiOutlinePlus } from "react-icons/ai";

import EssayTitleInput from '../EssayTitleInput';

import { setDoc } from '../../utils/docSlice';
import { setChat } from '../../utils/chatSlice';
import { apiChatGptForTopic, apiChatGptForContent, apiSaveDocData, getSession } from '../../utils/action';

const CreateEssayModal = (props) => {

  const { isOpen, setIsOpen, essayData, getTopic } = props;

  const dispatch = useDispatch();
  const { _id } = getSession()

  const [isVisible, setIsvisible] = useState(true)
  const [docData, setDocData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageNum, setPageNum] = useState(0);

  function closeModal() {
    if (!loading) setIsOpen(false)
  }

  // const numberOfPages = 3;

  useEffect(() => {
    setIsvisible(true);
    let tmp = [];
    for (let i = 0; i < essayData.pageNum * 2; i++) {
      let obj = {
        title: '',
        ideas: [],
        arguments: [],
        paragraphs: [],
        sources: []
      }
      tmp.push(obj);
    }
    setDocData(tmp);
    setPageNum(essayData.pageNum * 2);
  }, [isOpen, setIsOpen, essayData]);

  const handleAddNewTopic = () => {
    let obj = {
      title: '',
      ideas: [],
      arguments: [],
      paragraphs: [],
      sources: []
    }
    setDocData([...docData, obj]);
    setPageNum(pageNum + 1);
  }

  const handleRemoveTopic = ({ index }) => {
    setDocData(docData => docData.filter((item, i) => i !== index));
    setPageNum(pageNum - 1);
  }

  const handleSetTitle = async (data, index) => {
    let tmp = [...docData];
    // console.log(">>> tmp", docData, tmp, data, index);
    setIsvisible(false);
    for (let i = 0; i < tmp.length; i++) {
      if (i === index) {
        tmp[i].title = data.title;
        tmp[i].ideas = data.ideas;
        tmp[i].arguments = data.arguments;
        tmp[i].paragraphs = data.paragraphs;
        tmp[i].sources = data.sources;
      }
      if (tmp[i].title === '') setIsvisible(true);
    }
    setDocData(tmp);
  }

  const handleFillAll = async () => {
    setLoading(true);
    const response = await apiChatGptForTopic({ docName: essayData.docName, count: docData.length });
    // console.log('content topics >>',content);

    let content = response.content;
    content.split("\n").map((item, index) => {
      let title = item.split('. ')[1];

      if(title){
        title = title.replace(/["]+/g, '');
        title = title.replace(/[']+/g, '');
      }
      
      handleSetTitle({
        title: title,
        ideas: '',
        arguments: '',
        paragraphs: '',
        sources: ''
      }, index);
    })

    setLoading(false);
  }

  const getContent = async (item, index) => {
    const result = await apiChatGptForContent({ topic: item.title, type: essayData.type, tone: essayData.tone });
    let data = result.content;
    data = JSON.parse(data);

    let paragraphs = [];
    if (data['2'].split('. ').length > 2) {
      paragraphs.push(data['2'].split('. ')[0]);
      paragraphs.push(data['2'].split('. ')[1]);
    } else {
      paragraphs = data['2'].split('. ');
    }

    handleSetTitle({
      title: item.title,
      ideas: data['1'],
      paragraphs: paragraphs,
      arguments: data['3'],
      sources: data['4']
    }, index);
  }

  const handleContinue = async () => {
    setLoading(true);
    const waitForMs = (ms) => new Promise((resolve, reject) => setTimeout(() => resolve(), ms));
    let index = 0;

    const batchSize = docData.length;
    const concurrentReq = new Array(batchSize);

    for (const item of docData) {
      concurrentReq.push(getContent(item, index));
      index++;
    };

    await Promise.all(concurrentReq);
    console.log(`requests ${index - batchSize}-${index} done.`)
    if (index + 1 < docData.length) {
      await waitForMs(3000);
    }

    const result = await apiSaveDocData({ user_id: _id, topic: essayData.docName, data: docData });

    if (result.success) {
      dispatch(setDoc(result.data));
      dispatch(setChat([]));
      getTopic();
    }

    closeModal();
    setLoading(false);
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={closeModal}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto bg-[#000000] bg-opacity-40">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel
                className="w-[700px] transform overflow-hidden rounded-2xl bg-white p-16 text-left align-middle shadow-xl transition-all"
              >
                <div className={`${loading ? 'opacity-20' : 'opacity-100'}`}>
                  <Dialog.Title
                    as="h3"
                    className="font-bold leading-6 text-xl"
                  >
                    Let's create essay outline
                  </Dialog.Title>
                  <div
                    className="mt-5 text-essayHint text-base font-normal"
                  >
                    For n page essay you need about {pageNum} paragraphs. Write down topics you plan to cover
                    in each of the paragraphs, or generate them with AI.
                  </div>
                  <div className="mt-4 flex gap-3 flex-col">

                    {docData.map((item, index) => (
                      <div className="flex flex-row gap-5 w-full items-center" key={index}>
                        <div className="text-essayHint text-base">{index + 1}</div>
                        <EssayTitleInput title={item.title} index={index} handleRemoveTopic={handleRemoveTopic} setTitle={async (value) => await handleSetTitle(value, index)} docName={essayData.docName} docData={docData} />
                      </div>

                    ))}

                    <div className="flex justify-end">
                      <div
                        className="p-2 border border-essayHint rounded-information-section w-fit cursor-pointer float-right"
                      >
                        <AiOutlinePlus
                          className="text-2xl"
                          onClick={handleAddNewTopic}
                        />
                      </div>
                    </div>

                  </div>

                  <div className="mt-20">
                    <button
                      className={`${isVisible ? 'bg-[#919191]' : 'bg-[#4FB5FF]'} float-right text-xl font-bold text-white px-3 py-1 rounded ml-5`}
                      disabled={isVisible}
                      onClick={handleContinue}
                    >
                      Continue
                    </button>

                    <button
                      className={`bg-[#919191] float-right text-xl font-bold text-white px-3 py-1 rounded`}
                      onClick={handleFillAll}
                    >
                      Help me fill the rest
                    </button>

                  </div>
                </div>

                {loading && <div role="status" className="absolute -translate-x-1/2 -translate-y-1/2 top-2/4 left-1/2">
                  <svg aria-hidden="true" className="w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" /><path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" /></svg>
                  <span className="sr-only">Loading...</span>
                </div>}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}

export default CreateEssayModal