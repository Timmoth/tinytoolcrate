import { useState, useEffect } from 'react';
import TextField from '../fields/TextField';

function LineCountUtil() {
  const [currentText, setCurrentText] = useState<string>('');
  const [lineCount, setLineCount] = useState<number>(0);
  const [wordCount, setWordCount] = useState<number>(0);

  const handleContentChange = (newContent: string) => {
    setCurrentText(newContent);
  };
  
  useEffect(() => {
    setLineCount(currentText.split(/\r\n|\r|\n/).length);
      const words = currentText.trim().match(/\b\w+\b/g);
      setWordCount(words ? words.length : 0);
  }, [currentText]);

  return (
    <>
      <TextField
        label="enter text"
        content={currentText}
        onContentChange={handleContentChange}
                       isReadonly={false}
        isCopyable={true}
        isMultiline={true}
      />
      <div className='flex space-x-2 w-full'>
      <TextField label="lines" content={lineCount.toString()}   
                   isReadonly={true}
        isCopyable={false}
        isMultiline={false}/>  
      <TextField label="words" content={wordCount.toString()} isReadonly={true}
        isCopyable={false}
        isMultiline={false}/>  
      </div>


    </>
  );
}

export default LineCountUtil;
