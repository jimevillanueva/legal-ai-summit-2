import React from 'react';
import ReactDOM from 'react-dom/client';

const SimpleApp = () => {
  return (
    <div style={{ padding: '20px', background: '#f0f0f0', minHeight: '100vh' }}>
      <h1>Test App - Multiple Sessions Implementation</h1>
      <p>If you can see this, React is working!</p>
      <div style={{ background: 'white', padding: '20px', marginTop: '20px', borderRadius: '8px' }}>
        <h2>✅ Features Implemented:</h2>
        <ul>
          <li>✅ Data model updated to support session arrays</li>
          <li>✅ Schedule utilities updated for arrays</li>
          <li>✅ App logic handles multiple sessions per slot</li>
          <li>✅ UI components support compact view</li>
          <li>✅ Visual indicators for multiple sessions</li>
        </ul>
      </div>
    </div>
  );
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(<SimpleApp />);