import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, BarChart3, PlusCircle } from 'lucide-react';

const BottomNav = () => {
  const location = useLocation();
  const path = location.pathname;

  return (
    <div className="bottom-nav">
      <Link to="/" className={`nav-item ${path === '/' ? 'active' : ''}`}>
        <LayoutDashboard size={24} />
        <span>Today</span>
      </Link>
      <Link to="/add" className={`nav-item ${path === '/add' ? 'active' : ''}`} style={{marginTop: "-20px"}}>
        <div style={{background: "#1e293b", padding: "14px", borderRadius: "50%", color: "white", boxShadow: "0 8px 16px rgba(30, 41, 59, 0.3)"}}>
          <PlusCircle size={28} />
        </div>
      </Link>
      <Link to="/insights" className={`nav-item ${path === '/insights' ? 'active' : ''}`}>
        <BarChart3 size={24} />
        <span>Insights</span>
      </Link>
    </div>
  );
};

export default BottomNav;
