import React, { useState } from 'react';

interface ResponseData {
  message?: string;
  error?: string;
}

const SendEmailButton: React.FC = () => {
  const [,setResponse] = useState<ResponseData | null>(null);
  const [loading, setLoading] = useState(false);

  const sendEmail = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();
      setResponse(data);
    } catch {
      setResponse({ error: 'Something went wrong' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={sendEmail} disabled={loading}>
        {loading ? 'Sending...' : 'Send'}
      </button>
    </div>
  );
};

export default SendEmailButton;
