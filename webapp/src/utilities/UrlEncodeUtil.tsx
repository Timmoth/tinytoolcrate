import { useState, useEffect } from 'react';
import TextField from '../fields/TextField';

function UrlEncodeUtil() {
  const [currentText, setCurrentText] = useState<string>('');
  const [encodedText, setEncodedText] = useState<string>('');

  const handleContentChange = (newContent: string) => {
    setCurrentText(newContent);
  };
  
  useEffect(() => {
    try {
      const encoded = encodeURIComponent(currentText);
      setEncodedText(encoded);
    } catch (error) {
      setEncodedText("Error encoding to base64");
      console.error('Error encoding to base64:', error);
    }
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
      <TextField label="encoded" 
      content={encodedText}        
              isReadonly={true}
        isCopyable={true}
        isMultiline={true}/>  
    </>
  );
}

export default UrlEncodeUtil;
