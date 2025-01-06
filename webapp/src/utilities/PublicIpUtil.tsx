import { useState, useEffect } from 'react';
import TextField from '../fields/TextField';

function PublicIp() {
  const [publicIp, setPublicIp] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPublicIp() {
      try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        setPublicIp(data.ip);
      } catch (error) {
        console.error('Error fetching public IP:', error);
      }
    }

    fetchPublicIp();
  }, []);

  return (
             <TextField 
             label='public ip'
            content={publicIp || 'Loading...'}
            isReadonly={true}
        isCopyable={true}
        isMultiline={false}/>
        );
}

export default PublicIp;