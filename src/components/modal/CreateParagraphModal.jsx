import { Fragment, useEffect, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { useDispatch, useSelector } from 'react-redux';

import { getDoc, setDoc } from '../../utils/docSlice';
import { apiChatGptForTopic, apiChatGptForContent, apiUpdateDocData, apiGetUserInfo, apiUpdateUserInfo, getSession } from '../../utils/action';

const CreateParagraphModal = (props) => {

  const { type, isOpen, setIsOpen, title, index, changeTopicCount } = props;

  const dispatch = useDispatch();
  const docData = useSelector(getDoc);
  const { _id, plan_id } = getSession();

  const [isVisible, setIsvisible] = useState(true)
  const [isGenerateVisible, setGenerateIsvisible] = useState(false)
  const [newPara, setNewPara] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setNewPara(title)
  }, [isOpen, title])

  useEffect(() => {
    if (newPara == '') {
      setIsvisible(true);
    } else {
      setIsvisible(false);
    }
  }, [newPara])

  function closeModal() {
    if (!loading) setIsOpen(false)
  }

  function openModal() {
    setIsOpen(true)
  }

  const handleContinue = async () => {
    setLoading(true);
    setGenerateIsvisible(true);

    let result = await apiChatGptForContent({ topic: newPara });
    result = result.content;
    let data = JSON.parse(result);

    console.log('createParagraph result >> ', data, typeof data);
    let paragraphs = [];
    if (data['2'].split('. ').length > 2) {
      paragraphs.push(data['2'].split('. ')[0]);
      paragraphs.push(data['2'].split('. ')[1]);
    } else {
      paragraphs = data['2'].split('. ');
    }

    let temp = { ...docData };

    let newData = {
      title: newPara,
      ideas: data['1'],
      paragraphs: paragraphs,
      arguments: data['3'],
      sources: data['4']
    }

    console.log('newData', newData);

    if (type === 'Add') {
      temp.data = [
        ...temp.data,
        newData
      ];
    } else {
      let arrData = temp.data.map((item, i) => {
        if (index === i) {
          return newData;
        }

        return item;
      });

      temp.data = arrData;
    }

    result = await apiUpdateDocData({ _id: temp._id, data: temp });
    if (result.success) {
      dispatch(setDoc(temp));
      if (type !== 'Add' && plan_id == 1) {
        let count = changeTopicCount + 1;
        let param = {
          user_id: _id,
          key: 'change_topic_data',
          value: count
        }

        // console.log(param);
        result = await apiUpdateUserInfo(param);
        // console.log(result);
        if (result.success) {
          console.log('updated');
        }
      }
    }

    setIsvisible(true);
    setGenerateIsvisible(false);
    setLoading(false);
    closeModal();
  }

  const handleGenerate = async () => {
    setLoading(true);

    let existTitles = '';
    docData.data.forEach(item => {
      if (item.title != '') {
        existTitles += `"${item.title}", `;
      }
    });

    try {
      let data = await apiChatGptForTopic({ docName: docData.topic, count: 'one', existTitles: existTitles });
      data = data.content;
      let title = data.slice(0, 3) !== '1. ' ? data : data.slice(3, data.length);
      if (title) {
        title = title.replace(/["]+/g, '');
        title = title.replace(/[']+/g, '');
      }
      // console.log('new title >> ', title);
      setNewPara(title);
      setIsvisible(false);
    } catch (error) {

    }

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
              <Dialog.Panel className="w-[700px] transform overflow-hidden rounded-2xl bg-white p-16 text-left align-middle shadow-xl transition-all">
                <div className={`${loading ? 'opacity-20' : 'opacity-100'}`}>
                  <Dialog.Title
                    as="h3"
                    className="font-bold leading-6 text-xl"
                  >
                    {type} Paragraph
                  </Dialog.Title>
                  <div
                    className="mt-5 text-essayHint text-base font-normal"
                  >
                    {/* {newPara} */}
                    <input
                      type="text"
                      name="firstname"
                      value={newPara}
                      onChange={(e) => setNewPara(e.target.value)}
                      className="block w-full px-4 py-2 mt-2 text-blue-700 bg-white border rounded-md focus:border-blue-400 focus:ring-blue-300 focus:outline-none focus:ring focus:ring-opacity-40"
                    />
                  </div>
                  <div className="mt-20">
                    <button
                      className={`${isVisible ? 'bg-[#919191]' : 'bg-[#4FB5FF]'} float-right text-xl font-bold text-white px-3 py-1 rounded`}
                      disabled={isVisible}
                      onClick={() => handleContinue()}
                    >
                      {type}
                    </button>
                    <button
                      className={`${isGenerateVisible ? 'bg-[#919191]' : 'bg-[#4FB5FF]'} float-right text-xl font-bold text-white px-3 py-1 rounded mr-4`}
                      disabled={isGenerateVisible}
                      onClick={() => handleGenerate()}
                    >
                      {/* {loading && <svg aria-hidden="true" role="status" className="inline w-4 h-4 mr-3 text-essayHint animate-spin" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="#E5E7EB" />
                      <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor" />
                    </svg>} */}
                      Generate
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

export default CreateParagraphModal