// src/App.jsx
import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Overview from './components/Overview';
import Backoffice from './components/Backoffice';
import RightBar from './components/RightBar';
import './App.css';

function App() {
  const [activePanel, setActivePanel] = useState('overview');

  return (
    <div className="dashboard-container">
      <Sidebar activePanel={activePanel} setActivePanel={setActivePanel} />
      
      <div className="main-content">
        {activePanel === 'overview' && <Overview />}
        {activePanel === 'backoffice' && <Backoffice />}
      </div>

      <RightBar />
    </div>
  );
}

export default App;