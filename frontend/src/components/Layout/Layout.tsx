// src/components/Layout/Layout.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { getUser, logout } from '../../utils/auth';
import './Layout.css';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const user = getUser();
  const isAdmin = user?.role === 'admin';

  return (
    <div className="layout">
      <header className="header">
        <nav>
          <ul>
            <li><Link to="/dashboard">Dashboard</Link></li>
            <li><Link to="/reports">Reports</Link></li>
            {isAdmin && <li><Link to="/users">Users</Link></li>}
            <li><button onClick={logout}>Logout</button></li>
          </ul>
        </nav>
      </header>
      <main>{children}</main>
    </div>
  );
};

export default Layout;