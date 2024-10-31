'use client';

import { useState } from 'react';

const CodeRunner: React.FC = () => {
    const [code, setCode] = useState<string>('');
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const runCode = async () => {
        setResult(null);
        setError(null);
        try {
            const response = await fetch('./api/runCode', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code }),
            });

            const data = await response.json();
            if (response.ok) {
                setResult(data.result);
            } else {
                setError(data.error);
            }
        } catch (err) {
            setError('An unexpected error occurred');
        }
    };

    return (
        <div>
            <h1>Code Runner</h1>
            <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                rows={10}
                cols={50}
                placeholder="Enter your JS code here"
            />
            <button onClick={runCode}>Run Code</button>
            {result !== null && <div>Result: {JSON.stringify(result)}</div>}
            {error && <div style={{ color: 'red' }}>Error: {error}</div>}
        </div>
    );
};

const Home: React.FC = () => {
    return (
        <main>
            <CodeRunner />
        </main>
    );
};

export default Home;
