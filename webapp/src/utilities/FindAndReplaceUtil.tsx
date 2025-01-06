import { useState, useEffect } from 'react';
import TextField from '../fields/TextField';

function FindAndReplaceUtil() {
  const [inputText, setInputText] = useState<string>('');
  const [outputText, setOutputText] = useState<string>('');

  const [findTerm, setFindTerm] = useState<string>('');
  const [replaceTerm, setReplaceTerm] = useState<string>('');

  useEffect(() => {
    if (findTerm) {
      const regex = new RegExp(findTerm, 'g');
      setOutputText(inputText.replace(regex, replaceTerm));
    } else {
      setOutputText(inputText);
    }
  }, [inputText, findTerm, replaceTerm]);

  return (
    <>
      <TextField
        label="input text"
        content={inputText}
        onContentChange={setInputText}
                       isReadonly={false}
        isCopyable={true}
        isMultiline={true}
      />

      <div className='flex space-x-2 w-full'>
      <TextField label="find" content={findTerm}   
       onContentChange={setFindTerm}
                   isReadonly={false}
        isCopyable={false}
        isMultiline={false}/>  
      <TextField label="replace" content={replaceTerm}
      onContentChange={setReplaceTerm}
       isReadonly={false}
        isCopyable={false}
        isMultiline={false}/>  
      </div>

      <TextField
        label="output text"
        content={outputText}
        isReadonly={true}
        isCopyable={true}
        isMultiline={true}
      />

    </>
  );
}

export default FindAndReplaceUtil;
