import { Fragment, useEffect, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'

const TellEssayModal = (props) => {
  const { isOpen, setIsOpen, setIsOpenCreateEssay, setEssayData } = props;
  const [docName, setDocName] = useState('');
  const [isVisible, setIsvisible] = useState(true)
  const [pageNum, setPageNum] = useState(1);
  const [type, setType] = useState('Essay');
  const [tone, setTone] = useState('Professional');

  useEffect(() => {
    setDocName('');
    setPageNum(1);
  }, [isOpen, setIsOpen])

  function closeModal() {
    setIsOpen(false)
  }

  function openModal() {
    setIsOpen(true)
  }

  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  const handleType = (e) => {
    setDocName(e.target.value);
    const trimmedStr = e.target.value.trim();
    const sanitizedStr = trimmedStr.replace(/\s+/g, ' ');
    const wordsArr = sanitizedStr.split(" ");
    var spaceCount = (wordsArr.length);
    if (spaceCount < 3) setIsvisible(true);
    else setIsvisible(false);
  }

  const handleContinue = () => {
    setEssayData({
      docName,
      pageNum,
      type,
      tone
    })
    closeModal();
    setIsOpenCreateEssay(true);
  }

  const handleSelectPageNum = (e) => {
    setPageNum(e.target.value);
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
                <Dialog.Title
                  as="h3"
                  className="font-bold leading-6 text-xl"
                >
                  Tell us a little about your essay
                </Dialog.Title>
                <div
                  className="mt-5 text-essayHint text-base font-normal"
                >
                  Write the docName of the essay, it should be at least three words long.
                </div>
                <div className="w-full mt-1">
                  <input type="text" className="w-full border border-essayHint rounded" value={docName} onChange={(e) => handleType(e)} />
                </div>
                <div className="mt-5">
                  <div className="p-2 flex flex-row justify-between text-essayModalText">
                    <div className="text-lg">
                      Number of pages
                    </div>
                    <div>
                      <select
                        id="underline_select"
                        className="block w-full text-right text-lg text-gray-500 bg-transparent border-0 border-gray-200 appearance-none dark:text-gray-400 dark:border-gray-700 focus:outline-none focus:ring-0 focus:border-gray-200 peer"
                        onChange={(e)=>handleSelectPageNum(e)}
                      >
                        {numbers.map((item, index) => (
                          <option value={item} key={index}>{item}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="p-2 flex flex-row justify-between text-essayModalText">
                    <div className="text-lg">
                      Content Type
                    </div>
                    <div>
                      <select 
                        id="underline_select" 
                        className="block w-full text-right text-lg text-gray-500 bg-transparent border-0 border-gray-200 appearance-none dark:text-gray-400 dark:border-gray-700 focus:outline-none focus:ring-0 focus:border-gray-200 peer" 
                        onChange={(e)=>setType(e.target.value)}
                      >
                        {/* <option selected>Choose a country</option> */}
                        <option value="Essay">Essay</option>
                        <option value="Blog">Blog</option>
                        <option value="Email">Email</option>
                        <option value="Free Flow">Free Flow</option>
                      </select>
                    </div>
                  </div>
                  <div className="p-2 flex flex-row justify-between text-essayModalText">
                    <div className="text-lg">
                      Content Tone
                    </div>
                    <div>
                      <select 
                        id="underline_select" 
                        className="block w-full text-right text-lg text-gray-500 bg-transparent border-0 border-gray-200 appearance-none dark:text-gray-400 dark:border-gray-700 focus:outline-none focus:ring-0 focus:border-gray-200 peer"
                        onChange={(e)=>setTone(e.target.value)}
                      >
                        <option value="Professional">Professional</option>
                        <option value="Friendly">Friendly</option>
                        <option value="Persuasive">Persuasive</option>
                        <option value="Bold">Bold</option>
                        <option value="Academic">Academic</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="mt-20">
                  <button
                    className={`${isVisible ? 'bg-[#919191]' : 'bg-[#4FB5FF]'} float-right text-xl font-bold text-white px-3 py-1 rounded`}
                    disabled={isVisible}
                    onClick={() => handleContinue()}
                  >
                    Continue
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}

export default TellEssayModal