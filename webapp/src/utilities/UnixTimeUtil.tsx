import { useState, useEffect } from 'react';
import TextField from '../fields/TextField';

function UnixTimeUtil() {
  const [unixTime, setUnixTime] = useState<number>(Date.now());

  useEffect(() => {
    const intervalId = setInterval(() => {
      setUnixTime(Date.now());
    }, 100);

    return () => clearInterval(intervalId);
  }, []);

  return (
      <>
      <TextField 
      label='seconds' 
      content={Math.floor(unixTime / 1000).toString()}
        isReadonly={true}
        isCopyable={true}
        isMultiline={false}/>
      <TextField label='millis' 
      content={unixTime.toString()}      
        isReadonly={true}
        isCopyable={true}
        isMultiline={false}/>
      </>
  );
}

export default UnixTimeUtil;
