// src/components/Sidebar.jsx
import { LayoutDashboard, Briefcase } from 'lucide-react';
import './Sidebar.css';

function Sidebar({ activePanel, setActivePanel }) {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>Dashboard</h2>
      </div>
      
      <nav className="sidebar-nav">
        <button
          className={`nav-item ${activePanel === 'overview' ? 'active' : ''}`}
          onClick={() => setActivePanel('overview')}
        >
          <LayoutDashboard size={20} />
          <span>Overview</span>
        </button>
        
        <button
          className={`nav-item ${activePanel === 'backoffice' ? 'active' : ''}`}
          onClick={() => setActivePanel('backoffice')}
        >
          <Briefcase size={20} />
          <span>Backoffice</span>
        </button>
      </nav>
    </div>
  );
}

export default Sidebar;