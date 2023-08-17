import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSelector, useDispatch } from 'react-redux'
import { DndContext, DragOverlay } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { createPortal } from "react-dom";
import isHotkey from "is-hotkey";
import { Editable, withReact, useSlate, Slate, ReactEditor, DefaultElement, useSelected, useFocused } from "slate-react";
import { Editor, Transforms, createEditor, Range, Element as SlateElement, } from "slate";
import { History, withHistory } from "slate-history";


import 'material-icons/iconfont/material-icons.css';

import OutsideClickHandler from 'react-outside-click-handler';

import { AiOutlineEnter, AiOutlinePlus, AiOutlineCopy } from 'react-icons/ai'
import { SlRefresh } from 'react-icons/sl'
import { MdKeyboardArrowRight, MdKeyboardArrowLeft } from 'react-icons/md'
import { FaMagic } from 'react-icons/fa'
import { RiArrowGoForwardFill } from 'react-icons/ri';
import { RiArrowGoBackFill } from 'react-icons/ri';
import { BiMessageRoundedDots } from 'react-icons/bi';
import { TbBrandWechat } from "react-icons/tb";

import { Button, Icon, Toolbar } from "../components/CustomEditor";
import { makeNodeId, withNodeId, toPx } from "../components/CustomWithNodeID";

import { setEditor, getEditor, updateEditor } from '../utils/editorSlice';
import { getDoc } from '../utils/docSlice';
import { apiSaveEditor, apiChatGptForEditor } from "../utils/action";

import { CopyToClipboard } from 'react-copy-to-clipboard';

import Menu, { SubMenu, Item as MenuItem, Divider } from 'rc-menu';
import 'rc-menu/assets/index.css';

const HOTKEYS = {
  'mod+b': 'bold',
  'mod+i': 'italic',
  'mod+u': 'underline',
  'mod+`': 'code',
}

const LIST_TYPES = ['numbered-list', 'bulleted-list']
const TEXT_ALIGN_TYPES = ['left', 'center', 'right', 'justify']

