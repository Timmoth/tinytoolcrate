import { useState, useEffect } from 'react';
import TextField from '../fields/TextField';

function CountOccurrences() {
  const [currentText, setCurrentText] = useState<string>('');
  const [findTerm, setFindTerm] = useState<string>('');
  const [occurrences, setOccurrences] = useState<number>(0);

  const handleContentChange = (newContent: string) => {
    setCurrentText(newContent);
  };

  useEffect(() => {
    if (findTerm.trim() === '') {
      setOccurrences(0);
      return;
    }

    try {
      const regex = new RegExp(findTerm, 'g'); 
      const matches = currentText.match(regex);
      setOccurrences(matches ? matches.length : 0);
    } catch (e) {
      console.error('Invalid regular expression:', e);
      setOccurrences(0);
    }
  }, [currentText, findTerm]);

  return (
    <>
      <TextField
        label="Enter Text"
        content={currentText}
        onContentChange={handleContentChange}
        isReadonly={false}
        isCopyable={true}
        isMultiline={true}
      />

      <div className="flex space-x-2 w-full">
        <TextField
          label="Find"
          content={findTerm}
          onContentChange={setFindTerm}
          isReadonly={false}
          isCopyable={false}
          isMultiline={false}
        />
        <TextField
          label="Occurrences"
          content={occurrences.toString()}
          isReadonly={true}
          isCopyable={false}
          isMultiline={false}
        />
      </div>
    </>
  );
}

export default CountOccurrences;
