import React from 'react';
import Chat from './Chat';
import './App.css';

const App: React.FC = () => {
  return (
    <div className="app-container">
      <div className="iphone-frame">
        <Chat />
      </div>
    </div>
  );
};

export default App;