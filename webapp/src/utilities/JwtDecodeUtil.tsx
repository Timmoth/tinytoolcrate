import { useState, useEffect } from 'react';
import TextField from '../fields/TextField';

function decodeJWT(jwt: string): any {
  const parts = jwt.split('.');

  if (parts.length !== 3) {
    throw new Error('Invalid JWT format');
  }

  const base64Url = parts[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = atob(base64);

  return JSON.parse(jsonPayload);
}

function JwtDecodeUtil() {
  const [currentJwt, setCurrentJwt] = useState<string>("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c");
  const [decodedJwt, setDecodedJwt] = useState<any>(null);

  const handleContentChange = (newContent: string) => {
    setCurrentJwt(newContent);
    console.log(newContent);
  };
  
  useEffect(() => {
    try {
      const decoded = decodeJWT(currentJwt);
      setDecodedJwt(decoded);
    } catch (error) {
      setDecodedJwt("invalid jwt");
      console.error('Error decoding JWT:', error);
    }
  }, [currentJwt]);

  return (
    <>
      <TextField
        label="Encoded jwt"
        content={currentJwt}
        onContentChange={handleContentChange}
        isReadonly={false}
        isCopyable={true}
        isMultiline={true}
      />
      <TextField 
      label='decoded jwt'
       content={JSON.stringify(decodedJwt, null, 2)}
        isReadonly={true}
        isCopyable={true}
        isMultiline={true}
        />  
    </>
  );
}

export default JwtDecodeUtil;