const EditorSection = (props) => {

  const { isOpenChat, setIsOpenChat, initialData } = props;

  const docData = useSelector(getDoc);
  const editorData = useSelector(getEditor);
  const dispatch = useDispatch();

  const toolbarRef = useRef();

  // console.log('initialData >>', initialData);
  const [value, setValue] = useState([]);

  // const renderElement = useCallback(props => <Element {...props} />, []);
  const renderLeaf = useCallback(props => <Leaf {...props} />, []);
  const editor = useMemo(() => withNodeId(withReact(withHistory(createEditor()))), []);
  const { selection } = editor;
  const [isInputOpen, setIsInputOpen] = useState(false);
  const [isListOpen, setIsListOpen] = useState(false);
  const [isAiResultOpen, setIsAiResultOpen] = useState(false);
  const [aiResultLoading, setAiResultLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [aiResult, setAiResult] = useState('This is result text');
  const [aiResultList, setAiResultList] = useState([]);
  const [aiResultIndex, setAiResultIndex] = useState(0);
  const [title, setTitle] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectionCopy, setSelectionCopy] = useState('');
  const [wordCount, setWordCount] = useState(0);

  useEffect(() => {
    setTitle(docData.topic);
  }, [docData])

  const ul_data = ['Paraphrase', 'Simplify', 'Shorten', 'Expand']
  // const li_data = ['Academically', 'Casually', 'Persuasively', 'Boldly']

  const [topPX, setTopPX] = useState(0);

  useMemo(() => {
    if (!isListOpen && !isInputOpen && !isAiResultOpen) {
      const domSelection = window.getSelection();
      if (
        !selection ||
        !ReactEditor.isFocused(editor) ||
        Range.isCollapsed(selection) ||
        Editor.string(editor, selection) === ""
      ) {
        setTopPX(0);
        setSelectionCopy(null);
        return;
      }
      let getRange = domSelection.getRangeAt(0);
      let selectionRect = getRange.getBoundingClientRect();
      setTopPX(selectionRect.top - 108);
      // console.log(111111111);
    }
  }, [editor, selection])

  useEffect(() => {

    let startTime = 0;
    const handleDocumentMouseDown = event => {
      startTime = new Date();
    };
    const handleDocumentMouseUp = event => {
      // if(window.getSelection().toString() === "\n") alert("window.getSelection().toString()")
      if ((new Date() - startTime) > 100 && (window.getSelection().toString() !== "" && window.getSelection().toString() !== "\n")) {
        toggleBlock(editor, "left");
        toggleBlock(editor, "left");
      } else {
        // console.log(">>>>>>>>> click selection", isInputOpen);
        // setTopPX(0);
      }
    };

    document.addEventListener('mousedown', handleDocumentMouseDown);
    document.addEventListener('mouseup', handleDocumentMouseUp);
    return () => {
      document.removeEventListener('mousedown', handleDocumentMouseDown);
      document.removeEventListener('mouseup', handleDocumentMouseUp);
    };
  }, []);

  const ref = React.useRef();

  React.useEffect(() => {
    function handleChange() {
      // get selection information from the browser
      const selection = window.getSelection();

      // we only want to proceed when we have a valid selection
      if (
        !selection ||
        selection.isCollapsed && !isInputOpen
        // !selection.containsNode(ref.current, true)
      ) {
        // console.log(">>>>>>> selections toppx", selection, isListOpen, isInputOpen);
        // selection.getRangeAt(0)
        // setTopPX(0);
        // ReactEditor.focus(editor);
        return;
      }
      // console.log(">>>>>>> selections 000011", selection)

    }

    document.addEventListener("selectionchange", handleChange);
    return () => document.removeEventListener("selectionchange", handleChange);
  }, []);

  ////// drag drop

  const [activeId, setActiveId] = useState(null);
  const activeElement = editor.children.find((x) => x.id === activeId);

  const handleDragStart = (event) => {
    if (event.active) {
      clearSelection();
      setActiveId(event.active.id);
    }
  };

  const handleDragEnd = (event) => {
    const overId = event.over?.id;
    const overIndex = editor.children.findIndex((x) => x.id === overId);

    if (overId !== activeId && overIndex !== -1) {
      Transforms.moveNodes(editor, {
        at: [],
        match: (node) => node.id === activeId,
        to: [overIndex]
      });
    }

    setActiveId(null);
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  const clearSelection = () => {
    ReactEditor.blur(editor);
    Transforms.deselect(editor);
    window.getSelection()?.empty();
  };

  const renderElement = useCallback((props) => {
    const isTopLevel = ReactEditor.findPath(editor, props.element).length === 1;

    return isTopLevel ? (
      <SortableElement {...props} renderElement={renderElementContent} />
    ) : (
      renderElementContent(props)
    );
  }, []);

  const items = useMemo(() => editor.children.map((element) => element.id), [
    editor.children
  ]);
  ////// drag drop

  const handleAIButtonClick = async () => {
    // await toggleBlock(editor, "left");
    // await toggleBlock(editor, "left");
    setIsInputOpen(true);
    setIsListOpen(true);
    setOpenDialog(true);
    setInputValue('');
    setAiResult('');
    setAiResultList([]);
    setAiResultIndex(0);
  }

  const handleAIInputKeyDown = async (event) => {
    if (event.key === "Enter") {
      // await handleAIButtonClick()
      // if (selection) {
      //   console.log("selection", selection)
      //   const [start, end] = Range.edges(selection);
      //   console.log(">>>> path", start.path);
      //   const selectedText = Editor.string(editor, { anchor: start, focus: end });
      //   console.log(selectedText);
      //   event.preventDefault()

      //   console.log("editor", editor)

      //   setOpenDialog(false)
      //   ReactEditor.focus(editor)
      // }
      handleRetryCommand();
    }
  }
  const handleSetAICommand = async (title) => {
    if (selection) {
      console.log(selectionCopy, 'selectionCopy');
      console.log(selection, 'selection');
      console.log(editor, 'editor');

      const [start, end] = Range.edges(selection);
      // console.log(">>>> path", start.path);
      const selectedText = Editor.string(editor, { anchor: start, focus: end });
      console.log('selectedText >>', selectedText);
      setInputValue(title);
      setAiResultLoading(true);
      setIsAiResultOpen(true);
      setIsListOpen(false);

      let response = await apiChatGptForEditor({ keyword: title, text: selectedText });
      console.log(">>>> response", response);
      let content = response.content;
      // console.log('result >>', result);
      if (content) {

        // setTimeout(() => {
        //   Transforms.select(editor, selectionCopy);
        //   setAiResult("sdfsdfsdfds")
        //   setAiResultLoading(false);
        // }, 5000);
        Transforms.select(editor, selectionCopy);
        setAiResult(content)
        setAiResultList([...aiResultList, content]);
        setAiResultLoading(false);

        Transforms.select(editor, selectionCopy);
      }
    } else {
      console.error('you should select the text');
    }
  }

  const handleRetryCommand = async () => {
    if (selection) {
      const [start, end] = Range.edges(selection);
      const selectedText = Editor.string(editor, { anchor: start, focus: end });
      console.log("this is inputvalue and selectedtext >>> ", inputValue, selectedText);
      setAiResultLoading(true);
      setIsAiResultOpen(true);
      setIsListOpen(false);

      let result = await apiChatGptForEditor({ keyword: inputValue, text: selectedText });
      result = result.content;
      console.log('result >>', result);
      if (result) {
        // let content = result.data.choices[0].message.content;
        Transforms.select(editor, selectionCopy);
        setAiResult(result)
        setAiResultList([...aiResultList, result]);
        setAiResultIndex(aiResultList.length + 1);
        setAiResultLoading(false);

        Transforms.select(editor, selectionCopy);
      }
    } else {
      console.error('you should select the text');
    }
  }

  const handleAiResultLeft = () => {
    if (aiResultIndex > 1) {
      setAiResultIndex(aiResultIndex - 1)
      setAiResult(aiResultList[aiResultIndex - 2]);
    }
  }

  const handleAiResultRight = () => {
    if (aiResultIndex < aiResultList.length) {
      setAiResultIndex(aiResultIndex + 1)
      setAiResult(aiResultList[aiResultIndex]);
    }
  }

  console.log(">>>airesult list", aiResultList);

  const handleReplace = () => {
    Transforms.select(editor, selectionCopy);
    toggleBlock(editor, "left");
    toggleBlock(editor, "left");
    setIsAiResultOpen(false);
    setIsInputOpen(false);

    const [start, end] = Range.edges(selection);
    console.log(">>> replace", start, end);
    Transforms.delete(editor, {
      at: {
        anchor: start,
        focus: end,
      },
    })
    Transforms.insertNodes(editor, [{ text: aiResult }], {
      select: true
    })
  }

  const handleInsertBelow = () => {
    Transforms.select(editor, selectionCopy);
    toggleBlock(editor, "left");
    toggleBlock(editor, "left");
    setIsAiResultOpen(false);
    setIsInputOpen(false);

    const [start, end] = Range.edges(selection);
    Transforms.insertNodes(
      editor,
      { type: "paragraph", children: [{ text: aiResult }] },
      { at: [start.path[0] + 1] }
    )
  }

  const saveSelection = () => {
    console.log("editor selection", editor.selection);
    setSelectionCopy(editor.selection);
  }

  const handleChange = async (data) => {
    setValue(data);
    console.log('handleChange : ', data);
    if (docData._id) {
      let result = await apiSaveEditor({ info_id: docData._id, data: data });
      console.log(result);
    } else {
      console.error('You should select the document.');
      return;
    }
  }

  // editor.children = initialData

  useEffect(() => {
    console.log("initial data", initialData);
    editor.children = initialData
    setWordCount(countWords(initialData));
  }, [initialData])

  useEffect(() => {
    setWordCount(countWords(value));
  }, [value])

  const handleUndo = (event) => {
    event.preventDefault();
    editor.undo();
  }

  const handleRedo = (event) => {
    event.preventDefault();
    editor.redo();
  }

  return (
    <div className={`${isOpenChat ? 'col-span-2' : 'col-span-3'} rounded-lg shadow-lg p-4 bg-white border-[1px] border-gray ml-2 relative`}>

      <div
        className="h-[calc(100%_-_76px)] overflow-auto px-14"
      >
        <OutsideClickHandler
          onOutsideClick={() => {
            if (!isListOpen) setTopPX(0);
          }}
        >
          <Slate
            editor={editor}
            value={value}
            initialValue={value}
            onChange={(newValue) => { handleChange(newValue) }}
          >
            <OutsideClickHandler
              onOutsideClick={() => {
                if (topPX !== 0) setTopPX(0);
              }}
            >
              <Toolbar
                className={`absolute b-0 z-10 bg-white top-[300px] top-[${topPX + 'px'}] flex flex-row items-center shadow-lg px-4 py-2 flex-wrap rounded-xl`}
                // className={`absolute b-0 z-10 bg-white top-[300px] top-[${topPX + 'px'}]`}
                style={{
                  top: topPX + 'px'
                }}
                ref={toolbarRef}
              >
                <MarkButton format="bold" icon="format_bold" />
                <MarkButton format="italic" icon="format_italic" />
                <MarkButton format="underline" icon="format_underlined" />
                <MarkButton format="code" icon="code" />
                <BlockButton format="heading-one" icon="looks_one" />
                <BlockButton format="heading-two" icon="looks_two" />
                <BlockButton format="block-quote" icon="format_quote" />
                <BlockButton format="numbered-list" icon="format_list_numbered" />
                <BlockButton format="bulleted-list" icon="format_list_bulleted" />
                <BlockButton format="left" icon="format_align_left" />
                <BlockButton format="center" icon="format_align_center" />
                <BlockButton format="right" icon="format_align_right" />
                <BlockButton format="justify" icon="format_align_justify" />
                <div style={{
                  width: 'fit-content',
                  position: 'relative',
                }}>
                  <button
                    onClick={handleAIButtonClick}
                    className={`flex flex-row gap-1 items-center ${topPX === 0 ? 'text-[#777]' : 'text-[#000]'}`}
                    disabled={topPX === 0 ? true : false}
                  >
                    <FaMagic />
                    AI command
                  </button>
                  <OutsideClickHandler
                    onOutsideClick={() => {
                      setIsInputOpen(false);
                      setIsAiResultOpen(false);
                      setIsListOpen(false);
                    }}
                  >
                    <div
                      className={`${isInputOpen ? 'flex' : 'hidden'} absolute z-10 top-8 right-0 items-center py-2 justify-between px-4 border-solid border border-gray-200 bg-white shadow-lg rounded-md`}
                    >
                      <div className="flex items-center text-gray-500 gap-2">
                        <FaMagic />
                        <input
                          type='text'
                          onKeyDown={handleAIInputKeyDown}
                          className={`border-0 text-sm p-0 placeholder:text-gray-500 focus:border-white focus:ring-white w-[400px]`}
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          placeholder="AI Commands can generate or paraphrase text..."
                        />
                        <button
                          className="ml-4 bg-upgradeBtn hover:bg-upgradeBtn-hover rounded px-2 py-1 flex items-center text-white gap-2"
                          onClick={handleRetryCommand}
                        >
                          Enter
                          <AiOutlineEnter />
                        </button>
                      </div>
                    </div>
                    {/* <Menu
                    className={`shadow-lg !p-0 top-[85px] right-0 absolute z-10 bg-white ${isListOpen ? 'block' : 'hidden'}`}
                  >
                    {ul_data.map((item, index) => (
                      <SubMenu
                        title={item}
                        key={index}
                        pop
                        className="z-10 bg-white divide-y divide-gray-100 rounded-lg shadow w-44 h-[30px] dark:bg-gray-700 text-sm"
                      >
                        {li_data.map((listItem, key) => (
                          <MenuItem className="text-sm text-gray-700 h-[30px] dark:text-gray-200" key={index + "-" + key}>
                            <div
                              className="cursor-pointer block p-0 px-4 dark:hover:text-white"
                              onClick={() => handleSetAICommand(item, listItem)}
                            >
                              {listItem}
                            </div>
                          </MenuItem>
                        ))}
                      </SubMenu>
                    ))}
                  </Menu> */}
                    <div
                      className={`shadow-lg top-[85px] right-0 absolute z-10 bg-white ${isListOpen ? 'block' : 'hidden'}`}
                    >
                      <ul className="py-2 text-sm text-gray-700 w-32 dark:text-gray-200" aria-labelledby="multiLevelDropdownButton">
                        {ul_data.map((item, index) => (
                          <li key={index}>
                            <button
                              id={`${item}DropdownButton`}
                              data-dropdown-toggle={`${item}Dropdown`}
                              data-dropdown-trigger="hover"
                              data-dropdown-placement="right-start"
                              type="button"
                              className="flex items-center justify-between px-1 w-full h-7 hover:bg-gray-200 dark:hover:bg-gray-600 dark:hover:text-white"
                              onClick={() => handleSetAICommand(item)}
                            >
                              {item}
                              {/* <svg aria-hidden="true" className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path></svg> */}
                            </button>
                            {/* <div id={`${item}Dropdown`} className="z-10 hidden bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700">
                            <ul className="py-2 text-sm text-gray-700 dark:text-gray-200" aria-labelledby={`${item}DropdownButton`}>
                              {li_data.map((listItem, key) => (
                                <li key={key}>
                                  <div
                                    className="cursor-pointer block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                                    onClick={() => handleSetAICommand(item, listItem)}
                                  >
                                    {listItem}
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div> */}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div
                      className={`w-[560px] top-[36px] right-0 absolute z-10 ${isAiResultOpen ? 'block' : 'hidden'} border-solid border border-gray-200 bg-white shadow-lg rounded-md overflow-hidden`}
                    >
                      {aiResultLoading ?
                        <span className="loader"></span>
                        : <>
                          <div className="text-sm leading-5 font-normal p-3 space-y-3 text-green-600 max-h-[350px] overflow-auto">
                            {aiResult}
                          </div>
                          <div className="text-gray-500 bg-gray-50 text-sm flex p-3 justify-between">
                            <div className="space-x-2 flex items-center">
                              <button
                                className="border px-4 py-2 rounded border-gray-300 text-black flex flex-row items-center gap-1 hover:bg-gray-200"
                                onClick={() => handleRetryCommand()}
                              >
                                <SlRefresh />
                                Retry
                              </button>
                              {aiResultList.length > 1 &&
                                <>
                                  <div className="cursor-pointer" onClick={handleAiResultLeft}><MdKeyboardArrowLeft /></div>
                                  <div>{aiResultIndex} of {aiResultList.length}</div>
                                  <div className="cursor-pointer" onClick={handleAiResultRight}><MdKeyboardArrowRight /></div>
                                </>
                              }
                            </div>
                            <div className="space-x-2 flex items-center">
                              <CopyToClipboard text={aiResult}

                              >
                                <div className="p-2 text-xl border rounded border-gray-300 cursor-pointer"><AiOutlineCopy /></div>
                              </CopyToClipboard>
                              <div
                                className="px-4 py-2 border rounded border-gray-300 hover:bg-gray-200 cursor-pointer"
                                onClick={handleReplace}
                              >
                                Replace
                              </div>
                              <div
                                className="bg-indigo-500 px-4 py-2 text-white rounded flex flex-row items-center gap-2 cursor-pointer"
                                onClick={handleInsertBelow}
                              >
                                <AiOutlinePlus />
                                Insert Below
                              </div>
                            </div>
                          </div>
                        </>}
                    </div>
                  </OutsideClickHandler>
                </div>
              </Toolbar>
            </OutsideClickHandler>
            <DndContext
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragCancel={handleDragCancel}
              className="pt-14 outline-none"
            >
              <input
                type="text"
                value={title}
                onChange={(e) => {e.preventDefault(); setTitle(e.target.value);}}
                className="focus:outline-none border-none text-3xl font-bold mt-14 focus:ring-0 focus:ring-offset-0"
              >
              </input>
              <SortableContext items={items} strategy={verticalListSortingStrategy} className="focus:outline-none">
                <Editable
                  className="slate-editor outline-none focus-visible:outline-none focus:outline-none"
                  renderElement={renderElement}
                  renderLeaf={renderLeaf}
                  // spellCheck
                  // autoFocus
                  onBlur={saveSelection}
                  onKeyDown={event => {
                    for (const hotkey in HOTKEYS) {
                      if (isHotkey(hotkey, event)) {
                        console.log(">>>> hotkey", hotkey, event);
                        event.preventDefault();
                        const mark = HOTKEYS[hotkey];
                        toggleMark(editor, mark);
                      }
                    }
                  }}
                />
              </SortableContext>
              {createPortal(
                <DragOverlay adjustScale={false}>
                  {activeElement && <DragOverlayContent element={activeElement} />}
                </DragOverlay>,
                document.body
              )}
            </DndContext>
          </Slate>
        </OutsideClickHandler>
      </div>

      <div className="absolute bottom-5 bg-gray p-1 border-gray flex items-center rounded-lg shadow-lg">
        <span className="mr-0.5 px-1 border-r border-black">{wordCount} words</span>
        <div
          onClick={(event) => handleUndo(event)}
        >
          <RiArrowGoBackFill className="mx-0.5 cursor-pointer" />
        </div>
        <div
          onClick={(event) => handleRedo(event)}
        >
          <RiArrowGoForwardFill className="cursor-pointer" />
        </div>
      </div>
      {!isOpenChat &&
        <div
          className="w-13 h-13 flex justify-center items-center absolute bottom-5 right-0 bg-gray mx-3 border border-gray p-1.5 rounded-full cursor-pointer shadow-lg"
          onClick={() => setIsOpenChat(!isOpenChat)}
        >
          <TbBrandWechat className="text-4xl" />
        </div>
      }
    </div>

  )
}

const renderElementContent = (props) => <Element {...props} />;

const countWords = content => {
  let count = 0;
  content.forEach(value => {
    console.log(">> value", value);
    let s = '';
    if (value['type'] === "numbered-list" || value['type'] === "bulleted-list") {
      // s = value['children'][0]['children'][0]['text'];
      let length = value['children'].length;
      for (let i = 0; i < length; i++) {
        s = value['children'][i]['children'][0]['text'];
        // console.log(" value ", i, value['children'][i]);
        if (s.length != 0 && s.match(/\b[-?(\w+)?]+\b/gi)) {
          s = s.replace(/(^\s*)|(\s*$)/gi, "");
          s = s.replace(/[ ]{2,}/gi, " ");
          s = s.replace(/\n /, "\n");
          count += s.split(' ').length;
        }
      }
    } else {
      s = value['children'][0]['text'];
      if (s.length != 0 && s.match(/\b[-?(\w+)?]+\b/gi)) {
        s = s.replace(/(^\s*)|(\s*$)/gi, "");
        s = s.replace(/[ ]{2,}/gi, " ");
        s = s.replace(/\n /, "\n");
        count += s.split(' ').length;
      }
    }
  });
  return count;
}

const SortableElement = ({ attributes, element, children, renderElement }) => {
  const sortable = useSortable({
    id: element.id,
    transition: {
      duration: 350,
      easing: "ease"
    }
  });

  return (
    <div {...attributes} className="outline-none">
      <Sortable sortable={sortable} className="outline-none">
        <button
          className="handle"
          contentEditable={false}
          {...sortable.listeners}
        >
          ⠿
        </button>
        <div className="w-full outline-none">{renderElement({ element, children })}</div>
      </Sortable>
    </div>
  );
};

const Sortable = ({ sortable, children }) => {
  return (
    <div
      className="sortable"
      {...sortable.attributes}
      ref={sortable.setNodeRef}
      style={{
        transition: sortable.transition,
        "--translate-y": toPx(sortable.transform?.y),
        pointerEvents: sortable.isSorting ? "none" : undefined,
        opacity: sortable.isDragging ? 0 : 1
      }}
    >
      {children}
    </div>
  );
};

const useEditor = () =>
  useMemo(() => withNodeId(withReact(withHistory(createEditor()))), []);
  // useMemo(() => withNodeId(withReact(createEditor())), []);


const DragOverlayContent = ({ element }) => {
  const editor = useEditor();
  const [value] = useState([JSON.parse(JSON.stringify(element))]); // clone

  useEffect(() => {
    document.body.classList.add("dragging");

    return () => document.body.classList.remove("dragging");
  }, []);

  return (
    <div className="drag-overlay">
      <button>⠿</button>
      <Slate editor={editor} value={value} initialValue={value} >
        <Editable readOnly={true} renderElement={renderElementContent} />
      </Slate>
    </div>
  );
};


const toggleBlock = (editor, format) => {
  const isActive = isBlockActive(
    editor,
    format,
    TEXT_ALIGN_TYPES.includes(format) ? 'align' : 'type'
  )
  const isList = LIST_TYPES.includes(format)

  Transforms.unwrapNodes(editor, {
    match: n =>
      !Editor.isEditor(n) &&
      SlateElement.isElement(n) &&
      LIST_TYPES.includes(n.type) &&
      !TEXT_ALIGN_TYPES.includes(format),
    split: true,
  })
  let newProperties;
  if (TEXT_ALIGN_TYPES.includes(format)) {
    newProperties = {
      align: isActive ? undefined : format,
    }
  } else {
    newProperties = {
      type: isActive ? 'paragraph' : isList ? 'list-item' : format,
    }
  }
  Transforms.setNodes(editor, newProperties)

  if (!isActive && isList) {
    const block = { type: format, children: [] }
    Transforms.wrapNodes(editor, block)
  }
}

const toggleMark = (editor, format) => {
  const isActive = isMarkActive(editor, format)

  if (isActive) {
    Editor.removeMark(editor, format)
  } else {
    Editor.addMark(editor, format, true)
  }
}

const isBlockActive = (editor, format, blockType = 'type') => {
  const { selection } = editor
  if (!selection) return false

  const [match] = Array.from(
    Editor.nodes(editor, {
      at: Editor.unhangRange(editor, selection),
      match: n =>
        !Editor.isEditor(n) &&
        SlateElement.isElement(n) &&
        n[blockType] === format,
    })
  )

  return !!match
}

const isMarkActive = (editor, format) => {
  const marks = Editor.marks(editor)
  return marks ? marks[format] === true : false
}

const Element = ({ attributes, children, element }) => {
  const style = { textAlign: element.align }
  switch (element.type) {
    case 'block-quote':
      return (
        <blockquote style={style} {...attributes}>
          {children}
        </blockquote>
      )
    case 'bulleted-list':
      return (
        <ul style={style} {...attributes}>
          {children}
        </ul>
      )
    case 'heading-one':
      return (
        <h1 style={style} {...attributes}>
          {children}
        </h1>
      )
    case 'heading-two':
      return (
        <h2 style={style} {...attributes}>
          {children}
        </h2>
      )
    case 'list-item':
      return (
        <li style={style} {...attributes}>
          {children}
        </li>
      )
    case 'numbered-list':
      return (
        <ol style={style} {...attributes}>
          {children}
        </ol>
      )
    default:
      return (
        <p style={style} {...attributes}>
          {children}
        </p>
      )
  }
}

const Leaf = ({ attributes, children, leaf }) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>
  }

  if (leaf.code) {
    children = <code>{children}</code>
  }

  if (leaf.italic) {
    children = <em>{children}</em>
  }

  if (leaf.underline) {
    children = <u>{children}</u>
  }

  return <span {...attributes}>{children}</span>
}

const BlockButton = ({ format, icon }) => {
  const editor = useSlate()
  return (
    <Button
      active={isBlockActive(
        editor,
        format,
        TEXT_ALIGN_TYPES.includes(format) ? 'align' : 'type'
      )}
      onMouseDown={event => {
        event.preventDefault()
        toggleBlock(editor, format)
      }}
    >
      <Icon>{icon}</Icon>
    </Button>
  )
}

const MarkButton = ({ format, icon }) => {
  const editor = useSlate()
  return (
    <Button
      active={isMarkActive(editor, format)}
      onMouseDown={event => {
        event.preventDefault()
        toggleMark(editor, format)
      }}
    >
      <Icon>{icon}</Icon>
    </Button>
  )
}

const initialValue = [
  {
    id: makeNodeId(),
    type: 'paragraph',
    children: [
      { text: 'This is editable ' },
      { text: 'rich', bold: true },
      { text: ' text, ' },
      { text: 'much', italic: true },
      { text: ' better than a ' },
      { text: '<textarea>', code: true },
      { text: '!' },
    ],
  },
  {
    id: makeNodeId(),
    type: 'paragraph',
    children: [
      {
        text:
          "Since it's rich text, you can do things like turn a selection of text ",
      },
      { text: 'bold', bold: true },
      {
        text:
          ', or add a semantically rendered block quote in the middle of the page, like this:',
      },
    ],
  },
  {
    id: makeNodeId(),
    type: 'block-quote',
    children: [{ text: 'A wise quote.' }],
  },
  {
    id: makeNodeId(),
    type: 'paragraph',
    align: 'left',
    children: [{ text: 'Try it out for yourself!' }],
  },
]

export default EditorSection